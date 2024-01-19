---
title: 面试-vue
date: 2022-11-30 15:00:39
tags: [面试, vue]
---

#### vue 的双向绑定

vue2.x 中通过发布者-订阅者设计模式的方式实现，通过 get 和 set 方法，通过 Object.defineProperty() 实现数据劫持
有三个参数，对象，对象的属性，以及描述符对象
描述符对象： 数据属性：

- writable 可读写
- enumerable 可迭代，表示是否可用 for in 循环
- configurable 是否可删除
- value 值

访问器属性

- get
- set

同时需要遍历所有属性进行双向绑定

缺点：对于新增的属性无法监听，需要通过 vm.$set 方法新增属性；

vue3 中通过 proxy 的 api 来实现监听
proxy 有两个参数
target:要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）
handler:一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。

#### vue 的生命周期

vue2.x

beforeCreate
created
beforeMount
mounted
beforeUpdate
updated
beforeDestory
destoryed

加载渲染过程
父 beforeCreate -> 父 created -> 父 beforeMount-> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted

子组件更新过程
父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated

父组件更新过程
父 beforeUpdate -> 父 updated

销毁过程
父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed

vue3
setup
onBeforeMount
onMounted
onBeforeUpdated
onUpdated
onBeforeUnmount
onUnmounted

#### vuex 和 pinia

vuex 分为 State、Getter、Mutation、Action、Module
dispatch 方法操作->action->commit 方法->mutation
State 是状态，mapState 通常用来解决一个组件需要获取多个状态时的辅助函数；
Getter state 对象读取方法，用来计算 state 然后生成新的数据，相当于对于部分 state 重新封装了一层
Mutation 对 state 进行改变的唯一方法，其中 Mutation 必须是同步的
Action 是通过触发 Mutation 从而改变 state，可以包含任意异步操作，其中通过 store.dispatch 进行触发
Module 可以说是对 store 进行分割，每一个 module 拥有自己的 state，mutation，action，getter 等。命名空间使得模块的封装和复用更加方便
插件使用使得 vuex 扩展性更好，表单处理的双向绑定需要绑定事件或者通过计算属性的 setter 进行双向绑定

缺点：

1. TS 支持不良好
2. 不能同时支持 Composition API 和 Option API（vuex5 之后支持）

pinia

1. 去掉了容易混淆的 mutation 和 action 概念，只保留了 action，action 中的函数可以是同步的也可以是异步的，并且可以直接调用 action 中的方法，不再需要 commit、dispatch 等方法，语法更简洁；
2. 无需创建自定义复杂包装器来支持 TypeScript，所有内容都是类型化的，并且 API 的设计方式尽可能地利用了 TS 的类型推断；
3. 不再有 modules 的嵌套结构。 Pinia 通过设计提供平面结构，同时仍然支持 Store 之间的交叉组合方式；
4. 更加轻便 Pinia 大小约 1kb

#### nextTick

在下次 DOM 更新循环结束之后执行延迟回调，在修改数据之后立即使用 nextTick 来获取更新后的 DOM。 nextTick 主要使用了宏任务和微任务。 根据执行环境分别尝试采用 Promise、MutationObserver、setImmediate，如果以上都不行则采用 setTimeout 定义了一个异步方法，多次调用 nextTick 会将方法存入队列中，通过这个异步方法清空当前队列。

1. nextTick 是 Vue 提供的一个全局 API,是在下次 DOM 更新循环结束之后执行延迟回调，在修改数据之后使用$nextTick，则可以在回调中获取更新后的 DOM；
2. Vue 在更新 DOM 时是异步执行的。只要侦听到数据变化，Vue 将开启 1 个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个 watcher 被多次触发，只会被推入到队列中-次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作是非常重要的。nextTick 方法会在队列中加入一个回调函数，确保该函数在前面的 dom 操作完成后才调用；
3. 比如，我在干什么的时候就会使用 nextTick，传一个回调函数进去，在里面执行 dom 操作即可；
4. 我也有简单了解 nextTick 实现，它会在 callbacks 里面加入我们传入的函数，然后用 timerFunc 异步方式调用它们，首选的异步方式会是 Promise。这让我明白了为什么可以在 nextTick 中看到 dom 操作结果。

#### v-model 语法糖和 vue3 的 v-model 变化

value+input 是 v-band 和 v-on 的简洁写法
在 vue2 中 v-model 只能绑定在组件的 value 属性上
在 2.x 版本中 可以在组件内部定义一个 model 项，其中 prop 用来设置 v-model 中默认的 value 的别名， event 用来设置 v-model 中默认的 input 事件的别名
一个组件上只能一个 v-model

在 vue3 中 v-bind 的.sync 修饰符和组件的 model 选项被删除了
支持同一组件同时设置多个 v-model
也可以自定义修饰符
v-model 绑定的不再是 value，而是 modelValue，接收的方法也不再是 input，而是 update:modelValue

#### vue 的通信方式

- 父子：props 和$emit
- 爷孙：$attrs和$listeners
- eventbus
- provide 和 inject
- $parent 和$children
- vuex
- 自定义 store

#### Object.defineProperty 处理 Array 的 push

需要重新处理 push 方法

```js
const originProto = Array.prototype;
const arrayProto = Object.create(originProto);
arrayProto["push"] = function () {
  originProto.push().apply(this, arguments);
  console.log("jjjkjkjk");
};
data.__proto__ = arrayProto;
Object.defineProperty(data, "push", {
  set: (newVal) => {
    console.log("kkkkjj");
    render();
  },
});
```

#### proxy 的写法

```js
data = new Proxy(data, {
  set: (target, key, value, receiver) => {
    console.log("key", key);
    target[key] = value;
    // Reflect.set(target.key,value,receiver)
    render();
    return true;
  },
});
```

#### 浏览器回退、切换会触发 vue 的哪些生命周期

页面刷新时, vue 执行的生命周期钩子
依次执行当前页面 vue 组件的 beforeCreate, created, beforeMount, mounted, beforUpdate, updated

页面后退时, vue 执行的生命周期钩子
假设从 b 页面后退到 a 页面
依次执行 a 页面 vue 组件的 beforeCreate, created, beforeMount, 然后是 b 页面组件的 beforeDestroy, destroyed, 最后是执行 a 页面 vue 组件的 mounted, beforUpdate, updated

页面前进时, vue 执行的生命周期钩子
假设从 a 页面到 b 页面
依次执行 b 页面 vue 组件的 beforeCreate, created, beforeMount, 然后是 a 页面组件的 beforeDestroy, destroyed, 最后是执行 b 页面 vue 组件的 mounted, beforUpdate, updated

#### vue 中的 diff

在 vue1.0 中，通过 watch 来实现数据和视图的响应式更新，通过观察者模式
在 vue2.x 中，因为还是无法解决响应式数据过多而引起的卡顿的问题，vue2.x 引入了虚拟 DOM，对于 Vue 2 来说，组件之间的变化，可以通过响应式来通知更新。组件内部的数据变化，则通过虚拟 DOM 去更新页面。这样就把响应式的监听器，控制在了组件级别，而虚拟 DOM 的量级，也控制在了组件的大小。

如果没有绑定 key，对于 DOM 的顺序发生变化，比如直接插入，会导致后面的数据不变的组件重新渲染

#### vue 的 keep-alive 的作用是什么？怎么实现的？如何刷新的?

保持组件不被销毁，组件挂载的数据还存在，所以状态就可以保留。
在首次加载被包裹组建时，由 keep-alive.js 中的 render 函数可知，vnode.componentInstance 的值是 undfined，keepAlive 的值是 true，因为 keep-alive 组件作为父组件，它的 render 函数会先于被包裹组件执行；那么只执行到 i(vnode,false)，后面的逻辑不执行；
再次访问被包裹组件时，vnode.componentInstance 的值就是已经缓存的组件实例，那么会执行 insert(parentElm, vnode.elm, refElm)逻辑，这样就直接把上一次的 DOM 插入到父元素中。

在 patch 的阶段，最后会执行 invokeInsertHook 函数，而这个函数就是去调用组件实例（VNode）自身的 insert 钩子：
在 insert 这个钩子里面，调用了 activateChildComponent 函数递归地去执行所有子组件的 activated 钩子函数：
相反地，deactivated 钩子函数也是一样的原理，在组件实例（VNode）的 destroy 钩子函数中调用 deactivateChildComponent 函数。

#### render 和 template 的区别

template----html 的方式做渲染
render----js 的方式做渲染
render（提供）是一种编译方式
render 里有一个函数 h，这个 h 的作用是将单文件组件进行虚拟 DOM 的创建，然后再通过 render 进行解析。
h 就是 createElement()方法：createElement(标签名称,属性配置,children)
template 也是一种编译方式，但是 template 最终还是要通过 render 的方式再次进行编译。

render 渲染方式可以让我们将 js 发挥到极致，因为 render 的方式其实是通过 createElement()进行虚拟 DOM 的创建。逻辑性比较强，适合复杂的组件封装。
template 是类似于 html 一样的模板来进行组件的封装。
render 的性能比 template 的性能好很多
render 函数优先级大于 template

#### vue3 生命周期实现原理

就是把各个生命周期的函数挂载或者叫注册到组件的实例上，然后等到组件运行到某个时刻，再去组件实例上把相应的生命周期的函数取出来执行。
各个生命周期的 Hooks 函数是通过 createHook 这个函数创建的。createHook 是一个闭包函数，通过闭包缓存当前是属于哪个生命周期的 Hooks,target 表示该生命周期 Hooks 函数被绑定到哪个组件实例上，默认是当前工作的组件实例。createHook 底层又调用了一个 injectHook 的函数，那么下面我们继续来看看这个 injectHook 函数。

Vue3 组件实例化之后，通过 effect 包装一个更新的副作用函数来和响应式数据进行依赖收集。在这个副作用函数里面有两个分支，第一个是组件挂载之前执行的，也就是生命周期函数 beforeMount 和 mount 调用的地方，第二个分支是组件挂载之后更新的时候执行的，在这里就是生命周期函数 beforeUpdate 和 updated 调用的地方。具体就是在挂载之前，还没生成虚拟 DOM 之前就执行 beforeMount 函数，之后则去生成虚拟 DOM 经过 patch 之后，组件已经被挂载到页面上了，也就是页面上显示视图了，这个时候就去执行 mount 函数;在更新的时候，还没获取更新之后的虚拟 DOM 之前执行 beforeUpdate，然后去获取更新之后的虚拟 DOM，然后再去 patch，更新视图，之后就执行 updated。需要注意的是 beforeMount 和 beforeUpdate 是同步执行的，都是通过 invokeArrayFns 来调用的

Vue 的 Hooks 设计是从 React 的 Hooks 那里借鉴过来的，React 的 Hooks 的本质就是把状态变量、副作用函数存到函数组件的 fiber 对象上，等到将来状态变量发生改变的时候，相关的函数组件 fiber 就重新进行更新。Vue3 这边的实现原理也类似，通过上面的生命周期的 Hooks 实现原理，我们可以知道 Vue3 的生命周期的 Hooks 是绑定到具体的组件实例上，而状态变量，则因为 Vue 的变量是响应式的，状态变量会通过 effect 和具体的组件更新函数进行依赖收集，然后进行绑定，将来状态变量发生改变的时候，相应的组件更新函数会重新进入调度器的任务队列进行调度执行。

所以 Hooks 的本质就是让那些状态变量或生命周期函数和组件绑定起来，组件运行到相应时刻执行相应绑定的生命周期函数，那些绑定的变量发生改变的时候，相应的组件也重新进行更新。

#### 组件设计原则

单一职责： 一个组件负责完成一个职责/功能
保持简单：不要过度优化，从而牺牲了代码可读性和可维护性
不要重复：做好代码的复用性
控制反转：子组件的创建与管理交给外层容器组件来控制
关注点分离：如果一个问题能分解为独立且较小的问题，就是相对较易解决的。实现关注点分离的方式有两种：一种是标准化，另一种就是抽象与包装
松耦合：组件的核心思想是它们是可复用的,为此要求它们必须具有功能性和完整性。“耦合”是指实体彼此依赖的术语。松散耦合的实体应该能够独立运行，而不依赖于其他模块。就前端组件而言，耦合的主要部分是组件的功能依赖于其父级及其传递的 props 的多少，以及内部使用的子组件（当然还有引用的部分，如第三方模块或用户脚本）。在设计组件时，你应该考虑到更加通用的使用场景，而不仅仅只是为了满足最开始某个特定场景的需求。虽然一般来说组件最初都是出于特定目的进行设计，但没关系，如果在设计它们站在更高的角度去看待，那么很多组件将具有更好的适用性。

#### vue router3 和 vue router4 的区别

1. 创建方式：在Vue Router 4中，使用createRouter来创建一个路由实例，而在Vue Router 3中，则是通过创建一个VueRouter实例来进行。

```js
//  4.x 写法
import { createRouter } from "vue-router"
const router = createRouter({
    // options
    .....
})

// 3.x 写法
import VueRouter from "vue-router"
const router = new VueRouter({
    // options
    ......
})
```

2. 路由模式的定义方式：在Vue Router 4中，使用createWebHistory或createWebHashHistory来定义路由模式，而在Vue Router 3中，则是通过在路由实例中设置mode属性来定义。

```js
//  4.x 写法
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
const router = createRouter({
  history: createWebHistory() / createWebHashHistory(),
});

// 3.x 写法
const router = new VueRouter({
  mode: "hash" / "history",
});
```

3. 挂载方式：在Vue 3中使用Composition API，所以Vue Router也要以插件的形式进行挂载。在Vue Router 4中，使用useRouter和useRoute两个API来在组件中获取到路由实例和路由对象。而在Vue Router 3中，则是直接在组件实例中使用this.$router来获取路由实例，并使用this.$route来获取路由对象。

```js
// 4.x

import { createApp } from "vue";
import router from "./router.js";
import App from "./App.vue";
createApp(App).use(router).mount("#app");

// 3.x

import router from "./router.js";
new Vue({
  router,
});
```

4. 组件中的使用方式：因为在Vue 3的setup函数中无法使用this，所以在Vue Router 4中提供了useRouter和useRoute两个API来在组件中获取到路由实例和路由对象。而在Vue Router 3中，则是在组件的实例方法中使用this.$router来获取路由实例，并使用this.$route来获取路由对象。

```js
// 4.x
import { useRouter,useRoute } from "vue-router"
export default({
    setup(){
    const router = useRouter();
    const route = useRoute();
    const linkToHome = () => {
        router.push({
            path:'/'
        })
    }
    return{
        linkToHome
    }
    }
})

// 3.x

export default({
    methods:{
        linkToHome(){
        this.$router.push({
                path:'/'
            })
        }
    }
})

```

5. 导航守卫：由于Vue 3的Composition API变革，beforeRouteUpdate 和 beforeRouteLeave 被替换为 onBeforeRouteUpdate 和 onBeforeRouteLeave。


#### app.use 操作了什么？
在Vue中，app.use是Vue的全局API之一，用于在Vue应用程序中引入和注册插件。

app.use操作会调用Vue构造器的use方法，该方法接受一个插件对象或模块作为参数。当调用app.use时，Vue会将插件对象或模块的原型链与Vue构造器的原型链进行合并，这样插件就可以访问Vue的核心API和功能。

具体来说，app.use操作会执行以下操作：

引入插件：如果参数是一个对象，它将作为插件对象被引入。插件对象的属性可以包含要注册的插件功能。
注册插件：如果参数是一个模块，它将被作为插件模块进行注册。这意味着它的属性和方法将被添加到Vue的全局API中，可以在整个应用程序中使用。
合并原型链：无论是引入插件对象还是注册插件模块，Vue都会将它们的原型链与Vue构造器的原型链进行合并。这样，插件就可以访问Vue的核心API和功能，例如this.$createElement、this.$set等。
通过app.use可以方便地将第三方库或自定义插件集成到Vue应用程序中，实现扩展和定制化功能，是Vue开发中常见的一种扩展方式。