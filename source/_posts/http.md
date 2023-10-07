---
title: 面试-http
date: 2022-12-05 12:46:10
tags: [面试, http]
---

#### 网络模型
应用层、表示层、会话层、传输层、网络层、数据链路层、物理层

#### http的请求报文和返回报文
* 请求报文：
- accept-charset
- accept-encoding
- accept-language
- Host
- User-agent
- connection
- cookie
- If-Modified-Since

* 返回报文
- server
- content-type
- content-encoding
- content-language
- keep-alive
- ETag
- cache-control
- Expires
- last-Modified
- access-control-allow-origin：



#### tcp和udp 的区别
tcp：面向连接、传输可靠，可用于传输大量数据,速度慢，建立连接需要开销较多
udp: 面向非连接、传输不可靠、用于传输少量数据(数据包模式)、速度快 ,可能丢包


#### http和https的区别
多了一层SSL加密，
客户端先向服务器端索要公钥，然后用公钥加密信息，服务器收到密文后，用自己的私钥解密。服务器公钥放在数字证书中。

#### http2.0 和http1 的区别
- 多路复用：相同域名多个请求，共享同一个TCP连接，降低了延迟
- 请求优先级：给每个request设置优先级
- 服务端推送：可以主动向客户端发送消息。
- 头部压缩：减少包的大小跟数量

#### tcp 三次握手
客户端 发送SYN 包
服务端接受并发生SYN+ACK包
客户端接受ACK包并发送至服务端，建立连接

#### tcp 四次挥手
客户端发出FIN包，进入FIN-WAIT
服务端发出确认报文 ACK 进入 CLOSE-WAIT
服务端发送连接释放报文，进入LAST-ACK
客户端发出ACK，等待2*MSL（最长报文段寿命）进入closed状态



#### http code
1xx：信息，请求收到，继续处理 
2xx：成功，行为被成功地接受、理解和采纳 
3xx：重定向，为了完成请求，必须进一步执行的动作 
4xx：客户端错误，请求包含语法错误或者请求无法实现 
5xx：服务器错误，服务器不能实现一种明显无效的请求 

200 OK：客户端请求成功
201 用户新建或修改数据成功
202 一个请求已经进入后台
204 No Content：无内容。服务器成功处理，但未返回内容。一般用在只是客户端向服务器发送信息，而服务器不用向客户端返回什么信息的情况。不会刷新页面。
206 Partial Content：服务器已经完成了部分GET请求（客户端进行了范围请求）。响应报文中包含Content-Range指定范围的实体内容

301 Moved Permanently：永久重定向，表示请求的资源已经永久的搬到了其他位置。

302 Found：临时重定向，表示请求的资源临时搬到了其他位置

303 See Other：临时重定向，应使用GET定向获取请求资源。303功能与302一样，区别只是303明确客户端应该使用GET访问

307 Temporary Redirect：临时重定向，和302有着相同含义。POST不会变成GET

304 Not Modified：表示客户端发送附带条件的请求（GET方法请求报文中的IF…）时，条件不满足。返回304时，不包含任何响应主体。虽然304被划分在3XX，但和重定向一毛钱关系都没有


400 Bad Request：客户端请求有语法错误，服务器无法理解。
401 Unauthorized：请求未经授权，这个状态代码必须和WWW-Authenticate报头域一起使用。
403 Forbidden：服务器收到请求，但是拒绝提供服务
404 Not Found：请求资源不存在。比如，输入了错误的url
415 Unsupported media type：不支持的媒体类型

500 Internal Server Error：服务器发生不可预期的错误。
502 网关错误
503 Server Unavailable：服务器当前不能处理客户端的请求，一段时间后可能恢复正常
504 网关超时
505 HTTP版本未被支持


#### websocket的连接原理

轮询
客户端通过一定的时间间隔以频繁请求的方式向服务器发送请求，来保持客户端和服务器端的数据同步。问题很明显，当客户端以固定频率向服务器端发送请求时，服务器端的数据可能并没有更新，带来很多无谓请求，浪费带宽，效率低下。

从上文可以看出，传统 Web 模式在处理高并发及实时性需求的时候，会遇到难以逾越的瓶颈，我们需要一种高效节能的双向通信机制来保证数据的实时传输。在此背景下，基于 HTML5 规范的、有 Web TCP 之称的 WebSocket 应运而生。

WebSocket 是 HTML5 一种新的协议。它实现了浏览器与服务器全双工通信，能更好的节省服务器资源和带宽并达到实时通讯，它建立在 TCP 之上，同 HTTP 一样通过 TCP 来传输数据，但是它和 HTTP 最大不同是：

WebSocket 是一种双向通信协议，在建立连接后，WebSocket 服务器和 Browser/Client Agent 都能主动的向对方发送或接收数据，就像 Socket 一样；
WebSocket 需要类似 TCP 的客户端和服务器端通过握手连接，连接成功后才能相互通信。


#### 跨域
跨域是指一个域下的文档或脚本试图去请求另一个域下的资源

什么是同源策略？
同源策略/SOP（Same origin policy）是一种约定，由Netscape公司1995年引入浏览器，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到XSS、CSRF等攻击。所谓同源是指"协议+域名+端口"三者相同，即便两个不同的域名指向同一个ip地址，也非同源。
同源策略限制以下几种行为：
1. Cookie、LocalStorage 和 IndexDB 无法读取
2. DOM 和 Js对象无法获得
3. AJAX 请求不能发送

跨域解决方案
1、 通过jsonp跨域
2、 document.domain + iframe跨域
3、 location.hash + iframe
4、 window.name + iframe跨域
5、 postMessage跨域
6、 跨域资源共享（CORS）
7、 nginx代理跨域
8、 nodejs中间件代理跨域
9、 WebSocket协议跨域

#### 预检请求

预检请求是在进行跨域资源共享 CORS 时，由浏览器自动发起的一种 OPTIONS 请求。它的存在是为了保障安全，并允许服务器决定是否允许跨域请求。

跨域请求是指在浏览器中向不同域名、不同端口或不同协议的资源发送请求。出于安全原因，浏览器默认禁止跨域请求，只允许同源策略。而当网页需要进行跨域请求时，浏览器会自动发送一个预检请求，以确定是否服务器允许实际的跨域请求。

预检请求中包含了一些额外的头部信息，如 Origin 和 Access-Control-Request-Method 等，用于告知服务器实际请求的方法和来源。服务器收到预检请求后，可以根据这些头部信息，进行验证和授权判断。如果服务器认可该跨域请求，将返回一个包含 Access-Control-Allow-Origin 等头部信息的响应，浏览器才会继续发送实际的跨域请求。

使用预检请求机制可以有效地防范跨域请求带来的安全风险，保护用户数据和隐私。

### CSP
该安全策略的实现基于一个称作 Content-Security-Policy的 HTTP 首部。
可以移步MDN，有更加规范的解释。我在这里就是梳理一下吧。
CSP，即浏览器中的内容安全策略，它的核心思想大概就是服务器决定浏览器加载哪些资源，具体来说有几个功能
* 限制加载其他域下的资源文件，这样即使黑客插入了一个 JavaScript 文件，这个 JavaScript 文件也是无法被加载的；
* 禁止向第三方域提交数据，这样用户数据也不会外泄；
* 提供上报机制，能帮助我们及时发现 XSS 攻击。
* 禁止执行内联脚本和未授权的脚本；

### 性能优化
