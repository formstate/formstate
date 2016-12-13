# FormState

> Making form management simple

[Powered by your github ⭐s](https://github.com/basarat/formstate/stargazers).

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
      if (fst) return 'First failed';
      if (snd) return 'Second failed';
      return '';
    });
}]
```

### Why you need to handle empty values
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
