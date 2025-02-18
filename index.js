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
  node: {
    image: 'node:16-slim',
    extension: 'js',
    runCmd: file => `node ${file}`
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
    // await fs.unlink(fileName).catch(() => {});
  }
}

// Example usage
async function example() {
  // Python example
  console.log('Running Python code:');
  const pythonResult = await runCode('python', `print(list(f"{x} is {'even' if x%2==0 else 'odd'} and {'prime' if x>1 and all(x%i!=0 for i in range(2, int(x**0.5)+1)) else 'not prime'}" for x in map(int, input("Enter numbers separated by space: ").split())))
`);
  console.log(pythonResult);

  // Node.js example
  // console.log('\nRunning Node.js code:');
  // const nodeResult = await runCode('node', 'console.log("Hello from Node.js!")');
  // console.log(nodeResult);
}

example();