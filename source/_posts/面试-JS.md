---
title: 面试-JS
date: 2022-11-29 17:13:37
tags: [面试, JS]
---

#### 1. 说下 js 的内存泄漏，什么情况容易出现内存泄漏？怎么解决？垃圾回收机制是怎么样的？

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


浏览器中 ES6 的模块化支持、node 采用 commonJS 的模块化支持
分类

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

#### reduce 参数

arr.reduce(callback,[initialValue])

callback （执行数组中每个值的函数，包含四个参数）

1、previousValue （上一次调用回调返回的值，或者是提供的初始值（initialValue））
2、currentValue （数组中当前被处理的元素）
3、index （当前元素在数组中的索引）
4、array （调用 reduce 的数组）

initialValue （作为第一次调用 callback 的第一个参数。）

#### 深拷贝

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

#### new 关键字做了什么

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

#### 判断类型 typeOf、  instanceOf、Object.prototype.toString.call()
typeOf 不能区分Array和Object
instanceOf 不能区分基本类型



#### 手动实现一个 instanceOf

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

#### 观察者模式和发布订阅模式

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

#### 虚拟 DOM 和真实 DOM 的转换

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

#### 广度优先和深度优先

深度优先采用堆栈的形式，即先进后出
广度优先采用队列的形式，先进先出

```js
const data = [
    {   name: 'a2',
        children: [
            { name: 'b2', children: [{ name: 'e2' }] },
            { name: 'c2', children: [{ name: 'f2' }] },
            { name: 'd2', children: [{ name: 'g2' }] },
        ],
    }
]
// 深度
function getNames(data) {
    const result = []
    data.forEach(item=>{
        dfs(item)
    })
    const  dfs = data => {
        result.push(data.name);
        data.children && data.children.foreach(child=>dfs(child))
    }
    return result.join(',')
}

// 广度遍历
function getNames(data) {
    let result = []
    let queue = data
    while (queue.length>0) {
        [...queue].forEach(child=>{
            queue.shift()
            result.push(childName);
            child.children && (queue.push(...chuld.children))
        })
    }
    return result.join(',')
}
```


#### node 的eventloop
 node的 事件循环有times, I/o callbacks, idle prepare, poll,check,close callbacks
- times 执行setTimeOut 和setTimeInterval
-  check 直接执行setTimeImmediate

#### this 的指向问题
全局环境下this指向window，箭头函数的this永远指向创建当前词法环境时的this，作为构造函数时，函数中的this指向实例对象
执行上下文在被执行的时候才会创建，创建执行上下文时才会绑定this，所以this的指向永远是在执行时确定


#### ajax
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


#### flutter 的生命周期
分为两种情况，
一个是statelessWidget 其生命周期是constructor、build、deactive、dispose
另外一个是statefulWidget，其生命周期是constructor、initState、didChangeDependencies,build、didUpdate Widget、deactive、dispose

#### js 加载的async 和defer的区别
async script标签设置了这个值，则说明引入的js需要<strong>异步加载和执行</strong>
在有async的情况下脚本异步加载和执行，并且不会阻塞页面加载，但是也并不会保证其加载的顺序，如果多个async优先执行，则先加载好的js文件，所以使用此方式加载的js文件最好不要包含其他依赖

defer
果使用此属性，也将会使js异步加载执行，且会在文档被解析完成后执行，这样就不会阻塞页面加载，但是它将会按照原来的执行顺序执行，对于有依赖关系的也可使用'

如果只有async，那么脚本在下载完成后异步执行。
如果只有defer，那么脚本会在页面解析完毕之后执行。