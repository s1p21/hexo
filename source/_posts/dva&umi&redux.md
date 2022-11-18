---
title: dva&umi&redux
date: 2022-11-04 10:55:50
tags: react
---

### 介绍

dva 首先是一个基于 redux 和 redux-saga 的数据流方案，然后为了简化开发体验，dva 还额外内置了 react-router 和 fetch，所以也可以理解为一个轻量级的应用框架。

### 概念

- **app**

1. 我们通过 dva(opts)创建的一个 app 是一个对象，包含 use,modal,router,start 等方法

2. 调用 use 方法引入插件

3. 使用 modal 方法，传入一个 modal，dva 会把 modal，push 进一个数组，effects 会按 saga 的启动
   流程处理，reducers 会 redux 的流程处理

4. router 就是直接传入一个生成 router 的函数，dva 内部会为其传入 app 实例

5. start 就是完成所有的初始化，启动 saga 的监听等

- **model**

我们为需要数据管理的页面或者模块创建一个 model，包含：

1. namespace

   命名空间，对应全局 state 的属性，所以不能重复

2. state

   当前页面的初始状态，优先级低于传给 dva() 的 opts.initialState

   ```
   app.model({
       namespace: 'home',
   	state: {
   	  	 count: 1
   	},
   });
   // 相当于
   const app = dva({
      initialState: {
     		home: {
     			count: 1
     		}
     },
   });
   ```

3. effect

   以 key/value 格式定义 effect。用于处理异步操作和业务逻辑，不直接修改 state

   ```
   * getListData({payload}, {call, put}) {
     const listData = yield call(API.getListData, payload);
     yield put({
       type: 'setListData',
       payload: listData
     });
   },
   ```

4. reducer

   以 key/value 格式定义 reducer。用于处理同步操作，唯一可以修改 state 的地方，由 action 触发

   ```
   setListData(state, action) {

     return {
       ...state,
       listData: action.payload.listData
     };
   },
   ```

5. subscription

   以 key/value 格式定义 subscription。subscription 是订阅，用于订阅一个数据源，然后根据需要 dispatch 相应的 action。在 app.start() 时被执行，数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。

### dva 使用

```js
import dva from "dva";
import createLoading from "dva-loading";
import { createLogger } from "redux-logger";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

// 1. Initialize
const app = dva({
  history, // 指定给路由用的 history，默认是 hashHistory
  initialState: {}, // 指定初始state，优先级高于 model 中的 state，默认是 {}
  onAction: createLogger(), // 中间件
  onEffect() {}, // effect副作用发生的钩子
  onReducer() {}, // reducer的增强
  onStateChange() {}, // store的state变更的钩子
  onHmr() {}, // 热更新的钩子
  extraEnhancers() {}, // 额外的增强器
  extraReducers() {}, // 额外的reducer
  onError(error) {}, // 错误发生的钩子
});

// 2. Plugins
app.use(createLoading());
//  createLoading()返回:
//	{
//	    extraReducers: extraReducers,
//	    onEffect: onEffect
//  }
// 所以dva-loading的原理是添加了额外的管理全局loading的reduce，
// 并且在effect发生时dispatch一个更改loading的action
// 在state的loading的effects里面以effect的（key/value）的方式表示effect的执行状态
// 请求开始标记为 true ，请求结束标记为 false

// 3. Model
app.model(require("./models/example1").default);
app.model(require("./models/example2").default);

// 4. Router
app.router(require("./router").default);

// 5. Start
app.start("#root");
```

### dva 图解

[图解 DAV](./images/dva-pick.png)

## dva 源码解读

### dva 流程分析

dva 项目包含四个包：

- **dva-immer**
- **dva-loading**

  管理全局 loading 的插件

- **dva-core**（区分 dva 和 dva-core）

  1. 我们执行 dva 的方法，const app = dva(opts)，会使用 dva-core 的 create 方法创建的 app

  2. 这时会新建 Plugin 的实例 plugin，使用 plugin.use(hooksAndOpts)，hooksAndOpts 就是上面的 opts

  3. 传入 hooksAndOpts 会被 plugin 实例的 hooks 属性收集，对 hooks 进行添加或重新赋值，详情看源码解析

  4. 最后 dva-core 的 create 方法返回的 app，包含 model，use，start 等方法，dva 是对其增加 router 和覆盖 start 等方法

  5. 当我们执行 app.model(model)方法，实际就是把 model 用 push 方法收集到一个数组，我们的 models 里面有 namespace,state,reducers 和 effects 以及 subscriptions

  6. 当我们执行 app.use(plugin),最终调用的是 Plugin 实例的 use 方法，和初始化传入的默认参数是一样的行为，所以 plugin 是一个对象，对象的 key 就是我们 opts 的 key

  7. 当我们执行 dva-core 的 app.start 方法，会创建 createSagaMiddleware 和 createPromiseMiddleware

  8. 然后遍历所有的 models，以每个 model 的 namespace 为 key，用 model 的 reducers 生成每个 model 或者叫每个页面的 reducer，形成全局 reducers（注意带 s 和不带 s）

  9. 获取每个 model 的 effects，对 saga 进行收集

  10. plugin 的 hooks 的 onReducer 为添加的 reducer 增强器（reducerEnhancer）
  11. plugin 的 hooks 的 extraReducers 为添加的额外 reducers（extraReducers）

  12. combineReducers 方法合并全局的 reducers 和 extraReducers，reducerEnhancer 对其进行增强，返回最终的全局 reducers

  13. 然后通过 dva-core 的 createStore 方法传入 reducers，initialState，middlewares 等参数创建 reducer 的 store

  14. 创建 store 的过程中会通过 plugin 的 hooks 的 extraEnhancers 添加额外的增强器（extraEnhancers）

  15. plugin 的 hooks 的 onAction 为添加额外的中间件（extraMiddlewares），最终的 middlewares = [routerMiddleware(history),promiseMiddleware,sagaMiddleware,...flatten(extraMiddlewares)]

  16. 最后的 enhancers = [applyMiddleware(...middlewares), ...extraEnhancers]

  17. 最终的 store 通过 redux 的 createStore(reducers, initialState, composeEnhancers(...enhancers))创建

  18. plugin 的 hooks 的 onStateChange 用 store 的 subscribe 方法进行监听

  19. 遍历所有的 saga，执行 sagaMiddleware.run 进行监听

  20. 运行所有的 subscriptions 监听

- **dva**

  ```
  export fetch from 'isomorphic-fetch';
  export dynamic from './dynamic';
  export { connect, connectAdvanced, useSelector, useDispatch, useStore, shallowEqual }; // react-redux
  export { bindActionCreators }; // redux
  export { router }; // import * as router from 'react-router-dom';
  export { saga }; // dva-core
  export { routerRedux };
  // connected-react-router, 和react-router-redux 一样，绑定路由到redux
  // 这样就可以通过dispatch一个action的方式跳转路由
  export { createBrowserHistory, createMemoryHistory, createHashHistory }; // history库提供
  ```

  这个包导出的内容可以分为三个部分：

  1.  dva 函数传入 opts 配置对象
      使用 connected-react-router，用 redux 管理路由
      使用 dva-core 的 create 方法创建的 app
      添加 router 方法
      改变 app 的 start 方法
      start 方法如果传入 container， 在 container 容器外加上一层 dva 的 Provider，并使用 ReactDom 挂载到真实 DOM
      如果没有传入 container，则只渲染 dva 的 Provider 的 React Element

  2.  dynamic 方法，动态加载函数

  3.  三方模块部分 API 的直接导出，如 isomorphic-fetch，redux，redux-saga，react-route，react-router-redux 等的 API

### dva-core

- **checkModel.js**

  1. 检查 model 的 namespace 必须被定义，必须是字符串并且唯一
  2. state 可以为任何值
  3. reducers 可以为空，PlainObject 或者数组
  4. effects 可以为空，PlainObject
  5. subscriptions 可以为空，PlainObject，subscription 必须为函数

- **constants.js**
  就定义了一个 namespace 的分割符为 NAMESPACE_SEP = '/'的常量
- **createPromiseMiddleware.js**

  创建 createPromiseMiddleware 的函数，主要是判断 aciton 的 type 是否是 effect 的 type
  如果是，为其创建一个 promise 对象

- **getReducers.js**

  把我们每个 model 的 reducers 通过 handlerActions 函数转化为，能处理 action 的 reducer

- **getSaga.js**

  需要较深理解 saga。。。

- **handleAction.js**

  **注意!!!**：
  全局最后的 reduce 只有一个，一个 model 里面的 reducers，是一个 key 值（也就是 action 的 type）
  对应一个 reducer，它应该转化成像 switch，case 那样能通过判断 action 的 type 来使用对应 reducer 的函数

  类似 redux-actions 的 handleActions

- **prefixNamespace.js**

  1. 为 model 里面的 reducers 和 sagas 的 key 加上 **namespace/** 的前缀
  2. reducers 为数组的情况，第一个值为 reducers，第二个为 enhancer（例如：reducers: [realReducers, enhancer]）

- **prefixType.js**

  为 action 的 type 加上 **namespace/** 的前缀

- **prefixedDispatch.js**

  为 dispatch 函数派发 action 的 type 加上 **namespace/** 的前缀，就是用的 prefixType 方法

- **subscription.js**

  处理所有 subscription 的函数

- **utils.js**

  工具函数

- **createStore.js**

  创建 redux 的 store 的函数

- **index.js**

  dva-core 的入口

## redux

### 状态管理

- **react 本身怎样进行状态的管理（组件间通信）？**

  对于组件本身而言，state 能很好的管理其本身的状态，通过 props 传递 callback 函数，也可以使父子组件能很好的通信

  但是如果两个通信的组件之间跨度比较大，就需要在两个组件的最小父节点，管理两个组件的状态，如果层级比较深，就会造成很多中间组件需要传递无用的 props，容易造成代码逻辑的混乱

  另一种组件通信的方式是使用 emitter 等第三方库，通过发布订阅模式管理组件的通信，缺点是在代码书写中，事件在接收方不容易体现出来，造成代码逻辑的不清晰

### flux 架构

redux 是 flux 架构的变种之一

### redux 三大原则

首先说明，Redux 和 React 之间没有直接关系。但是 Redux 和 React 搭配起来用最好，因为这类库允许你以 state 形式来描述界面，Redux 通过 action 的形式来发起 state 变化。

- **单一数据源**

      对比mobx，flux的多数据源，redux应用只存在唯一一个store，store中存在唯一一个state，也就是全局的状态（store中还包含substibe，dispatch等方法）

- **State 是只读的**

  state 是只读的，唯一改变 state 的方式就是，通过 store 的 dispatch 方法触发一个 action，action 是一个描述事件的普通对象，唯一一个必要的参数就是 type

- **使用纯函数来执行修改**

  为了描述 action 如何改变 state，需要编写 reduces，reducer 只是一些纯函数，它接收先前的 state 和派发的 action，并返回新的 state，随着应用的变法，我们可以按页面模块或者任务拆分成多个小的 reducers，分别独立的操作，最后通过，combineReducer 把所有小的 reducers 合并成一个大的 reducer

  ![](./images/redux.jpg)

### redux 核心概念

- **store**

  通过 createStore 函数创建，一个应用全局只能有一个 store，在应用的最外层

- **state**

  整个应用的状态，存在于 store 中

- **subscribe**

  store 的方法，把 listeners 添加到数组中

- **action**

  action 本质上是普通的 js 对象，我们约定，action 内必须使用一个字符串类型的 type 字段来表示将要执行的动作

  多数情况下，type 会被定义成字符串常量。当应用规模越来越大时，建议使用单独的模块或文件来存放 action。

  ```
  const ADD_TODO = 'ADD_TODO'
  ```

  ```
  {
    type: ADD_TODO,
    text: 'Build my first Redux app'
  }
  ```

- **action creator**

  action creator 函数就是生成相同 type 的 action 的方法。

  ```
  function addTodo(text) {
    return {
      type: ADD_TODO,
      text
    }
  }

  ```

- **dispatch**

  store 的方法，用于派发一个 action

- **reducer**

  应该是"纯"函数，返回一个新的更新后的 state

### redux 总结

redux 和 mvvm 一样是一种设计模式，可以用任何语言实现，官方实现是 js

redux 完整使用流程：

1. 首先通过 createStore 创建 store，需要传入一个必须的 reducer，store 内部管理着一个 state，可以通过 store.getState()获取
2. 同时 store 还包含 subscribe,dispatch 等方法
3. 我们在组件上使用 store.subscribe(监听函数)订阅视图，store 内部管理者一个数组，存放监听函数
4. 我们不能直接修改 state，只能表达要修改的意图，通过 store.dispatch(action)
5. action 是一个纯对象，包含必要的 type，和其他任意的数据
6. 这时 store 内部的 reducer，传入我们当前的 state，和 action，计算出新的 state
7. 然后会遍历所有的监听函数并执行
8. 组件拿到新的 state，并重新渲染，完成状态的同步

### redux 表示法

react 表示法
![](./images/react-pic.png)

redux 表示法
![](./images/redux-pic.png)

### 副作用

默认情况下，createStore() 所创建的 store 没有使用 middleware，所以只支持同步数据流

reducer 也是一个纯函数，应该有确定的输入和输出

但是往往，我们需要去服务器请求数据，读取文件等等异步事件

### redux 插件机制

redux 的

### react-redux

react-redux 是 redux 的在 react 中使用的绑定库

那么，redux 如何在 react 应用中使用呢，如何将 组件需要的 state 和 dispatch 注入到组件中，state 更新时驱动组件重新渲染？react-redux 就是专门负责干这个的,可以简单的理解，它只做了两步，一步是在全局提供一个 Store，我们的任意子组件都能获取到 Store，另一步实在我们需要状态管理的组件上，使用高阶组件，订阅监听函数，把我们需要的 state，和 dispatch 注入到组件的属性里面，这样，我们就可以在组件里面，使用 this.props[我们需要的 state]，和 this.props.dispatch()触发一个 action

- **Provider**

  ```javascript
  export const store = createStore(
    combineReducers({ ...homeReducer }),
    applyMiddleware(thunk, logger)
  );

  <Provider store={store}>
    <App />
  </Provider>;
  ```

- **Connect**

  1.  **mapStateToProps**
  2.  **mapDispatchToProps**

  ```javascript
  function mapStateToProps(state) {
    return { todos: state.todos };
  }

  const mapDispatchToProps = {
    addTodo,
    deleteTodo,
  };

  export default connect(mapStateToProps, mapDispatchToProps)(TodoApp);
  ```

  3.  **额外配置**

  常见配置 connect(mapStateToProps,mapDispatchToProps,mergeProps,{withRef: true})

  会给高阶组件一个静态方法 getWrappedInstance()，这样就可以不用自己透传 ref 了

## redux 异步方案

### 异步方案之 redux-thunk

- **redux-thunk 源码**

```
// 去掉extraArgument后
const thunk = ({ dispatch, getState }) => (next) => (action) => {
if (typeof action === 'function') {
  return action(dispatch, getState, extraArgument);
}

return next(action);
};
// 因为 applyMiddleware函数，会先将middleware依次执行并传入（{getstate,dispatch}）
// 而后componse函数会依次为前一个middleware传入下一个middleware，最后一个middleware执行的是dispath（aciton）
// middlewares是有先后顺序的，可以根据官方文档配置

```

修改 dispatch 函数，如果是一个对象，则直接 dispatch 这个 action，如果是一个函数，则执行函数，在函数内部在触发 dispatch

- **redux 的插件为什么要这样写**

```
形如： ({ dispatch, getState }) => (next) => (action) => {}

//因为在applyMiddleware中

const middlewareAPI = {
	getState: store.getState,
	dispatch: (...args) => dispatch(...args)
}

const chain = middlewares.map(middleware => middleware(middlewareAPI))
dispatch = compose(...chain)(store.dispatch)

// 所以第一个参数是（{dispatch, getState }）是redux注入的

// compose函数把插件数据进行链式调用，所以 第二个参数是 next 是指的下一个插件
```

- **react+redux+redux-thunk 实例**

### 其他异步方案

redux-promise redux-saga 等等

## redux 源码剖析

### createStore

    createStore 通过传入必须的reducer，可选的preloadedState，和可选的增强器，返回一个store对象
    主要包含subscribe（订阅监听函数到内部listener数组），dispatch（内部的reducer接受state和action，返回新的state，同时触发所有的监听函数），和getState（获取当前的state）

    ```
    // 去掉了类型和参数校验的createStore
    export default function createStore(reducer, preloadedState, enhancer) {
    	// 如果第二个参数没有传入初始的state，而是传入了enhancer(applyMiddleware函数调用的返回值，也是一个函数), 那就将第二个参数作为enhancer
    	if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    		enhancer = preloadedState
    		preloadedState = undefined
    	}
    	if (typeof enhancer !== 'undefined') {
    		// enhancer为增强器，主要为增强dispatch函数，理解要看 applyMiddleware
    		return enhancer(createStore)(reducer, preloadedState)
    	}
    	let currentReducer = reducer // 当前reducer
    	let currentState = preloadedState // 当前state
    	let currentListeners = [] // 当前listeners
    	let nextListeners = currentListeners // 下一个listens
    	let isDispatching = false // 是否dispatch状态中
    	// 获取当前state
    	function getState() {
    		return currentState
    	}
    	// 将监听函数push到listeners数组，返回一个卸载监听函数的方法
    	function subscribe(listener) {
    		// ...
    		let isSubscribed = true
    		nextListeners.push(listener)
    		return function unsubscribe() {
    			if (!isSubscribed) {
    				return
    			}
    			isSubscribed = false
    			const index = nextListeners.indexOf(listener)
    			nextListeners.splice(index, 1)
    			currentListeners = null
    		}
    	}
        // 最终我们在我们的组件里会调用的dispatch方法，如果有异步事件会被加强，最后还是会走此事件
    	function dispatch(action) {
    		try {
    			isDispatching = true
    			// reducer接受当前的state和action，返回当前新的state
    			currentState = currentReducer(currentState, action)
    		} finally {
    			isDispatching = false
    		}
    		// 遍历所有的listeners，然后执行
    		const listeners = (currentListeners = nextListeners)
    		for (let i = 0; i < listeners.length; i++) {
    			const listener = listeners[i]
    			listener()
    		}
    		return action
    	}
    	// 当store被创建的时候，dispatch一个INIT的action，所有的reducer返回他们初始的state，构成初始的state树
    	dispatch({ type: ActionTypes.INIT })
    	return {
    		dispatch,
    		subscribe,
    		getState,
    	}
    }
    ```

### combineReducers

    这个函数是用来整合多个reducers的, 因为createStore只接受一个reducer，这个整合的过程就是将所有的reducer存在一个对象里。当dispatch一个action的时候，通过遍历每一个reducer, 来计算出每个reducer的state, 其中用到的优化就是每遍历一个reducer就会判断新旧的state是否发生了变化, 最后决定是返回旧state还是新state

    ```
    // 这里的reducers是{key: reducer,key:reducer}的对象
    export default function combineReducers(reducers) {
    	const reducerKeys = Object.keys(reducers)
    	// 最终的reducers对象，只是对传入的reducers不合法的进行过滤
    	const finalReducers = {}
    	for (let i = 0; i < reducerKeys.length; i++) {
    		const key = reducerKeys[i]
    		if (typeof reducers[key] === 'function') {
    			finalReducers[key] = reducers[key]
    		}
    	}
    	const finalReducerKeys = Object.keys(finalReducers)
    	// 返回最终的reducer
    	return function combination(state = {}, action) {

    		let hasChanged = false
    		const nextState = {}

    		// 每当dispatch一个action，遍历所有的reducer，生成一个{key:state,key:state}的全局state
    		for (let i = 0; i < finalReducerKeys.length; i++) {
    			const key = finalReducerKeys[i]
    			const reducer = finalReducers[key]
    			const previousStateForKey = state[key]
    			const nextStateForKey = reducer(previousStateForKey, action)
    			nextState[key] = nextStateForKey
    			hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    		}
    		// 判断是否有state发生改变，发生改变则返回新的state
    		hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length
    		return hasChanged ? nextState : state
    	}
    }
    ```

### applyMiddleware

    applyMiddleware返回一个enhancer，enhancer接收一个creatStore，会在内部创建一个store，然后对该store的dispatch函数进行改造

    改造的具体方式是通过compose来构造一个dispatch链，链的具体形式就是**[中间件1，中间件2, ......, 中间件N, store.dispatch]**

    然后将增强的dispatch作为store新的dispatch暴露给用户

    那用户每次dispatch的时候，就会依次执行每个中间件，执行完当前的，会将执行权交给下一个，直到reducer中，计算出新的state

    ```
    export default function applyMiddleware(...middlewares) {
    	return createStore => (...args) => {
    		const store = createStore(...args)
    		let dispatch = () => {
    			throw new Error(
    				'Dispatching while constructing your middleware is not allowed. ' +
    				'Other middleware would not be applied to this dispatch.'
    			)
    		}

    		const middlewareAPI = {
    			getState: store.getState,
    			dispatch: (...args) => dispatch(...args)
    		}

    		const chain = middlewares.map(middleware => middleware(middlewareAPI))
    		dispatch = compose(...chain)(store.dispatch)

    		return {
    			...store,
    			dispatch
    		}
    	}
    }
    ```

### bindActionCreator(s)

    只是把我们平常的写法换了一个形式，更符合函数式思想？

    ```
    function bindActionCreator(actionCreator, dispatch) {

return function() {
return dispatch(actionCreator.apply(this, arguments))
}
}
// 平时的写法
dispatch => ({
getList: (...args) => dispatch(actionCreator(...args)),
});
// 使用 bindActionCreator 后的写法
dispatch => ({
getList: bindActionCreators(actionCreator, dispatch),
});

````

### compose

    插件机制的核心代码
    中间件组成的一个数组，最终在前一个中间件中执行下一个中间件，最后依次返回上一个中间件的函数上下文中
    最后形成一个先入后出的洋葱模型

    ```
    // 供applyMiddleware使用
    export default function compose(...funcs) {
        // ...
        return funcs.reduce((a, b) => (...args) => a(b(...args)))
    }
    ```

### redux 源码总结

1. 我们可以这样理解，从 applyMiddleware 开始看，这是一个柯里化函数，先后接受 middlewares，createStore 函数，createStore 参数，最后返回一个 store

2. 然后我们 applyMiddleware(middlewares)的返回值为一个 enhancer

3. 这时我们转回 createStore 函数，当我们传入 enhancer 时，最终会以 enhancer(createStore)(reducer, preloadedState)这个柯里化函数创建 store

4. 这个柯里化函数，会对 createStore 创建 store 的 dispatch 函数进行加强

5. 加强的方式就是形成一个 middleware 的调用链，可以实现 log，thunk 等各种功能

6. 我们通过 store 的 subscribe 方法添加监听到 listeners 数组

7. 通过 store 的 dispatch 方法，触发所有的监听

8. bindActionCreators 是一个单独的方法


## umi

### 介绍

umi是一个可插拔的企业级 react 应用框架。umi 以路由为基础的，支持路由级的按需加载。然后配以完善的插件体系，覆盖从源码到构建产物的每个生命周期，支持各种功能扩展和业务需求

roadhog 是另一个构建工具，是基于 webpack 的封装工具，目的是简化 webpack 的配置

umi 可以简单地理解为 roadhog + 路由，辅以一套插件机制，目的是通过框架的方式简化 React 开发

umi 强烈推荐使用dva 的数据流方案，也就是只使用dva的核心功能

### umi架构

![](images/umi.png)

### umi能帮我做什么

1. 使用create-umi的脚手架，搭建基础的项目架构
2. 根据其目录约定，可以自动帮我们生成dva的models和路由
3. 全局布局可以通过路由配置的方式帮我们添加
4. 提供默认的配置，简化webpack的配置
5. 引入一个插件级
````
