# FormState

A general purpose and simple formstate.

## Validator

We believe that validation should have simple semantics. Validation is provided by a validator. The following is the signature for a validator.

```ts
interface Validator<TValue> {
  (value:TValue) => string | Promise<string>
}
```

Notice that a validator is *completely* independent of any framework cruft. Its a simple function that just takes a value and returns an error message or a Promise to an error message. If there is no error it should return an empty string.

Because its just a function:
* you can easily test it in nodejs.
* you can easily wrap any validation library quite easily if you need to.
* handles server validation just as easily as local one (you just return a promise).

### Validation run

A field takes a list of a validator. It basically just calls the super simple `applyValidators` function which applies a value through a list of validators. It aborts execution and returns an error if any validator returns an error.

### Concept: Sequential running

Validators are run in sequence and stopped if an error occurs. This means that we get well defined error messages from an validation run.

Why? Because

### Why you need to handle empty values
We could isolate the validators from handling such cases by not calling a validator if the empty is value, but its a decision we don't want to make for *your validation requirements*. You can easily wrap your validator in a function that removes `TValue`s that you don't want to handle e.g

```ts
function ifValue(validator:Validator<TValue>):Validator<TValue>{
  return function(value: TValue) {
    if (!value) return '';
    return validator(value);
  };
}

// Usage
// validators: [ifValue(mySimplerValidator)]
```

* TODO: add `debounce` function to validation.
* TODO: document `debounce` function to validation.
* TODO: consider `validation.ifValue` as a part of core.
