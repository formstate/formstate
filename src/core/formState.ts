import { observable, action, computed, runInAction, isObservable, isArrayLike } from 'mobx';
import { ComposibleValidatable, Validator, applyValidators } from './types';

/** Each key of the object is a validatable */
export type ValidatableMapOrArray =
  { [key: string]: ComposibleValidatable<any> }
  | ComposibleValidatable<any>[]

/**
 * Just a wrapper around the helpers for a set of FieldStates or FormStates
 */
export class FormState<TValue extends ValidatableMapOrArray> implements ComposibleValidatable<TValue> {
  protected mode: 'array' | 'map' = 'map';
  constructor(
    /**
     * SubItems can be any Validatable
     */
    public $: TValue
  ) {
    this.mode = isArrayLike($) ? 'array' : 'map';

    /** If they didn't send in something observable make the local $ observable */
    if (!isObservable(this.$)) {
      this.$ = observable(this.$);
    }
  }

  /** Get validatable objects from $ */
  protected getValues = (): ComposibleValidatable<any>[] => {
    if (this.mode === 'array') return (this.$ as any);
    const keys = Object.keys(this.$);
    return keys.map((key) => this.$[key]);
  }

  @observable validating = false;

  protected _validators: Validator<TValue>[] = [];
  @action validators = (...validators: Validator<TValue>[]) => {
    this._validators = validators;
    return this;
  }

  /**
   * - Re-runs validation on all fields
   * - returns `hasError`
   * - if no error also return the validated values against each key.
   */
  @action async validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }> {
    this.validating = true;
    const values = this.getValues();
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

      this.on$ChangeAfterValidation();
      return { hasError: false as false, value: this.$ };
    });

    return res;
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
    return this.getValues().some(f => f.hasError);
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
    const subItemWithError = this.getValues().find(f => !!f.hasError);
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

  /**
   * Auto validation
   */
  @observable protected autoValidationEnabled = false;
  @action public enableAutoValidation = () => {
    this.autoValidationEnabled = true;
    this.getValues().forEach(x => x.enableAutoValidation());
  }
  @action public enableAutoValidationAndValidate = () => {
    this.autoValidationEnabled = true;
    return this.validate();
  }
  @action public disableAutoValidation = () => {
    this.autoValidationEnabled = false;
  }

  /**
   * Composible field validation tracking
   */
  @observable validatedSubFields: ComposibleValidatable<any>[] = [];

  /**
   * Composible fields (fields that work in conjuction with FormState)
   */
  @action compose() {
    const values = this.getValues();
    values.forEach(value => value.setCompositionParent(
      {
        on$Reinit: action(() => {
          this.validatedSubFields = this.validatedSubFields.filter(v => v !== value);
        }),
        on$ChangeAfterValidation: action(() => {
          /** Always clear the form error as its no longer relevant */
          if (this.hasFormError) {
            this.clearFormError();
          }

          /** Add the field to the validated sub fields */
          if (this.validatedSubFields.indexOf(value) === -1) {
            this.validatedSubFields.push(value);
          }

          /**
           * If no field has error
           * and all subfields are validated
           *  then re-validate the form */
          if (!this.hasFieldError
            && !this.getValues().some(value => this.validatedSubFields.indexOf(value) === -1)
          ) {
            this.validate();
          }
        })
      }
    ))
    return this;
  }

  @action on$ChangeAfterValidation = () => { }
  @action on$Reinit = () => { }
  @action setCompositionParent = (config: {
    on$ChangeAfterValidation: () => void;
    on$Reinit: () => void;
  }) => {
    this.on$ChangeAfterValidation = config.on$ChangeAfterValidation;
    this.on$Reinit = config.on$Reinit;
  }
}
