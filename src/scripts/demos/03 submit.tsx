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
  autoValidationEnabled: false,
}).validators((val) => val !== 'foo' && "I only allow 'foo'");

render(() => <div>
  <Field
    id="first"
    label="Provide me some foo"
    fieldState={fieldState} />
  <br />
  <Button
    onClick={() => fieldState.validate()}>
    Click me to validate
  </Button>
</div>);
