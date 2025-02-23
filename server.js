const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
const express = require("express")
// Language configurations (without Docker)
const app = express()
const LANGUAGES = {
  python: {
    extension: 'py',
    runCmd: file => `python ${file}`
  },
  javascript: {
    extension: 'js',
    runCmd: file => `node ${file}`
  },
  java: {
    extension: 'java',
    runCmd: file => `javac ${file} && java ${file.replace('.java', '')}`
  },
  cpp: {
    extension: 'cpp',
    runCmd: file => `g++ ${file} -o code && ./code`
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

    // Execute code directly (without Docker)
    const output = await new Promise((resolve, reject) => {
      exec(config.runCmd(fileName), { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          reject(`Execution Error: ${stderr || error.message}`);
          return;
        }
        resolve(stdout);
      });
    });

    return output;
  } catch (error) {
    return `Error: ${error}`;
  } finally {
    // Cleanup
    await fs.unlink(fileName).catch(() => {});
  }
}

// Example usage
async function example() {
  console.log('Running Python code:');
  const pythonResult = await runCode('python', `print("Hello from Python!")`);
  console.log(pythonResult);
  return pythonResult
}
app.get("/",async (req,res)=>{
    const resp = await example()
    console.log(resp)
    res.json({output:resp})
})
app.listen(3000,()=>{
    console.log("Running on port 3000")
})
// example();
