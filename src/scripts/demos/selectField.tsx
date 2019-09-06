import { DisplayValue } from './displayValue';
import { FieldState } from '../../index';
import * as React from 'react';
import { observer } from 'mobx-react';
import { Vertical, VerticalMargined } from './gls';

// SPLIT HERE


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
  <Vertical margin={5}>
    <label
      style={props.fieldState.hasError ? { color: 'red' } : {}}
      htmlFor={props.id}>
      {props.label}
    </label>
    {/** 
     * Render a select, wiring its value and onChange to fieldState 
     */}
    <select
      value={props.fieldState.value.value}
      onChange={(e) => {
        /** Map the value back to a DisplayValue for the FieldState */
        props.fieldState.onChange(
          props.displayValues.find(option => option.value == e.target.value)!
        )
      }}
    >
      {/** Render the options */}
      {props.displayValues.map(displayValue => (
        <option value={displayValue.value}>{displayValue.display}</option>
      ))}
    </select>
  </Vertical>
));
