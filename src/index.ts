import { observable, action, computed } from 'mobx';
import * as utils from './internal/utils';

/**
 * A validator simply takes a value and returns a string or Promise<string>
 * If a string is returned it represents a validation error
 **/
export interface Validator<TValue> {
  (value: TValue): string | Promise<string>;
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
}

/** Each key of the object is a validatable */
export type ValidatableMap<T> =
  {[K in keyof T]: Validatable<T[K]>}
  & { [key: string]: Validatable<any> }

/**
 * Helps maintain the value + error information about a field
 *
 * This is the glue between the *page* and *field* in the presence of invalid states.
 */
export class FieldState<TValue> implements Validatable<TValue> {
  /**
   * The value is stored in the field. May or may not be *valid*.
   */
  @observable value: TValue;

  /** If there is any error on the field on last validation attempt */
  @observable error?: string;

  constructor(public config: {
    value: TValue,
    onUpdate?: (state: FieldState<TValue>) => any,
    validators?: Validator<TValue>[],
  }) {
    this.value = config.value;
  }

  /** On change on the component side */
  @action onChange = (value: TValue) => {
    // Immediately set for local ui binding
    this.value = value;
    this.onUpdate();
    this.refreshError();
  }

  /** On change on the page side */
  @action setValue = (value: TValue) => {
    // This value vetos all previous values
    this.value = value;
    this.error = undefined;
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
    const value = this.value;
    return applyValidators(this.value, this.config.validators || [])
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
  @action refreshError = utils.debounce(this.validate, 200);

  @action onUpdate = () => {
    this.config.onUpdate && this.config.onUpdate(this);
  }
}


/**
 * Just a wrapper around the helpers for a set of FieldStates or FormStates
 */
export class FormState<TValue> implements Validatable<TValue> {
  constructor(
    /**
     * SubItems can be any Validatable
     */
    @action private subItems: ValidatableMap<TValue>
  ) { }

  @observable validating = false;

  /**
   * - Re-runs validation on all fields
   * - returns `hasError`
   * - if no error also return the validated values against each key.
   */
  @action validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }> {
    this.validating = true;
    const keys = Object.keys(this.subItems);
    return Promise.all(keys.map((key) => this.subItems[key].validate())).then((res) => {
      this.validating = false;
      const hasError = this.hasError;
      if (hasError) {
        return { hasError };
      }
      else {
        const value: TValue = {} as any;
        keys.forEach((key, i) => {
          const item = res[i];
          // Will not happen. Just to tell the type checker that value access is safe
          if (item.hasError == true) return;
          value[key] = item.value;
        });
        return { hasError, value: value };
      }
    })
  }

  /**
   * Does any field have an error
   */
  @computed get hasError() {
    return Object.keys(this.subItems).map((key) => this.subItems[key]).some(f => f.hasError);
  }
}
