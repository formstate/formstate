import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { configure } from 'mobx';

configure({
  enforceActions: true
});

describe("FormState validation", () => {
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

  it("Should start running form validators as soon as all fields have been validated", async () => {
    const required = (val: string) => !val && "Required";
    const form = new FormState({
      pass1: new FieldState("").validators(required),
      pass2: new FieldState("").validators(required),
      name: new FieldState("")
    })
      .compose()
      .validators($ => {
        return $.pass1.$ !== $.pass2.$ && "Passwords must match";
      });

    /** Assume a user interaction that warrants validation + auto validation */
    await form.enableAutoValidationAndValidate();

    /** Change values  */
    form.$.pass1.onChange("a");
    form.$.pass2.onChange("b");

    /** Wait for field validators to fire */
    await delay(1000);

    /** The form validator should have fired after the fields became valid */
    assert.equal(form.error, "Passwords must match");
  });
});
