/** React + MUI + mobx */
import * as React from 'react';
import { render, Button } from './mui';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { resize } from 'eze/lib/client';

/** Field */
import { Field } from './field';

/** FieldState */
import { FieldState, FormState } from '../../index';


/** Our validations */
const required = (val: string) => !val.trim() && 'Value required';
const atLeastOne = (val: any[]) => !val.length && 'At least one required';

/**
 * TypeScript tip:
 * Specialize your generic types to make annotations easier
 **/
type Name = FieldState<string>;
type Feature = FormState<{ name: Name }>;
type Features = FormState<Feature[]>;
type Car = FormState<{ name: Name, features: Features }>;
type Cars = FormState<Car[]>;

class AppState {
  @observable cars: Cars = new FormState([]);

  @action addACar = () => {
    const car: Car = new FormState({
      name: new FieldState({ value: '' }).validators([required]),
      features: new FormState([]).validators([atLeastOne]),
    })
    this.cars.$.push(car);
  }

  @action addAFeatureToACar = (car: Car) => {
    const feature: Feature
      = new FormState({
        name: new FieldState({ value: '' })
          .validators([required])
      });
    car.$.features.$.push(feature);
  }
}
const state = new AppState();

render(() => {
  return (<form onSubmit={async (e) => {
    e.preventDefault();
    const res = await state.cars.validate();
    if (res.hasError) {
      return;
    }
    alert('Valid!');
  }}>
    <Button onClick={state.addACar}>
      Add {state.cars.$.length ? 'another' : 'a'} car
    </Button>
    <br />
    {state.cars.$.map((car, key) => {
      return (
        <div key={key}>
          <Field
            id={"carName" + key}
            label="Car Name"
            fieldState={car.$.name} />
          <br />
        </div>
      );
    })}
    <br />
    <Button
      type="submit">
      Submit
  </Button>
  </form>);
});
