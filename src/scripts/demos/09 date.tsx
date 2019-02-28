/** React + MUI + mobx + moment */
import * as React from 'react';
import { render, Button, ErrorText, labelClass, inputClass } from './mui';
import { observer } from 'mobx-react';
import { Vertical } from './gls';
import moment from 'moment';

/** FieldState */
import { FieldState } from '../../index';


/** Example date parsing and validator */
type ParseDateResult =
  | { valid: false }
  | { valid: true, date: Date };

/** only allows AUSTRALIAN format */
const parseDate = (value: string): ParseDateResult => {
  let date = moment(value, ['DD/MM/YYYY'], true);
  if (!date.isValid()) {
    return { valid: false };
  }
  return { valid: true, date: date.toDate() };
}

/** Example date FieldState */
const fieldState = new FieldState<string | null>(null)
  .validators(
    (val) => {
      if (val == null || !val.trim()) return null;
      const { valid } = parseDate(val);
      if (!valid) return 'Date must be of format DD/MM/YYYY';
    },
);

/** Example DateInputField */
type DateInputFieldProps = {
  fieldState: FieldState<string | null>,
  label: string
};
const DateInputField: React.SFC<DateInputFieldProps> = observer((props: DateInputFieldProps) => {
  return (
    <label>
      <span className={labelClass}>{props.label}</span>
      <input
        className={inputClass}
        value={
          props.fieldState.value == null
            ? ''
            : props.fieldState.value.toString()
        }
        onChange={(e) => {
          props.fieldState.onChange(e.target.value);
        }}
      />
    </label>
  );
});

render(() => <Vertical margin={10}>
  <DateInputField
    label="Date of registry (DD/MM/YYYY)"
    fieldState={fieldState} />
  {fieldState.hasError && <ErrorText>Current Field Error = {fieldState.error}</ErrorText>}
  <Button onClick={() => fieldState.validate()}>Validate</Button>
</Vertical>);
