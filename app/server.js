const path = require("path");


// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // set this to true for detailed logging:
  logger: true,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Our main GET home page route, pulls from src/pages/index.hbs
fastify.get("/", function (request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = {
    greeting: "Hello Node!",
  };
  // request.query.paramName <-- a querystring example
  return reply.view("/src/pages/index.hbs", params);
});

// A POST route to handle form submissions
fastify.post("/", function (request, reply) {
  let params = {
    greeting: "Hello Form!",
  };
  // request.body.paramName <-- a form post example
  return reply.view("/src/pages/index.hbs", params);
});

const axios = require("axios");
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

fastify.post("/line-webhook",async function(request, reply){
  if (request.query.apikey !== process.env.API_KEY){
    return "not from line"
  }
  for (const event of request.body.events){
    if (event.type === 'message'){
      if (event.source.userId != 'YOUR_USER_ID'){
        console.warn('received message from unknown user')
        continue
      }
      // console.log(event)
      await axios.post('https://api.line.me/v2/bot/message/reply',{
        replyToken: event.replyToken,
        messages:[
          {type: 'text', text:await getReply(event.message)}
        ] 
      },{
        headers: {
          authorization: `Bearer ${channelAccessToken}`
        }
      })
    }
  }
  console.log(request.body)
  return 'ok'
})

async function getReply(message){
  try{
    return String(eval(message.text))
  }catch (error){
    return String(error)
  }
  
}

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
