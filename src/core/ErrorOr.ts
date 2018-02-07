export type ErrorOr<T> = { hasError: true } | { hasError: false, value: T };

export const mapErrorOr = <T1, T2>(res: ErrorOr<T1>, f: (t1: T1) => T2): ErrorOr<T2> =>
  res.hasError ? res : {hasError: false, value: f(res.value)};

