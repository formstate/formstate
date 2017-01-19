/** React + MUI + mobx */
import * as React from 'react';
import { render, Button, ErrorText } from './mui';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { resize } from 'eze/lib/client';
import { Vertical, Horizontal } from './gls';

/** Field */
import { Field } from './field';

/** FieldState */
import { FieldState, FormState } from '../../index';


/** Our validations */
const requiredWithMessage
  = (message: string) =>
    (val: string) => !val.trim() && message;
const atLeastOneWithMessage
  = (message: string) =>
    (val: any[]) => !val.length && message;

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
  @observable cars: Cars = new FormState([]).validators(atLeastOneWithMessage("At least on car is needed"));

  @action addACar = () => {
    const car: Car = new FormState({
      name: new FieldState({ value: '' }).validators(requiredWithMessage("Car needs a name")),
      features: new FormState([]).validators(atLeastOneWithMessage("Car must have at least one feature")),
    })
    this.cars.$.push(car);
  }

  @action addAFeatureToACar = (car: Car) => {
    const feature: Feature
      = new FormState({
        name: new FieldState({ value: '' })
          .validators(requiredWithMessage("Feature needs a name"))
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
    <Vertical>
      {/** Add cars button */}
      <Button onClick={state.addACar}>
        Add {state.cars.$.length ? 'another' : 'a'} car
      </Button>

      {/** For each car */}
      {state.cars.$.map((car, carKey) => {
        return (
          <Vertical key={carKey} style={{ marginLeft: '10px' }}>
            <Field
              id={"carName" + carKey}
              label="Car Name"
              fieldState={car.$.name}
            />

            {/** For each feature in car */}
            {!!car.$.features.$.length
              && <Vertical style={{ padding: '10px', border: '1px dotted #333' }}>
                {car.$.features.$.map((feature, featureKey) => {
                  return (
                    <Field
                      key={featureKey}
                      id={carKey + "featureName" + featureKey}
                      label="Feature Name"
                      fieldState={feature.$.name}
                    />
                  );
                })}
              </Vertical>
            }

            {car.hasError && <ErrorText>Car has error: {car.error}</ErrorText>}
            <Button onClick={() => state.addAFeatureToACar(car)}>
              Add {car.$.features.$.length ? 'another' : 'a'} feature
            </Button>
          </Vertical>
        );
      })}

      {/** Over all form submit */}
      <Horizontal verticalAlign="center">
        <Button
          type="submit">
          Submit
        </Button>
        {state.cars.hasError && <ErrorText>Form has error: {state.cars.error}</ErrorText>}
      </Horizontal>
    </Vertical>
  </form>);
});
