import { FieldState, FormState } from '../index';
import * as assert from 'assert';
import { delay } from './utils';

describe('automatic validation delay', () => {
  it("If delay is low it should autovalidate fast", async () => {
    const name = new FieldState<string>({
      value: 'hello',
      autoValidationDebounceMs: 100
    });
    name.onChange('world');
    await delay(200);
    assert.equal(name.validated.valid && name.validated.value, 'world');
  });

  it("if delay is big it should autovalidate fast", async () => {
    const name = new FieldState<string>({
      value: 'hello',
      autoValidationDebounceMs: 200
    });
    name.onChange('world');
    await delay(100);
    assert.equal(name.validated.valid, false);
  });

  it("default delay value should also work", async () => {
    const name = new FieldState<string>({
      value: 'hello',
    });
    name.onChange('world');
    await delay(100);
    assert.equal(name.validated.valid, false);
    await delay(200);
    assert.equal(name.validated.valid && name.validated.value, 'world');
  });
});

describe('automatic validation toggling', () => {
  it("disabled auto validation should disable", async () => {
    const name = new FieldState<string>({
      value: 'hello',
      autoValidationDebounceMs: 100,
      autoValidationEnabled: false
    });
    name.onChange('world');
    assert.equal(name.validated.valid, false);
    await delay(200);
    assert.equal(name.validated.valid, false);
  });

  it("disabled auto validation should disable", async () => {
    const name = new FieldState<string>({
      value: 'hello',
      autoValidationDebounceMs: 100,
      autoValidationEnabled: true
    });
    name.onChange('world');
    assert.equal(name.validated.valid, false);
    await delay(200);
    assert.equal(name.validated.valid && name.validated.value, 'world');
  });
});
