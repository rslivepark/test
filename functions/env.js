exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // CORS 설정
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      WEATHER_API_KEY: process.env.WEATHER_API_KEY,
      CLIENT_ID: process.env.CLIENT_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
    }),
  };
};
