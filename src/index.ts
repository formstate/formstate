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
  $: TValue;
  enableAutoValidation: () => void;
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
  @observable value: TValue;

  /** If there is any error on the field on last validation attempt */
  @observable error?: string;

  /** The value set from code or a hot value that's been validated */
  @observable $: TValue;

  @observable private autoValidationEnabled = true;
  @action public enableAutoValidation = () => {
    this.autoValidationEnabled = true;
  }
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
    this.value = config.value;
    this.$ = config.value;

    /**
     * Automatic validation configuration
     */
    this.queueValidation = utils.debounce(this.queuedValidationWakeup, config.autoValidationDebounceMs || 200);
    this.autoValidationEnabled = config.autoValidationEnabled == undefined ? true : config.autoValidationEnabled;
  }

  /** Trackers for validation */
  @observable private lastValidationRequest: number = 0;
  @observable private preventNextQueuedValidation = false;

  /** On change on the component side */
  @action onChange = (value: TValue) => {
    // no long prevent any debounced validation request
    this.preventNextQueuedValidation = false;

    // Immediately set for local ui binding
    this.value = value;
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
    // If a previous validation comes back ignore it
    this.preventNextQueuedValidation = true;

    // This value vetos all previous values
    this.value = value;
    this.error = undefined;
    this.$ = value;
    this.onUpdate();
  }

  get hasError() {
    return !!this.error;
  }

  @observable validating: boolean = false;

  /**
   * Runs validation on the current value immediately
   */
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

        /** Check for error */
        const hasError = this.hasError;

        /** If no error, copy over the value to validated value */
        if (!hasError) {
          this.$ = value;
        }

        /** before returning update */
        this.onUpdate();

        /** return a result based on error status */
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

  @action queuedValidationWakeup = () => {
    if (this.preventNextQueuedValidation) {
      this.preventNextQueuedValidation = false;
      return;
    }
    this.validate();
  }
  /**
   * Runs validation with debouncing to keep the UI super smoothly responsive
   * NOTE: also setup in constructor
   */
  @action private queueValidation = utils.debounce(this.queuedValidationWakeup, 200);

  @action private onUpdate = () => {
    this.config.onUpdate && this.config.onUpdate(this);
  }
}

/** Each key of the object is a validatable */
export type ValidatableMapOrArray =
  { [key: string]: Validatable<any> }
  | Validatable<any>[]

/**
 * Just a wrapper around the helpers for a set of FieldStates or FormStates
 */
export class FormState<TValue extends ValidatableMapOrArray> implements Validatable<TValue> {
  private mode: 'array' | 'map' = 'map';
  constructor(
    /**
     * SubItems can be any Validatable
     */
    public $: TValue
  ) {
    /**
     * Note:
     * - not use isArray as it might be an observable
     * - not using `undefined` as length might be a subfield
     **/
    this.mode = typeof ($ as any).length === 'number' ? 'array' : 'map';
  }

  /** Get validatable objects from $ */
  private getValues = (): Validatable<any>[] => {
    if (this.mode === 'array') return (this.$ as any);
    const keys = Object.keys(this.$);
    return keys.map((key) => this.$[key]);
  }

  @observable validating = false;

  @action enableAutoValidation = () => {
    this.getValues().forEach(x => x.enableAutoValidation());
  }

  /**
   * - Re-runs validation on all fields
   * - returns `hasError`
   * - if no error also return the validated values against each key.
   */
  @action validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }> {
    this.validating = true;
    const values = this.getValues();
    return Promise.all(values.map((value) => value.validate())).then((res) => {
      this.validating = false;
      const hasError = this.hasError;
      if (hasError) {
        return { hasError };
      }
      else {
        return { hasError, value: this.$ };
      }
    })
  }

  /**
   * Does any field have an error
   */
  @computed get hasError() {
    return this.getValues().some(f => f.hasError);
  }

  /**
   * The first error from any sub if any
   */
  @computed get error() {
    const subItemWithError = this.getValues().find(f => !!f.hasError);
    return subItemWithError.error;
  }
}


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
    private getFields: () => TValue
  ) { }

  @observable validating = false;

  @action validate() {
    this.validating = true;
    return Promise.all(this.getFields().map((value) => value.validate())).then((res) => {
      this.validating = false;
      return { hasError: this.hasError };
    })
  }

  @action enableAutoValidation = () => {
    this.getFields().forEach(x => x.enableAutoValidation());
  }

  @computed get hasError() {
    return this.getFields().some(f => f.hasError);
  }

  @computed get error() {
    const subItemWithError = this.getFields().find(f => !!f.hasError);
    return subItemWithError.error;
  }
}
