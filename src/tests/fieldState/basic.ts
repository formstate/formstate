import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';

describe("basic FieldState tests", () => {
  it("hotValue and safeValue is set to initial value", () => {
    const name = new FieldState({
      value: 'hello',
    })
    assert.equal(name.hotValue, 'hello');
    assert.equal(name.safeValue, 'hello');
  });

  it("reinitValue should change the value immediately", () => {
    const name = new FieldState({
      value: 'hello',
    })
    name.reinitValue('world')
    assert.equal(name.hotValue, 'world');
    assert.equal(name.safeValue, 'world');
  });
});
