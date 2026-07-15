---
title: 虚函数与多态
date: 2026-07-16
icon: shapes
order: 36
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 多态
  - 虚函数
  - 抽象类
author: Kingcq
---

## 学习目标

- 理解多态的两种形态：编译时多态与运行时多态
- 掌握 `virtual` 关键字的使用
- 理解基类指针/引用如何指向派生类对象
- 了解纯虚函数、抽象类和接口
- 理解虚析构函数的重要性

---

## 什么是多态

多态（Polymorphism）字面意思是「多种形态」。在编程里，它指的是：**同一个接口，在不同对象上表现出不同行为**。

C++ 中多态有两种常见形式：

- **编译时多态**：函数重载、模板。
- **运行时多态**：虚函数机制。

运行时多态是面向对象最迷人的特性之一，也是很多大型框架设计的核心。

---

## 虚函数与动态绑定

先看一个不使用虚函数的例子：

```cpp
#include <iostream>

class Animal {
public:
    void speak() const {
        std::cout << "动物发出声音" << std::endl;
    }
};

class Dog : public Animal {
public:
    void speak() const {
        std::cout << "汪汪" << std::endl;
    }
};

int main() {
    Dog dog;
    Animal* p = &dog;
    p->speak();   // 输出：动物发出声音
    return 0;
}
```

虽然 `p` 指向的是 `Dog` 对象，但调用的仍然是 `Animal::speak()`。这是因为指针类型决定了调用哪个函数，这叫**静态绑定**。

如果我们希望根据实际指向的对象类型来决定调用哪个函数，就要把基类函数声明为 `virtual`：

```cpp
class Animal {
public:
    virtual void speak() const {
        std::cout << "动物发出声音" << std::endl;
    }
};

class Dog : public Animal {
public:
    void speak() const override {
        std::cout << "汪汪" << std::endl;
    }
};

class Cat : public Animal {
public:
    void speak() const override {
        std::cout << "喵喵" << std::endl;
    }
};
```

现在再用基类指针调用 `speak()`，程序会根据指针实际指向的对象，决定调用 `Dog::speak()` 还是 `Cat::speak()`，这就是**动态绑定**，也叫**晚绑定**。

```cpp
int main() {
    Dog dog;
    Cat cat;

    Animal* animals[] = { &dog, &cat };
    for (auto* p : animals) {
        p->speak();
    }

    return 0;
}
```

输出：

```
汪汪
喵喵
```

:::tip 引用也能实现多态
基类引用指向派生类对象时，同样会触发动态绑定。但普通对象不会，例如 `Animal a = dog;` 会发生对象切片，多态失效。
:::

---

## 纯虚函数与抽象类

有时候基类本身并不代表一个具体的对象，只作为一种接口规范。你可以把它声明为**抽象类**：

```cpp
class Shape {
public:
    virtual void draw() const = 0;   // 纯虚函数
    virtual ~Shape() = default;
};
```

`= 0` 表示这个函数没有实现，必须由派生类去覆盖。含有纯虚函数的类称为**抽象类**，不能直接实例化：

```cpp
Shape s;   // 编译错误！抽象类不能创建对象
```

但你可以用基类指针或引用指向它的派生类对象：

```cpp
class Circle : public Shape {
public:
    void draw() const override {
        std::cout << "画圆" << std::endl;
    }
};

class Rectangle : public Shape {
public:
    void draw() const override {
        std::cout << "画矩形" << std::endl;
    }
};
```

---

## 多态的经典应用

下面是一个更完整的例子：用基类指针数组统一管理不同形状：

```cpp
#include <iostream>
#include <vector>

class Shape {
public:
    virtual void draw() const = 0;
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

int main() {
    std::vector<Shape*> shapes;
    Circle c;
    Rectangle r;

    shapes.push_back(&c);
    shapes.push_back(&r);

    for (const auto* s : shapes) {
        s->draw();
    }

    return 0;
}
```

这个模式在游戏开发、图形界面、插件系统里非常常见。

---

## 虚析构函数

如果你的类会被当作基类使用，并且可能通过基类指针 `delete` 派生类对象，那么一定要把析构函数声明为 `virtual`：

```cpp
class Base {
public:
    virtual ~Base() {
        std::cout << "Base 析构" << std::endl;
    }
};

class Derived : public Base {
public:
    ~Derived() {
        std::cout << "Derived 析构" << std::endl;
    }
};

int main() {
    Base* p = new Derived();
    delete p;   // 先调用 Derived 析构，再调用 Base 析构
    return 0;
}
```

如果 `Base` 的析构函数不是 `virtual`，`delete p` 就只会调用 `Base` 的析构函数，`Derived` 里分配的资源就泄漏了。

:::tip 经验法则
凡是可能被继承的类，析构函数都建议声明为 `virtual`，或者干脆使用 `= default` 的虚析构。
:::

---

## 常见错误与注意事项

1. **用对象而不是指针/引用调用虚函数**

   ```cpp
   Animal a = dog;
   a.speak();   // 调用 Animal::speak，不是 Dog::speak
   ```

   这里发生了**对象切片**，派生类部分被切掉了。

2. **构造函数里调用虚函数**

   构造派生类对象时，基类构造函数执行期间，对象的派生类部分还没有构造完成，此时调用虚函数不会到达派生类版本。

3. **忘记虚析构函数**

   通过基类指针 `delete` 派生类对象时，会导致派生类析构不被调用。

4. **纯虚函数忘记在派生类中实现**

   如果派生类没有覆盖所有纯虚函数，它自己也会变成抽象类，不能实例化。

---

## 小结

- 多态让同一接口在不同对象上有不同表现。
- `virtual` 让成员函数支持动态绑定；通过基类指针或引用调用时，实际调用派生类版本。
- 纯虚函数 `= 0` 定义接口，所在类为抽象类。
- 基类应使用虚析构函数，避免 `delete` 派生类对象时资源泄漏。
- 多态广泛应用于图形系统、游戏对象、插件框架等场景。

到这里，你已经完整走过了 C 语言基础和 C++ 面向对象的核心内容。后续可以进一步学习模板、STL、异常、智能指针等更现代的 C++ 特性。

**本系列关于类与对象的核心内容告一段落，感谢坚持到这里的你！**
