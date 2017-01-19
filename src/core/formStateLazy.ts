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
    private getFields: () => TValue
  ) { }

  @observable validating = false;

  @action validate() {
    this.validating = true;
    return Promise.all(this.getFields().map((value) => value.validate())).then(action((_) => {
      this.validating = false;
      return { hasError: this.hasError };
    }));
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
