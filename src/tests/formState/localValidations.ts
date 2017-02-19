import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { useStrict } from 'mobx';

useStrict(true);

describe("FormState local validations", () => {
  it("should validate a local validation", async () => {
    const name = new FieldState('');
    const form = new FormState({
      name,
    }).validators(($) => {
      return $.name.$.length < 2 && 'The lenght of name must be at least 2';
    });
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'The lenght of name must be at least 2');
  });

  it("array: should validate a local validation", async () => {
    const name = new FieldState('');
    const form = new FormState([
      name,
    ]).validators(($) => {
      return $.length < 2 && 'You must have at least two names';
    });
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'You must have at least two names');
  });
});
