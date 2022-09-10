exports.handler = async (event, context) => {
  const message = process.env.MESSAGE;
  return `Hello Lambda! Env: ${message}`;
};
