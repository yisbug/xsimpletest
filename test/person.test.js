import person from './person';

const test = async (it, assert) => {
  it('babel person getName');
  const name = await person.getName('yisbug');
  console.log('name1', name);
};

export default test;
