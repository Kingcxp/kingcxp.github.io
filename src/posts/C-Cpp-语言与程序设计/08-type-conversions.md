---
title: 类型转换、整数提升与数值边界
date: 2026-07-01
icon: shuffle
order: 8
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 类型转换
  - 整数提升
  - 数值安全
author: Kingcq
---

前一篇介绍了运算符，但表达式的结果不仅取决于“做什么运算”，还取决于<span style="color: #409EFF;">参与运算的类型</span>。很多初学者看到的怪现象——负数突然变成很大的正数、小数被截断、两个小整数相加却先变成 `int`——都来自类型转换规则。

## 学习目标

读完本篇，你应该能够：

- 区分隐式转换和显式转换；
- 理解整数提升与常见算术转换的大致规则；
- 发现有符号数和无符号数混合比较的风险；
- 判断窄化转换、浮点转整数和整数溢出的危险；
- 在 C 与 C++ 中选择更清楚的转换写法。

## 为什么编译器需要转换类型

CPU 的加法指令不能直接理解“一个 `short` 加一个 `double`”这种抽象描述。编译器必须先把操作数转换成某种共同类型，再执行运算。

```c
int count = 3;
double price = 2.5;
double total = count * price;
```

这里 `count` 会先转换为 `double`，然后进行浮点乘法。这个转换是编译器自动完成的，因此叫<span style="color: #E6A23C;">隐式转换</span>。

## 赋值时发生的转换

赋值表达式右侧的值会尝试转换成左侧对象的类型：

```c
int a = 3.9;       // 结果是 3，小数部分被截断
float b = 16777217; // 常见 IEEE 754 float 无法精确保存这个整数
unsigned c = -1;   // 转成一个很大的无符号值
```

转换成功不代表结果符合你的意图。<span style="color: #67C23A;">编译器通常只能检查“这种转换是否允许”，无法知道业务上是否合理。</span>

:::warning
把浮点数转换成整数时会向零截断。若原值超出目标整数类型能表示的范围，结果可能不可靠，不能把它当作自动的“夹紧”。
:::

## 整数提升

在许多算术表达式中，`char`、`signed char`、`unsigned char`、`short` 和 `unsigned short` 不会直接以自己的类型计算，而会先进行<span style="color: #409EFF;">整数提升</span>。

常见情况是提升为 `int`：

```c
#include <stdio.h>

int main(void)
{
    unsigned char a = 200;
    unsigned char b = 100;

    printf("%zu\n", sizeof(a));       // 常见结果：1
    printf("%zu\n", sizeof(a + b));   // 常见结果：4，因为先提升为 int
    printf("%d\n", a + b);            // 300
    return 0;
}
```

因此，`unsigned char` 相加不一定立即按 8 位回绕；通常会先提升为 `int`，真正赋回较小类型时才发生截断或模运算。

## 常见算术转换

当两个算术操作数类型不同，编译器会寻找共同类型。可以先记住一个简化顺序：

1. 有 `long double`，通常都转成 `long double`；
2. 否则有 `double`，通常都转成 `double`；
3. 否则有 `float`，通常都转成 `float`；
4. 剩下的整数先做整数提升，再根据位宽和符号性决定共同整数类型。

真正麻烦的是最后一项，尤其是有符号和无符号类型混合。

## 有符号与无符号混合

```c
#include <stdio.h>

int main(void)
{
    int debt = -1;
    unsigned int balance = 1;

    if (debt < balance) {
        puts("debt 更小");
    } else {
        puts("结果与直觉不同");
    }
    return 0;
}
```

在常见平台上，`debt` 会转换成 `unsigned int`。`-1` 转换后成为该类型可表示的最大值，因此条件可能为假。

正确做法不是背诵某个结果，而是避免让“负值”和“无符号数量”直接混合：

```c
if (debt < 0 || (unsigned int)debt < balance) {
    /* 先处理负值，再做明确转换 */
}
```

但更好的设计往往是统一表示方式。例如如果值可能为负，就不要随意把另一边改成无符号类型。

## `size_t` 为什么经常制造警告

<span style="color: #E6A23C;">`sizeof`、字符串长度和容器大小通常使用 `size_t`。</span>它是无符号整数类型，具体位宽由平台决定。

```c
size_t length = strlen(text);
```

下面的倒序循环有错误：

```c
for (size_t i = length - 1; i >= 0; --i) {
    /* i 永远不会小于 0 */
}
```

无符号数减到 0 后继续递减会回绕成一个很大的值。可以改成：

```c
for (size_t i = length; i > 0; --i) {
    size_t index = i - 1;
    /* 使用 index */
}
```

## 整数溢出不是同一件事

### 无符号整数

无符号整数按模运算回绕：

```c
unsigned char x = 255;
x = (unsigned char)(x + 1); // 常见 8 位实现中得到 0
```

这属于语言定义的行为，但不一定符合业务需要。

### 有符号整数

<span style="color: #F56C6C;">有符号整数溢出是未定义行为：</span>

```c
int x = INT_MAX;
x = x + 1; // 未定义行为
```

编译器可以假设合法程序不会发生这种情况，并据此优化。因此不能把它简单理解成“肯定绕回最小值”。

进行可能溢出的加法前，先检查边界：

```c
#include <limits.h>
#include <stdbool.h>

bool add_int(int a, int b, int *result)
{
    if ((b > 0 && a > INT_MAX - b) ||
        (b < 0 && a < INT_MIN - b)) {
        return false;
    }
    *result = a + b;
    return true;
}
```

## 窄化转换

从表示范围更大的类型转到更小类型，称为窄化转换：

```c
long long big = 10000000000LL;
int small = (int)big;
```

即使编译器允许，结果也可能与原值不同。不要把强制转换当成“让警告消失”的工具；它只是告诉编译器“我明确要求转换”，不会自动证明安全。

## C 中的显式转换

C 使用强制类型转换语法：

```c
double average = (double)sum / count;
```

这类转换适合表达“我希望使用浮点除法”。但对指针和较窄整数类型的转换要格外谨慎。

## C++ 中更明确的转换

C++ 提供了几类命名转换：

```cpp
int count = 3;
double average = static_cast<double>(sum) / count;
```

- `static_cast`：常规且可检查的数值、继承层次转换；
- `const_cast`：改变 `const`/`volatile` 限定；
- `dynamic_cast`：在多态继承层次中进行运行时检查；
- `reinterpret_cast`：低层重新解释，风险最高。

入门阶段最常用的是 `static_cast`。不要为了显得“高级”而滥用其他转换。

## 浮点数的精度问题

`float` 和 `double` 只能精确表示有限范围内的一部分实数。十进制的 `0.1` 通常不能被二进制浮点精确表示：

```c
#include <math.h>
#include <stdio.h>

int main(void)
{
    double value = 0.1 + 0.2;
    printf("%.17f\n", value);

    if (fabs(value - 0.3) < 1e-12) {
        puts("在允许误差内相等");
    }
    return 0;
}
```

误差阈值应根据数值尺度和业务要求设计，不能机械地对所有问题使用同一个常数。

## 编译器警告应该怎样看

建议继续使用：

```bash
gcc demo.c -std=c17 -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion
```

`-Wconversion` 和 `-Wsign-conversion` 可能产生较多提示，但它们很适合专门练习类型转换。真实项目中是否长期启用，要结合代码风格和噪声程度决定。

## 检查清单

看到混合类型表达式时，依次问：

1. 每个操作数原本是什么类型？
2. 是否先发生整数提升？
3. 最终共同类型是什么？
4. 结果再赋值时是否窄化？
5. 是否可能溢出、截断或失去精度？
6. 是否把有符号和无符号值混在了一起？

下一篇进入分支结构。理解了转换规则后，你会更容易判断一个条件表达式究竟在比较什么。
