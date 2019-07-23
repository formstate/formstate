import { FieldState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { configure } from 'mobx';

configure({
  enforceActions: true
});

describe('FieldState automatic validation', () => {
  it("If delay is low it should autovalidate fast", async () => {
    const name = new FieldState('hello').setAutoValidationDebouncedMs(100);
    name.onChange('world');
    await delay(300);
    assert.equal(name.$, 'world');
  });

  it("if delay is big it should autovalidate fast", async () => {
    const name = new FieldState('hello').setAutoValidationDebouncedMs(200);
    name.onChange('world');
    await delay(100);
    assert.equal(name.$, 'hello');
  });

  it("default delay value should also work", async () => {
    const name = new FieldState('hello');
    name.onChange('world');
    await delay(100);
    assert.equal(name.$, 'hello');
    await delay(200);
    assert.equal(name.$, 'world');
  });
});

describe('automatic validation toggling', () => {
  it("by default its enabled", async () => {
    const name = new FieldState('hello');
    name.onChange('world');
    assert.equal(name.$, 'hello');
    await delay(300);
    assert.equal(name.$, 'world');
  });

  it("disabled auto validation should disable", async () => {
    const name = new FieldState('hello').setAutoValidationDebouncedMs(100).disableAutoValidation();
    name.onChange('world');
    assert.equal(name.$, 'hello');
    await delay(300);
    assert.equal(name.$, 'hello');
  });

  it("enabled auto validation should enable", async () => {
    const name = new FieldState('hello').setAutoValidationDebouncedMs(100).enableAutoValidation();    
    name.onChange('world');
    assert.equal(name.$, 'hello');
    await delay(300);
    assert.equal(name.$, 'world');
  });
});
