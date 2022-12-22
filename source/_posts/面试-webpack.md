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

Plugin的组成部分
1）Plugin的本质是一个 node 模块，这个模块导出一个JavaScript 类
2）它的原型上需要定义一个apply 的方法
3）通过compiler获取webpack内部的钩子，获取webpack打包过程中的各个阶段
钩子分为同步和异步的钩子，异步钩子必须执行对应的回调
4）通过compilation操作webpack内部实例特定数据
5）功能完成后，执行webpack提供的cb回调


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


后来 window.performance.timing 被废弃，通过 PerformanceObserver 旧的 api，返回的是一个 UNIX 类型的绝对时间，和用户的系统时间相关，分析的时候需要再次计算。而新的 api，返回的是一个相对时间，可以直接用来分析


### 热更新
开发过程中，代码发生变动后，webpack会重新编译，编译后浏览器替换修改的模块，局部更新，无需刷新整个页面

主要是通过websocket实现，建立本地服务和浏览器的双向通信。当代码变化，重新编译后，通知浏览器请求更新的模块，替换原有的模块
1） 通过webpack-dev-server开启server服务，本地server启动之后，再去启动websocket服务，建立本地服务和浏览器的双向通信
2） webpack每次编译后，会生成一个Hash值，Hash代表每一次编译的标识。本次输出的Hash值会编译新生成的文件标识，被作为下次热更新的标识
3）webpack监听文件变化（主要是通过文件的生成时间判断是否有变化），当文件变化后，重新编译
4）编译结束后，通知浏览器请求变化的资源，同时将新生成的hash值传给浏览器，用于下次热更新使用
5）浏览器拿到更新后的模块后，用新模块替换掉旧的模块，从而实现了局部刷新


### 模块联邦
webpack5 模块联邦(Module Federation) 使 JavaScript应用，得以从另一个 JavaScript应用中动态的加载代码，实现共享依赖，用于前端的微服务化
比如项目A和项目B，公用项目C组件，以往这种情况，可以将C组件发布到npm上，然后A和B再具体引入。当C组件发生变化后，需要重新发布到npm上，A和B也需要重新下载安装
使用模块联邦后，可以在远程模块的Webpack配置中，将C组件模块暴露出去，项目A和项目B就可以远程进行依赖引用。当C组件发生变化后，A和B无需重新引用
模块联邦利用webpack5内置的ModuleFederationPlugin插件，实现了项目中间相互引用的按需热插拔


### 一个简单的AST示例
let a = 1，转化成AST的结果
```js
{
  "type": "Program",
  "start": 0,
  "end": 9,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 9,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 4,
          "end": 9,
          "id": {
            "type": "Identifier",
            "start": 4,
            "end": 5,
            "name": "a"
          },
          "init": {
            "type": "Literal",
            "start": 8,
            "end": 9,
            "value": 1,
            "raw": "1"
          }
        }
      ],
      "kind": "let"
    }
  ],
  "sourceType": "module"
}

```
