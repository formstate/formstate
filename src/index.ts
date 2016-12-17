import { observable, action, computed } from 'mobx';
import * as utils from './internal/utils';


/** A truthy string or falsy values */
export type ValidationResponse =
  string
  | null
  | undefined
  | false

/**
 * A validator simply takes a value and returns a string or Promise<string>
 * If a truthy string is returned it represents a validation error
 **/
export interface Validator<TValue> {
  (value: TValue): ValidationResponse | Promise<ValidationResponse>;
}

/**
 * Runs the value through a list of validators. As soon as a validation error is detected, the error is returned
 */
export function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]): Promise<string> {
  return new Promise(resolve => {
    let currentIndex = 0;

    let gotoNextValidator = () => {
      currentIndex++;
      runCurrentValidator();
    }

    let runCurrentValidator = () => {
      if (currentIndex == validators.length) {
        resolve(null);
        return;
      }
      let validator = validators[currentIndex];
      let res: any = validator(value);

      // no error
      if (!res) {
        gotoNextValidator();
        return;
      }

      // some error
      if (!res.then) {
        resolve(res);
        return;
      }

      // wait for error response
      res.then((msg) => {
        if (!msg) gotoNextValidator();
        else resolve(msg);
      })
    }

    // kickoff
    runCurrentValidator();
  });
}


/** Anything that provides this interface can be composed into the validation system */
export interface Validatable<TValue> {
  validating: boolean;
  validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }>;
  hasError: boolean;
  error?: string;
  safeValue: TValue;
}

/**
 * Helps maintain the value + error information about a field
 *
 * This is the glue between the *page* and *field* in the presence of invalid states.
 */
export class FieldState<TValue> implements Validatable<TValue> {
  /**
   * The value is stored in the field. May or may not be *valid*.
   */
  @observable hotValue: TValue;

  /** If there is any error on the field on last validation attempt */
  @observable error?: string;

  /** The value set from code or a hot value that's been validated */
  @observable safeValue: TValue;

  @observable private autoValidationEnabled = true;
  @action public enableAutoValidationAndValidate = () => {
    this.autoValidationEnabled = true;
    this.validate();
  }
  @action public disableAutoValidation = () => {
    this.autoValidationEnabled = false;
  }

  constructor(private config: {
    value: TValue,
    onUpdate?: (state: FieldState<TValue>) => any,
    validators?: Validator<TValue>[],

    autoValidationEnabled?: boolean,
    autoValidationDebounceMs?: number,
  }) {
    this.hotValue = config.value;
    this.safeValue = config.value;

    /**
     * Automatic validation configuration
     */
    this.queueValidation = utils.debounce(this.validate, config.autoValidationDebounceMs || 200);
    this.autoValidationEnabled = config.autoValidationEnabled == undefined ? true : config.autoValidationEnabled;
  }

  /** On change on the component side */
  @action onHotChange = (value: TValue) => {
    // Immediately set for local ui binding
    this.hotValue = value;
    this.onUpdate();
    if (this.autoValidationEnabled) {
      this.queueValidation();
    }
  }

  /**
   * If the page wants to reinitialize the field with a new value,
   * it should call this function
   */
  @action reinitValue = (value: TValue) => {
    // This value vetos all previous values
    this.hotValue = value;
    this.error = undefined;
    this.safeValue = value;
    this.onUpdate();
  }

  get hasError() {
    return !!this.error;
  }

  @observable validating: boolean = false;

  /**
   * Runs validation on the current value immediately
   */
  @observable private lastValidationRequest: number = 0;
  @action validate = (): Promise<{ hasError: true } | { hasError: false, value: TValue }> => {
    this.lastValidationRequest++;
    const lastValidationRequest = this.lastValidationRequest;
    this.validating = true;
    const value = this.hotValue;
    return applyValidators(this.hotValue, this.config.validators || [])
      .then(fieldError => {
        if (this.lastValidationRequest !== lastValidationRequest) return;
        this.validating = false;

        /** For any change in field error, update our error */
        if (fieldError != this.error) {
          this.error = fieldError;
        }

        this.onUpdate();

        const hasError = this.hasError;
        if (hasError) {
          return { hasError };
        }
        else {
          this.safeValue = value;
          return {
            hasError,
            value
          };
        }
      });
  }

  /**
   * Runs validation with debouncing to keep the UI super smoothly responsive
   */
  @action private queueValidation = utils.debounce(this.validate, 200);

  @action private onUpdate = () => {
    this.config.onUpdate && this.config.onUpdate(this);
  }
}

/** Each key of the object is a validatable */
export type ValidatableMap =
  { [key: string]: Validatable<any> }

/**
 * Just a wrapper around the helpers for a set of FieldStates or FormStates
 */
export class FormState<TValue extends ValidatableMap> implements Validatable<TValue> {
  constructor(
    /**
     * SubItems can be any Validatable
     */
    public safeValue: TValue
  ) {
  }

  @observable validating = false;

  /**
   * - Re-runs validation on all fields
   * - returns `hasError`
   * - if no error also return the validated values against each key.
   */
  @action validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }> {
    this.validating = true;
    const keys = Object.keys(this.safeValue);
    return Promise.all(keys.map((key) => this.safeValue[key].validate())).then((res) => {
      this.validating = false;
      const hasError = this.hasError;
      if (hasError) {
        return { hasError };
      }
      else {
        return { hasError, value: this.safeValue };
      }
    })
  }

  /**
   * Does any field have an error
   */
  @computed get hasError() {
    return Object.keys(this.safeValue).map((key) => this.safeValue[key]).some(f => f.hasError);
  }

  /**
   * The first error from any sub if any
   */
  @computed get error() {
    const subItemWithError = Object.keys(this.safeValue).map((key) => this.safeValue[key]).find(f => !!f.hasError);
    return subItemWithError.error;
  }
}
