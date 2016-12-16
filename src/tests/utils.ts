/**
 * Resolves after a few ms
 */
export function delay(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}
