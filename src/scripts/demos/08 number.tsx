/** React + MUI + mobx*/
import * as React from 'react';
import { render, Button, ErrorText, labelClass, inputClass } from './mui';
import { observer } from 'mobx-react';
import { style } from 'typestyle';
import { Vertical } from './gls';

/** FieldState */
import { FieldState } from '../../index';


/** Example number FieldState */
const fieldState = new FieldState<number | null>(null)
  .validators(
    (val) => val == null && 'Value required',
    (val) => val != null && val < 2 && 'Value must be greater than 2',
);

/** Example NumberInputField */
type NumberInputFieldProps = {
  fieldState: FieldState<number | null>,
  label: string
};
const NumberInputField: React.SFC<NumberInputFieldProps> = observer((props: NumberInputFieldProps) => {
  return (
    <label>
      <span className={labelClass}>{props.label}</span>
      <input
        className={inputClass}
        type="number"
        value={
          props.fieldState.value == null
            ? ''
            : props.fieldState.value.toString()
        }
        /** 
         * Convert the input to the correct type in onChange 
         */
        onChange={(e) => {
          const strValue = e.target.value;
          if (isNaN(+strValue)) {
            props.fieldState.onChange(null);
          } else {
            props.fieldState.onChange(+strValue);
          }
        }}
      />
    </label>
  );
});

render(() => <Vertical margin={10}>
  <NumberInputField
    label="Example Number Input"
    fieldState={fieldState} />
  {fieldState.hasError && <ErrorText>Current Field Error = {fieldState.error}</ErrorText>}
  <Button onClick={() => fieldState.validate()}>Validate</Button>
</Vertical>);
