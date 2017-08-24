import {FormStateLazy} from "./formStateLazy";
import {ViewValidatable} from "./ViewValidatable";
import {Validator} from "./types";

export class ViewFormStateLazy<Wrapped, TValue> extends ViewValidatable<Wrapped, TValue> implements FormStateLazy<TValue> {
  protected wrapped: FormStateLazy<Wrapped>;

  constructor(wrapped: FormStateLazy<Wrapped>, to: (t: Wrapped) => TValue) {
    super(wrapped, to);
    this.wrapped = wrapped;
  };

  validators = (...vals: Validator<TValue>[]): FormStateLazy<TValue> => {
    this.wrapped.validators(...vals.map(v => (t: Wrapped) => v(this.to(t))));
    return this;
  };

  get fieldError() {
    return this.wrapped.fieldError;
  }

  get formError() {
    return this.wrapped.formError;
  }

  get hasFieldError() {
    return this.wrapped.hasFieldError;
  }

  get hasFormError() {
    return this.wrapped.hasFormError;
  }

  get showFormError() {
    return this.wrapped.showFormError;
  }

  clearFormError() {
    return this.wrapped.clearFormError();
  }

  viewedAs<T>(to: (tValue: TValue) => T): FormStateLazy<T> {
    return new ViewFormStateLazy<TValue, T>(this, to);
  }
}
