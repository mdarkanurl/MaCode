const fs = require('fs');

let userCode = fs.readFileSync('./user_code.js', 'utf-8');
const functionName = fs.readFileSync('./function_name.txt', 'utf-8').trim();

const funcPattern = new RegExp(`function\\s+${functionName}\\s*\\(`);
const arrowPattern = new RegExp(`(const|let|var)\\s+${functionName}\\s*=\\s*`);
const assignPattern = new RegExp(`^${functionName}\\s*=\\s*`);

if (funcPattern.test(userCode)) {
  userCode = userCode.replace(funcPattern, `global.${functionName} = function(`);
} else if (arrowPattern.test(userCode)) {
  userCode = userCode.replace(arrowPattern, `global.${functionName} = `);
} else if (assignPattern.test(userCode)) {
  userCode = userCode.replace(assignPattern, `global.${functionName} = `);
}

try {
  eval(userCode);
} catch (e) {
  const error = {
    type: "SYNTAX_ERROR",
    message: e.message,
    stack: e.stack
  };
  console.error(JSON.stringify(error));
  process.exit(1);
}

try {
  const input = JSON.parse(process.argv[2]);
  const result = global[functionName](input);
  console.log(JSON.stringify(result));
} catch (e) {
  const error = {
    type: "RUNTIME_ERROR",
    message: e.message,
    stack: e.stack
  };
  console.error(JSON.stringify(error));
  process.exit(1);
}