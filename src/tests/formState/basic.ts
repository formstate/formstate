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
    assert.equal(form.safeValue.name, name.safeValue);
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
    assert.equal(form.safeValue.subForm.name, name.safeValue);
  });

  it("should allow nesting FieldState and FormState", () => {
    const name = new FieldState({
      value: 'hello',
    });
    const form = new FormState({
      name,
      subForm: new FormState({
        name
      })
    });
    assert.equal(form.safeValue.name, name.safeValue);
    assert.equal(form.safeValue.subForm.name, name.safeValue);
  });
});
