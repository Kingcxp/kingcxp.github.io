---
title: 预处理、头文件与多文件编译
date: 2026-07-02
icon: diagram-project
order: 14
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 预处理器
  - 头文件
  - 链接
author: Kingcq
---

前面已经会定义和调用函数了。真正的项目不可能把所有内容都塞进一个 `.c` 文件，因此这一章把“源文件如何合作”讲清楚。

## 一次构建大致经历什么

输入：

```bash
gcc main.c math_utils.c -o app
```

可以把过程理解为四步：

1. **预处理**：展开 `#include`、宏和条件编译；
2. **编译**：把每个预处理后的源文件翻译成汇编或内部表示；
3. **汇编**：生成目标文件，例如 `main.o`、`math_utils.o`；
4. **链接**：把目标文件和库中的符号连接成可执行文件。

```text
main.c ──预处理/编译/汇编──> main.o ┐
                                      ├─链接─> app
math_utils.c ───────────────> utils.o ┘
```

每个 `.c` 文件连同它包含的头文件形成一个**翻译单元**。编译器通常分别检查它们，链接器最后才处理跨文件引用。

## 声明和定义为什么要分开

声明告诉编译器“这个名字和类型存在”；定义真正提供函数体或对象存储。

```c
// 声明
int add(int a, int b);

// 定义
int add(int a, int b)
{
    return a + b;
}
```

头文件通常放可重复看到的声明，源文件放只能出现一次的定义。

### math_utils.h

```c
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int add(int a, int b);
int clamp(int value, int min_value, int max_value);

#endif
```

### math_utils.c

```c
#include "math_utils.h"

int add(int a, int b)
{
    return a + b;
}

int clamp(int value, int min_value, int max_value)
{
    if (value < min_value) return min_value;
    if (value > max_value) return max_value;
    return value;
}
```

### main.c

```c
#include <stdio.h>
#include "math_utils.h"

int main(void)
{
    printf("%d\n", clamp(add(3, 9), 0, 10));
    return 0;
}
```

编译：

```bash
gcc main.c math_utils.c -std=c17 -Wall -Wextra -Wpedantic -o app
```

把自己的头文件也包含进对应的 `.c` 文件，可以让编译器检查“头文件里的声明”和“实际定义”是否一致。

## 头文件保护解决什么

预处理器的 `#include` 本质上近似于把另一个文件的文本复制进来。如果一个头文件通过不同路径被包含两次，结构体或类型可能被重复定义。

```c
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

/* 头文件内容 */

#endif
```

第一次包含时宏尚未定义，于是进入正文并定义它；第二次再包含时条件不成立，正文被跳过。

`#pragma once` 更简短，也得到主流编译器支持，但它不是 C 标准的一部分。公开、强调可移植性的代码仍常使用 include guard。

## 尖括号和双引号的区别

```c
#include <stdio.h>
#include "math_utils.h"
```

- `<...>` 通常用于系统或工具链提供的头文件；
- `"..."` 通常先在当前项目附近寻找，再搜索系统路径。

具体搜索顺序由编译器选项决定。项目变大后应通过 `-I` 或构建系统配置头文件目录，而不是写一长串 `../../..`。

## 宏不是普通函数

```c
#define SQUARE(x) ((x) * (x))
```

看起来像函数，实际上只是文本替换：

```c
int i = 3;
int result = SQUARE(i++);  // i 可能被递增两次，行为复杂且危险
```

宏参数和整个表达式都要加括号，但括号仍不能解决“参数被求值多次”。能用函数时，优先用函数；C99 以后，小型性能敏感函数还可以考虑 `static inline`。

```c
static inline int square_int(int x)
{
    return x * x;
}
```

## 条件编译的合理用途

```c
#ifdef _WIN32
    /* Windows 实现 */
#else
    /* POSIX 风格实现 */
#endif
```

条件编译适合处理平台差异、可选功能和调试开关。不要把普通业务分支写成预处理分支，否则不同配置下实际上会编译出不同程序，测试难度会迅速增加。

## 常见链接错误怎样理解

### undefined reference / unresolved external symbol

编译器看到了声明，但链接器找不到定义。常见原因：

- 忘记把某个 `.c` 文件加入编译命令；
- 函数名或参数类型不一致；
- 库没有链接；
- C 与 C++ 混合时缺少正确的语言链接声明。

### multiple definition

同一个外部符号被定义了多次。最常见的错误是在头文件里直接写普通全局变量定义：

```c
// 错误：每个包含者都可能生成一个定义
int global_count = 0;
```

更常见的组织方式是：

```c
// counter.h
extern int global_count;
```

```c
// counter.c
int global_count = 0;
```

不过，全局可变状态会让依赖变得隐蔽，应尽量缩小它的使用范围。

## 只编译不链接

```bash
gcc -c main.c -o main.o
gcc -c math_utils.c -o math_utils.o
gcc main.o math_utils.o -o app
```

这解释了构建工具为什么能加速项目：只重新编译发生变化的翻译单元，再重新链接，而不是每次从头处理所有源文件。

## 本章检查清单

- 头文件放声明和类型，普通函数定义放 `.c` 文件；
- 每个头文件有 include guard；
- 对应源文件首先包含自己的头文件；
- 不在头文件中定义可变的外部全局对象；
- 不用宏模拟会重复求值的函数；
- 能区分编译错误和链接错误。

下一篇不急着继续发明工具，而是先认识 C 标准库已经提供的通用能力。理解库函数的契约后，数组、字符串和文件操作会更容易写得可靠。
