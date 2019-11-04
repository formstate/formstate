import { isPromiseLike } from "../internal/utils"

/** A truthy string or falsy values */
export type ValidationResponse =
  string
  | null
  | undefined
  | false

/** The return value of a validator */
export type ValidatorResponse = 
  ValidationResponse
  | Promise<ValidationResponse>

/**
 * A validator simply takes a value and returns a string or Promise<string>
 * If a truthy string is returned it represents a validation error
 **/
export interface Validator<TValue> {
  (value: TValue): ValidatorResponse;
}

/**
 * Runs the value through a list of validators. 
 * - As soon as a validation error is detected, the error is returned
 * - As soon as a validator dies unexpectedly (throws an error), we throw the same error.
 */
export function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]): Promise<string | null | undefined> {
  return new Promise<string | null | undefined>((resolve, reject) => {
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
      let res = validator(value);

      // no error
      if (!res) {
        gotoNextValidator();
        return;
      }

      // some error
      if (!isPromiseLike(res)) {
        resolve(res);
        return;
      }

      // wait for validator response
      res.then((msg: any) => {
        // no error
        if (!msg) gotoNextValidator();
        // some error
        else resolve(msg);
      }).catch(reject)
    }

    // kickoff
    runCurrentValidator();
  });
}


/** Anything that provides this interface can be plugged into the validation system */
export interface Validatable<TValue> {
  validating: boolean;
  validate(): Promise<{ hasError: true } | { hasError: false, value: unknown }>;
  hasError: boolean;
  error?: string | null | undefined;
  $: TValue;
  enableAutoValidation: () => void;
  disableAutoValidation: () => void;
}

/**
 * Composible fields (fields that work in conjuction with a parent FormState)
 */
export interface ComposibleValidatable<TValue> extends Validatable<TValue> {
  /** Allows a convinient reset for all fields */
  reset: () => void;
  getRawValues: () => unknown;

  /** Used to tell the parent about validation */
  _on$ValidationPass: () => void;
  _on$Reinit: () => void;

  /** Used by the parent to register listeners */
  _setCompositionParent: (config: {
    on$ValidationPass: () => void;
    on$Reinit: () => void;
  }) => void;
}
