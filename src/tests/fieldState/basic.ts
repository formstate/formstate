import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';

describe("basic FieldState tests", () => {
  it("hotValue and safeValue is set to initial value", () => {
    const name = new FieldState({
      value: 'hello',
    })
    assert.equal(name.value, 'hello');
    assert.equal(name.$, 'hello');
  });

  it("reinitValue should change the value immediately", () => {
    const name = new FieldState({
      value: 'hello',
    })
    name.reinitValue('world')
    assert.equal(name.value, 'world');
    assert.equal(name.$, 'world');
  });

  it("reinitValue should prevent any validation from running", async () => {
    const name = new FieldState({
      value: '',
      validators: [
        (val) => !val && 'value required'
      ]
    });
    name.onChange('world');
    name.reinitValue('');
    await delay(200);
    assert.equal(name.hasError, false);
    assert.equal(name.value, '');
    assert.equal(name.$, '');
  });

  it("reinitValue followed by onChange should run validators", async () => {
    const name = new FieldState({
      value: '',
      validators: [
        (val) => !val && 'value required'
      ]
    });
    name.onChange('world');
    name.reinitValue('');
    name.onChange('');
    await delay(200);
    assert.equal(name.hasError, true);
    assert.equal(name.value, '');
    assert.equal(name.$, '');
  });
});
