---
title: entry 入口
date: 2023-01-30 17:31:56
tags: [dp,分子3D处理]
---

#### getSequence  获取sequence链
参数：
- plugin
- cRef

返回：
sequence 链

例如

```ts
result = [
  "V":"STSTSTTSG"
  "H":"ASASSASASS"
]

```
如果只有 V 和 H 链 ，则为抗体

#### selectRecommendBindingSite 推荐结合位点
参数：
- plugin
- cRef

直接在sequence设置推荐结合位点

#### ppDockingResultInteraction 配体蛋白和受体蛋白的相互作用
参数：
- plugin
- receptorCref: string,
- ligandCref: string,
- receptorAtoms: number[],
- ligandAtoms: number[]

