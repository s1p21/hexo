---
title: flutter跨组件通信
date: 2022-11-03 16:18:53
tags: flutter
---

# flutter 跨组件通信

响应式的编程框架中都会有一个永恒的主题——“状态(State)管理”，无论是在 React/Vue（两者都是支持响应式编程的 Web 开发框架）还是 Flutter 中，他们讨论的问题和解决的思想都是一致的。在 flutter 中，状态管理的一般原则是：

如果状态是组件私有的，则应该由组件自己管理；如果状态要跨组件共享，则该状态应该由各个组件共同的父元素来管理。对于组件私有的状态管理很好理解，但对于跨组件共享的状态，管理的方式就比较多了，如使用全局事件总线 EventBus，它是一个发布/订阅者模式的实现，通过它就可以实现跨组件状态同步：状态持有方（发布者）负责更新、发布状态，状态使用方（观察者）监听状态改变事件来执行一些操作。但是观察者模式来实现跨组件状态共享有一些明显的缺点：

1. 必须显示定义各种事件，不好管理
2. 订阅者必须需显示注册状态改变回调，也必须在组件销毁时手动去解绑回调以避免内存泄漏

那么，在 flutter 中有没有更好的跨组件状态管理方式了呢？答案是肯定的，就是`InheritedWidget`,它本身就是能绑定`InheritedWidget`与依赖它的子孙之间的依赖关系，并且当`InheritedWidget`数据发生变化时，可以自动更新依赖的子孙组件，这样，来实现跨组件状态管理我们只需要将跨组件共享的状态保存在`InheritedWidget`中，然后子组件引用`InheritedWidget`即可。

## InheritedWidget

### InheritedWidget 组件简介

`InheritedWidget` 是 flutter 中非常重要的功能型组件，类比于 React 中的`context`功能，提供了一种数据在组件中从上到下传递、共享的方式。

### InheritedWidget 源码解读

#### InheritedWidget 定义

首先看下关于 InheritedWidget 的声明定义

```
abstract class InheritedWidget extends ProxyWidget {
  const InheritedWidget({ Key key, Widget child })
    : super(key: key, child: child);

  @override
  InheritedElement createElement() => new InheritedElement(this);

  @protected
  bool updateShouldNotify(covariant InheritedWidget oldWidget);
}
```

它表示一个继承自`ProxyWidget` 的抽象类。内部没什么逻辑，除了实现了一个 `createElement` 方法之外，还定义了一个 `updateShouldNotify()` 接口。 每次当 `InheritedElement` 的实例更新时会执行该方法并传入更新之前对应的 `Widget` 对象，如果该方法返回 true 那么依赖该 Widget 的(在 build 阶段通过 `inheritFromWidgetOfExactType` 方法查找过该 Widget 的子 widget)实例会被通知进行更新；如果返回 false 则不会通知依赖项更新。这个机制和 React 框架中的 shouldComponentUpdate 机制很像.

#### InheritedWidget 相关信息的传递机制

每个 Element 实例上都有一个 `_inheritedWidgets` 属性。该属性的类型为：

```
HashMap<Type, InheritedElement>
```

其中保存了祖先节点中出现的 `InheritedWidget` 与其对应`element`的映射关系。在`element`的`mount`阶段和`active`阶段，会执行`_updateInheritance()`方法更新这个映射关系。

对于普通`Element`实例，`_updateInheritance()`只是单纯把父`element`的`_inheritedWidgets`属性保存在自身`_inheritedWidgets`里。从而实现映射关系的层层向下传递。

```
  void _updateInheritance() {
    assert(_active);
    _inheritedWidgets = _parent?._inheritedWidgets;
  }
```

由`InheritedWidget`创建的`InheritedElement`重写了该方法：

```
  void _updateInheritance() {
    assert(_active);
    final Map<Type, InheritedElement> incomingWidgets = _parent?._inheritedWidgets;
    if (incomingWidgets != null)
      _inheritedWidgets = new HashMap<Type, InheritedElement>.from(incomingWidgets);
    else
      _inheritedWidgets = new HashMap<Type, InheritedElement>();
    _inheritedWidgets[widget.runtimeType] = this;
  }
```

可以看出`InheritedElement`实例会把自身的信息添加到`_inheritedWidgets`属性中，这样其子孙`element`就可以通过前面提到的`_inheritedWidgets`的传递机制获取到此`InheritedElement`的引用。

#### InheritedWidget 的更新通知机制

首先让我们回答一个小问题，前文提到`_inheritedWidgets`属性存在于`Element`实例上，而我们代码中调用的`inheritFromWidgetOfExactType`方法则存在于`BuildContext`实例之上。那么`BuildContext`是如何获取`Element`实例上的信息的呢？答案是不需要获取。因为每一个`Element`实例也都是一个`BuildContext`实例。这一点可以从`Element`的定义中得到：

```
abstract  class  Element  extends  DiagnosticableTree  implements  BuildContext {

}
```

而每次`Element`实例执行`Widget`实例的`build`方法时传入的`context`就是该`Element`实例自身，以`StatelessElement`为例：

```
class StatelessElement extends ComponentElement {
  ...

  @override
  Widget build() => widget.build(this);

  ...
}
```

既然可以拿到`InheritedWidget`的信息了，那接下让我们通过源码看看更新通知机制的具体实现。

首先看一下`inheritFromWidgetOfExactType`的实现：

```
  InheritedWidget inheritFromWidgetOfExactType(Type targetType) {
    assert(_debugCheckStateIsActiveForAncestorLookup());
    final InheritedElement ancestor = _inheritedWidgets == null ? null : _inheritedWidgets[targetType];
    if (ancestor != null) {
      assert(ancestor is InheritedElement);
      _dependencies ??= new HashSet<InheritedElement>();
      _dependencies.add(ancestor);
      ancestor._dependents.add(this);
      return ancestor.widget;
    }
    _hadUnsatisfiedDependencies = true;
    return null;
  }
```

首先在`_inheritedWidget`映射中查找是否有特定类型`InheritedWidget`的实例。如果有则将该实例添加到自身的依赖列表中，同时将自身添加到对应的依赖项列表中。这样该`InheritedWidget`在更新后就可以通过其`_dependents`属性知道需要通知哪些依赖了它的`widget`。

每当`InheritedElement`实例更新时，会执行实例上的``notifyClients`方法通知依赖了它的子`element`同步更新。`notifyClients`实现如下：

```
  void notifyClients(InheritedWidget oldWidget) {
    if (!widget.updateShouldNotify(oldWidget))
      return;
    assert(_debugCheckOwnerBuildTargetExists('notifyClients'));
    for (Element dependent in _dependents) {
      assert(() {
        // check that it really is our descendant
        Element ancestor = dependent._parent;
        while (ancestor != this && ancestor != null)
          ancestor = ancestor._parent;
        return ancestor == this;
      }());
      // check that it really depends on us
      assert(dependent._dependencies.contains(this));
      dependent.didChangeDependencies();
    }
  }
```

首先执行相应`InheritedWidget`上的`updateShouldNotify`方法判断是否需要通知，如果该方法返回`true`则遍历`_dependents`列表中的`element`并执行他们的`didChangeDependencies()`方法。这样`InheritedWidget`中的更新就通知到依赖它的子`widget`中了。

#### didChangeDependencies

刚在之前说明了 InheritedWidget 通过调用`Element`的`didChangeDependencies()`来更新 widget，这个是指`state`的对象有一个`didChangeDependencies`的回调，在"依赖"变化时被`Flutter Framework`调用。而这个“依赖”指的就是子`widget`是否使用了父`widget`中`InheritedWidget`的数据！如果使用了，则代表子 widget 依赖有依赖`InheritedWidget`；如果没有使用则代表没有依赖。这种机制可以使子组件在所依赖的`InheritedWidget`变化时来更新自身！比如当主题、locale(语言)等发生变化时，依赖其的子 widget 的`didChangeDependencies`方法将会被调用。

#### Provider

在上文中提到`InheritedWidget`结合`Element`中的 didChangeDependencies 的回调来实现组件间的通信，实际上，在使用的过程中我们往往只需要更新子树中依赖了`ShareDataWidget`的组件，而现在只要调用`setState()`方法，所有子节点都会被重新 build，这很没必要，那么有什么办法可以避免呢？答案是缓存！一个简单的做法就是通过封装一个`StatefulWidget`，将子`Widget`树缓存起来，此时`Provider`应运而生，在此节中将通过实现`Provider widget`来演示如何缓存，以及如何利用`InheritedWidget`来实现 Flutter 全局状态共享。

首先，我们需要一个保存需要共享的数据`InheritedWidget`，由于具体业务数据类型不可预期，为了通用性，我们使用泛型，定义一个通用的`InheritedProvider`类，它继承自`InheritedWidget`：

```
// 一个通用的InheritedWidget，保存任需要跨组件共享的状态
class InheritedProvider<T> extends InheritedWidget {
  InheritedProvider({@required this.data, Widget child}) : super(child: child);

  //共享状态使用泛型
  final T data;

  @override
  bool updateShouldNotify(InheritedProvider<T> old) {
    //在此简单返回true，则每次更新都会调用依赖其的子孙节点的`didChangeDependencies`。
    return true;
  }
}
```

数据保存的地方有了，那么接下来我们需要做的就是在数据发生变化的时候来重新构建`InheritedProvider`，那么现在就面临两个问题：

1. 数据发生变化怎么通知？
2. 谁来重新构建`InheritedProvider`？
   第一个问题其实很好解决，我们当然可以使用之前介绍的`eventBus`来进行事件通知，但是为了更贴近 Flutter 开发，我们使用 Flutter SDK 中提供的`ChangeNotifier`类 ，它继承自`Listenable`，也实现了一个 Flutter 风格的发布者-订阅者模式，`ChangeNotifier`定义大致如下：

```
class ChangeNotifier implements Listenable {
  List listeners=[];
  @override
  void addListener(VoidCallback listener) {
     //添加监听器
     listeners.add(listener);
  }
  @override
  void removeListener(VoidCallback listener) {
    //移除监听器
    listeners.remove(listener);
  }

  void notifyListeners() {
    //通知所有监听器，触发监听器回调
    listeners.forEach((item)=>item());
  }

  ... //省略无关代码
}
```

我们可以通过调用`addListener()`和`removeListener()`来添加、移除监听器（订阅者）；通过调用`notifyListeners()` 可以触发所有监听器回调。

现在，我们将要共享的状态放到一个 Model 类中，然后让它继承自`ChangeNotifier`，这样当共享的状态改变时，我们只需要调用`notifyListeners()` 来通知订阅者，然后由订阅者来重新构建`InheritedProvider`，这也是第二个问题的答案！接下来我们便实现这个订阅者类

```
class ChangeNotifierProvider<T extends ChangeNotifier> extends StatefulWidget {
  ChangeNotifierProvider({
    Key key,
    this.data,
    this.child,
  });

  final Widget child;
  final T data;

  //定义一个便捷方法，方便子树中的widget获取共享数据
  static T of<T>(BuildContext context) {
    final type = _typeOf<InheritedProvider<T>>();
    final provider =  context.dependOnInheritedWidgetOfExactType<InheritedProvider<T>>();
    return provider.data;
  }

  @override
  _ChangeNotifierProviderState<T> createState() => _ChangeNotifierProviderState<T>();
}
```

该类继承`StatefulWidget`，然后定义了一个`of()`静态方法供子类方便获取`Widget`树中的`InheritedProvider`中保存的共享状态(model)，下面我们实现该类对应的`_ChangeNotifierProviderState`类：

```
class _ChangeNotifierProviderState<T extends ChangeNotifier> extends State<ChangeNotifierProvider<T>> {
  void update() {
    //如果数据发生变化（model类调用了notifyListeners），重新构建InheritedProvider
    setState(() => {});
  }

  @override
  void didUpdateWidget(ChangeNotifierProvider<T> oldWidget) {
    //当Provider更新时，如果新旧数据不"=="，则解绑旧数据监听，同时添加新数据监听
    if (widget.data != oldWidget.data) {
      oldWidget.data.removeListener(update);
      widget.data.addListener(update);
    }
    super.didUpdateWidget(oldWidget);
  }

  @override
  void initState() {
    // 给model添加监听器
    widget.data.addListener(update);
    super.initState();
  }

  @override
  void dispose() {
    // 移除model的监听器
    widget.data.removeListener(update);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return InheritedProvider<T>(
      data: widget.data,
      child: widget.child,
    );
  }
}
```

可以看到`_ChangeNotifierProviderState`类的主要作用就是监听到共享状态（model）改变时重新构建`Widget`树。注意，在`_ChangeNotifierProviderState`类中调用`setState()`方法，`widget.child`始终是同一个，所以执行 build 时，`InheritedProvider`的 child 引用的始终是同一个子`widget`，所以`widget.child`并不会重新 build，这也就相当于对 child 进行了缓存！当然如果`ChangeNotifierProvider`父级`Widget`重新 build 时，则其传入的 child 便有可能会发生变化。

### Scoped Model 状态管理

`Scoped Model` 和 `provider`类似，原理都是基于`InheritedProvider`，官方对于 Scoped_Model 的介绍是：

```
A set of utilities that allow you to easily pass a data Model from a parent Widget down to it's descendants. In addition, it also rebuilds all of the children that use the model when the model is updated. This library was originally extracted from the Fuchsia codebase.
一组实用程序，允许您轻松地将数据模型从父窗口小部件传递给它的后代。此外，它还重建了模型更新时使用模型的所有子代。这个库最初是从 Fuchsia 基代码中提取的。
```
