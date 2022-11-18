---
title: React 组件性能优化
date: 2022-11-15 16:02:22
tags: React
---

# React 组件性能优化

React 基于虚拟 DOM 和高效 Diff 算法的完美配合，实现了对 DOM 最小粒度的更新。大多数情况下，React 对 DOM 的渲染效率足以我们的业务日常。但在个别复杂业务场景下，性能问题依然会困扰我们。此时需要采取一些措施来提升运行性能，其很重要的一个方向，就是避免不必要的渲染（Render）

渲染（Render）何时会被触发

○ 组件挂载
React 组件构建并将 DOM 元素插入页面的过程称为挂载。当组件首次渲染的时候会调用 render，这个过程不可避免。

○ setState() 方法被调用
setState 是 React 中最常用的命令，通常情况下，执行 setState 会触发 render。但是这里有个点值得关注，执行 setState 的时候一定会重新渲染吗？答案是不一定。当 setState 传入 null 的时候或者 state 的值没有发生改变时，并不会触发 render

○ 父组件重新渲染
只要父组件重新渲染了，即使传入子组件的 props 未发生变化，那么未做处理的子组件也会重新渲染，进而触发 render。

优化点：
1、不必要的更新是性能优化的基础；
2、减少计算的量。主要减少重复计算，对于函数式组件来说，每次 render 都会重新从头开始函数调用。

### React hooks 重复渲染的逻辑

一个组件重新重新渲染，一般三种情况：

a. 要么是组件自己的状态改变

b. 要么是父组件重新渲染，导致子组件重新渲染，但是父组件的 props 没有改变

c. 要么是父组件重新渲染，导致子组件重新渲染，但是父组件传递的 props 改变

#### 1.父组件使用 hooks，子组件使用类组件

父组件

```ts
export default function Test() {
  const [state, setState] = useState({ a: 1, b: 1, c: 1 });
  const [value, setValue] = useState(11);
  return (
    <div>
      <div>
        state{state.a},{state.b}
      </div>
      <Button
        type="default"
        onClick={() => {
          //@ts-ignore
          setState({ a: 2, b: 1 });
          //@ts-ignore
          setState({ a: 2, b: 2 });
          console.log(state, "state");
        }}
      >
        测试
      </Button>
      <hr />
      <div>value{value}</div>
      <Button
        type="default"
        onClick={() => {
          setValue(value + 1);
        }}
      >
        测试
      </Button>
      <Demo value={state} />
    </div>
  );
}
```

子组件：

```ts
export default class App extends React.Component<Props> {
  render() {
    const { props } = this;
    console.log("demo render");
    return (
      <div>
        {props.value.a},{props.value.b}
      </div>
    );
  }
}
```

结论：父组件(hook)每次更新，都会导出一个新的 state 和 value 对象,子组件肯定会更新（如果不做特殊处理）

#### 2. 父组件使用 hooks,子组件使用 class PureComponent

父组件代码跟上面一样，子组件使用 PureComponent:

```ts
export default class App extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    console.log("demo render");
    return (
      <div>
        {props.value.a},{props.value.b}
      </div>
    );
  }
}
```

结论：结论同上，依赖的 props 改变了，因为父组件是 hook 模式，每次更新都是直接导出新的 value 和 state.

#### 3. hook 的 setState 和 类组件的 setState 有什么不一样

class 的 setState，如果你传入的是对象，那么就会被异步合并，如果传入的是函数，那么就会立马执行替换，而 hook 的 setState 是直接替换.
实践：

```ts
export default function Test() {
  const [state, setState] = useState({ a: 1, b: 1, c: 1 });
  const [value, setValue] = useState(11);
  return (
    <div>
      <div>
        state{state.a},{state.b},{state.c}
      </div>
      <Button
        type="default"
        onClick={() => {
          //@ts-ignore
          setState({ a: 2 });
          //@ts-ignore
          setState({ b: 2 });
          console.log(state, "state");
        }}
      >
        测试
      </Button>
      <hr />
      <div>value{value}</div>
      <Button
        type="default"
        onClick={() => {
          setValue(value + 1);
        }}
      >
        测试
      </Button>
      <Demo value={state} />
    </div>
  );
}
```

结论：class 的 setState，如果你传入的是对象，那么就会被异步合并，如果传入的是函数，那么就会立马执行替换，而 hook 的 setState 是直接替换。

#### 4. 父组件使用 class 子组件使用 hook

父组件:

```ts
export default class App extends React.PureComponent {
  state = {
    count: 1,
  };
  onClick = () => {
    const { count } = this.state;
    this.setState({
      count: count + 1,
    });
  };
  render() {
    const { count } = this.state;
    console.log("father render");
    return (
      <div>
        <Demo count={count} />
        <Button onClick={this.onClick}>测试</Button>
      </div>
    );
  }
}
```

子组件

```ts
interface Props {
  count: number;
}

export default function App(props: Props) {
  console.log(props, "props");
  return <div>{props.count}</div>;
}
```

结论：父组件(class 组件)调用 setState,刷新自身，然后传递给 hooks 子组件，然后子组件重新调用，更新。

#### 5. hook,setState 每次都是相同的值

```ts
export default class App extends React.PureComponent {
  state = {
    count: 1,
    value: 1,
  };
  onClick = () => {
    const { value } = this.state;
    this.setState({
      value: 1,
    });
  };
  render() {
    const { count, value } = this.state;
    console.log("father render");
    return (
      <div>
        <Demo count={count} />
        {value}
        <Button onClick={this.onClick}>测试</Button>
      </div>
    );
  }
}
```

结论：由于每次设置的值都是一样的（都是 1），hooks 不会更新，同 class。

#### 6. 父组件和子组件都使用 hook，父组件传递 count，子组件使用 count，父组件传入 count 给子组件

```ts
export default function Father() {
  const [count, setCount] = useState(1);
  const [value, setValue] = useState(1);
  console.log("father render");
  return (
    <div>
      <Demo count={count} />
      <div>value{value}</div>
      <Button
        onClick={() => {
          setValue(value + 1);
        }}
      >
        测试
      </Button>
    </div>
  );
}
```

子组件使用 count

```ts
export default function App(props: Props) {
  console.log(props, "props");
  return <div>{props.count}</div>;
}
```

结论：父组件更新了 value，导致子组件也会重复渲染。

#### 7. 子组件使用了 memo,子组件并没有触发更新

```ts
function App(props: Props) {
  console.log(props, "props");
  return <div>{props.count}</div>;
}

export default memo(App);
```

优化点：
React.memo、useMemo、
useCallback：useCallback 就是返回一个函数，只有在依赖项发生变化的时候才会更新（返回一个新的函数）

## 优化方案

### 1. 类组件

主要是`shouldComponentUpdate`和`PureComponent`这两个 API 所提供的解决思路都是**为了减少重新 render 的次数**，主要是减少父组件更新而子组件也更新的情况，虽然也可以在 state 更新的时候阻止当前组件渲染，如果要这么做的话，证明你这个属性不适合作为 state，而应该作为静态属性或者放在 class 外面作为一个简单的变量 。

### 2.函数式组件

#### 2.1 React.memo

通过 `React.memo` 包裹的组件在 props 不变的情况下，这个被包裹的组件是不会重新渲染的，会直接复用最近一次渲染的结果。这个效果基本跟类组件里面的 PureComponent 效果极其类似，只是前者用于函数组件，后者用于类组件

原写法：

```ts
// index.js
import React, { useState } from "react";
import ReactDOM from "react-dom";
import Child from "./child";

function App() {
  const [title, setTitle] = useState("这是一个 title");

  return (
    <div className="App">
      <h1>{title}</h1>
      <button onClick={() => setTitle("title 已经改变")}>改名字</button>
      <Child name="桃桃"></Child>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

在同级目录有一个 child.js

```

// child.js
import React from"react";

function Child(props) {
  console.log(props.name)
  return<h1>{props.name}</h1>
}

exportdefault Child
```

优化后的 child 组件

```ts
import React from"react";

function Child(props) {
  console.log(props.name)
  return<h1>{props.name}</h1>
}

exportdefault React.memo(Child)
```

##### React.memo 高级用法

默认情况下其只会对 props 的复杂对象做浅层对比(浅层对比就是只会对比前后两次 props 对象引用是否相同，不会对比对象里面的内容是否相同)，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。

React 官网 areEqual 返回 true 表示相等。

```ts
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
}
exportdefault React.memo(MyComponent, areEqual);
```

#### 2.2 useCallback

首先看代码

父组件 index.js

```ts
// index.js
import React, { useState } from "react";
import ReactDOM from "react-dom";
import Child from "./child";

function App() {
  const [title, setTitle] = useState("这是一个 title");
  const [subtitle, setSubtitle] = useState("我是一个副标题");

  const callback = () => {
    setTitle("标题改变了");
  };
  return (
    <div className="App">
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      <button onClick={() => setSubtitle("副标题改变了")}>改副标题</button>
      <Child onClick={callback} name="桃桃" />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

子组件 child.js

```ts
import React from "react";

function Child(props) {
  console.log(props);
  return (
    <>
      <button onClick={props.onClick}>改标题</button>
      <h1>{props.name}</h1>
    </>
  );
}

export default React.memo(Child);
```

在函数式组件里每次重新渲染，函数组件都会重头开始重新执行，那么这两次创建的 callback 函数肯定发生了改变，所以导致了子组件重新渲染。

useCallback 使用方法

```ts
const callback = () => {
  doSomething(a, b);
};

const memoizedCallback = useCallback(callback, [a, b]);
```

把函数以及依赖项作为参数传入 useCallback，它将返回该回调函数的 memoized 版本，这个 memoizedCallback 只有在依赖项有变化的时候才会更新。

那么可以将 index.js 修改为这样：

```ts
// index.js
import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom";
import Child from "./child";

function App() {
  const [title, setTitle] = useState("这是一个 title");
  const [subtitle, setSubtitle] = useState("我是一个副标题");

  const callback = () => {
    setTitle("标题改变了");
  };

  // 通过 useCallback 进行记忆 callback，并将记忆的 callback 传递给 Child
  const memoizedCallback = useCallback(callback, []);

  return (
    <div className="App">
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      <button onClick={() => setSubtitle("副标题改变了")}>改副标题</button>
      <Child onClick={memoizedCallback} name="桃桃" />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

这样我们就可以看到只会在首次渲染的时候打印出桃桃，当点击改副标题和改标题的时候是不会打印桃桃的。

如果我们的 callback 传递了参数，当参数变化的时候需要让它重新添加一个缓存，可以将参数放在 useCallback 第二个参数的数组中，作为依赖的形式，使用方式跟 useEffect 类似。

#### 2.3 useMemo

对于如何减少计算的量，就是 useMemo 来做的，接下来我们看例子。

```ts
function App() {
  const [num, setNum] = useState(0);

  // 一个非常耗时的一个计算函数
  // result 最后返回的值是 49995000
  function expensiveFn() {
    let result = 0;

    for (let i = 0; i < 10000; i++) {
      result += i;
    }

    console.log(result); // 49995000
    return result;
  }

  const base = expensiveFn();

  return (
    <div className="App">
      <h1>count：{num}</h1>
      <button onClick={() => setNum(num + base)}>+1</button>
    </div>
  );
}
```

这个例子功能很简单，就是点击 +1 按钮，然后会将现在的值(num) 与 计算函数 (expensiveFn) 调用后的值相加，然后将和设置给 num 并显示出来，在控制台会输出 49995000。

##### 可能产生性能问题

就算是一个看起来很简单的组件，也有可能产生性能问题，通过这个最简单的例子来看看还有什么值得优化的地方。

首先我们把 expensiveFn 函数当做一个计算量很大的函数(比如你可以把 i 换成 10000000)，然后当我们每次点击 +1 按钮的时候，都会重新渲染组件，而且都会调用 expensiveFn 函数并输出 49995000。由于每次调用 expensiveFn 所返回的值都一样，所以我们可以想办法将计算出来的值缓存起来，每次调用函数直接返回缓存的值，这样就可以做一些性能优化

##### useMemo 做计算结果缓存

首先介绍一下 useMemo 的基本的使用方法，详细的使用方法可见

```ts
function computeExpensiveValue() {
  // 计算量很大的代码
  return xxx;
}

const memoizedValue = useMemo(computeExpensiveValue, [a, b]);
```

useMemo 的第一个参数就是一个函数，这个函数返回的值会被缓存起来，同时这个值会作为 useMemo 的返回值，第二个参数是一个数组依赖，如果数组里面的值有变化，那么就会重新去执行第一个参数里面的函数，并将函数返回的值缓存起来并作为 useMemo 的返回值 。

了解了 useMemo 的使用方法，然后就可以对上面的例子进行优化，优化代码如下：

```ts
function App() {
  const [num, setNum] = useState(0);

  function expensiveFn() {
    let result = 0;
    for (let i = 0; i < 10000; i++) {
      result += i;
    }
    console.log(result);
    return result;
  }

  const base = useMemo(expensiveFn, []);

  return (
    <div className="App">
      <h1>count：{num}</h1>
      <button onClick={() => setNum(num + base)}>+1</button>
    </div>
  );
}
```

执行上面的代码，然后现在可以观察无论我们点击 +1 多少次，只会输出一次 49995000，这就代表 expensiveFn 只执行了一次，达到了我们想要的效果.

useMemo 的使用场景主要是用来缓存计算量比较大的函数结果，可以避免不必要的重复计算，有过 vue 的使用经历同学可能会觉得跟 Vue 里面的计算属性有异曲同工的作用。

不过另外提醒两点：

一、如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值；

二、计算量如果很小的计算函数，也可以选择不使用 useMemo，因为这点优化并不会作为性能瓶颈的要点，反而可能使用错误还会引起一些性能问题。

## React 懒加载

#### 实现示例

```ts
import React, { Suspense } from "react";

const OtherComponent = React.lazy(() => import("./OtherComponent"));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

在 React 16.6 中实现了 lazy 和 suspense，可以直接来做懒加载。在上述代码中，通过`import()`、`React.lazy`、`Suspense`共同一起实现了 React 的懒加载。

##### 原理：

React.lazy 的源码实现如下：

```ts
export function lazy<T, R>(ctor: () => Thenable<T, R>): LazyComponent<T> {
  let lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _ctor: ctor,
    // React uses these fields to store the result.
    _status: -1,
    _result: null,
  };

  return lazyType;
}
```

可以看到其返回了一个 LazyComponent 对象。

而对于 LazyComponent 对象的解析：

```ts
...
case LazyComponent: {
  const elementType = workInProgress.elementType;
  return mountLazyComponent(
    current,
    workInProgress,
    elementType,
    updateExpirationTime,
    renderExpirationTime,
  );
}
...
```

```ts
function mountLazyComponent(
  _current,
  workInProgress,
  elementType,
  updateExpirationTime,
  renderExpirationTime,
) {
  ...
  let Component = readLazyComponentType(elementType);
  ...
}

```

```ts
// Pending = 0, Resolved = 1, Rejected = 2
export function readLazyComponentType<T>(lazyComponent: LazyComponent<T>): T {
  const status = lazyComponent._status;
  const result = lazyComponent._result;
  switch (status) {
    case Resolved: {
      const Component: T = result;
      return Component;
    }
    case Rejected: {
      const error: mixed = result;
      throw error;
    }
    case Pending: {
      const thenable: Thenable<T, mixed> = result;
      throw thenable;
    }
    default: {
      // lazyComponent 首次被渲染
      lazyComponent._status = Pending;
      const ctor = lazyComponent._ctor;
      const thenable = ctor();
      thenable.then(
        (moduleObject) => {
          if (lazyComponent._status === Pending) {
            const defaultExport = moduleObject.default;
            lazyComponent._status = Resolved;
            lazyComponent._result = defaultExport;
          }
        },
        (error) => {
          if (lazyComponent._status === Pending) {
            lazyComponent._status = Rejected;
            lazyComponent._result = error;
          }
        }
      );
      // Handle synchronous thenables.
      switch (lazyComponent._status) {
        case Resolved:
          return lazyComponent._result;
        case Rejected:
          throw lazyComponent._result;
      }
      lazyComponent._result = thenable;
      throw thenable;
    }
  }
}
```

从上述代码中可以看出，对于最初 `React.lazy()` 所返回的 `LazyComponent` 对象，其 \_status 默认是 -1，所以首次渲染时，会进入 `readLazyComponentType` 函数中的 default 的逻辑，这里才会真正异步执行 `import(url)`操作，由于并未等待，随后会检查模块是否 Resolved，如果已经 Resolved 了（已经加载完毕）则直接返回`moduleObject.default`（动态加载的模块的默认导出），否则将通过 throw 将 thenable 抛出到上层。

##### Suspense 原理

由于 React 捕获异常并处理的代码逻辑主要是在 throwException 中的逻辑，简单描述一下处理过程，React 捕获到异常之后，会判断异常是不是一个 thenable，如果是则会找到 SuspenseComponent ，如果 thenable 处于 pending 状态，则会将其 children 都渲染成 fallback 的值，一旦 thenable 被 resolve 则 SuspenseComponent 的子组件会重新渲染一次。

为了便于理解，我们也可以用 componentDidCatch 实现一个自己的 Suspense 组件，如下：

```ts
class Suspense extends React.Component {
  state = {
    promise: null,
  };

  componentDidCatch(err) {
    // 判断 err 是否是 thenable
    if (
      err !== null &&
      (typeof err === "object" || typeof err === "function") &&
      typeof err.then === "function"
    ) {
      this.setState({ promise: err }, () => {
        err.then(() => {
          this.setState({
            promise: null,
          });
        });
      });
    }
  }

  render() {
    const { fallback, children } = this.props;
    const { promise } = this.state;
    return <>{promise ? fallback : children}</>;
  }
}
```

### 什么是`thenable`？？

在 promise 的使用中，判断某个值是不是真正的 promise 是很关键的。
简单做法：我用 promise 构造函数，直接 new 一个 promise，就算是查它的类型，我直接使用 instanceof promise 来判断不就好了么？这有什么好讲的？
缺点：从其它浏览器窗口接到的 promise，这个 promise 可能与当前窗口不同，所以那种检查方式无法识别 promise 实例。
所以我们需要自己识别
then()作为 promise 的配套组件，我们只需要验证有没有 then()就可以了，所以，我们提出了 thenable 的概念
thenable：任何含有 then()方法的对象或函数。

它的结构是不是很像 promise，它们都有一个 then()。

所以，我们无法找出 promise 时，就退而求其次，先找类似 promise 的，也就是 thenable。

所以判断的时候判断他是不是 thenable 通过代码中的判断就可以。

## 其他

#### 为什么 useCallback 和 useMemo 更加糟糕

性能优化不是免费的，它们总是带来成本，但这并不总是带来好处来抵消成本,所以我们采用 useCallback 和 useMemo 做性能优化，应该是做到花费的成本大于收入的成本

首先，我们需要知道 useCallback,useMemo 本身也有开销。useCallback,useMemo 会「记住」一些值，同时在后续 render 时，将依赖数组中的值取出来和上一次记录的值进行比较，如果不相等才会重新执行回调函数，否则直接返回「记住」的值。这个过程本身就会消耗一定的内存和计算资源。因此，过度使用 useCallback,useMemo 可能会影响程序的性能,并且也加大了维护成本，毕竟代码更加复杂化了。

#### 什么时候使用 useMemo 和 useCallback？

使用 useMemo 和 useCallback 出于这两个目的

1. 保持引用相等
   对于组件内部用到的 object、array、函数等，如果用在了其他 Hook 的依赖数组中，或者作为 props 传递给了下游组件，应该使用 useMemo 和 useCallback

2. 自定义 Hook 中暴露出来的 object、array、函数等，都应该使用 useMemo 和 useCallback,以确保当值相同时，引用不发生变化（你可以理解成是第一种说法的衍生，即自定义 hooks 比作组件，因为一个函数组件 state 一变化就会重新执行函数）
   昂贵的计算。
   比如上面例子的 expensive 函数

无需使用 useMemo 和 useCallback 的场景

如果返回的值是原始值： string, boolean, null, undefined, number, symbol（不包括动态声明的 Symbol），一般不需要使用 useMemo 和 useCallback
仅在组件内部用到的 object、array、函数等（没有作为 props 传递给子组件），且没有用到其他 Hook 的依赖数组中，一般不需要使用 useMemo 和 useCallback

## 总结

对于性能瓶颈可能对于小项目遇到的比较少，毕竟计算量小、业务逻辑也不复杂，但是对于大项目，很可能是会遇到性能瓶颈的，但是对于性能优化有很多方面：网络、关键路径渲染、打包、图片、缓存等等方面，具体应该去优化 目前可以通过接入前端监控的方式，去排查相应的性能问题。 本次分享只介绍了性能优化中的冰山一角： React 组件性能优化。

## 参考文档

1. [React Lazy 的实现原理](https://thoamsy.github.io/blogs/react-lazy/)
2. [React 函数式组件性能优化指南](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651557426&idx=1&sn=e2b6bee7bb8fcc9fdfaed14a82aeb0e8&chksm=802559f3b752d0e59f27d17259ac31c658fd89fe87b2755079ec31c3d8696821226b7eba4bcd&mpshare=1&scene=1&srcid=&sharer_sharetime=1584015775726&sharer_shareid=827ddc86f3743a5ae1362c6a1314c273%23rd)
3. [React 也能 “用上” computed 属性](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651557629&idx=1&sn=18a9e3bc2adb1b527ff482aa3e690ea2&chksm=8025593cb752d02a07cbde1519bad7457109cb8ab966b046d3e6da53e5402165e15c97ff4dad&mpshare=1&scene=1&srcid=&sharer_sharetime=1577448539461&sharer_shareid=827ddc86f3743a5ae1362c6a1314c273%23rd)
4. [性能！！让你的 React 组件跑得再快一点](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651557566&idx=2&sn=fea4e36daca905123fdf842af946844a&chksm=8025597fb752d069e6c63f8a4268046b7b5810930c2e11f565016716e44226d4aa834af7901c&mpshare=1&scene=1&srcid=&sharer_sharetime=1584016712520&sharer_shareid=827ddc86f3743a5ae1362c6a1314c273%23rd)
