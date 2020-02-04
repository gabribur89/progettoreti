//configuro postgres
const { Client, Pool} = require('pg')

const client = new Client({
user: 'postgres',
host: 'localhost',
database: 'test',
password: 'admin',
port: 5432,
})

client.connect()

const amqp = require('amqplib');

// RabbitMQ connection string
const messageQueueConnectionString = 'amqp://192.168.99.100/';

async function listenForMessages() {
  // connect to Rabbit MQ
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel and prefetch 1 message at a time
  let channel = await connection.createChannel();
  await channel.prefetch(1);

  // create a second channel to send back the results
  let resultsChannel = await connection.createConfirmChannel();

  // start consuming messages
  await consume({ connection, channel, resultsChannel });
}

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


function inserisci_db(data){
	console.log(data)
	const sql = 'INSERT INTO utente(nome, cognome, cf, telefono, datanascita, indirizzo, citta, cap, tipo, durata, dataiscrizione) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *'
	const values = [data.nome,data.cognome,data.cf,data.telefono,data.datanascita,data.indirizzo,data.citta,data.cap,data.tipo,data.abbonamento,data.dataiscrizione]
		client.query(sql, values, (err, res) => {
		  if (err) {
			console.log("MIO ERRORE")
			console.log(err.stack)
		  } else {
			console.log(res.rows[0])
   		 }
		})
}

function seleziona_dati(data){
	const sql = 'SELECT * FROM utente WHERE id=$1';
	const values = [data.id];
	//console.log(data.id); mostra l'ultimo id inserito da form
	client.query(sql, values, (err, res) => {
	  if (err) {
		console.log(err.stack)
	  } else {
		console.log(res.rows)
	 }
	})
}

// consume messages from RabbitMQ
function consume({ connection, channel, resultsChannel }) {
  return new Promise((resolve, reject) => {
    channel.consume("processing.requests", async function (msg) {
      // parse message
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);
	  //console.log(data);
	  
	  //se c'è un campo op, non eseguo inserisci_db, altrimenti eseguo un'altra funzione (es. select di tutti i dati)
	  if(data.hasOwnProperty('op'))
	  {
		  if(data.op == "SELECT")
		  {
			console.log("ciaone");
		    //await channel.ack(msg);
			//console.log(data);
			//query db per selezione
			seleziona_dati(data);
		  }
		  if(data.op == "INSERT")
		  {
			  let requestId = data.requestId;
			  let requestData = data.requestData;
			  
			  //faccio query db per inserimento
			  await inserisci_db(requestData);

			  // process data
			  let processingResults = await processMessage(requestId);

			  // publish results to channel
			  await publishToChannel(resultsChannel, {
				exchangeName: "processing",
				routingKey: "result",
				data: { requestId, processingResults }
			  });
			  console.log("Published results for requestId:", requestId);
		  }
	  }

	  console.log("ACK Message")
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

// simulate data processing that takes 5 seconds
function processMessage(requestData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: requestData , status: "COMPLETED"})
    }, 5000);
  });
}

listenForMessages();
//client.end()
