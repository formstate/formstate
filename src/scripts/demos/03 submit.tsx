/** React + MUI + mobx*/
import * as React from 'react';
import { render, Button, vertical } from './mui';
import { observer } from 'mobx-react';

/** Field */
import { Field } from './field';

/** FieldState */
import { FieldState } from '../../index';
const fieldState = new FieldState('').disableAutoValidation().validators((val) => val !== 'foo' && "I only allow 'foo'");

render(() => <div className={vertical}>
  <Field
    id="first"
    label="Provide me some foo"
    fieldState={fieldState} />
  <Button
    onClick={() => fieldState.validate()}>
    Click me to validate
  </Button>
</div>);
