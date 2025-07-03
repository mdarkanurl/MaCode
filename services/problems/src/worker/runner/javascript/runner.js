const fs = require('fs');

// Read user code
let userCode = fs.readFileSync('./user_code.js', 'utf-8');

// Read function name
const functionName = fs.readFileSync('./function_name.txt', 'utf-8').trim();

// Patterns for different function styles
const funcPattern = new RegExp(`function\\s+${functionName}\\s*\\(`);
const arrowPattern = new RegExp(`(const|let|var)\\s+${functionName}\\s*=\\s*`);
const assignPattern = new RegExp(`^${functionName}\\s*=\\s*`);

if (funcPattern.test(userCode)) {
  userCode = userCode.replace(
    funcPattern,
    `global.${functionName} = function(`
  );
} else if (arrowPattern.test(userCode)) {
  userCode = userCode.replace(
    arrowPattern,
    `global.${functionName} = `
  );
} else if (assignPattern.test(userCode)) {
  userCode = userCode.replace(
    assignPattern,
    `global.${functionName} = `
  );
}
eval(userCode);

// Read input from command line (as JSON string)
const input = JSON.parse(process.argv[2]);

// Call the function dynamically from global scope
const result = global[functionName](...input);

console.log(JSON.stringify(result)); 