document.addEventListener('DOMContentLoaded', () => {
  // console.log('search.js');
  let searchListSearchJS = [];
  let trackCountSearchJS = 0;

  const searchBtnSearchJS = document.querySelector('.weather-search-btn');
  const searchInputSearchJS = document.querySelector('.search-input');

  searchBtnSearchJS.addEventListener('click', () => {
    const searchElement = document.querySelector('.search');
    searchElement.classList.toggle('search-active');
  });

  const getSearchAccessToken = async (CLIENT_ID, CLIENT_SECRET) => {
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

  const getSpotifySearchURLs = (query) => {
    return {
      trackURL: `https://api.spotify.com/v1/search?q=${query}&type=track`,
      playlistURL: `https://api.spotify.com/v1/search?q=${query}&type=playlist`,
      albumURL: `https://api.spotify.com/v1/search?q=${query}&type=album`,
      artistURL: `https://api.spotify.com/v1/search?q=${query}&type=artist`,
    };
  };

  const fetchSpotifySearchData = async (url, token) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Spotify data');
    }
    return response.json();
  };

  const createSearchPlaylistSection = () => {
    const section = document.querySelector('#section');

    section.innerHTML = '';

    const mainWeatherPlaylist = document.createElement('div');
    mainWeatherPlaylist.classList.add(
      'contents-container',
      'd-flex',
      'flex-column',
      'gap-4',
      'search-result'
    );

    const contentsLine = document.createElement('div');
    contentsLine.classList.add('contents-line');

    const weatherPlaylistHeader = document.createElement('div');
    weatherPlaylistHeader.classList.add(
      'contents-header',
      'search_playlist_header'
    );

    const headerTitle = document.createElement('h4');
    headerTitle.classList.add('contents-header-title', 'h4', 'text-white');
    headerTitle.innerHTML = `<h1>곡</h1>`;

    weatherPlaylistHeader.appendChild(headerTitle);

    const weatherPlaylistRow = document.createElement('div');
    weatherPlaylistRow.classList.add('card-container', 'search-track');

    contentsLine.appendChild(weatherPlaylistHeader);
    contentsLine.appendChild(weatherPlaylistRow);

    mainWeatherPlaylist.appendChild(contentsLine);
    section.appendChild(mainWeatherPlaylist);
  };

  const fetchAllSpotifySearchData = async (urls, token) => {
    createSearchPlaylistSection();
    const [trackData, playlistData, albumData, artistData] = await Promise.all([
      fetchSpotifySearchData(urls.trackURL, token),
      fetchSpotifySearchData(urls.playlistURL, token),
      fetchSpotifySearchData(urls.albumURL, token),
      fetchSpotifySearchData(urls.artistURL, token),
    ]);

    const trackItems = trackData.tracks.items;
    const playlistItems = playlistData.playlists.items;
    const albumItems = albumData.albums.items;
    const artistItems = artistData.artists.items;

    searchListSearchJS = [
      ...trackItems,
      ...playlistItems,
      ...albumItems,
      ...artistItems,
    ];
    renderSearchResult();
    // console.log('trackItems\n', trackItems);
    // console.log('playlistItems\n', playlistItems);
    // console.log('albumItems\n', albumItems);
    // console.log('artistItems\n', artistItems);
  };

  const callSpotifySearchAPI = async (query) => {
    const CLIENT_ID = import.meta.env.CLIENT_ID;
    const CLIENT_SECRET = import.meta.env.CLIENT_SECRET;

    const token = await getSearchAccessToken(CLIENT_ID, CLIENT_SECRET);
    const urls = getSpotifySearchURLs(query);
    await fetchAllSpotifySearchData(urls, token);
  };

  // 밀리초를 분과 초로 변환하는 함수
  const formatDurationOnSearch = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 검색 결과 렌더링
  const renderSearchResult = () => {
    const section = document.getElementById('section');
    section.innerHTML = '';

    const createSearchCategorySection = (title, htmlContent) => {
      const categoryContainer = document.createElement('div');
      categoryContainer.classList.add(
        'contents-container',
        'd-flex',
        'flex-column',
        'gap-4',
        'search-result'
      );

      const contentsLine = document.createElement('div');
      contentsLine.classList.add('contents-line');

      const playlistHeader = document.createElement('div');
      playlistHeader.classList.add('contents-header', 'search_playlist_header');

      const headerTitle = document.createElement('div');
      headerTitle.classList.add(
        'contents-header-title',
        'h4',
        'text-white',
        'search-result-header-text'
      );
      headerTitle.innerHTML = `<h4 class="hover-none-underline">${title}<button class="contents-header-show-more hover-none-underline search-row-more" onclick="showTwoLines(this)">더보기</button></h4>`;

      playlistHeader.appendChild(headerTitle);

      const playlistRow = document.createElement('div');
      playlistRow.classList.add('card-container', 'search-track');
      playlistRow.innerHTML = htmlContent;

      contentsLine.appendChild(playlistHeader);
      contentsLine.appendChild(playlistRow);

      categoryContainer.appendChild(contentsLine);
      section.appendChild(categoryContainer);
    };

    let trackHTML = '';
    let playlistHTML = '';
    let albumHTML = '';
    let artistHTML = '';

    searchListSearchJS.forEach((item) => {
      if (item.type === 'track') {
        if (trackCountSearchJS >= 5) return;
        const duration = formatDurationOnSearch(item.duration_ms);
        trackHTML += `
        <div class="contents-card search-playlist-item">
          <div class="card-img-box position-relative">
            <div class="card-img search-img">
              <img src="${item.album.images[1].url}" alt="album_image" />
            </div>
          </div>
          <div class="card-text search-track-list">
            <p class="search-track-name-tag">${item.name}</p>
            <p class="search-track-artist-tag">${item.artists[0].name}</p>
            <p>${duration}</p>
          </div>
        </div>
      `;
        trackCountSearchJS++;
      } else if (item.type === 'playlist') {
        playlistHTML += `
        <div class="contents-card search-playlist-item">
          <div class="card-img-box position-relative">
            <div class="card-img search-img">
              <img src="${item.images[0].url}" alt="playlist_image" />
            </div>
          </div>
          <div class="card-text search-playlist-list">
            <p class="search-playlist-text-tag">${item.name}</p>
          </div>
        </div>
      `;
      } else if (item.type === 'album') {
        albumHTML += `
        <div class="contents-card search-playlist-item">
          <div class="card-img-box position-relative">
            <div class="card-img search-img">
              <img src="${item.images[1].url}" alt="album-img" />
            </div>
          </div>
          <div class="card-text search-album-list">
            <span class="search-album-text-tag">${item.name}</span>
            <span class='search-album-tag'> - ${item.album_type}</span>
            <p class='search-album-artist-tag'>${item.artists[0].name}</p>
            <p>${item.release_date}</p>
          </div>
        </div>
      `;
      } else if (item.type === 'artist') {
        if (item.genres && item.genres[0]) {
          // 공백이 있는지 확인하고 'k-pop' 뒤의 부분을 제거하는 코드
          if (item.genres[0].includes(' ')) {
            item.genres[0] = item.genres[0].split(' ')[0];
          }
        }
        artistHTML += `
        <div class="contents-card search-playlist-item">
          <div class="card-img-box position-relative">
            <div class="card-img card-artist-img search-img">
              <img src="${item.images[1].url}" alt="artist_image" />
            </div>
          </div>
          <div class="card-text search-artist-list">
            <p>
              <span class="search-artist-rate">${item.name}<span>
            </p>
            <p class='search-genres-tag'>${
              item.genres[0] !== undefined || item.genres[0 !== null]
                ? item.genres[0]
                : '장르 분류 없음'
            }</p>
          </div>
        </div>
      `;
      }
    });

    if (trackHTML) createSearchCategorySection('곡', trackHTML);
    if (albumHTML) createSearchCategorySection('앨범', albumHTML);
    if (artistHTML) createSearchCategorySection('아티스트', artistHTML);
    if (playlistHTML) createSearchCategorySection('플레이리스트', playlistHTML);
  };

  document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInputSearchJS.value;
    // console.log(query);
    if (query) {
      await callSpotifySearchAPI(query);
    } else {
      console.error('Search query is empty');
    }
    searchInputSearchJS.value = '';
  });
});
