### x

简单的测试工具。

### Why

实在记不住这些主流的测试框架的用法，我只想像写普通的模块一样写一些测试，简单的验证一些方法是否有效，so，只支持了一些有限的但是个人比较常用的功能。

包括断言库的 api 其实我也记不住，所以可以使用 `x --help` 列出断言库的所有 API，看到名字大概就知道怎么用了。

有空的话再增加一些其他功能和配置，先这么凑合着。

### Useage

```js
// util.test.js
const assert = require('assert').strict;
module.exports = async (it, assert) => {
  it('util.assign');
  const a = util.assign({}, { name: 'hi' });
  assert.deepEqual(a, { name: 'hi' });

  it('util.test');
};

// run util.test.js
x util
x ut // use regexp to match test files.
// run all test
x
```

### License

MIT