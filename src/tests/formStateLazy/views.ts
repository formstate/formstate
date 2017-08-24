import {FieldState, FormStateLazy} from '../../index';
import * as assert from 'assert';
import {useStrict} from 'mobx';
import {ValidatableArray} from "../../core/formStateLazy";

useStrict(true);

interface A {
  value: string;
}
const A = (str: string) => ({value: str});

const aField: (str: string) => FieldState<string> =
  str => new FieldState(str).viewedAs<A>(A, a => a.value).viewedAs<string>(a => a.value, A);

const aForm = <TValue extends ValidatableArray>(t: () => TValue) => {
  let toArray = (tValue: TValue) => [tValue];
  let fromArray = (array: TValue[]) => array[0];
  return new FormStateLazy(t).viewedAs(toArray).viewedAs(fromArray);
};

describe("Views: FormStateLazy basic", () => {

  it("should allow nesting a FieldState array", () => {
    const name = aField('hello');
    const form = aForm(() => [
      name,
    ]);
    assert.equal(form.$[0].$, name.$);
  });

  it("should allow nesting another FormState array", () => {
    const name = aField('hello');
    const form = aForm(() => [
      aForm(() => [
        name
      ])
    ]);
    assert.equal(form.$[0].$[0].$, name.$);
  });
});

describe("Views: FormStateLazy local validations", () => {
  it("should validate a local validation", async () => {
    const name = aField('');
    const form = aForm(()=>[
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

describe("Views: FormStateLazy validation", () => {
  it("should validate a nested FieldState and pass if valid", async () => {
    const name = aField('');
    const form = aForm(() => [
      name,
    ]);
    const res = await form.validate();
    assert.equal(res.hasError, false);
    assert.equal(form.hasError, false);
  });

  it("should validate a nested FieldState and fail if invalid", async () => {
    const name = aField('').validators(
      (val) => !val && 'value required'
    );
    const form = aForm(() => [
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
    const form = aForm(() => [
      aForm(() => [
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
    const form = aForm(() => [
      aForm(() => [
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
