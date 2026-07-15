---
title: 构造函数与析构函数
date: 2026-07-14
icon: hammer
order: 32
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 构造函数
  - 析构函数
  - 初始化列表
author: Kingcq
---

## 学习目标

- 理解构造函数存在的意义
- 掌握默认构造函数、带参构造函数和初始化列表
- 理解析构函数的作用和调用时机
- 初步了解浅拷贝与深拷贝的问题

---

## 为什么需要构造函数

上一篇写了这样的代码：

```cpp
Student stu;
stu.setInfo("Alice", 20, 89.5);
```

每创建一个对象，都要手动调一次初始化函数，否则成员变量就是未定义的随机值，很容易出错。构造函数的作用就是：**对象一出生，就自动完成初始化**，不用你额外操心。

构造函数的规则很简单：

- 函数名和类名相同。
- 没有返回值，连 `void` 都不写。
- 在创建对象时自动调用。

---

## 默认构造函数

如果你一个构造函数都不写，编译器会帮你生成一个「默认构造函数」：

```cpp
class Point {
public:
    int x;
    int y;
};

int main() {
    Point p;   // 默认构造函数被调用，但内置类型不会初始化
    return 0;
}
```

不过，默认构造函数对内置类型不会做可靠初始化。更稳妥的做法是自己写，或者给成员加类内初始值：

```cpp
class Point {
public:
    Point() {
        x = 0;
        y = 0;
    }
private:
    int x;
    int y;
};
```

---

## 带参构造函数

你可以写多个构造函数，只要参数列表不同，这就是后面要说的函数重载：

```cpp
#include <iostream>
#include <cstring>

class Book {
public:
    // 默认构造函数
    Book() {
        title[0] = '\0';
        price = 0.0;
        std::cout << "默认构造函数被调用" << std::endl;
    }

    // 带参构造函数
    Book(const char* t, double p) {
        std::strncpy(title, t, sizeof(title) - 1);
        title[sizeof(title) - 1] = '\0';
        price = p;
        std::cout << "带参构造函数被调用" << std::endl;
    }

    void print() const {
        std::cout << "书名：" << title << "，价格：" << price << std::endl;
    }

private:
    char title[50];
    double price;
};

int main() {
    Book b1;                    // 调用默认构造函数
    Book b2("C++ Primer", 89.0); // 调用带参构造函数

    b1.print();
    b2.print();
    return 0;
}
```

:::tip 一个细节
一旦你写了任何构造函数，编译器就不再提供默认构造函数。如果你还需要无参构造，必须自己写。
:::

---

## 初始化列表

初始化列表写在构造函数的参数列表和函数体之间，用冒号开头：

```cpp
class Rectangle {
public:
    Rectangle(int w, int h) : width(w), height(h) {
        // 函数体可以为空
    }

    int area() const {
        return width * height;
    }

private:
    int width;
    int height;
};
```

推荐在初始化列表里初始化成员变量，而不是在函数体里赋值。原因有两个：

- 效率更高：先初始化再赋值会多一次操作。
- 有些成员必须在初始化列表中初始化，比如 `const` 成员、引用成员、没有默认构造函数的对象成员。

```cpp
class Example {
public:
    Example(int n) : constant(n), ref(value), member(n) {
        value = n;
    }

private:
    const int constant;
    int value;
    int& ref;
    std::string member;  // string 可以用 n 构造
};
```

---

## 析构函数

对象有生就有灭。析构函数负责在对象销毁前做一些清理工作，比如释放动态内存、关闭文件等。

析构函数的特点：

- 名字是 `~类名`。
- 没有参数，没有返回值。
- 一个类只能有一个析构函数。
- 对象离开作用域或被 `delete` 时自动调用。

```cpp
#include <iostream>

class Logger {
public:
    Logger(const char* msg) {
        std::cout << "进入：" << msg << std::endl;
        message = msg;
    }

    ~Logger() {
        std::cout << "离开：" << message << std::endl;
    }

private:
    const char* message;
};

void test() {
    Logger log("test 函数");
    std::cout << "函数执行中..." << std::endl;
}

int main() {
    test();
    return 0;
}
```

输出：

```
进入：test 函数
函数执行中...
离开：test 函数
```

---

## 构造与析构的调用时机

```cpp
void demo() {
    Book b;        // 构造
    Book* p = new Book("Hello", 30.0);  // 构造
    delete p;      // 析构
}                 // b 在这里析构
```

- 栈对象：定义时构造，离开作用域时析构。
- 堆对象：`new` 时构造，`delete` 时析构。
- 全局对象：程序启动时构造，程序结束时析构。

---

## 浅拷贝与深拷贝的简单提及

当一个类包含指针、动态内存等资源时，编译器自动生成的拷贝行为可能只是简单复制指针的值，这叫**浅拷贝**。两个对象会指向同一块内存，析构时可能重复释放，导致程序崩溃。正确的做法是自定义拷贝行为，确保各对象有自己的一份数据，这叫**深拷贝**。这个话题后面会专门展开，这里先留个印象。

---

## 常见错误与注意事项

1. **写了带参构造却忘记写默认构造**

   ```cpp
   Book b;   // 编译错误！没有默认构造函数
   ```

2. **初始化列表顺序与声明顺序不一致**

   成员真正按声明顺序初始化，而不是按初始化列表顺序。最好让两者保持一致，避免依赖错误。

3. **动态内存忘记释放**

   如果构造函数里用了 `new`，析构函数里要对应 `delete`。

4. **把构造函数写出返回值**

   ```cpp
   void Book() {}  // 错误！构造函数没有返回值
   ```

---

## 小结

- 构造函数在对象创建时自动调用，负责初始化。
- 默认构造、带参构造可以共存，构成重载。
- 初始化列表是初始化成员的首选方式。
- 析构函数在对象销毁时自动调用，负责清理资源。
- 含动态资源的类要警惕浅拷贝问题。

下一篇我们来聊聊类里一个隐身的助手——`this` 指针。

**下一篇预告：《this 指针》。**
