const util = require('./util');
module.exports = async (x, assert) => {
  x('util.assign');
  const a = util.assign({}, { name: 'hi' });
  assert.deepEqual(a, { name: 'hi' });
  assert.deepEqual(a, { name: 'hi' });

  x('util.test');
};
