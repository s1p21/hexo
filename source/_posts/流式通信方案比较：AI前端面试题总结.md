---
title: 流式通信方案比较：AI 前端面试题总结
date: 2026-09-09 17:30:00
tags: [面试, AI, 前端, 流式通信]
categories: [面试题]
---

# 流式通信方案比较：AI 前端面试题总结

## 1. SSE 与 WebSocket

**核心观点：** SSE 是基于 HTTP 的服务端单向推送，WebSocket 是独立的双向通信协议。AI 输出通常是服务端持续返回，因此 SSE 更简单合适。

1. SSE 基于 HTTP；WebSocket 建立独立长连接。
2. SSE 主要服务端推送；WebSocket 支持双向通信。
3. 原生 `EventSource` 支持自动重连；如果使用 Fetch 自行实现 SSE，则仍需自己处理重连。WebSocket 通常需要管理心跳、重连和状态同步。
4. AI 输出、实时通知适合 SSE；协同编辑、实时控制适合 WebSocket。
5. SSE 事件本身是 UTF-8 文本；二进制需要转 Base64 或改用 Fetch/WebSocket，并注意额外体积开销。
6. HTTP/1.1 下浏览器对同域 SSE 连接数有限制；HTTP/2 可提高并发能力，但仍需结合浏览器、代理和服务端配置验证。

**面试总结：** 单向推送优先 SSE，需要高频双向交互时才选择 WebSocket。

**面试追问：SSE 一定会自动重连吗？**

不一定。原生 `EventSource` 会尝试自动重连；如果使用 Fetch 自行读取 SSE，重连、退避和断点续传需要业务代码实现。

## 2. AI 长文本输出导致页面卡顿

**核心观点：** 减少 DOM 数量、降低渲染频率，避免每次变化都全量解析 Markdown。

1. 使用虚拟列表，只渲染可视区域消息。
2. 使用 requestAnimationFrame 或节流批量更新内容。
3. 将 Markdown 解析拆分为稳定内容和正在生成内容。
4. 对已完成消息使用 React.memo。
5. 延迟图片、公式、代码高亮等高成本渲染。
6. 清理不可见组件、事件监听器和定时器，避免内存增长。

**面试总结：** 长文本优化 = 虚拟列表 + 批量更新 + 增量解析 + 组件隔离 + 内存管理。

**面试追问：为什么 Markdown 不能每次都全量解析？**

因为文本越长，解析和 React 渲染成本越高。应缓存已完成内容，只重新解析最后一个正在生成的片段。

## 3. Fetch 处理 ReadableStream

**核心观点：** 通过 Reader 逐块读取，再使用同一个 TextDecoder 增量解码。

1. 调用 fetch 获取响应，检查状态和 response.body。
2. 调用 getReader() 获取读取器。
3. 循环执行 reader.read()，直到 done 为 true。
4. 使用 TextDecoder.decode(value, { stream: true }) 解码。
5. 将结果写入 Buffer，按 SSE 或 JSON 协议拆分完整消息。
6. 完成、异常或用户取消时释放 Reader，并使用 AbortController 终止请求。

```js
async function readStream(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok || !response.body) throw new Error("请求失败");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    buffer += decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
```

**面试总结：** Reader 负责读取，Decoder 负责解码，Buffer 负责组装，AbortController 负责取消。

**面试追问：为什么不能把每个 chunk 直接当成一条消息？**

网络分片边界与业务消息边界没有关系，一条消息可能跨多个 chunk，一个 chunk 也可能包含多条消息，因此必须通过 Buffer 和协议分隔符组装。

### 追问：`TextDecoder` 的 `stream: true` 解决什么问题？

它会保留尚未组成完整字符的字节，等待下一个 chunk 继续解码，从而避免中文等多字节字符被拆分后乱码。流结束时还应调用一次 `decoder.decode()` 刷新残留字节。

## 4. 自动滚动与用户手动上滚

**核心观点：** 只有用户仍在底部时才自动滚动；用户上滚后必须暂停。

1. 用 scrollHeight - scrollTop - clientHeight 判断是否接近底部，并设置容差。
2. 新内容到达且处于底部时，调用 scrollIntoView 或更新 scrollTop。
3. 监听滚动、wheel 或 touchmove，识别用户是否查看历史内容。
4. 上滚后暂停自动滚动，显示“回到最新消息”按钮。
5. 用户点击按钮后恢复自动滚动。
6. 图片、公式和代码高亮加载完成后重新计算位置。
7. 使用节流处理滚动事件。

**面试总结：** 判断标准不是内容是否更新，而是用户是否仍然在底部。

**面试追问：为什么不能只监听 wheel 事件？**

触摸板、触摸屏、键盘和代码滚动不一定触发 `wheel`。更稳妥的方式是监听滚动位置，持续判断用户是否接近底部。

## 5. Promise.all 与 Promise.allSettled

**核心观点：** 是否允许部分任务失败，是选择两个 API 的关键。

1. Promise.all 任意一个 Promise reject，整体立即 reject，适合必须全部成功的任务。
2. Promise.allSettled 等待所有任务结束，适合批量请求和允许部分失败的场景。
3. all 返回结果数组；allSettled 返回带有 status、value 或 reason 的对象数组。
4. 多模型并行请求通常使用 allSettled，便于展示部分成功结果。
5. 只需要最快结果时使用 Promise.race 或 Promise.any。

**面试总结：** 全部成功才有意义用 all；需要收集全部结果用 allSettled。

**面试追问：`Promise.allSettled` 能取消其他请求吗？**

不能。它只负责等待并汇总结果。需要取消请求时，应使用共享的 `AbortController` 主动调用 `abort()`。

## 6. CSS 实现打字机光标闪烁

**核心观点：** 使用伪元素模拟光标，再通过 CSS 动画控制透明度。

1. 在正在输出的文本末尾添加 ::after。
2. 设置光标宽度、高度、颜色和 display: inline-block。
3. 使用 @keyframes 控制 opacity 闪烁。
4. 输出完成后移除 streaming class。
5. 使用 prefers-reduced-motion 尊重用户的动效偏好。

```css
.streaming::after {
  content: "";
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 4px;
  vertical-align: -2px;
  background: currentColor;
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .streaming::after {
    animation: none;
  }
}
```

**面试总结：** 光标效果属于表现层逻辑，使用伪元素和 CSS 动画即可实现。

**面试追问：`prefers-reduced-motion` 是什么？**

它是一个 CSS 媒体查询，用于检测用户是否在操作系统中开启了“减少动态效果”。开启后应减少或关闭光标闪烁、平滑滚动等动画，以降低眩晕和视觉干扰。
