import { observable, action, computed, runInAction } from 'mobx';
import { Validatable, Validator, applyValidators } from './types';

/** Each item in the array is a validatable */
export type ValidatableArray = Validatable<any>[];

/**
 * Makes it easier to work with dynamically maintained array
 */
export class FormStateLazy<TValue extends ValidatableArray> implements Validatable<TValue> {
  @computed get $() {
    return this.getFields();
  }
  constructor(
    /** It is a function as fields can change over time */
    protected getFields: () => TValue
  ) { }

  @observable validating = false;

  protected _validators: Validator<TValue>[] = [];
  @action validators = (...validators: Validator<TValue>[]) => {
    this._validators = validators;
    return this;
  }

  @action async validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }> {
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

  @action enableAutoValidation = () => {
    this.getFields().forEach(x => x.enableAutoValidation());
  }
  @action disableAutoValidation = () => {
    this.getFields().forEach(x => x.disableAutoValidation());
  }


  @observable protected _error: string | null | undefined = '';

  /**
   * Does any field or form have an error
   */
  @computed get hasError() {
    return this.hasFieldError || this.hasFormError;
  }

  /**
   * Does any field have an error
   */
  @computed get hasFieldError() {
    return this.getFields().some(f => f.hasError);
  }

  /**
   * Does form level validation have an error
   */
  @computed get hasFormError() {
    return !!this._error;
  }

  /**
   * Call it when you are `reinit`ing child fields
   */
  @action clearFormError() {
    this._error = '';
  }

  /**
   * Error from some sub field if any
   */
  @computed get fieldError() {
    const subItemWithError = this.getFields().find(f => !!f.hasError);
    return subItemWithError ? subItemWithError.error : null;
  }

  /**
   * Error from form if any
   */
  @computed get formError() {
    return this._error;
  }

  /**
   * The first error from any sub (if any) or form error
   */
  @computed get error() {
    return this.fieldError || this.formError;
  }

  /**
   * You should only show the form error if there are no field errors
   */
  @computed get showFormError() {
    return !this.hasFieldError && this.hasFormError;
  }
}
