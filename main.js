const fetchEnv = async () => {
  const response = await fetch('/.netlify/functions/env');
  if (!response.ok) {
    throw new Error('Failed to fetch environment variables');
  }
  const env = await response.json();
  // console.log(env);
  return env;
};

let url;

const getWeatherInfo = async () => {
  try {
    const env = await fetchEnv();
    const WEATHER_API_KEY = env.WEATHER_API_KEY;

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    // 현재 위치, 날씨
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${WEATHER_API_KEY}`;

    // 도시 위치, 날씨
    // url = `https://api.openweathermap.org/data/2.5/weather?q=Dubai&appid=${WEATHER_API_KEY}&units=metric&lang=kr`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.status, response.statusText);
    }

    const data = await response.json();
    console.log(data);
    console.log(data.name, data.weather[0].main, data.weather[0].description);

    renderHTML(data);
    callSpotifyAPI(data, env);
  } catch (error) {
    console.log('Error Message >> ', error);
  }
};

const renderHTML = (data) => {
  const div = document.createElement('div');
  const p = document.createElement('p');
  p.innerHTML = `
    <span>현재 위치: ${data.name} (위도 ${data.coord.lat} , 경도 ${data.coord.lon})</span><br>
    <span>현재 날씨: ${data.weather[0].main}</span><br>
    <span>상세 설명: ${data.weather[0].description}</span>
  `;
  div.appendChild(p);
  document.body.appendChild(div);
};

// spotify

const getAccessToken = async (CLIENT_ID, CLIENT_SECRET) => {
  const encodedCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const response = await fetch(`https://accounts.spotify.com/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
};

const callSpotifyAPI = async (weatherData, env) => {
  const CLIENT_ID = env.CLIENT_ID;
  const CLIENT_SECRET = env.CLIENT_SECRET;

  const token = await getAccessToken(CLIENT_ID, CLIENT_SECRET);
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${weatherData.weather[0].main}&type=playlist`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const spotifyData = await response.json();
  console.log(spotifyData.playlists.items);
};

getWeatherInfo();
