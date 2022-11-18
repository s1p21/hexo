---
title: 深入了解Composition API和 watch 源码分析
date: 2022-11-18 15:24:30
tags: [vue3, composition API]
---

## 什么是 Composition API（VCA）

Composition API 是 vue3 推出的重磅功能之一，是一种新的编写 vue 组件的方式，实现了类似于 React hooks 可以在组件之间共享可复用的状态逻辑的特性, 方便了开发者将业务逻辑和 UI 视图进行解耦，从而状态与 UI 的界限会越来越清晰，Vue Composition API 是未来 Vue 社区组件和响应式数据组织所倡导的方式，不仅能提供性能提升、更高的逻辑清晰度，也能让我们能够更方便的复用开源社区共享的逻辑实现片段，助力我们更好的进行业务支撑。顺着这个思路，我们有机会将与业务无关的逻辑进行抽象，封装一套通用场景的纯逻辑的 Hooks 工具方法。

其实，React hooks 的问题也有很多，比如：

- Hook 是一个链表的结构，在循环，条件或嵌套函数中调用 Hook，会引发一些问题。
- useEffect 的依赖容易造成心智负担，所有人阅读这段代码，都需要完整的阅读完这些依赖触发的地方
- 由于闭包的原因，useEffect 等内部捕获的，都是过时的变量。

而 Vue 以上三个问题都没有。并且因为 setup 函数只调用一次，性能上占优，当然，根本原因就是因为它的数据是响应式的，我直接改就可以读取到最新的值。

## 对比 react 的 hooks，VCA 的优点：

### 1. 对 Hooks 使用顺序无要求，而且可以放在条件语句里。

对 React Hooks 而言，调用必须放在最前面，而且不能被包含在条件语句里，这是因为 React Hooks 采用下标方式寻找状态，一旦位置不对或者 Hooks 放在了条件中，就无法正确找到对应位置的值。
而 Vue Function API 中的 Hooks 可以放在任意位置、任意命名、被条件语句任意包裹的，因为其并不会触发 setup 的更新，只在需要的时候更新自己的引用值即可，而 Template 的重渲染则完全继承 Vue 2.0 的依赖收集机制，它不管值来自哪里，只要用到的值变了，就可以重新渲染了。

### 2. 不会每次渲染重复调用，减少 GC 压力。

这确实是 React Hooks 的一个问题，所有 Hooks 都在渲染闭包中执行，每次重渲染都有一定性能压力，而且频繁的渲染会带来许多闭包，虽然可以依赖 GC 机制回收，但会给 GC 带来不小的压力。
而 Vue Hooks 只有一个引用，所以存储的内容就非常精简，也就是占用内存小，而且当值变化时，也不会重新触发 setup 的执行，所以确实不会造成 GC 压力。

> 延伸：在 VCA 中还需要 useEffect、useCallback、useMemo 来做性能优化吗？
>
> 答：不需要使用 useEffect useMemo 等进行性能优化，所有性能优化都是自动的。这也是实在话，毕竟 Mutable + 依赖自动收集就可以做到最小粒度的精确更新，根本不会触发不必要的 Rerender，因此 useMemo 这个概念也不需要了。而 useEffect 也需要传递第二个参数 “依赖项”，在 Vue 中根本不需要传递 “依赖项”，所以也不会存在用户不小心传错的问题.

## VCA 对比 Vue2 中对象式 API（OptionsAPI）

Options API 存在的问题：

### 1. 组件逻辑膨胀导致的可读性变差--反复横跳

大部分同学都维护过超过 200 行的.vue 组件，新增或者修改一个需求，就需要分别在 data，methods，computed 里修改 ，滚动条反复上下移动，这里称之为『反复横跳』 比如我们简单的加个拍脑门的需求加个累加器 ，这种写代码上下反复横跳的体验比较差，同时，可读性随代码量增加随之变差。
![](https://raw.githubusercontent.com/s1p21/hexo/master/source/images4497234467.jpeg)

![](https://raw.githubusercontent.com/s1p21/hexo/master/source/images4497541299.jpeg)

### 2.无法很好跨组件重用代码 - mixin 和 this

#### 2.1 来源黑盒

反复横跳的本质，在于功能的分块组织，以及代码量太大了，如果我们能把代码控制在一屏，自然就解决了，vue2 里的解决方案，是使用 mixin 来混合, 我们抽离一个 counter.js

```ts
// counter.js
export default {
  data() {
    return {
      count:1
    }
  },
  computed: {
    double() {
      return this.count * 2
    }
  },
  methods:{
    add(){
      this.count++
    }
  }
}

// App.vue
import Counter from './counter'
export default {
  mixins:[Counter],
  data(){
 ...
  },
...
}
```

这样确实拆分了代码，但是有一个严重的问题，就是不打开 counter.js，App.vue 里的 this 上，count，add 这些属性，是完全不知道从哪来的，你不知道是 mixin，还是全局 install，还是 Vue.prototype.count 设置的，数据来源完全模糊，调试难度增加，这也是 option 的一个大问题，this 是个黑盒，template 里写的 count 和 double，完全不知道从哪来的。

### 2.2 命名冲突

如果有两个 mixin，就更有意思了，比如我们又有一个需求，实时显示鼠标的坐标位置 x，并且有一个乘以 2 的计算属性凑巧也叫 double，再整一个 mixin

```ts
// mixin
export default {
  data() {
    return {
      x:0
    }
  },
  methods:{
    update(e){
      this.x = e.pageX
    }
  },
  computed:{
    double(){
      return this.x*2
    }
  },
  mounted(){
    window.addEventListener('mousemove', this.update)
  },
  destroyed(){
    window.removeEventListener('mousemove', this.update)
  }
}
// App.vue
import Counter from './counter'
import Mouse from './mouse'
export default {
  mixins:[Counter,Mouse],
  ......
}
```

两个 mixin 里都有 double 这个数，尴尬，看效果 ，lsp 的 count 被覆盖了 很尴尬，而且在 App.vue 这里，你完全不知道这个 double 到底是哪个，调试很难

![](https://raw.githubusercontent.com/s1p21/hexo/master/source/images4498294791.jpeg)

**composition api 就是为了解决上述问题存在的，通过组合的方式，把零散在各个 data，methods 的代码，重新组合，一个功能的代码都放在一起维护，并且这些代码可以单独拆分成函数，不仅提高可读性和维护性，也可以更好的重用逻辑代码。**

![](https://raw.githubusercontent.com/s1p21/hexo/master/source/images4498621529.jpeg)

#### 总结

优势对比
| Options API | Composition API |
| ----------- | ----------- |
| 按 API 类型组织代码，复杂度高了后需要反复横跳| 按功能/逻辑组织代码|
| 不利于复用|极易复用,可灵活组合|
| 潜在命名冲突，数据源来源不清晰|数据来源清晰|
| 上下文丢失 |提供更好的上下文|
| 有限类型支持|更好的 TypeScript 支持|
| 响应式数据必须在组件的 data 中定义|可独立 vue 组件使用|

## watch 源码分析

在使用 Composition API 的过程中，我们不可避免的使用 watch 监听方法，监听数据的变化从而进行业务的操作。但是在 watch 方法的使用过程中，发现只能以两种方式来传入 watch 的数据源信息，那么这两者有什么区别呢？

### watch 方法的 API

首先看下 watch 的 ts 类型

```ts
// 源码中的createWatcher方法
function createWatcher(
  vm: ComponentInstance,
  source: WatchSource<unknown> | WatchSource<unknown>[] | WatchEffect,
  cb: WatchCallback<any> | null,
  options: WatchOptions
);

//  类型声明如下

declare function watch<
  T extends Readonly<WatchSource<unknown>[]>,
  Immediate extends Readonly<boolean> = false
>(
  sources: T,
  cb: WatchCallback<MapSources<T>, MapOldSources<T, Immediate>>,
  options?: WatchOptions<Immediate>
): WatchStopHandle;

declare function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle;

declare function watch<
  T extends object,
  Immediate extends Readonly<boolean> = false
>(
  source: T,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>
): WatchStopHandle;

// 其中watchSource和watchCallback分别为
type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);

type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onInvalidate: InvalidateCbRegistrator
) => any;
```

综上所述，watch 接受三个参数，第一个是数据源信息，可以是 any 也可以是 ref 或者是 reactive 的类型，第二个参数是一个 watch 函数，接受三个参数，最新的 value，oldValue 和验证 onInvalidate 参数，第三个 option 的参数就是 immetiate 和 deep 的属性了

那么其在业务中的最佳实践是什么样的呢？

```ts
const user = reactive({ name: "tom" });
// ✅ 方法一，传递响应对象
watch(user, (value) => {
  console.log(value); // 监听成功，输出 { name: 'jake' }
});
// ❌ 方法二：传递响应对象下的属性
watch(user.name, (value) => {
  console.log(value); // 监听失败，没输出
});
// ✅ 方法三：传递函数，函数返回响应对象属性
watch(
  () => user.name,
  (value) => {
    console.log(value); // 监听成功，输出 jake
  }
);
// 对响应对象重新赋值
user.name = "jake";
```

第二种方式为什么不能被监听呢？
查看[源码](https://github.com/vuejs/composition-api/blob/main/src/apis/watch.ts)，在第二种场景下，else 逻辑，使得 getter 变成 noopFn。所以没法触发 getter，也就是没法收集 effect，最终导致 watch 失效。

![](https://raw.githubusercontent.com/s1p21/hexo/master/source/images202211181733359.png)

也就是说针对第二种情况，我们可以通过将 user.name 转化成 ref 或者变成第三种来触发其属性的变更。实践证明，确实是可以执行的。

```ts
const user = reactive({ name: "tom" });
const { name } = toRefs(user);
watch(name, (value) => {
  console.log(value); // 监听监听成功，输出 jake
});
```

## 总结

本文主要介绍了 Composition API (VCA), 并且与 React hooks 以及 Option API 进行了对比，详细阐述了 VCA 的一些优点; 结合 VCA 的 watch 源码，详细阐述了 watch 的数据源类型只能是响应对象和函数，否则将无法监听数据源的变更。
