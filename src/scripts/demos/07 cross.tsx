/** React + MUI + mobx */
import * as React from 'react';
import { render, Button, ErrorText } from './mui';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { resize } from 'eze/lib/client';
import { Vertical, Horizontal } from './gls';

/** Field */
import { Field } from './field';

/** FieldState */
import { FieldState, FormState } from '../../index';


const nameRequired = (val: string) => !val && 'Name required';
const form = new FormState({
  name1: new FieldState({
    value: '',
  }).validators(nameRequired),
  name2: new FieldState({
    value: '',
  }).validators(nameRequired),
})
  .compose()
  .validators(($) => $.name1.$ !== $.name2.$ && 'Names must match');

render(() => {
  return (<form onSubmit={async (e) => {
    e.preventDefault();
    const res = await form.enableAutoValidationAndValidate();
    if (res.hasError) {
      return;
    }
    alert('Valid!');
  }}>
    <Vertical>
      <Field
        id={"name1"}
        label="Name"
        fieldState={form.$.name1}
      />
      <Field
        id={"name2"}
        label="Re-enter name"
        fieldState={form.$.name2}
      />

      {form.hasFormError && <ErrorText>{form.error}</ErrorText>}

      {/** Over all form submit */}
      <Horizontal verticalAlign="center">
        <Button
          type="submit">
          Submit
        </Button>

        {form.hasError && <ErrorText>Form has error: {form.error}</ErrorText>}
      </Horizontal>
    </Vertical>
  </form>);
});
