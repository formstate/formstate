import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';

describe("initial test", () => {
  it("should pass", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    assert.equal(name.value, 'hello');
  });

  it("reinitValue should change the value immediately", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    name.reinitValue('world')
    assert.equal(name.value, 'world');
  });

  it("reinitValue should change the value immediately", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    name.reinitValue('world')
    assert.equal(name.value, 'world');
  });

  it("validated should not be available till validation completes", () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    assert.equal(name.validated.valid, false);
  });

  it("validated should become available after validation", async () => {
    const name = new FieldState<string>({
      value: 'hello',
    })
    const res = await name.validate();
    assert.equal(name.validated.valid && name.validated.value, 'hello');
  });
});
