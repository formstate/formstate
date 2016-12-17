import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';


describe("basic FormState", () => {
  it("should allow nesting a FieldState", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const form = new FormState({
      name,
    });
    assert.equal(form.value.name.value, name.value);
  });

  it("should allow nesting another FormState", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const form = new FormState({
      subForm: new FormState({
        name
      })
    });
    assert.equal(form.value.subForm.value.name.value, name.value);
  });

  it("should allow nesting FieldState and FormState", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const username = new FieldState({
      value: 'hello',
    });
    const password = new FieldState({
      value: 'hello',
    });
    const form = new FormState({
      name,
      person: new FormState({
        username,
        password,
      })
    });
    assert.equal(form.value.name.value, name.value);
    assert.equal(form.value.person.value.username.value, name.value);
  });
});
