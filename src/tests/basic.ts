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

  it("validated should not be available till validation completes", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    name.setValue('world');
    assert.equal(name.validated.valid, false);
  });

  it("validated should become available after validation", async () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    name.setValue('world');
    const res = await name.validate();
    assert.equal(name.validated.valid && name.validated.value, 'world');
  });
});
