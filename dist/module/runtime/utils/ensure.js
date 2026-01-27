export function ensure(check, timeout = 50, maxTries = 20) {
  return new Promise((resolve, reject) => {
    _ensureWithCallback(check, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    }, timeout, maxTries);
  });
}
function _ensureWithCallback(check, callback, timeout = 50, maxTries = 20) {
  if (check()) {
    return callback(void 0);
  }
  setTimeout(() => {
    _ensureWithCallback(check, callback, timeout, maxTries - 1);
  }, timeout);
  if (maxTries === 0) {
    callback(new Error("Max tries reached"));
  }
}
