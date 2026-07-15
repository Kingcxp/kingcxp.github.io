---
title: 从结构体到类
date: 2026-07-14
icon: cube
order: 32
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
    char name[20];
    int age;
    float score;
};
```

这样做的好处是把一个学生的所有信息放到一个变量里，代码更整齐。不过它也有几个明显的遗憾：

- 数据和操作数据的函数是分开的。
- 任何人都可以直接修改 `score`，很难阻止出现负数成绩这种非法数据。
- 结构体一旦变大，相关的初始化、打印、比较逻辑会散落在程序各处。

C++ 提供了一种更强大的机制——**类（class）**。它把数据和对数据的操作绑定在一起，并且能控制谁能访问谁。

:::tip 从本章开始
本阶段正式进入 C++ 内容。示例代码会保存为 `.cpp` 文件并用 C++ 编译器（如 `g++`）编译，但里面仍然兼容你学过的绝大部分 C 语法，所以你不用觉得陌生。
:::

---

## 类的定义

一个类可以包含：

- **成员变量**：描述对象的状态
- **成员函数**：描述对象的行为

看一个学生类的例子：

```cpp
#include <iostream>
#include <cstring>

class Student {
public:
    // 成员函数
    void setInfo(const char* n, int a, float s) {
        std::strncpy(name, n, sizeof(name) - 1);
        name[sizeof(name) - 1] = '\0';
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
    char name[20];
    int age;
    float score;
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
./28-classes-intro
```

`Student` 是类名，`stu` 是根据这个类创建出来的**对象**，也叫**实例**。

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
虽然本文重点讲 `class`，但在 C++ 中 `struct` 同样可以拥有成员函数、构造函数、访问修饰符——和 `class` 唯一的区别只是默认访问权限不同（`struct` 默认 `public`，`class` 默认 `private`）。也就是说，你在 `class` 里能做的事，在 `struct` 里也能做。

但社区习惯是：简单的数据聚合用 `struct`，带有复杂行为和封装的用 `class`。保持这个约定能让代码更容易理解。
:::

## 对象的实例化

对象可以在栈上创建，也可以在堆上创建：

```cpp
Student s1;                 // 栈对象
s1.setInfo("Bob", 21, 78.0);

Student* p = new Student;   // 堆对象
p->setInfo("Carol", 19, 92.0);
p->print();
delete p;                   // 别忘了释放
```

注意：访问成员时，对象用点号 `.`，指针用箭头 `->`，和结构体一样。

---

## 访问修饰符

类中有三种访问权限：

- `public`：类的外部可以自由访问，通常放对外接口。
- `private`：只有类内部能访问，用来保护内部数据。
- `protected`：对类外部是私有的，但可以被派生类访问，为后面的继承做准备。

一个常用写法是：把成员变量放在 `private`，把操作它们的函数放在 `public`。这就是**封装**——把实现细节藏起来，只暴露安全的接口。

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

1. **类定义末尾忘记分号**

   ```cpp
   class Demo {
       int x;
   }  // 错误！要加分号
   ```

2. **直接访问私有成员**

   ```cpp
   Student s;
   s.score = 100;  // 编译错误：score 是 private
   ```

3. **分不清声明和定义**

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

## 小结

- 类把数据和行为封装在一起，比 C 结构体更强大。
- `class` 默认私有，`struct` 默认公有，其他方面几乎一致。
- 对象可以在栈或堆上创建，用 `.` 或 `->` 访问成员。
- 通过 `public`/`private`/`protected` 控制访问权限，初步实现封装。

掌握了类，下一步我们看看对象诞生和销毁时会发生什么——这就是构造函数和析构函数。

**下一篇预告：《构造函数与析构函数》。**
