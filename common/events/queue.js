const amqp = require('amqplib');
const listener = require("../../libaries/listener");

let channel, connection;
const QUEUE = 'TestQueue';


async function init(){
  try{
    const amqpServer = process.env.NODE_ENV === 'development' ? process.env.AMQPSERVER_LOCAL : process.env.AMQPSERVER_ONLINE;
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
  }catch(error){
    console.error(error);
  }
}

exports.produce = async (data) => {
    await init();
    await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(data)));
}

exports.consume = async () => {
    await init();
    await channel.consume(QUEUE, data => {
        const message = JSON.parse(data.content.toString());
        channel.ack(data);
        listener(message);
      });
}

function parseMessage(msg) {
  const data = msg.getData();
  return typeof data === 'string'
    ? JSON.parse(data)
    : JSON.parse(data.toString('utf8'));
}
