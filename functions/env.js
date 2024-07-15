exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      WEATHER_API_KEY: process.env.WEATHER_API_KEY,
      CLIENT_ID: process.env.CLIENT_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
    }),
  };
};
