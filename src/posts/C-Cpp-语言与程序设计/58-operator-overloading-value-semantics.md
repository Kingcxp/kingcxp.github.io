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

你有没有想过，为什么 `std::string` 可以用 `+` 拼接、用 `==` 比较大小？自己定义的类型能不能也支持这些操作？答案是**运算符重载**——让自定义类型也能用 `+`、`-`、`==`、`[]`、`<<` 这些符号。

## 学习目标

读完这篇文章，你会掌握：

- 什么时候该重载运算符，什么时候不该
- 成员函数重载和非成员函数重载的区别
- 如何重载算术运算符、比较运算符、下标运算符
- 如何重载流输出 `<<` 让自定义类型能用 `cout` 打印
- 什么是值语义，它和引用语义有什么区别

## 先判断运算是否合理

运算符重载的目的是让你的类型用起来像内置类型一样自然，而不是让代码看起来花哨。

判断标准很简单：**这个操作是否有普遍公认的含义？**

```cpp
// 向量相加很自然
Vector2 c = a + b;

// "用户" + "数据库" 就不太对劲——没有人知道加出来应该是什么
```

一个好重载应该符合使用者对该运算符已有的直觉。如果你需要文档来解释这个 `+` 是什么意思，那它很可能不应该重载。

## 用例子说话：二维向量

假设我们要写一个二维向量类型，让它支持加法。先看怎么做：

```cpp
#include <iostream>

class Vector2 {
public:
    Vector2(double x, double y) : x_(x), y_(y) {}

    // 复合赋值：+= 修改自身，返回自身引用
    Vector2& operator+=(const Vector2& other) {
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

// 普通加法：不修改操作数，返回新值
Vector2 operator+(Vector2 left, const Vector2& right) {
    left += right;  // 复用 += 的实现
    return left;
}

int main() {
    Vector2 a(1, 2), b(3, 4);
    Vector2 c = a + b;
    std::cout << c.x() << ", " << c.y() << '\n';
    return 0;
}
```

注意这里 `operator+` 是写在类外面的（非成员函数）。为什么？

## 成员函数 vs 非成员函数

两种写法都可以，但经验法则是：

- **修改自身的运算符**（`+=`、`-=`、`*=` 等）写成**成员函数**。
- **返回新值的运算符**（`+`、`-`、`==` 等）写成**非成员函数**。

原因是：如果 `+` 是成员函数，左操作数必须已经是该类对象。而对于非成员函数，编译器可以对两边做相同的隐式转换，更对称。举个简单的例子：

```cpp
class Number {
public:
    Number operator+(const Number& other) const;  // 成员
};

// 这样写可以
Number result = a + b;
// 但如果 Number 有从 int 转换的构造函数
// a + 5 也可以，但 5 + a 就不行（因为 5 不是 Number）
```

非成员形式让左右操作数更对称。不过这在实际中影响不大，因为隐式转换本身就应该少用。

## 比较运算符

为你的类型实现比较，让它能被排序、放进 `set` 或作为 `map` 的键：

```cpp
bool operator==(const Vector2& left, const Vector2& right) {
    return left.x() == right.x() && left.y() == right.y();
}

bool operator!=(const Vector2& left, const Vector2& right) {
    return !(left == right);  // 复用 ==
}
```

- `==` 和 `!=` 应该配对实现，一个通过调用另一个来减少重复。
- 对于浮点成员，直接比较是否相等要小心：数学上近似相等的向量可能需要专门的 `almost_equal` 函数，而不是混进 `==` 里。

如果需要排序，还要实现 `<`：

```cpp
bool operator<(const Vector2& left, const Vector2& right) {
    if (left.x() != right.x()) return left.x() < right.x();
    return left.y() < right.y();
}
```

## 下标运算符

如果你写了一个类似数组的容器类，可以重载 `[]`：

```cpp
#include <vector>

class Buffer {
public:
    int& operator[](std::size_t index) {
        return data_[index];
    }

    const int& operator[](std::size_t index) const {
        return data_[index];
    }

private:
    std::vector<int> data_;
};
```

注意要同时提供可修改版本和只读版本（`const` 版本），这样常量对象也能安全使用 `[]`。

## 流输出运算符 <<

这是最常用的重载之一。你肯定写过 `std::cout << "Hello"`，但你自己的类型能不能直接用 `<<` 打印？只要重载 `operator<<` 就行：

```cpp
#include <ostream>

std::ostream& operator<<(std::ostream& out, const Vector2& value) {
    return out << '(' << value.x() << ", " << value.y() << ')';
}
```

要注意的是：

1. 第一个参数是 `std::ostream&`，第二个参数是你的类型。
2. 返回 `std::ostream&` 才能支持链式写法：`std::cout << a << b << '\n';`
3. 这个函数必须是非成员函数（因为 `ostream` 是标准库的，你没法往里面加成员函数）。

有了这个重载，你的类型就可以这样打印了：

```cpp
Vector2 v(1, 2);
std::cout << v << '\n';  // 输出 (1, 2)
```

## 流输入运算符 >>

同理，你也可以实现从流读取：

```cpp
#include <istream>

std::istream& operator>>(std::istream& in, Vector2& value) {
    double x, y;
    in >> x >> y;
    value = Vector2(x, y);  // 假设 Vector2 有对应的构造函数
    return in;
}
```

这样就可以从 `cin` 或文件流中读取了：

```cpp
Vector2 v;
std::cin >> v;
```

## 前置自增与后置自增

对于迭代器或计数器，你可能需要重载 `++`：

```cpp
class Counter {
public:
    Counter& operator++();    // 前置 ++x：返回自增后的值
    Counter operator++(int);  // 后置 x++：返回自增前的值
};
```

后置版本的 `int` 参数只是用来区分签名，函数体里不需要用到它。后置版本通常需要保存旧值再自增，所以效率比前置略低。能用前置的时候就尽量用前置。

## 重载的限制

运算符重载不是万能的，有些事情你不能做：

- ❌ 创造新的运算符（比如 `**` 表示幂运算）。
- ❌ 改变运算符优先级和结合性。
- ❌ 改变操作数个数（`+` 必须是二元运算符）。
- ❌ 重载 `.`、`.*`、`::`、`?:` 等特定运算符。
- ❌ 改变内置类型（如 `int`）之间运算的含义。

至少一个操作数必须是用户定义类型。

## 值语义 vs 引用语义

什么是值语义？简单说，就是一个类型用起来像普通的 `int` 一样：

- 复制后得到两个相互独立但值相等的对象。
- 可以用 `==` 比较，按逻辑值判断而不是按地址判断。
- 可以放入标准容器正常排序和交换。
- 不需要调用者手动清理。

`std::string`、`std::vector` 都是典型的值类型。即使它们内部使用动态内存，使用者也只管把它们当成普通的值来用。

相反，文件句柄、互斥量、网络连接这些**身份对象**不适合复制。如果复制了，两个对象指向同一份资源，谁负责释放？正确的做法是禁止复制，只允许移动：

```cpp
class FileHandle {
public:
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;

    FileHandle(FileHandle&&) noexcept = default;
    FileHandle& operator=(FileHandle&&) noexcept = default;
};
```

不要为了"所有类都应该支持 `==` 和复制"而给身份对象发明错误语义。

## 小结

- 运算符重载让自定义类型用起来像内置类型。
- `+=` 等修改型运算写成成员函数；`+`、`==`、`<<` 等写成非成员函数。
- 流输出 `operator<<` 是最常用的重载之一，必须是非成员函数。
- 一个具有值语义的类型应该支持复制、比较和赋值，且互相独立。
- 身份对象（文件句柄等）应该禁止复制，只允许移动。
