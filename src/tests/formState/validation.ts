import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { configure } from 'mobx';

configure({
  enforceActions: true
});

describe("FormState validation", () => {
  it("should validate a nested FieldState and pass if valid", async () => {
    const name = new FieldState('');
    const form = new FormState({
      name,
    });
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("array: should validate a nested FieldState and pass if valid", async () => {
    const name = new FieldState('');
    const form = new FormState([
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
    const form = new FormState({
      name,
    });
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'value required');
    assert.equal(form.$.name.error, 'value required');
  });

  it("array: should validate a nested FieldState and fail if invalid", async () => {
    const name = new FieldState('').validators(
      (val) => !val && 'value required'
    );
    const form = new FormState([
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
    const form = new FormState({
      name: new FormState({
        name
      })
    });
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("array: should validate a nested - nested FieldState and pass if valid", async () => {
    const name = new FieldState('');
    const form = new FormState([
      new FormState([
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
    const form = new FormState({
      name: new FormState({
        name
      })
    });
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'value required');
    assert.equal(form.$.name.error, 'value required');
    assert.equal(form.$.name.$.name.$, '');
  });

  it("array: should validate a nested - nested FieldState and fail if invalid", async () => {
    const name = new FieldState('').validators(
      (val) => !val && 'value required'
    );
    const form = new FormState([
      new FormState([
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

  it("dependent validation should work", async () => {
    const pass1 = new FieldState('').validators((val) => !val && 'Password required');
    const pass2 = new FieldState('').validators((val) => val && val !== pass1.$ && 'Passwords must match')
    const form = new FormState({
      pass1,
      pass2
    });

    /** Sample user interaction */
    form.$.pass1.onChange('hello');
    form.$.pass2.onChange('he');

    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(pass2.error, 'Passwords must match');
  });

  it("Should not loop infinitely when validating nested composeed FormStates", () => {
    const validator = <T>(t: T) => {
      return null;
    };
    const form = new FormState({
      f1: new FieldState("").validators(validator),
      f2: new FieldState("").validators(validator),
      nested: new FormState({
        a: new FieldState("na").validators(validator),
        b: new FieldState("nb").validators(validator),
      })
    }).compose();

    form.$.f1.onChange("f1");
    form.$.f2.onChange("f2");

    form.validate();
  });
});
