---
title: 动态数组：从固定容量到可增长容器
date: 2026-07-09
icon: arrows-left-right-to-line
order: 34
category:
  - C/C++ 语言与程序设计
tag:
  - 数据结构
  - 动态数组
  - realloc
  - 均摊复杂度
author: Kingcq
---

固定数组访问快、内存连续，但容量在创建后难以改变。<span style="color: #409EFF;">动态数组在连续存储的基础上增加自动扩容，是 `std::vector` 等容器背后的核心思想。</span>

## 数据结构

```c
#include <stddef.h>

typedef struct {
    int *data;
    size_t size;
    size_t capacity;
} IntVector;
```

三个字段分别表示：

- `data`：元素缓冲区首地址；
- `size`：已经构造并可访问的元素数量；
- `capacity`：当前缓冲区最多可容纳的元素数量。

不变量：

```text
0 <= size <= capacity
capacity == 0 时 data 可以为 NULL
合法元素范围是 [0, size)
```

## 初始化和释放

```c
#include <stdlib.h>

void vector_init(IntVector *vector)
{
    vector->data = NULL;
    vector->size = 0;
    vector->capacity = 0;
}

void vector_destroy(IntVector *vector)
{
    free(vector->data);
    vector_init(vector);
}
```

## 预留容量

```c
#include <stdint.h>

int vector_reserve(IntVector *vector, size_t new_capacity)
{
    if (new_capacity <= vector->capacity) return 1;
    if (new_capacity > SIZE_MAX / sizeof(vector->data[0])) return 0;

    int *new_data = realloc(
        vector->data,
        new_capacity * sizeof(vector->data[0])
    );
    if (new_data == NULL) return 0;

    vector->data = new_data;
    vector->capacity = new_capacity;
    return 1;
}
```

`reserve` 只改变容量，不改变 `size`，也不会凭空产生新元素。

## 尾部插入

```c
int vector_push_back(IntVector *vector, int value)
{
    if (vector->size == vector->capacity) {
        size_t new_capacity = vector->capacity == 0
            ? 8
            : vector->capacity * 2;

        if (new_capacity < vector->capacity) return 0;
        if (!vector_reserve(vector, new_capacity)) return 0;
    }

    vector->data[vector->size++] = value;
    return 1;
}
```

容量翻倍不是唯一策略，但它能让连续多次尾插的总成本保持较低。

## 为什么是均摊 `O(1)`

某一次扩容需要复制 `size` 个元素，看起来是 `O(n)`。但容量按 1、2、4、8、16……增长时，插入 `n` 个元素的总复制量小于大约 `2n`：

```text
1 + 2 + 4 + ... + n/2 < n
```

再加上 `n` 次普通写入，总工作量仍是 `O(n)`，平均到每次插入就是<span style="color: #E6A23C;">均摊 `O(1)`</span>。

这不代表每次插入都同样快，而是长序列中的平均成本有保证。

## 下标访问

```c
int *vector_at(IntVector *vector, size_t index)
{
    if (index >= vector->size) return NULL;
    return &vector->data[index];
}
```

返回元素地址可以同时支持读取和修改：

```c
int *item = vector_at(&vector, 3);
if (item != NULL) *item = 42;
```

也可以分别提供 `get`、`set` 接口，避免把内部地址暴露出去。

## 插入和删除

```c
#include <string.h>

int vector_insert(IntVector *vector, size_t index, int value)
{
    if (index > vector->size) return 0;
    if (!vector_push_back(vector, 0)) return 0;

    memmove(&vector->data[index + 1],
            &vector->data[index],
            (vector->size - index - 1) * sizeof(vector->data[0]));
    vector->data[index] = value;
    return 1;
}

int vector_erase(IntVector *vector, size_t index)
{
    if (index >= vector->size) return 0;

    memmove(&vector->data[index],
            &vector->data[index + 1],
            (vector->size - index - 1) * sizeof(vector->data[0]));
    --vector->size;
    return 1;
}
```

中间插入和删除需要移动后续元素，因此是 `O(n)`。

## 缩容不是每次删除都做

如果每删除一个元素就缩小缓冲区，反复增删会频繁重新分配。常见策略是：

- `clear` 只把 `size` 设为 0，保留容量；
- 提供显式 `shrink_to_fit`；
- 或在容量远大于大小时再缩容。

缩容策略需要在内存占用和重新分配成本之间权衡。

## 指针失效

```c
int *first = &vector.data[0];
vector_push_back(&vector, 99); // 可能 realloc
printf("%d\n", *first);       // first 可能已经悬空
```

扩容可能把缓冲区搬到新地址。<span style="color: #F56C6C;">所有指向旧元素的指针都可能失效。</span>正确做法是：

- 扩容后重新通过下标获取地址；
- 或在需要稳定地址时选择链表等结构；
- 或提前 `reserve` 足够容量，但仍要明确容量上限。

## 泛型动态数组为什么更难

把 `int` 换成任意类型，需要额外知道：

- 每个元素大小；
- 如何复制；
- 是否有资源需要析构；
- 比较和打印函数；
- 对齐要求。

<span style="color: #409EFF;">C 可以通过 `void *`、元素大小和回调函数实现泛型容器，但接口较复杂。</span>C++ 模板能在保留类型信息的同时生成特定类型实现，后面会专门学习。

## 复杂度总结

| 操作 | 复杂度 |
| :-- | :-- |
| 下标访问 | `O(1)` |
| 尾部插入 | 均摊 `O(1)` |
| 尾部删除 | `O(1)` |
| 中间插入/删除 | `O(n)` |
| 查找无序值 | `O(n)` |
| 扩容 | 单次 `O(n)` |

动态数组适合需要快速随机访问、主要在尾部增长的数据。下一篇链表则会用非连续节点换取更灵活的连接方式。
