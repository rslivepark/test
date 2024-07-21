// 메인화면으로 가기
document
  .querySelector('li:nth-child(1) > button')
  .addEventListener('click', function () {
    window.location.href = 'index.html';
    console.log('index.html');
  });
// 회원가입 화면 이동
document.querySelector('.sign-up-btn').addEventListener('click', () => {
  window.location.href = 'signup.html';
  console.log('signup');
});

// 로그인화면 이동
document.querySelector('.log-in-btn').addEventListener('click', () => {
  window.location.href = 'signin.html';
  console.log('signin');
});

// 메인 날씨 부분 더보기 클릭
const showTwoLines = (button) => {
  // 클릭된 버튼에서 가장 가까운 .contents-line 요소를 찾습니다.
  const contentsLine = button.closest('.contents-line');
  // 그 안에서 .card-container 요소를 찾습니다.
  const cardContainer = contentsLine.querySelector('.card-container');
  // .card-two-lines 클래스를 추가하거나 제거합니다.
  cardContainer.classList.toggle('card-two-lines');
};

// 창크기 400px 미만 경고화면 표시
const checkWindowSize = () => {
  if (window.innerWidth < 375) {
    // console.log('resize');

    // 경고 메시지가 이미 존재하지 않는 경우에만 생성
    if (!document.querySelector('.browser-alert')) {
      const div = document.createElement('div');
      const wrap = document.getElementById('wrap');
      const spinner = document.getElementById('spinner');

      if (wrap && spinner) {
        document.body.appendChild(div);
        div.classList.add('browser-alert');
        // console.log('Hiding wrap and spinner');

        wrap.style.setProperty('display', 'none', 'important');
        spinner.style.setProperty('display', 'none', 'important');
        div.innerHTML = `
          <p class='alert-message'>브라우저 창이 너무 작습니다</p>
          <p class='alert-message'>화면을 넓혀 사용해주세요</p>
        `;
      }
    }
  } else {
    const existingAlert = document.querySelector('.browser-alert');
    if (existingAlert) {
      existingAlert.remove();
      // console.log('Showing wrap and spinner');
      document.getElementById('wrap').style.display = '';
      document.getElementById('spinner').style.display = '';
    }
  }
};

window.addEventListener('resize', checkWindowSize);
document.addEventListener('DOMContentLoaded', checkWindowSize);

// 지도 관련
let latitude = 37.566535;
let longitude = 126.9779692;

// 선택된 위치 저장 변수
let selectedLatLng = null;
// 저장된 마커 삭제 가능할지 여부
let deleteMode = false;

let mapContainer = document.getElementById('map'), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(latitude, longitude), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
  };

// 지도 생성
let map = new kakao.maps.Map(mapContainer, mapOption);

// 마커 생성
let marker = new kakao.maps.Marker({
  position: new kakao.maps.LatLng(latitude, longitude),
});
marker.setMap(map);

const getCurrentLocation = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    console.log(lat, lon);

    // 지도의 중심을 현재 위치로 이동
    let moveLatLon = new kakao.maps.LatLng(lat, lon);
    map.setCenter(moveLatLon);

    // 마커 위치를 현재 위치로 변경
    marker.setPosition(moveLatLon);
  } catch (error) {
    console.error('Error getting location:', error);
  }
};

const getAnotherLocation = (mouseEvent) => {
  // 클릭한 위도, 경도 정보를 가져옵니다
  let latlng = mouseEvent.latLng;

  // 마커 위치를 클릭한 위치로 옮깁니다
  marker.setPosition(latlng);

  // 클릭한 위치 저장
  selectedLatLng = latlng;
  console.log(latlng.getLat(), latlng.getLng());
};

getCurrentLocation();
kakao.maps.event.addListener(map, 'click', getAnotherLocation);
let siteButton = document.getElementById('mySiteButton');
siteButton.addEventListener('click', getCurrentLocation);

// 마커를 표시할 위치와 내용을 저장할 배열
let positions = [];
let markers = [];
let infoWindows = [];

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
function makeOverListener(map, marker, infowindow) {
  return function () {
    infowindow.open(map, marker);
  };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}

// 새로운 위치에 마커 추가
const addMarkerButton = document.getElementById('addMarkerButton');
addMarkerButton.addEventListener('click', () => {
  const content = document.getElementById('locationContent').value;
  if (selectedLatLng && content) {
    // 리스트에 저장
    positions.push({
      content: content,
      latlng: selectedLatLng,
    });

    console.log('Added marker:', positions);

    // 마커를 생성합니다
    let newMarker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: selectedLatLng, // 마커의 위치
    });

    // 마커에 표시할 인포윈도우를 생성합니다
    let infowindow = new kakao.maps.InfoWindow({
      content: `<div style="color:black;">${content}</div>`, // 인포윈도우에 표시할 내용
    });

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    kakao.maps.event.addListener(
      newMarker,
      'mouseover',
      makeOverListener(map, newMarker, infowindow)
    );
    kakao.maps.event.addListener(
      newMarker,
      'mouseout',
      makeOutListener(infowindow)
    );

    // 마커 클릭 이벤트 등록
    kakao.maps.event.addListener(newMarker, 'click', () => {
      if (deleteMode) {
        const confirmDelete = confirm('Do you want to delete this marker?');
        if (confirmDelete) {
          infowindow.close();
          newMarker.setMap(null); // Remove marker from the map
          // Remove marker from positions array
          markers = markers.filter((marker) => marker !== newMarker);
          infoWindows = infoWindows.filter((infoWin) => infoWin !== infowindow);
          positions = positions.filter(
            (position) => position.latlng !== newMarker.getPosition()
          );
          console.log('Marker deleted:', positions);
        }
      } else {
        console.log(
          'Marker clicked:',
          newMarker.getPosition().getLat(),
          newMarker.getPosition().getLng()
        );
      }
    });

    markers.push(newMarker);
    infoWindows.push(infowindow);

    // 입력창 초기화
    document.getElementById('locationContent').value = '';
  } else {
    alert('Please click on the map to select a location and enter content.');
  }
});

const deleteMarkerButton = document.getElementById('deleteMarkerButton');
deleteMarkerButton.addEventListener('click', () => {
  deleteMode = !deleteMode; // Toggle delete mode
  if (deleteMode) {
    deleteMarkerButton.textContent = 'Exit Delete Mode';
    alert('Click on a marker to delete it.');
  } else {
    deleteMarkerButton.textContent = 'Delete Marker';
  }
});
