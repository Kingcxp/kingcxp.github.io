---
title: this 指针
date: 2026-07-16
icon: hand-point-right
order: 57
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - this 指针
  - 链式调用
author: Kingcq
---

## 学习目标

- 理解 `this` 指针的本质
- 知道什么时候需要显式使用 `this`
- 学会用 `this` 解决命名冲突
- 了解 `this` 在链式调用中的应用

---

## this 指针是什么

你有没有想过，同样一个成员函数，被不同对象调用时，怎么知道该操作哪个对象的数据？

答案就是：`this` 指针。

在类的非静态成员函数里，编译器会偷偷传进来一个指向当前对象的指针，名字叫 `this`。你可以把它想象成函数的第一个隐藏参数：

```cpp
class Demo {
public:
    void show() {
        // 编译器视角：void show(Demo* this)
        std::cout << this->value << std::endl;
    }
private:
    int value;
};
```

我们平时写 `value` 时，编译器实际上把它理解为 `this->value`。也就是说，`this` 永远指向**调用这个函数的那个对象**。

:::tip 注意
`this` 指针只能在类的非静态成员函数里使用，静态成员函数没有 `this`。
:::

---

## 什么时候需要显式使用 this

### 1. 解决成员变量与参数的命名冲突

这是最常见的情况。很多人喜欢把参数名和成员变量名起成一样的，比如：

```cpp
class Student {
public:
    void setAge(int age) {
        age = age;   // 你想给谁赋值？
    }
private:
    int age;
};
```

这段代码编译不会报错，但结果会让你困惑：两个 `age` 都是参数，`this->age` 根本没变。

正确写法：

```cpp
class Student {
public:
    void setAge(int age) {
        this->age = age;   // 左边是成员变量，右边是参数
    }

    int getAge() const {
        return this->age;
    }

private:
    int age;
};
```

另一种风格是给成员变量加前缀或后缀，比如 `m_age`、`_age`、`age_`，避免冲突。

---

### 2. 返回当前对象，实现链式调用

如果成员函数返回 `*this`，就可以连续调用多个函数：

```cpp
#include <iostream>
#include <cstring>

class Person {
public:
    Person& setName(const char* n) {
        std::strncpy(name, n, sizeof(name) - 1);
        name[sizeof(name) - 1] = '\0';
        return *this;
    }

    Person& setAge(int a) {
        age = a;
        return *this;
    }

    void print() const {
        std::cout << name << " " << age << std::endl;
    }

private:
    char name[20];
    int age = 0;
};

int main() {
    Person p;
    p.setName("Tom").setAge(25).print();
    return 0;
}
```

输出：

```
Tom 25
```

这里 `p.setName("Tom")` 返回 `p` 的引用，紧接着就可以调用 `setAge(25)`，再继续调用 `print()`。这种写法在设置器里很常见。

---

### 3. 把当前对象传给其他函数

有时候你需要让另一个函数操作当前对象，可以直接传 `this`：

```cpp
class Widget;

void process(Widget* w);

class Widget {
public:
    void requestProcess() {
        process(this);   // 把当前对象传出去
    }
};
```

---

## 一个完整的示例

```cpp
#include <iostream>

class Counter {
public:
    Counter& init(int start) {
        this->count = start;
        return *this;
    }

    Counter& add(int n) {
        this->count += n;
        return *this;
    }

    Counter& reset() {
        this->count = 0;
        return *this;
    }

    int get() const {
        return this->count;
    }

private:
    int count;
};

int main() {
    Counter c;
    c.init(10).add(5).add(3);
    std::cout << "当前计数：" << c.get() << std::endl;

    c.reset();
    std::cout << "重置后：" << c.get() << std::endl;

    return 0;
}
```

---

## 常见错误与注意事项

1. **在静态成员函数里使用 `this`**

   静态函数不属于某个对象，没有 `this` 指针。

2. **试图修改 `this` 本身**

   `this` 是一个常量指针，你不能让它指向另一个对象：

   ```cpp
   this = nullptr;  // 编译错误
   ```

3. **返回局部对象的引用或指针**

   链式调用返回 `*this` 的前提是对象在调用结束后还存在。如果你在函数里创建了一个局部对象并返回它的引用，就会出问题：

   ```cpp
   Person& create() {
       Person p;
       return p;   // 危险！p 在函数结束时被销毁
   }
   ```

4. **误以为 `this` 是对象本身**

   `this` 是指针，`*this` 才是对象。需要引用时返回 `*this`，需要地址时返回 `this`。

---

## `this` 的类型随成员函数 const 性变化

在普通成员函数中，可以把 `this` 理解为 `ClassName *const`；在 `const` 成员函数中，近似为 `const ClassName *const`。因此 `const` 成员函数不能通过 `this` 修改普通成员。

`this` 指向当前对象，但语言不要求每个对象内部额外存一份 `this` 指针。它是成员函数调用时由实现提供的隐式参数模型。

## 返回 `*this` 支持链式调用

```cpp
class Counter {
public:
    Counter& add(int value)
    {
        count_ += value;
        return *this;
    }
private:
    int count_ = 0;
};

counter.add(1).add(2);
```

返回引用的前提是当前对象在调用链期间仍存活。绝不能返回局部临时对象的引用。

## 捕获 `this` 也有生命周期风险

后续使用 lambda 或异步回调时，保存 `this` 意味着回调借用了当前对象。若回调在对象销毁后才执行，就会悬空。对象方法内部拿到 `this` 并不自动延长对象寿命。

## 自赋值检查只是资源类的一部分

在复制赋值中 `this == &other` 可识别自赋值，但更推荐使用能自然处理异常和自赋值的值成员或 copy-and-swap，而不是到处手写裸资源逻辑。

## 小结

- `this` 是指向当前对象的指针，在非静态成员函数中自动存在。
- 显式使用 `this` 可以解决命名冲突、支持链式调用、传递当前对象。
- `this` 不能被重新赋值，静态成员函数中没有 `this`。

理解了 `this`，就可以更自然地实现修改型成员、链式调用和访问器。下一篇先学习运算符重载和值语义，再讨论什么时候应该使用继承。
