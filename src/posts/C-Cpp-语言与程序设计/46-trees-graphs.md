---
title: 图的表示：顶点、边与邻接结构
date: 2026-07-12
icon: share-nodes
order: 46
category:
  - C/C++ 语言与程序设计
tag:
  - 数据结构
  - 图
  - 邻接矩阵
  - 邻接表
author: Kingcq
---

前面已经具体实现了二叉树、二叉搜索树、堆和哈希表。现在进入更一般的关系结构：图。图不要求只有一个根，也不要求每个节点只有固定数量的孩子。

## 图由什么组成

图由顶点和边组成：

```text
A ---- B
|      |
C ---- D
```

- 顶点（vertex）：对象或状态；
- 边（edge）：两个顶点之间的关系；
- 无向图：边没有方向；
- 有向图：边从一个顶点指向另一个顶点；
- 加权图：边还保存距离、费用、容量等权重。

## 基本术语

- <span style="color: #409EFF;">相邻</span>：两个顶点之间存在边；
- <span style="color: #409EFF;">路径</span>：沿边连接的一串顶点；
- <span style="color: #409EFF;">环</span>：路径最终回到起点；
- <span style="color: #409EFF;">连通</span>：无向图中两点之间存在路径；
- <span style="color: #409EFF;">连通分量</span>：彼此可达的最大顶点集合；
- <span style="color: #409EFF;">入度/出度</span>：有向图中进入或离开顶点的边数；
- <span style="color: #409EFF;">简单路径</span>：通常指不重复经过顶点的路径。

术语定义要和具体算法保持一致。例如“路径长度”有时指边数，有权图中也可能指权重总和。

## 顶点编号

程序常把顶点映射到 `0..n-1`：

```text
Alice -> 0
Bob   -> 1
Carol -> 2
```

字符串名字可以通过哈希表映射到整数编号。整数编号让数组、矩阵和访问标记更容易使用。

任何来自文件或用户的编号都必须检查：

```c
int valid_vertex(size_t vertex, size_t vertex_count) {
    return vertex < vertex_count;
}
```

## 邻接矩阵

```c
#include <stdbool.h>

#define VERTEX_COUNT 4

bool graph[VERTEX_COUNT][VERTEX_COUNT] = {
    {false, true,  true,  false},
    {true,  false, false, true },
    {true,  false, false, true },
    {false, true,  true,  false}
};
```

`graph[u][v]` 表示是否存在从 `u` 到 `v` 的边。

### 特点

- 判断边是否存在：`O(1)`；
- 遍历一个顶点的所有可能邻居：`O(V)`；
- 空间：`O(V²)`；
- 适合顶点较少或边很密集的图。

无向图的矩阵通常对称：`graph[u][v] == graph[v][u]`。

## 加权邻接矩阵

<span style="color: #F56C6C;">不能简单用 0 表示“无边”，因为边权可能合法地等于 0。</span>可以：

- 另用布尔矩阵表示边是否存在；
- 使用一个明确不可能成为合法权重的哨兵值；
- 使用可选值结构。

<span style="color: #E6A23C;">哨兵设计必须和权重范围一起说明。</span>

## 邻接表

对稀疏图，为每个顶点保存真正相邻的顶点：

```c
typedef struct EdgeNode {
    size_t to;
    int weight;
    struct EdgeNode *next;
} EdgeNode;

typedef struct {
    EdgeNode **heads;
    size_t vertex_count;
} Graph;
```

添加有向边：

```c
#include <stdlib.h>

int graph_add_directed_edge(Graph *graph,
                            size_t from,
                            size_t to,
                            int weight) {
    if (from >= graph->vertex_count || to >= graph->vertex_count) {
        return 0;
    }

    EdgeNode *edge = malloc(sizeof(*edge));
    if (edge == NULL) return 0;

    edge->to = to;
    edge->weight = weight;
    edge->next = graph->heads[from];
    graph->heads[from] = edge;
    return 1;
}
```

无向边通常需要添加两个方向。若第二次分配失败，必须回滚第一次添加，或预先完成两次分配后再提交。

### 特点

- 空间：`O(V + E)`；
- 遍历顶点 `u` 的邻居：`O(deg(u))`；
- 判断某条边是否存在：普通链表最坏 `O(deg(u))`；
- 适合大多数稀疏图。

也可以用动态数组保存每个顶点的邻居，通常有更好的缓存局部性。

## 边数组

有些算法只需要遍历所有边，例如 Kruskal 最小生成树：

```c
typedef struct {
    size_t from;
    size_t to;
    int weight;
} Edge;
```

边数组不适合频繁查询“某个顶点的全部邻居”，但便于整体排序。

一种图可以同时维护多种表示，但要承担同步更新成本。

## 图的所有权

邻接表实现中：

- `Graph` 拥有 `heads` 数组；
- 每个 `heads[i]` 拥有一条边链表；
- 边节点只保存目标顶点编号，不拥有顶点对象；
- `graph_destroy` 必须释放每条链和数组。

```c
void graph_destroy(Graph *graph) {
    if (graph == NULL) return;

    for (size_t i = 0; i < graph->vertex_count; ++i) {
        EdgeNode *edge = graph->heads[i];
        while (edge != NULL) {
            EdgeNode *next = edge->next;
            free(edge);
            edge = next;
        }
    }

    free(graph->heads);
    graph->heads = NULL;
    graph->vertex_count = 0;
}
```

## 遍历为什么需要访问标记

链表和树通常沿拥有关系向下，不会自动回到已访问节点；一般图可能有环：

```text
0 -> 1 -> 2
^         |
└---------┘
```

如果不记录 `visited`，遍历会无限重复。访问标记通常是长度为 `V` 的布尔数组。

## 不连通图

从一个起点运行 DFS 或 BFS，只能访问该起点所在的连通分量。要遍历整张图：

```c
for (size_t vertex = 0; vertex < graph.vertex_count; ++vertex) {
    if (!visited[vertex]) {
        dfs(&graph, vertex, visited);
    }
}
```

外层每启动一次搜索，就发现一个新的连通分量。

## 输入图时的验证

从文件读取边时检查：

- 顶点数量和边数量是否在可接受范围；
- 乘法和分配大小是否溢出；
- 每个顶点编号是否合法；
- 是否允许自环和平行边；
- 无向边是否重复出现；
- 权重是否在范围内；
- 读取失败时如何清理部分构造的图。

这些规则属于图格式的一部分，不能留给遍历算法猜测。

## 表示选择

| 需求 | 常见选择 |
| :-- | :-- |
| 小而密集、频繁判断边 | 邻接矩阵 |
| 大而稀疏、频繁遍历邻居 | 邻接表 |
| 需要整体按权排序边 | 边数组 |
| 顶点键是字符串 | 哈希表映射到编号 |

下一篇 Trie 会再次使用树形分支组织字符串；随后并查集维护连通分组，DFS 和 BFS 则真正遍历这里建立的图结构。
