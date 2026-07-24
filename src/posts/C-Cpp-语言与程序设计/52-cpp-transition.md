---
title: 从 C 过渡到现代 C++
date: 2026-07-14
icon: code-branch
order: 52
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 引用
  - string
  - vector
  - RAII
author: Kingcq
---

前面的 C 语言部分让你看清了数组、指针、动态内存和所有权。进入 C++ 后，不是把 `printf` 换成 `cout` 就结束了。现代 C++ 的核心变化是：<span style="color: #E6A23C;">让类型和对象生命周期替程序员承担更多约束</span>。

## 编译方式与头文件

C++ 源文件通常使用 `.cpp`：

```bash
g++ demo.cpp -std=c++17 -Wall -Wextra -Wpedantic -g -o demo
```

标准库头文件通常没有 `.h`：

```cpp
#include <iostream>
#include <string>
#include <vector>
```

C 兼容头文件也有 C++ 形式，例如 `<cstdio>`、`<cstdlib>`、`<cstring>`，其中名字通常位于 `std` 命名空间。

## 命名空间解决重名

```cpp
std::cout << "Hello\n";
std::string name = "Alice";
```

`std::` 表示这些名字属于标准库命名空间。入门示例有时写：

```cpp
using namespace std;
```

它会把大量名字引入当前作用域，容易在大项目和头文件中制造冲突。本教程保留显式的 `std::`，让每个名字来源清楚。

## 引用：一个已有对象的别名

```cpp
int value = 10;
int& ref = value;
ref = 20;  // 修改的就是 value
```

引用必须在定义时绑定，通常不能改绑到另一个对象。函数参数使用引用可以避免复制，并表达是否允许修改：

```cpp
void increment(int& value) {
    value++;
}

void print_name(const std::string& name) {
    std::cout << name << '\n';
}
```

- `T&`：借用并可能修改；
- `const T&`：只读借用，尤其适合避免复制较大的对象；
- `T*`：仍适合表达“可能为空”、需要指针运算或与 C 接口交互。

引用不是永远安全：如果被引用对象先结束生命周期，引用同样会悬空。

## `std::string` 管理字符串存储

```cpp
std::string first = "C++";
std::string second = " language";
std::string text = first + second;

std::cout << text << '\n';
std::cout << "length = " << text.size() << '\n';
```

`std::string` 自动管理容量和结尾字符，复制时得到独立的值语义，显著减少 `strcpy`、容量计算和手动释放错误。

需要给 C 接口传只读字符串时，可以使用：

```cpp
const char* c_text = text.c_str();
```

<span style="color: #F56C6C;">这个指针通常只在字符串未被修改或销毁期间有效，不应长期保存。</span>

## `std::vector` 管理动态数组

```cpp
std::vector<int> numbers = {3, 1, 4};
numbers.push_back(1);

for (int value : numbers) {
    std::cout << value << ' ';
}
```

`vector` 保存连续元素，自动扩容和释放。常用接口：

- `size()`：元素数量；
- `empty()`：是否为空；
- `push_back()`：尾部追加；
- `operator[]`：不做边界检查的快速访问；
- `at()`：越界时抛出异常的检查访问。

扩容可能移动所有元素，因此原先指向元素的指针、引用和迭代器可能失效。

## 自动类型推导 `auto`

```cpp
auto count = numbers.size();
auto it = numbers.begin();
```

`auto` 让编译器从初始化表达式推导类型。它适合类型明显或名字很长的场景，不应拿来隐藏关键语义。

```cpp
auto x = 1;      // int
auto y = 1.0;    // double
```

引用和 `const` 在推导时有规则，重要接口仍建议明确写出。

## 范围 for

```cpp
for (const std::string& name : names) {
    std::cout << name << '\n';
}
```

- `for (T value : container)` 会复制每个元素；
- `for (T& value : container)` 可修改元素；
- `for (const T& value : container)` 只读且避免复制。

对 `int` 这类小类型，按值复制通常简单且便宜；对字符串和大型对象，常用 `const&`。

## RAII：资源绑定到对象生命周期

在 C 中，打开文件后必须记得沿每条路径关闭，分配内存后必须手动释放。<span style="color: #409EFF;">C++ 倾向于把资源放进对象，让析构函数自动清理：</span>

```cpp {
    std::vector<int> data(1000);
    // 使用 data
} // 自动释放内部存储
```

这就是 RAII：资源获取即初始化。它不仅用于内存，也用于文件、锁、套接字等。

## 智能指针不是默认替代所有对象

<span style="color: #67C23A;">最优先的是直接创建普通对象：</span>

```cpp
Student student;
```

需要动态数量时优先容器：

```cpp
std::vector<Student> students;
```

只有确实需要动态对象和指针语义时，再考虑：

- `std::unique_ptr<T>`：唯一拥有者；
- `std::shared_ptr<T>`：共享所有权，成本和设计复杂度更高；
- `std::weak_ptr<T>`：观察共享对象但不延长寿命。

不要因为学过 `new` 就给每个对象 `new`。现代 C++ 中，直接手写 `new`/`delete` 的业务代码应当很少。

## 值语义是默认出发点

```cpp
std::string a = "hello";
std::string b = a;
b[0] = 'H';
```

通常 `a` 仍是 `"hello"`，`b` 是 `"Hello"`。标准库类型负责正确复制自己的资源，让对象像普通值一样使用。

后面的类章节会解释构造、析构、复制和移动如何共同实现这种行为。

## C 与 C++ 不要混着编译

`.c` 应由 C 编译器按 C 规则编译，`.cpp` 应由 C++ 编译器按 C++ 规则编译。C++ 不是“完全包含 C 的超集”，有些合法 C 代码在 C++ 中含义不同或无法编译。

学习时可以比较两种语言的设计，但项目中要明确每个翻译单元属于哪种语言。

## 本章检查清单

- 显式使用 `std::`；
- 字符串优先 `std::string`；
- 动态数组优先 `std::vector`；
- 只读大型参数优先 `const T&`；
- 普通对象优先自动生命周期；
- 动态唯一所有权使用 `std::unique_ptr`；
- 不保存容器扩容后可能失效的引用或指针。

下一篇进一步整理 C++ 函数接口：函数重载、默认参数、按值与按引用传递，以及移动语义背后的值类别。
