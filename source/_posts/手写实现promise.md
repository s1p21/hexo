---
title: 手写实现promise
date: 2022-11-29 20:46:39
tags: [面试, promise]
---

```js 
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class myPromise {
  constructor(executor) {
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }
  status = PENDING;
  value = null;
  reason = null;
  onFulfilledCallbacks = [];
  // 存储失败回调函数
  onRejectedCallbacks = [];

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;

      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()(value);
      }
    }
  };

  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(value);
      }
    }
  };

  then(onFulFilled, onRejected) {
    const realOnFulFilled =
      typeof onFulFilled === "function" ? onFulFilled : (value) => value;
    const realOnRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };
    const promise2 = new myPromise((resolve, reject) => {
      const fulfilledMicroTask = () => {
        queueMicrotask(() => {
          try {
            const x = realOnFulFilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      const rejectMicroTask = () => {
        queueMicrotask(() => {
          try {
            const x = realOnRejected(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };
      switch (this.status) {
        case FULFILLED:
          fulfilledMicroTask();
          break;
        case REJECTED:
          rejectMicroTask();
          break;
        case PENDING:
          this.onFulfilledCallbacks.push(fulfilledMicroTask);
          this.onRejectedCallbacks.push(rejectMicroTask);
          break;
        default:
          break;
      }
      return promise2;
    });
  }

  static resolve(param) {
    if (param instanceof myPromise) {
      return param;
    }
    return myPromise((resolve) => {
      resolve(param);
    });
  }

  static reject(reason) {
    return myPromise((resolve, reject) => {
      reject(reason);
    });
  }

  resolvePromise = (promise2, x, resolve, reject) => {
    if (promise2 === x) {
      return reject(new TypeError("链式循环"));
    }
    if (x instanceof myPromise) {
      x.then(resolve, reject);
    } else {
      resolve(x);
    }
  };

  promiseAll = (promises) => {
    return new myPromise((resolve, reject) => {
      if (!isArray(promises)) {
        return reject(new TypeError("必须是数组"));
      }
      let resolveCounter = 0;
      let promiseNum = promises.length;
      let resolvedValue = [];
      for (let i = 0; i < promiseNum; i++) {
        (function (i) {
          Promise.resolve(promises[i]).then(
            (value) => {
              resolveCounter++;
              resolvedValue[i] = value;
              if (resolveCounter === promiseNum) {
                return resolve(resolvedValue);
              }
            },
            function (reason) {
              return reject(reason);
            }
          );
        })(i);    
      }
    });
  };

  promiseRace = (promises) => {
    if (!isArray(promises)) {
        return reject(new Error("必须是数组"));
      }
      return new myPromise((resolve,reject)=>{
        for (let i = 0; i < promises.length; index++) {
            myPromise[i].then(resolve,reject)
            
        }
      })
  }
}
```

