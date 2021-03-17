import { observable, action, computed, runInAction, makeObservable } from 'mobx';
import { Validatable, Validator, applyValidators } from './types';

/** Each item in the array is a validatable */
export type ValidatableArray = Validatable<any>[];

/**
 * Makes it easier to work with dynamically maintained array
 */
export class FormStateLazy<TValue extends ValidatableArray> implements Validatable<TValue> {
  get $() {
    return this.getFields();
  }
  constructor(
    /** It is a function as fields can change over time */
    protected getFields: () => TValue
  ) {
    makeObservable<FormStateLazy<TValue>, "_error">(this, {
      $: computed,
      validating: observable,
      validators: action.bound,
      validate: action,
      enableAutoValidation: action.bound,
      disableAutoValidation: action.bound,
      _error: observable,
      hasError: computed,
      hasFieldError: computed,
      hasFormError: computed,
      clearFormError: action,
      fieldError: computed,
      formError: computed,
      error: computed,
      showFormError: computed
    });
  }

  validating = false;

  protected _validators: Validator<TValue>[] = [];
  validators (...validators: Validator<TValue>[]) {
    this._validators = validators;
    return this;
  }

  async validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }> {
    this.validating = true;
    const values = this.getFields();
    let fieldsResult = await Promise.all(values.map((value) => value.validate()));
    const done = runInAction(() => {
      if (fieldsResult.some(f => f.hasError)) {
        this.validating = false;
        return true;
      }
      return false
    });
    if (done) return { hasError: true as true };

    /** Otherwise do any local validations */
    const error = await applyValidators(this.$, this._validators || []);
    const res = runInAction(() => {
      if (error != this._error) {
        this._error = error;
      }
      this.validating = false;

      const hasError = !!error;
      if (hasError) {
        return { hasError: true as true };
      }
      return { hasError: false as false, value: this.$ };
    });

    return res;
  }

  enableAutoValidation() {
    this.getFields().forEach(x => x.enableAutoValidation());
  }
  disableAutoValidation() {
    this.getFields().forEach(x => x.disableAutoValidation());
  }


  protected _error: string | null | undefined = '';

  /**
   * Does any field or form have an error
   */
  get hasError() {
    return this.hasFieldError || this.hasFormError;
  }

  /**
   * Does any field have an error
   */
  get hasFieldError() {
    return this.getFields().some(f => f.hasError);
  }

  /**
   * Does form level validation have an error
   */
  get hasFormError() {
    return !!this._error;
  }

  /**
   * Call it when you are `reinit`ing child fields
   */
  clearFormError() {
    this._error = '';
  }

  /**
   * Error from some sub field if any
   */
  get fieldError() {
    const subItemWithError = this.getFields().find(f => !!f.hasError);
    return subItemWithError ? subItemWithError.error : null;
  }

  /**
   * Error from form if any
   */
  get formError() {
    return this._error;
  }

  /**
   * The first error from any sub (if any) or form error
   */
  get error() {
    return this.fieldError || this.formError;
  }

  /**
   * You should only show the form error if there are no field errors
   */
  get showFormError() {
    return !this.hasFieldError && this.hasFormError;
  }
}
