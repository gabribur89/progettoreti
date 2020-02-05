//configure the DB
const { Client, Pool} = require('pg')

const client = new Client({
user: 'postgres',
host: 'localhost',
database: 'test',
password: 'postgres',
port: 5432,
})

const amqp = require('amqplib');

// connect to the DB
client.connect()

// RabbitMQ connection string
const messageQueueConnectionString = 'amqp://';

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

// this is where a message data is insertend into the DB
function insert_user(data){
	console.log(data)
	const sql = 'INSERT INTO utente(nome, cognome, cf, telefono, datanascita, indirizzo, citta, cap, tipo, durata, dataiscrizione) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *'
	const values = [data.nome,data.cognome,data.cf,data.telefono,data.datanascita,data.indirizzo,data.citta,data.cap,data.tipo,data.abbonamento,data.dataiscrizione]
		client.query(sql, values, (err, res) => {
		  if (err) {
			//console.log("query error")
			console.log(err.stack);
			//throw new Error('Database insert operation error!');
		  } else {
			console.log(res.rows[0]);
   		 }
		})
}

function select_user_data(data){
	const sql = 'SELECT * FROM utente WHERE id=$1';
	const values = [data.id];
	//console.log(data.id); mostra l'ultimo id inserito da form
	client.query(sql, values, (err, res) => {
	  if (err) {
		console.log(err.stack)
		throw new Error('Database operation error!');
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
	  
	  //check if 'op' propoerty is present 
	  if(data.hasOwnProperty('op'))
	  {
		  if(data.op == "SELECT")
		  {
			select_user_data(data);
		  }
		  if(data.op == "INSERT")
		  {
			  let requestId = data.requestId;
			  let requestData = data.requestData;

			  // process data
			  let processingResults = await processMessage(requestId, requestData);

			  // publish results to channel
			  await publishToChannel(resultsChannel, {
				exchangeName: "processing",
				routingKey: "result",
				data: { requestId, processingResults }
			  });
			  console.log("Published results for requestId:", requestId);
		  }
	  }

	  // confirm message was processed 
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

// wait 2 secs otherwise user insertion is too fast 
function processMessage(req_id , userData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
	  // insert user data into the DB
 	  insert_user(userData);
      resolve({ id: req_id , status: "COMPLETED"})
    }, 2000);
  });
}

listenForMessages();
//client.end()
