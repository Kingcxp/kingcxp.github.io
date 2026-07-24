---
title: 继承、组合与可替换关系
date: 2026-07-16
icon: sitemap
order: 59
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 继承
  - 组合
  - is-a
author: Kingcq
---

继承最重要的意义不是“少写几行重复代码”，而是表达一种<span style="color: #409EFF;">可替换的 is-a 关系</span>：任何需要基类对象的地方，都可以合理地使用派生类对象。

## 先问是否真的可替换

假设有基类：

```cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};
```

`Circle` 和 `Rectangle` 都可以被当作 `Shape` 使用，因为调用者只要求“能计算面积”。

但“汽车拥有发动机”不是 `Car is an Engine`，应使用组合：

```cpp
class Engine {
    // ...
};

class Car {
private:
    Engine engine_;
};
```

看到重复字段或函数时，不应立即继承。实现复用可以通过组合、普通辅助函数、模板或委托完成。

## 基类与派生类

```cpp
#include <iostream>
#include <string>
#include <utility>

class Animal {
public:
    explicit Animal(std::string name)
        : name_(std::move(name)) {}

    const std::string& name() const noexcept
    {
        return name_;
    }

    virtual void speak() const
    {
        std::cout << "...\n";
    }

    virtual ~Animal() = default;

private:
    std::string name_;
};

class Dog : public Animal {
public:
    Dog(std::string name, std::string breed)
        : Animal(std::move(name)), breed_(std::move(breed)) {}

    void speak() const override
    {
        std::cout << name() << ": woof\n";
    }

private:
    std::string breed_;
};
```

`public` 继承表达公开的 is-a 关系。`Dog` 对外仍然是一个 `Animal`。

## 构造与析构顺序

构造派生对象时：

1. 基类子对象；
2. 按声明顺序构造成员；
3. 派生类构造函数体。

析构顺序相反：

1. 派生类析构函数体；
2. 派生成员逆序析构；
3. 基类析构。

基类必须先建立自己不变量，派生部分才有合法基础。

## 基类成员访问

- `public`：外部和派生类都可访问；
- `protected`：派生类可访问，外部不可；
- `private`：只有基类自身和友元可访问。

不要为了让派生类方便就把全部字段设成 `protected`。这会让所有派生类依赖基类内部表示，破坏封装。<span style="color: #67C23A;">优先保持字段 `private`，通过受保护或公开的成员函数提供必要操作。</span>

## 三种继承方式

```cpp
class PublicDerived : public Base {};
class ProtectedDerived : protected Base {};
class PrivateDerived : private Base {};
```

对普通应用代码：

- `public` 继承用于公开 is-a；
- `private` 继承表示“用基类实现”，但通常组合更清楚；
- `protected` 继承较少使用。

继承方式还会改变基类公开成员在派生类中的可访问级别，但不会让派生类直接访问基类私有成员。

## 对象切片

```cpp
void print_animal(Animal animal); // 按值接收基类
Dog dog("Milo", "Corgi");
print_animal(dog);
```

把派生对象按值转换成基类对象时，只复制基类子对象，派生部分被切掉。<span style="color: #409EFF;">运行时多态接口应使用基类引用或指针：</span>

```cpp
void print_animal(const Animal& animal) {
    animal.speak();
}
```

## 虚析构为什么重要

```cpp
Animal *animal = new Dog("Milo", "Corgi");
delete animal;
```

<span style="color: #F56C6C;">如果基类析构函数不是虚函数，通过基类指针删除派生对象会产生未定义行为。</span>只要类型准备被多态删除，基类析构应当是 `virtual`。

更现代的拥有方式：

```cpp
std::unique_ptr<Animal> animal = std::make_unique<Dog>("Milo", "Corgi");
```

智能指针不会修复非虚析构问题；它最终仍通过基类类型删除，因此基类设计必须正确。

## 构造和析构期间的虚调用

在基类构造函数中调用虚函数，不会分派到尚未构造的派生部分；析构期间同理，已经销毁的派生部分不能再被调用。

因此不要依赖构造或析构期间的虚调用完成派生初始化。可以使用工厂函数、非虚接口或构造后显式初始化流程。

## 组合通常更灵活

继承把派生类与基类接口和部分实现紧密耦合。组合只要求成员类型提供所需能力：

```cpp
class FileLogger {
public:
    void write(const std::string& message);
};

class Service {
public:
    explicit Service(FileLogger logger)
        : logger_(std::move(logger)) {}
private:
    FileLogger logger_;
};
```

还可以把接口作为模板参数或构造参数注入，测试时替换为假实现。

## 什么时候考虑继承

同时满足越多越合理：

- 派生对象确实可以替换基类对象；
- 基类接口稳定并为扩展设计；
- 需要运行时多态；
- 调用者只依赖基类契约；
- 基类有虚析构；
- 派生类不会破坏基类不变量；
- “is-a” 比“has-a”更准确。

下一篇会集中区分虚函数覆盖、名字隐藏和协变返回，避免派生类函数看起来同名却没有真正覆盖。
