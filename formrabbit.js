var http = require("http");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

var amqp = require('amqplib/callback_api');

// Running Server Details.
var server = app.listen(8082, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at %s:%s Port", host, port)
});

function mettiinCoda(messaggio){
	amqp.connect('amqp://192.168.99.100', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'hello';
		
        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(messaggio));

        console.log(" [x] Sent %s", messaggio);
    });
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});
}

// funzione asincrona che è in ascolto sulla coda di ricezione
async function listenForResults() {
  // connect to Rabbit MQ
  let connection = await amqp.connect('amqp://192.168.99.100');

  var reply_queue = 'reply';

  // create a channel and prefetch 1 message at a time
  let channel = await connection.createChannel('amqp://192.168.99.100');
  await channel.prefetch(1);

  // start consuming messages
  await consume({ connection, channel });
}


app.get('/form', function (req, res) {
  var html='';
  html +="<body>";
  html += "<form action='/thank'  method='post' name='form1'>";
  html += "Name:</p><input type= 'text' name='name'>";
  html += "Email:</p><input type='text' name='email'>";
  html += "address:</p><input type='text' name='address'>";
  html += "Mobile number:</p><input type='text' name='mobilno'>";
  html += "<input type='submit' value='submit'>";
  html += "<INPUT type='reset'  value='reset'>";
  html += "</form>";
  html += "</body>";
  res.send(html);
});
 
app.post('/thank', urlencodedParser, function (req, res){
  /*var reply='';
  reply += "Your name is" + req.body.name;
  reply += "Your E-mail id is" + req.body.email; 
  reply += "Your address is" + req.body.address;
  reply += "Your mobile number is" + req.body.mobilno;
  res.send(reply);*/
  mettiinCoda('saddsdssd');
 });
 
