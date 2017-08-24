import {ComposibleValidatable, Validator} from "./types";
import {FormState} from "./formState";
import {ViewComposibleValidatable} from "./ViewComposibleValidatable";
import {ErrorOr, mapErrorOr} from "./ErrorOr";

export class ViewFormState<Wrapped, TValue>
  extends ViewComposibleValidatable<Wrapped, TValue>
  implements FormState<TValue> {

  protected wrapped: FormState<Wrapped>;

  constructor(wrapped: FormState<Wrapped>, to: (t: Wrapped) => TValue) {
    super(wrapped, to);
    this.wrapped = wrapped;
    this.to = to;
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

  get validatedSubFields(): ComposibleValidatable<any>[] {
  return this.wrapped.validatedSubFields;
}

  clearFormError() {
    return this.wrapped.clearFormError();
  }

  compose() {
    this.wrapped.compose();
    return this;
  };

  disableAutoValidation() {
    this.wrapped.disableAutoValidation();
    return this;
  };

  enableAutoValidation = () => {
    this.wrapped.enableAutoValidation();
    return this
  };

  enableAutoValidationAndValidate: () => Promise<ErrorOr<TValue>> =
    () => this.wrapped.enableAutoValidationAndValidate()
      .then(res => mapErrorOr(res, this.to));

  validators = (...vals: Validator<TValue>[]): this => {
    this.wrapped.validators(...vals.map(v => (t: Wrapped) => v(this.to(t))));
    return this;
  };

  viewedAs<T>(to: (t: TValue) => T): FormState<T> {
    return new ViewFormState<TValue, T>(this, to);
  }
}
