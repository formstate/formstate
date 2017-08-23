import {FieldState} from "./fieldState";
import {Validator} from "./types";
import {ViewComposibleValidatable} from "./ViewComposibleValidatable";
import {mapErrorOr} from "./ErrorOr";

export class ViewFieldState<Wrapped, TValue> extends ViewComposibleValidatable<Wrapped, TValue> implements FieldState<TValue> {
  protected wrapped: FieldState<Wrapped>;
  private from: (t: TValue) => Wrapped;

  constructor(wrapped: FieldState<Wrapped>, from: (t: TValue) => Wrapped, to: (t: Wrapped) => TValue) {
    super(wrapped, to);
    this.wrapped = wrapped;
    this.to = to;
    this.from = from
  };

  get dirty() {
    return this.wrapped.dirty;
  }

  get hasBeenValidated(): boolean {
    return this.wrapped.hasBeenValidated
  }

  get value() {
    return this.to(this.wrapped.value);
  }

  disableAutoValidation = () => {
    this.wrapped.disableAutoValidation();
    return this;
  };

  enableAutoValidation = () => {
    this.wrapped.enableAutoValidation();
    return this
  };

  enableAutoValidationAndValidate = () =>
    this.wrapped.enableAutoValidationAndValidate().then(res => mapErrorOr(res, this.to));

  getAutoValidationDefault = () =>
    this.wrapped.getAutoValidationDefault();

  onDidChange = (handler: (config: { newValue: TValue; oldValue: TValue }) => any) => {
    this.wrapped.onDidChange(
      ({newValue, oldValue}) => handler({newValue: this.to(newValue), oldValue: this.to(oldValue)})
    );
    return this;
  };

  onChange = (value: TValue) =>
    this.wrapped.onChange(this.from(value));

  onUpdate = (handler: (state: FieldState<TValue>) => any) => {
    this.wrapped.onUpdate((state: FieldState<Wrapped>) => handler(state.viewedAs<TValue>(this.from, this.to)));
    return this;
  };

  queuedValidationWakeup = () =>
    this.wrapped.queuedValidationWakeup();

  reinitValue = (value?: TValue) =>
    this.wrapped.reinitValue(value && this.from(value));

  setAutoValidationDebouncedMs = (milliseconds: number) => {
    this.wrapped.setAutoValidationDebouncedMs(milliseconds);
    return this;
  };

  setAutoValidationDefault = (v: boolean) => {
    this.wrapped.setAutoValidationDefault(v);
    return this;
  };

  validators = (...vals: Validator<TValue>[]): FieldState<TValue> => {
    this.wrapped.validators(...vals.map(v => (t: Wrapped) => v(this.to(t))));
    return this;
  };

  viewedAs<T>(from: (t: T) => TValue, to: (tValue: TValue) => T): FieldState<T> {
    return new ViewFieldState<TValue, T>(this, from, to);
  }
}
