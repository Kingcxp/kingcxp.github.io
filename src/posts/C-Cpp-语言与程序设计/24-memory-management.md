---
title: 动态内存分配
date: 2026-07-06
icon: memory
order: 24
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 动态内存
  - malloc
  - free
author: Kingcq
---

## 学习目标

学完本篇，你会理解：

- 为什么有时需要在运行时申请内存。
- `malloc`、`calloc`、`realloc`、`free` 的用法和区别。
- 为什么要检查 `malloc` 的返回值。
- 什么是内存泄漏，以及如何避免。
- C++ 中 `new` 和 `delete` 的基本用法。

## 为什么需要动态内存

之前定义数组时，长度必须是编译时确定的常量：

```c
int arr[100];  // 长度固定为 100
```

但很多时候，程序运行前根本不知道要存多少数据。用户可能输入 10 个数，也可能输入 10000 个。如果写死一个很大的数组，浪费内存；写小了，又放不下。

动态内存让我们在程序运行时向操作系统申请需要的大小，用完再归还。

### 自动对象与动态分配对象

第 5 篇已经区分了语言保证与常见实现。这里再次强调：

- 具有自动存储期的局部对象会在进入和离开代码块时自动开始、结束生命周期；在常见实现中，它们可能位于线程调用栈，也可能被编译器放进寄存器或直接优化掉；
- `malloc` 从动态分配存储中取得一段原始内存。常见运行库把这类区域称为堆，但 C 标准并不规定操作系统必须使用某种具体“堆区”布局；
- 自动对象并不都要求大小在编译期确定。C17 的可变长数组若实现支持，其长度可在运行时确定，但仍具有自动存储期；
- 调用栈通常容量有限，大对象和深递归可能耗尽它；动态分配也可能因容量、碎片或系统限制而失败。

```mermaid
graph LR
    A[进入代码块] --> B[自动对象开始生命周期]
    C[malloc] --> D[取得动态存储]
    B --> E[离开代码块时自动结束]
    D --> F[调用 free 后归还]
```

因此，选择动态分配的根本理由不是“堆一定更大或更慢”，而是对象的大小、数量或生命周期需要在运行时决定，并且可能跨越创建它的代码块。代价是必须明确所有权并处理分配失败。

## malloc：申请内存

`malloc` 是 memory allocate 的缩写，用来申请指定字节数的内存：

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *arr = malloc(n * sizeof(int));

    if (arr == NULL) {
        printf("内存申请失败\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        arr[i] = i + 1;
    }

    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }

    free(arr);  // 用完释放
    return 0;
}
```

:::tip 为什么用 sizeof
`malloc(n * sizeof(int))` 表示申请能放 `n` 个 `int` 的字节数。不要手写 `n * 4`，因为不同平台 `int` 大小可能不同。用 `sizeof` 更健壮。
:::

`malloc` 返回 `void *`。在 C 中它可以自动转换为对象指针，因此不需要也不建议写强制类型转换；强转反而可能掩盖忘记包含 `<stdlib.h>` 的错误。C++ 代码应使用 C++ 的对象与资源管理方式，而不是为了“兼容 C++”给 C 的 `malloc` 加强转。

## calloc：申请并清零

`calloc` 和 `malloc` 很像，但会帮你把内存全部初始化为 0：

```c
int *arr = calloc(n, sizeof(int));
```

参数是两个：`元素个数` 和 `每个元素的大小`。适合需要初始化为 0 的场景。

## realloc：调整大小

如果你一开始申请了 5 个整数，后来想扩展到 10 个，用 `realloc`：

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *arr = malloc(n * sizeof(int));

    if (arr == NULL) {
        return 1;
    }

    // 扩容到 10 个 int
    int *tmp = realloc(arr, 10 * sizeof(int));
    if (tmp != NULL) {
        arr = tmp;
    } else {
        // 扩容失败，原来的 arr 仍然有效
        free(arr);
        return 1;
    }

    free(arr);
    return 0;
}
```

:::tip realloc 的返回值
`realloc` 失败时返回 `NULL`，但原内存不会被释放。所以不要直接把返回值赋给原指针，否则一旦失败就丢了原地址。先用临时变量判断。
:::

## free：归还内存

`free` 把 `malloc` 申请的内存还给系统。没有 `free` 的内存会一直占用，直到程序结束。长期运行的程序如果不断申请却不释放，就会造成**内存泄漏**。

```c
int *p = malloc(sizeof(int));
*p = 10;
free(p);
p = NULL;  // 好习惯，防止野指针
```

## 检查返回值

内存不是无限的，`malloc` 可能失败并返回 `NULL`。养成检查的习惯：

```c
int *p = malloc(sizeof(int));
if (p == NULL) {
    // 处理失败
}
```

## 内存泄漏示例

下面这段代码每次循环都申请内存，但从不释放：

```c
for (int i = 0; i < 100000; i++) {
    int *p = malloc(1024);
    // 没有 free(p)
}
```

如果 `p` 之后不会再被用到，就要在循环内 `free(p)`。否则内存会被一点点吃光。

## C++ 中的 new 和 delete

C++ 提供了另一套动态内存机制：

```cpp
int *p = new int;       // 申请一个 int
*p = 10;
delete p;               // 释放

int *arr = new int[10]; // 申请数组
delete[] arr;           // 释放数组
```

:::tip C 和 C++ 不要混用
`malloc` 申请的内存用 `free` 释放，`new` 申请的用 `delete` 释放。不要交叉使用，否则行为未定义。
:::

本系列先讲 C，所以 C++ 部分了解即可，后面面向对象阶段会再深入。

## 动态数组示例

下面是一个完整的动态数组示例，用户可以输入元素个数并填充数组：

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    printf("请输入元素个数：");
    scanf("%d", &n);

    int *arr = malloc(n * sizeof(int));
    if (arr == NULL) {
        printf("内存不足\n");
        return 1;
    }

    printf("请输入 %d 个整数：\n", n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

    printf("你输入的是：");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }

    free(arr);
    arr = NULL;

    return 0;
}
```

## 常见错误

1. **malloc 后忘记 free**。导致内存泄漏。
2. **free 后继续使用指针**。造成悬空指针，行为未定义。
3. **free 非 malloc 申请的内存**。比如 `free(&a);` 会崩溃。
4. **多次 free 同一块内存**。也会崩溃。

## 动态内存接口首先要设计所有权

下面两个函数虽然都返回指针，语义可能完全不同：

```c
char *make_name(void);          // 调用者是否要 free？
const char *get_status_text(void); // 指针能保存多久？
```

函数名、返回类型和注释应明确：

- 返回的是新分配所有权，还是借用内部存储；
- 调用者用哪个函数释放；
- 返回指针在什么操作后失效。

## 推荐的大小写法

```c
int *data = malloc(count * sizeof *data);
```

使用 `sizeof *data`，即使以后把指针改成其他元素类型，也不会忘记同步修改类型名。分配前还应检查乘法是否溢出。

## `calloc` 的“清零”不等于所有类型语义初始化

`calloc` 把所有字节置零。对常见整数会得到 0，但 C 标准并不把“全零字节”普遍保证为所有指针和浮点类型的正确零值表示。写通用底层代码时，应区分字节清零和逐元素赋值。

## C++ 中不要把 `new` 当作默认动态数组

学习 `new[]` / `delete[]` 有助于看懂旧代码和对象构造，但新代码的动态数组优先使用 `std::vector<T>`，字符串优先 `std::string`，唯一动态对象优先 `std::make_unique<T>()`。它们在异常和提前返回路径上也能自动清理。

## 小结

- 动态内存让程序在运行时申请所需空间。
- `malloc` 申请未初始化内存，`calloc` 申请并清零，`realloc` 调整大小，`free` 释放。
- 每次申请都要检查是否成功，用完要及时释放。
- C++ 用 `new`/`delete`，不要和 C 的内存函数混用。

## 下一篇预告

下一篇《内存安全：越界、泄漏与悬空指针》会把动态内存的错误路径集中讲清楚，并介绍如何用 Sanitizer 尽早发现问题。
