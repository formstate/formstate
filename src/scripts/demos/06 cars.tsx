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

const cars = new FormState({
  foo: new FieldState({
    value: '',
    validators: [(val) => val !== 'foo' && "I only allow 'foo'"]
  }),
  bar: new FieldState({
    value: '',
    validators: [(val) => val !== 'bar' && "I only allow 'bar'"]
  })
})

// /**
//  * TypeScript tip:
//  * Specialize your generic types to make annotations easier
//  **/
// type Name = FieldState<string>;
// type Feature = FormState<{ name: Name }>;
// type Features = FieldState<Feature[]>;
// type Car = FormState<{ name: Name, features: FieldState<Feature[]> }>;
// type Cars = FormState<Car[]>;

// class AppState {
//   @observable cars: Cars = new FormState([]);

//   @action addACar = () => {
//     this.cars.$.push(new FormState({
//       name: new FieldState<string>
//     }))
//   }
// }
// const state = new AppState();

// render(() => <form onSubmit={async (e) => {
//   e.preventDefault();
//   const res = await state.cars.validate();
//   if (res.hasError) {
//     return;
//   }
//   console.log('valid!');
// }}>
//   <Button onClick={state.addACar}>
//     Add {state.cars.$.length ? 'a' : 'another'} car.
//   </Button>
//   <br/>
//   {state.cars.$.map((car, key) => {
//     <Field
//       id={"carName" + key}
//       label="Car Name"
//       fieldState={car.$.name} />
//   })}
//   <br />
//   <Button
//     type="submit">
//     Submit
//   </Button>
// </form>);
