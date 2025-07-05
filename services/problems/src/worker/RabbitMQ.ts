// import amqplib from "amqplib";
// import { v4 as uuidv4 } from 'uuid';
// import path from "path";
// import fs from "fs";
// import { spawnSync } from "child_process";
// import { prisma } from "../prisma";

// let channel: amqplib.Channel | null;
// const queue = 'problems';

// async function connect() {
//   const conn = await amqplib.connect('amqp://localhost');

//   channel = await conn.createChannel();
//   await channel.assertQueue(queue, { durable: true });
// }

// async function consumeData() {
//     channel?.consume(queue, async (msg: amqplib.ConsumeMessage | null) => {
//         console.log('Data is here ', msg?.content.toString());
//         if (msg !== null) {
//             const data = JSON.parse(msg.content.toString());

//             // Create temp dir
//             const submissionId = uuidv4();
//             const tempDir = path.join(__dirname, 'temp', submissionId);
//             fs.mkdirSync(tempDir, { recursive: true });

//             // Save user code to temp dir
//             const userCodePath = path.join(tempDir, 'user_code.py');
//             fs.writeFileSync(userCodePath, data.solution);

//             // Save function name to temp dir
//             const functionNamePath = path.join(tempDir, 'function_name.txt');
//             fs.writeFileSync(functionNamePath, data.functionName);

//             // Copy runner.js
//             const runnerSrc = path.resolve(__dirname, './runner/javascript/runner.js');
//             const runnerDest = path.join(tempDir, 'runner.js');
//             fs.copyFileSync(runnerSrc, runnerDest);

//             try {
//                 for (const test of data.testCases) {
//                     // Always pass input as a JSON array or string
//                     const input = test.input;
//                     const dockerArgs = [
//                         'run', '--rm',
//                         '-v', `${tempDir}:/app`,
//                         '--memory', '100m', '--cpus', '0.5',
//                         'leetcode-js',
//                         'node', 'runner.js', JSON.stringify(JSON.parse(input))
//                     ];

//                     const result = spawnSync('docker', dockerArgs, { cwd: tempDir, timeout: 10000, encoding: 'utf-8' });

//                     // if return Execution Error
//                     if(result.error) {
//                         await prisma.submit.create({
//                             data: {
//                                 userId: data.userId,
//                                 problemId: data.problemId,
//                                 status: "Execution Error",
//                                 language: data.language,
//                                 solution: data.solution
//                             }
//                         });
//                         channel?.ack(msg);
//                         return;
//                     }

//                     // if return Abnormal Exit
//                     if (result.status !== 0) {
//                         await prisma.submit.create({
//                             data: {
//                                 userId: data.userId,
//                                 problemId: data.problemId,
//                                 status: "Abnormal Exit",
//                                 language: data.language,
//                                 solution: data.solution
//                             }
//                         });
//                         channel?.ack(msg);
//                         return;
//                     }

//                     // if return Timeout
//                     if(result.signal === "SIGTERM") {
//                         await prisma.submit.create({
//                             data: {
//                                 userId: data.userId,
//                                 problemId: data.problemId,
//                                 status: "Timeout",
//                                 language: data.language,
//                                 solution: data.solution
//                             }
//                         });
//                         channel?.ack(msg);
//                         return;
//                     }

//                     const output = result.stdout.trim();
//                     const passed = JSON.stringify(JSON.parse(output)) === JSON.stringify(JSON.parse(test.expected));


//                     if(passed) {
//                         await prisma.submit.create({
//                             data: {
//                                 userId: data.userId,
//                                 problemId: data.problemId,
//                                 status: "Correct solution",
//                                 language: data.language,
//                                 solution: data.solution
//                             }
//                         });
//                         channel?.ack(msg);
//                         return;
//                     } else {
//                         await prisma.submit.create({
//                             data: {
//                                 userId: data.userId,
//                                 problemId: data.problemId,
//                                 status: "Incorrect solution",
//                                 language: data.language,
//                                 solution: data.solution
//                             }
//                         });
//                         channel?.ack(msg);
//                         return;
//                     }
//                 }
//             } catch (error) {
//                 console.log(error);
//             }
            
//         }
//     });
// }

// export {
//     connect,
//     consumeData
// }