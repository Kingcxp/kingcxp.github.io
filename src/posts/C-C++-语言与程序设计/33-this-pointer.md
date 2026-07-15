---
title: this 指针
date: 2026-07-15
icon: hand-point-right
order: 34
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

## 小结

- `this` 是指向当前对象的指针，在非静态成员函数中自动存在。
- 显式使用 `this` 可以解决命名冲突、支持链式调用、传递当前对象。
- `this` 不能被重新赋值，静态成员函数中没有 `this`。

理解了 `this`，类里的很多行为就豁然开朗了。接下来我们进入一个更宏大的主题——继承。

**下一篇预告：《继承与派生》。**
