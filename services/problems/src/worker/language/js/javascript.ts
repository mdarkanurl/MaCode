import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";
import { SubmitRepo } from '../../../repo/submit-repo';
import amqplib from "amqplib";

const submitRepo = new SubmitRepo();

const JavaScript = async (
    channel: amqplib.Channel,
    msg: amqplib.ConsumeMessage,
    data: {
        submissionId: number,
        functionName: string,
        testCases: any[],
        code: string
    }
) => {
    const submissionUUID = uuidv4();
    const tempDir = path.join(__dirname, 'temp', submissionUUID);
    fs.mkdirSync(tempDir, { recursive: true });

    const userCodePath = path.join(tempDir, 'user_code.js');
    fs.writeFileSync(userCodePath, data.code);

    const functionNamePath = path.join(tempDir, 'function_name.txt');
    fs.writeFileSync(functionNamePath, data.functionName);

    const runnerSrc = path.resolve(__dirname, '../../runner/javascript/runner.js');
    const runnerDest = path.join(tempDir, 'runner.js');
    fs.copyFileSync(runnerSrc, runnerDest);

    const testResults = [];

    try {
        for (const testCase of data.testCases) {
            const inputStr = testCase.input;
            const expectedStr = testCase.expected;

            const dockerArgs = [
                'run', '--rm',
                '-v', `${tempDir}:/app`,
                '--memory', '100m', '--cpus', '0.5',
                'leetcode-js',
                'timeout', '8s',
                'node', 'runner.js', JSON.stringify(JSON.parse(inputStr))
            ];

            const result = spawnSync('docker', dockerArgs, {
                cwd: tempDir,
                timeout: 10000,
                encoding: 'utf-8'
            });

            const stdout = result.stdout?.trim() || '';
            const stderr = result.stderr?.trim() || '';
            let passed = false;
            let status = 'PASSED';

            if (result.error) {
                status = 'EXECUTION_ERROR';
            } else if (result.signal === 'SIGTERM') {
                status = 'TIME_OUT';
            } else {
                try {
                    const expected = JSON.parse(expectedStr);
                    const actual = JSON.parse(stdout);
                    passed = JSON.stringify(expected) === JSON.stringify(actual);
                    status = passed ? 'PASSED' : 'FAILED';
                } catch (e) {
                    status = 'INVALID_JSON_OUTPUT';
                }
            }

            testResults.push({
                input: inputStr,
                expected: expectedStr,
                actual: stdout,
                error: stderr || (result.error?.message ?? null),
                status,
                passed
            });
        }

        const allPassed = testResults.every(test => test.passed);
        const hasFatalError = testResults.some(test =>
            ['EXECUTION_ERROR', 'TIME_OUT', 'INVALID_JSON_OUTPUT'].includes(test.status)
        );

        const finalStatus = allPassed
            ? 'ACCEPTED'
            : hasFatalError
                ? 'FAILED'
                : 'WRONG_ANSWER';

        await submitRepo.update(data.submissionId, {
            status: finalStatus,
            output: JSON.stringify(testResults)
        });

        channel?.ack(msg);
    } catch (error: any) {
        console.error("Unhandled error:", error);
        await submitRepo.update(data.submissionId, {
            status: 'INTERNAL_ERROR',
            output: JSON.stringify({ error: error.message || error.toString() })
        });
        channel?.ack(msg);
    } finally {
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (err) {
            console.error("Failed to clean up temp directory:", err);
        }
    }
};

export {
    JavaScript
};
