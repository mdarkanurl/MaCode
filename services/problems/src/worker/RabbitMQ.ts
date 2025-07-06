import amqplib from "amqplib";
import express from "express";
import { JavaScript } from "./language/js/javascript";
const app = express();

async function sendMessage() {
    const queue = 'problems';

    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });

    channel.consume(queue, async (msg: amqplib.ConsumeMessage | null) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());

            if(data.language === 'javascript') {
                JavaScript(
                    channel, msg,
                    {
                        submissionId: data.submissionId,
                        functionName: data.functionName,
                        testCases: data.testCases,
                        code: data.code
                    }
                );
            }
        } else {
            console.log('Consumer cancelled by server');
        }
    });
}

app.get('/send', async (req, res) => {
  try {
    res.status(200).send('Message sent to the queue');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Failed to send message');
  }
});

app.listen(3001, async () => {
  console.log('Server is running on port 3001');
  await sendMessage();
  console.log('Message sender initialized');
});
