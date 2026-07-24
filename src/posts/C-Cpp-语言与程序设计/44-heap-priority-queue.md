---
title: 二叉堆与优先队列
date: 2026-07-12
icon: ranking-star
order: 44
category:
  - C/C++ 语言与程序设计
tag:
  - 数据结构
  - 堆
  - 优先队列
  - 数组
author: Kingcq
---

普通队列按进入顺序出队。<span style="color: #67C23A;">优先队列则总是先取优先级最高的元素。</span>二叉堆是实现优先队列的经典结构。

## 堆不是内存中的“堆区”

<span style="color: #409EFF;">这里的 heap 是一种树形数据结构，与 `malloc` 使用的动态存储区域只是英文同名，概念完全不同。</span>

## 完全二叉树可以放进数组

最大堆满足：

- 形状是完全二叉树；
- 每个父节点值都不小于孩子。

使用 0 起始下标：

```text
父节点：(i - 1) / 2       i > 0
左孩子：2 * i + 1
右孩子：2 * i + 2
```

例如数组：

```text
[90, 70, 80, 20, 60, 30, 50]
```

对应：

```text
        90
      /    \
    70      80
   /  \    / \
 20   60  30 50
```

堆只保证父子关系，不保证整个数组完全有序。

## 结构定义

```c
#include <stddef.h>

typedef struct {
    int *data;
    size_t size;
    size_t capacity;
} MaxHeap;
```

容量管理与动态数组相同，可以复用 `reserve` 思路。

## 上浮

新元素先放在末尾，然后不断与父节点比较：

```c
static void heap_swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void sift_up(int data[], size_t index) {
    while (index > 0) {
        size_t parent = (index - 1) / 2;
        if (data[parent] >= data[index]) break;

        heap_swap(&data[parent], &data[index]);
        index = parent;
    }
}
```

树高为 `O(log n)`，所以上浮最多交换 `O(log n)` 次。

## 下沉

删除最大值时，用末尾元素填到根，再向下恢复堆性质：

```c
void sift_down(int data[], size_t size, size_t index) {
    for (;;) {
        size_t largest = index;
        size_t left = index * 2 + 1;
        size_t right = index * 2 + 2;

        if (left < size && data[left] > data[largest]) largest = left;
        if (right < size && data[right] > data[largest]) largest = right;

        if (largest == index) break;
        heap_swap(&data[index], &data[largest]);
        index = largest;
    }
}
```

先选两个孩子中较大的那个，否则交换后可能仍违反最大堆性质。

## 入队与出队

```c
int heap_push(MaxHeap *heap, int value) {
    if (heap->size == heap->capacity) {
        size_t next = heap->capacity == 0 ? 8 : heap->capacity * 2;
        if (next < heap->capacity || !heap_reserve(heap, next)) return 0;
    }

    heap->data[heap->size] = value;
    sift_up(heap->data, heap->size);
    ++heap->size;
    return 1;
}

int heap_pop(MaxHeap *heap, int *result) {
    if (heap->size == 0) return 0;

    *result = heap->data[0];
    --heap->size;
    if (heap->size > 0) {
        heap->data[0] = heap->data[heap->size];
        sift_down(heap->data, heap->size, 0);
    }
    return 1;
}
```

这里假设已实现与动态数组相同的 `heap_reserve`。

## 从数组建堆

逐个插入是 `O(n log n)`。更好的建堆方法是从最后一个非叶节点开始依次下沉：

```c
void heapify(int data[], size_t size) {
    for (size_t i = size / 2; i > 0; --i) {
        sift_down(data, size, i - 1);
    }
}
```

整体复杂度是 `O(n)`，不是表面上看起来的 `O(n log n)`，因为大多数节点位于靠近叶子的低高度位置。

## 堆排序

1. 把数组建成最大堆；
2. 交换根和末尾；
3. 缩小堆范围并下沉新根；
4. 重复直到只剩一个元素。

```c
void heap_sort(int data[], size_t size) {
    heapify(data, size);

    for (size_t end = size; end > 1; --end) {
        heap_swap(&data[0], &data[end - 1]);
        sift_down(data, end - 1, 0);
    }
}
```

时间复杂度 `O(n log n)`，额外空间 `O(1)`，但通常不稳定。

## 优先队列的应用

- 任务调度；
- Dijkstra 最短路；
- 找最大的前 `k` 个元素；
- 合并多个有序序列；
- 事件模拟；
- Huffman 编码。

<span style="color: #67C23A;">如果优先级与数据分开，可以把堆元素定义成结构体，并通过比较函数决定顺序。</span>

## 测试不变量

对每个合法下标 `i > 0`：

```text
data[(i - 1) / 2] >= data[i]
```

每次插入、删除和建堆后都可以在测试构建中验证该条件。

<span style="color: #67C23A;">堆擅长反复取得最高优先级，却不擅长按任意键查找。</span>下一篇学习哈希表，用散列和冲突处理实现平均快速的键值查询。
