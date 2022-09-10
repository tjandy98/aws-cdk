exports.handler = async (event, context) => {
  const quotes = [
    {
      quote: "Your faith can move mountains and your doubt can create them.",
    },

    {
      quote:
        "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    },
  ];

  var quote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    statusCode: 200,
    headers: { "Content-Type": "applicatin/json" },
    body: JSON.stringify(quote),
  };
};
