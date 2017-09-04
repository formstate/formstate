import {FieldState, FormState} from '../../index';

const validator = <T>(t: T) => {
  console.log(`validating ${t}`);
  return null;
};

describe("validation", () => {
  it("Should not loop infinitely when validating nested composeed FormStates", () => {
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
