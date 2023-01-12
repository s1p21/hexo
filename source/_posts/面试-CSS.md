---
title: 面试-CSS
date: 2022-11-29 17:10:51
tags: [面试,css]
---

#### 1.定位、布局
不同定位的区别，两栏布局、三栏布局，flex布局必会
 两栏布局:浮动布局、flex
 三栏布局:双飞翼布局 三栏都采用左浮动
 
 
```css

 #main{
  background-color:aqua;
  width:100%;
  float:left;
}
#left{
  width:200px;
  background-color:yellow;
  float:left;
  margin-left:-100%;
}
#right{
  width:300px;
  background-color:orange;
  float:left;
  margin-left:-300px;
}
#content{
  margin-left:200px;
  margin-right:300px;
}

 
 <!--中间栏写在最前面-->
<div id = "main">
  <div id="content"></div>
</div>
<div id = "left">
</div>

<div id = "right">
</div>
```

CSS三列布局
- float布局：左边左浮动，右边右浮动，中间margin：0 100px;
- Position布局: 左边left：0; 右边right：0; 中间left: 100px; right: 100px;
- table布局: 父元素 display: table; 左右 width: 100px; 三个元素display: table-cell;
- 弹性(flex)布局:父元素 display: flex; 左右 width: 100px;
- 网格（gird）布局：

#### 2. 对于一些常见css的书写:比如文本溢出显示省略号

```css

text-overflow:ellipsis

#多行
display:-webkit-box
-webkit-line-clamp:2;

```

#### 3. link和@import的区别
- link的功能比较多，可以定义RSS、Rel等作用，而@import只能用于加载css
- 解析到link时，同步加载引到的css，而@import引到的css等到页面加载完成后才被加载
- @import 需要ES5 以上
- link可以js动态导入，@import不行

#### 4. flex
- flex-direction
- justify-content
- align-items
- align-content (多轴线的对齐方式)
- flex-wrap

子 
- flex： 0 1 auto
- 表示flex-grow 为0 flex-shrink 为1 flex basis为auto
- align-self

#### 5.垂直居中和水平居中
- line-height
- absolute+ margin(负值)
- absolute + margin auto
- absolute + translate
- Flex + align-items
- Flex + margin auto
- Flex + align-self
- grid +align-items
- calc

#### 6. BFC
BFC（Block formatting context），即块级格式化上下文，它作为HTML页面上的一个独立渲染区域，只有区域内元素参与渲染，且不会影响其外部元素。简单来说，可以将 BFC 看做是一个“围城”，外面的元素进不来，里面的元素出不去
形成BFC的条件:

1、浮动元素，float 除 none 以外的值；
2、定位元素，position（absolute，fixed）；
3、display 为以下其中之一的值 inline-block，table-cell，table-caption；
4、overflow 除了 visible 以外的值（hidden，auto，scroll）；

BFC 一般用来解决以下几个问题
边距重叠问题
消除浮动问题
自适应布局问题