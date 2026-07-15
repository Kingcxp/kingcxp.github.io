---
title: 动态内存分配
date: 2026-07-07
icon: memory
order: 18
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

### 栈与堆：两种内存区域

在学习动态内存之前，先分清两种内存区域：

- **栈（Stack）**：用来存放局部变量和函数调用信息。由编译器自动管理，分配和释放速度极快。但空间有限（通常几 MB），且大小在编译时确定。
- **堆（Heap）**：用来存放程序运行时动态分配的内存。由程序员手动管理（`malloc`/`free`），空间大得多（取决于系统可用内存），但速度比栈慢，且需要手动释放。

```mermaid
graph LR
    A[代码区] --> B[栈区<br/>局部变量、函数调用]
    B --> C[堆区<br/>动态分配的内存]
    C --> D[全局/静态区]
```

你可以这样理解：栈是"自动管理的小仓库"，堆是"手动管理的大仓库"。局部变量自动放在栈上，而 `malloc` 申请的内存来自堆。

## malloc：申请内存

`malloc` 是 memory allocate 的缩写，用来申请指定字节数的内存：

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *arr = (int *)malloc(n * sizeof(int));

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

`malloc` 返回的是 `void *`，在 C 语言中可以隐式转换为其他指针类型，但显式写成 `(int *)malloc(...)` 更清晰，也兼容 C++。

## calloc：申请并清零

`calloc` 和 `malloc` 很像，但会帮你把内存全部初始化为 0：

```c
int *arr = (int *)calloc(n, sizeof(int));
```

参数是两个：`元素个数` 和 `每个元素的大小`。适合需要初始化为 0 的场景。

## realloc：调整大小

如果你一开始申请了 5 个整数，后来想扩展到 10 个，用 `realloc`：

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *arr = (int *)malloc(n * sizeof(int));

    if (arr == NULL) {
        return 1;
    }

    // 扩容到 10 个 int
    int *tmp = (int *)realloc(arr, 10 * sizeof(int));
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
int *p = (int *)malloc(sizeof(int));
*p = 10;
free(p);
p = NULL;  // 好习惯，防止野指针
```

## 检查返回值

内存不是无限的，`malloc` 可能失败并返回 `NULL`。养成检查的习惯：

```c
int *p = (int *)malloc(sizeof(int));
if (p == NULL) {
    // 处理失败
}
```

## 内存泄漏示例

下面这段代码每次循环都申请内存，但从不释放：

```c
for (int i = 0; i < 100000; i++) {
    int *p = (int *)malloc(1024);
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

    int *arr = (int *)malloc(n * sizeof(int));
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

## 小结

- 动态内存让程序在运行时申请所需空间。
- `malloc` 申请未初始化内存，`calloc` 申请并清零，`realloc` 调整大小，`free` 释放。
- 每次申请都要检查是否成功，用完要及时释放。
- C++ 用 `new`/`delete`，不要和 C 的内存函数混用。

## 下一篇预告

下一篇《结构体与自定义数据类型》会讲如何把不同类型的数据打包成一个整体，让代码更有组织性。
