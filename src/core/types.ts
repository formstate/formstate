import {ErrorOr} from "./ErrorOr";

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

/** Anything that provides this interface can be plugged into the validation system */
export interface Validatable<TValue> {
  validating: boolean;
  validate(): Promise<ErrorOr<TValue>>;
  hasError: boolean;
  error?: string | null | undefined;
  $: TValue;
  enableAutoValidation: () => Validatable<TValue>;
}

/**
 * Composible fields (fields that work in conjuction with a parent FormState)
 */
export interface ComposibleValidatable<TValue> extends Validatable<TValue> {
  /** Allows a convinient reset for all fields */
  reset: () => void;

  /** Used to tell the parent about validation */
  on$ChangeAfterValidation: () => void;
  on$Reinit: () => void;

  /** Used by the parent to register listeners */
  setCompositionParent: (config: {
    on$ChangeAfterValidation: () => void;
    on$Reinit: () => void;
  }) => void;
}
