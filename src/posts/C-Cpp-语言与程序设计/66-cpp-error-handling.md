---
title: C++ 错误处理：异常、optional 与 variant
date: 2026-07-18
icon: triangle-exclamation
order: 66
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 异常
  - optional
  - variant
author: Kingcq
---

错误处理没有一种方式适合所有场景。C++ 既可以使用返回值，也可以使用异常，还提供 `std::optional`、`std::variant` 等类型明确表达“可能没有结果”或“结果有多种形态”。

## 先区分错误类别

- <span style="color: #F56C6C;">程序员错误</span>：违反内部不变量、下标错误；通常通过断言、测试和修复代码解决；
- <span style="color: #F56C6C;">预期失败</span>：没找到键、用户输入不合法；属于正常控制流；
- <span style="color: #F56C6C;">运行环境失败</span>：文件打不开、分配失败、网络中断；调用者可能恢复或向上报告；
- <span style="color: #F56C6C;">不可恢复失败</span>：核心状态损坏等，可能只能安全终止。

<span style="color: #F56C6C;">错误机制应匹配失败是否常见、是否需要携带信息以及调用层级。</span>

## 异常基础

```cpp
#include <stdexcept>
#include <string>

int parse_age(const std::string& text)
{
    std::size_t used = 0;
    int value = std::stoi(text, &used);

    if (used != text.size()) {
        throw std::invalid_argument("age contains extra characters");
    }
    if (value < 0 || value > 150) {
        throw std::out_of_range("age is outside 0..150");
    }
    return value;
}
```

捕获：

```cpp
try {
    int age = parse_age(input);
    use(age);
} catch (const std::invalid_argument& error) {
    std::cerr << "输入无效：" << error.what() << '\n';
} catch (const std::out_of_range& error) {
    std::cerr << "数值越界：" << error.what() << '\n';
}
```

通常按 `const` 引用捕获，避免切片和复制。

## 栈展开与 RAII

异常传播时，已经构造完成的局部对象会按逆序析构：

```cpp
void process(const std::string& path)
{
    std::ifstream file(path); // 自动管理文件
    std::vector<int> values;  // 自动管理内存
    // 后续抛出异常时，file 和 values 仍会析构
}
```

这就是异常与 RAII 配合的关键。若资源只保存在裸指针中，异常可能绕过手写清理。

## 不要什么都 `catch (...)`

```cpp
try {
    work();
} catch (...) {
    // 什么也不做
}
```

吞掉所有异常会隐藏错误并让程序继续处于未知状态。<span style="color: #E6A23C;">只有在明确边界（线程入口、日志边界、程序顶层）进行记录、转换或安全终止时才合理。</span>

## `noexcept`

```cpp
void swap(Buffer& other) noexcept;
```

`noexcept` 表示函数承诺不让异常逃出。若实际抛出，程序会调用 `std::terminate`。

移动构造常标记 `noexcept`，因为标准容器在扩容时更愿意使用不会抛出的移动操作，以维护强异常保证。

不要为了性能盲目标记；只有函数真的能履行承诺时才写。

## `std::optional`

“查找可能没有结果”通常不需要异常：

```cpp
#include <optional>
#include <string>

std::optional<int> find_score(const std::string& name)
{
    if (name == "Alice") return 95;
    return std::nullopt;
}
```

使用：

```cpp
if (auto score = find_score("Alice")) {
    std::cout << *score << '\n';
} else {
    std::cout << "not found\n";
}
```

`optional<T>` 表示“有一个 `T` 或者没有”。它不携带详细失败原因。

## `std::variant`

一个值可能是几种明确类型之一：

```cpp
#include <string>
#include <variant>

using ParseResult = std::variant<int, std::string>;

ParseResult parse_number(const std::string& text)
{
    try {
        return std::stoi(text);
    } catch (const std::exception& error) {
        return std::string(error.what());
    }
}
```

访问：

```cpp
std::visit([](const auto& value) {
    std::cout << value << '\n';
}, result);
```

这里用字符串作为错误只是教学简化。更好的设计可以定义结构化错误类型。

## C++17 没有标准 `expected`

“成功值或错误值”比 `variant` 更专门。C++23 提供 `std::expected`，但本教程基线是 C++17，可以：

- 使用项目自定义 `Result<T, E>`；
- 使用成熟第三方实现；
- 在简单场景用返回状态加输出参数；
- 或用 `variant<T, Error>` 明确表达。

不要假装所有编译器的 C++17 环境都有 `std::expected`。

## 选择方式

| 场景 | 常见选择 |
| :-- | :-- |
| 常见且无详细原因的“没有” | `optional` |
| 常见且需要错误详情 | 结果类型 / `variant` |
| 深层调用中罕见失败，无法就地处理 | 异常 |
| C 接口或禁用异常环境 | 状态码 + 输出参数 |
| 程序员错误 | 断言、测试、修复 |

## 异常安全保证

常见级别：

- <span style="color: #67C23A;">无抛出保证</span>：操作不抛异常；
- <span style="color: #67C23A;">强保证</span>：失败时对象状态不变；
- <span style="color: #67C23A;">基本保证</span>：失败后对象仍有效，但状态可能改变；
- <span style="color: #67C23A;">无保证</span>：失败后状态无法可靠使用。

“先构造临时结果，成功后再交换”是实现强保证的常见策略。

## 错误边界

底层函数应提供可组合的错误信息；应用最外层负责把它翻译成人类可读消息并决定退出状态：

```cpp
#include <exception>
#include <iostream>

int run_application()
{
    // 真正程序的顶层流程
    return 0;
}

int main()
{
    try {
        return run_application();
    } catch (const std::exception& error) {
        std::cerr << "fatal: " << error.what() << '\n';
        return 1;
    }
}
```

最外层捕获不是为了假装恢复，而是确保记录原因并有控制地结束。

下一篇用任务管理器综合类、STL、lambda、文件和错误处理，并通过“先解析后提交”实践异常安全和强错误保证。
