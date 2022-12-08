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
- accept-lanuage
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
- Etag
- cache-control
- Expires
- last-Modifed
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