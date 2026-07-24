---
title: 运算符重载与值语义
date: 2026-07-16
icon: plus-minus
order: 58
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 运算符重载
  - 值语义
  - 比较
author: Kingcq
---

运算符重载允许自定义类型使用 `+`、`==`、`[]`、`<<` 等语法。它的目的不是让代码看起来花哨，而是让类型表现得像它所抽象的数学值或容器。

## 先判断运算是否自然

二维向量相加很自然：

```cpp
Vector2 c = a + b;
```

“用户 + 数据库”通常没有公认含义，强行重载只会隐藏业务操作。一个好重载应尽量符合使用者对该运算符已有的直觉。

## 成员与非成员

```cpp
class Vector2 {
public:
    Vector2(double x, double y) : x_(x), y_(y) {}

    Vector2& operator+=(const Vector2& other)
    {
        x_ += other.x_;
        y_ += other.y_;
        return *this;
    }

    double x() const { return x_; }
    double y() const { return y_; }

private:
    double x_;
    double y_;
};

Vector2 operator+(Vector2 left, const Vector2& right)
{
    left += right;
    return left;
}
```

`+=` 修改左操作数，适合作为成员；`+` 通过复制左值再复用 `+=`，返回新值。

## 为什么 `operator+` 常用非成员

若写成成员：

```cpp
class Number {
public:
    Number operator+(const Number& other) const;
};
```

左操作数必须已经是 `Number`。非成员形式有时能让左右操作数参与更对称的隐式转换。但隐式转换本身也可能制造歧义，因此构造函数常使用 `explicit`。

## 相等比较

```cpp
bool operator==(const Vector2& left, const Vector2& right)
{
    return left.x() == right.x() && left.y() == right.y();
}

bool operator!=(const Vector2& left, const Vector2& right)
{
    return !(left == right);
}
```

<span style="color: #E6A23C;">对于浮点成员，直接比较是否合理取决于类型语义。</span>数学近似向量可能需要显式 `almost_equal`，而作为哈希键或精确状态时又可能需要严格相等。不要把误差策略偷偷藏进所有 `==`。

## 顺序比较必须形成一致关系

若类型用于排序容器，`operator<` 或比较器必须满足严格弱序。简单说：

- 任何对象都不应小于自己；
- 若 `a < b`，则不能同时 `b < a`；
- 关系应具有传递性；
- “互不小于”形成的等价关系也应一致。

违反这些规则会让排序和关联容器行为失去基础。

## 下标运算符

```cpp
class Buffer {
public:
    int& operator[](std::size_t index)
    {
        return data_[index];
    }

    const int& operator[](std::size_t index) const
    {
        return data_[index];
    }

private:
    std::vector<int> data_;
};
```

通常同时提供可修改和只读版本。`operator[]` 往往不检查边界；需要检查时可以另提供 `at()`。

## 流输出

```cpp
#include <ostream>

std::ostream& operator<<(std::ostream& out, const Vector2& value)
{
    return out << '(' << value.x() << ", " << value.y() << ')';
}
```

返回流引用才能继续链式输出：

```cpp
std::cout << a << ' ' << b << '\n';
```

## 前置与后置自增

```cpp
Counter& operator++();    // 前置 ++x
Counter operator++(int);  // 后置 x++，int 只是区分签名
```

后置版本通常需要保留旧值，因此可能更昂贵。<span style="color: #67C23A;">迭代器等类型在不需要旧值时优先使用前置自增。</span>

## 不能改变的规则

运算符重载不能：

- 创造新的运算符；
- 改变优先级和结合性；
- 改变操作数个数；
- 重载 `.`、`.*`、`::`、`?:` 等某些运算符；
- 改变内置类型之间运算的含义。

至少一个操作数必须是用户定义类型。

## 值语义

一个具有值语义的类型通常表现为：

- 复制后得到相互独立但值相等的对象；
- 比较依据逻辑值，而不是对象地址；
- 移动只转移资源，不改变逻辑规则；
- 析构不需要调用者额外清理；
- 可以放入标准容器并正常排序、交换和返回。

`std::string`、`std::vector` 都是典型值类型。即使内部使用动态内存，使用者仍把它们当成普通值。

## 身份对象不一定适合复制

<span style="color: #409EFF;">文件句柄、互斥量、网络连接等对象表示独占资源或身份，复制含义不自然。</span>可以禁止复制，只允许移动：

```cpp
class FileHandle {
public:
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;

    FileHandle(FileHandle&&) noexcept = default;
    FileHandle& operator=(FileHandle&&) noexcept = default;
};
```

<span style="color: #F56C6C;">不要为了“所有类都应该支持 `==` 和复制”而给身份对象发明错误语义。</span>

## 重载检查表

- 该运算符是否有直观、稳定的含义？
- 是否保持内置运算符的基本习惯？
- 修改型运算返回 `*this` 吗？
- 非修改型运算返回新值吗？
- `const` 版本是否齐全？
- 比较关系是否一致？
- 是否复用已有操作避免重复逻辑？
- 是否会制造意外隐式转换？

值语义解决“一个类型怎样像普通值一样使用”。下一篇讨论继承和组合，重点判断类型之间是否真的存在可替换关系，而不是只为复用代码。
