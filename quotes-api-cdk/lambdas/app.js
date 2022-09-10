const AWS = require("aws-sdk");

let dynamo = new AWS.DynamoDB.DocumentClient();

const MY_TABLE = process.env.MY_TABLE;

exports.handler = async (event, context) => {
  console.log(`EVENT:::,${event}`);

  let path = event.resource;

  let httpMethod = event.httpMethod;

  let route = httpMethod.concat(" ").concat(path);

  let data = JSON.parse(event.body);

  let body;
  let statusCode = 200;

  try {
    switch (route) {
      case "GET /quotes":
        body = await getQuotes();
        break;
      case "POST /quotes":
        body = await saveQuote(data);
        break;
      case "PUT /quotes/{id}":
        body = await updateQuote(event.pathParameters.id, data);
        break;
      case "DELETE /quotes/{id}":
        body = await deleteQuote(event.pathParameters.id);
        break;
      default:
        throw new Error(`Unsupported route: ${route}`);
    }
  } catch (error) {
    console.log(error);
    statusCode = 400;
    body = error.message;
  } finally {
    console.log(body);
    body = JSON.stringify(body);
  }
  return sendRes(statusCode, body);
};

const getQuotes = () => {
  const params = {
    TableName: MY_TABLE,
  };
  return dynamo
    .scan(params)
    .promise()
    .then((data) => {
      return data.Items;
    });
};

const updateQuote = (id, data) => {
  const datetime = new Date().toISOString();

  const params = {
    TableName: MY_TABLE,
    Key: {
      id: id,
    },

    ExpressionAttributeValues: {
      ":quote": data.quote,
      ":updatedAt": datetime,
    },
    UpdateExpression: "SET quote = :quote, updatedAt = :updatedAt",
    ReturnValues: "UPDATED_NEW",
  };
  return dynamo
    .update(params)
    .promise()
    .then(() => {
      return `Updated item ${id}`;
    });
};

const deleteQuote = (id) => {
  const params = {
    TableName: MY_TABLE,
    Key: {
      id: id,
    },
  };
  return dynamo
    .delete(params)
    .promise()
    .then(() => {
      return id;
    });
};

const saveQuote = async (data) => {
  const date = new Date();
  const time = date.getTime();

  const quote = {
    id: time.toString(),
    quote: data.quote,
    date: date.toString(),
  };

  const params = {
    TableName: MY_TABLE,
    Item: quote,
  };

  return dynamo
    .put(params)
    .promise()
    .then(() => {
      return quote;
    });
};

const sendRes = (status, body) => {
  var response = {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  };

  return response;
};
