const amqp = require('amqplib');

const run = async () => {
    const verbosityQueue = '/module/config/param/verbosity';
    const conn = await amqp.connect(`amqp://localhost:5672`);
    const ch = await conn.createChannel();
    ch.qos(1, true);
    await ch.assertQueue(verbosityQueue, { durable: true, });
    ch.sendToQueue(verbosityQueue, Buffer.from(JSON.stringify({
        verbosity: 2
    })));
    process.exit(1)
}

run();