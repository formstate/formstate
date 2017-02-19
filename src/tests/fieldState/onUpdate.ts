import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { useStrict } from 'mobx';

useStrict(true);

describe('FieldState onUpdate', () => {
  it("Should be called if value changes", async () => {
    let callCount = 0;
    const name = new FieldState('hello').disableAutoValidation().onUpdate(() => callCount ++);    
    name.onChange('world');
    await delay(200);
    assert.equal(callCount, 1);
  });
  it("Should be called if automatic validation occurs", async () => {
    let callCount = 0;
    const name = new FieldState('hello').setAutoValidationDebouncedMs(100).onUpdate(() => callCount++);
    name.onChange('world');
    await delay(200);
    assert.equal(callCount, 2);
  });
});
