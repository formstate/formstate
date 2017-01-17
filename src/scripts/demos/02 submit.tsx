/** React + MUI + mobx*/
import * as React from 'react';
import { render, Button } from './mui';
import { observer } from 'mobx-react';

/** Field */
import { Field } from './field';

/** FieldState */
import { FieldState } from '../../index';
const fieldState = new FieldState({
  value: '',
  validators: [(val) => !val.trim() && 'Value required']
});

render(() => <div>
  <Field
    id="first"
    label="Provide me some value"
    fieldState={fieldState} />
  <br />
  <Button
    onClick={() => fieldState.validate()}>
    Click me to validate
  </Button>
</div>);
