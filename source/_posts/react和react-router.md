---
title: react&react-router
date: 2022-11-04 10:57:21
tags: react
---

## React

### React 初识

- **补充知识：ES6 类与继承**

  1.  **ES5 构造函数 和 ES6 类的区别?**

      ES6 类可以理解为 ES5 构造函数的语法糖，因为 ES6 类的大部分功能特性都可以使用 ES5 构造函数去模拟实现，类中所有的方法包括 constructor 都是定义在类的 prototype 原型上，ES5 的构造函数相当于 ES6 类的 constructor

  2.  **ES5 继承 和 ES6 继承的区别?**

      ES5 的继承，实质是先创造子类的实例对象 this，然后再将父类的方法添加到 this 上面（Parent.apply(this)）。ES6 的继承机制完全不同，实质是先获得父类实例对象的属性和方法（所以必须先调用 super 方法），然后再用子类的构造函数修改 this。

      Class 作为构造函数的语法糖，存在两条继承链

      （1）子类的**proto**属性，表示构造函数的继承，总是指向父类

      （2）子类 prototype 属性的**proto**属性，表示方法的继承，总是指向父类的 prototype 属性

- **JSX 写法**

从本质上讲，JSX 只是为 React.createElement()函数提供的语法糖，返回一个 React Element

```javascript
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date() };
  }

  onClick = () => {
    console.log("click");
  };

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
        <button onClick={this.onClick}>Hello, world!</button>
      </div>
    );
  }
}
```

代码转化后：

- **组件命名为什么必须是大写的？**

  React.createElement(type,config,children)创建 React Element 的过程中,React 会根据 type 的大小写区分如果是大写，对应的是 React 组件，如果是小写，React 会把他映射为原生的 DOM

- **补充知识：** ES6+ class 静态属性，静态方法， 实例属性

  ```javascript
  // 静态属性和讲台方法可以被子类继承，不会被实例继承
  class Foo {
    // 静态方法
    static classMethod() {
      return "hello";
    }
  }

  class Foo {
    // 静态属性
    static classProp = 1;
  }

  class Foo {
    // 实例属性
    state = { name: "zz" };
    // 相当于
    // constructor(){
    //	 	state = {name:'zz'};
    // }
    // 所以我们可以使用实例属性替换constructor的写法
  }
  ```

### React 组件

React 组件分为两类，一类是类组件，一类是函数组件，不论是类组件还是函数式组件，最终都要返回 React Element。如果是类组件，就先实例化然后调用 render 方法
如果是函数组件，则直接调用。

那么 react 是如何区分类组件和函数式组件?
通过判断函数是否是 Component 的实例，PureCompnent 同样继承自 Component，也是 Component 的实例

- **Component 和 PureCompnent**

  1.  **Component 组件**

      父组件重新渲染后，子组件会经历 componentWillReceiveProps(或者 getDerivedStateFromProps，两者不能同时存在),和 shouldComponentUpdate 生命周期，其中，shouldComponentUpdate 生命周期，返回 true，则表示会重新渲染，返回 false，则表示不会重新渲染，继承自 Component 的组件默认返回 true，所以其子组件也必然会重新渲染。

  2.  **PureComponent**

      针对 Component 子组件会重新渲染的问题，PureComponent 则会在 shouldComponent 生命周期阶段，对 props 的值进行一次比较，基本类型会判断其是否相当（===），复杂数据类型会判断其指针是否指向同一个对象。控制其是否重新渲染。

- **Function Component**

  在没有 Hooks API 之前，Function Component 函数式组件，没有自己的生命周期，没有自己的 state，只是传入一个 props，返回一个 React Element。 非常适合写一些简单的组件，比如数据展示型组件

  React 16.8 之后，Hooks API 可以为函数组件加上生命周期和 state 等特性

### 组件的 state 和 props

- **组件的 state**

  一般情况下，组件的需要管理的状态我们可以放在 this.state 中，如果是一些常量，或者改变后也不影响页面的重新渲染，比如过提交的数据，我们可以定义为实例的属性或者在组件依赖的变量

  不能直接更新状态，必须使用**setState**更新状态

- **更新 state**

  1.  异步更新 state

      ```javascript
      this.setState({
        comment: "Hello",
      });
      // 可以传入第二个参数，为更新state之后的回调函数
      this.setState(
        {
          comment: "Hello",
        },
        () => {
          console.log("state更新完成");
        }
      );
      ```

  2.  同步更新 state

      ```javascript
      // 传入一个函数，接收当前state和props为参数，返回一个对象，为更新后的state
      this.setState((prevState, props) => ({
        counter: prevState.counter + props.increment,
      }));
      ```

- **组件的 props**

  1.  **props 是只读的**

      props 是 React 组件的输入，不应该以任何方式修改他们，我们可以使用 state 来作为替代。

  2.  **children**

      children 是一个特殊的属性，，它总是指代标签之前的子代，

      ```javascript
      class Welcome extends React.Component {
      	render() {
      		return <p>{this.props.children}</p>;
      	}
      }

      <Welcome>hello world</Welcome>
      // 等同于 ===
      <Welcome children={'hello world'}/>
      ```

  3.  **key 和 ref**

      key 和 ref 不是 props，key 和 ref 会做单独的处理，key 用作 react diff 阶段的优化，ref 则指代组件实例

### 组件的生命周期（v16.3 之前版本）

- **组件挂载流程**:

  ![](https://raw.githubusercontent.com/s1p21/hexo/master/source/images/react-lifeCycle.jpg)

- **生命周期介绍**：

  1.  **getDefaultProps**（createClass 写法）

      获取初始属性

  2.  **getInitialState** (createClass 写法)

      获取初始状态

  3.  **componentWillMount**

      render 之前执行，在初始化渲染之前做最后更改 state 的操作,可以用于初始化 state 的操作

      这个函数里面的写法，都可以被 constructor 和 componentDidMount 里写法替代，根据 props 初始化 state 可以写在 constructor 里面，发起网络请求可以写在 componentDidMount 里面

  4.  **render**

      render 阶段会调用 render()方法，返回一个 react element

  5.  **componentDidMount**

      初始化渲染之后执行，虚拟 dom 挂载到真实的 dom 节点上，这个生命周期及之后才可以使用使用 ref 和访问真实的 dom 节点，一般在这个生命周期进行网络请求，事件监听等操作。

  6.  **componentWillUpdate**

      组件 props 和 state 发生变化时，重新 render 方法之前执行，注意，这个生命周期不能使用 setState 来修改状态，函数调用之后接收 nextProps 和 nextState 来进行操作

  7.  **componentDidUpdate**

      可以在其子组件树中的任何位置捕获 JavaScript 错误，记录这些错误并显示回退 UI，而不是崩溃的组件树。错误边界在渲染期间，生命周期方法以及整个树下的构造函数中捕获错误。

      组件更新之后调用，如果在组件更新之后需要 DOM 操作，可以使用该方法，该方法接受 prevProps 和 prevState

  8.  **componentWillUnmount**

      卸载组件之前调用，可以用来取消 componentDidMount 中添加的监听事件，清空计时器，清空创建的 DOM 等操作

  9.  **componentWillReceiveProps**

      组件接受 props 时触发，父组件重新渲染，一般也会导致传入子组件 props 的变化，所以会触发此生命周期

  10. **shouldComponentUpdate**

      性能优化最重要的一个生命周期，如果监控到组件频繁刷新，使用此函数进行性能优化

### 组件的新生命周期（v16.3 及之后版本）

由于 React 16.3 版本 fiber 架构的引入，三个生命周期被标记为不安全（UNSAFE\_），因为 componentWillMount，componentWillReceiveProps，componentWillUpdate 都在 reconciliation 过程中，可能在初始化渲染之前，或者更新渲染前被执行多次，在新的版本中应避免使用，17 版本之后可能会被删除。

![](https://raw.githubusercontent.com/s1p21/hexo/master/source/images/react-newLifeCycle.png)

- **被标记为不安全的生命周期**

  UNSAFE_componentWillMount

  UNSAFE_componentWillReceiveProps

  UNSAFE_componentWillUpdate

- **新增的生命周期**

  1.  **static getDerivedStateFormProps**

      新的 react 版本在初始化，newProps 传入，包括 setState 和 forceUpdate 都会触发 getDerivedStateFormProps 生命周期

      使用场景：组件的 state 管理着组件的状态，传入组件的 props，同样可以初始化为组件的 state，如果想让组件功能更灵活，就需要每次传入 props，都会根据传入的 props 改变组件内部的 state，这就是这个生命周期常见的应用场景

  2.  **static getSnapshotBeforeUpdate**

      组件更新前获取其状态的快照

      注意 这两个都是静态方法，不能再其里面使用 this

  3.  **componentDidCatch**

      新增的错误处理钩子，见我们的项目

- **总结：生命周期该怎么用**

  1.  constructor（并不属于生命周期 - 初始化 state，初始化参数）
  2.  componentDidMount - 网络请求，添加监听事件等
  3.  static getDerivedStateFormPorps - 组件 props 变化时更新 state
  4.  shouldComponentUpdate - 通过判断新传入的 props，优化性能，避免重复渲染
  5.  static getSnapshopBeforeUpdate - 很少用，组件更新之前捕获一些信息（例如滚动位置）
  6.  componentDidUpdate - 组件更新完成后的一些操作
  7.  componentWillUnmount - 卸载监听事件，卸载计时器等
  8.  componentDidCatch - 错误捕捉

  不要用:

  1.  componentWillMount - constructor 和 componentDidMount 替代
  2.  componentWillReceiveProps - getDerivedStateFormPorps 替代
  3.  componentWillUpdate() - getSnapshotBeforeUpdate 替代

### 事件绑定

- **constructor 绑定（react 推荐）**

  在 constructor 中进行绑定，只在实例化过程中绑定一次，缺点是每一事件都需要自己手动绑定

- **调用时绑定**

  在事件函数触发后使用 bind 绑定 this，缺点是每触发一次事件，都会进行一次绑定，产生一个新的方法指针，并且如果函数作为属性传入子组件的时候，子组件可能进行额外的重新渲染，有少许性能问题

- **箭头函数绑定**

  在事件函数触发后使用箭头函数绑定 this，有和上面一样的问题

- **实例属性（方法）初始化（推荐）**

  利用属性初始化语法，将方法初始化为箭头函数，因此在创建函数的时候就绑定了 this。

- **事件传参**

  如果事件类型相同，我们可以通过传参来避免写多个相同的函数

  ```
  onClick={()=>this.onClick('type')}
  ```

### 组件间的通信

- **props**

  父组件向子组件通信，层级深的话需连续传递

- **回调函数**

  也是 props，只不过 props 是个函数，子组件向父组件通信，层级深的话需连续传递

- **发布订阅模式**

  适用跨层级的情况，或者组件的静态方法和实例间的通信

- **redux**

  redux 通过 dispath 一个 action，更新全局的 state，然后同步状态给需要的组件

- **其他可选方案**

  1.  **Context**

      可以把需要共享的状态，定义在两个组件的公共父节点，使用 Context 进行管理
      不常见，一般使用 Context 管理路由，组件主题，国际化等

  2.  **ref**

      使用 ref 获取子组件的实例，然后调用实例上的方法。
      虽然官方并不推荐使用 ref，但设计组件或者模块通信时很常见，例如 Modal 类组件

### 列表 & key

当我们的子组件是一个数组时，key 帮助 React 识别哪些元素改变了，比如被添加或删除

如果是固定的 UI 列表，可以使用 index 作为 key， 如果是数据列表，一定要避免使用 index

一个元素的 key 最好是这个元素在列表中拥有的一个独一无二的字符串。通常，我们使用来自数据 id 来作为元素的 key

```ts

const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) =>
  <li key={number.toString()}>
    {number}
  </li>
);
```

在虚拟 dom diff 时，react 和 vue 的异同？

### 高阶组件（属性劫持场景）

**补充知识：ES6 装饰器 注意：需要配置 babel 插件**

```javascript
// 装饰器（Decorator）是一种与类（class）相关的语法，用来注释或修改类和类方法。

// 1. 类的装饰

// 装饰器是一个函数，入参为被装饰的类
function testable(target) {
  target.isTestable = true;
}

@testable
class MyTestableClass {
  // ...
}

MyTestableClass.isTestable; // true

// 2. 类方法的装饰

function readonly(target, name, descriptor) {
  // descriptor对象同Object.defineProperty第三个参数
  descriptor.writable = false;
  return descriptor;
}

class Person {
  @readonly
  name() {
    return `${this.first} ${this.last}`;
  }
}
```

**高阶组件是什么**

高阶组件（higherOrderComponent），简称 HOC，本质上就是一个函数，只是参数为组件，返回值为一个新的组件，主要用于复用组件的逻辑，之前 react 通过 createClass 创建组件时，主要通过 MixIn 的方式复用逻辑
高阶组件在项目开发中非常常见，对理解三方组件源码也非常重要
**高阶组件的约定**

1. **不要改变原始组件。使用组合**

   不要改变原始组件，会产生一些不良后果

```ts

function logProps(InputComponent) {
  InputComponent.prototype.componentWillReceiveProps = function(nextProps) {
    console.log('Current props: ', this.props);
    console.log('Next props: ', nextProps);
  };
  // 返回原始的 input 组件，暗示它已经被修改。
  return InputComponent;
}

// 每次调用 logProps 时，增强组件都会有 log 输出。
const EnhancedComponent = logProps(InputComponent);
```

2. **将不相关的 props 传递给被包裹的组件**

   对需要处理的属性进行劫持，剩下的属性不做改变

   ```ts
   render() {
     // 过滤掉非此 HOC 额外的 props，且不要进行透传
     const { extraProp, ...passThroughProps } = this.props;

     // 将 props 注入到被包装的组件中。
     // 通常为 state 的值或者实例方法。
     const injectedProp = someStateOrInstanceMethod;

     // 将 props 传递给被包装组件
     return (
       <WrappedComponent
         injectedProp={injectedProp}
         {...passThroughProps}
       />
     );
   }
   ```

3. **最大化可组合性**

   当我们需要传入其他参数时，一般使用函数柯里化的方式，举例：

   ```ts
   LayoutHoc(component)

   // 当需要额外参数时，采用函数柯里化的方式
   NavHoc({title: '标题'})（component）
   ```

4. **包装显示名称以便轻松调试**

   为了方便调试，可以设置显示名称，以表明它是 HOC 的产物。

   ```ts
   function withLayout(WrappedComponent) {
     class WithSubscription extends React.Component {/* ... */}
     withLayout = `withLayout(${getDisplayName(WrappedComponent)})`;
     // 或者
     withLayout = `WrappedComponent(${getDisplayName(WrappedComponent)})`;

     return withLayout;
   }

   function getDisplayName(WrappedComponent) {
     return WrappedComponent.displayName || WrappedComponent.name || 'Component';
   }
   ```

   例如设置高阶组件的 displayName 为 WappedComponent()

**高阶组件的注意事项**

1. **不要在 render 方法中使用 HOC**

   ```ts
   render() {
     // 每次调用 render 函数都会创建一个新的 EnhancedComponent
     // EnhancedComponent1 !== EnhancedComponent2
     const EnhancedComponent = enhance(MyComponent);
     // 这将导致子树每次渲染都会进行卸载，和重新挂载的操作！
     return <EnhancedComponent />;
   }
   ```

2. **复制静态方法**

   组件被包裹。这意味着新组件没有原始组件的任何静态方法。
   使用 hoist-non-react-statics 自动拷贝所有非 React 静态方法
   自认为，类的静态方法使用在另外一个组件外的使用场景并不常见
   如果有需要，也可以额外导出这个静态方法

3. **Refs 不会被传递**

   props 传递给包裹的组件，然后经包裹的组件处理，传给被包裹的组件，但是 key 和 refs 并不属于 props 的范畴，react 对两者专门处理

   这个问题，我们自己可以在包裹组件内部，拿到被包裹组件的 ref，然后通过回调函数传给包裹的组件，常见的三方库，都会提供给这么一个方法，例如 antd 组件库的 Form.create 之后可以通过 wrappedComponentRef 方法拿到被包裹的组件。

   React 16.3 之后针对 ref 透传的问题，可以使用 forwardRef API

**高阶组件的使用场景**

1. **通用布局**

   例如通用的容器样式，底部导航，头部导航

2. **通用功能**

   例如通用的错误捕捉，手势反馈
   比如多个 List 列表（Dropdown 下拉框等等数据展示类的组件）的样式是相同的，只是获取数据源的地址是不同的
   我们通过封装一个高阶组件，传入不同的地址，然后把得到的数据传给我们的组件

3. **渲染劫持**

   例如我们的组件需要做权限校验，每次进入页面，判断是否登录，没有登录跳转到登录页
   我们就可以在高阶组件里面进行判断，控制渲染的结果

4. **其他场景**

   正常情况下，我们都是要做代码分割的，我们可以在高阶组件里面动态引入组件，组件返回前，渲染 loading 组件，否则渲染我们要动态加载的组件，react-loadable 等第三方库，都是基于此原理进行设计的

**其他**

以上我们都是通过对属性的劫持方式使用高阶组件，另外一种方式，可以使用反向继承的方式使用
也就是，让我们返回的组件继承我们传入的组件，这样，我们就可以操作传入组件的原型，增强生命周期等等

### render props（渲染属性）

渲染属性只是一个小技巧，和高阶组件一样，解决代码复用的问题

1. 我们给组件的某个属性传一个函数，例如 render 属性
2. 这个函数有些特殊，例如 mouse => (<p>鼠标的位置是 {mouse.x}，{mouse.y}</p>)}，入参是组件传入，返回值是一个 React Element
3. 组件里面执行这个函数，然后把相同逻辑处理后的结果，比如说，鼠标的位置，网络请求回来的数据传给这个传入的函数 this.props.render(data)
4. 这样，我们就复用了组件的逻辑
5. 当然，不一定要用 render 属性，很常见的一种做法是使用 children 属性
6. 因为 children 属性可以写在标签里面，让我们的代码更清晰

```ts
class Mouse extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}


<Mouse render={mouse => (
  <p>鼠标的位置是 {mouse.x}，{mouse.y}</p>
)}/>

// children
<Mouse>
  {mouse => (
    <p>鼠标的位置是 {mouse.x}，{mouse.y}</p>
  )}
</Mouse>
```

- **react children 类型**

  children 可以是数组，函数，对象，字符串，数字，null

### refs

- **this.refs['ref']**(已淘汰)
- **回调函数**

  当我们传入一个回调函数给 ref 属性，react 会在组件挂载到真实 dom 后，把组件的实例传入函数，然后我们可以用一个值来接收这个实例

  ```ts
  render(){
  	return (
  		<div>
  			<Buttion ref={ref=>this.btnRef=ref}/>
  		</div>
  	)
  }

  // 使用
  this.btnRef
  ```

- **createRef**

  ```ts
  constructor(){
  	this.btnRef = React.createRef()
  }

  render(){
  	return (
  		<div>
  			<Buttion ref={this.btnRef}/>
  		</div>
  	)
  }

  // 使用
  this.btnRef.current
  ```


### context
- **旧的 context**（不要记，了解即可）

  使用：

  父组件定义 childContextTypes，子组件 getChildContext，具体用法省略。。。

  缺点：

  1.代码冗余：代码量多

  2.传递效率：虽然功能上 context 可以跨层级传递，但是本质上 context 也是同 props 一样一层一层的往下传递的，当层级过深的时候还是会出现效率问题

  3.shouldComponentUpdate：由于 context 的传递也是一层一层传递，因此它也会受到 shouldComponent 的阻断

- **新的 context 基本使用**
```ts
export default const MyContext = React.createContext(defaultValue);
// index.js
<MyContext.Provider value={name:'zz'}>

 // 子组件
  <MyContext.Consumer>
    	{{name} =>{name}}
  </MyContext.Consumer>
```

### React 其他 API

- **Fragment**

  ```ts
  // 当我们想渲染一组组件，如列表，但不想为其添加额外父节点，可以使用Fragment。
  // key 是唯一可以传递给 Fragment 的属性。未来可能会添加对其他属性的支持，例如事件。
  function Glossary(props) {
    return (
      <dl>
        {props.items.map(item => (
          // 没有`key`，React 会发出一个关键警告
          <React.Fragment key={item.id}>
            <dt>{item.term}</dt>
            <dd>{item.description}</dd>
          </React.Fragment>
        ))}
      </dl>
    );
  }

  // 短语法，不支持 key 或属性。
  <>
    <td>Hello</td>
    <td>World</td>
  </>
  ```

- **forwardRef**

  1.  **使用高阶组件引起的问题**

      因为 key 和 ref 是特殊的配置，不能像属性一样传递给子组件，所以我们高阶组件以后，再对高阶组件使用 ref，拿到的是包裹组件的实例，不能拿到我们想要的被包裹组件的实例。没有 forwardRef 之前，我们需要在高阶组件内部获取被包裹组件的实例，然后通过回调传给父组件

  2.  **forwardRef 透传**


- **lazy 和 Suspense**

  这项新功能使得可以不借助任何附加库就能通过代码分割（code splitting）延迟加载 react 组件。
  之前我们要用 react-loadable 等库 达到这一目的

  区分：动态加载组件的 loading 和 网络请求未返回数据的 loading

  1.  **使用方式**

      注意:React.lazy 和 Suspense 技术还不支持服务端渲染。

      ```ts

      const OtherComponent = React.lazy(() => import('./OtherComponent'));
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

  2.  **react-loadable**

- **memo**

  ```ts
  const MyComponent = React.memo(function MyComponent(props) {
    /* 使用 props 渲染 */
  });
  ```

  React.memo 为高阶组件
  如果你的函数组件在给定相同 props 的情况下渲染相同的结果，那么你可以通过将其包装在 React.memo 中调用，以此通过记忆组件渲染结果的方式来提高组件的性能表现。这意味着在这种情况下，React 将跳过渲染组件的操作并直接复用最近一次渲染的结果。以此提高性能

  默认情况下其只会做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。例如使用 lodash 的 isEqual 函数

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
  export default React.memo(MyComponent, areEqual);
  ```

- **Portal**

  ```ts
  ReactDOM.createPortal(child, container)
  // 第一个参数（child）是任何可渲染的 React 子元素，例如一个元素，字符串或 fragment。
  // 第二个参数（container）是一个 DOM 元素。
  ```

  createPortal 的出现为 弹窗、对话框 等脱离文档流的组件开发提供了便利
  [官方示例](https://react.docschina.org/docs/portals.html)

### Hooks API

- **什么是 Hooks**
- **Hooks 的优势**

  1. 减少层级的嵌套

## React 原理

### React 到底是什么？

- **源码目录**

  ```javascript
  ├── build --------------------------------------- 构建后的输出目录
  ├── fixtures ------------------------------------ React 开发的测试用例
  ├── packages ------------------------------------ 源码目录，我们主要剖析目录
  │   ├── create-subscription --------------------- 在组件里订阅额外数据的工具
  │   ├── events ---------------------------------- 事件处理
  │   ├── interaction-tracking -------------------- 跟踪交互事件
  │   ├── react ----------------------------------- 核心代码
  │   ├── react-art ------------------------------- 矢量图形库
  │   ├── react-dom ------------------------------- DOM 渲染相关
  │   ├── react-is -------------------------------- React 元素类型相关
  │   ├── react-native-renderer ------------------- react-native 渲染相关
  │   ├── react-noop-renderer --------------------- Fiber 测试相关
  │   ├── react-reconciler ------------------------ React 调制器
  │   ├── react-scheduler ------------------------- 规划 React 初始化，更新等等
  │   ├── react-test-renderer --------------------- 实验性的 React 渲染器
  │   ├── shared ---------------------------------- 通用代码
  │   ├── simple-cache-provider ------------------- 为 React 应用提供缓存
  │   ├── server ---------------------------------- 服务端渲染
  │   ├── sfc ------------------------------------- .vue 文件解析
  │   ├── shared ---------------------------------- 整个项目通用代码
  ├── scripts ------------------------------------- 公共的lint，build，test和release等相关的文件
  │   ├── eslint ---------------------------------- 语法规则和代码风格
  │   ├── flow ------------------------------------ Flow 类型声明
  │   ├── git ------------------------------------- git钩子的目录
  │   ├── jest ------------------------------------ JavaScript 测试目录
  │   ├── release --------------------------------- 自动发布新版本脚本
  │   ├── rollup ---------------------------------- rollup 构建目录
  ├── .babelrc ------------------------------------ babel 配置文件
  ├── .editorconfig ------------------------------- 编辑器语法规范配置
  ├── .eslintignore ------------------------------- eslint 忽略配置
  ├── .eslintrc ----------------------------------- eslint 配置文件
  ├── .gitattributes ------------------------------ 给 attributes 路径名的简单文本文件
  ├── .gitignore ---------------------------------- git 忽略配置
  ├── .mailmap ------------------------------------ 邮件列表档案
  ├── .nvmrc -------------------------------------- nvm 配置文件
  ├── .prettierrc.js ------------------------------ prettierrc 配置文件
  ├── .watchmanconfig ----------------------------- watchman 配置文件
  ├── appveyor.yml -------------------------------- GitHub 托管项目的自动化集成
  ├── AUTHORS ------------------------------------- 开发者列表档案
  ├── CHANGELOG.md -------------------------------- 更新日志
  ├── CODE_OF_CONDUCT.md -------------------------- Code of Conduct
  ├── CONTRIBUTING.md ----------------------------- Contributing to React
  ├── dangerfile.js ------------------------------- 提高 Code Review 体验
  ├── netlify.toml -------------------------------- 持续集成静态网站
  ├── package-lock.json --------------------------- npm 加锁文件
  ├── package.json -------------------------------- 项目管理文件
  ├── README.md ----------------------------------- 项目文档
  ├── yarn.lock ----------------------------------- yarn 加锁文件
  ```

- **了解：multirepo 和 monorepo**

  通常，我们会根据业务或者是功能把 package 分别放入单独的 repository 中进行维护，此方式可以简单地称为 multirepo。而 monorepo 是将所有的相关 package 都放入一个 repository 来管理。例如 Babel 官方维护了众多独立的 plugin、olyfill、preset。遵循了 monorepo 的方式，将它们放入一个相同的 repo 中。

  monorepo 优点：

  1.  一个的 lint，build，test 和 release 流程；

  2.  统一的地方处理 issue；

  3.  方便管理版本和依赖；

  4.  跨项目操作和修改变得容易；

- **React 是什么？**

  1.  **入口**

      React 的核心入口文件是 packages/react/index.js:

      ```ts
      'use strict';

      const React = require('./src/React');

      // TODO: decide on the top-level export form.
      // This is hacky but makes it work with both Rollup and Jest.
      module.exports = React.default || React;
      ```

  2.  **实际的 React**

      ```javascript
      const React = {
        // 专门处理 children的函数
        // 因为children可以是数组，可以是函数，可以是null，也可能是number，string等类型，
        // 所以react给我们暴露出一个方便操作children的函数
        Children: {
          map,
          forEach,
          count,
          toArray,
          only,
        },
        // 创建ref的函数
        createRef,
        Component,
        PureComponent,
        // 创建Context
        createContext,
        //forwardRef 是 Ref 的转发，或者叫穿透，它能够让父组件访问到子组件的 Ref，从而操作子组件的 DOM
        forwardRef,
        //lazy() 提供了动态 import 组件的能力，实现代码分割。
        lazy,
        //memo() 只能作用在简单的函数组件上，本质是一个高阶函数，可以自动帮助组件执行shouldComponentUpdate()
        memo,
        // Fragment组件其作用是可以将一些子元素添加到 DOM tree 上且不需要为这些元素提供额外的父节点，相当于 render 返回数组元素。
        Fragment: REACT_FRAGMENT_TYPE,
        //StrictMode 可以在开发阶段开启严格模式，发现应用存在的潜在问题，提升应用的健壮性
        StrictMode: REACT_STRICT_MODE_TYPE,
        //Suspense 作用是在等待组件时 suspend（暂停）渲染，并显示加载标识。搭配lazy使用
        Suspense: REACT_SUSPENSE_TYPE,
        createElement: __DEV__ ? createElementWithValidation : createElement,
        cloneElement: __DEV__ ? cloneElementWithValidation : cloneElement,
        createFactory: __DEV__ ? createFactoryWithValidation : createFactory,
        isValidElement: isValidElement, // 是否是react element

        version: ReactVersion,

        unstable_ConcurrentMode: REACT_CONCURRENT_MODE_TYPE,
        unstable_Profiler: REACT_PROFILER_TYPE,

        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:
          ReactSharedInternals,
      };
      ```

### React Component

React Component 就是我们的类组件或者函数式组件, 是一个函数

### React Element

React Element 是类组件的 render 方法的返回值，或者函数组件的返回值，也就是我们写的 JSX，最后返回一个对象

```ts
    class App extends Component {

render() {
return (

<div className="App">
<p>Hello Word</p>
</div>
);
}
}
// JSX 部分经 babel 转移后
React.createElement(
"div",
{ className: "App" },
React.createElement(
"p",
null,
"Hello Word"
)
);

    // 最后的返回值为
    {
      type: 'div',
      props: {
        className: 'app',
        children: {
          type: 'p'
          children: 'Hello Word'
        }
      }
    }

    // createElement(type,props,chidren)包含三个参数
    // 如果type为字符串时，代表是普通的节点，如div，span
    // 如果type为一个函数或一个类时，它代表自定义的节点，如

    class Button extends Component {
    	render(){
    		return (
    			<div className="App">
    	        	<p>Hello Word</p>
    	      	</div>
    		)
    	}
    }

    // 或者

    const Button = (props) => {
    	return (
    		<div className="App">
    	        <p>Hello Word</p>
    	    </div>
    	)
    }

    // jsx部分转化为

    {
      type: Button,
      props: {
        className: 'app',
        children: {
          type: 'p'
          children: 'Hello Word'
        }
      }
    }
    ```

- **React 渲染器**

  React 的定位是一个构建用户界面的，使用 JavaScript 语言开发的 UI 库，可以使用多种方式渲染这些组件，输出用户界面，很大程度上达到了跨平台的能力，在这些不同场景，渲染的主体很明显是不一样的

  1.  在 web 应用中，react-dom 模块将 React 组件渲染为 DOM

  2.  在 react-native 中，react-native-render 将 React 组件渲染为移动端原生 View

  3.  react-art 将 React 组件渲染为矢量图形

### React 渲染流程（不涉及 Fiber）

- **首次渲染**

  1.  我们通过 import 引入了的 React Component（Class Component 或者 Function Component），为一个函数
  2.  我们会用 JSX 的方式，使用一个<List />（Component Element）或者<div /> (Dom Element)的 React Element，
  3.  React Element 会被 createElement 函数转化为一个对象，对象的 type 可以为 List, 指向我们引入的组件，或者为 'div',表示 dom 节点
  4.  子代 React Element 也会被转化一个对象，作为父对象的 props.children 属性
  5.  所以，我们的应用<App /> ,会被转为为一个大的 React Element 树，也就是虚拟 DOM 树
  6.  ReactDOM 的 render 方法会将我们的虚拟 DOM 树渲染为浏览器端的真实 DOM，并挂载到我们指定的容器中
  7.  在挂载到真实 DOM 的过程中，会依次触发组件的生命周期函数（willMount，didMount）

- **更新阶段**

  1.  我们的类组件会继承自 React.Component 函数，Component 原型上含有 setState 函数
  2.  当我们的通过 setState 更改或者 props 重新传入，触发组件的更新
  3.  react 会通过 diff 算法，比对前后两个虚拟 DOM 树，计算出差异队列，处理并提交更新

### ReactDom 挂载流程

### React 类型与生命周期

### React Diff

- **传统 Diff**

  diff 算法即差异查找算法；对于 Html DOM 结构即为 tree 的差异查找算法；而对于计算两颗树的差异时间复杂度为 O（n^3）,显然成本太高，React 不可能采用这种传统算法；

- **React Diff**

  1.  **diff 策略**
      React 用三个策略将 O(n^3)复杂度降为 O(n)复杂度
  2.  Tree Diff
  3.  Component Diff
  4.  Element Diff

- **stack reconciler 和 fiber reconciler**

### 事件系统

### React Fiber

## react-router

### 基本使用

- **JSX 配置方式**

  ```
  <Router>
  	<Route path="/" component={App}>
  	  <Route path="about" component={About} />
  	  <Route path="inbox" component={Inbox}>
  	    <Route path="messages/:id" component={Message} />
  	  </Route>
  	</Route>
  </Router>
  ```

- **对象的配置方式**

  ```ts
  const routeConfig = [
    { path: '/',
      component: App,
      childRoutes: [
        { path: 'about', component: About },
        { path: 'inbox',
          component: Inbox,
          childRoutes: [
            { path: '/messages/:id', component: Message },
            { path: 'messages/:id',
              onEnter: function (nextState, replaceState) {
                replaceState(null, '/messages/' + nextState.params.id)
              }
            }
          ]
        }
      ]
    }
  ]
  ```

### 路由配置详解

- **Router**
-

### 页面缓存与路由守卫

- **页面缓存**

  react 中没有 keep-alive 组件, 如果想实现此功能需要自己实现，通过样式来控制组件的显示（display：none | block;），但是这可能会导致问题，例如切换组件时，无法使用动画；另一个实现思路可以使用 React.createPortal 把组件都挂载到了整个 App 的外面，然后把组件的 DOM 移动到需要展示的位置。

- **路由守卫**

  react-router V4 之后中没有路由守卫的 API，作者认为 JSX 更灵活，我们可以在执行渲染的过程中执行此操作，如果想实现此功能需要自己实现，可以使用 react-router 提供的另一个库，react-router-config，提供 matchRoutes 和 renderRoutes 两个函数，matchRoutrs 用于匹配路由，renderRoutes 用于渲染路由

### react-router-redux

- **react-router-redux 介绍**

react-router-redux 将 react-router 和 redux 集成到一起，用 redux 的方式去操作 react-router。
例如，react-router 中跳转需要调用 router.push(path)，
集成了 react-router-redux 跳转可以 store.dispatch(push(url))。
本质上，是把 react-router 自己维护的状态，例如 location、history、path 等等，也交给 redux 管理。
一般情况下，是没有必要使用这个库的。

### react-router V5

此版本侧重于稳定性和兼容性，带来了一系列改进和新特性，并且完全向后兼容 4.x 版本，功能和改进很明显，但是没有破坏性的变化，所以如果已经使用了 4.x 的版本，则可以在不改变代码的情况下直接使用 v5 版本
