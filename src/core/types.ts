import * as utils from '../internal/utils';


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
export function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]): Promise<string | null | undefined> {
  return new Promise<string | null | undefined>(resolve => {
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
      res.then((msg: any) => {
        if (!msg) gotoNextValidator();
        else resolve(msg);
      })
    }

    // kickoff
    runCurrentValidator();
  });
}


/** Anything that provides this interface can be plugged into the validation system */
export interface Validatable<TValue> {
  validating: boolean;
  validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }>;
  hasError: boolean;
  error?: string | null | undefined;
  $: TValue;
  enableAutoValidation: () => void;
}

/**
 * Composible fields (fields that work in conjuction with a parent FormState)
 */
export interface ComposibleValidatable<TValue> extends Validatable<TValue> {
  /** Used to tell the parent about validation */
  on$ChangeAfterValidation: () => void;
  on$Reinit: () => void;

  /** Used by the parent to register listeners */
  setCompositionParent: (config: {
    on$ChangeAfterValidation: () => void;
    on$Reinit: () => void;
  }) => void;
}
