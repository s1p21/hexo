---
title: 面试-React
date: 2022-11-30 12:33:51
tags: [面试, React]
---

#### react生命周期
- constructor（并不属于生命周期 - 初始化 state，初始化参数）
- static getDerivedStateFormPorps - 组件 props 变化时更新 state
- componentDidMount - 网络请求，添加监听事件等
- shouldComponentUpdate - 通过判断新传入的 props，优化性能，避免重复渲染
- static getSnapshopBeforeUpdate - 很少用，组件更新之前捕获一些信息（例如滚动位置）
- componentDidUpdate - 组件更新完成后的一些操作
- componentWillUnmount - 卸载监听事件，卸载计时器等
- componentDidUnmount()

#### react Fiber

React 的核心流程可以分为两个部分:

reconciliation (调度算法，也可称为 render):

更新 state 与 props；
调用生命周期钩子；
生成 virtual dom；

这里应该称为 Fiber Tree 更为符合；


通过新旧 vdom 进行 diff 算法，获取 vdom change；
确定是否需要重新渲染

- Render 阶段就是根据每个组件中的状态构建出一个新的 UI Tree，也叫WorkInProgress Tree，并为每一个结点对应的操作打上 EffectTag，即更新、删除、新增。全部构建完成后就进入下一阶段。



commit:
- Commit 阶段就是将构建好的 WIP Tree 反应到浏览器中，即 React 为我们自动进行相应的 dom 操作，保持 UI 一致性。
如需要，则操作 dom 节点更新；

要了解 Fiber，我们首先来看为什么需要它？

问题: 随着应用变得越来越庞大，整个更新渲染的过程开始变得吃力，大量的组件渲染会导致主进程长时间被占用，导致一些动画或高频操作出现卡顿和掉帧的情况。而关键点，便是 同步阻塞。在之前的调度算法中，React 需要实例化每个类组件，生成一颗组件树，使用 同步递归 的方式进行遍历渲染，而这个过程最大的问题就是无法 暂停和恢复。

解决方案: 解决同步阻塞的方法，通常有两种: 异步 与 任务分割。而 React Fiber 便是为了实现任务分割而诞生的。


简述:

在 React V16 将调度算法进行了重构， 将之前的 stack reconciler 重构成新版的 fiber reconciler，变成了具有链表和指针的 单链表树遍历算法。通过指针映射，每个单元都记录着遍历当下的上一步与下一步，从而使遍历变得可以被暂停和重启。
这里我理解为是一种 任务分割调度算法，主要是 将原先同步更新渲染的任务分割成一个个独立的 小任务单位，根据不同的优先级，将小任务分散到浏览器的空闲时间执行，充分利用主进程的事件循环机制。



核心:

Fiber 这里可以具象为一个 数据结构:

```ts
class Fiber {
	constructor(instance) {
		this.instance = instance
		// 指向第一个 child 节点
		this.child = child
		// 指向父节点
		this.return = parent
		// 指向第一个兄弟节点
		this.sibling = previous
	}	
}
```

链表树遍历算法: 通过 节点保存与映射，便能够随时地进行 停止和重启，这样便能达到实现任务分割的基本前提；

1、首先通过不断遍历子节点，到树末尾；
2、开始通过 sibling 遍历兄弟节点；
3、return 返回父节点，继续执行2；
4、直到 root 节点后，跳出遍历；



任务分割，React 中的渲染更新可以分成两个阶段:

reconciliation 阶段: vdom 的数据对比，是个适合拆分的阶段，比如对比一部分树后，先暂停执行个动画调用，待完成后再回来继续比对。
Commit 阶段: 将 change list 更新到 dom 上，并不适合拆分，才能保持数据与 UI 的同步。否则可能由于阻塞 UI 更新，而导致数据更新和 UI 不一致的情况。



分散执行: 任务分割后，就可以把小任务单元分散到浏览器的空闲期间去排队执行，而实现的关键是两个新API: `requestIdleCallback` 与 `requestAnimationFrame`

低优先级的任务交给`requestIdleCallback`处理，这是个浏览器提供的事件循环空闲期的回调函数，需要 pollyfill，而且拥有 deadline 参数，限制执行事件，以继续切分任务；
高优先级的任务交给`requestAnimationFrame`处理；


```ts
// 类似于这样的方式
requestIdleCallback((deadline) => {
    // 当有空闲时间时，我们执行一个组件渲染；
    // 把任务塞到一个个碎片时间中去；
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && nextComponent) {
        nextComponent = performWork(nextComponent);
    }
});
```
优先级策略: 文本框输入 > 本次调度结束需完成的任务 > 动画过渡 > 交互反馈 > 数据更新 > 不会显示但以防将来会显示的任务

Fiber 其实可以算是一种编程思想，在其它语言中也有许多应用(Ruby Fiber)。核心思想是 任务拆分和协同，主动把执行权交给主线程，使主线程有时间空挡处理其他高优先级任务。


#### react 优化
pureComponent 浅比较
shouldComponentUpdate 深比较

hooks优化
React.memo
react.
useMemo useMemo 是一种缓存机制提速，当它的依赖未发生改变时，就不会触发重新计算。
useCallback  针对传入子组件的为函数，进行优化使用，因为函数式组件每次发生渲染，都会从头执行，两次的callBack函数发生了改变，导致子组件渲染。useCallback 针对函数进行记忆，从而避免触发渲染。


#### setState 是异步还是同步的？
在React管理的事件回调和生命周期中，是异步的，其他是同步的，因为来做批量更新，减少渲染。
但在函数式组件中不存在这个问题。因为函数组件中生成的函数是通过闭包引用了 state，而不是通过 this.state 的方式引用 state，所以函数组件的处理函数中 state 一定是旧值，不可能是新值。可以说函数组件已经将这个问题屏蔽掉了。


#### Redux
state
Action
reducer 处理state


#### 函数式编程
纯函数 
函数复合
数据不可变性
函数式编程其实是一种编程思想，它追求更细的粒度，将应用拆分成一组组极小的单元函数，组合调用操作数据流；
它提倡着 纯函数 / 函数复合 / 数据不可变， 谨慎对待函数内的 状态共享 / 依赖外部 / 副作用；


#### 高阶组件
react 中的 HOC 高阶组件，就是一个函数，接受一个组件作为参数，返回一个新的组件
例如一个loading的高阶组件

```ts
// high order component
import React from 'react'
import axios from 'axios'

interface ILoaderState {
  data: any,
  isLoading: boolean
}
interface ILoaderProps {
  data: any,
}
const withLoader = <P extends ILoaderState>(WrappedComponent: React.ComponentType<P>, url: string) => {
  return class LoaderComponent extends React.Component<Partial<ILoaderProps>, ILoaderState> {
    constructor(props: any) {
      super(props)
      this.state = {
        data: null,
        isLoading: false
      }
    }
    componentDidMount() {
      this.setState({
        isLoading: true,
      })
      axios.get(url).then(result => {
        this.setState({
          data: result.data,
          isLoading: false
        })
      })
    }
    render() {
      const { data, isLoading } = this.state
      return (
        <>
          { (isLoading || !data) ? <p>data is loading</p> :
            <WrappedComponent {...this.props as P} data={data} />
          }
        </>
      )
    }
  }
}

export default withLoader

```
使用实例：

```ts
interface IShowResult{
    message:string,
    status:string
}
//定义一个组件
const DogShow:React.FC<{data:IShowResult}> = ({data})=>{
    return (
        <>
            <h2>show:{data.status}</h2>
            <img src={data.message}/>
        </>
    )
}

const App:React.FC=()=>{
    //高阶组件，将一个组件用参数形式传入，然后经过包裹后返回一个新的组件，达到公用包裹组件的功能
    const WrappedDogShow = withLoader(DogShow,'https://dog.ceo/api/breeds/image/random');
    return (
        <WrappedDogShow/>
    )
}
```

#### React hooks
其实，React hooks 的问题也有很多，比如：

- Hook 是一个链表的结构，在循环，条件或嵌套函数中调用 Hook，会引发一些问题。
- useEffect 的依赖容易造成心智负担，所有人阅读这段代码，都需要完整的阅读完这些依赖触发的地方
- 由于闭包的原因，useEffect 等内部捕获的，都是过时的变量。

对 React Hooks 而言，调用必须放在最前面，而且不能被包含在条件语句里，这是因为 React Hooks 采用下标方式寻找状态，一旦位置不对或者 Hooks 放在了条件中，就无法正确找到对应位置的值。
所有 Hooks 都在渲染闭包中执行，每次重渲染都有一定性能压力，而且频繁的渲染会带来许多闭包，虽然可以依赖 GC 机制回收，但会给 GC 带来不小的压力。
需要用useCallback、useMemo 来做性能优化，两者的区别在于一个存储函数的本身(useCallback) 一个存储函数返回的值（useMemo）

useLayoutEffect
跟 useEffect 使用差不多，通过同步执行状态更新可解决一些特性场景下的页面闪烁问题
useLayoutEffect 会阻塞渲染，请谨慎使用

* DOM更新同步钩子。用法与useEffect类似，只是区别于执行时间点的不同。
* useEffect属于异步执行，并不会等待 DOM 真正渲染后执行，而useLayoutEffect则会真正渲染后才触发；
* 可以获取更新后的 state；


useReducer

接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法
* reducer 本质是一个纯函数，每次只返回一个值，那个值可以是数字，字符串，对象，数组或者对象，但是它总是一个值
* React 会确保 dispatch 函数的标识是稳定的，并且不会在组件重新渲染时改变
* useReducer 还能给那些会触发深更新的组件做性能优化，因为可以向子组件传递 dispatch 而不是回调函数
* reducer 更适合去处理比较复杂的 state，来维护组件的状态

类似于 Redux 思想的实现，但其并不足以替代 Redux，可以理解成一个组件内部的 redux:
  * 并不是持久化存储，会随着组件被销毁而销毁；
  * 属于组件内部，各个组件是相互隔离的，单纯用它并无法共享数据；
  * 配合useContext的全局性，可以完成一个轻量级的 Redux；(easy-peasy)

useContext

* 接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值
* useContext 的参数必须是 context 对象本身
* 当前的 context 值由上层组件中距离当前组件最近的 <MyContext.Provider> 的 value prop 决定
* 调用了 useContext 的组件总会在 context 值变化时重新渲染

#### React diff
要求：1、跨层级节点移动操作较少；2、相同类的两个组件会生成相似的树形结构；3、同一层的一组节点，通过唯一的key进行区分
树差异（Tree Diff）、组件差异（Component Diff）以及元素差异（Element Diff）
树差异 只比较同一层级，如果同一层级不同，直接先销毁再创建
组件差异 同一类型的组件，比较子树， 如果不是，直接替换
元素差异，直接通过唯一的key来辨别



#### umi & dva
umi 企业级的前端开发框架，Umi 以路由为基础的，同时支持配置式路由和约定式路由，保证路由的功能完备，并以此进行功能扩展。然后配以生命周期完善的插件体系，覆盖从源码到构建产物的每个生命周期，支持各种功能扩展和业务需求。

特性：插件化、MFSU
![](images/umi.png)

dva 是基于redux的前端数据流方案
特性：
- 易学易用

特点：
modal、namespace、state、effect、reducer、subscription
- effect:以 key/value 格式定义 effect。用于处理异步操作和业务逻辑，不直接修改 state
- reducer:以 key/value 格式定义 reducer。用于处理同步操作，唯一可以修改 state 的地方，由 action 触发
- subscription:以 key/value 格式定义 subscription。subscription 是订阅，用于订阅一个数据源，然后根据需要 dispatch 相应的 action。在 app.start() 时被执行，数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。


