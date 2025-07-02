import amqplib from "amqplib";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";
import { runUserCodeInDocker } from "./run-code";

let channel: amqplib.Channel | null;
const queue = 'problems';

async function connect() {
  const conn = await amqplib.connect('amqp://localhost');

  channel = await conn.createChannel();
  await channel.assertQueue(queue, { durable: false });
}

async function consumeData() {
    channel?.consume(queue, async (msg: amqplib.ConsumeMessage | null) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            // console.log('Received:', msg.content.toString());

            // Create temp dir
            const submissionId = uuidv4();
            const tempDir = path.join(__dirname, 'temp', submissionId);
            fs.mkdirSync(tempDir, { recursive: true });

            // Save user code to temp dir
            const userCodePath = path.join(tempDir, 'user_code.py');
            fs.writeFileSync(userCodePath, data.solution || '');

            const results = [];
            for (let i = 0; i < data.problem.testCases.length; i++) {
                const testCase = data.problem.testCases[i];
                // Save input to file if needed (not used in current Docker command)
                // const inputPath = path.join(tempDir, `input_${i}.txt`);
                // fs.writeFileSync(inputPath, testCase.input);
                const result = await runUserCodeInDocker(tempDir, testCase.output);
                results.push({
                    testCase: i + 1,
                    status: result.status,
                    output: result.output,
                    error: result.error || null
                });
            }
            // Clean up temp dir if needed
            // fs.rmSync(tempDir, { recursive: true, force: true });
            // Optionally: send results back to another queue or log them
            channel?.ack(msg);
        }
    });
}

export {
    connect,
    consumeData
}