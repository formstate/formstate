import { isObservableMap } from "mobx"

/**
 * Debounce
 */
var now = () => new Date().getTime();
export function debounce<T extends Function>(func: T, milliseconds: number, immediate = false): T {
  var timeout: any, args: any, context: any, timestamp: any, result: any;

  var wait = milliseconds;

  var later = function () {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return <any>function () {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

export function isMapLike(thing: any) {
  return isObservableMap(thing)
    || (typeof Map !== 'undefined' && thing instanceof Map);
}

export function isPromiseLike(arg: any): arg is Promise<any> {
  return arg != null && typeof arg === "object" && typeof arg.then === "function";
}
