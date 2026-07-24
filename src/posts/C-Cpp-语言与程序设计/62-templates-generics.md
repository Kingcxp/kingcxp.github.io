---
title: 模板与泛型编程
date: 2026-07-17
icon: shapes
order: 62
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 模板
  - 泛型编程
  - 类型参数
author: Kingcq
---

<span style="color: #409EFF;">在 C 中，为 `int` 动态数组写好的逻辑不能直接用于 `double` 或自定义对象，通常要依赖 `void *`、元素大小和回调函数。</span>C++ 模板把类型作为参数，让编译器为具体类型生成类型安全的代码。

## 函数模板

```cpp
#include <iostream>
#include <string>

template <typename T>
T maximum(const T& a, const T& b)
{
    return a < b ? b : a;
}

int main()
{
    std::cout << maximum(3, 7) << '\n';
    std::cout << maximum(std::string("cat"), std::string("dog")) << '\n';
}
```

编译器根据实参推导 `T`，并实例化对应版本。这里要求 `T` 支持 `<` 和复制或移动返回。

## 模板不是“任何类型都能用”

<span style="color: #E6A23C;">模板代码只有在所需操作对具体类型成立时才能实例化：</span>

```cpp
struct Point { int x; int y; };
// maximum(Point{1, 2}, Point{3, 4}); // 没有 operator<，无法编译
```

模板的接口契约不仅是参数类型，还包括所需操作。C++20 可以用 concepts 明确表达；<span style="color: #F56C6C;">本教程以 C++17 为基线，先通过文档、命名和编译错误理解要求。</span>

## 显式模板参数

```cpp
maximum<double>(3, 4.5);
```

不写显式参数时，`maximum(3, 4.5)` 不能把同一个 `T` 同时推导成 `int` 和 `double`。可以先统一类型，或设计两个类型参数：

```cpp
template <typename A, typename B>
auto add(const A& a, const B& b) -> decltype(a + b)
{
    return a + b;
}
```

<span style="color: #F56C6C;">不要仅为追求“万能”而让模板接口过度复杂。</span>

## 类模板

```cpp
#include <cstddef>
#include <stdexcept>
#include <utility>
#include <vector>

template <typename T>
class Stack {
public:
    void push(const T& value)
    {
        data_.push_back(value);
    }

    void push(T&& value)
    {
        data_.push_back(std::move(value));
    }

    void pop()
    {
        if (data_.empty()) throw std::out_of_range("empty stack");
        data_.pop_back();
    }

    T& top()
    {
        if (data_.empty()) throw std::out_of_range("empty stack");
        return data_.back();
    }

    const T& top() const
    {
        if (data_.empty()) throw std::out_of_range("empty stack");
        return data_.back();
    }

    bool empty() const noexcept { return data_.empty(); }
    std::size_t size() const noexcept { return data_.size(); }

private:
    std::vector<T> data_;
};
```

使用：

```cpp
Stack<int> numbers;
Stack<std::string> words;
```

`Stack<int>` 和 `Stack<std::string>` 是不同类型。

## 模板定义为什么通常放在头文件

编译器实例化模板时需要看到完整定义，而普通分离编译只让使用者看到声明。因此常见写法是把模板声明和定义都放在 `.h`/`.hpp` 中。

也可以在 `.cpp` 中显式实例化有限类型，但那会限制可用类型集合。

## 非类型模板参数

```cpp
#include <array>

std::array<int, 10> values;
```

`10` 是非类型模板参数，属于类型的一部分。`std::array<int, 10>` 与 `std::array<int, 20>` 是不同类型。

自定义示例：

```cpp
template <typename T, std::size_t N>
class FixedBuffer {
public:
    constexpr std::size_t size() const noexcept { return N; }
    T& operator[](std::size_t index) { return data_[index]; }
    const T& operator[](std::size_t index) const { return data_[index]; }
private:
    T data_[N]{};
};
```

## 特化要谨慎

模板特化可以为特定类型提供不同实现，但过多特化会让行为难以预测。优先考虑：

- 普通重载；
- 小型策略对象；
- 比较器参数；
- 类型自身提供自然操作。

只有确实需要改变模板实现时再使用特化。

## 编译错误为何很长

模板实例化错误会包含调用链和内部类型。阅读时：

1. 先找最早出现的自己代码位置；
2. 找“没有匹配函数”“无法转换”“缺少运算符”等核心原因；
3. 暂时忽略后面大量候选列表；
4. 用更小的示例复现。

现代编译器的概念约束能改善诊断，但理解实例化过程仍然有帮助。

## 泛型算法的核心

真正的泛型不只是把 `int` 替换成 `T`。它通常把变化点抽成：

- 元素类型；
- 迭代方式；
- 比较规则；
- 操作策略；
- 分配策略。

标准库容器、迭代器和算法正是沿这条思路设计，下一篇开始系统学习。
