---
title: Mol3d 方法梳理
date: 2023-05-15 11:41:05
tags: mol3d
---

```js

├── Plugin                    全局
│  ├── Asset                  存储结构文件的地方
│  ├── State                  状态管理
│  │  └── Cells               存储在Map（plugin.state.data.cells）里的树状结构，树里的节点称之为cell，每条cell都通过于一个transform生成。每一条cell都有着唯一id（ref），cell节点的唯一id为cRef。
│  │    ├── Root              状态树的根节点
│  │    ├── ReadFile          文件节点
│  │    ├── Trajectory        解析轨迹数据，该transform中认为一个文件中的每个model是轨迹的每一帧
│  │    ├── Model             分子构象，已经将结构数据完全解析并预处理（预测pdb的键级和二级结构等）
│  │    ├── MergedStructure   自定义的transform，作为hermite结构数据的根节点，将所有Structure合并到这个节点上来解决无法展示多个结构文件间的相互作用力的问题。
│  │    ├── Structure         对Model数据进行处理后得到的结构数据节点，Model是一整个分子构象，Structure就是这个分子构象的一部分。
│  │    ├──  Representation   根据Structure数据生成，包含了渲染时所需的数据。（label、measure等非结构展示也有repr，只是参数不同）
│  ├── Managers               工具包（个人理解），各种好用的功能都放在这儿，比如measure、label等功能，我们开发的药效团、口袋等功能也都放在这里。
│  ├── Structure              结构
│  │     ├── Unit             最小单元
│  │     ├── elementId        原子在mol*中的id，其实就是atomIndex
│  ├── Loci                   表示多个结构元素索引位置
│  ├── Stats                  对Structure数据的统计
│  ├── Structure Repr         结构展示形态
│  │  ├── type                展示的形态，比如cartoon、Ball& Stick等
│  │  ├── colorTheme          染色方案
│  │  ├── sizeTheme           尺寸方案
│  ├── Snapshot               快照
│  ├── Script                 MolQl的应用
│  ├── Expression             MolQl的应用

```