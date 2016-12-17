# FormState

> Making form management simple

<iframe src="https://ghbtns.com/github-btn.html?user=formstate&repo=formstate&type=star&count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe>

> [Powered by your github ⭐s](https://github.com/formstate/formstate/stargazers).

Note that the API is quite simple and consists of `Validator`, `FieldState` and `FormState`. It is written in TypeScript and designed for TypeSafety.

We could explain the *just the API*, but we think its better to help people understand how truly simple it is by explaining all the rational 🌹.

> TIP I assume you are familiar with [promises](https://basarat.gitbooks.io/typescript/content/docs/promise.html) and [async/await](https://basarat.gitbooks.io/typescript/content/docs/async-await.html).

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

* TODO: add `debounce` function to validation.
* TODO: document `debounce` function to validation.
* TODO: consider `validation.ifValue` as a part of core.

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

It would be great if `FieldState` had just `value` and `onChange`. However to support validation and make it a painless experiece, we have the concept of a *hotValue* and a *safeValue*.

* `hotValue`: This is the value you bind to the input. It is updated as soon as `onHotChange` is called.
* `safeValue`: This is the value *you set using code* OR is a `hotValue` that has passed validation.

> Calling it `hotValue` helps developers know that this value is not validated. 

The following pattern examplains usage of `safeValue`

```ts
const res = await someField.validate(); 
if (res.hasError) return;
sendToServer(someField.safeValue); // Example
```

Note that `hotValue` can be changed by UI / User between the time you call `validate` and read its result. For example, if your UI is still enabled when validating and a server validation is taking too long.

> TIP: FieldState has `validating` boolean, that you can use to explicitly move field / input to `readonly` but it results in horrible UX especially if doing *automatic* live validation.

## Field
Essentially your `Field` components looks like the following:....TBD

## Design Notes

Some design notes.

### Why `safeValue`

Something like `validated: {valid:false} | {valid:true, value: TValue}` although typesafe was unweildy for devs (`if (validated.valid) {validated.value}`).

Also a validated value *may or may not be present* if validation hasn't run. This makes creating a composible system harder. With `safeValue` (always present as you must initilize a `FieldState` with an initial value) we can compose multiple fields more easily, and as soon as you call `validate` at a top level it can easily cacade down and you can read any `safeValue` you want without being forced to do `validated.valid` checks.


[mobx]:https://github.com/mobxjs/mobx
