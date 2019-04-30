# 1.2.0
* `enableAutoValidation` `enableAutoValidationAndValidate` `disableAutoValidation` functions on `FormState` should consistently always toggle the `autoValidation` state for *both* itself and its children. [ref](https://github.com/formstate/formstate/issues/67)

# 1.1.1
* If a validator dies unexpectedly (throws an error/exception) the `validate` call does the same instead of silently ignoring it. Should not cause any change if your validators worked previously. 

# 1.1.0
* Added support for `Map` in `FormState` class.

# 1.0.1
* Fixed `Cannot assign to read only property 'on$ChangeAfterValidation'`. This is due to a breaking change in MobX.

# 1.0.0
* 🎉 1.0.0
* `FieldState.reinitValue` is now called `reset`. `reset` is also an operation supported on `FormState` and resets all the sub fields. ([commit](https://github.com/formstate/formstate/commit/5e6eefbe3fd8843740a905d98d6767ee35ad4963))
