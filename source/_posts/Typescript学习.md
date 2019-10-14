---
title: Typescript学习
---

#### 一、TS的优势

* 类型声明就是很好的文档；
* 增加代码的可读性和维护性；

* 提供最新的JavaScipt特性，建立更健壮的组件；

#### 二、TS基础

##### TS基础类型

    * boolean、number、string、array、元组、枚举、any、void、null和undefined、never
    * 例：元组 let x: [string, number] = ["hello", 0]

##### 枚举

``` TS

    enum Colors { Red, Yellow, Blue }
    Colors['Red'] === 0 // true  从0开始递增
    Colors[0] === 'Red' // 相互映射

    // 枚举事实上会编译成如下
    var Color;
    (function (Color) {
        Color[Color["Red"] = 0] = "Red";
        Color[Color["Yellow"] = 1] = "Yellow";
        Color[Color["Blue"] = 2] = "Blue";
    })(Color || (Color = {}));
```

* 手动赋值

    枚举的值是可以二次赋值的，被重新赋值的后一项会接着上一项的key递增;

    如果两个枚举值重复了，不会报错，但是值会被覆盖;

    可以为小数或者负数，递增步数仍然为 1;

    配合断言，可以让枚举不是数字;

###### 接口及接口的高阶用法

    interface Dog {
        color: string;
        width: number;
    }

* 接口继承接口

``` ts
    interface Fa {
        surname: string
    }

    interface Son extends Fa {
        name: string
    }

    const obj: Son = {
        surname : 'z',
        name: 'zc'
    }
```

* 接口继承类

```ts
    class Fa {
        constructor() {}
        suck(){
        }
    }

    interface Son extends Fa {
        suck():void;
        name: string;
    }

```

##### 泛型

指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。

* 泛型约束

明确知道泛型有哪些属性和方法时候，可以通过extends进行泛型约束， 写在声明函数名的后面

```ts
    interface hasLengthProp {
        length : number;
    }
    function Test<T extends hasLengthProp>(a:T):void {
        console.log(a.length);
    }
```

* 泛型还可以约束泛型,相当于泛型的继承

##### 声明合并

就是说声明两个同样的接口、类或者函数，会进行合并操作。

```ts
    interface Alarm {
        price: number;
        alert(s: string): string;
    }
    interface Alarm {
        weight: number;
        alert(s: string, n: number): string;
    }
    // 相当于
    interface Alarm {
        price: number;
        weight: number;
        alert(s: string, n: number): string;
    }
```

##### 奇淫技巧

* typeof - 获取变量的类型
* keyof - 获取类型的键

组合 typeof 与 keyof - 捕获键的名称

```ts
    const colors = {
        red: 'red',
        blue: 'blue'
    }

    type Colors = keyof typeof colors

    let color: Colors // 'red' | 'blue'
    color = 'red' // ok
    color = 'blue' // ok
    color = 'anythingElse' // Error
```

* in - 遍历键名
    特殊类型
    嵌套接口类型

```ts

    interface Producer {
        name: string
        cost: number
        production: number
    }

    interface Province {
        name: string
        demand: number
        price: number
        producers: Producer[]
    }

    let data: Province = {
        name: 'Asia',
        demand: 30,
        price: 20,
        producers: [
            { name: 'Byzantium', cost: 10, production: 9 },
            { name: 'Attalia', cost: 12, production: 10 },
            { name: 'Sinope', cost: 10, production: 6 }
        ]
    }
    interface Play {
        name: string
        type: string
    }

    interface Plays {
        [key: string]: Play
    }

    let plays: Plays = {
        'hamlet': { name: 'Hamlet', type: 'tragedy' },
        'as-like': { name: 'As You Like It', type: 'comedy' },
        'othello': { name: 'Othello', type: 'tragedy' }
    }
```

#### 三、TS 高阶

##### 类型断言

TypeScript 允许你覆盖它的推断，并且能以你任何你想要的方式分析它，这种机制被称为「类型断言」。

例如：

```ts

    interface Foo {
        bar: number;
        bas: string;
    }

    const foo: Foo = {
        foo.bar = 123;
        foo.bas = 'hello';
    }
```

* 双重断言

    例如：以下的例子将会报错，尽管使用者已经使用了类型断言：

```ts
    function handler(event: Event) {
        const element = event as HTMLElement; // Error: 'Event' 和 'HTMLElement' 中的任何一个都不能赋值给另外一个
    }
```

* 如果你仍然想使用那个类型，你可以使用双重断言。首先断言成兼容所有类型的 any，编译器将不会报错：

```ts
    function handler(event: Event) {
        const element = (event as any) as HTMLElement; // ok
    }
```

* ps: TypeScript 是怎么确定单个断言是否足够
当 S 类型是 T 类型的子集，或者 T 类型是 S 类型的子集时，S 能被成功断言成 T。这是为了在进行类型断言时提供额外的安全性，完全毫无根据的断言是危险的，如果你想这么做，你可以使用 any。

##### 类型推断

    通常，你会得到一个类似于 Type string is not assignable to type 'foo' 的错误，如下：
```ts
  function iTakeFoo(foo: 'foo') {}
  const test = {
    someProp: 'foo'
  };

  iTakeFoo(test.someProp); // Error: Argument of type string is not assignable to parameter of type 'foo'

```

  这是由于 test 被推断为 { someProp: string }，我们可以采用一个简单的类型断言来告诉 TypeScript 你想推断的字面量：
```ts
  function iTakeFoo(foo: 'foo') {}

  const test = {
    someProp: 'foo' as 'foo'
  };

  iTakeFoo(test.someProp); // ok
```

或者使用类型注解的方式，来帮助 TypeScript 推断正确的类型：

```ts
  function iTakeFoo(foo: 'foo') {}

  type Test = {
    someProp: 'foo';
  };

  const test: Test = {
    // 推断 `someProp` 永远是 'foo'
    someProp: 'foo'
  };

  iTakeFoo(test.someProp); // ok
```

##### 类型保护

  类型保护允许你使用更小范围下的对象类型。

* typeof
* instanceof
* in操作符可以安全的检查一个对象上是否存在一个属性，它通常也被做为类型保护使用
* 字面量类型保护

```ts
  type Foo = {
    kind: 'foo'; // 字面量类型
    foo: number;
  };

  type Bar = {
    kind: 'bar'; // 字面量类型
    bar: number;
  };

  function doStuff(arg: Foo | Bar) {
    if (arg.kind === 'foo') {
      console.log(arg.foo); // ok
      console.log(arg.bar); // Error
    } else {
      // 一定是 Bar
      console.log(arg.foo); // Error
      console.log(arg.bar); // ok
    }
  }
```

* 使用定义的类型保护（用户自定义方法）

##### 类型别名和字面量类型

* 类型别名alias
* 字面量类型
  例如：在这里，我们创建了一个被称为 foo 变量，它仅接收一个字面量值为 Hello 的变量：

``` ts
  let foo: 'Hello';
  foo = 'Bar'; // Error: 'bar' 不能赋值给类型 'Hello'
```

  它们本身并不是很实用，但是可以在一个联合类型中组合创建一个强大的（实用的）抽象

``` ts
  type CardinalDirection = 'North' | 'East' | 'South' | 'West';

  function move(distance: number, direction: CardinalDirection) {
    // ...
  }

  move(1, 'North'); // ok
  move(1, 'Nurth'); // Error
```

##### 条件类型

```ts
  type isBool<T> = T extends boolean ? true : false

  // type t1 = false
  type t1 = isBool<number>

  // type t2 = true
  type t2 = isBool<false>
```

##### 延迟推断类型
  ```ts
  type ParamType<T> = T extends (param: infer P) => any ? P : T

  interface User {
    name: string
    age: number
  }

  type Func = (user: User) => void

  type Param = ParamType<Func> // Param = User
  type AA = ParamType<string> // string
  type ElementOf<T> = T extends Array<infer E> ? E : never

  type TTuple = [string, number]

  type ToUnion = ElementOf<TTuple> // string | number
```

#### 四、常用技巧

##### 使用const enum 维护常量列表

```ts
  const enum STATUS {
    TODO = 'TODO',
    DONE = 'DONE',
    DOING = 'DOING'
  }

  function todos(status: STATUS): Todo[] {
    // ...
  }

  todos(STATUS.TODO)
```

#####  Partial（可选） & Pick（选择）

```ts
  type Partial<T> = {
    [P in keyof T]?: T[P]
  }

  type Pick<T, K extends keyof T> = {
    [P in K]: T[P]
  }

  interface User {
    id: number
    age: number
    name: string
  }

  // type PartialUser = { id?: number; age?: number; name?: string }
  type PartialUser = Partial<User>

  // type PickUser = { id: number; age: number }
  type PickUser = Pick<User, 'id'|'age'>
```

##### Exclude（包含） & Omit（排除）

```ts
  type Exclude<T, U> = T extends U ? never : T

  // type A = 'a'
  type A = Exclude<'x' | 'a', 'x' | 'y' | 'z'>
  type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

  interface User {
    id: number
    age: number
    name: string
  }

  // type PickUser = { age: number; name: string }
  type OmitUser = Omit<User, 'id'>
```

##### 巧用never类型

```ts
  type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]

  type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]

  interface Part {
    id: number
    name: string
    subparts: Part[]
    updatePart(newName: string): void
  }

  type T40 = FunctionPropertyNames<Part>  // 'updatePart'
  type T41 = NonFunctionPropertyNames<Part>  // 'id' | 'name' | 'subparts'
```

##### 混合类（mixins）

  TypeScript (和 JavaScript) 类只能严格的单继承
  从可重用组件构建类的另一种方式是通过基类来构建它们，这种方式称为混合。
  这个主意是简单的，采用函数 B 接受一个类 A，并且返回一个带有新功能的类的方式来替代 A 类扩展 B 来获取 B 上的功能，前者中的 B 即是混合。
  
  传入一个构造函数；
  创建一个带有新功能，并且扩展构造函数的新类；
  返回这个新类;

```ts
  // 所有 mixins 都需要
  type Constructor<T = {}> = new (...args: any[]) => T

  // 添加属性的混合例子
  function TimesTamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
      timestamp = Date.now()
    }
  }

  // 添加属性和方法的混合例子
  function Activatable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
      isActivated = false
      activate() {
        this.isActivated = true
      }
      deactivate() {
        this.isActivated = false
      }
    }
  }

  // 简单的类
  class User {
    name = ''
  }

  // 添加 TimesTamped 的 User
  const TimestampedUser = TimesTamped(User)

  // 添加 TimesTamped 和 Activatable 的类
  const TimestampedActivatableUser = TimesTamped(Activatable(User))

  // 使用组合类
  const timestampedUserExample = new TimestampedUser()
  console.log(timestampedUserExample.timestamp)

  const timestampedActivatableUserExample = new TimestampedActivatableUser()
  console.log(timestampedActivatableUserExample.timestamp)
  console.log(timestampedActivatableUserExample.isActivated)

```

##### 类型兼容性
  类型兼容性用于确定一个类型是否能赋值给其他类型
  例如：任何类型都能被赋值给any，这就是指类型的兼容。

* 结构化
  TS对象是一种结构类型，这意味着只要结构匹配，名称也就无关紧要了。

```ts
  interface Point {
    x: number;
    y: number;
  }

  class Point2D {
    constructor(public x: number, public y: number) {}
  }

  let p: Point;

  // ok, 因为是结构化的类型
  p = new Point2D(1, 2);
```

##### 使用可辨识联合并保证每个case被处理

* 当类中含有字面量成员时，我们可以用该类的属性来辨析联合类型。
  例：考虑 Square 和 Rectangle 的联合类型 Shape。Square 和 Rectangle有共同成员 kind，因此 kind 存在于 Shape 中。

```ts
  interface Square {
    kind: 'square';
    size: number;
  }

  interface Rectangle {
    kind: 'rectangle';
    width: number;
    height: number;
  }

  type Shape = Square | Rectangle;
```

  如果你使用类型保护风格的检查（==、===、!=、!==）或者使用具有判断性的属性（在这里是 kind），TypeScript 将会认为你会使用的对象类型一定是拥有特殊字面量的，并且它会为你自动把类型范围变小：
```ts
  function area(s: Shape) {
    if (s.kind === 'square') {
      // 现在 TypeScript 知道 s 的类型是 Square
      // 所以你现在能安全使用它
      return s.size * s.size;
    } else {
      // 不是一个 square ？因此 TypeScript 将会推算出 s 一定是 Rectangle
      return s.width * s.height;
    }
  }
```
  
  通常，联合类型的成员有一些自己的行为（代码），即保证每个case都被处理
```ts
  interface Square {
    kind: 'square';
    size: number;
  }

  interface Rectangle {
    kind: 'rectangle';
    width: number;
    height: number;
  }

  // 有人仅仅是添加了 `Circle` 类型
  // 我们可能希望 TypeScript 能在任何被需要的地方抛出错误
  interface Circle {
    kind: 'circle';
    radius: number;
  }

  type Shape = Square | Rectangle | Circle;

  function area(s: Shape) {
    switch (s.kind) {
      case 'square':
        return s.size * s.size;
      case 'rectangle':
        return s.width * s.height;
      case 'circle':
        return Math.PI * s.radius ** 2;
      default:
        const _exhaustiveCheck: never = s;
        return _exhaustiveCheck;
    }
  }
```

##### 索引类型：获取索引类型和索引值类型

  可以用字符串访问 JavaScript 中的对象（TypeScript 中也一样），用来保存对其他对象的引用
  当你传入一个其他对象至索引时，这是因为JavaScript会在得到结果之前会先调用 .toString 方法。
  数组有点稍微不同，对于一个 number 类型的索引，JavaScript 引擎将会尝试去优化（这取决于它是否是一个真的数组、存储的项目结构是否匹配等）。

* 索引类型：对象、数组、symbols

* 索引值类型：string和number
* 设计模式：索引签名的嵌套
* 在 JavaScript 社区你将会见到很多滥用索引签名的 API。如 JavaScript 库中使用 CSS 的常见模式：

```ts
  interface NestedCSS {
    color?: string; // strictNullChecks=false 时索引签名可为 undefined
    [selector: string]: string | NestedCSS;
  }

  const example: NestedCSS = {
    color: 'red',
    '.subclass': {
      color: 'blue'
    }
  };
```

  尽量不要使用这种把字符串索引签名与有效变量混合使用。如果属性名称中有拼写错误，这个错误不会被捕获到：
  取而代之，我们把索引签名分离到自己的属性里，如命名为 nest（或者 children、subnodes 等）：
```ts
  interface NestedCSS {
    color?: string;
    nest?: {
      [selector: string]: NestedCSS;
    };
  }

  const example: NestedCSS = {
    color: 'red',
    nest: {
      '.subclass': {
        color: 'blue'
      }
    }
  }

  const failsSliently: NestedCSS {
    colour: 'red'  // TS Error: 未知属性 'colour'
  }
```

* 索引排除某些属性
有时，你需要把属性合并至索引签名（虽然我们并不建议这么做，你应该使用上文中提到的嵌套索引签名的形式），如下例子：

```ts
  type FieldState = {
    value: string;
  };

  type FromState = {
    isValid: boolean; // Error: 不符合索引签名
    [filedName: string]: FieldState;
  };
```

  TypeScript 会报错，因为添加的索引签名，并不兼容它原有的类型，使用交叉类型可以解决上述问题：
```ts
  type FieldState = {
    value: string;
  };

  type FormState = { isValid: boolean } & { [fieldName: string]: FieldState };
```

  请注意尽管你可以声明它至一个已存在的 TypeScript 类型上，但是你不能创建如下的对象：
```ts
  type FieldState = {
    value: string;
  };

  type FormState = { isValid: boolean } & { [fieldName: string]: FieldState };

  // 将它用于从某些地方获取的 JavaScript 对象
  declare const foo: FormState;

  const isValidBool = foo.isValid;
  const somethingFieldState = foo['something'];

  // 使用它来创建一个对象时，将不会工作
  const bar: FormState = {
    // 'isValid' 不能赋值给 'FieldState'
    isValid: false
  };
```

##### this的类型

  通过 ThisType 我们可以在对象字面量中键入 this，并提供通过上下文类型控制 this 类型的便捷方式。它只有在 --noImplicitThis 的选项下才有效。
  现在，在对象字面量方法中的 this 类型，将由以下决定：

* 如果这个方法显示指定了 this 参数，那么 this 具有该参数的类型。（下例子中 bar）
* 否则，如果方法由带 this 参数的签名进行上下文键入，那么 this 具有该参数的类型。（下例子中 foo）
* 否则，如果 --noImplicitThis 选项已经启用，并且对象字面量中包含由 ThisType<T> 键入的上下文类型，那么 this 的类型为 T。
* 否则，如果 --noImplicitThis 选项已经启用，并且对象字面量中不包含由 ThisType<T> 键入的上下文类型，那么 this 的类型为该上下文类型。
* 否则，如果 --noImplicitThis 选项已经启用，this 具有该对象字面量的类型。
* 否则，this 的类型为 any。

```ts
  // Compile with --noImplicitThis

  type Point = {
    x: number;
    y: number;
    moveBy(dx: number, dy: number): void;
  };

  let p: Point = {
    x: 10,
    y: 20,
    moveBy(dx, dy) {
      this.x += dx; // this has type Point
      this.y += dy; // this has type Point
    }
  };

  let foo = {
    x: 'hello',
    f(n: number) {
      this; // { x: string, f(n: number): void }
    }
  };

  let bar = {
    x: 'hello',
    f(this: { message: string }) {
      this; // { message: string }
    }
  };
```

* * *
#### 参考内容

1. [TypeScript 技巧拾遗](https://mp.weixin.qq.com/s?__biz=MzA4ODUzNTE2Nw==&mid=2451046381&idx=1&sn=eba11644f1ac8254cf148d7d7bca75c7&chksm=87cbe6fdb0bc6febb4eed20df2cd25c3d566d7a66b186751c212a0243cb31d65234aee331cc7&mpshare=1&scene=1&srcid=&sharer_sharetime=1569634214253&sharer_shareid=827ddc86f3743a5ae1362c6a1314c273%23rd)
2. [深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/)