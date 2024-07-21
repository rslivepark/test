const ClientID = `411944574c3745f49a0ae819f629170b`;
const ClientSecret = `20eb343e234c4ec7ac730215cab938cc`;
const artistURL = `https://api.spotify.com/v1/artists/`;

const mainTopArtistLine = async () => {
  let url = new URL(artistURL + '0TnOYISbd1XYRBk9myaseg');
  const response = await fetch(url);
  const data = await response.json();
  console.log('URL:', url);
  console.log('response:', response);
  console.log('data:', data);
};

// mainTopArtistLine();
