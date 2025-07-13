import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import amqplib from "amqplib";
import { SubmitRepo } from "../../../repo";
import { prepareCodeWithBabel } from "./babel/prepareCodeWithBabel";
import { runDocker } from "../../utils/dockerRunner";

const submitRepo = new SubmitRepo();

export const JavaScript = async (
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
  const tempDir = path.join(__dirname, "temp", submissionUUID);
  fs.mkdirSync(tempDir, { recursive: true });

  const userCodePath = path.join(tempDir, "user_code.js");

  try {
    const rewrittenCode = prepareCodeWithBabel(data.code, data.functionName);
    fs.writeFileSync(userCodePath, rewrittenCode);
  } catch (e: any) {
    await submitRepo.update(data.submissionId, {
      status: "INVALID_FUNCTION_SIGNATURE",
      output: JSON.stringify({ error: e.message }),
    });
    channel.ack(msg);
    return;
  }

  fs.writeFileSync(path.join(tempDir, "function_name.txt"), data.functionName);
  fs.copyFileSync(path.resolve(__dirname, "../../runner/javascript/runner.js"), path.join(tempDir, "runner.js"));

  const testResults = [];

  for (const testCase of data.testCases) {
    try {
      const input = JSON.parse(testCase.input);
      const expected = JSON.parse(testCase.expected);

      const result = runDocker({
        image: "leetcode-js",
        command: ["timeout", "8s", "node", "runner.js", JSON.stringify(input)],
        mountDir: tempDir,
      });

      const actual = result.stdout?.trim();
      const stderr = result.stderr?.trim();

      let status = "PASSED";
      let passed = false;

      if (result.error) status = "EXECUTION_ERROR";
      else if (result.signal === "SIGTERM") status = "TIME_OUT";
      else {
        try {
          passed = JSON.stringify(actual) === JSON.stringify(expected);
          status = passed ? "PASSED" : "FAILED";
        } catch {
          status = "INVALID_JSON_OUTPUT";
        }
      }

      testResults.push({
        input: testCase.input,
        expected: testCase.expected,
        actual,
        error: stderr || result.error?.message || null,
        status,
        passed,
      });
    } catch (error: any) {
      testResults.push({
        input: testCase.input,
        expected: testCase.expected,
        actual: "",
        error: error.message,
        status: "INTERNAL_ERROR",
        passed: false,
      });
    }
  }

  const allPassed = testResults.every(t => t.passed);
  const hasFatal = testResults.some(t => ["EXECUTION_ERROR", "TIME_OUT", "INVALID_JSON_OUTPUT"].includes(t.status));

  await submitRepo.update(data.submissionId, {
    status: allPassed ? "ACCEPTED" : hasFatal ? "FAILED" : "WRONG_ANSWER",
    output: JSON.stringify(testResults),
  });

  fs.rmSync(tempDir, { recursive: true, force: true });
  channel.ack(msg);
};