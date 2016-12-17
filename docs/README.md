<iframe src="https://ghbtns.com/github-btn.html?user=formstate&repo=formstate&type=star&count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe>

> [Powered by your github ⭐s](https://github.com/formstate/formstate/stargazers).

Note that the API is quite simple and consists of `Validator`, `FieldState` and `FormState`. It is written in TypeScript and designed for TypeSafety.


### Quick Example

```tsx
import React from 'react';
import { observer } from 'mobx-react';
import { FormState, FieldState } from 'formstate';

class DemoState {
  // Create a field
  username = new FieldState({
    value: '',
    // Creating validators is super easy
    validators:[(val) => !val && 'username required']
  });

  // Compose fields into a form
  form = new FormState({
    username: this.username
  });

  onSubmit = async () => {
    //  Validate all fields
    const res = await this.form.validate();
    // If any errors you would know
    if (res.hasError) {
      console.log(res.error);
      return;
    }
    // Yay .. all good. Do what you want with it
    console.log(this.username.value); // Validated value!
  };
}

@observer
export class Demo extends React.Component<{},{}> {
  data = new DemoState();
  render(){
    return (
      const data = this.data;

      <form onSubmit={data.onSubmit}>
        <input
          type="text"
          value={data.username.hotValue}
          onChange={(e)=>data.username.onHotChange(e.target.value)}
        />
        <p>{data.username.error}</p>
        <p>{data.form.error}</p>
      </form>
    ));
  }
}
```

> Form state so simple that you will fall in love ❤️

![](https://raw.githubusercontent.com/formstate/formstate/master/docs/logo/logo.png)

We could explain the *just the API*, but to help people understand how truly simple it is we will even go ahead and explain all the rational 🌹.

> TIP: I assume you are familiar with [promises](https://basarat.gitbooks.io/typescript/content/docs/promise.html) and [async/await](https://basarat.gitbooks.io/typescript/content/docs/async-await.html).

## Mobx

This project depends upon [mobx][mobx]. Long story short, mobx allows you to write semantic JavaScript / TypeScript code and offload the UI data binding / updating for you. We encourage you to check them out if you are not familiar with [mobx][mobx].

We provide two simple *state* classes `FieldState<TValue>` and `FormState`. These are UI framework independent (e.g. do not depend on ReactJs or AngularJS etc) as that binding is taken care of by mobx. We just manage the state for a Field (`FieldState`) or any number of Fields (`FormState`). Both of these have very simple semantics and can easily be powered by any number of UI inputs. More on this later.

## Validator

We believe that validation should have simple semantics. Validation is provided by a validator. The following is the signature for a validator.

```ts
export interface Validator<TValue> {
  (value: TValue): string | Promise<string>;
}
```

Notice that a validator is *completely* independent of any framework cruft. Its a simple function that just takes a value and returns an error message or a Promise to an error message. If there is no error it should return an empty string.

Because its just a function:
* you can easily test it in nodejs.
* you can easily wrap any validation library quite easily if you need to.
* handles server validation just as easily as local one (you just return a promise).

### Validation run

A FieldState takes a list of validators. It basically just calls the super simple `applyValidators` function

```
function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]): Promise<string>
```

This function applies a value through a list of validators. It aborts execution and returns an error as soon as any validator returns an error.

That's it. Now you have complete mastery of Validators. That said we understand that providing guidance around common patterns helps beginners and experts write simple code. So we cover a few validator tips next.

### TIP: Sequential running

Validators are run in sequence and stopped if an error occurs. This means that we get well defined error messages from an validation run.

Also this means you get to chain validations quite easily e.g. `second` never gets called if `first` fails.

```ts
validators:[first, second]
```

You can even easily compose validators that run multiple validators in parallel if you want e.g.

```ts
validators:[(value)=>{
  return Promise.all([first(value), second(value)])
    .then(([fst,snd]) => {
      if (fst && snd) return 'Both first and second failed';
      if (fst) return 'Only first failed';
      if (snd) return 'Only second failed';
      return '';
    });
}]
```

### TIP: Empty values

We could isolate the validators from handling such cases by not calling a validator if the empty is value, but its a decision we don't want to make for *your validation requirements*. You can easily wrap your validator in a function that removes `TValue`s that you don't want to handle e.g

```ts
function ifValue(validator:Validator<TValue>):Validator<TValue>{
  return function(value: TValue) {
    if (!value || value == null) return '';
    return validator(value);
  };
}

// Usage
// validators: [ifValue(mySimplerValidator)]
```

## FieldState

### Concept: Page / Field / Input
To keep your mental model (and life) simple, you want finely determined *truths* about your components.

* Truth: An input should bind to a `value` and should always show the value.

If an input needs its value changed (e.g. a use key press), it should call a passed in `onChange` *to request* a change to the said `value`.

The *page* (or whatever passed in the value), is what should *change the value* and pass in the new value to the component.

A simple diagram that shows what an input should accept:

![](./images/inputSimple.png)

It can be made simpler by composing the `{value, onChange}` pair into a single object (lets call it `FieldState`) that we *can* pass to the input. We can even easily create a `Field` component that selects such a pair and passes the *right things* to the input so you don't need to rewrite your *inputs* to support FieldState.

![](./images/inputFieldSimple.png)

That's better, note that creating your own `Field` component gives you the opportunity to style it for *your business* and add additions properties e.g. `{label:string}` that make sense for your project:

![](./images/inputFieldLabel.png)

Also as a component library author you do not need to depend on this project *or* mobx. You write it as a simple `value`, `onChange`. And then the application author (which can still be just you) makes the `Field` that uses this library, *mobx* and *mobx-react* (specifically wrapping `@observer class Field extends React.Component` etc) and it all just works out. More on creating your `Field` later.

### Concept: Validation

It would be great if `FieldState` had just `value` and `onChange`. However to support validation and make it a painless experiece, we have the concept of a *hotValue* and a *value*.

* `hotValue`: This is the value you bind to the input. It is updated as soon as `onHotChange` is called.
* `value`: This is the value *you set using code* OR is a `hotValue` that has passed validation.

> Calling it `hotValue` helps developers know that this value is not validated.

The following pattern examplains usage of `value`

```ts
const res = await someField.validate();
if (res.hasError) return;
sendToServer(someField.value); // Bound to be validated and safe
```

Note that `hotValue` can be changed by UI / User between the time you call `validate` and read its result. For example, if your UI is still enabled when validating and a server validation is taking too long.

> TIP: FieldState has `validating` boolean, that you can use to explicitly move field / input to `readonly` but it results in horrible UX especially if doing *automatic* live validation.

## Field
You create a `Field` component based on your design. But its actually not hard, essentially your `Field` components looks like the following:

```ts
type FieldProps = {
  id: string,
  label: string,
  fieldState: FieldState<string>,  
}

@observer
export class Field extends React.Component<FieldProps, {}>{
  render() {
    const fieldState = this.props.fieldState;
    return (
      <div>
        <label htmlFor={this.props.id}>{this.props.label}<label>
        <input
          type="text"
          value={fieldState.hotValue}
          onChange={(e)=>fieldState.onHotChange(e.target.value)}
        />
        <p>{fieldState.error}</p>
      </div>
    );
  }
}
```

[mobx]:https://github.com/mobxjs/mobx
