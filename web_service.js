//const queue_ip = process.env.QUEUE_IP;
//console.log(`Your port is ${queue_ip}`);

const express = require('express');
// framework backend 
const app = express();
//  http server 
const http = require('http').Server(app);
const bodyParser = require('body-parser');
// queue message protocol 
const amqp = require('amqplib');
// real-time communication agent
var io = require('socket.io')(http);
  

app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(bodyParser.json());

//bootstrap
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

// simulate request ids
let lastRequestId = 1;

// RabbitMQ connection string
const messageQueueConnectionString = 'amqp://';

//form
app.get('/form', function (req, res) {
  res.sendFile(__dirname + '/html/iscrizione.html');
});

app.get('/stato', function (req, res) {
  res.sendFile(__dirname + '/html/stato.html');
});


// form data endpoint, gets a POST form and sent to RabbitMQ  
app.post('/api/v1/processData', async function (req, res) {
  // save request id and increment
  let requestId = lastRequestId;
  lastRequestId++;

  // connect to Rabbit MQ and create a channel
  let connection = await amqp.connect(messageQueueConnectionString);
  let channel = await connection.createConfirmChannel();
  
  // publish the data to Rabbit MQ
  let requestData = req.body;
  //console.log(requestData);
  console.log("Published a request message, requestId:", requestId);
  await publishToChannel(channel, { routingKey: "request", exchangeName: "processing", data: { op: "INSERT", requestId, requestData } });

  io.emit('richieste', { requestid: requestId, result: "PENDING" });
  // send the request id in the response
  res.send({ requestId })
});

// utility function to publish messages to a channel
function publishToChannel(channel, { routingKey, exchangeName, data }) {
  return new Promise((resolve, reject) => {
    channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'), { persistent: true }, function (err, ok) {
      if (err) {
        return reject(err);
      }

      resolve();
    })
  });
}


async function listenForResults() {
  // connect to Rabbit MQ
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel and prefetch 1 message at a time
  let channel = await connection.createChannel();
  await channel.prefetch(1);

  // start consuming messages
  await consume({ connection, channel });
}


// consume messages from RabbitMQ
function consume({ connection, channel, resultsChannel }) {
  return new Promise((resolve, reject) => {
    channel.consume("processing.results", async function (msg) {
      // parse message
      let msgBody = msg.content.toString();
    //{ table: 'utente', id: 28, nome: 'tizio', cognome: 'caio', type: 'INSERT' }
      console.log(msgBody);
      let data = JSON.parse(msgBody);
	  if(data.hasOwnProperty('type'))
	  {
      console.log("emetto segnale di operazione avvenuta ed invio i dati");
			io.emit('vista', data );
	  }
	  else
	  {
      // in questo caso ricevo un messaggio che mi dice se la request è stata eseguita
		  let requestId = data.requestId;
		  let processingResults = data.processingResults;
		  //console.log("Received a result message, requestId:", requestId, "processingResults:", processingResults);
			io.emit('richieste', { requestid: processingResults.id, result: processingResults.status });

    }

    // acknowledge message as received
    await channel.ack(msg);
	  
    });

    // handle connection closed
    connection.on("close", (err) => {
      return reject(err);
    });

    // handle errors
    connection.on("error", (err) => {
      return reject(err);
    });
  });
}

// Start Http Server 
const PORT = 3000;
http.listen(PORT, "localhost", function (err) {
  if (err) {
    console.error(err);
  } else {
    console.info("Listening on port %s.", PORT);
  }
});

// listen for messages coming from our queue
listenForResults();
