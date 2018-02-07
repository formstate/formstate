import {Validatable} from "./types";
import {ErrorOr, mapErrorOr} from "./ErrorOr";

export abstract class ViewValidatable<Wrapped, TValue>
  implements Validatable<TValue> {

  protected wrapped: Validatable<Wrapped>;
  protected to: (t: Wrapped) => TValue;

  constructor(wrapped: Validatable<Wrapped>, to: (t: Wrapped) => TValue) {
    this.wrapped = wrapped;
    this.to = to;
  };

  get error(): string | null | undefined {
    return this.wrapped.error;
  }

  get validating() {
    return this.wrapped.validating
  };

  get hasError() {
    return this.wrapped.hasError
  };

  get $(): TValue {
    return this.to(this.wrapped.$);
  }

  enableAutoValidation: () => Validatable<TValue> =
    () => {
      this.wrapped.enableAutoValidation();
      return this;
    };

  validate(): Promise<ErrorOr<TValue>> {
    return this.wrapped.validate().then(res => mapErrorOr(res, this.to))
  }
}
