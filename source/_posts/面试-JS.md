---
title: 面试-JS
date: 2022-11-29 17:13:37
tags: [面试, JS]
---

#### 1.  js 垃圾回收机制

答:js 的内存泄漏可以通过三个:闭包、全局变量、对象属性循环使用、DOM 节点删除时未解绑事件、计时器引用未及时删除

垃圾回收机制:手动回收和自动回收、自动回收分为对调用栈的数据回收、对调用堆的数据回收、
调用栈的数据回收基于 ESP（记录当前执行状态的指针）来销毁保存在栈的执行上下文；
调用堆的数据回收:v8 把堆分为`新生代`和`老生代`,新生代存放的是生存时间短的对象，老生代存放生存时间长的对象
执行流程:

1.  标记活动对象和非活动对象
2.  回收非活动对象占据的内存
3.  内存整理。整理内存碎片

新生代的垃圾回收，将新生代空间内存分为两个区域，一半是对象区域，一半是空闲区域，当对象区域写满后，需要执行一次垃圾清理操作。在垃圾回收过程中，对使用对象进行标记。在垃圾清理阶段，把存活的对象复制到空闲区域，并有序排列这些对象。同时经过两次垃圾回收依然还存活的对象，将放置在老生区中

老生代的垃圾回收，使用标记清除。通过遍历调用栈，能够到达的元素称为活动对象，没有对象的可以判断为垃圾数据，进行标记。之后进行垃圾清除，这个是直接删除标记数据。清除之后，产生大量不连续的内存碎片，于是产生了标记-整理的过程。对所有的可以活动的对象向一端移动，清理边界以外的内存，从而占据连续的内存块。

#### 2. 模块化
AMD推崇依赖前置，在定义模块的时候就要声明其依赖的模块 CMD推崇就近依赖，只有在用到某个模块的时候再去require
CommonJS通过同步的方式加载模块，其输出的模块是一个拷贝对象，所以修改原的模块不会对被引入的模块内部产生影响，且模块在代码运行的时候加载
es6模块是在代码编译时输出接口即编译时加载，es6是通过命令来指定导出和加载，且导出的是模块中的只读引用，如果原始模块中的值被改变了，那么加载的值也会随之改变，所以是动态引用


##### CommonJS 与 ESM 的区别

实际开发中，经常会将 ESM 和 CommonJS 混用，因此有必要了解它们之间的区别。

###### 动态与静态

CommonJS中对模块依赖的解决是“动态的”，而ESM是静态的。所谓动态，是指模块依赖关系的建立发生在代码运行阶段；而静态是指模块依赖关系的建立发生在代码编译阶段。

CommonJS在运行时才会加载模块，确定模块依赖关系。因此可以在任意地方导入模块，甚至可以通过if语句来判断是否加载某个模块。

ESM的导入、导出语句都是声明式的，导入和导出语句必须位于模块的顶层作用域。它是一种静态的模块结构，在编译阶段就可以分析出模块的依赖关系。相比CommonJS，其具有以下优势：

死代码检测和排除。可以减小打包资源体积。

模块变量类型检查。

编译器优化。CommonJS中不论采用那种方式，本质上导入的都是一个对象。而ESM中，可以直接导入变量，减少了引用层级，程序效率更高。

###### 值拷贝和动态映射

导入一个模块时，CommonJS中获取的是一份值的拷贝，而在ESM中，获取的是值的动态映射，并且这个映射是只读的。


浏览器中 ES6 的模块化支持、node 采用 commonJS 的模块化支持

- es6 `import/export`
- commonjs `require/module.exports/exports`
- amd `require/defined`

`require` 与`import`的区别:

- `require`支持动态导入,`import`不支持

#### 3. 原型和原型链

原型关系：

- 每个 class 都有显示原型 prototype
- 每个实例都有隐式原型 _ proto_
- 实例的* proto*指向对应 class 的 prototype

原型: 在 JS 中，每当定义一个对象（函数也是对象）时，对象中都会包含一些预定义的属性。其中每个函数对象都有一个 prototype 属性，这个属性指向函数的原型对象。

原型链：函数的原型链对象 constructor 默认指向函数本身，原型对象除了有原型属性外，为了实现继承，还有一个原型链指针**proto**,该指针是指向上一层的原型对象，而上一层的原型对象的结构依然类似。因此可以利用**proto**一直指向 Object 的原型对象上，而 Object 原型对象用 Object.prototype.** proto** = null 表示原型链顶端。如此形成了 js 的原型链继承。同时所有的 js 对象都有 Object 的基本防范

特点: JavaScript 对象是通过引用来传递的，我们创建的每个新对象实体中并没有一份属于自己的原型副本。当我们修改原型时，与之相关的对象也会继承这一改变。



##### ES5与ES6继承的区别
ES5的继承是先创建子类的实例, 然后再创建父类的方法添加到this上.

ES6的继承是先创建父类的实例对象this(必须先调用super方法), 再调用子类的构造函数修改this.

通过关键字class定义类, extends关键字实现继承. 子类必须在constructor方法中调用super方法否则创建实例报错. 因为子类没有this对象, 而是使用父类的this, 然后对其进行加工

super关键字指代父类的this, 在子类的构造函数中, 必须先调用super, 然后才能使用this



#### 执行上下文和闭包

执行上下文就是当前 JavaScript 代码被解析和执行时所在环境的抽象概念， JavaScript 中运行任何的代码都是在执行上下文中运行。 执行上下文的生命周期包括三个阶段：创建阶段→执行阶段→回收阶段，我们重点介绍创建阶段。

闭包就是能够读取其他函数内部变量的函数。在 js 中只有函数内部的子函数才能读取局部变量。所以可以简单的理解为：定义在内部函数的函数。

用途主要有两个：

1）使用闭包可以访问函数中的变量。

2）让变量值始终保持在内存中。
#### 4.介绍节流防抖原理、区别以及应用

节流：事件触发后，规定时间内，事件处理函数不能再次被调用。也就是说在规定的时间内，函数只能被调用一次，且是最先被触发调用的那次。

防抖：多次触发事件，事件处理函数只能执行一次，并且是在触发操作结束时执行。也就是说，当一个事件被触发准备执行事件函数前，会等待一定的时间（这时间是码农自己去定义的，比如 1 秒），如果没有再次被触发，那么就执行，如果被触发了，那就本次作废，重新从新触发的时间开始计算，并再次等待 1 秒，直到能最终执行！

使用场景：
节流：滚动加载更多、搜索框搜的索联想功能、高频点击、表单重复提交……
防抖：搜索框搜索输入，并在输入完以后自动搜索、手机号，邮箱验证输入检测、窗口大小 resize 变化后，再重新渲染。

```js
// 节流
function throttle(fn, delay) {
  let lastTime = 0;
  return function () {
    var nowTime = Data.now();
    if (nowTime - lastTime > delay) {
      fn.call(this);
      lastTime = nowTime;
    }
  };
}

//  防抖
function debounce(fn, delay) {
  var timer = null;
  return function () {
    clearTimeOut(timer);
    timer = setTimeOut(function () {
      fn.apply(this);
    }, delay);
  };
}
```

#### 5. 函数式编程

- 纯函数(确定性函数): 是函数式编程的基础，可以使程序变得灵活，高度可拓展，可维护；

优势:

- 完全独立，与外部解耦；
- 高度可复用，在任意上下文，任意时间线上，都可执行并且保证结果稳定；
- 可测试性极强；

条件:

- 不修改参数；
- 不依赖、不修改任何函数外部的数据；
- 完全可控，参数一样，返回值一定一样: 例如函数不能包含 new Date()或者 Math.rando()等这种不可控因素；
- 引用透明；

#### 6. call、 apply 和 bind 的区别

全局环境下this指向window，箭头函数的this永远指向创建当前词法环境时的this，作为构造函数时，函数中的this指向实例对象
执行上下文在被执行的时候才会创建，创建执行上下文时才会绑定this，所以this的指向永远是在执行时确定

call( this,a,b,c ) 在第一个参数之后的，后续所有参数就是传入该函数的值。apply( this,[a,b,c] ) 只有两个参数，第一个是对象，第二个是数组，这个数组就是该函数的参数。

bind 除了返回是函数以外，它的参数和 call 一样。

共同之处：都可以用来代替另一个对象调用一个方法，将一个函数的对象上下文从初始的上下文改变为由 thisObj 指定的新对象

```js
// 实现bind
Function.prototype.mybind(context,...args) {
    let fun  = this
    function bound(...args2) {
        let self = this instanceof bound?this:context
        return fun.apply(self,args.contact(args2);

    }
    bound.prototype = Object.create(fun.prototype)
    return bound
}

// 实现call
Function.prototype.mycall(context,...args) {
    context.fun = this
    return context.fun(...args)
}
// 实现apply
Function.prototype.myapply = function(context, args) {
    context.fun = this;
    return context.fun(...args);
};
```

#### 7. reduce 参数

arr.reduce(callback,[initialValue])

callback （执行数组中每个值的函数，包含四个参数）

1、previousValue （上一次调用回调返回的值，或者是提供的初始值（initialValue））
2、currentValue （数组中当前被处理的元素）
3、index （当前元素在数组中的索引）
4、array （调用 reduce 的数组）

initialValue （作为第一次调用 callback 的第一个参数。）

手写reduce

```js
Array.prototype.myReduce = function(fn,initialValue) {
  let pre,index
  let arr = this.slice()
  if (initalValue === undefined) {
    pre = arr[0]
    index = 1
  } else {
    pre = initialValue
    index = 0
  }
  for (let i =index;i<arr.length;i++) {
    pre = fn.call(null,pre,arr[i],i,this)
  }
  return pre

}
```

#### 8. 深拷贝

```js
function deepClone=function() {
    const map = new Map()
    function isObject(data) {
        return typeOf data ==='object' && data !==null
    }
    function clone (target) {
        if (isObject(target)) {
            let cloneTarget = Array.isArray(target)?[]:{}
            if (map.get(target)) return map.get(target)
            map.set(target, cloneTarget)
            for (let key in target) {
                cloneTarget[key]=clone(target[key])
            }
            return cloneTarget
        } else {
            return target
        }
    }

    return clone(target)
}
```

#### 9. new 关键字做了什么

做了四件事，1，创建空对象，2，将空对象的`__proto__`指向构造函数的`prototype`3，构造函数的 this 作用域赋给新对象，4，返回原始值需要忽略，返回对象需要正常处理

```js
function _new(constructor, ...arg) {
  // 创建一个空对象
  var obj = {};
  // 空对象的`__proto__`指向构造函数的`prototype`, 为这个新对象添加属性
  obj.__proto__ = constructor.prototype;
  // 构造函数的作用域赋给新对象
  var res = constructor.apply(obj, arg);
  // 返回新对象.如果没有显式return语句，则返回this
  return Object.prototype.toString.call(res) === "[object Object]" ? res : obj;
}
```

#### 10. 判断类型 三种方式 
typeOf、  instanceOf、Object.prototype.toString.call()
typeOf 不能区分Array和Object
instanceOf 不能区分基本类型


#### 11. 手动实现一个 instanceOf

instanceOf 基于原型链

```ts
function isInstanceOf(child, fun) {
  if (typeof fun !== "function") {
    throw new TypeError("arg2 fun is not a function");
  }
  if (child === null) {
    return false;
  }
  if (child.__proto__ !== fun.prototype) {
    return isInstanceOf(child.__proto__, fun);
  }
  return true;
}
```

#### 12. 观察者模式和发布订阅模式

观察者模式是一对多的依赖关系，他表示多个观察者对象同时监听某一个主题对象，当这个主题对象发生变化时，会通知所有观察者，使他们能够自我更新
发布-订阅者模式引入了第三方组件，叫做信息中介，它将订阅者和发布者联系起来，当发布者发生变化时，由信息中介通知订阅者，并进行更新。

- 观察者模式

```js
// 被观察者
class Subject() {
    constructor() {
        this.subs=[]
    }
    add(observer) {
        this.subs.push(observer)
    }
    notiify(...args) {
        this.subs.forEach(ob=>ob.update(...args))
    }
}
// 观察者
class Observer() {
    update(...args) {
        ...
    }
}
```

- 发布-订阅模式

```js
class PubSub() {
    constructor() {
        this.handles=[]
    }

    subscribe(type,fn) {
        if (!this.handles[type]) {
            this.handles[type]=[]
        } else {
        this.handles.push(fn)
        }
    }

    publish(type,...args) {
        if (!this.handles[type]) return
        this.handles[type].forEach(fn=>fn(...args))
    }
}
```

#### 13. 虚拟 DOM 和真实 DOM 的转换

虚拟DOM缺点：在首次渲染时，多了一层虚拟DOM的计算，影响性能

```js
class VDom {
  constructor(tag, data, value, type) {
    this.tag = tag && tag.toLowerCase(); // 节点名
    this.data = data; // 属性
    this.value = value; // 文本数据
    this.type = type; // 节点类型
    this.children = [];
  }
  appendChild(vnode) {
    this.children.push(vnode);
  }

  // nodeName：node的名字，如果是element那名字是大写的,其他的名字前面写上#。

  // nodeType：node的类型，一般用数字表示，1表示element(也可以用Node.ELEMENT_NODE来表示)，3表示text(Node.TEXT_NODE)。
  // 如果是element，那么nodeName === tagName
  // 如果是text，那么nodeName = #text， tagName = undefined

  // nodeValue：当前节点的值，对于text, comment节点来说, nodeValue返回该节点的文本内容，对于 attribute 节点来说, 返回该属性的属性值，而对于document和element节点来说，返回null
}

function getVnode(node) {
  let nodeType = node.nodeType;
  let _vnode = null;
  if (nodeType === "element") {
    let tag = node.nodeName;
    let attrs = node.attributes;
    let _attrObj = {};
    for (let i = 0; i < attrs.length; i++) {
      _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
    }
    _vnode = new VDom(tag, _attrObj, undefined, nodeType);
    let children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      _vnode.appendChild(getVNode(children[i]));
    }
  } else if (nodeType === "text") {
    _vnode = new VDom(node, nodeName, undefined, node.nodeValue, nodeType);
  }
  return _vnode;
}
```

虚拟 DOM 转化成 DOM

```js
function parseVNode(vnode) {
  let type = vnode.type;
  let rdom = null;
  if (type === "element") {
    rdom = document.createElement(vnode.tag);
    let attrs = vnode.data;
    for (let key in attrs) {
      rdom.setArribute(key, attrs[key]);
    }
    let children = vnode.children;
    for (let i = 0; i < children.length; i++) {
      rdom.appendChild(parseNode(children[i]));
    }
  } else if (type === "text") {
    rdom = document.createTextNode(vnode.value);
  }
  return rdom;
}
```



#### 15. node 的eventloop
 node的 事件循环有times, pending callbacks(I/o callbacks, idle prepare), poll,check,close callbacks
- times 执行setTimeOut 和setTimeInterval
- check 直接执行setTimeImmediate



#### 16. ajax
readyState 0 表示 请求还未初始化，尚未调用 open() 方法。
1 表示 已建立服务器链接，open() 方法已经被调用。
2 表示 请求已接受，send() 方法已经被调用，并且头部和状态已经可获得。
3 表示 正在处理请求，下载中； responseText 属性已经包含部分数据。
4 表示 完成，下载操作已完成。

```js
function ajax(url, method) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(url, method, true)
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText)
          } else if (xhr.status === 404) {
            reject(new Error('404'))
          }
        } else {
          reject('请求数据失败')
        }
      }
      xhr.send(null)
    })
  }
```


#### 17. flutter 的生命周期
分为两种情况，
一个是statelessWidget 其生命周期是constructor、build、deactive、dispose
另外一个是statefulWidget，其生命周期是constructor、initState、didChangeDependencies,build、didUpdate Widget、deactive、dispose

#### 18. js 加载的async 和defer的区别
async script标签设置了这个值，则说明引入的js需要<strong>异步加载和执行</strong>
在有async的情况下脚本异步加载和执行，并且不会阻塞页面加载，但是也并不会保证其加载的顺序，如果多个async优先执行，则先加载好的js文件，所以使用此方式加载的js文件最好不要包含其他依赖

defer
果使用此属性，也将会使js异步加载执行，且会在文档被解析完成后执行，这样就不会阻塞页面加载，但是它将会按照原来的执行顺序执行，对于有依赖关系的也可使用'

如果只有async，那么脚本在下载完成后异步执行。
如果只有defer，那么脚本会在页面解析完毕之后执行。

#### 19. 虚拟列表
可见区域

* 列表高度是固定的，条数计算
```js
const height = 60
const bufferSize = 5
this.visibleCount = Math.ceil((window.clientHeight||window.screen.height) / height);

```

* 列表高度不固定
通过观察者方式，来观察元素是否进入视口。我们会对固定元素的第一个和最后一个分别打上标签，例如把第一个元素的id设置为top，把最后一个元素的id值设置为bottom。
此时调用异步的api：IntersectionObserver，他能获取到进入到视口的元素，判断当前进入视口的元素是最后个元素，则说明内容是往上滚的，如果进入视口的是第一个元素，则说明内容是往下滚的。
我们依次保存下当前第一个元素距离顶部的高度和距离底部的高度，赋值给滚动内容元素的paddingTop和paddingBottom，这样内容区域的高度就不会坍塌，依旧保持这传统滚动元素充满列表时的内容高度:


#### 20. node 的多个通信
通过socket 和HTTP进行通信
同一台电脑通信可以通过IPC进行通信
PM2 监听node的原理：
pm2包括 Satan进程、God Deamon守护进程、进程间的远程调用rpc、cluster等几个概念
1.Satan.js提供了程序的退出、杀死等方法，因此它是魔鬼；God.js 负责维护进程的正常运行，当有异常退出时能保证重启，所以它是上帝。作者这么命名，我只能说一句：oh my god。
God进程启动后一直运行，它相当于cluster中的Master进程，守护者worker进程的正常运行。

2.rpc（Remote Procedure Call Protocol）是指远程过程调用，也就是说两台服务器A，B，一个应用部署在A服务器上，想要调用B服务器上应用提供的函数/方法，由于不在一个内存空间，不能直接调用，需要通过网络来表达调用的语义和传达调用的数据。同一机器不同进程间的方法调用也属于rpc的作用范畴。

3.代码中采用了axon-rpc 和 axon 两个库，基本原理是提供服务的server绑定到一个域名和端口下，调用服务的client连接端口实现rpc连接。后续新版本采用了pm2-axon-rpc 和 pm2-axon两个库，绑定的方法也由端口变成.sock文件，因为采用port可能会和现有进程的端口产生冲突。

每次命令行的输入都会执行一次satan程序。如果God进程不在运行，首先需要启动God进程。然后根据指令，satan通过rpc调用God中对应的方法执行相应的逻辑。
God在初次执行时会配置cluster，同时监听cluster中的事件：
在God启动后， 会建立Satan和God的rpc链接，然后调用prepare方法。prepare方法会调用cluster.fork，完成集群的启动.

#### 21. 性能指标：
* FP（首次绘制）
* FCP（首次内容绘制 First contentful paint）
* LCP（最大内容绘制时间 Largest contentful paint）
* FPS（每秒传输帧数）
* CLS (累积布局偏移)
* TTI（页面可交互时间 Time to Interactive）
* HTTP 请求响应时间
* DNS 解析时间
* TCP 连接时间

#### 22. interface 和 type 、 泛型位置
interface 只能定义对象类型。type声明可以声明任何类型。

interface 能够声明合并，两个相同接口会合并。Type声明合并会报错
type可以类型推导


// 定义callback遍历方法 两种方式 应该采用哪一种？
`type Callback = <T>(item: T) => void`
// 第二种声明方式
`type Callback<T> = (item: T) => void;`

当泛型出现在内部时，比接口本身并不具备任何泛型定义。而接口代表的函数则会接受一个泛型定义。换句话说接口本身不需要泛型，而在实现使用接口代表的函数类型时需要声明该函数接受一个泛型参数。

当泛型出现在接口中时，比如Callback<T> 代表的是使用接口时需要传入泛型的类型.

#### 24 箭头函数
this的作用域
但是没有prototype属性没有构造器特性，所以也就没有所谓的constructor，就不能作为构造器使用。
箭头函数的作用域不能通过.call、.apply、.bind等语法来改变，这使得箭头函数的上下文将永久不变
箭头函数不能使用关键字arguments来访问，只能通过定义的命名参数来访问。

#### 25 JS 设计模式

- 单例模式
- 工厂模式
- 装饰器模式
- 观察者模式
- 发布-订阅者模式
- 策略模式
- 访问者模式（bable插件）

装饰器模式
在不改变对象自身的基础上，动态地给某个对象添加一些额外的职责
```js
function fuc() {
  console.log(2);
}
Function.prototype.before = function(beFn) {
  let self = this;
  return function() {
    beFn.apply(this, arguments); // 先执行插入到前面的方法，类似于二叉树的前序遍历
    return self.apply(this, arguments); // 后执行当前的方法
  };
};
Function.prototype.after = function(afFn) {
  let self = this;
  return function() {
    self.apply(this, arguments); // 先执行当前的方法
    return afFn.apply(this, arguments); // 后执行插入到后面的方法
  };
};

function fuc1() {
  console.log(1);
}
function fuc3() {
  console.log(3);
}
function fuc4() {
  console.log(4);
}

fuc = fuc.before(fuc1).before(fuc4).after(fuc3);
fuc();
```

访问者模式
在不改变该对象的前提下访问其结构中元素的新方法
```js
// 元素类
class Student {
  constructor(name, chinese, math, english) {
    this.name = name;
    this.chinese = chinese;
    this.math = math;
    this.english = english;
  }

  accept(visitor) {
    visitor.visit(this);
  }
}

// 访问者类
class ChineseTeacher {
  visit(student) {
    console.log(`语文 ${student.chinese}`);
  }
}

class MathTeacher {
  visit(student) {
    console.log(`数学 ${student.math}`);
  }
}

class EnglishTeacher {
  visit(student) {
    console.log(`英语 ${student.english}`);
  }
}

// 实例化元素类
const student = new Student("张三", 90, 80, 60);
// 实例化访问者类
const chineseTeacher = new ChineseTeacher();
const mathTeacher = new MathTeacher();
const englishTeacher = new EnglishTeacher();
// 接受访问
student.accept(chineseTeacher); // 语文90
student.accept(mathTeacher); // 数学80
student.accept(englishTeacher); // 英语60
```

### 26. async await 
作用：用同步方式，执行异步操作

总结

1）async函数是generator（迭代函数）的语法糖

2）async函数返回的是一个Promise对象，有无值看有无return值

3）await关键字只能放在async函数内部，await关键字的作用 就是获取Promise中返回的resolve或者reject的值

4）async、await要结合try/catch使用，防止意外的错误

```js
function generatorToAsync(generatorFn) {
  return function() {
    const gen = generatorFn.apply(this, arguments) // gen有可能传参

    // 返回一个Promise
    return new Promise((resolve, reject) => {

      function go(key, arg) {
        let res
        try {
          res = gen[key](arg) // 这里有可能会执行返回reject状态的Promise
        } catch (error) {
          return reject(error) // 报错的话会走catch，直接reject
        }

        // 解构获得value和done
        const { value, done } = res
        if (done) {
          // 如果done为true，说明走完了，进行resolve(value)
          return resolve(value)
        } else {
          // 如果done为false，说明没走完，还得继续走

          // value有可能是：常量，Promise，Promise有可能是成功或者失败
          return Promise.resolve(value).then(val => go('next', val), err => go('throw', err))
        }
      }

      go("next") // 第一次执行
    })
  }
}

const asyncFn = generatorToAsync(gen)

asyncFn().then(res => console.log(res))
```

#### 27.实现一个批量请求函数

```js
async function run(){
    for (let i=0;i<idArray.length;i++){
        let promise = request(idArray[i]);
        promise.then((res)=>{
            console.log(`id${res}的请求已经处理完毕,当前并发为${pool.length}`);
            pool.splice(pool.indexOf(promise),1);
        })
        pool.push(promise);
        //这里是重点，当满了就阻塞
        if (pool.length==max){
            await Promise.race(pool);
        }
    }
}
run();
```

### 28.Promise then 第二个参数和catch的区别是什么
主要区别就是，如果在then的第一个函数里抛出了异常，后面的catch能捕获到，而then的第二个函数捕获不到。
then的第二个参数和catch捕获错误信息的时候会就近原则，如果是promise内部报错，reject抛出错误后，then的第二个参数和catch方法都存在的情况下，只有then的第二个参数能捕获到，如果then的第二个参数不存在，则catch方法会捕获到。

### 29. promise finally 方法实现
调用当前 Promise 的 then 方法返回一个新的 Promise 对象（保证链式调用）
调用 Promise 中的 resolve 方法进行返回

```js

Promise.prototype.finally = function (callback) {
  return this.then(
    (data) => {
      return Promise.resolve(callback()).then(() => data);
    },
    (err) => {
      return Promise.resolve(callback()).then(() => {
        throw err;
      });
    }
  );
};
```

### 30. sleep函数的多种实现
JS没有语言内置的休眠（sleep or wait）函数，所谓的sleep只是实现一种延迟执行的效果
等待指定时间后再执行对应方法
- 循环阻止
- 定时器
- promise
- async await的promise实现

```js
function sleep1(fn, time) {
  let start = new Date().getTime();
  while (new Date().getTime() - start < time) {
    continue;
  }
  fn();
}

// 方式二： 定时器
function sleep2(fn, time) {
  setTimeout(fn, time);
}

// 方式三：promise
function sleep3(fn, time) {
  new Promise(resolve => {
    setTimeout(resolve, time);
  }).then(() => {
    fn();
  });
}

// 方式四：async await
async function sleep4(fn, time) {
  await new Promise(resolve => {
    setTimeout(resolve, time);
  });
  fn();
}
function fn() { console.log("fn")}

sleep1(fn, 2000);
sleep2(fn, 2000);
sleep3(fn, 2000);
sleep4(fn, 2000);
```

### 手写map
```js
Array.prototype.selfMap = function(fn, content) {
  // map中的第二个参数作为fn函数的this
  // Array.prototype.slice.call将类数组转化为数组，同Array.from, this为调用的数组（arr）
  let arr = Array.prototype.slice.call(this);
  let mappedArr = Array(); // 创建一个空数组
  for (let i = 0; i < arr.length; i++) {
    // 判断稀疏数组，跳过稀疏数组中的空值
    // 稀疏数组：数组中元素的个数小于数组的长度，比如Array(2) 长度为2的稀疏数组
    if (!arr.hasOwnProperty(i)) continue;
    mappedArr[i] = fn.call(content, arr[i]);
  }
  return mappedArr;
};
let arr = [1, 2, 3];
console.log(arr.selfMap(item => item * 2)); // [2, 4, 6]
```

### 前端错误捕获
错误信息分为以下几种：
- JS 代码运行错误、语法错误等
- 异步错误等
- 静态资源加载错误
- 接口请求报错

try/catch 只能捕获常规的运行错误，语法错误和异步错误无法捕获
window.onerror 可以捕获常规的错误、异步错误、但不能捕获资源错误
window.addEventListener 当静态资源加载失败时，会触发error事件
promise错误，无法被以上几种捕获，可通过unhandledrejection 事件来处理
```js
// unhandledrejection 可以捕获Promise中的错误 ✅
window.addEventListener("unhandledrejection", function(e) {
  console.log("捕获到异常", e);
  // preventDefault阻止传播，不会在控制台打印
  e.preventDefault();
});

```

vue 错误 window.onerror 和 error 事件不能捕获到常规的代码错误,vue 通过 Vue.config.errorHander 来捕获异常：
```js
Vue.config.errorHandler = (err, vm, info) => {
    console.log('进来啦~', err);
}
```

React 错误
从 react16 开始，官方提供了 ErrorBoundary 错误边界的功能，被该组件包裹的子组件，render 函数报错时会触发离当前组件最近父组件的ErrorBoundary，生产环境，一旦被 ErrorBoundary 捕获的错误，也不会触发全局的 window.onerror 和 error 事件
react项目中，可以在 componentDidCatch 中将捕获的错误上报

跨域问题：如果当前页面中，引入了其他域名的JS资源，如果资源出现错误，error 事件只会监测到一个 script error 的异常。是由于浏览器基于安全考虑，故意隐藏了其它域JS文件抛出的具体错误信息，这样可以有效避免敏感信息无意中被第三方(不受控制的)脚本捕获到，因此，浏览器只允许同域下的脚本捕获具体的错误信息

接口错误
1）拦截XMLHttpRequest请求示例：
```js
function xhrReplace() {
  if (!("XMLHttpRequest" in window)) {
    return;
  }
  const originalXhrProto = XMLHttpRequest.prototype;
  // 重写XMLHttpRequest 原型上的open方法
  replaceAop(originalXhrProto, "open", originalOpen => {
    return function(...args) {
      // 获取请求的信息
      this._xhr = {
        method: typeof args[0] === "string" ? args[0].toUpperCase() : args[0],
        url: args[1],
        startTime: new Date().getTime(),
        type: "xhr"
      };
      // 执行原始的open方法
      originalOpen.apply(this, args);
    };
  });
  // 重写XMLHttpRequest 原型上的send方法
  replaceAop(originalXhrProto, "send", originalSend => {
    return function(...args) {
      // 当请求结束时触发，无论请求成功还是失败都会触发
      this.addEventListener("loadend", () => {
        const { responseType, response, status } = this;
        const endTime = new Date().getTime();
        this._xhr.reqData = args[0];
        this._xhr.status = status;
        if (["", "json", "text"].indexOf(responseType) !== -1) {
          this._xhr.responseText =
            typeof response === "object" ? JSON.stringify(response) : response;
        }
        // 获取接口的请求时长
        this._xhr.elapsedTime = endTime - this._xhr.startTime;

        // 上报xhr接口数据
        reportData(this._xhr);
      });
      // 执行原始的send方法
      originalSend.apply(this, args);
    };
  });
}

/**
 * 重写指定的方法
 * @param { object } source 重写的对象
 * @param { string } name 重写的属性
 * @param { function } fn 拦截的函数
 */
function replaceAop(source, name, fn) {
  if (source === undefined) return;
  if (name in source) {
    var original = source[name];
    var wrapped = fn(original);
    if (typeof wrapped === "function") {
      source[name] = wrapped;
    }
  }
}
```
拦截fetch为例
```js
function fetchReplace() {
  if (!("fetch" in window)) {
    return;
  }
  // 重写fetch方法
  replaceAop(window, "fetch", originalFetch => {
    return function(url, config) {
      const sTime = new Date().getTime();
      const method = (config && config.method) || "GET";
      let handlerData = {
        type: "fetch",
        method,
        reqData: config && config.body,
        url
      };

      return originalFetch.apply(window, [url, config]).then(
        res => {
          // res.clone克隆，防止被标记已消费
          const tempRes = res.clone();
          const eTime = new Date().getTime();
          handlerData = {
            ...handlerData,
            elapsedTime: eTime - sTime,
            status: tempRes.status
          };
          tempRes.text().then(data => {
            handlerData.responseText = data;
            // 上报fetch接口数据
            reportData(handlerData);
          });

          // 返回原始的结果，外部继续使用then接收
          return res;
        },
        err => {
          const eTime = new Date().getTime();
          handlerData = {
            ...handlerData,
            elapsedTime: eTime - sTime,
            status: 0
          };
          // 上报fetch接口数据
          reportData(handlerData);
          throw err;
        }
      );
    };
  });
}
```


### 首屏加载时间计算
首屏加载时间和首页加载时间不一样，首屏指的是屏幕内的dom渲染完成的时间
比如首页很长需要好几屏展示，这种情况下屏幕以外的元素不考虑在内
计算首屏加载时间流程

1）利用MutationObserver监听document对象，每当dom变化时触发该事件

2）判断监听的dom是否在首屏内，如果在首屏内，将该dom放到指定的数组中，记录下当前dom变化的时间点

3）在MutationObserver的callback函数中，通过防抖函数，监听document.readyState状态的变化

4）当document.readyState === 'complete'，停止定时器和取消对document的监听

5）遍历存放dom的数组，找出最后变化节点的时间，用该时间点减去performance.timing.navigationStart 得出首屏的加载时间


### 图片打点上报的优势：
1）支持跨域，一般而言，上报域名都不是当前域名，上报的接口请求会构成跨域
2）体积小且不需要插入dom中
3）不需要等待服务器返回数据
图片打点缺点是：url受浏览器长度限制

### 浏览器事件循环机制
事件循环其实就是在事件驱动模式中来管理和执行事件的一套流程。包括两种，一种是事件驱动，另外一种是状态驱动或数据驱动。
在事件驱动中，当有事件触发后，被触发的事件会按顺序暂时存在一个队列中，待 JS 的同步任务执行完成后，会从这个队列中取出要处理的事件并进行处理

JS 按顺序执行执行栈中的方法，每次执行一个方法时，会为这个方法生成独有的执行环境（上下文 context)，待这个方法执行完成后，销毁当前的执行环境，并从栈中弹出此方法（即消费完成），然后继续下一个方法。在事件驱动的模式下，至少包含了一个执行循环来检测任务队列是否有新的任务。通过不断循环去取出异步回调来执行，这个过程就是事件循环，而每一次循环就是一个事件周期或称为一次 tick。

事件循环的过程中，执行栈在同步代码执行完成后，优先检查微任务队列是否有任务需要执行，如果没有，再去宏任务队列检查是否有任务执行，如此往复。微任务一般在当前循环就会优先执行，而宏任务会等到下一次循环，因此，微任务一般比宏任务先执行，并且微任务队列只有一个，宏任务队列可能有多个。另外我们常见的点击和键盘等事件也属于宏任务。
根据任务的种类不同，可以分为微任务（micro task）队列和宏任务（macro task）队列。
常见宏任务：setTimeout() setInterval()
常见微任务：promise.then() MutaionObserver nextTick

### 关于SVG 和 Canvas 的区别。

1、SVG 不能绘制图片，而 canvas 可以。SVG是通过 XML 绘制，而Canvas通过 js 绘制
2、Canvas绘制的方式，是通过 js 逐像素渲染的。也就是说，它绘制一个复杂的图形和一个简单的图形的性能是差不多的。
SVG 是通过 XML 的方式渲染。它的本质是DOM，而复杂的图形，就会降低其渲染性能。
3、Canvas 是依赖分辨率，是一种标量图。所以在放缩的时候，存在失真的问题。
SVG 绘制的时候，不依赖分辨率，是一种矢量图。所以当SVG放缩的时候，不会使得图像失真。
4、SVG 适合带有大型渲染区域的应用程序：比如谷歌地图、百度地图。
