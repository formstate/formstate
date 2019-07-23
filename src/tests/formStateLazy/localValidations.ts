import { FieldState, FormStateLazy } from '../../index';
import * as assert from 'assert';
import { configure } from 'mobx';

configure({
  enforceActions: true
});

describe("FormStateLazy local validations", () => {
  it("should validate a local validation", async () => {
    const name = new FieldState('');
    const form = new FormStateLazy(()=>[
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
