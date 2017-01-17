/** React + MUI + mobx*/
import * as React from 'react';
import { render, Button } from './mui';
import { observer } from 'mobx-react';

/** Field */
import { FieldBlur } from './fieldBlur';

/** FieldState */
import { FieldState, FormState } from '../../index';

const formState = new FormState({
  foo: new FieldState({
    value: '',
    autoValidationEnabled: false,
    validators: [(val) => val !== 'foo' && "I only allow 'foo'"]
  }),
  bar: new FieldState({
    value: '',
    autoValidationEnabled: false,
    validators: [(val) => val !== 'bar' && "I only allow 'bar'"]
  })
})
render(() => <form onSubmit={async (e) => {
  e.preventDefault();
  const res = await formState.validate();
  if (res.hasError) {
    formState.enableAutoValidation();
    return;
  }
  console.log('Validated Values:', formState.$.foo.$, formState.$.bar.$);
}}>
  <FieldBlur
    id="first"
    label="foo is the value you are looking for"
    fieldState={formState.$.foo} />
  <br />
  <FieldBlur
    id="second"
    label="Lets go to the bar"
    fieldState={formState.$.bar} />
  <br />
  <Button
    type="submit">
    Click me to validate, or press enter in some input field.
  </Button>
</form>);
