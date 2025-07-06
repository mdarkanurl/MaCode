import { v4 as uuidv4 } from 'uuid';
import path from "path";
import amqplib from "amqplib";
import fs from "fs";
import { spawnSync } from "child_process";
import { SubmitRepo } from '../../../repo/submit-repo';

const submitRepo = new SubmitRepo();

const JavaScript = async (
    channel: amqplib.Channel,
    msg: amqplib.ConsumeMessage,
    data: {
        submissionId: number,
        functionName: string,
        testCases: any,
        code: string
    }
) => {
    // Create temp dir
    const submissionId = uuidv4();
    const tempDir = path.join(__dirname, 'temp', submissionId);
    fs.mkdirSync(tempDir, { recursive: true });
        
    // Save user code to temp dir
    const userCodePath = path.join(tempDir, 'user_code.js');
    fs.writeFileSync(userCodePath, data.code);
        
    // Save function name to temp dir
    const functionNamePath = path.join(tempDir, 'function_name.txt');
    fs.writeFileSync(functionNamePath, data.functionName);
        
    // Copy runner.js
    const runnerSrc = path.resolve(__dirname, '../../runner/javascript/runner.js');
    const runnerDest = path.join(tempDir, 'runner.js');
    fs.copyFileSync(runnerSrc, runnerDest);

    try {
        for (const test of data.testCases) {
            const input = test.input;
            const dockerArgs = [
                'run', '--rm',
                '-v', `${tempDir}:/app`,
                '--memory', '100m', '--cpus', '0.5',
                'leetcode-js',
                'node', 'runner.js', JSON.stringify(JSON.parse(input))
            ];

            const result = spawnSync(
                'docker',
                dockerArgs,
                {
                    cwd: tempDir, timeout: 10000, encoding: 'utf-8'
                }
            );

            // if return Execution Error
            if(result.error) {
                await submitRepo.update(
                    data.submissionId,
                    {
                        status: "EXECUTION_ERROR",

                    }
                );
                channel?.ack(msg);
                return;
            }

            // if return Timeout
            if(result.signal === "SIGTERM") {
                await submitRepo.update(
                    data.submissionId,
                    {
                        status: "TIME_OUT"
                    }
                );
                channel?.ack(msg);
                return;
            }

            const output = result.stdout.trim();
            const passed = JSON.stringify(JSON.parse(output)) === JSON.stringify(JSON.parse(test.expected));

            if(passed) {
                await submitRepo.update(
                    data.submissionId,
                    {
                        status: "ACCEPTED"
                    }
                );
                channel?.ack(msg);
                return;
            } else {
                await submitRepo.update(
                    data.submissionId,
                    {
                        status: "WRONG_ANSWER"
                    }
                );
                channel?.ack(msg);
                return;
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export {
    JavaScript
}