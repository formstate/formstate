import { FieldState, FormState } from '../../index';
import * as assert from 'assert';
import { delay } from '../utils';
import { configure } from 'mobx';

configure({
  enforceActions: true
});

describe("FormState basic", () => {
  it("should allow nesting a FieldState", () => {
    const name = new FieldState('hello');
    const form = new FormState({
      name,
    });
    assert.equal(form.$.name.$, name.$);
  });

  it("should allow nesting another FormState", () => {
    const name = new FieldState('hello');
    const form = new FormState({
      subForm: new FormState({
        name
      })
    });
    assert.equal(form.$.subForm.$.name.$, name.$);
  });

  it("should allow nesting FieldState and FormState", () => {
    const name = new FieldState('hello');
    const username = new FieldState('hello');
    const password = new FieldState('hello');
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
    const name = new FieldState('hello');
    const form = new FormState([
      name,
    ]);
    assert.equal(form.$[0].$, name.$);
  });

  it("should allow nesting another FormState array", () => {
    const name = new FieldState('hello');
    const form = new FormState([
      new FormState([
        name
      ])
    ]);
    assert.equal(form.$[0].$[0].$, name.$);
  });

  it("reset should cascade down to all fields", async () => {
    const name = new FieldState('');
    const pass = new FieldState('');

    name.onChange('hello');
    pass.onChange('world');
    await name.validate();
    await pass.validate();
    assert.equal(name.$, 'hello');
    assert.equal(pass.$, 'world');

    const form = new FormState([
      new FormState([
        name,
        new FormState({
          pass
        })
      ])
    ]);

    form.reset();
    await form.validate();
    assert.equal(name.$, '');
    assert.equal(pass.$, '');
  });
});
