const assert = require('assert').strict;
const process = require('process');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const colors = require('colors');
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

const loopDir = async (dir, cb) => {
  const files = await fse.readdir(dir);
  await Promise.all(
    files.map(async file => {
      const fullPath = path.join(dir, file);
      const stat = await fse.stat(fullPath);
      if (!stat.isFile()) return await loopDir(fullPath, cb);
      cb(fullPath, stat);
    })
  );
};

const getDirFiles = async dir => {
  const files = [];
  await loopDir(dir, file => files.push(file));
  return files;
};

let isWatch = false;

const x = {};
x.cli = {
  async run(args) {
    const matchWord = args[2] || '';
    const cwd = process.cwd();

    // 监听目录变化
    if (!isWatch) {
      console.log(`Start watch dir: ${cwd}`.info);
      fs.watch(cwd, { recursive: true }, (eventType, filename) => {
        isWatch = true;
        delete require.cache[path.join(cwd, filename)];
        console.log(`\r\n\r\n===${filename} ${eventType}, restart all tests.`.warn);
        this.run(args);
      });
    }

    // 获取测试目录所有文件
    const testDir = path.join(cwd, 'test');
    const testFiles = await getDirFiles(testDir);
    for (let i = 0; i < testFiles.length; i++) {
      const file = testFiles[i];
      const base = path.basename(file);
      if (!base.match(/\.test\.js$/)) continue;
      if (matchWord) {
        if (base.indexOf(matchWord) === -1) continue;
      }
      console.log(`Run test file: ${file}`.info);
      try {
        // 删除缓存的模块
        delete require.cache[file];
        const test = require(file);
        let start = 0;
        await test(log => {
          if (start) {
            console.log(`    cost: ${Date.now() - start}ms.`);
          }
          start = Date.now();
          console.log(`    test: ${log}`.data);
        }, assert);
        if (start) {
          console.log(`    cost: ${Date.now() - start}ms.`);
        }
      } catch (e) {
        console.log(e.stack);
      }
    }
    console.log('Done, all tests passed.'.info);
  }
};

module.exports = x;
