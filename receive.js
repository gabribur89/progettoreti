#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://192.168.99.100', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
		
		//nome coda dove il plugin di postgres esegue notifica
        var queue = 'notifications-test';

        channel.assertQueue(queue, {
            durable: true
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
			var abbonato = JSON.parse(msg.content.toString());
            console.log(" [x] Received %s", msg.content.toString());
			console.log(abbonato.id);
        }, {
            noAck: true
        });
    });
});