let url;

const getWeatherInfo = async () => {
  try {
    const WEATHER_API_KEY = `d4b800defbe4f3b28364a3642039beed`;

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=us&appid=${WEATHER_API_KEY}`;
    // url = `https://api.openweathermap.org/data/2.5/weather?q=Bali&units=metric&lang=us&appid=${WEATHER_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.status, response.statusText);
    }

    const data = await response.json();
    console.log(data);
    console.log(data.name, data.weather[0].main, data.weather[0].description);

    renderHTML(data);
    const weatherDescription = matchWeather(data.weather[0].main);
    await callSpotifyAPI(weatherDescription);
    console.log('Weather Description:', weatherDescription);
  } catch (error) {
    console.log('Error Message >> ', error);
  }
};

const renderHTML = (data) => {
  const nav = document.querySelector('nav#menu');
  const section = document.createElement('section');
  section.classList.add('weather-display');
  section.innerHTML = `
    <div class='weather-info'>현재 날씨: ${data.weather[0].main}</div>
    <p class='weather-location'>현재 위치: ${data.name}</p>
    <p> (위도 ${data.coord.lat} , 경도 ${data.coord.lon})</p>
  `;
  nav.appendChild(section);
};

const renderPlaylists = (playlists) => {
  const section = document.querySelector('section#section');
  section.innerHTML = '<div class="row"></div>'; // 기존 내용을 지우고 새 행(row)을 만듭니다.
  const row = section.querySelector('.row');
  playlists.forEach((playlist) => {
    const col = document.createElement('div');
    col.classList.add(
      'col-lg-3',
      'col-md-4',
      'col-sm-6',
      'col-12',
      'playlist-item'
    );
    col.innerHTML = `
      <div class="card">
        <img src="${playlist.images[0].url}" class="card-img-top" alt="${playlist.name}" />
        <div class="card-body">
          <h5 class="card-title">${playlist.name}</h5>
          <p class="card-text">${playlist.description}</p>
          <a href="${playlist.external_urls.spotify}" class="btn btn-primary" target="_blank">플레이리스트 보기</a>
        </div>
      </div>
    `;
    row.appendChild(col);
  });
};

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

const fetchTrackFeatures = async (trackId, token) => {
  const url = `https://api.spotify.com/v1/audio-features/${trackId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch track features');
  }

  return response.json();
};

const callSpotifyAPI = async (weatherDescription) => {
  const CLIENT_ID = `904504b7562048308f3b78333a4cacd4`;
  const CLIENT_SECRET = `45da2b52af2d4752bbb7e828cb71cd18`;

  const token = await getAccessToken(CLIENT_ID, CLIENT_SECRET);
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${weatherDescription}&type=playlist`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify data');
  }

  const spotifyData = await response.json();
  console.log('Playlists:', spotifyData.playlists.items);

  if (spotifyData.playlists.items.length === 0) {
    throw new Error('No playlists found');
  }

  renderPlaylists(spotifyData.playlists.items); // 플레이리스트 정보를 렌더링

  console.log('Spotify query:', weatherDescription);
};

const loadMusic = async (tracks, token, weatherDescription) => {
  try {
    const musicInfo = await Promise.all(
      tracks.map(async (track) => {
        const features = await fetchTrackFeatures(track.id, token);
        let musicDescription = {
          id: track.id,
          releaseDate: track.album.release_date,
          songName: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          albumCover: track.album.images[2].url,
          playMusic: track.preview_url,
          danceability: features.danceability,
          energy: features.energy,
          tempo: features.tempo,
          valence: features.valence,
          mood: [weatherDescription], // 초기에는 날씨 설명을 포함하여 시작
        };

        return matchWeatherWithSong(musicDescription);
      })
    );

    console.log(musicInfo); // 최종 업데이트된 음악 정보 출력
    return musicInfo;
  } catch (error) {
    console.log('Error loading music:', error);
  }
};

// 날씨와 음악 매칭하기
const matchWeather = (weather) => {
  switch (weather) {
    case 'Clear':
      return '화창한 날 sunny clear';
    case 'Clouds':
      return '비온 후 맑게 갠 cloudy overcast';
    case 'Rain':
      return '비 rainy rain';
    case 'Drizzle':
      return '이슬비 drizzly drizzle';
    case 'Thunderstorm':
      return '천둥 번개 thunderstorm thunder';
    case 'Snow':
      return '눈오는 날 snowy snow';
    case 'Mist':
      return '안개 misty mist';
    case 'Smoke':
      return '연기 smoky smoke';
    case 'Haze':
      return '실안개 hazy haze';
    case 'Dust':
    case 'Sand':
      return '먼지 dusty sand';
    case 'Fog':
      return '안개 foggy fog';
    case 'Ash':
      return '재 ash';
    case 'Squall':
      return '돌풍 squall';
    case 'Tornado':
      return '토네이도 tornado';
    default:
      return '비 흐림 rainy cloudy overcast';
  }
};

// 노래 정보를 날씨와 매칭하는 함수입니다.
const matchWeatherWithSong = (eachInfo) => {
  if (0.55 < eachInfo.valence && 70 < eachInfo.tempo && eachInfo.tempo < 130) {
    eachInfo.mood.push('화창한 날'); // 긍정적인 정도가 높고 템포가 적당한 노래는 화창한 날
  } else if (
    0.5 <= eachInfo.danceability &&
    eachInfo.danceability < 0.72 &&
    0.3 <= eachInfo.valence &&
    eachInfo.valence < 0.75 &&
    65 <= eachInfo.tempo &&
    eachInfo.tempo < 110
  ) {
    eachInfo.mood.push('선선한 날'); // 댄스 가능성과 긍정적인 정도가 중간 정도이고 템포가 적당한 노래는 선선한 날
  } else if (
    0.45 < eachInfo.danceability &&
    eachInfo.danceability < 0.55 &&
    0.3 < eachInfo.energy &&
    eachInfo.energy < 0.55
  ) {
    eachInfo.mood.push('쌀쌀한 날'); // 댄스 가능성과 에너지가 중간 정도인 노래는 쌀쌀한 날
  } else if (
    (0.3 < eachInfo.energy &&
      eachInfo.energy < 0.5 &&
      0.3 < eachInfo.valence &&
      eachInfo.valence < 0.6 &&
      70 < eachInfo.tempo &&
      eachInfo.tempo < 110) ||
    (eachInfo.valence < 0.3 && eachInfo.tempo > 130)
  ) {
    eachInfo.mood.push('환절기'); // 에너지와 긍정적인 정도가 중간인 노래 또는 긍정적인 정도가 낮고 템포가 빠른 노래는 환절기
  } else if (
    (eachInfo.danceability < 0.71 &&
      eachInfo.energy < 0.66 &&
      eachInfo.valence < 0.55 &&
      eachInfo.tempo < 100) ||
    eachInfo.songName.indexOf('비') !== -1 ||
    eachInfo.songName.indexOf('빗') !== -1 ||
    eachInfo.songName.indexOf('우산') !== -1 ||
    eachInfo.songName.indexOf('장마') !== -1 ||
    eachInfo.songName.toLowerCase().indexOf('rain') !== -1
  ) {
    eachInfo.mood.push('비/ 흐림'); // 댄스 가능성과 에너지가 낮고 템포가 느리거나 제목에 비 관련 단어가 포함된 노래는 비/ 흐림
  } else if (
    (0.7 < eachInfo.danceability &&
      eachInfo.danceability < 0.85 &&
      0.5 < eachInfo.energy &&
      eachInfo.energy < 0.7) ||
    (0.3 < eachInfo.valence && eachInfo.valence < 0.4 && eachInfo.tempo > 160)
  ) {
    eachInfo.mood.push('비온 후/ 맑게 갠'); // 댄스 가능성과 에너지가 높고 긍정적인 정도가 중간인 노래 또는 템포가 빠른 노래는 비온 후/ 맑게 갠
  } else if (
    (eachInfo.songName.indexOf('눈') !== -1 ||
      eachInfo.songName.indexOf('겨울') !== -1 ||
      eachInfo.songName.toLowerCase().indexOf('snow') !== -1 ||
      eachInfo.songName.toLowerCase().indexOf('winter') !== -1) &&
    (parseInt(eachInfo.releaseDate.split('-')[1]) <= 2 ||
      parseInt(eachInfo.releaseDate.split('-')[1]) >= 11)
  ) {
    eachInfo.mood.push('눈오는 날'); // 제목에 눈 또는 겨울이 포함되고 발매일이 11월에서 2월 사이인 노래는 눈오는 날
  } else if (
    eachInfo.danceability > 0.5 &&
    eachInfo.energy > 0.7 &&
    eachInfo.tempo > 120
  ) {
    eachInfo.mood.push('폭염/ 더위'); // 댄스 가능성과 에너지가 높고 템포가 빠른 노래는 폭염/ 더위
  } else if (
    eachInfo.songName.toLowerCase().indexOf('mist') !== -1 ||
    eachInfo.songName.toLowerCase().indexOf('smoke') !== -1 ||
    eachInfo.songName.toLowerCase().indexOf('haze') !== -1 ||
    eachInfo.songName.toLowerCase().indexOf('fog') !== -1
  ) {
    eachInfo.mood.push('안개/ 연기');
  } else if (
    eachInfo.songName.toLowerCase().indexOf('dust') !== -1 ||
    eachInfo.songName.toLowerCase().indexOf('sand') !== -1 ||
    eachInfo.songName.toLowerCase().indexOf('ash') !== -1
  ) {
    eachInfo.mood.push('먼지/ 재');
  } else if (eachInfo.songName.toLowerCase().indexOf('tornado') !== -1) {
    eachInfo.mood.push('토네이도');
  } else if (eachInfo.songName.toLowerCase().indexOf('squall') !== -1) {
    eachInfo.mood.push('돌풍');
  }

  return eachInfo;
};

getWeatherInfo();
