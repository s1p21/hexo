---
title: 面试-vue
date: 2022-11-30 15:00:39
tags: [面试,vue]
---

#### vue 的双向绑定
vue2.x 中通过发布者-订阅者设计模式的方式实现，通过get和set方法，通过Object.defineProperty() 实现数据劫持
有三个参数，对象，对象的属性，以及描述符对象
描述符对象： 数据属性：
- writable 可读写
- enumerable 可迭代，表示是否可用for in循环
- configurable 是否可删除
- value 值

访问器属性
- get
- set

同时需要遍历所有属性进行双向绑定


缺点：对于新增的属性无法监听，需要通过 vm.$set方法新增属性；

vue3 中通过proxy的api 来实现监听
proxy有两个参数
target:要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）
handler:一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。


#### vue的生命周期
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
父beforeCreate -> 父created -> 父beforeMount-> 子beforeCreate -> 子created -> 子beforeMount -> 子mounted -> 父mounted

子组件更新过程
父beforeUpdate -> 子beforeUpdate -> 子updated -> 父updated

父组件更新过程
父beforeUpdate -> 父updated

销毁过程
父beforeDestroy -> 子beforeDestroy -> 子destroyed -> 父destroyed



vue3
setup
onBeforeMount
onMounted
onBeforeUpdated
onUpdated
onBeforeUnmount
onUnmounted

#### vuex 和pinia

vuex分为State、Getter、Mutation、Action、Module
dispatch方法操作->action->commit方法->mutation
State是状态，mapState通常用来解决一个组件需要获取多个状态时的辅助函数；
Getter state对象读取方法，用来计算state然后生成新的数据，相当于对于部分state重新封装了一层
Mutation对state进行改变的唯一方法，其中Mutation必须是同步的
Action是通过触发Mutation从而改变state，可以包含任意异步操作，其中通过store.dispatch进行触发
Module可以说是对store进行分割，每一个module拥有自己的state，mutation，action，getter等。命名空间使得模块的封装和复用更加方便
插件使用使得vuex扩展性更好，表单处理的双向绑定需要绑定事件或者通过计算属性的setter进行双向绑定

缺点：
1. TS支持不良好
2. 不能同时支持Composition API和Option API（vuex5 之后支持）


pinia
1. 去掉了容易混淆的mutation和action概念，只保留了action，action中的函数可以是同步的也可以是异步的，并且可以直接调用action中的方法，不再需要commit、dispatch等方法，语法更简洁；
2. 无需创建自定义复杂包装器来支持 TypeScript，所有内容都是类型化的，并且 API 的设计方式尽可能地利用了 TS 的类型推断；
3. 不再有 modules 的嵌套结构。 Pinia 通过设计提供平面结构，同时仍然支持 Store 之间的交叉组合方式；
4. 更加轻便 Pinia 大小约1kb


#### nextTick
在下次 DOM 更新循环结束之后执行延迟回调，在修改数据之后立即使用 nextTick 来获取更新后的 DOM。 nextTick主要使用了宏任务和微任务。 根据执行环境分别尝试采用Promise、MutationObserver、setImmediate，如果以上都不行则采用setTimeout定义了一个异步方法，多次调用nextTick会将方法存入队列中，通过这个异步方法清空当前队列。

1. nextTick是Vue提供的一个全局API,是在下次DOM更新循环结束之后执行延迟回调，在修改数据之后使用$nextTick，则可以在回调中获取更新后的DOM；
2. Vue在更新DOM时是异步执行的。只要侦听到数据变化，Vue将开启1个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个watcher被多次触发，只会被推入到队列中-次。这种在缓冲时去除重复数据对于避免不必要的计算和DOM操作是非常重要的。nextTick方法会在队列中加入一个回调函数，确保该函数在前面的dom操作完成后才调用；
3. 比如，我在干什么的时候就会使用nextTick，传一个回调函数进去，在里面执行dom操作即可；
4. 我也有简单了解nextTick实现，它会在callbacks里面加入我们传入的函数，然后用timerFunc异步方式调用它们，首选的异步方式会是Promise。这让我明白了为什么可以在nextTick中看到dom操作结果。





#### v-model语法糖和 vue3的v-model变化
value+input 是v-band和v-on的简洁写法
在vue2中 v-model 只能绑定在组件的 value 属性上
在2.x 版本中 可以在组件内部定义一个model项，其中prop用来设置v-model中默认的value的别名， event用来设置v-model中默认的input事件的别名
一个组件上只能一个v-model

在vue3中v-bind的.sync修饰符和组件的model选项被删除了
支持同一组件同时设置多个 v-model
也可以自定义修饰符
v-model绑定的不再是value，而是modelValue，接收的方法也不再是input，而是update:modelValue


#### vue 的通信方式
- 父子：props和$emit
- 爷孙：$attrs和$listeners
- eventbus
- provide和 inject
- $parent 和$children
- vuex
- 自定义store


#### Object.defineProperty 处理Array的push
需要重新处理push方法
```js
 const originProto = Array.prototype
    const arrayProto = Object.create(originProto)
    arrayProto['push'] = function() {
        originProto.push().apply(this,arguments)
        console.log('jjjkjkjk')
    }
    data.__proto__= arrayProto
    Object.defineProperty(data,'push',{
        set:(newVal) =>{
            console.log('kkkkjj')
            render()
        }
    })
```

#### proxy 的写法

```js
 data = new Proxy(data,{
        set:(target,key,value,receiver)=>{
            console.log('key',key)
            target[key]=value
            // Reflect.set(target.key,value,receiver)
            render()
            return true

        }
    })
```

#### 浏览器回退、切换会触发vue的哪些生命周期

页面刷新时, vue执行的生命周期钩子
依次执行当前页面vue组件的beforeCreate, created, beforeMount, mounted, beforUpdate, updated

页面后退时, vue执行的生命周期钩子
假设从b页面后退到a页面
依次执行a页面vue组件的beforeCreate, created, beforeMount, 然后是b页面组件的beforeDestroy, destroyed, 最后是执行a页面vue组件的mounted, beforUpdate, updated

页面前进时, vue执行的生命周期钩子
假设从a页面到b页面
依次执行b页面vue组件的beforeCreate, created, beforeMount, 然后是a页面组件的beforeDestroy, destroyed, 最后是执行b页面vue组件的mounted, beforUpdate, updated


#### vue 中的diff
在vue1.0 中，通过watch来实现数据和视图的响应式更新，通过观察者模式
在vue2.x中，因为还是无法解决响应式数据过多而引起的卡顿的问题，vue2.x 引入了虚拟DOM，对于 Vue 2 来说，组件之间的变化，可以通过响应式来通知更新。组件内部的数据变化，则通过虚拟DOM去更新页面。这样就把响应式的监听器，控制在了组件级别，而虚拟DOM的量级，也控制在了组件的大小。

如果没有绑定key，对于DOM的顺序发生变化，比如直接插入，会导致后面的数据不变的组件重新渲染

#### vue 的keep-alive的作用是什么？怎么实现的？如何刷新的?
保持组件不被销毁，组件挂载的数据还存在，所以状态就可以保留。
在首次加载被包裹组建时，由keep-alive.js中的render函数可知，vnode.componentInstance的值是undfined，keepAlive的值是true，因为keep-alive组件作为父组件，它的render函数会先于被包裹组件执行；那么只执行到i(vnode,false)，后面的逻辑不执行；
再次访问被包裹组件时，vnode.componentInstance的值就是已经缓存的组件实例，那么会执行insert(parentElm, vnode.elm, refElm)逻辑，这样就直接把上一次的DOM插入到父元素中。

在patch的阶段，最后会执行invokeInsertHook函数，而这个函数就是去调用组件实例（VNode）自身的insert钩子：
在insert这个钩子里面，调用了activateChildComponent函数递归地去执行所有子组件的activated钩子函数：
相反地，deactivated钩子函数也是一样的原理，在组件实例（VNode）的destroy钩子函数中调用deactivateChildComponent函数。


#### render 和template 的区别
template----html的方式做渲染
render----js的方式做渲染
render（提供）是一种编译方式
render里有一个函数h，这个h的作用是将单文件组件进行虚拟DOM的创建，然后再通过render进行解析。
h就是createElement()方法：createElement(标签名称,属性配置,children)
template也是一种编译方式，但是template最终还是要通过render的方式再次进行编译。


render渲染方式可以让我们将js发挥到极致，因为render的方式其实是通过createElement()进行虚拟DOM的创建。逻辑性比较强，适合复杂的组件封装。
template是类似于html一样的模板来进行组件的封装。
render的性能比template的性能好很多
render函数优先级大于template


#### vue3 生命周期实现原理
就是把各个生命周期的函数挂载或者叫注册到组件的实例上，然后等到组件运行到某个时刻，再去组件实例上把相应的生命周期的函数取出来执行。
各个生命周期的Hooks函数是通过createHook这个函数创建的。createHook是一个闭包函数，通过闭包缓存当前是属于哪个生命周期的Hooks,target表示该生命周期Hooks函数被绑定到哪个组件实例上，默认是当前工作的组件实例。createHook底层又调用了一个injectHook的函数，那么下面我们继续来看看这个injectHook函数。

Vue3组件实例化之后，通过effect包装一个更新的副作用函数来和响应式数据进行依赖收集。在这个副作用函数里面有两个分支，第一个是组件挂载之前执行的，也就是生命周期函数beforeMount和mount调用的地方，第二个分支是组件挂载之后更新的时候执行的，在这里就是生命周期函数beforeUpdate和updated调用的地方。具体就是在挂载之前，还没生成虚拟DOM之前就执行beforeMount函数，之后则去生成虚拟DOM经过patch之后，组件已经被挂载到页面上了，也就是页面上显示视图了，这个时候就去执行mount函数;在更新的时候，还没获取更新之后的虚拟DOM之前执行beforeUpdate，然后去获取更新之后的虚拟DOM，然后再去patch，更新视图，之后就执行updated。需要注意的是beforeMount和beforeUpdate是同步执行的，都是通过invokeArrayFns来调用的

Vue的Hooks设计是从React的Hooks那里借鉴过来的，React的Hooks的本质就是把状态变量、副作用函数存到函数组件的fiber对象上，等到将来状态变量发生改变的时候，相关的函数组件fiber就重新进行更新。Vue3这边的实现原理也类似，通过上面的生命周期的Hooks实现原理，我们可以知道Vue3的生命周期的Hooks是绑定到具体的组件实例上，而状态变量，则因为Vue的变量是响应式的，状态变量会通过effect和具体的组件更新函数进行依赖收集，然后进行绑定，将来状态变量发生改变的时候，相应的组件更新函数会重新进入调度器的任务队列进行调度执行。

所以Hooks的本质就是让那些状态变量或生命周期函数和组件绑定起来，组件运行到相应时刻执行相应绑定的生命周期函数，那些绑定的变量发生改变的时候，相应的组件也重新进行更新。

#### 组件设计原则
单一职责： 一个组件负责完成一个职责/功能
保持简单：不要过度优化，从而牺牲了代码可读性和可维护性
不要重复：做好代码的复用性
控制反转：子组件的创建与管理交给外层容器组件来控制
关注点分离：如果一个问题能分解为独立且较小的问题，就是相对较易解决的。实现关注点分离的方式有两种：一种是标准化，另一种就是抽象与包装
松耦合：组件的核心思想是它们是可复用的,为此要求它们必须具有功能性和完整性。“耦合”是指实体彼此依赖的术语。松散耦合的实体应该能够独立运行，而不依赖于其他模块。就前端组件而言，耦合的主要部分是组件的功能依赖于其父级及其传递的 props 的多少，以及内部使用的子组件（当然还有引用的部分，如第三方模块或用户脚本）。在设计组件时，你应该考虑到更加通用的使用场景，而不仅仅只是为了满足最开始某个特定场景的需求。虽然一般来说组件最初都是出于特定目的进行设计，但没关系，如果在设计它们站在更高的角度去看待，那么很多组件将具有更好的适用性。


#### vue router3 和vue router4的区别


#### app.use 操作了什么？
