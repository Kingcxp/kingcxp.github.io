---
title: 迭代器与标准算法
date: 2026-07-18
icon: route
order: 64
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 迭代器
  - algorithm
  - STL
author: Kingcq
---

标准算法不直接依赖某一种容器，而是通过迭代器描述元素范围。这让同一算法可以处理数组、`vector`、`list` 和其他满足要求的序列。

## 半开区间 `[first, last)`

```cpp
#include <algorithm>
#include <vector>

std::vector<int> values{4, 1, 3, 2};
std::sort(values.begin(), values.end());
```

`begin()` 指向第一个元素，`end()` 指向最后一个元素之后的位置，不能解引用。

半开区间的优点：

- 空范围是 `first == last`；
- 元素数量可表示为距离；
- 相邻范围 `[a, b)` 与 `[b, c)` 无重叠地拼接；
- 不需要制造“最后一个元素之前”的特殊下标。

## 迭代器像指针，但不总是指针

常见操作：

```cpp
auto it = values.begin();
int value = *it;
++it;
```

不同迭代器能力不同：

- 输入迭代器：单向读取；
- 输出迭代器：单向写入；
- 前向迭代器：可多次遍历；
- 双向迭代器：支持 `--`；
- 随机访问迭代器：支持 `+`、`-`、下标和比较。

`std::sort` 需要随机访问迭代器，因此不能直接排序 `std::list`；`list` 提供自己的 `sort` 成员函数。

## 查找

```cpp
#include <algorithm>

const auto it = std::find(values.begin(), values.end(), 3);
if (it != values.end()) {
    // 找到
}
```

算法返回迭代器，而不是下标，因为不是所有容器都有高效下标。

## 条件算法

```cpp
#include <algorithm>

bool has_negative = std::any_of(
    values.begin(), values.end(),
    [](int value) { return value < 0; }
);

bool all_even = std::all_of(
    values.begin(), values.end(),
    [](int value) { return value % 2 == 0; }
);
```

lambda 会在下一篇详细讲。这里先把它看成一个临时判断函数。

## 变换

```cpp
#include <algorithm>
#include <vector>

std::vector<int> squares(values.size());
std::transform(values.begin(), values.end(), squares.begin(),
               [](int value) { return value * value; });
```

目标范围必须有足够空间。也可以使用插入迭代器：

```cpp
std::vector<int> squares;
squares.reserve(values.size());
std::transform(values.begin(), values.end(),
               std::back_inserter(squares),
               [](int value) { return value * value; });
```

## 累积

```cpp
#include <numeric>

long long sum = std::accumulate(values.begin(), values.end(), 0LL);
```

初始值类型会影响累积类型。写 `0` 可能让整个过程按 `int` 累加，即使最终变量是 `long long`。

## 删除惯用法

算法 `std::remove` 不会改变容器大小，它把要保留的元素移到前面并返回新的逻辑末尾：

```cpp
values.erase(
    std::remove(values.begin(), values.end(), 0),
    values.end()
);
```

这叫 erase-remove 惯用法。C++20 提供更直接的 `std::erase`，但本教程以 C++17 为基线。

## 排序与比较器

```cpp
#include <string>
#include <vector>

struct User {
    std::string name;
    int score;
};

std::sort(users.begin(), users.end(),
          [](const User& a, const User& b) {
              if (a.score != b.score) return a.score > b.score;
              return a.name < b.name;
          });
```

比较器必须形成严格弱序。不要写 `return a.score >= b.score;`，因为对象与自身比较时会返回真，破坏规则。

## 二分算法

有序范围上可用：

```cpp
std::binary_search(first, last, value);
std::lower_bound(first, last, value);
std::upper_bound(first, last, value);
```

- `lower_bound`：第一个不小于目标的位置；
- `upper_bound`：第一个大于目标的位置；
- 两者之差给出重复目标数量。

前提是范围按兼容的比较规则排序。

## 迭代器失效

```cpp
for (auto it = values.begin(); it != values.end(); ++it) {
    if (*it < 0) values.push_back(0); // 可能扩容，it 失效
}
```

容器修改期间必须了解失效规则。删除 `vector` 元素的常见写法：

```cpp
for (auto it = values.begin(); it != values.end(); ) {
    if (*it < 0) {
        it = values.erase(it);
    } else {
        ++it;
    }
}
```

`erase` 返回下一个有效位置。

## 算法优先于手写循环吗

标准算法的优势：

- 名字直接表达意图；
- 边界模式统一；
- 可复用比较器和操作；
- 更容易被库实现优化。

但复杂业务循环可能手写更清楚。目标不是消灭 `for`，而是避免重复实现已经有明确名称的通用操作。

很多算法还需要一段临时行为，例如比较、筛选或变换规则。下一篇学习 lambda 和可调用对象，把这些行为安全地传给算法或保存为回调。
