import model from './model';
module.exports = (it, assert) => {
  it('test model');
  const name = model.testMode('test');
  assert.equal(name, 'test');
};
