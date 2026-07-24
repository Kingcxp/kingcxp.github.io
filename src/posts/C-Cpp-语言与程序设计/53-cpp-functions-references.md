---
title: C++ 函数接口：重载、默认参数、引用与值类别
date: 2026-07-14
icon: arrows-turn-to-dots
order: 53
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 函数重载
  - 引用
  - 值类别
author: Kingcq
---

C++ 延续了 C 的函数模型，但增加了重载、默认参数、引用和移动相关规则。<span style="color: #409EFF;">它们的共同目标是：让函数接口更准确地表达“需要什么”和“会做什么”。</span>

## 函数重载

同一作用域中可以存在多个同名函数，只要参数列表能区分：

```cpp
#include <iostream>
#include <string>

void print(int value)
{
    std::cout << "int: " << value << '\n';
}

void print(double value)
{
    std::cout << "double: " << value << '\n';
}

void print(const std::string& value)
{
    std::cout << "string: " << value << '\n';
}
```

不能只靠返回类型区分：

```cpp
int parse();
double parse(); // 错误
```

调用 `parse();` 时，返回值甚至可能被忽略，编译器无法选择。

## 重载决议不是“随便挑一个能转的”

编译器比较候选函数所需的转换，选择最佳匹配：

```cpp
void f(int);
void f(double);

f(1);    // 精确匹配 int
f(1.0);  // 精确匹配 double
```

有时两个候选同样合理，会产生歧义：

```cpp
void g(long);
void g(unsigned long);

g(1); // 可能歧义：int 转两者都需要转换
```

解决方法通常是明确参数类型，而不是继续增加更多重载。

## 默认参数

```cpp
#include <string>

void log_message(const std::string& text, int level = 1);
```

调用：

```cpp
log_message("started");
log_message("failed", 3);
```

默认实参通常写在头文件声明中，并从右向左连续提供：

```cpp
void resize(int width, int height = 600, bool keep_ratio = true);
```

默认参数在调用点替换，修改库中的默认值后，已经编译过的调用代码可能仍带着旧值。因此公开库接口要谨慎改变默认参数。

## 按值、按引用还是按指针

### 小型值类型：按值

```cpp
int square(int value);
```

### 需要修改调用者：`T&`

```cpp
void normalize(std::string& text);
```

### 只读且避免复制：`const T&`

```cpp
void print_record(const Record& record);
```

### 可能为空或需要指针语义：`T*`

```cpp
void update_if_present(Config* config);
```

### 接收并取得一份副本：按值

```cpp
class User {
public:
    explicit User(std::string name)
        : name_(std::move(name)) {}
private:
    std::string name_;
};
```

调用者传左值时复制到参数，传临时对象时可移动到参数；函数再把参数移动到成员。这种“按值接收、再移动”适合确实需要拥有一份值的接口。

## 左值与右值先建立直觉

不必一开始背完整分类。先记住：

- <span style="color: #409EFF;">左值</span>通常表示有身份、可以在后续继续找到的对象；
- <span style="color: #409EFF;">右值</span>通常表示临时结果，资源可以被转移。

```cpp
std::string name = "Alice"; // name 是左值
std::string("Bob")          // 临时对象，是右值
```

普通变量即使类型是右值引用，只要它有名字，表达式本身也是左值：

```cpp
std::string&& temp = std::string("hello");
// 表达式 temp 是左值
```

这正是 `std::move` 存在的原因。

## 右值引用与 `std::move`

```cpp
#include <string>
#include <utility>

std::string source = "large text";
std::string target = std::move(source);
```

`std::move` 本身不移动任何数据，它只是把表达式转换成可被移动操作接受的右值类别。真正是否移动由目标类型的移动构造或移动赋值决定。

移动后，`source` 仍然是有效对象，但其具体值通常未指定。可以赋新值、销毁或调用不依赖旧内容的操作，但不要假设它一定为空。

## 返回值通常直接按值

```cpp
std::vector<int> make_sequence(int count)
{
    std::vector<int> result;
    for (int i = 0; i < count; ++i) result.push_back(i);
    return result;
}
```

现代编译器可以进行返回值优化；即使没有完全消除对象，也可以移动。<span style="color: #F56C6C;">不要为了“避免复制”而返回局部对象的引用或指针，那会悬空。</span>

也通常不要写：

```cpp
return std::move(result);
```

它可能妨碍返回值优化。直接 `return result;` 更合适。

## `const` 与返回值

返回普通值时通常不要写 `const`：

```cpp
const std::string make_name(); // 通常没有价值，还可能妨碍移动
```

`const` 更适合限定借用接口：

```cpp
const std::string& name() const noexcept;
```

但返回引用意味着被引用对象必须比调用者使用引用的时间活得更久。

## 悬空引用示例

```cpp
const std::string& bad_name()
{
    std::string local = "Alice";
    return local; // 错误：函数结束后 local 被销毁
}
```

与 C 指针一样，引用也受生命周期约束。<span style="color: #E6A23C;">引用语法更方便，并不会改变对象何时结束生命。</span>

## 接口设计检查表

- 函数需要拥有参数吗？需要则考虑按值；
- 只读借用且对象较大吗？考虑 `const T&`；
- 必须修改且不能为空吗？考虑 `T&`；
- 允许为空吗？考虑指针或显式可选类型；
- 返回的是新值，还是内部对象的借用？
- 借用能保持多久？
- 重载是否会因隐式转换产生歧义？
- 默认参数是否属于稳定接口的一部分？

后面的类章节会把这些规则应用到构造函数、成员函数和访问器中。
