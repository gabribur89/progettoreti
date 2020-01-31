//const path  = require('path');
//require('dotenv').config({path:  path.resolve(process.cwd(), '../.env')});

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
  var html='';
  //html += '<button type="button" class="btn btn-primary">Primary</button>';
  html += "<script language='javascript' src='js/bootstrap.min.js'></script>"
  html += "<link rel='stylesheet' href='/css/bootstrap.min.css'/>";
  html += "<body>";
  html += "<div class='container'>";
  html += "<h1>iscrizione abbonato</h1>";
  html += "<form action='/api/v1/processData'  method='post' name='form1'>";
  html += "Nome:</p><input type= 'text' name='nome'></p>";
  html += "Cognome:</p><input type='text' name='cognome'></p>";
  html += "CF:</p><input type='text' name='cf'></p>";
  html += "Telefono:</p><input type='text' name='telefono'></p>";
  html += "Data di Nascita:</p><input type='date' name='datanascita'></p>";
  html += "Indirizzo:</p><input type='text' name='indirizzo'></p>";
  html += "Citta':</p><input type='text' name='citta'></p>";
  html += "CAP:</p><input type='text' name='cap'></p>";
  html += "Tipologia scelta:</p><select name='tipo'>";
  html += "<option name='pesi' value='pesi'>Sala Pesi</option>"
  html += "<option name='cyclette' value='cyclette'>Sala Cyclette</option>"
  html += "<option name='tapis' value='tapis'>Sala Tapis Roulant</option>"
  html += "<option name='nuoto' value='nuoto'>Sala Nuoto</option>"
  html += "</select></p>";
  html += "Durata abbonamento:</p><select name='abbonamento'>";
  html += "<option name='1mese' value='1mese'>1 mese</option>"
  html += "<option name='3mesi' value='3mesi'>3 mesi</option>"
  html += "<option name='6mesi' value='6mesi'>6 mesi</option>"
  html += "<option name='12mesi' value='12mesi'>1 anno</option>"
  html += "</select></p>";
  html += "<input type='submit' value='Invia!'>";
  html += "<input type='reset'  value='Reset'>";
  html += "</form>";
  html += "</div>";
  html += "</body>";
  res.send(html);
});

//recupero info abbonati
// app.get('/getabbonato', async function (req, res) {
//   var html = '';
//   html += "<body>";
//   html += "<h1>Dati degli abbonati</h1>"
//   html += "<div id='utente'></div>";
//   html += "</body>";
  
//   // connect to Rabbit MQ and create a channel
//   let connection = await amqp.connect(messageQueueConnectionString);
//   let channel = await connection.createConfirmChannel();
  
//   let op = "SELECT";
//   await publishToChannel(channel, { routingKey: "request", exchangeName: "processing", data: { op } });
  
//   res.send(html);
// });

// handle the request
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
	  //{ table: 'utente', id: 28, type: 'INSERT' }
      let data = JSON.parse(msgBody);
	  if(data.hasOwnProperty('type'))
	  {
		  if(data.type == "INSERT")
		  {
			//console.log("Inserimento utente avvenuto");
			//let op = "SELECT";
      //let id = data.id;
      io.emit('vista', data );
			
		  }
		  if(data.type == "UPDATE")
		  {
			console.log("aggiornamento avvenuto con successo");
		  }
		  if(data.type == "DELETE")
		  {
			console.log("cancellamento avvenuto con successo");
		  }

	  }
	  else
	  {
		  let requestId = data.requestId;
		  console.log("ELSE:", data);
		  let processingResults = data.processingResults;
		  console.log("Received a result message, requestId:", requestId, "processingResults:", processingResults);
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

// Connect to socket_io channel and emit event 
//io.on('connection', function (socket) {
//  socket.emit('vista', { stato: 'connesso' });
//});

// Start the server
const PORT = 3000;
//server = http.createServer(app);
http.listen(PORT, "localhost", function (err) {
  if (err) {
    console.error(err);
  } else {
    console.info("Listening on port %s.", PORT);
  }
});

// listen for results on RabbitMQ
listenForResults();
