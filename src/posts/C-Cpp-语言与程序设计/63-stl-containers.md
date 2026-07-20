---
title: STL 容器：选择合适的数据组织方式
date: 2026-07-17
icon: boxes-stacked
order: 63
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - STL
  - 容器
  - vector
author: Kingcq
---

标准模板库提供了经过广泛使用的容器。学习数据结构实现是为了理解代价和约束；写实际 C++ 程序时，通常应优先使用标准容器，而不是重新实现链表、哈希表或动态数组。

## 顺序容器

### `std::vector`

连续存储、支持随机访问、尾部插入均摊 `O(1)`：

```cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> values{1, 2, 3};
    values.push_back(4);

    for (int value : values) {
        std::cout << value << ' ';
    }
    std::cout << '\n';
}
```

优先把 `vector` 当作默认动态序列。它具有良好的缓存局部性，很多情况下即使中间插入需要移动元素，也比节点容器更快。

### `std::array`

固定长度但拥有容器接口：

```cpp
#include <array>

std::array<int, 4> values{1, 2, 3, 4};
```

长度属于类型，适合编译期固定大小的值对象。

### `std::deque`

支持两端快速插入删除，元素不保证整体连续：

```cpp
#include <deque>

std::deque<int> queue;
queue.push_front(1);
queue.push_back(2);
```

### `std::list`

双向链表，已知位置插入删除快，但随机访问慢、节点开销大、缓存局部性差。不要因为“中间删除 `O(1)`”就默认选择它；首先要花时间找到那个位置。

## 关联容器

### `std::map` 与 `std::set`

通常基于平衡树：

```cpp
#include <map>
#include <string>

std::map<std::string, int> counts;
++counts["apple"];
```

- 键有序；
- 查找、插入、删除通常 `O(log n)`；
- 支持范围查询；
- `map` 保存键值对，`set` 只保存键。

`operator[]` 在键不存在时会插入默认值。只查询时可用 `find` 或 `at`，避免意外修改。

### `std::unordered_map` 与 `std::unordered_set`

基于哈希表：

```cpp
#include <unordered_map>

std::unordered_map<std::string, int> counts;
```

平均查找接近 `O(1)`，但没有键顺序，最坏情况可能退化。自定义键需要相等比较和哈希函数保持一致：相等对象必须产生相同哈希值。

## 容器适配器

### `std::stack`

```cpp
#include <stack>

std::stack<int> values;
values.push(1);
values.push(2);
values.pop();
```

只暴露栈接口，不提供遍历。

### `std::queue`

```cpp
#include <queue>

std::queue<int> values;
values.push(1);
values.pop();
```

### `std::priority_queue`

默认最大堆：

```cpp
#include <queue>
#include <vector>
#include <functional>

std::priority_queue<int> max_heap;
std::priority_queue<int, std::vector<int>, std::greater<int>> min_heap;
```

## 元素访问：`[]` 与 `at`

```cpp
std::vector<int> values{10, 20};
int a = values[5];    // 越界：未定义行为
int b = values.at(5); // 抛出 std::out_of_range
```

`at` 提供检查，但不能代替正确循环边界。性能敏感且边界已由逻辑保证时，`[]` 很常见。

## `size` 与空容器

```cpp
if (!values.empty()) {
    std::cout << values.back();
}
```

不要先写 `values.size() - 1` 再检查空，因为 `size()` 返回无符号类型，空容器时会下溢。

## 容量与失效

`vector` 扩容后：

- 所有指针、引用、迭代器可能失效；
- 下标值仍可重新用于访问相同逻辑位置；
- `reserve` 可以减少扩容次数，但不能保证永久不失效。

`unordered_map` rehash 时迭代器会失效，但对元素的引用和指针通常仍有特定保证；不同容器和操作规则不同，使用前应查文档。

“容器元素地址是否稳定”不能靠猜。

## `emplace` 不是永远更快

```cpp
values.emplace_back(args...);
values.push_back(Object(args...));
```

`emplace_back` 可以直接构造元素，但现代编译器与移动语义使 `push_back` 临时对象也常很高效。更重要的是语义清楚：已有对象用 `push_back`，需要原地构造时用 `emplace_back`。

## 选择指南

| 需求 | 优先考虑 |
| :-- | :-- |
| 通用可增长序列 | `vector` |
| 固定长度值 | `array` |
| 两端频繁操作 | `deque` |
| 按键有序、范围查询 | `map` / `set` |
| 平均快速键查找 | `unordered_map` / `unordered_set` |
| 先进先出 | `queue` |
| 优先级最高先出 | `priority_queue` |

真正选择时还要考虑元素数量、内存、迭代器稳定性、排序需求和访问模式。

## 所有权

容器拥有其元素。存储对象值最简单：

```cpp
std::vector<User> users;
```

若使用智能指针：

```cpp
std::vector<std::unique_ptr<Base>> objects;
```

容器拥有指针对象，`unique_ptr` 再拥有动态对象。裸指针容器通常只表达借用，必须明确被指向对象由谁管理。

容器负责拥有和组织元素，算法则负责处理范围。下一篇学习迭代器如何把两者解耦，并使用标准算法表达查找、排序、变换和删除。
