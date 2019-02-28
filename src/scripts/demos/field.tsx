/** Standard react - mobx */
import * as React from 'react';
import { observer } from 'mobx-react';

/** FieldState */
import { FieldState } from '../../index';


// SPLIT HERE

/** Material UI */
import { FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';

/** Field Props */
export type FieldProps = {
  /** This library : fieldState */
  fieldState: FieldState<string>

  /**
   * Any UI stuff you need
   * Use your imagination 🦄!
   */
  id: string,
  label: string,
}

/**
 * Observer Field component.
 * Wires FieldState to any native or library elements you want.
 * Use your imagination 🦄!
 */
export const Field = observer((props: FieldProps) => (
  <FormControl fullWidth>
    <InputLabel
      error={props.fieldState.hasError}
      htmlFor={props.id}>
      {props.label}
    </InputLabel>
    <Input
      fullWidth
      error={props.fieldState.hasError}
      id={props.id}
      value={props.fieldState.value}
      onChange={(e) => { props.fieldState.onChange(e.target.value) }}
    />
    <FormHelperText error={props.fieldState.hasError}>{props.fieldState.error}</FormHelperText>
  </FormControl>
));
