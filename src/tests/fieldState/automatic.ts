import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';

describe('automatic validation delay', () => {
  it("If delay is low it should autovalidate fast", async () => {
    const name = new FieldState({
      value: 'hello',
      autoValidationDebounceMs: 100
    });
    name.onHotChange('world');
    await delay(200);
    assert.equal(name.safeValue, 'world');
  });

  it("if delay is big it should autovalidate fast", async () => {
    const name = new FieldState({
      value: 'hello',
      autoValidationDebounceMs: 200
    });
    name.onHotChange('world');
    await delay(100);
    assert.equal(name.safeValue, 'hello');
  });

  it("default delay value should also work", async () => {
    const name = new FieldState({
      value: 'hello',
    });
    name.onHotChange('world');
    await delay(100);
    assert.equal(name.safeValue, 'hello');
    await delay(200);
    assert.equal(name.safeValue, 'world');
  });
});

describe('automatic validation toggling', () => {
  it("by default its enabled", async () => {
    const name = new FieldState({
      value: 'hello',
      autoValidationDebounceMs: 100,
    });
    name.onHotChange('world');
    assert.equal(name.safeValue, 'hello');
    await delay(200);
    assert.equal(name.safeValue, 'world');
  });

  it("disabled auto validation should disable", async () => {
    const name = new FieldState({
      value: 'hello',
      autoValidationDebounceMs: 100,
      autoValidationEnabled: false
    });
    name.onHotChange('world');
    assert.equal(name.safeValue, 'hello');
    await delay(200);
    assert.equal(name.safeValue, 'hello');
  });

  it("enabled auto validation should enable", async () => {
    const name = new FieldState({
      value: 'hello',
      autoValidationDebounceMs: 100,
      autoValidationEnabled: true
    });
    name.onHotChange('world');
    assert.equal(name.safeValue, 'hello');
    await delay(200);
    assert.equal(name.safeValue, 'world');
  });
});
