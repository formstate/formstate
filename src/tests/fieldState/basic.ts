import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { configure } from "mobx";

configure({
  enforceActions: true
});

describe("FieldState basic", () => {
  it("hotValue and safeValue is set to initial value", () => {
    const name = new FieldState('hello')
    assert.equal(name.value, 'hello');
    assert.equal(name.$, 'hello');
  });

  it("no validation should keep hasBeenValidated false", () => {
    const name = new FieldState('hello')
    assert.equal(name.hasBeenValidated, false);
  });

  it("validating changes hasBeenValidated to true", async () => {
    const name = new FieldState('hello')
    name.onChange('world')
    await name.validate()
    assert.equal(name.hasBeenValidated, true);
  });

  it("reset changes hasBeenValidated to false", () => {
    const name = new FieldState('world')
    name.reset('world')
    assert.equal(name.hasBeenValidated, false)
  })

  it("reset should change the value immediately", () => {
    const name = new FieldState('hello')
    name.reset('world')

    assert.equal(name.value, 'world');
    assert.equal(name.$, 'world');
    assert.equal(name.hasBeenValidated, false);
  });

  it("reset should prevent any automatic validation from running", async () => {
    const name = new FieldState('').validators(
        (val) => !val && 'value required'
    );
    name.onChange('world');
    name.reset('');
    await delay(300);
    assert.equal(name.hasError, false);
    assert.equal(name.value, '');
    assert.equal(name.$, '');
    assert.equal(name.hasBeenValidated, false);
  });

  it("reset followed by onChange should run validators", async () => {
    const name = new FieldState('').validators(
        (val) => !val && 'value required'
    );
    name.onChange('world');
    name.reset('');
    name.onChange('');
    await delay(300);
    assert.equal(name.hasError, true);
    assert.equal(name.value, '');
    assert.equal(name.$, '');
  });

  it("reset followed by validate should still validate", async () => {
    const name = new FieldState('').validators(
        (val) => !val && 'value required'
    );
    name.onChange('world');
    name.reset('');
    const res = await name.validate();
    assert.equal(res.hasError, true);
    assert.equal(name.value, '');
    assert.equal(name.$, '');
  });

  it("should chain async validator promise rejection", async () => {
    const name = new FieldState('').validators(
      async () => {
        throw new Error("Async validation error")
      }
    );
    let error: Error
    try {
      await name.validate();
    } catch (e) {
      error = e
    }
    assert.equal(error!.message, "Async validation error")
  });
});
