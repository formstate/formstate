import {action, computed, observable, runInAction} from 'mobx';
import {Validatable, Validator} from './types';
import {ViewFormStateLazy} from "./ViewFormStateLazy";
import {applyValidators} from "./applyValidators";
import {ErrorOr} from "./ErrorOr";

/** Each item in the array is a validatable */
export type ValidatableArray = Validatable<any>[];

export interface FormStateLazy<TValue> extends Validatable<TValue> {
  validators: (...validators: Validator<TValue>[]) => FormStateLazy<TValue>;
  /**
   * Does any field have an error
   */
  hasFieldError: boolean;
  /**
   * Does form level validation have an error
   */
  hasFormError: boolean;
  /**
   * Call it when you are `reinit`ing child fields
   */
  clearFormError: () => void;
  /**
   * Error from some sub field if any
   */
  fieldError: string | null | undefined;
  /**
   * Error from form if any
   */
  formError: string | null | undefined;
  /**
   * You should only show the form error if there are no field errors
   */
  showFormError: boolean;

  viewedAs<T>(to: (tValue: TValue) => T): FormStateLazy<T>
}

/**
 * Makes it easier to work with dynamically maintained array
 */
class FormStateLazyBase<TValue extends ValidatableArray> implements FormStateLazy<TValue> {
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

  @action async validate(): Promise<ErrorOr<TValue>> {
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
    return this;
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

  viewedAs<T>(to: (tValue: TValue) => T): FormStateLazy<T> {
    return new ViewFormStateLazy(this, to);
  }
}

export const FormStateLazy: new<TValue extends ValidatableArray>(getFields: () => TValue) => FormStateLazy<TValue> =
  FormStateLazyBase;
