---
title: 移动技术发展&flutter简介
date: 2022-11-03 16:18:02
tags: flutter
---

# 移动技术发展及 flutter 简介

## 移动技术发展

2008 年 7 月 IPhone 推出第一代手机 IPhone 3G，同年 9 月谷歌正式发布了 Android 1.0 系统，标志着我们正式步入移动端发展期，按照技术开发的历程移动端（目前特指 Android 和 iOS）的发展大致可以分为 4 个阶段：原生阶段->Hybird 阶段->RN 阶段->Flutter 阶段。

### 原生阶段

使用原生语言（Android 使用 Java 或 Kotlin，iOS 使用 Objective-C 或 Swift ）开发应用，称之为原生阶段。
在此阶段发现一样的功能需要在 Android 和 iOS 两端开发，开发和维护成本较高，同时无动态化更新能力，紧急问题的修复和添加新功能都需要到相应平台发版，尤其是 iOS 审核的周期非常长，在国内 Android 虽然有动态化方案，但如果上架 Google Play 很有可能审核不通过或者下架，iOS 也有动态化，但苹果官方基本审核不通过，所以原生的动态化更新受政策影响很大。

从开发者的角度出发，是否有一种方案可以开发一套代码在多个平台运行且可以动态化更新，无需在走平台的审核。基于这个需求 H5 兴起，也就是我们所说的 Hybird 阶段。

### Hybird 阶段

Hybird 实现的基本原理是通过原生的 WebView 容器加载 H5 网页进行渲染，通过 JavaScript Bridge 调用一部分系统能力，同步更新服务器上的 H5 网页也实现了动态更新，俗称混合应用。

![Hybird](http://img.laomengit.com/image-20200608113600654.png)

当时大量的公司使用此方案进行开发，最出名的就是 Facebook，早期的 Facebook 在 H5 上投入了大量的精力，一次开发、快速迭代这是使用 H5 技术巨大的优势。

然而一切看似美好，但很快发现，H5 方案存在致命的缺陷-用户体验极差。

Facebook 创始人兼 CEO 马克·扎克伯格在接受采访的时候承认：专注在 HTML 5 上面是他有史以来犯过的最大的错误。

然而福兮祸所伏，虽然在 Facebook 上大量使用 H5 而导致用户体验极差，但 Facebook 基于强大的 H5 技术积累开发出了伟大的 React 框架，此框架是 React Native 框架的基础。

### React Native 阶段

React Native 简称 RN，是 FaceBook 在 2015 年开源，基于 JavaScript，具备动态配置能力跨平台开发框架。React Native 框架原理如下：

![RN](http://img.laomengit.com/image-20200608115921953.png)

React Native 使用 React 开发，然后生成虚拟 DOM 树，虚拟 DOM 是一个 JavaScript 的树形结构，通过虚拟 DOM 树映射到不同平台的本地控件，最终显示的 UI 是原生控件，因此在性能体验上和原生非常相近。和 React Native 类似的框架还有阿里巴巴的 Weex 框架，Weex 是在 React Native 基础上重新设计了一套开发模式，原理上和 React Native 一样。

React Native 解决了继承了 H5 的优点，同时解决了性能体验上的问题，2015 年 React Native 一经发布，就在技术圈引起了巨大的反响，在当时看来 React Native 是一个非常完美的跨平台解决方案，很快大量开发者涌入。

当年使用 React Native 的开发者最担心的不是 React Native 性能如何？体验如何？而是担心苹果会不会封掉 React Native，可想而之 React Native 的火爆程度，当年著名的 JSPatch 事件起初，起初大家都在说苹果开始对 React Native 下手了，虽然后来证实和 React Native 无关，但多多少少都对 React Native 开发者造成了一定的影响。

随着时间的流逝，发现 React Native 和原生桥接的成本非常高，在复杂场景下会出现严重的性能问题，比如早期的 ListView 滑动卡顿问题。

React Native 要桥接到原生控件，但 Android 和 IOS 控件的差异导致 React Native 无法统一 API，有的属性 IOS 支持，Android 不支持，有的 Android 支持，IOS 不支持，这就导致经常需要开发 Android 和 IOS 两套插件，随着项目的复杂度提升，也导致维护成本大幅提升。

还有一个很大的问题就是 React Native 依赖于 Facebook 的维护，而每次 iOS 和 Android 系统版本更新，很大程度上会受到影响。

### 小程序

从技术上来说，小程序（指微信小程序，下同）并不是新的跨平台方案，它使用浏览器内核来渲染界面，小部分由原生组件渲染，原理图如下：

![小程序](http://img.laomengit.com/image-20200608140924092.png)

小程序的运行环境分成渲染层和逻辑层，通信会经由微信客户端（Native）做中转。

微信小程序目前来看是非常成功的，在我看来微信小程序成功主要原因并不是因为技术，而是生态，当然微信小程序体验也是非常好的。

对商家来说，微信小程序拥有月活 10 亿的微信用户，获客成本低，这是一个流量极佳的平台，因此很多商家开发了体验极好的小程序，甚至一些商家把主要平台迁移到了微信小程序。

对于用户来说，无需下载，用完就走，极大的提升了用户体验，微信提供基础服务平台，商家获客成本低，用户体验提升，三方形成完美的平衡，因此微信小程序的生态越来越完善。

除了小程序外，类似的方案还有百度的轻应用和快应用，但都不温不火。

### Flutter 阶段

千呼万唤始出来，主角-Flutter 终于登场了，Flutter 是谷歌的移动 UI 框架，可以快速在 iOS 和 Android 上构建高质量的原生用户界面。

![Flutter](http://img.laomengit.com/image-20200608143242580.png)

Flutter 吸收了前面的经验，它既没有使用 WebView，也没有使用原生控件进行绘制，而是自己实现了一套高性能渲染引擎来绘制 UI，这个引擎就是大名鼎鼎的 Skia，Skia 是一个 2D 绘图引擎库，Chrome 和 Android 都是采用 Skia 作为引擎。Flutter 完美的解决了跨平台代码复用和性能问题，大家都在感叹：似乎 UI 迎来了终极解决方案。

UI 平台一致性
由于 Flutter 使用自己的引擎进行 UI 渲染，而不是用原生控件渲染，导致控件显示效果和原生不是完全一样，虽然肉眼看起来基本一样，但还是有一些细微的差别，尤其当 Android 和 iOS 系统升级导致原生控件效果发生变化时，Flutter 开发的 App 并不会进行相应的变化，如果您的 App 需要原生控件保持完全一致，Flutter 可能并不适合您。

动态化更新
动态化功能在国内来说是一项非常重要的功能，Google 官方已经明确现阶段不会实现动态化功能。
此功能并不是技术上无法实现，更多的还是政策和法律上的约束。
因此如果您的 App 需要动态化功能，那么 Flutter 可能并不适合您。

### 总结

既然 Flutter 已经如此优秀了，那是不是以后使用 Flutter 就可以了呢？答案是否定的，未来很长一段时间应该是原生、Hybird、React Native、Flutter 共存时代。

原生开发是无法完全避开的，一些硬件（比如蓝牙、传感器等）功能、音视频和 ARVR 等相关功能必须使用原生开发，有人说我开发蓝牙功能没用写原生代码啊，直接引入即可，你没有写，那是因为有人为你封装好了第三方插件。
Hybird 虽然有一些缺陷，但依然有其使用的场景，比如京东、天猫 App 中的营销活动都是是 H5 实现的。
React Native 可以使用原生控件渲染，因此，如果您需要使用原生控件而又想跨平台，React Native 是不错的选择。

## Flutter 基本原理

### Flutter 高性能（AOT、JIT）

Flutter 高性能主要靠两点来保证，首先，Flutter APP 采用 Dart 语言开发。Dart 在 JIT（即时编译）模式下，速度与 JavaScript 基本持平。但是 Dart 支持 AOT，当以 AOT 模式运行时，JavaScript 便远远追不上了。速度的提升对高帧率下的视图数据计算很有帮助。其次，Flutter 使用自己的渲染引擎来绘制 UI，布局数据等由 Dart 语言直接控制，所以在布局过程中不需要像 RN 那样要在 JavaScript 和 Native 之间通信，这在一些滑动和拖动的场景下具有明显优势，因为在滑动和拖动过程往往都会引起布局发生变化，所以 JavaScript 需要和 Native 之间不停的同步布局信息，这和在浏览器中要 JavaScript 频繁操作 DOM 所带来的问题是相同的，都会带来比较可观的性能开销。

在了解 Flutter 为什么选择了 Dart 而不是 JavaScript 之前我们先来介绍两个概念：JIT 和 AOT。

目前，程序主要有两种运行方式：静态编译与动态解释。静态编译的程序在执行前全部被翻译为机器码，通常将这种类型称为 AOT （Ahead of time）即 “提前编译”；而解释执行的则是一句一句边翻译边运行，通常将这种类型称为 JIT（Just-in-time）即“即时编译”。AOT 程序的典型代表是用 C/C++开发的应用，它们必须在执行前编译成机器码，而 JIT 的代表则非常多，如 JavaScript、python 等，事实上，所有脚本语言都支持 JIT 模式。但需要注意的是 JIT 和 AOT 指的是程序运行方式，和编程语言并非强关联的，有些语言既可以以 JIT 方式运行也可以以 AOT 方式运行，如 Java、Python，它们可以在第一次执行时编译成中间字节码、然后在之后执行时可以直接执行字节码，也许有人会说，中间字节码并非机器码，在程序执行时仍然需要动态将字节码转为机器码，是的，这没有错，不过通常我们区分是否为 AOT 的标准就是看代码在执行之前是否需要编译，只要需要编译，无论其编译产物是字节码还是机器码，都属于 AOT。在此，读者不必纠结于概念，概念就是为了传达精神而发明的，只要读者能够理解其原理即可，得其神忘其形。

现在我们看看 Flutter 为什么选择 Dart 语言？笔者根据官方解释以及自己对 Flutter 的理解总结了以下几条（由于其它跨平台框架都将 JavaScript 作为其开发语言，所以主要将 Dart 和 JavaScript 做一个对比）：

1. 开发效率高

   Dart 运行时和编译器支持 Flutter 的两个关键特性的组合：

   基于 JIT 的快速开发周期：Flutter 在开发阶段采用，采用 JIT 模式，这样就避免了每次改动都要进行编译，极大的节省了开发时间；

   基于 AOT 的发布包: Flutter 在发布时可以通过 AOT 生成高效的 ARM 代码以保证应用性能。而 JavaScript 则不具有这个能力。

2. 高性能

   Flutter 旨在提供流畅、高保真的的 UI 体验。为了实现这一点，Flutter 中需要能够在每个动画帧中运行大量的代码。这意味着需要一种既能提供高性能的语言，而不会出现会丢帧的周期性暂停，而 Dart 支持 AOT，在这一点上可以做的比 JavaScript 更好。

### Flutter 渲染引擎

Flutter 与用于构建移动应用程序的其它大多数框架不同，因为 Flutter 既不使用 WebView，也不使用操作系统的原生控件。 相反，Flutter 使用自己的高性能渲染引擎来绘制 widget。这样不仅可以保证在 Android 和 iOS 上 UI 的一致性，而且也可以避免对原生控件依赖而带来的限制及高昂的维护成本。

Flutter 使用 Skia 作为其 2D 渲染引擎，Skia 是 Google 的一个 2D 图形处理函数库，包含字型、坐标转换，以及点阵图都有高效能且简洁的表现，Skia 是跨平台的，并提供了非常友好的 API，目前 Google Chrome 浏览器和 Android 均采用 Skia 作为其绘图引擎。

Flutter 渲染引擎在 iOS 上支持三种渲染方式，分别是纯软件（CPU），Metal 和 GL。其中纯软件的方式仅限于特定的构建，需要在编译时开启 TARGET_IPHONE_SIMULATOR 宏，应该是用于在模拟器上的测试，实机运行只会使用 Metal 和 GL。Flutter 会在运行时先判断是否能够使用 Metal，如果设备不支持，才会降级到 GL。iOS 10 以上的版本默认使用 Metal，GL 只用于兼容 iOS 9 的老旧设备。

Flutter 渲染引擎在 Android 上也支持三种渲染方式，分别是纯软件（CPU），GL 和 Vulkan。其中纯软件模式是运行时由 Settings 的 enable_software_rendering 开关控制，默认为 false，目前只看到是通过命令行开关来控制，猜测是用于特定的测试用途。

跟 iOS 不一样的是，Flutter 在 Android 上并不是动态判断系统和硬件环境，在运行时来选择 Vulkan 或者 GL，而是需要开发者自行编译一个开启 SHELL_ENABLE_VULKAN 宏的 Flutter Engine，可能 Skia 对 Vulkan 在 Android 上的支持还不够完善的缘故，这个宏是默认关闭的，所以 Flutter 在 Android 上目前还是以 GL 为主。

Flutter 的渲染流程：

1. 需要的 GL GPU（Metal GPU）上下文环境是如何完成初始化；
2. 目标输出 Surface 的设置过程；
3. 渲染流水线执行光栅化的调用过程。

总的说来 Flutter 的渲染流水线，整体架构上（包括线程架构）跟 Android 5.x 之后的 Android View Rendering 架构基本一致，跟目前其他主流的 UI Toolkit，如 iOS，Qt QML 也十分类似。但是在内部实现的一些概念和细节上更接近于浏览器，特别是 WebKit/Blink，这跟 Flutter 的几位初期成员都是来自 Chrome 团队，负责 WebKit/Blink 的排版和绘制相关的工作有关。

跟 Android 5.x View Rendering Pipeline 一样，Flutter 的渲染流水线也包括两个线程 —— UI 线程和 GPU 线程。

UI 线程主要负责的是根据 UI 界面的描述生成 UI 界面的绘制指令，而 GPU 线程负责光栅化和合成。

Flutter 以图层树（Layer Tree）的方式对生成的 UI 界面绘制指令进行组织，而从 Android 4.x 开始，Android View Rendering 使用的 View DisplayList 树的方式，虽然组织的方式有所差异，但是其中的主要内容都是 UI 界面的绘制指令。而图层树这种组织方式又非常类似 WebKit/Blink。

![渲染流程](http://api.fly63.com/vue_blog/public/Uploads/20190428/5cc52cdd043ee.jpg)

上图显示了 Flutter 更新 UI 界面的过程：

1. 运行动画，动画的结果会导致 Widget State 的改变；
2. State Changes 触发 Flutter 生成一棵新的 Widget 树；
3. Flutter 根据新/旧 Widget 树的差异更新 Render 树，重新排版更新界面布局；
4. Flutter 根据新的 Render 树更新 Composited Layer（合成图层）的 Display List；
5. 输出新的图层树；

### Widget

在 Flutter 里面 Widget 的定义是 UI 界面的不可变的抽象描述，它跟其他 UI Toolkit 的 Widget 或者 View 有较大差别，相比其他 UI Toolkit 里面的基础 UI 组件，Flutter Widget 的抽象层次更高，涵盖的范围更广，单纯从抽象层次来说，倒是更类似浏览器的 DOM/CSSOM，虽然两者实际上并不相同。给我的感觉就像是混合了各种不同的对 UI 界面进行描述的方式所创造出的一个新概念，采用浏览器渲染里面抽象层次划分的方式对其他 UI Toolkit 的基础 UI 组件进行层次划分得到的一个新的抽象层。

### RenderObject

Flutter 使用 RenderObject 作为 UI 界面的内部描述方式，基于 RenderObject 计算 UI 的布局和生成 UI 的绘制指令。Flutter 里面 RenderObject 和 Render 树的概念跟浏览器就基本差不多了，连命名都一样。从抽象层次和主要功能来说，RenderObject 跟其他 UI Toolkit 里面的 Widget 和 View 这些基础 UI 组件也比较接近。

### Composited Layer

Flutter 使用 Composited Layer 来对 RenderObject 的绘制进行组织，通常一个 Composited Layer 对应一棵 RenderObject 子树，Composited Layer 的 Display List 记录了这棵 RenderObject 子树的绘制指令，这跟浏览器里面的 RenderObject 和 Composited Layer 基本是一样的。

不同的 UI Toolkit 对图层的处理方式并不一样，Android 没有一个完整的图层概念，只是间接地允许应用指定为特定的 View 子树生成图层，并且这个图层的概念跟 Flutter 里面的图层相比，Flutter 具备更高的抽象层次，它是绘制指令的一种组织方式，并不一定就需要分配额外的缓存做间接光栅化，Flutter 内部采用一个重复绘制次数阈值来控制是否为图层分配额外的缓存，通过这种方式来平衡内存占用和重复光栅化的性能损失。iOS 有比较完整的图层概念，跟 Flutter 更接近，并允许应用自己控制。

### Flutter 光栅化和合成

Flutter 光栅化和合成的流水线设计对比浏览器就简单的多了，跟其他 UI Toolkit 基本一样，只需要在 GPU 线程完成全部的光栅化和合成，并且全部由 GPU 实现。Android HWUI 的光栅化和合成将来应该也会改用 Skia 的实现，所以长远来看，Android 和 Flutter，另外也包括 Chrome， 在光栅化和合成的实现上应该会是使用同样的代码。

## 总结：

1. 移动技术发展由原生阶段->Hybird 阶段->RN 或小程序的跨平台支持方案->Flutter 阶段；

2. Flutter 高性能的优势在于采用 Dart，其具有基于 JIT 的快速开发周期发布阶段和基于 AOT 的发布包来提高我们的开发效率和发布的应用的性能；
3. Flutter 的另一大优势在于使用一套高性能渲染引擎 Skia 通过 GL 进行 UI 渲染，来达到跨平台代码复用和兼容性问题，达到 UI 平台一致性。


