import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';

describe('FieldState onUpdate', () => {
  it("Should be called if value changes", async () => {
    let callCount = 0;
    const name = new FieldState({
      value: 'hello',
      onUpdate: () => callCount++,
      autoValidationEnabled: false,
    });
    name.onChange('world');
    await delay(200);
    assert.equal(callCount, 1);
  });
  it("Should be called if automatic validation occurs", async () => {
    let callCount = 0;
    const name = new FieldState({
      value: 'hello',
      autoValidationDebounceMs: 100,
      onUpdate: () => callCount++,
    });
    name.onChange('world');
    await delay(200);
    assert.equal(callCount, 2);
  });
});
