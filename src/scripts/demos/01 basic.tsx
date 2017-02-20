/** React + MUI + mobx*/
import * as React from 'react';
import { render } from './mui';
import { observer } from 'mobx-react';

/** Field */
import { Field } from './field';

/** FieldState */
import { FieldState } from '../../index';
const fieldState = new FieldState('').validators((val) => !val.trim() && 'Value required');

render(() => <div>
  <Field
    id="first"
    label="Provide me some value"
    fieldState={fieldState} />
  {!!fieldState.value.trim() && <p>Current Field Value = {fieldState.value}</p>}
  {fieldState.hasError && <p>Current Field Error = {fieldState.error}</p>}
</div>);
