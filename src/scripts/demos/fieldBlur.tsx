/** Standard react - mobx */
import * as React from 'react';
import { observer } from 'mobx-react';

/** Material UI */
import { FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';

/** FieldState */
import { FieldState } from '../../index';

/**
 * Field Props
 */
export type FieldProps = {
  /** Any UI stuff you need */
  id: string,
  label: string,

  /** The fieldState */
  fieldState: FieldState<string>
}

// SPLIT HERE

/**
 * OnBlur it will validate and enable auto validation
 */
export const FieldBlur = observer((props: FieldProps) => (
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

      /** Always validate on blur */
      onBlur={props.fieldState.enableAutoValidationAndValidate}
    />
    <FormHelperText error={props.fieldState.hasError}>{props.fieldState.error}</FormHelperText>
  </FormControl>
));
