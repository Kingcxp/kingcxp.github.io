---
title: Lambda、可调用对象与回调
date: 2026-07-18
icon: bolt
order: 65
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - Lambda
  - 回调
  - std::function
author: Kingcq
---

C 的函数指针只能表示普通函数地址。C++ 中，普通函数、函数对象、lambda 和成员函数包装都可以成为“可调用对象”，让行为更容易作为参数传递。

## 最小 lambda

```cpp
const auto square = [](int value) {
    return value * value;
};

int result = square(5);
```

结构：

```text
[捕获列表](参数列表) -> 返回类型 {
    函数体
}
```

返回类型通常可推导，因此省略 `-> int`。

## 与标准算法组合

```cpp
std::sort(users.begin(), users.end(),
          [](const User& a, const User& b) {
              return a.score > b.score;
          });
```

比较逻辑只在这一处使用时，lambda 比单独命名一个全局函数更靠近调用位置。

## 按值捕获

```cpp
int threshold = 60;
auto passed = [threshold](int score) {
    return score >= threshold;
};
```

创建 lambda 时复制 `threshold` 的当前值。之后外部变量改变，不影响这份副本。

默认情况下，按值捕获的成员在 lambda 的 `operator()` 中视为只读。确需修改内部副本，可以写 `mutable`：

```cpp
auto counter = [count = 0]() mutable {
    return ++count;
};
```

这修改的是 lambda 自己的状态，不是外部变量。

## 按引用捕获

```cpp
int sum = 0;
std::for_each(values.begin(), values.end(),
              [&sum](int value) { sum += value; });
```

lambda 只是借用 `sum`。如果 lambda 活得比 `sum` 久，引用会悬空。

危险示例：

```cpp
auto make_bad_callback()
{
    int local = 42;
    return [&local] { return local; }; // 返回后 local 已销毁
}
```

异步任务、事件回调和保存到容器中的 lambda 特别容易出现这种生命周期错误。

## 捕获 `this`

成员函数中：

```cpp
class Worker {
public:
    auto callback()
    {
        return [this] { run(); };
    }
private:
    void run();
};
```

回调保存的是当前对象指针，不会自动延长对象生命。如果对象销毁后回调仍被调用，就会悬空。

可能的方案：

- 保证回调不超过对象生命周期；
- 捕获所需值而不是整个对象；
- 对共享拥有对象使用 `weak_ptr` 检查；
- 在析构时注销回调。

## 初始化捕获与移动

```cpp
#include <memory>

std::unique_ptr<int> value = std::make_unique<int>(42);
auto task = [owned = std::move(value)] {
    return *owned;
};
```

lambda 取得资源所有权，因此通常变成不可复制但可移动的对象。

## 函数对象

```cpp
struct GreaterThan {
    int threshold;

    bool operator()(int value) const
    {
        return value > threshold;
    }
};

GreaterThan predicate{10};
bool result = predicate(20);
```

lambda 本质上会生成一个未命名的函数对象类型。命名函数对象适合逻辑需要复用、测试或拥有较多状态的场景。

## `std::function`

```cpp
#include <functional>

std::function<int(int)> operation = [](int x) { return x * 2; };
```

`std::function` 可以统一保存签名兼容的多种可调用对象，代价是类型擦除、可能的动态分配和间接调用。

模板参数通常更高效：

```cpp
template <typename F>
void repeat(int count, F action)
{
    for (int i = 0; i < count; ++i) action(i);
}
```

需要长期存储、运行时替换不同回调类型时，`std::function` 更方便。

## 调用成员函数

成员函数指针语法较复杂，标准工具常用 `std::invoke` 统一调用：

```cpp
#include <functional>

std::invoke(&Widget::update, widget, 10);
```

入门阶段不必大量手写成员函数指针，先理解可调用对象概念即可。

## 回调接口的所有权问题

设计回调 API 时明确：

- 回调是立即调用还是保存到以后；
- 保存时复制还是移动；
- 回调能否为空；
- 回调抛出异常怎么办；
- 捕获对象需要活多久；
- 多线程调用是否安全。

“能调用”只是类型层面的第一步，生命周期和执行时机才是实际工程中的难点。

回调可能失败，文件和解析也可能失败。下一篇系统比较异常、`std::optional`、`std::variant` 和状态返回，选择与错误性质相匹配的表达方式。
