/** React + MUI + mobx*/
import * as React from 'react';
import { render, Button } from './mui';
import { Vertical } from './gls';

/** Field */
import { DisplayValue } from './displayValue';
import { SelectField } from './selectField';

/** FieldState */
import { FieldState } from '../../index';
const fieldState = new FieldState<DisplayValue>({ display: 'Please select', value: '' })
  .validators((val: DisplayValue) => !val.value.trim() && 'Value required');

render(() => <Vertical>
  <SelectField
    id="question"
    label="Type of vehicle"
    fieldState={fieldState}
    displayValues={[
      { display: 'Please select', value: '' },
      { display: 'I drive a car', value: 'car' },
      { display: 'I drive a truck', value: 'truck' },
    ]}
  />
  <Button onClick={fieldState.validate}>Validate</Button>
  <div>
    {!!fieldState.value.value && <p>Current Field Display = {fieldState.value.display}</p>}
    {!!fieldState.value.value && <p>Current Field Value = {fieldState.value.value}</p>}
    {fieldState.hasError && <p>Current Field Error = {fieldState.error}</p>}
  </div>
</Vertical>);
