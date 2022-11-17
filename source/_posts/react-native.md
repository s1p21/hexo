---
title: react-native
date: 2022-11-04 11:51:43
tags: [react-native, RN]
---

## react-native

### 简介

React Native 可以让我们开发者使用 JavaScript 和 React 开发我们的应用，使用 React Native 的组件和 API 通过 JavaScriptCore 和 Native 之间进行交互，React Native 使用的基础组件和原生应用完全一致，使我们通过 JSX 的写法可以获得和用 Objective-C 或 Java 编写的应用几乎相同的体验

### 原理

- **简单原理**

  在 React Native 框架中，JSX 源码通过 React Native 框架编译后，通过对应平台的 Bridge 实现了与原生框架的通信。如果我们在程序中调用了 React Native 提供的 API，那么 React Native 框架就通过 Bridge 调用原生框架中的方法。 因为 React Native 的底层为 React 框架，所以如果是 UI 层的变更，那么就映射为虚拟 DOM 后进行 diff 算法，diff 算法计算出变动后的 JSON 数据，最终由 Native 层将此 JSON 数据映射渲染到原生 App 的页面元素上，最终实现了在项目中只需要控制 state 以及 props 的变更来引起 iOS 与 Android 平台的 UI 变更

- **启动流程**

  以 IOS 启动流程为例：

  1.  创建 RCTRootView -> 设置窗口根控制器的 View,把 RN 的 View 添加到窗口上显示
  2.  创建 RCTBridge -> 桥接对象,管理 JS 和 OC 交互，做中转 JS 和 OC
  3.  创建 RCTBatchedBridge -> 批量桥架对象，JS 和 OC 交互具体实现都在这个类中
  4.  执行[RCTBatchedBridge loadSource] -> 加载 JS 源码
  5.  执行[RCTBatchedBridge initModulesWithDispatchGroup] -> 创建 OC 模块表
  6.  执行[RCTJSCExecutor injectJSONText] -> 往 JS 中插入 OC 模块表
  7.  执行完 JS 代码，回调 OC，调用 OC 中的组件
  8.  完成 UI 渲染

- **通信原理**

  1.  Objective-C 和 JavaScript 两端都保存了一份配置表，里面标记了所 Objective-C 暴露给 JavaScript 的模块和方法。这样，无论是哪一方调用另一方的方法，实际上传递的数据只有 ModuleId、MethodId 和 Arguments 这三个元素，它们分别表示类、方法和方法参数，当 Objective-C 接收到这三个值后，就可以通过 runtime 唯一确定要调用的是哪个函数，然后调用这个函数。

  2.  Objective-C 调用 JavaScript：Objective-C 开辟一个单独的线程运行 JavaScript 代码，调用 JavaScript 可以直接发送事件

  3.  JavaScript 调用 Objective-C：在调用 Objective-C 代码时，JavaScript 会解析出方法的 moduleID、methodID 和 params 并放入到 MessageQueue 中，等待 Objective-C 主动拿走，或者超时后主动发送给 Objective-C。

### 项目架构

- **数据持久化**

  1.  当存储一些用户信息数据或者需要保存一些信息到本地时，可以使用 React Native 提供的 AsyncStorage API 它是一个简单的、异步的、持久化的 Key-Value 存储系统，它对于 App 来说是全局性的。可用来代替 LocalStorage。在 iOS 上，AsyncStorage 在原生端的实现是把较小值存放在序列化的字典中，而把较大值写入单独的文件。在 Android 上，AsyncStorage 会尝试使用 RocksDB，或退而选择 SQLite。JS 代码提供了对原生实现的一个封装，以提供一个更清晰的 JS API、抛出真正的 Error 对象，以及简单的单项对象操作函数。每个方法都会返回一个 Promise 对象。

      2.  因为 redux 的 store 数据存在内存中，所以当应用进程被杀掉以后，store 中的数据会消失所以需要把 store 中的数据存储到本地时，可以使用 redux 的中间件 redux-persist，他会在应用重启以后，恢复本地数据到 store 中

- **网络请求**

  React Native 提供了和 web 标准一致的 Fetch API，同样 React Native 中已经内置了 XMLHttpRequest API。一些基于 XMLHttpRequest 封装的第三方库也可以使用.

- **三方和原生支持**

  当有一些操作或组件，诸如文件下载，文件流操作，视频播放，图片上传等，React Native 不支持，或支持度很差时，这是就需要从社区搜索组件，解决问题，文件下载可以 使用 react-native-fs，文件流处理可以使用 fn-fetch-blob，视频播放可以使用 react-native-video 进行封装，便于使用，
  此外当第三方组件都不能很好的支持项目时，原生的支持必不可少，比如地理定位，React Native 不支持国内环境，又不至于为了一个定位信息，引入一整个三方地图包，所以我们可以使用原生提供的方法，比如分享，原生集成了分享功能，我们不需要为了分享功能引入过多的三方 SDK 包，又比如图片选择上传，第三方的组件样式定制性很差，而且存在很多 bug，比如还有全局弹框。

- **路由**

React-native 的路由 react-navigation 和 react 单页应用的路由 react-router 有什么区别呢？

在 web 浏览器中，当用户点击某个链接时，该 url 就会被推倒浏览器的历史记录堆栈里面当用户店里返回按钮时，浏览器户从历史堆栈顶部删除正在访问的页面，因此当前页就成了以前访问过的页面，然而 React Native 没有像 Web 浏览器那样的内置全局历史堆栈。首先 SPA 网站路由，导航方式一般分为 history 路由和 hash 路由，对于基于 history 的路由，它通过 history.pushState 来修改 url（ 它只会将路由信息推入浏览器的历史导航栈里面，不会刷新页面，也不会向服务器发送请求），通过 popstate 事件来监听前进/后退事件.React-router 的实现主要是依赖了一个 window.history 加强版的 history 库，history 库导出了一个对象，其中，location 属性是对 window.location 的加强，listen 方法是注册一个监听（通过发布订阅模式实现的一个 transitionManager 注册监听，当发生路由跳转时，会将 location 传入到监听函数中）和提供 push，replace 等方法来修改历史记录栈的 State 并触发之前注册的监听事件。React-router 自己则包含 Router 路由容器组件，和 Route 路由栈组件，其中，Router 组件通过监听，来获得 location 对象不断变化的值，然后通过 react 16 新的 context Api 注入到 context.Provider 中，每个 Route 路由栈则通过 context.consumer 获得注入的 location 对象。

Route 中则通过当前配置的路由参数和 location 的参数是否匹配和其他一些规则，决定自己是否显示 React Native 中并没有 history 对象，但是可以在内存中模拟实现，而且实现方式和 history 是基本相同的 React Navigation 的 stack navigator 为应用提供了一种在屏幕之间切换并管理导航历史记录的方式。如果应用程序只使用一个 stack navigator ，则它在概念上类似于 Web 浏览器处理导航状态的方式 - 当用户与它进行交互时，应用程序会从导航堆栈中新增和删除页面，这会导致用户看到不同的页面。Web 浏览器和 React Navigation 工作原理的一个主要区别是：React Navigation 的 stack navigator 提供了在 Android 和 iOS 设备上，在堆栈中的路由之间导航时你期望的手势和动画。

### 常见问题及解决方案

- **样式问题**

  1.  阴影样式

      React Native 安卓不支持阴影样式属性，可以是用第三方库 react-native-shadow 来解决，依赖 react-native-shadow 实现

  2.  边框样式

      React Native 安卓不支持 dashed 或者 dotted 样式，IOS 支持也有部分问题，同样，可以使用 react-native-svg 进行绘制

  3.  渐变样式

      不支持渐变样式设置，需要使用第三方插件 react-native-linear-gradient

  4.  边框宽度

      在设置的边框或者高度小于 1 时，比如 0.5，会出现显示不出来的情况，不同平台和不同的屏幕像素密度会导致不同的结果，可搜索手机的设备像素比相关问题查看，一种 hack 的解决方式是设置 1 的高度，在设置 border-bottom 为 0.5。还可以是用 RN 的 StyleSheet.hairlineWidth 设置为平台最细的宽度

  5.  定位

      React Native 不支持 fixed 定位，所以在实现诸如头部固定，按钮固定在底部，和其他常见 fixed 定位需求时，需要采用变通的方式，例如底部按钮，可采用 flex 布局，或者绝对定位的方式实现，但是如果页面有键盘弹出时，安卓的底部的定位元素会被键盘顶起，此时，可以配置安卓目录下的 windowSoftInputMode="adjustNothing" 配置解决此问题

- **组件问题**

  1.  Modal 组件

      Android Modal 组件无法延伸到状态栏之后，导致 Modal 实现的弹框蒙层顶部会有一个白条，一种简单的解决办法是在 Modal 中，设置安卓的状态栏背景和 Modal 的背景颜色一致，然后设置状态栏文字颜色为白色，这种办法，会导致 Modal 弹出的时候，会有状态栏的闪动，体验不是很好，还有一种解决方式是封装安卓原生 Modal

  2.  TextInput 组件

      React Native 版本 <= 0.54 IOS Input 不能在 onChangText 事件对 value 属性进行正常赋值，所以只能通过升级版本来解决，但是 RN 版本的升级或造成很多依赖发生改变，出现不可控的情况，所以应尽量避免升级

  3.  Touchable

      React Native 安卓 Touchable 类组件溢出不显示 bug,可利用 View 组件溢出可正常显示，在里面使用 Touchable 组件的 hack 方式

  4.  Picker

      React Native 只有 DatePickerIOS ，Picker 组件使用起来也不便利，建议使用第三方组件 react-native-picker

  5.  SafeAreaView

      SafeAreaView 的目的是让你在一个安全的可是区域渲染内容，具体来说就是因为目前有 iPhone X 这样的带有“刘海”的全面屏设备，所以需要避免内容渲染到不可见的“刘海”范围内。本组件目前仅支持 iOS 设备以及 iOS 11 或更高版本。但是在 IphoneXS 上，并不能正常显示，所以需要判断机型来针对设置

  6.  Toast

      目前 React Native 只有 安卓有吐司提示，所以可以使用第三方库 react-native-root-toast 来替代安卓和 IOS，也可以使用 IOS 原生提供的 Toast 方法

- **其他问题**

  1.  setTimeout

      setTimeout 当应用进入后台以后 js 停止运行，会停止计时，但实际情况计时应该持续进行，一种解决方式可以只用时间戳，每次计算前后时间戳的差值，来达到目的

  2.  全局弹框

      原生+RN+H5 的混合开发模式下，在 RN 跳转到原生，在跳转到 RN，或者其他复杂的情况下，路由会有几个层，此时，RN Home 页面的弹框监听或者其他方式，都不能实现让弹框显示在最上层，所以在实现如单点登录，登录失效，需要在任何页面弹出弹框的需求时，可以调用原生的弹框，因为，原生的弹框在最上层，所以可以任何位置调起弹框

  3.  设备识别

      因为 iphoneXS 等机型的出现，第三方组件在识别机型时并不能识别出来，但是很多兼容处理需要针对 iphoneXS 来进行处理。因为 iphoneX XS XS Max 的屏幕分辨率各不一样，所以可以先判断是 IOS 设备，然后根据分辨率来判断机型。

  4.  键盘遮挡

      手机上弹出的键盘常常会挡住当前的视图。KeybordAvioodingView 组件可以自动根据键盘的位置，调整自身的 position 或底部的 padding，以避免被遮挡。

  5.  路由重复跳转

      在进行路由跳转时。如果点击过快，可能会出现路由栈中添加了两层路由，可以用路由的 navigate 方法替换 push 方法，因为 push 方法是直接向路由栈中添加路由，navigate 方法会根据路由栈是否有要跳转的路由来进行判断

  6.  地理定位

      React Native 的地理定位对于国内用户来说是不可用的状态，所以可以使用高德或者百度的第三方库 或者使用原生提供的方法
