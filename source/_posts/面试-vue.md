---
title: 面试-vue
date: 2022-11-30 15:00:39
tags: [面试,vue]
---

#### vue 的双向绑定
vue2.x 中通过发布者-订阅者设计模式的方式实现，通过get和set方法，通过Object.defineProperty() 实现数据劫持
view更新data其实可以通过事件监听

流程：1实现一个监听器Observer；2: 发布一个订阅者Watcher，3、实现一个解析器

缺点：对于新增的属性无法监听，需要通过 vm.$set方法新增属性，对于数组通过push方法给数组增加的元素也是监听不到

vue3 中通过proxy的api 来实现监听

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

