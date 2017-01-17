/** Standard react - mobx */
import * as React from 'react';
import { observer } from 'mobx-react';

/** Material UI */
import TextField from 'material-ui/TextField';

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

/**
 * Field component. Must be an observer.
 */
export const FieldBlur = observer((props: FieldProps) => (
  <TextField
    id={props.id}
    floatingLabelText={props.label}
    value={props.fieldState.value}
    onChange={function() { props.fieldState.onChange(arguments[1]) }}
    errorText={props.fieldState.error}

    /** Always validate on blur */
    onBlur={props.fieldState.enableAutoValidationAndValidate}
  />
));
