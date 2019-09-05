import { DisplayValue } from "./displayValue";

export const displayValueRequired
  = (val: DisplayValue) => !val.value.trim() && 'Value required';
