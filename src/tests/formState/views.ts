import {FieldState, FormState} from '../../index';
import * as assert from 'assert';
import {useStrict} from 'mobx';
import {ValidatableMapOrArray} from "../../core/formState";

useStrict(true);

interface A {
  value: string;
}
const A = (str: string) => ({value: str});

const aField: (str: string) => FieldState<string> =
  str => new FieldState(str).viewedAs<A>(A, a => a.value).viewedAs<string>(a => a.value, A);

const aForm = <TValue extends ValidatableMapOrArray>(t: TValue) => {
  let toArray = (tValue: TValue) => [tValue];
  let fromArray = (array: TValue[]) => array[0];
  return new FormState(t).viewedAs(toArray).viewedAs(fromArray);
};

describe("Views:  FormState basic", () => {
  it("should allow nesting a FieldState", () => {
    const name = aField('hello');
    const form = aForm({
      name,
    });
    assert.equal(form.$.name.$, name.$);
  });

  it("should allow nesting another FormState", () => {
    const name = aField('hello');
    const form = aForm({
      subForm: aForm({
        name
      })
    });
    assert.equal(form.$.subForm.$.name.$, name.$);
  });

  it("should allow nesting FieldState and FormState", () => {
    const name = aField('hello');
    const username = aField('hello');
    const password = aField('hello');
    const form = aForm({
      name,
      person: aForm({
        username,
        password,
      })
    });
    assert.equal(form.$.name.$, name.$);
    assert.equal(form.$.person.$.username.$, name.$);
  });

  it("should allow nesting a FieldState array", () => {
    const name = aField('hello');
    const form = aForm([
      name,
    ]);
    assert.equal(form.$[0].$, name.$);
  });

  it("should allow nesting another FormState array", () => {
    const name = aField('hello');
    const form = aForm([
      aForm([
        name
      ])
    ]);
    assert.equal(form.$[0].$[0].$, name.$);
  });
});

describe("Views:  FormState local validations", () => {
  it("should validate a local validation", async () => {
    const name = aField('');
    const form = aForm({
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
    const name = aField('');
    const form = aForm([
      name,
    ]).validators(($) => {
      return $.length < 2 && 'You must have at least two names';
    });
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'You must have at least two names');
  });
})

describe("Views:  FormState validation", () => {
  it("should validate a nested FieldState and pass if valid", async () => {
    const name = aField('');
    const form = aForm({
      name,
    });
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("array: should validate a nested FieldState and pass if valid", async () => {
    const name = aField('');
    const form = aForm([
      name,
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("should validate a nested FieldState and fail if invalid", async () => {
    const name = aField('').validators(
      (val: string) => !val && 'value required'
    );
    const form = aForm({
      name,
    });
    const res = await form.validate();

    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'value required');
    assert.equal(form.$.name.error, 'value required');
  });

  it("array: should validate a nested FieldState and fail if invalid", async () => {
    const name = aField('').validators(
      (val) => !val && 'value required'
    );
    const form = aForm([
      name,
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, true);
    assert.equal(form.hasError, true);
    assert.equal(form.error, 'value required');
    assert.equal(form.$[0].error, 'value required');
  });

  it("should validate a nested - nested FieldState and pass if valid", async () => {
    const name = aField('');
    const form = aForm({
      name: aForm({
        name
      })
    });
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("array: should validate a nested - nested FieldState and pass if valid", async () => {
    const name = aField('');
    const form = aForm([
      aForm([
        name
      ])
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("should validate a nested - nested FieldState and fail if invalid", async () => {
    const name = aField('').validators(
      (val) => !val && 'value required'
    );
    const form = aForm({
      name: aForm({
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
    const name = aField('').validators(
      (val) => !val && 'value required'
    );
    const form = aForm([
      aForm([
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
    const pass1 = aField('').validators((val) => !val && 'Password required');
    const pass2 = aField('').validators((val) => val && val !== pass1.$ && 'Passwords must match')
    const form = aForm({
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
});
