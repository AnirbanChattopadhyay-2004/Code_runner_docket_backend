const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');

// Language configurations
const LANGUAGES = {
  python: {
    image: 'python:3.10-slim',
    extension: 'py',
    runCmd: file => `python ${file}`
  },
  javascript: {
    image: 'node:16-slim',
    extension: 'js',
    runCmd: file => `node ${file}`
  },
  java:{
    image: 'openjdk:21-jdk-slim',
    extension: 'java',
    runCmd: file => `javac ${file} && java ${file}`
  },
  cpp:{
    image: 'gcc:latest',
    extension: 'cpp',
    runCmd: file => `gcc ${file} -o code && ./code`
  }
};

async function runCode(language, code) {
  if (!LANGUAGES[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const config = LANGUAGES[language];
  const fileName = `code.${config.extension}`;
  
  try {
    // Write code to file
    await fs.writeFile(fileName, code);

    // Create docker command
    // console.log(path.resolve(fileName))
    const dockerCmd = `docker run --rm -i\
      --network none \
      -v "${path.resolve(fileName)}:/app/${fileName}" \
      -w /app \
      ${config.image} \
      ${config.runCmd(fileName)} < input.txt`;

    // Execute code
    const output = await new Promise((resolve, reject) => { 
      exec(dockerCmd, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return; 
        }
        resolve(stdout);
      }); 
    });

    return output;

  } catch (error) {
    return `Error: ${error.message}`;
  } finally {
    // Cleanup
    await fs.unlink(fileName).catch(() => {});
  }
}

// Example usage
async function example() {
  // Python example
  console.log('Running Python code:');
  const pythonResult = await runCode('python', `print("Hello from Python!")`);
  console.log(pythonResult);

  // Node.js example
  // console.log('\nRunning Node.js code:');
  // const nodeResult = await runCode('node', 'console.log("Hello from Node.js!")');
  // console.log(nodeResult);
}

example();