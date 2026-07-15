---
title: 函数定义、调用与返回值
date: 2026-07-03
icon: gears
order: 9
category:
  - C/C++ 语言与程序设计
tag:
  - 函数
  - 返回值
author: Kingcq
---

## 引入：为什么需要函数

到现在，你已经能写一些包含变量、分支、循环的小程序了。可一旦程序变长，所有代码都堆在 `main` 函数里，就会像把所有东西塞进一个抽屉——找起来头疼，改起来更头疼。

函数（function）就是帮你“分门别类”的工具。把一段完成特定任务的代码取个名字，之后想用时直接叫这个名字就行。它的好处很明显：

- **减少重复代码**：同样的逻辑不用复制粘贴很多遍。
- **结构清晰**：大问题拆成小问题，每个函数负责一块。
- **方便调试**：哪个功能出错，定位到对应函数即可。

比如，你想多次计算两个数的和，与其每次重写加法逻辑，不如写一个“加法函数”。

## 函数的定义、声明与调用

一个函数通常包含三个要素：**返回类型**、**函数名**、**参数列表**。

最简单的函数定义长这样：

```c
#include <stdio.h>

// 函数定义：返回类型 int，函数名 add，参数是 a 和 b
int add(int a, int b)
{
    return a + b;
}

int main(void)
{
    int result = add(3, 5);  // 函数调用
    printf("3 + 5 = %d\n", result);
    return 0;
}
```

编译运行后输出：

```text
3 + 5 = 8
```

这里 `add(3, 5)` 是**调用**，括号里的 `3` 和 `5` 会传给函数里的 `a` 和 `b`，函数内部计算后通过 `return` 把结果返回来。

:::tip 函数名和变量名的规则类似
函数名只能由字母、数字、下划线组成，不能以数字开头，也不能和 C 语言关键字重名。养成“见名知意”的习惯，比如 `add`、`print_menu`、`is_even` 都很好。
:::

## return 与返回值

`return` 有两层含义：

1. 把结果交给调用它的地方；
2. 结束当前函数的执行。

如果函数返回类型不是 `void`，就必须写 `return` 语句，且返回值的类型最好和声明一致。

```c
#include <stdio.h>

int max(int a, int b)
{
    if (a > b) {
        return a;
    } else {
        return b;
    }
}

int main(void)
{
    printf("较大值：%d\n", max(10, 20));
    return 0;
}
```

一个函数里也可以有多个 `return`，但通常保持“单一出口”会让逻辑更清晰。

:::tip main 函数的参数
你可能看到过 `main(void)` 和 `main()` 两种写法。在 `C` 语言中，`main(void)` 明确表示"不接受任何参数"，而 `main()` 表示"参数个数未指定"。为了代码清晰，推荐写 `int main(void)`。在 `C++` 中两者都表示没有参数。
:::

## void 函数

有些函数只是执行任务，不需要返回结果，比如打印菜单、输出提示。这时返回类型写成 `void`。

```c
#include <stdio.h>

void print_hello(void)
{
    printf("你好，欢迎学习 C 语言！\n");
}

int main(void)
{
    print_hello();  // 调用 void 函数，不需要接收返回值
    return 0;
}
```

:::tip void 函数里的 return
`void` 函数里可以写 `return;` 来提前结束，但不能返回具体值。多数情况下我们省略不写。
:::

## 函数原型

在 C 语言中，编译器是从上到下读取代码的。如果 `main` 写在某个函数前面，调用时编译器还不认识它，就会报错。

解决方法有两种：

1. 把函数定义写在 `main` 前面；
2. 在 `main` 前面加一个**函数原型**（也叫函数声明）。

函数原型只写函数头，末尾加分号：

```c
#include <stdio.h>

// 函数原型
int add(int a, int b);

int main(void)
{
    printf("%d\n", add(2, 3));
    return 0;
}

// 函数定义
int add(int a, int b)
{
    return a + b;
}
```

实际项目中更推荐第二种做法：把函数原型集中放在头文件（`.h`）里，函数实现放在另一个 `.c` 文件里。这样代码更有条理，也便于多人协作。

## 把函数拆到多个文件的基本思路

当程序变大后，一个文件会装不下。常见的做法是：

- `math_utils.h`：放函数原型；
- `math_utils.c`：放函数的具体实现；
- `main.c`：写 `main` 函数，并 `#include "math_utils.h"`。

```c
// math_utils.h
#ifndef MATH_UTILS_H
#define MATH_UTILS_H
int add(int a, int b);
#endif
```

```c
// math_utils.c
#include "math_utils.h"
int add(int a, int b)
{
    return a + b;
}
```

```c
// main.c
#include <stdio.h>
#include "math_utils.h"

int main(void)
{
    printf("%d\n", add(3, 4));
    return 0;
}
```

编译命令通常是：

```bash
gcc main.c math_utils.c -o main
```

现在你只需要知道“可以这样组织代码”即可，后面我们会专门讲多文件编程和头文件保护。

## 常见错误与注意事项

1. **忘记写返回类型**：旧编译器可能默认当作 `int`，但现代 C 不允许，建议始终写明。
2. **返回值类型不匹配**：比如函数声明为 `int`，却 `return 3.14;`，可能会收到警告。
3. **函数原型和定义不一致**：参数类型或返回类型对不上，编译器会报错。
4. **调用时参数个数不对**：`add(3)` 或 `add(3, 4, 5)` 都不行。
5. **`main` 函数里的 `return 0;`**：表示程序正常结束，这是个好习惯。

## 小结与下一篇预告

今天我们学习了函数的核心概念：为什么需要函数、如何定义和调用函数、`return` 和 `void` 的用法，以及函数原型的作用。函数是 C 语言组织代码的基本单元，掌握它之后，你就可以写出结构更清晰的程序了。

下一篇我们会聊**函数的参数传递机制**，以及**局部变量和全局变量**的区别——这对理解 C 语言的作用域和内存管理非常关键。
