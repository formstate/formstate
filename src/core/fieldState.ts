import { observable, action, runInAction, makeObservable } from 'mobx';
import { ComposibleValidatable, Validator, applyValidators } from './types';
import { debounce } from '../internal/utils';

/**
 * Helps maintain the value + error information about a field
 *
 * This is the glue between the *page* and *field* in the presence of invalid states.
 */
export class FieldState<TValue> implements ComposibleValidatable<TValue> {
  /**
   * The value you should bind to the input in your field.
   */
  value: TValue;

  /** If there is any error on the field on last validation attempt */
  error?: string;

  /**
   * Allows you to set an error on a field lazily
   * Use case:
   *  You validate some things on client (e.g. isRequired)
   *  You then validate the field on the backend with an explict action (e.g. continue button)
   *  You now want to highlight an error from the backend for this field
   **/
  setError(error: string) {
    this.error = error;
  }

  /** If the field has been touched */
  dirty?: boolean = false;

  /** The value set from code or a `value` that's been validated */
  $: TValue;

  /**
   * Set to true if a validation run has been completed since init
   * Use case:
   * - to show a green color in the field : `hasError == false && hasBeenValidated == true`
   **/
  hasBeenValidated: boolean = false;

  /**
   * Allows you to preserve the `_autoValidationEnabled` value across `reinit`s
   */
  protected _autoValidationDefault = true;
  public setAutoValidationDefault = (autoValidationDefault: boolean) => {
    this._autoValidationDefault = autoValidationDefault;
    this._autoValidationEnabled = autoValidationDefault;
    return this;
  }
  public getAutoValidationDefault = () => this._autoValidationDefault;

  protected _autoValidationEnabled = this._autoValidationDefault;
  public enableAutoValidation = () => {
    this._autoValidationEnabled = true;
    return this;
  }
  public enableAutoValidationAndValidate = () => {
    this._autoValidationEnabled = true;
    return this.validate();
  }
  public disableAutoValidation = () => {
    this._autoValidationEnabled = false;
    return this;
  }

  constructor(private _initValue: TValue) {
    makeObservable<FieldState<TValue>, "_autoValidationDefault" | "_autoValidationEnabled" | "executeOnUpdate" | "executeOnDidChange" | "lastValidationRequest" | "preventNextQueuedValidation">(this, {
      value: observable,
      error: observable,
      setError: action,
      dirty: observable,
      $: observable,
      hasBeenValidated: observable,
      _autoValidationDefault: observable,
      setAutoValidationDefault: action,
      getAutoValidationDefault: action,
      _autoValidationEnabled: observable,
      enableAutoValidation: action,
      enableAutoValidationAndValidate: action,
      disableAutoValidation: action,
      validators: action,
      onUpdate: action,
      executeOnUpdate: action,
      onDidChange: action,
      executeOnDidChange: action,
      setAutoValidationDebouncedMs: action,
      lastValidationRequest: observable,
      preventNextQueuedValidation: observable,
      onChange: action,
      reset: action,
      validating: observable,
      validate: action,
      queuedValidationWakeup: action,
      _setCompositionParent: action
    });

    runInAction(() => {
      this.value = _initValue;
      this.$ = _initValue;
      /**
       * Automatic validation configuration
       */
      this.queueValidation = action(debounce(this.queuedValidationWakeup, 200));
      this._autoValidationEnabled = true;
    })
  }

  protected _validators: Validator<TValue>[] = [];
  validators = (...validators: Validator<TValue>[]) => {
    this._validators = validators;
    return this;
  }
  protected _onUpdate: (state: FieldState<TValue>) => any;
  /**
   * onUpdate is called whenever we change something in our local state that is significant
   * - any validation() call
   * - any reset() call
   */
  public onUpdate = (handler: (state: FieldState<TValue>) => any) => {
    this._onUpdate = handler;
    return this;
  }
  protected executeOnUpdate = () => {
    this._onUpdate && this._onUpdate(this);
  }

  /**
   * Allows you to take actions in your code based on `value` changes caused by user interactions
   */
  protected _onDidChange: (config: { newValue: TValue, oldValue: TValue }) => any;
  public onDidChange = (handler: (config: { newValue: TValue, oldValue: TValue }) => any) => {
    this._onDidChange = handler;
    return this;
  }
  protected executeOnDidChange = (config: { newValue: TValue, oldValue: TValue }) => {
    this._onDidChange && this._onDidChange(config);
  }

  public setAutoValidationDebouncedMs = (milliseconds: number) => {
    this.queueValidation = action(debounce(this.queuedValidationWakeup, milliseconds));
    return this;
  }

  /** Trackers for validation */
  protected lastValidationRequest: number = 0;
  protected preventNextQueuedValidation = false;

  /** On change on the component side */
  onChange = (value: TValue) => {
    // no long prevent any debounced validation request
    this.preventNextQueuedValidation = false;

    // Store local old value for onDidChange
    const oldValue = this.value;
    // Immediately set for local ui binding
    this.value = value;

    // Call on did change if any
    this.executeOnDidChange({ newValue: value, oldValue });

    this.dirty = true;
    this.executeOnUpdate();
    if (this._autoValidationEnabled) {
      this.queueValidation();
    }
  }

  /**
   * If the page wants to reinitialize the field,
   * it should call this function
   */
  reset = (value: TValue = this._initValue) => {
    // If a previous validation comes back ignore it
    this.preventNextQueuedValidation = true;

    // This value vetos all previous values
    this._autoValidationEnabled = this._autoValidationDefault;
    this.value = value;
    this.error = undefined;
    this.dirty = false;
    this.hasBeenValidated = false;
    this.$ = value;
    this._on$Reinit();
    this.executeOnUpdate();
  }

  get hasError() {
    return !!this.error;
  }

  validating: boolean = false;

  /**
   * Runs validation on the current value immediately
   */
  validate = (): Promise<{ hasError: true } | { hasError: false, value: TValue }> => {
    this.lastValidationRequest++;
    const lastValidationRequest = this.lastValidationRequest;
    this.validating = true;
    const value = this.value;
    return applyValidators(this.value, this._validators || [])
      .then(action((fieldError: string) => {

        /**
         * If validation comes back out of order then the result of this validation is not siginificant
         * We simply copy the value from the last validation attempt
         */
        if (this.lastValidationRequest !== lastValidationRequest) {
          if (this.hasError) {
            return { hasError: true as true };
          }
          else {
            return {
              hasError: false as false,
              value: this.$,
            };
          }
        }

        this.validating = false;
        this.hasBeenValidated = true;

        /** For any change in field error, update our error */
        if (fieldError != this.error) {
          this.error = fieldError;
        }

        /** Check for error */
        const hasError = this.hasError;

        /** If no error */
        if (!hasError) {
          /** Copy over the value to validated value */
          if (this.$ !== value) {
            this.$ = value;
          }
          /** Trigger any form level validations if required */
          this._on$ValidationPass();
        }

        /** before returning update */
        this.executeOnUpdate();

        /** return a result based on error status */
        if (hasError) {
          return { hasError: true as true };
        }
        else {
          return {
            hasError: false as false,
            value
          };
        }
      }));
  }

  queuedValidationWakeup = () => {
    if (this.preventNextQueuedValidation) {
      this.preventNextQueuedValidation = false;
      return;
    }
    this.validate();
  }
  /**
   * Runs validation with debouncing to keep the UI super smoothly responsive
   * NOTE:
   * - also setup in constructor
   * - Not using `action` from mobx *here* as it throws off our type definitions
   */
  protected queueValidation = debounce(this.queuedValidationWakeup, 200);

  /**
   * Composible fields (fields that work in conjuction with FormState)
   */
  _on$ValidationPass = () => { }
  _on$Reinit = () => { }
  _setCompositionParent = (config: {
    on$ValidationPass: () => void;
    on$Reinit: () => void;
  }) => {
    this._on$ValidationPass = () => runInAction(config.on$ValidationPass);
    this._on$Reinit = () => runInAction(config.on$Reinit);
  }
}
