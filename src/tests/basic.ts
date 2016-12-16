import { FieldState, FormState } from '../index';
import * as assert from 'assert';

describe("initial test", () => {
  it("should pass", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    assert.equal(name.value, 'hello');
  });

  it("setValue should change the value immediately", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    name.setValue('world')
    assert.equal(name.value, 'world');
  });

  it("setValue should change the value immediately", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    name.setValue('world')
    assert.equal(name.value, 'world');
  });
});
