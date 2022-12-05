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



