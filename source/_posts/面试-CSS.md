---
title: 面试-CSS
date: 2022-11-29 17:10:51
tags: [面试,css]
---

#### 1.定位、布局:不同定位的区别，两栏布局、三栏布局，flex布局必会
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