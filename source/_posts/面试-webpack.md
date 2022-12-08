---
title: 面试-webpack
date: 2022-12-04 19:26:39
tags: [面试,webpack]
---

#### loader 和plugin的区别

loader即为文件加载器，操作的是文件，将文件A通过loader转换成文件B，是一个单纯的文件转化过程。
plugin即为插件，是一个扩展器，丰富webpack本身，增强功能 ，针对的是在loader结束之后，webpack打包的整个过程，他并不直接操作文件，而是基于事件机制工作，监听webpack打包过程中的某些节点，执行广泛的任务。

* Loader 特性:
- 链式传递，按照配置时相反的顺序链式执行;
- 基于 Node 环境，拥有 较高权限，比如文件的增删查改; 可同步也可异步;
* 编写原则:
- 单一原则: 每个 Loader 只做一件事;
- 链式调用: Webpack 会按顺序链式调用每个 Loader;
- 统一原则: 遵循 Webpack 制定的设计规则和结构，输入与输出均为字符串，各个 Loader 完全独立，即插即用;

* plugin
在编译的整个生命周期中，Webpack 会触发许多事件钩子， Plugin 可以监听这些事件，根据需求在相应的时间点对打包内容进行定向的修改。

* 事件流机制
Webpack 就像工厂中的一条产品流水线。原材料经过 Loader 与 Plugin 的一道道处理，最后输出结果。
- 通过链式调用，按顺序串起一个个 Loader;
- 通过事件流机制，让 Plugin 可以插入到整个生产过程中的每个步骤中;

Webpack 事件流编程范式的核心是基础类` Tapable` ，是一种 观察者模式 的实现事件的订阅与广播: 
Webpack 中两个最重要的类 `Compiler` 与 `Compilation` 便是继承于 Tapable，也拥有这样的事件流机制。
- Compiler: 可以简单的理解为 Webpack 实例，它包含了当前 Webpack 中的所有配置信息，如 options， loaders, plugins 等信息，全局唯一，只在启动时完成初始化创建，随着生命周期逐一传递; 
- Compilation: 可以称为 编译实例。当监听到文件发生改变时，Webpack 会创建一个新的 Compilation 对象，开始一次新的编译。它包含了当前的输入资源，输出资源，变化的文件等，同时通过它提供的 api，可 以监听每次编译过程中触发的事件钩子;

区别:
- Compiler 全局唯一，且从启动生存到结束;
- Compilation 对应每次编译，每轮编译循环均会重新创建; 

##### 常用 Plugin:
- UglifyJsPlugin: 压缩、混淆代码;
- Optimization.splitChunks: 代码分割;
- ProvidePlugin: 自动加载模块;
- html-webpack-plugin: 加载 html 文件，并引入 css / js 文件; 
- extract-text-webpack-plugin / mini-css-extract-plugin: 抽离样式，生成 css 文件; 
- DefinePlugin: 定义全局变量;
- optimize-css-assets-webpack-plugin: CSS 代码去重; 
- webpack-bundle-analyzer: 代码分析;
- compression-webpack-plugin: 使用 gzip 压缩 js 和 css; 
- happypack: 使用多进程，加速代码构建; 
- EnvironmentPlugin: 定义环境变量;





#### 优化技巧
缓存、加快打包速度、缩小打包体积

1. 缓存，比如bable-loader 添加cacheDirectory为true来开启缓存
```js
{
    test: /\.js$/,
    loader: 'babel-loader',
    options: {
      cacheDirectory: true
    }
  },
```
cacheLoader


2. 加快打包速度
多核打包，比如使用happyPack/Thread-loader/Parallel-Webpack
高效编译，对于JS的编译选用不同的编译器，比如ESBuild 基于Go语言开发的JavaScript Bundler 和SWC 基于Rust的JavaScript Compiler(其生态中也包含打包工具spack), 目前为Next.JS/Parcel/Deno等前端圈知名项目使用


3、缩小打包体积
- 使用Tree-shaking、减少打包代码
- 对于大的模块引入thread-loader
- 对于不常用的变更抽离出去 ，一种是使用webpack-dll-plugin,在首次构建时候将这些静态依赖打包，另外一种是使用Externals，将这些不常用的静态资源抽离，并用cdn方式引用他们
- compression-webpack-plugin 压缩js和css代码






#### 什么是Tree-Shark

摇树优化 (Tree-shaking)，这是一种形象比喻。我们把打包后的代码比喻成一棵树，这里其实表示的就 是，通过工具 "摇" 我们打包后的 js 代码，将没有使用到的无用代码 "摇" 下来 (删除)。即 消除那些被 引用了但未被使用 的模块代码。
原理: 由于是在编译时优化，因此最基本的前提就是语法的静态分析，ES6的模块机制 提供了这种可能性。不需要运行时，便可进行代码字面上的静态分析，确定相应的依赖关系。
问题: 具有副作用的函数无法被 tree-shaking。 在引用一些第三方库，需要去观察其引入的代码 量是不是符合预期; 尽量写纯函数，减少函数的副作用; 可使用 webpack-deep-scope-plugin， 可以进行作用域分析，减少此类情况的发生，但仍需要注意;


#### performance 对象api
属性
- memory
- navigation 
- timing
![](https://img-blog.csdnimg.cn/20200717141446763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTQ0ODE0MDU=,size_16,color_FFFFFF,t_70)

方法
- getEntries() 这个函数返回的将是一个数组，包含了页面中所有的 HTTP 请求
- now()  输出的是相对于 performance.timing.navigationStart(页面初始化) 的时间, Date.now() 输出的是 UNIX 时间，即距离 1970 的时间 
- mark()  performance.mark() 标记各种时间戳（就像在地图上打点），保存为各种测量值（测量地图上的点之间的距离），便可以批量地分析这些数据了。
