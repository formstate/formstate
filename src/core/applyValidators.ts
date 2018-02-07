import {Validator} from "./types";

/**
 * Runs the value through a list of validators. As soon as a validation error is detected, the error is returned
 */
export function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]): Promise<string | null | undefined> {
  return new Promise<string | null | undefined>(resolve => {
    let currentIndex = 0;

    let gotoNextValidator = () => {
      currentIndex++;
      runCurrentValidator();
    };

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
    };

    // kickoff
    runCurrentValidator();
  });
}
