import { FieldState, FormState, FormStateLazy } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';


describe("FormStateLazy basic", () => {
  it("should allow nesting a FieldState", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const form = new FormState({
      name,
    });
    assert.equal(form.$.name.$, name.$);
  });

  it("should allow nesting another FormStateLazy", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const form = new FormState({
      subForm: new FormState({
        name
      })
    });
    assert.equal(form.$.subForm.$.name.$, name.$);
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
    assert.equal(form.$.name.$, name.$);
    assert.equal(form.$.person.$.username.$, name.$);
  });

  it("should allow nesting a FieldState array", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const form = new FormStateLazy(() => [
      name,
    ]);
    assert.equal(form.$[0].$, name.$);
  });

  it("should allow nesting another FormState array", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const form = new FormStateLazy(() => [
      new FormStateLazy(() => [
        name
      ])
    ]);
    assert.equal(form.$[0].$[0].$, name.$);
  });
});
