---
title: RxJS与Promise的区别
date: 2023-01-12 19:15:13
tags: [RxJS,Promise]
---
RxJS 是 ReactiveX 项目的 JavaScript 实现。ReactiveX 项目旨在为不同编程语言的异步编程提供 API。
ReactiveX 的基本概念是 Gang of Four 的 Observer pattern (ReactiveX 甚至通过完成和错误通知扩展了 observer 模式)。因此，所有 ReactiveX 实现的核心抽象是 observable
那么，现在我们知道什么是 RxJS，但是什么是 observable 呢？让我们尝试从两个维度来理解它，并将其与其他已知抽象进行比较。维度是同步性/异步性和单个值/多个值。

### Rxjs 与Promise的区别

||单个值| 多个值 |
| ----------- | ----------- |----------- |
| 同步|get（常规的数据访问操作）|Interable|
| 异步|Promise|Observable|

对于一个 observable，我们可以说以下是正确的:
- 发送多个值
- 异步发出其值（“推送”）

让我们将前面介绍的 Promise 进行对比：
- ​发送单个值
- 异步发出其值（“推送”）

最后，让我们看一看 Iterable，这是一种存在于许多编程语言中的抽象，可用于迭代集合数据结构(如数组)的所有元素。对于迭代，要满足以下条件成立：
- 发送多个值
- 同步发出其值(“拉取”)

Observable 将 Iterable 带到异步世界。像 Iterable 一样，Observable 会计算并发射流值。但是，与 Iterable 不同，对于 Observable，调用代码不会同步提取每个值，但 Observable 将异步地将每个值尽快推入调用代码。为此，调用代码为 Observable 提供了一个处理函数，然后在 RxJS 中调用该函数，然后 Observable 针对其计算的每个值调用此函数。
Observable 发出的值可以是任何东西：数组的元素，HTTP 请求的结果（如果 Observable 发出的只是一个值，不必总是多个值就可以），用户输入事件（例如鼠标单击等）。这使 Observable 非常灵活。此外，由于 Observable 也只能发出单个值，因此 Observable 可以做 Promise 可以做的所有事情，但反之则不成立。

#### 单个值与多个值

promises 只能发出单个值。之后，它处于完成状态，只能用于查询该值，而不能再用于计算和发出新值。
observables 可以发出任意数量的值。


Promises:
```js
const promise = new Promise(resolve => {   
    resolve(1); 
    resolve(2); 
    resolve(3); 
}); 
promise.then(result => console.log(result)); 

// logs:// 1
```

只执行 executor 函数中解析的第一个 resolve 调用，并使用值 1 解析 promise。之后，promise 转移到完成状态，结果值不再变化。
Observables:
```js
import { Observable } from 'rxjs';

const observable = new Observable(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
});
observable.subscribe(result => console.log(result));
// logs:
// 1
// 2
// 3
```

#### 预解析与惰性的
promise 是预解析：一旦创建了 promise，就会调用执行程序函数 Executor。

Observable 是惰性的：仅当客户端订阅 Observable 时才调用 subscriber 函数。

Promises:
```js
const promise = new Promise(resolve => {
  console.log('- Executing');
  resolve();
});
console.log('- Subscribing');
promise.then(() => console.log('- Handling result'));
// logs:
// - Executing
// - Subscribing
// - Handling result
```

可以看到，在订阅 promise 之前，executor 函数已经执行了。
如果根本没有订阅承诺，甚至会执行 executor 函数。如果注释掉最后两行，就可以看到这一点:仍然输出- Executing。

Observables:
```js
import { Observable } from 'rxjs';
const observable = new Observable(observer => {
  console.log('- Executing');
  observer.next();
});
console.log('- Subscribing');
observable.subscribe(() => console.log('- Handling result'));
// logs:
// - Subscribing
// - Executing
// - Handling result
```

正如我们所看到的，subscriber 函数只在创建了对 Observable 的订阅之后执行。
如果将最后两行注释掉，则根本没有输出，因为 subscriber 函数将永远不会执行。
由于 Observable 不是在定义时执行的，而是在其他代码使用它们时才执行，所以它们也称为声明式(声明一个 Observable，但仅在使用它时才执行)。

#### 取消订阅

一旦使用 then 订阅了一个 promise，无论如何，传递给 then 的处理函数都将被调用。一旦 promise 执行开始，就不能告诉 promise 取消调用结果处理函数。
在使用 subscribe 订阅一个 Observable 之后，可以通过调用 subscribe 返回的订阅对象的 unsubscribe 方法，随时取消订阅。

Promises:
```js
const promise = new Promise(resolve => {
  setTimeout(() => {
    console.log('Async task done');
    resolve();
  }, 2000);
});
// 不能再阻止handler被执行了。
promise.then(() => console.log('Handler'));
// logs:
// Async task done
// Handler
```
一旦我们调用了 then，就无法阻止调用传递给 then 的处理函数(即使我们有 2 秒的时间)。因此，2 秒后，当 promise 被解析时，处理程序就会执行。
Observables:
```js
import { Observable } from 'rxjs';

const observable = new Observable(observer => {
  setTimeout(() => {
    console.log('Async task done');
    observer.next();
  }, 2000);
});
const subscription = observable.subscribe(() => console.log('Handler'));
subscription.unsubscribe();
// logs:
// Async task done
```
我们订阅了 observable，向它注册了一个处理函数，但是紧接着我们又从 observable 中取消订阅。其结果是，2 秒后，当 observable 将发出它的值时，我们的处理函数不会被调用。
注意：仍会打印完成的异步任务。取消订阅本身并不意味着 observable 正在执行的任何异步任务都将中止。取消订阅只是实现了对 subscriber 函数中对 observer.next（以及 observer.error 和 observer.complete）的调用不会触发对处理函数的调用。但是其他所有内容仍然可以正常运行，就好像不会取消订阅一样。
#### 多播和单播
promise 的 executor 函数只执行一次(在创建 promise 时)。这意味着，对给定 promise 对象的所有调用都直接进入 executor 函数的正在执行，最后得到结果是值的副本。因此，promise 执行多播，是因为相同的执行和结果值用于多个订阅者。
observable 的 subscriber 函数在每个调用上执行以订阅该 observable。因此，可观察对象执行单播，因为每个订阅服务器有单独的执行和结果值。
Promises:
```js
const promise = new Promise(resolve => {
  console.log('Executing...');
  resolve(Math.random());
});
promise.then(result => console.log(result));
promise.then(result => console.log(result));
// logs:// Executing...// 0.1277775033205002// 0.1277775033205002
```
可以看到，executor 函数只执行一次，并且两个订阅之间共享结果值。
Observables:
```js
import { Observable } from 'rxjs';

const observable = new Observable(observer => {
  console.log('Executing...');
  observer.next(Math.random());
});
observable.subscribe(result => console.log(result));
observable.subscribe(result => console.log(result));
// logs:// Executing...// 0.9823994838399746// Executing...// 0.8877532356021958
```
可以看到，subscriber 函数是为每个 subscriber 单独执行的，每个 subscriber 都有自己的结果值。

#### 异步执行与同步执行

promise 的处理函数是异步执行的。也就是说，它们是在执行完主程序或当前功能中的所有代码之后执行的。
observable 的处理函数是同步执行的。也就是说，它们是在当前函数或主程序流中执行的。
Promises:
```js
console.log('- Creating promise');
const promise = new Promise(resolve => {
  console.log('- Promise running');
  resolve(1);
});
console.log('- Registering handler');
promise.then(result => console.log('- Handling result: ' + result));
console.log('- Exiting main');
// logs:// - Creating promise// - Promise running// - Registering handler// - Exiting main// - Handling result: 1
```
首先创建 promise，然后直接执行 promise（因为 promise 的 executor 函数预先的，请参见上文）。承诺也立即得到解决。之后，我们通过调用 promise 的 then 方法来注册一个处理函数。至此，promise 已经被解析（即它处于已完成状态），然而，我们的处理程序函数此时尚未执行。而是首先执行主程序中所有剩余的代码，然后再调用我们的处理函数。
原因是 promise 完成(或拒绝)是作为异步事件处理的。这意味着，当一个承诺被解析(或拒绝)时，相应的处理函数将作为单独的项放在 JavaScript 事件队列中。这意味着处理程序仅在事件队列中的所有先前项目均已执行后才执行，并且在我们的示例中，有一个此类先前项目即主程序。
Observables:
```js
import { Observable } from 'rxjs';

console.log('- Creating observable');
const observable = new Observable(observer => {
  console.log('- Observable running');
  observer.next(1);
});
console.log('- Registering handler');
observable.subscribe(v => console.log('- Handling result: ' + v));
console.log('- Exiting main');
// logs:// - Creating observable// - Registering handler// - Observable running// - Handling result: 1// - Exiting main
```
首先，创建了 Observable(但是它还没有被执行，因为 Observable 是惰性的，请参见上文)，然后我们通过调用 Observable 的 subscribe 方法注册一个处理函数。这时，observable 开始运行，并立即发出它的第一个也是唯一一个值。现在执行了处理函数，主程序退出。
与 promise 不同，处理函数是在主程序仍在运行时运行的。这是因为 observable 的处理函数是在当前执行的代码中同步调用的，而不是像 promise 的处理函数那样作为异步事件调用的。
我们从创建，使用，发送数据，销毁，执行方式多方面研究了 Promises 与 Observables 差异，你会发现 Observables 在各方面都优于 Promises，是不是 Promises 真的不行了，答案：不是。使用场景不一样，我们使用技术也不一样，Promises 有一个杀手锏 async/await。

#### Promise 和 RxJS Observable 互相操作

Rxjs 有很多操作符，例如（of、from、defer、forkJoin、concatMap、mergeMap、switchMap、exhaustMap、bufferToggle、audit、debounce、throttle、scheduled）
常用操作符可以直接把 Promise 转 Observable：
Observable 转 Promise 只有两个方法 toPromise 和 forEach。
前面我们说async/await是 Promise 法宝，但是async/await和 Observables 不能真正“协同工作”，我们可以借助 Observable 与 Promises 高度的互操作性来完成。
我们上面列举很多操作符都可以将 Promise 转 Observable。
例如，如果正在使用一个 switchMap，可以在其中返回一个 Promise，就像可以返回一个 Observable 一样。所有这些都是有效的：
```js
import { interval, of } from 'rxjs';
import { mergeAll, take, map, switchMap } from 'rxjs/operators';

// 每1秒发射100的10倍的可观测值
const source = interval(1000).pipe(
  take(10),
  map(x => x * 100),
);
/**
 * 返回一个承诺，等待“ms”毫秒并发出“done”
 */
 function promiseDelay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve('done'), ms);
  });
}

// 使用 switchMap
source
  .pipe(switchMap(x => promiseDelay(x))) // 回调
  .subscribe(x => console.log('switchMap1', x));

source
  .pipe(switchMap(promiseDelay)) // 再简洁一点
  .subscribe(x => console.log('switchMap2', x));

// 或者是你想做的奇怪的事情
of(promiseDelay(100), promiseDelay(10000))
  .pipe(mergeAll())
  .subscribe(x => console.log('of', x));
  ```
如果可以访问创建承诺的函数，那么可以使用 defer() 将其封装起来，并创建一个可在错误时重试的 Observable。
```js
import { defer } from 'rxjs';
import { retry } from 'rxjs/operators';

function getErringPromise() {
  console.log('getErringPromise called');
  return Promise.reject(new Error('sad'));
}

defer(getErringPromise)
  .pipe(retry(3))
  .subscribe(x => console.log);
// logs// getErringPromise called// getErringPromise called// getErringPromise called// Error: sad
```
事实证明，Defer 是一个非常强大的操作符。你可以将其基本上直接与 async/await 函数一起使用，它将使 Observable 发出返回的值并完成。
```js
import { defer } from 'rxjs';

function promiseDelay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve('done'), ms);
  });
}

defer(async function() {
  const a = await promiseDelay(1000).then(() => 1);
  const b = a + (await promiseDelay(1000).then(() => 2));
  return a + b + (await promiseDelay(1000).then(() => 3));
}).subscribe(x => console.log(x));
// logs:// 7
```
订阅 Observable 的方法不止一种，有一个 subscribe，这是经典的订阅 Observable 的方式，它返回一个 Subscription 对象，该对象可用于取消订阅，还有 forEach，这是一种不可撤销的订阅 Observable 的方式，该方式需要一个函数每个 next 值，并返回一个 Promise，其中包含 Observable 的 complete 和 error。
```js
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';

const click = fromEvent(document.body, 'click');
function promiseDelay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve('done'), ms);
  });
}

/**
 * 等待5次点击
 * 点击完成等待promiseDelay执行
 */
 async function doWork() {
  await click.pipe(take(5)).forEach(i => console.log(`click ${i}`));
  return await promiseDelay(1000);
}

doWork().then(v => console.log(v));

// logs:// click [object MouseEvent]// click [object MouseEvent]// click [object MouseEvent]// click [object MouseEvent]// click [object MouseEvent]// click [object MouseEvent]// done
```
toPromise 函数跟 forEach 一样，是 Observable 上的方法，订阅一个 Observable 并将其封装到一个 Promise 中的方法。Promise 将在 Observable 完成后解析为 Observable 的最后一个被释放的值。如果 Observable 永远不会完成，那么 Promise 永远不会解析。
```js
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

const source = interval(1000).pipe(take(3)); // 0, 1, 2
async function test() {
  return await source.toPromise();
}

test().then(v => console.log(v));
// logs:// 2
```
注意：使用 toPromise() 是一种反模式，除非你正在处理一个期望 Promise 的 API，比如async/await。Rxjs v7 版本弃用 toPromise()。
forEach 和 toPromise 虽然都是返回 Promise 表现却不一致。
存在即合理，技术没有好坏，我们需要扬长避短，组合使用，发挥技术的最大优势，写出我们最健壮的程序。

