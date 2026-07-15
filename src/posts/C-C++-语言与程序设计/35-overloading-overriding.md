---
title: 函数重载与覆盖
date: 2026-07-16
icon: layer-group
order: 36
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 函数重载
  - 覆盖
  - override
author: Kingcq
---

## 学习目标

- 理解函数重载：同名不同参
- 知道重载与返回类型无关
- 理解函数覆盖（override）和 `virtual` 的关系
- 区分重载、覆盖、隐藏
- 学会使用 C++11 的 `override` 关键字

---

## 函数重载

函数重载允许你在**同一作用域**内定义多个同名函数，只要它们的参数列表不同即可：

```cpp
#include <iostream>

void print(int x) {
    std::cout << "整数：" << x << std::endl;
}

void print(double x) {
    std::cout << "浮点数：" << x << std::endl;
}

void print(const char* s) {
    std::cout << "字符串：" << s << std::endl;
}

int main() {
    print(10);
    print(3.14);
    print("Hello");
    return 0;
}
```

编译器会根据你传入的参数类型，自动选择最合适的版本。

参数列表不同可以是：

- 参数个数不同
- 参数类型不同
- 参数顺序不同

但**不能仅靠返回类型不同**来重载：

```cpp
int  foo();
double foo();   // 编译错误，返回类型不能区分重载
```

:::tip 为什么返回类型不行？
因为调用函数时可以忽略返回值，比如 `foo();`，编译器无法判断该调用哪个版本。
:::

---

## 函数覆盖（override）

覆盖发生在继承关系中：基类有一个 `virtual` 函数，派生类写一个**同名、同参数列表、同返回类型**的函数，这就叫覆盖。

```cpp
#include <iostream>

class Shape {
public:
    virtual void draw() const {
        std::cout << "画一个形状" << std::endl;
    }

    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    void draw() const override {
        std::cout << "画一个圆" << std::endl;
    }
};

class Rectangle : public Shape {
public:
    void draw() const override {
        std::cout << "画一个矩形" << std::endl;
    }
};
```

这里的 `override` 是 C++11 关键字，放在函数参数列表后面。它的作用是告诉编译器：「我打算覆盖基类的虚函数，请帮我检查一下签名是否真的匹配。」如果写错了，编译器会直接报错，而不是留下一个隐藏的 bug。

---

## 重载、覆盖、隐藏的区别

这三个概念初学者特别容易混淆，我用表格帮你理清楚：

| 概念 | 发生场景 | 条件 | 是否要求 virtual |
|------|----------|------|------------------|
| 重载 | 同一作用域 | 同名，参数列表不同 | 否 |
| 覆盖 | 继承关系 | 同名、同参数、同返回类型 | 基类函数是 virtual |
| 隐藏 | 继承关系 | 派生类函数与基类函数同名 | 否 |

**隐藏**是一个容易踩的坑。如果派生类写了一个和基类同名但参数不同的函数，或者基类函数不是 `virtual` 却被派生类重新定义，基类的版本就会被隐藏：

```cpp
class Base {
public:
    void show(int x) {
        std::cout << "Base show: " << x << std::endl;
    }
};

class Derived : public Base {
public:
    void show(double x) {   // 隐藏了 Base::show(int)
        std::cout << "Derived show: " << x << std::endl;
    }
};

int main() {
    Derived d;
    d.show(3.14);   // 调用 Derived::show(double)
    // d.show(10);  // 编译错误！Base::show(int) 被隐藏
    d.Base::show(10);  // 显式调用基类版本
    return 0;
}
```

如果想同时让基类版本可用，可以在派生类里加一句 `using Base::show;`。

---

## 综合示例

```cpp
#include <iostream>

class Printer {
public:
    // 重载
    void print(int x)    { std::cout << "int: "    << x << std::endl; }
    void print(double x) { std::cout << "double: " << x << std::endl; }
};

class Base {
public:
    virtual void greet() const {
        std::cout << "Hello from Base" << std::endl;
    }

    void say(int x) {
        std::cout << "Base say: " << x << std::endl;
    }
};

class Derived : public Base {
public:
    void greet() const override {   // 覆盖
        std::cout << "Hello from Derived" << std::endl;
    }

    void say(double x) {            // 隐藏了 Base::say(int)
        std::cout << "Derived say: " << x << std::endl;
    }
};

int main() {
    Printer p;
    p.print(10);
    p.print(2.5);

    Derived d;
    d.greet();
    d.say(3.14);
    d.Base::say(100);

    return 0;
}
```

---

## 常见错误与注意事项

1. **以为返回类型不同就能重载**

   重载只看参数，返回类型不参与匹配。

2. **覆盖时签名写错**

   比如漏了 `const`，或者参数类型不一致，都会导致没有真正覆盖。加上 `override` 可以让编译器帮你把关。

3. **忘记基类函数是 virtual**

   如果基类函数不是 `virtual`，派生类写的同名同参函数只是隐藏，不是覆盖，多态不会生效。

4. **滥用 using 引入隐藏函数**

   `using` 可以恢复基类重载版本，但也会改变类接口，要小心使用。

---

## 小结

- 函数重载：同名不同参，返回类型不能区分。
- 函数覆盖：继承中重写基类的 `virtual` 函数，签名必须一致。
- 函数隐藏：派生类同名函数遮蔽了基类版本，容易导致意外。
- C++11 的 `override` 关键字是防止覆盖出错的好帮手。

重载和覆盖解决了「同名函数不同行为」的问题，而要真正实现运行时的多态，还需要虚函数机制。下一篇就来揭晓。

**下一篇预告：《虚函数与多态》。**
