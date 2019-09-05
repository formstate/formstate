import { DisplayValue } from './displayValue';
import { FieldState } from '../../index';
import * as React from 'react';
import { observer } from 'mobx-react';

// SPLIT HERE

/** Material UI */
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';


export type SelectFieldProps = {
  /** This library : fieldState */
  fieldState: FieldState<DisplayValue>,

  /** Select fields take a list of options */
  displayValues: DisplayValue[],

  /**
   * Any UI stuff you need
   * Use your imagination 🦄!
   */
  id: string,
  label: string,
}

export const SelectField = observer((props: SelectFieldProps) => (
  <FormControl fullWidth>
    <InputLabel
      error={props.fieldState.hasError}
      htmlFor={props.id}>
      {props.label}
    </InputLabel>
    {/** 
     * Render a select, wiring its value and onChange to fieldState 
     */}
    <Select
      value={props.fieldState.value}
      onChange={(e) => {
        props.fieldState.onChange(
          props.displayValues.find(option => option.value == e.target.value)!
        )
      }}
    >
      {/** Render the options */}
      {props.displayValues.map(displayValue => (
        <MenuItem value={displayValue.value}>{displayValue.display}</MenuItem>
      ))}
    </Select>
  </FormControl>
));
