### x

简单的测试工具。

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
