import { exec } from "child_process";
import path from "path";

/**
 * Runs user code in a Docker container and returns the result.
 * @param tempDir The directory where user_code.py is saved.
 * @param expectedOutput The output you expect from the user's code.
 * @returns A Promise with the result object.
 */
function runUserCodeInDocker(tempDir: string, expectedOutput: string): Promise<{status: string, output: string, error?: string}> {
    return new Promise((resolve) => {
        // Use absolute path for tempDir
        const absTempDir = path.resolve(tempDir);
        const dockerCmd = `docker run --rm -v "${absTempDir}:/code" python:3.10 python /code/user_code.py`;

        exec(dockerCmd, (error, stdout, stderr) => {
            if (error) {
                resolve({ status: "error", output: stderr || error.message });
            } else if (stdout === expectedOutput) {
                resolve({ status: "correct", output: stdout });
            } else {
                resolve({ status: "incorrect", output: stdout });
            }
        });
    });
}

export {
    runUserCodeInDocker
}