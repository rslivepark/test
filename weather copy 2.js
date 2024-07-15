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

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.status, response.statusText);
    }

    const data = await response.json();
    console.log(data);
    console.log(data.name, data.weather[0].main, data.weather[0].description);

    renderHTML(data);
    await callSpotifyAPI(data);
    matchWeather(data.weather[0].main);
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

const renderPlaylist = (musicInfo) => {
  const section = document.querySelector('section#section');
  section.innerHTML = ''; // 기존 내용을 지웁니다.
  musicInfo.forEach((music) => {
    const div = document.createElement('div');
    div.classList.add('music-item');
    div.innerHTML = `
      <img src="${music.albumCover}" alt="${music.album}" />
      <p>곡명: ${music.songName}</p>
      <p>아티스트: ${music.artist}</p>
      <p>앨범: ${music.album}</p>
      <audio controls src="${music.playMusic}"></audio>
    `;
    section.appendChild(div);
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

const callSpotifyAPI = async (weatherData) => {
  const CLIENT_ID = `904504b7562048308f3b78333a4cacd4`;
  const CLIENT_SECRET = `45da2b52af2d4752bbb7e828cb71cd18`;

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

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify data');
  }

  const spotifyData = await response.json();
  console.log('Playlists:', spotifyData.playlists.items);

  if (spotifyData.playlists.items.length === 0) {
    throw new Error('No playlists found');
  }

  const playlistId = spotifyData.playlists.items[0].id;
  const playlistResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!playlistResponse.ok) {
    throw new Error('Failed to fetch playlist tracks');
  }

  const playlistData = await playlistResponse.json();
  console.log('Playlist Data:', playlistData);

  if (playlistData.items.length === 0) {
    throw new Error('No tracks found in playlist');
  }

  const tracks = playlistData.items.map((item) => item.track);
  console.log('Tracks', tracks);
  console.log('Track URL', tracks[0].external_urls.spotify);

  await loadMusic(tracks, token);

  console.log('Spotify query:', weatherData.weather[0].main);
};

const loadMusic = async (tracks, token) => {
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
          mood: [], // 초기에는 빈 배열로 시작
        };

        return matchWeatherWithSong(musicDescription);
      })
    );

    console.log(musicInfo); // 최종 업데이트된 음악 정보 출력
    renderPlaylist(musicInfo); // 음악 정보를 HTML로 렌더링
    return musicInfo;
  } catch (error) {
    console.log('Error loading music:', error);
  }
};

// 날씨와 음악 매칭하기
const matchWeather = (weather) => {
  if (weather === 'Clear') {
    console.log('matchWeather', weather);
    return '화창한 날'; // 날씨가 맑으면 화창한 날
  } else if (weather === 'Clouds') {
    console.log('matchWeather', weather);
    return '비온 후/ 맑게 갠'; // 구름이 끼고 특정 조건에 맞으면 비온 후 맑게 갠 날
  } else if (weather === 'Snow') {
    console.log('matchWeather', weather);
    return '눈오는 날'; // 눈이 오면 눈오는 날
  } else {
    console.log('matchWeather', weather);
    return '비/ 흐림'; // 나머지는 비 또는 흐림
  }
};

const matchWeatherWithSong = (eachInfo) => {
  if (0.55 < eachInfo.valence && 70 < eachInfo.tempo && eachInfo.tempo < 130) {
    eachInfo.mood.push('화창한 날'); // 긍정적인 정도가 높고 템포가 적당한 노래는 화창한 날
    return eachInfo;
  }
  if (
    0.5 <= eachInfo.danceability &&
    eachInfo.danceability < 0.72 &&
    0.3 <= eachInfo.valence &&
    eachInfo.valence < 0.75 &&
    65 <= eachInfo.tempo &&
    eachInfo.tempo < 110
  ) {
    eachInfo.mood.push('선선한 날'); // 댄스 가능성과 긍정적인 정도가 중간 정도이고 템포가 적당한 노래는 선선한 날
    return eachInfo;
  }
  if (
    0.45 < eachInfo.danceability &&
    eachInfo.danceability < 0.55 &&
    0.3 < eachInfo.energy &&
    eachInfo.energy < 0.55
  ) {
    eachInfo.mood.push('쌀쌀한 날'); // 댄스 가능성과 에너지가 중간 정도인 노래는 쌀쌀한 날
    return eachInfo;
  }
  if (
    (0.3 < eachInfo.energy &&
      eachInfo.energy < 0.5 &&
      0.3 < eachInfo.valence &&
      eachInfo.valence < 0.6 &&
      70 < eachInfo.tempo &&
      eachInfo.tempo < 110) ||
    (eachInfo.valence < 0.3 && eachInfo.tempo > 130)
  ) {
    eachInfo.mood.push('환절기'); // 에너지와 긍정적인 정도가 중간인 노래 또는 긍정적인 정도가 낮고 템포가 빠른 노래는 환절기
    return eachInfo;
  }
  if (
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
    return eachInfo;
  }
  if (
    (0.7 < eachInfo.danceability &&
      eachInfo.danceability < 0.85 &&
      0.5 < eachInfo.energy &&
      eachInfo.energy < 0.7) ||
    (0.3 < eachInfo.valence && eachInfo.valence < 0.4 && eachInfo.tempo > 160)
  ) {
    eachInfo.mood.push('비온 후/ 맑게 갠'); // 댄스 가능성과 에너지가 높고 긍정적인 정도가 중간인 노래 또는 템포가 빠른 노래는 비온 후/ 맑게 갠
    return eachInfo;
  }
  if (
    (eachInfo.songName.indexOf('눈') !== -1 ||
      eachInfo.songName.indexOf('겨울') !== -1 ||
      eachInfo.songName.toLowerCase().indexOf('snow') !== -1 ||
      eachInfo.songName.toLowerCase().indexOf('winter') !== -1) &&
    (parseInt(eachInfo.releaseDate.split('-')[1]) <= 2 ||
      parseInt(eachInfo.releaseDate.split('-')[1]) >= 11)
  ) {
    eachInfo.mood.push('눈오는 날'); // 제목에 눈 또는 겨울이 포함되고 발매일이 11월에서 2월 사이인 노래는 눈오는 날
    return eachInfo;
  }
  if (
    eachInfo.danceability > 0.5 &&
    eachInfo.energy > 0.7 &&
    eachInfo.tempo > 120
  ) {
    eachInfo.mood.push('폭염/ 더위'); // 댄스 가능성과 에너지가 높고 템포가 빠른 노래는 폭염/ 더위
    return eachInfo;
  }
};

getWeatherInfo();
