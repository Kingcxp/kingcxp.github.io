---
title: 虚函数覆盖、名字隐藏与协变返回
date: 2026-07-16
icon: layer-group
order: 61
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - override
  - 名字隐藏
  - 虚函数
author: Kingcq
---

函数重载已经在 C++ 函数接口章节介绍。<span style="color: #409EFF;">本篇只处理继承层次中三个容易混淆的概念：覆盖、隐藏，以及返回类型的特殊规则。</span>

## 覆盖是什么

基类虚函数在派生类中提供对应实现：

```cpp
#include <iostream>

class Shape {
public:
    virtual void draw() const
    {
        std::cout << "shape\n";
    }

    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    void draw() const override
    {
        std::cout << "circle\n";
    }
};
```

通过基类引用调用时，会根据对象真实类型选择：

```cpp
void paint(const Shape& shape) {
    shape.draw();
}
```

## 为什么一定写 `override`

下面不是覆盖：

```cpp
class Circle : public Shape {
public:
    void draw() { } // 少了 const
};
```

没有 `override` 时，它只是另一个函数，编译器可能不主动阻止。写上：

```cpp
void draw() override;
```

编译器会检查基类中是否存在可覆盖的虚函数。`override` 是接口验证，不是装饰。

## 覆盖需要匹配哪些部分

通常需要：

- 名字相同；
- 参数类型和顺序相同；
- 成员函数的 `const`、引用限定等匹配；
- 返回类型相同，或满足协变返回规则；
- 基类函数是虚函数。

基类写一次 `virtual` 后，派生层次中对应覆盖仍然是虚函数，即使省略 `virtual`。<span style="color: #67C23A;">但推荐在派生类使用 `override`。</span>

## 协变返回类型

覆盖并非绝对要求完全相同的返回类型。若返回的是类指针或引用，派生覆盖可以返回更具体的派生类型：

```cpp
class Animal {
public:
    virtual Animal* clone() const = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    Dog* clone() const override
    {
        return new Dog(*this);
    }
};
```

这里 `Dog*` 可以转换为 `Animal*`，属于协变返回。现代代码更希望 `clone` 返回智能指针，但 `std::unique_ptr<Dog>` 与 `std::unique_ptr<Animal>` 不属于语言层面的协变返回，因此接口设计会不同。

## 名字隐藏

```cpp
class Base {
public:
    void print(int value) const;
    void print(double value) const;
};

class Derived : public Base {
public:
    void print(const char *text) const;
};
```

`Derived` 中出现同名 `print` 后，基类同名集合在普通名字查找中被隐藏：

```cpp
Derived object;
object.print(10); // 可能尝试匹配 Derived::print(const char*)，而看不到 Base 重载
```

可以把基类重载集合重新引入：

```cpp
class Derived : public Base {
public:
    using Base::print;
    void print(const char *text) const;
};
```

<span style="color: #E6A23C;">隐藏发生在名字查找阶段，不要求基类函数是虚函数，也不等于覆盖。</span>

## 重载、覆盖、隐藏对比

| 概念 | 发生位置 | 条件 | 选择时机 |
| :-- | :-- | :-- | :-- |
| 重载 | 同一作用域 | 同名、参数列表不同 | 编译期 |
| 覆盖 | 继承层次 | 匹配基类虚函数 | 运行时分派可用 |
| 隐藏 | 派生作用域名字查找 | 派生类声明同名成员 | 编译期名字查找 |

## `final`

阻止后续覆盖：

```cpp
class Base {
public:
    virtual void run();
};

class Derived : public Base {
public:
    void run() final;
};
```

也可以阻止类继续被继承：

```cpp
class FinalType final : public Base {};
```

<span style="color: #F56C6C;">`final` 适合明确设计边界，不应只是为了“看起来安全”。</span>

## 默认参数与虚函数的陷阱

默认参数按调用点的静态类型决定，虚函数体按动态类型决定：

```cpp
class Base {
public:
    virtual void show(int value = 1) const;
};

class Derived : public Base {
public:
    void show(int value = 2) const override;
};

Derived object;
Base& base = object;
base.show(); // 调用 Derived::show，但默认实参通常取 Base 的 1
```

因此虚函数通常不要在不同层级提供不同默认参数。可以让非虚公开函数处理默认值，再调用受保护虚函数。

## 非虚接口模式

```cpp
class Task {
public:
    void run()
    {
        before_run();
        do_run();
        after_run();
    }

    virtual ~Task() = default;

private:
    virtual void do_run() = 0;
    void before_run();
    void after_run();
};
```

公开流程由基类保持不变量，派生类只覆盖变化步骤。这能减少派生类绕过公共检查的机会。

## 检查清单

- 每个覆盖是否写了 `override`？
- `const`、参数和引用限定是否真正匹配？
- 是否因同名成员隐藏了基类重载？
- 是否需要 `using Base::name`？
- 基类是否准备被多态删除并拥有虚析构？
- 虚函数默认参数是否造成静态/动态行为混合？
- 协变返回是否只用于指针或引用层次？

下一篇在这些规则之上解释动态绑定、抽象类和运行时多态的完整工作方式。
