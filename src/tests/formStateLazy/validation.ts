import { FieldState, FormState, FormStateLazy } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { configure } from 'mobx';

configure({
  enforceActions: true
});

describe("FormStateLazy validation", () => {
  it("should validate a nested FieldState and pass if valid", async () => {
    const name = new FieldState('');
    const form = new FormStateLazy(() => [
      name,
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("should validate a nested FieldState and fail if invalid", async () => {
    const name = new FieldState('').validators(
      (val) => !val && 'value required'
      );
    const form = new FormStateLazy(() => [
      name,
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'value required');
    assert.equal(form.$[0].error, 'value required');
  });

  it("should validate a nested - nested FieldState and pass if valid", async () => {
    const name = new FieldState('');
    const form = new FormStateLazy(() => [
      new FormStateLazy(() => [
        name
      ])
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("should validate a nested - nested FieldState and fail if invalid", async () => {
    const name = new FieldState('').validators(
      (val) => !val && 'value required'
      );
    const form = new FormStateLazy(() => [
      new FormStateLazy(() => [
        name
      ])
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'value required');
    assert.equal(form.$[0].error, 'value required');
    assert.equal(form.$[0].$[0].$, '');
  });
});
