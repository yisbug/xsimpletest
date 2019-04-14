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
    if (matchWord === '--help') {
      console.log(`Useage`.yellow);
      console.log(
        `
x $word // 匹配 test 目录下 $word.test.js
x // 执行 test 目录下所有 $.test.js\r\n`.info
      );
      console.log(`Assert 断言模块 API：`.yellow);
      console.log(
        `
assert(value[, message])
assert.deepEqual(actual, expected[, message])
assert.deepStrictEqual(actual, expected[, message])
assert.doesNotReject(asyncFn[, error][, message])
assert.doesNotThrow(fn[, error][, message])
assert.equal(actual, expected[, message])
assert.fail([message])
assert.fail(actual, expected[, message[, operator[, stackStartFn]]])
assert.ifError(value)
assert.notDeepEqual(actual, expected[, message])
assert.notDeepStrictEqual(actual, expected[, message])
assert.notEqual(actual, expected[, message])
assert.notStrictEqual(actual, expected[, message])
assert.ok(value[, message])
assert.rejects(asyncFn[, error][, message])
assert.strictEqual(actual, expected[, message])
assert.throws(fn[, error][, message])`.info
      );
      return;
    }

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
        let test = require(file);
        if (test.default) test = test.default;
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
