---
title: 从结构体到类
date: 2026-07-15
icon: cube
order: 54
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 类
  - 面向对象
  - 封装
author: Kingcq
---

## 学习目标

- 回顾 C 语言结构体的特点和局限
- 理解 C++ 中 `class` 与 `struct` 的关系与区别
- 学会定义一个简单的类，并实例化对象
- 掌握 `public`、`private`、`protected` 三种访问修饰符
- 初步体会「封装」的意义

---

## 回顾结构体

在前面 C 语言部分，你已经学会了用结构体把若干数据打包在一起：

```cpp
struct Student {
    std::string name;
    int age = 0;
    double score = 0.0;
};
```

这样做的好处是把一个学生的所有信息放到一个变量里，代码更整齐。不过它也有几个明显的遗憾：

- 数据和操作数据的函数是分开的。
- 任何人都可以直接修改 `score`，很难阻止出现负数成绩这种非法数据。
- 结构体一旦变大，相关的初始化、打印、比较逻辑会散落在程序各处。

C++ 提供了一种更强大的机制——<span style="color: #409EFF;">类（class）</span>。它把数据和对数据的操作绑定在一起，并且能控制谁能访问谁。

:::tip 从本章开始
本阶段正式进入 C++ 内容。示例代码会保存为 `.cpp` 文件并用 C++ 编译器（如 `g++`）编译，但里面仍然兼容你学过的绝大部分 C 语法，所以你不用觉得陌生。
:::

---

## 类的定义

一个类可以包含：

- <span style="color: #409EFF;">成员变量</span>：描述对象的状态
- <span style="color: #409EFF;">成员函数</span>：描述对象的行为

看一个学生类的例子：

```cpp
#include <iostream>
#include <string>

class Student {
public:
    // 成员函数
    void setInfo(const std::string& n, int a, double s) {
        name = n;
        age = a;
        score = s;
    }

    void print() {
        std::cout << "姓名：" << name << std::endl;
        std::cout << "年龄：" << age << std::endl;
        std::cout << "成绩：" << score << std::endl;
    }

private:
    // 成员变量
    std::string name;
    int age = 0;
    double score = 0.0;
};

int main() {
    Student stu;            // 实例化一个对象
    stu.setInfo("Alice", 20, 89.5);
    stu.print();
    return 0;
}
```

编译命令：

```bash
g++ classes-intro.cpp -o classes-intro
./classes-intro
```

`Student` 是类名，`stu` 是根据这个类创建出来的<span style="color: #409EFF;">对象</span>，也叫<span style="color: #409EFF;">实例</span>。

---

## class 和 struct 的区别

在 C++ 中，`struct` 和 `class` 几乎可以互换，它们都能拥有成员变量和成员函数。唯一的默认区别是：

| 关键字 | 默认访问权限 |
|--------|--------------|
| `struct` | `public` |
| `class`  | `private` |

也就是说，下面两段代码是等价的：

```cpp
struct Point {
    int x, y;   // 默认 public
};

class Point2 {
    int x, y;   // 默认 private
};
```

我习惯这样选择：

- 如果只是简单的数据聚合、和 C 代码打交道，用 `struct`。
- 如果强调封装、有复杂行为，用 `class`。

---

:::tip C++ 的 struct 也可以有成员函数
虽然本文重点讲 `class`，但在 C++ 中 `struct` 同样可以拥有成员函数、构造函数和访问修饰符。两者的语言能力基本相同，主要语法差别是：`struct` 的成员和基类默认是 `public`，`class` 默认是 `private`。

社区习惯通常把简单的数据聚合写成 `struct`，把强调不变量和封装的类型写成 `class`。这是一种表达设计意图的约定，而不是能力限制。
:::

## 对象的实例化

对象可以具有自动存储期，也可以位于动态分配的存储中。不过现代 C++ 通常先选择自动对象或标准容器，而不是手写 `new`/`delete`：

```cpp
Student s1;                 // 自动存储期对象；常见实现可能使用调用栈
s1.setInfo("Bob", 21, 78.0);

// 需要动态数量的学生时，优先使用 std::vector<Student>。
// 只有确实需要独占动态对象时，再使用 std::unique_ptr<Student>。
```

<span style="color: #E6A23C;">注意：访问成员时，对象用点号 `.`，指针用箭头 `->`，和结构体一样。</span>

---

## 访问修饰符

类中有三种访问权限：

- `public`：类的外部可以自由访问，通常放对外接口。
- `private`：只有类内部能访问，用来保护内部数据。
- `protected`：对类外部是私有的，但可以被派生类访问，为后面的继承做准备。

一个常用写法是：把成员变量放在 `private`，把操作它们的函数放在 `public`。这就是<span style="color: #409EFF;">封装</span>——把实现细节藏起来，只暴露安全的接口。

```cpp
class Counter {
public:
    void add(int n) {
        if (n > 0) value += n;
    }

    int get() const {
        return value;
    }

private:
    int value = 0;   // C++11 支持类内初始值
};
```

这样，外部代码不能直接写 `c.value = -100`，只能通过 `add` 来增加，保证了 `value` 不会被改成奇怪的值。

---

## 常见错误与注意事项

1. <span style="color: #F56C6C;">类定义末尾忘记分号</span>

   ```cpp
   class Demo {
       int x;
   }  // 错误！要加分号
   ```

2. <span style="color: #F56C6C;">直接访问私有成员</span>

   ```cpp
   Student s;
   s.score = 100;  // 编译错误：score 是 private
   ```

3. <span style="color: #F56C6C;">分不清声明和定义</span>

   成员函数可以在类内定义（隐式内联），也可以在类外定义，类外要加类名和作用域解析符 `::`：

   ```cpp
   class Box {
   public:
       void set(int w, int h);
       int area();
   private:
       int width, height;
   };

   void Box::set(int w, int h) {
       width = w;
       height = h;
   }

   int Box::area() {
       return width * height;
   }
   ```

---

## 类定义的是不变量，不只是数据加函数

`Student` 若要求成绩始终位于 0 到 100，那么每个能修改成绩的公开接口都应维护这个约束。把字段改成 `private` 只是阻止直接访问，真正的封装还需要：

- 构造后对象立即有效；
- 失败操作不会留下半合法状态；
- 查询函数不意外修改对象；
- 类型不暴露调用者不需要知道的表示细节。

## 优先让对象直接拥有成员

```cpp
class Student {
private:
    std::string name_;
    std::vector<double> scores_;
};
```

值成员会随对象自动构造和销毁。只有需要可选关系、动态多态或独立生命周期时才引入指针成员。

## `const` 成员函数是接口承诺

```cpp
double average() const;
```

末尾 `const` 表示该函数不能通过普通方式修改对象状态，并允许它在 `const Student` 上调用。纯查询函数应尽量标记 `const`。

## 对象的存储位置和类语义是两回事

类对象可以具有自动、静态或动态存储期。不要把“面向对象”与“必须 new”绑定。现代 C++ 默认直接创建对象和容器，让作用域自动管理生命周期。

## 小结

- 类把数据和行为封装在一起，比 C 结构体更强大。
- `class` 默认私有，`struct` 默认公有，其他方面几乎一致。
- 对象可以具有自动、静态或动态存储期；对象用 `.`，指向对象的指针用 `->` 访问成员。
- 通过 `public`/`private`/`protected` 控制访问权限，初步实现封装。

掌握了类，下一步我们看看对象诞生和销毁时会发生什么——这就是构造函数和析构函数。

<span style="color: #409EFF;">下一篇预告：《构造函数与析构函数》。</span>
