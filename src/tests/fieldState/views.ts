import {FieldState} from '../../index';
import * as assert from 'assert';
import {delay} from '../utils';
import {useStrict} from 'mobx';

useStrict(true);

interface A {
  value: string;
}
const A = (str: string) => ({value: str});

const aField: (str: string) => FieldState<A> =
  str => new FieldState(str).viewedAs<A>(a => a.value, A).viewedAs<string>(A, a => a.value).viewedAs<A>(a => a.value, A);


describe("Views: FieldState basic", () => {
  it("hotValue and safeValue is set to initial value", () => {
    const name = aField('hello');
    assert.deepEqual(name.value, A('hello'));
    assert.deepEqual(name.$, A('hello'));
    name.on$Reinit()
  });

  it("no validation should keep hasBeenValidated false", () => {
    const name = aField('hello');
    assert.deepEqual(name.hasBeenValidated, false);
  });

  it("validating changes hasBeenValidated to true", async () => {
    const name = aField('hello');
    name.onChange(A('world'));
    await name.validate();
    assert.deepEqual(name.hasBeenValidated, true);
  });

  it("reinitValue changes hasBeenValidated to false", () => {
    const name = aField('world');
    name.reinitValue(A('world'));
    assert.deepEqual(name.hasBeenValidated, false)
  });


  it("reinitValue should change the value immediately", () => {
    const name = aField('hello');
    name.reinitValue(A('world'));

    assert.deepEqual(name.value, A('world'));
    assert.deepEqual(name.$, A('world'));
    assert.deepEqual(name.hasBeenValidated, false);
  });

  it("reinitValue should prevent any automatic validation from running", async () => {
    const name = aField('').validators(
      (val) => !val.value && 'value required'
    );
    name.onChange(A('world'));
    name.reinitValue(A(''));
    await delay(300);
    assert.deepEqual(name.hasError, false);
    assert.deepEqual(name.value, A(''));
    assert.deepEqual(name.$, A(''));
    assert.deepEqual(name.hasBeenValidated, false);
  });

  it("reinitValue followed by onChange should run validators", async () => {
    const name = aField('').validators(
      (val) => !val.value && 'value required'
    );
    name.onChange(A('world'));
    name.reinitValue(A(''));
    name.onChange(A(''));
    await delay(300);
    assert.deepEqual(name.hasError, true);
    assert.deepEqual(name.value, A(''));
    assert.deepEqual(name.$, A(''));
  });

  it("reinitValue followed by validate should still validate", async () => {
    const name = aField('').validators(
      (val) => !val.value && 'value required'
    );
    name.onChange(A('world'));
    name.reinitValue(A(''));
    const res = await name.validate();
    assert.deepEqual(res.hasError, true);
    assert.deepEqual(name.value, A(''));
    assert.deepEqual(name.$, A(''));
  });
});

describe('Views: FieldState automatic validation', () => {

  it("If delay is low it should autovalidate fast", async () => {
    const name = aField('hello').setAutoValidationDebouncedMs(100);
    name.onChange(A('world'));
    await delay(300);
    assert.deepEqual(name.$, A('world'));
  });

  it("if delay is big it should autovalidate fast", async () => {
    const name = aField('hello').setAutoValidationDebouncedMs(200);
    name.onChange(A('world'));
    await delay(100);
    assert.deepEqual(name.$, A('hello'));
  });

  it("default delay value should also work", async () => {
    const name = aField('hello');
    name.onChange(A('world'));
    await delay(100);
    assert.deepEqual(name.$, A('hello'));
    await delay(200);
    assert.deepEqual(name.$, A('world'));
  });
});

describe('Views: automatic validation toggling', () => {
  it("by default its enabled", async () => {
    const name = aField('hello');
    name.onChange(A('world'));
    assert.deepEqual(name.$, A('hello'));
    await delay(300);
    assert.deepEqual(name.$, A('world'));
  });

  it("disabled auto validation should disable", async () => {
    const name = aField('hello').setAutoValidationDebouncedMs(100).disableAutoValidation();
    name.onChange(A('world'));
    assert.deepEqual(name.$, A('hello'));
    await delay(300);
    assert.deepEqual(name.$, A('hello'));
  });

  it("enabled auto validation should enable", async () => {
    const name = aField('hello').setAutoValidationDebouncedMs(100).enableAutoValidation();
    name.onChange(A('world'));
    assert.deepEqual(name.$, A('hello'));
    await delay(300);
    assert.deepEqual(name.$, A('world'));
  });
});

describe('Views: FieldState onUpdate', () => {
  it("Should be called if value changes", async () => {
    let callCount = 0;
    const name = aField('hello').disableAutoValidation().onUpdate(() => callCount ++);
    name.onChange(A('world'));
    await delay(200);
    assert.deepEqual(callCount, 1);
  });
  it("Should be called if automatic validation occurs", async () => {
    let callCount = 0;
    const name = aField('hello').setAutoValidationDebouncedMs(100).onUpdate(() => callCount++);
    name.onChange(A('world'));
    await delay(200);
    assert.deepEqual(callCount, 2);
  });
});
