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
  validators: [(val) => val !== 'foo' && "I only allow 'foo'"]
});

render(() => <div>
  <Field
    id="first"
    label="The magic word is foo"
    fieldState={fieldState} />
</div>);
