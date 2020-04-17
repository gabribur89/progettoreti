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
const messageQueueConnectionString = 'amqp://192.168.99.100/';

//endpoint che serve il form di iscrizione
app.get('/form', function (req, res) {
  res.sendFile(__dirname + '/html/iscrizione.html');
});
//endpoint che serve la pagina di stato
app.get('/stato', function (req, res) {
  res.sendFile(__dirname + '/html/stato.html');
});


// Gestione richiesta form di iscrizione, riceve dei dati ed esegue un'azione
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
  // send the request id in the response, rispondo alla richiesta HTTP con l'id generato
  res.send({ requestId })
});

//creo endpoint per put, prendo l'id utente da cancellare dal db, accetta http put
app.put('/cancella/:id', async function(req,res){
	
	// save request id and increment
    let requestId = lastRequestId;
    lastRequestId++;
	//recupero l'id pubblicandolo su rabbit
	//let idabbonato = req.data.id;
	//console.log("richiesta",req.params.id);
	
	// connect to Rabbit MQ and create a channel
	let connection = await amqp.connect(messageQueueConnectionString);
	let channel = await connection.createConfirmChannel();
	
	// publish the data to Rabbit MQ
	let userid = req.params.id;
	//console.log(requestData);
	await publishToChannel(channel, { routingKey: "request", exchangeName: "processing", data: { op: "DELETE", requestId, userid} });
	
	io.emit('richieste', { requestid: requestId, result: "PENDING" });
	
	return res.send("ok");
});

// utility function to publish messages to a channel
/*input: 1) canale creato in precedenza in rabbit;
		 2) routingKey, per scegliere la coda;
		 3) exchangeName, tipo di exchange configurato in Rabbit
		 4) data, dati del messaggio*/
function publishToChannel(channel, { routingKey, exchangeName, data }) {
  return new Promise((resolve, reject) => {
	  //questa è la funzione che pubblica il messaggio nella coda di rabbit
    channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'), { persistent: true }, function (err, ok) {
      if (err) {
        return reject(err);
      }

      resolve();
    })
  });
}

//si mette in ascolto sulla coda in modalità asincrona
//dei messaggi che possono essere messi nella coda
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
	//utilizzando l'exchange e la routingKey è pronto a consumare messaggi dalla coda
	//viene letto il dato contenuto nel messaggio ed inviato tramite metodo emit di io alla pagina stato.html
    channel.consume("processing.results", async function (msg) {
      // parse message
      let msgBody = msg.content.toString();
	  console.log("prima dell IF",msgBody);
	  //{ table: 'utente', id: 28, nome: 'tizio', cognome: 'caio', type: 'INSERT' }
      let data = JSON.parse(msgBody);
	  if(data.hasOwnProperty('type'))
	  {
	  console.log("siamo dentro IF",data);
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

    // acknowledge message as received, si comunica a rabbit che è stato ricevuto
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

// Avvia il server
const PORT = 3000;
http.listen(PORT, "localhost", function (err) {
  if (err) {
    console.error(err);
  } else {
    console.info("Listening on port %s.", PORT);
  }
});

// Mettiti in ascolto su RabbitMQ
listenForResults();
