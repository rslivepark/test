let url;
let getArtistId;
let artistNames = [];
let clickedName;

let topTrackList = [];
let recommendedArtistList = [];
let artistAlbumList = [];
let artistSingleEPsList = [];
let artistPopularMusicList = []


// 토큰 설정
const getAccessToken = async (CLIENT_ID, CLIENT_SECRET) => {
  const encodedCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const response = await fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
};

// Spotify API 호출(변경필요)
const callSpotifyAPI = async () => {
  const CLIENT_ID = `03e132602b064240889cad723e1e7500`;
  const CLIENT_SECRET = `5eb49937181f4e58bf9a6bb9fdd6a0b7`;

  const token = await getAccessToken(CLIENT_ID, CLIENT_SECRET);
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${clickedName}&type=artist`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  console.log(data);
  console.log(data.artists.items[0].name);
  console.log(data.artists.items[0].id);
  console.log(data.artists.items[0].href);
  url = data.artists.items[0].href;
  getArtistId = data.artists.items[0].id
  fetchArtist(url, token);
  fetchArtistAlbum(url + "/albums", token);
  fetchArtistTopTrack(url + "/top-tracks", token);
  fetchArtistTopRelated(url + "/related-artists", token);
};

// 메인페이지 아트스트 클릭 이벤트 (변경필요)
const artistText = document.querySelector(".artist-artist-name");
artistText.addEventListener("click", () => {
  clickedName = artistText.textContent.toLocaleLowerCase();
  console.log("클릭된 아티스트 이름: ", clickedName);
  callSpotifyAPI();
});

// 아티스트 정보 fetch
const fetchArtist = async (artistURL, token) => {
  const response = await fetch(artistURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const artistData = await response.json();
  console.log("fetchArtist", artistData);
  artistHeader(artistData);
};

// 아티스트 페이지 헤더(변경필요)
const artistHeader = (artistData) => {
  let artistHeaderHTML = `<section id="artist-header">
            <div class="overlay-text">
            <div class="artist-artist-name">NewJeans</div>
            <div class="artist-monthly-listener">${
              artistData.followers.total.toLocaleString() + " " + "followers"
            }</div>
            <span class="artist-button-area"><button>팔로우하기</button></span>
          </div>
            <div class="artist-card-img-box">
              <div class="artist-card-img">  
                <img
                  src="${artistData.images[1].url}"
                  alt=""
                />
              </div>
              <div class="artist-card-play-btn"></div>
            </div>
          </section>`;
  document.getElementById("artist-header").innerHTML = artistHeaderHTML;
};

// 아티스트 앨범 정보 fetch
const fetchArtistAlbum = async (artistURL, token) => {
  const response = await fetch(artistURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const artistData = await response.json();
  console.log("fetchArtistAlbum", artistData);

  artistAlbumList = artistData.items;
  artistSingleEPsList = artistData.items;
  console.log(artistAlbumList);
  artistAlbum();
  artistSingleEPs();
};

// 아티스트 앨범
const artistAlbum = () => {
  let artistAlbumListHTML = ``;
  artistAlbumList.forEach((list) => {
    if (list.album_group === "album") {
      artistAlbumListHTML += `
        <div class="contents-card">
       <div class="card-img-box position-relative">
        <div class="card-play-btn"></div>
        <div class="card-img">
          <img
            src="${list.images[1].url}"
            alt=""
          />
        </div>
      </div>
      <div class="card-text">
        <p class="card-title artist-card-title">${list.name}</p>
        <p class="card-subtitle">${
          list.release_date.slice(0, 4) + " &middot; 앨범"
        }</p>
      </div>
    </div>`;
    }
  });
  document.getElementById("artist-album").innerHTML = artistAlbumListHTML;
};

// 아티스트 싱글 및 EP
const artistSingleEPs = () => {
  let artistSingleEPsListHTML = ``;
  artistSingleEPsList.forEach((list) => {
    if (list.album_group === "single") {
      artistSingleEPsListHTML += `
        <div class="contents-card">
       <div class="card-img-box position-relative">
        <div class="card-play-btn"></div>
        <div class="card-img">
          <img
            src="${list.images[1].url}"
            alt=""
          />
        </div>
      </div>
      <div class="card-text">
        <p class="card-title artist-card-title">${list.name.length>12?list.name.substring(0,10) + "...":list.name}</p>
        <p class="card-subtitle">${
          list.release_date.slice(0, 4) + " &middot; " , list.total_tracks <= 3
            ? "싱글"
            : "EP"
        }</p>
      </div>
    </div>`;
    }
  });
  document.getElementById("artist-single-eps").innerHTML =
    artistSingleEPsListHTML;
};

// 아티스트 탑트랙 정보 fetch
const fetchArtistTopTrack = async (artistURL, token) => {
  const response = await fetch(artistURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const artistData = await response.json();
  console.log("fetchArtistTopTrack", artistData);

  topTrackList = artistData.tracks;
  artistPopularMusicList = artistData.tracks;
  console.log(topTrackList);
  renderTopTracks();
  artistPopularMusic()
};

// 차트 hover 함수
const chartHoverEvents = (event) => {
  event.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      element.style.backgroundColor = "#2A2E33";
      element.querySelector(".heart-icon").style.display = "inline-block";
      element.querySelector(".more-icon").style.display = "inline-block";
    });
    element.addEventListener("mouseleave", () => {
      element.style.backgroundColor = "";
      element.querySelector(".heart-icon").style.display = "none";
      element.querySelector(".more-icon").style.display = "none";
    });
  });
};

// 아티스트의 탑트랙 렌더링
const renderTopTracks = () => {
  let topTracksHTML = `<div class="artist-popular-charts-container">`;
  topTrackList.slice(0, 5).forEach((list, index) => {
    const duration = formatDuration(list.duration_ms);
    topTracksHTML += `<div class="row artist-popular-chart">
                <div class="col-1 text-center">${index + 1}</div>
                <div class="col-1"><i class="fa-solid fa-play play-icon"></i></div>
                  <div class="col-1">
                  <img
                    class="artist-popular-img"
                    src="${list.album.images[0].url}"
                  />
                </div>
                <div class="col-4 artist-song-name">${list.name}</div>
                <div class="col-2">${list.artists[0].name}</div>
                <div class="col-1 text-center"><i class="fa-regular fa-heart heart-icon" style="display: none"></i></div>
                <div class="col-1 text-center">${duration}</div>
                <div class="col-1 text-center"><span class="more-icon" style="display: none">&middot;&middot;&middot;</span></div>
              </div>`;
  });
  topTracksHTML += `<div class="read-more">자세히 보기</div></div>`;

  const container = document.querySelector(".artist-popular-chart");
  container.innerHTML = topTracksHTML;

  const trackElements = container.querySelectorAll(".artist-popular-chart");
  chartHoverEvents(trackElements);

  // 자세히보기 클릭 이벤트
  const readMore = document.querySelector(".read-more");
  readMore.addEventListener("click", () => {
    let additionalTracksHTML = `<div class="additional-tracks artist-popular-charts-container">`;
    topTrackList.slice(5).forEach((list, index) => {
      const duration = formatDuration(list.duration_ms);
      additionalTracksHTML += `<div class="row artist-popular-chart">
                <div class="col-1 text-center">${index + 6}</div>
                <div class="col-1"><i class="fa-solid fa-play play-icon"></i></div>
                  <div class="col-1">
                  <img
                    class="artist-popular-img"
                    src="${list.album.images[0].url}"
                  />
                </div>
                <div class="col-4 artist-song-name">${list.name}</div>
                <div class="col-2 artist-chart-name">${list.artists[0].name}</div>
                <div class="col-1 text-center"><i class="fa-regular fa-heart heart-icon" style="display: none"></i></div>
                <div class="col-1 text-center">${duration}</div>
                <div class="col-1 text-center"><span class="more-icon" style="display: none">&middot;&middot;&middot;</span></div>
              </div>`;
    });
    additionalTracksHTML += `<div class="brief-view">간단히 보기</div></div>`;

    document
      .querySelector(".artist-popular-chart")
      .insertAdjacentHTML("beforeend", additionalTracksHTML);

    const additionalTrackElements = document.querySelectorAll(
      ".additional-tracks .artist-popular-chart"
    );
    chartHoverEvents(additionalTrackElements);

    readMore.style.display = "none";

    const briefView = container.querySelector(".brief-view");
    briefView.addEventListener("click", () => {
      const additionalTrackContainer =
        container.querySelector(".additional-tracks");
      additionalTrackContainer.remove();
      readMore.style.display = "inline";
    });
  });
};

// 밀리초를 분과 초로 변환하는 함수
const formatDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// 아티스트 인기 음악
const artistPopularMusic = () => {
    let artistPopularMusicListHTML = ``;
    artistPopularMusicList.forEach((list) => {
        artistPopularMusicListHTML += `
          <div class="contents-card">
         <div class="card-img-box position-relative">
          <div class="card-play-btn"></div>
          <div class="card-img">
            <img
              src="${list.album.images[0].url}"
              alt=""
            />
          </div>
        </div>
        <div class="card-text">
          <p class="card-title artist-card-title">${list.name}</p>
          <p class="card-subtitle">${
            list.total_tracks <= 3 ? "싱글":list.total_tracks <= 7? "EP" : "앨범"
          }</p>
        </div>
      </div>`;
    });
    document.getElementById("artist-popular-music").innerHTML = artistPopularMusicListHTML;
  };




// 비슷한 아티스트 정보 fetch
const fetchArtistTopRelated = async (artistURL, token) => {
  const response = await fetch(artistURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const artistData = await response.json();
  console.log("fetchArtistTopRelated", artistData);

  recommendedArtistList = artistData.artists;
  console.log(recommendedArtistList);
  recommendedArtist();
};

// 비슷한 아티스트 추천
const recommendedArtist = () => {
  let recommendedArtistHTML = ``;
  recommendedArtistList.forEach((list) => {
    recommendedArtistHTML += `
    <div class="contents-card">
   <div class="card-img-box position-relative">
    <div class="card-play-btn"></div>
    <div class="card-img card-artist-img">
      <img
        src="${list.images[1].url}"
        alt=""
      />
    </div>
  </div>
  <div class="card-text">
    <p class="card-title artist-card-title">${list.name}</p>
    <p class="card-subtitle">${
      list.followers.total.toLocaleString() + " " + "followers"
    }</p>
  </div>
</div>`;
  });
  document.getElementById("artist-artist-rec").innerHTML =
    recommendedArtistHTML;
};
