---
title: 复制、移动、RAII 与资源所有权
date: 2026-07-15
icon: boxes-stacked
order: 56
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 拷贝
  - 移动
  - RAII
  - 智能指针
author: Kingcq
---

构造函数让对象正确出生，析构函数让对象正确结束。但对象还会被复制、赋值、返回和放入容器。只要类拥有动态内存、文件句柄或锁，就必须明确这些操作意味着什么。

## 普通值为什么可以直接复制

```cpp
int a = 10;
int b = a;
```

`b` 得到独立的整数值。我们希望大多数类也具有类似的值语义：复制后两个对象都有效，修改一个不会破坏另一个。

<span style="color: #67C23A;">标准库的 `std::string`、`std::vector` 已经实现了正确的资源管理，因此优先组合这些类型，往往不需要自己写复制与析构逻辑。</span>

```cpp
class Student {
public:
    Student(std::string name, std::vector<int> scores)
        : name_(std::move(name)), scores_(std::move(scores)) {}

private:
    std::string name_;
    std::vector<int> scores_;
};
```

这就是常说的 <span style="color: #E6A23C;">Rule of Zero</span>：让成员类型管理资源，自己的类不声明析构、复制或移动特殊函数。

## 裸指针所有权造成浅拷贝

```cpp
class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data_(new int[size]{}), size_(size) {}

    ~Buffer() {
        delete[] data_;
    }

private:
    int* data_;
    std::size_t size_;
};
```

编译器生成的复制构造会逐成员复制，`data_` 地址也会被原样复制：

```cpp
Buffer a(10);
Buffer b = a;  // 两个对象指向同一数组
```

<span style="color: #F56C6C;">两个析构函数最终都会 `delete[]` 同一地址，产生重复释放。</span>这就是拥有型裸指针的浅拷贝问题。

## 复制构造与复制赋值

```cpp
Buffer(const Buffer& other);            // 创建新对象
Buffer& operator=(const Buffer& other); // 已有对象接收新值
```

一个简化的深拷贝实现：

```cpp
#include <algorithm>
#include <cstddef>

class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data_(new int[size]{}), size_(size) {}

    ~Buffer() {
        delete[] data_;
    }

    Buffer(const Buffer& other)
        : data_(new int[other.size_]), size_(other.size_)
    {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    Buffer& operator=(const Buffer& other)
    {
        if (this == &other) return *this;

        Buffer temp(other);
        swap(temp);
        return *this;
    }

    void swap(Buffer& other) noexcept
    {
        std::swap(data_, other.data_);
        std::swap(size_, other.size_);
    }

private:
    int* data_;
    std::size_t size_;
};
```

“先复制到临时对象，再交换”让赋值在分配失败抛出异常时保持原对象不变。

这段代码用于理解机制；实际项目优先写 `std::vector<int> data_;`，立刻回到 Rule of Zero。

## 移动：转移资源而不是复制内容

临时对象或即将不再使用的对象，可以把资源所有权交给新对象：

```cpp
Buffer(Buffer&& other) noexcept
    : data_(other.data_), size_(other.size_) {
    other.data_ = nullptr;
    other.size_ = 0;
}
```

`Buffer&&` 是右值引用。移动后，源对象必须仍然可析构、可赋值，但它的具体内容通常只保证“有效但未指定”。不要依赖它仍保存原数据。

`std::move` 本身不移动任何东西，它只是把表达式转换成可以匹配移动操作的形式：

```cpp
std::string a = "large text";
std::string b = std::move(a);
```

真正是否移动，由目标类型的构造或赋值函数决定。

## Rule of Five 和 Rule of Zero

如果类直接管理资源，并且自定义了其中一个，通常需要认真考虑五个特殊成员：

1. 析构函数；
2. 复制构造函数；
3. 复制赋值运算符；
4. 移动构造函数；
5. 移动赋值运算符。

这叫 Rule of Five。<span style="color: #409EFF;">更好的目标仍是 Rule of Zero：把资源交给现成 RAII 类型，从而不必手写这五个函数。</span>

## 禁止复制也是一种清楚的设计

有些资源天然只有一个拥有者，例如文件写入器或互斥锁。可以显式禁止复制：

```cpp
class FileWriter {
public:
    FileWriter(const FileWriter&) = delete;
    FileWriter& operator=(const FileWriter&) = delete;
};
```

如果允许移动，就可以把唯一资源交给另一个对象。

## `unique_ptr` 表达唯一所有权

```cpp
#include <memory>

std::unique_ptr<Student> make_student() {
    return std::make_unique<Student>();
}
```

`unique_ptr` 不能复制，只能移动。离开作用域时会自动 `delete` 对象。

```cpp
auto first = std::make_unique<Student>();
auto second = std::move(first);
// first 现在为空，second 拥有对象
```

动态数组一般仍优先 `std::vector`，而不是 `unique_ptr<T[]>`，因为 vector 同时保存大小并提供容器接口。

## `shared_ptr` 不是“更安全的默认指针”

`shared_ptr` 通过引用计数共享所有权。它适合确实没有单一拥有者的对象图，但会带来：

- 额外计数和分配成本；
- 生命周期更难预测；
- 循环引用导致对象无法释放。

能用值、引用、借用裸指针或 `unique_ptr` 表达时，不要为了省事改成 `shared_ptr`。

## RAII 不只管理内存

```cpp
std::lock_guard<std::mutex> lock(mutex);
```

构造时加锁，离开作用域时自动解锁。即使中途 `return` 或抛出异常，析构仍会执行。这说明 RAII 的核心不是“智能指针”，而是让资源清理绑定到确定的对象生命周期。

## 异常安全与析构函数

析构函数通常不应让异常逃出，尤其是在栈展开期间。资源释放操作应尽量标记或保证 `noexcept`。移动构造标记 `noexcept` 也能帮助标准容器在扩容时安全选择移动。

## 本章设计顺序

1. 能否直接用值成员？
2. 能否用 `std::string`、`std::vector` 等标准类型？
3. 是否真的需要动态多态或独立动态生命周期？
4. 若需要，是否有唯一所有者，可以用 `unique_ptr`？
5. 只有所有权确实共享时才用 `shared_ptr`；
6. 只有编写底层资源封装类时，才手写 Rule of Five。

理解复制和移动后，你会发现“对象放在哪里”不是最关键的问题，真正关键的是：资源所有权能否沿每次构造、赋值和销毁保持一致。
