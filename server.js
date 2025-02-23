const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
const express = require("express")
const app = express()
app.use(express.json())
const LANGUAGES = {
  python: {
    extension: 'py',
    runCmd: file => `python ${file}<input.txt`
  },
  javascript: {
    extension: 'js',
    runCmd: file => `node ${file}<input.txt`
  },
  java: {
    extension: 'java',
    runCmd: file => `javac ${file} && java ${file.replace('.java', '<input.txt')}`
  },
  cpp: {
    extension: 'cpp',
    runCmd: file => `g++ ${file} -o code && ./code < input.txt`
  }
};


async function runCode(language, code, input) {
  if (!LANGUAGES[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const config = LANGUAGES[language];
  const fileName = `code.${config.extension}`;

  try {
    // Write code to file
    await fs.writeFile(fileName, code)
    await fs.writeFile("input.txt",input)
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

app.post("/run",async (req,res) => {
    const {language,code,input} = req.body
    const  result = await runCode(language,code,input)
    const newr = result.replace(/File "(?:D:\\Software Development\\coderunner_docker_backend|\/opt\/render\/project\/src)\/code\.[a-z]+", /g, "","")
    res.json({output:newr})
})

app.listen(3000,()=>{
    console.log("Running on port 3000")
})
