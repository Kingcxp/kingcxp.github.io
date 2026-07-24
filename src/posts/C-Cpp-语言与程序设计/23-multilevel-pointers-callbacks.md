---
title: 二级指针、函数指针与回调
date: 2026-07-05
icon: arrows-to-dot
order: 23
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 指针
  - 二级指针
  - 函数指针
  - 回调
author: Kingcq
---

<span style="color: #409EFF;">前几章已经知道：指针变量保存对象地址，解引用可以访问那个对象。</span>接下来要处理两个常见问题：函数怎样修改调用者的指针，以及代码怎样把“要执行的函数”作为数据传递。

## 指针本身也是变量

```c
int value = 10;
int *p = &value;
int **pp = &p;
```

可以画成：

```text
pp ──指向──> p ──指向──> value
               地址          10
```

- `p` 的类型是 `int *`；
- `&p` 的类型是 `int **`；
- `*pp` 得到 `p`；
- `**pp` 得到 `value`。

星号数量不是“难度等级”，而是在描述每次解引用后得到什么类型。

## 为什么修改调用者的指针需要二级指针

下面的函数不能让调用者的 `p` 指向新内存：

```c
void allocate_wrong(int *p)
{
    p = malloc(sizeof *p);
}
```

参数仍然按值传递。函数只改了自己那份指针副本。要修改调用者的指针变量，需要把“指针变量的地址”传进去：

```c
#include <stdbool.h>
#include <stdlib.h>

bool allocate_int(int **out)
{
    if (out == NULL) return false;

    int *new_value = malloc(sizeof *new_value);
    if (new_value == NULL) return false;

    *new_value = 0;
    *out = new_value;
    return true;
}

int main(void)
{
    int *p = NULL;
    if (!allocate_int(&p)) return 1;

    *p = 42;
    free(p);
    return 0;
}
```

`out` 常用来表示输出参数。<span style="color: #F56C6C;">函数只有成功时才修改 `*out`，可以让失败路径更容易推理。</span>

## 二级指针不等于二维数组

`int **` 通常表示“指向 `int *` 的指针”，它可能指向一组行指针：

```text
rows -> [row0][row1][row2]
          |     |     |
          v     v     v
        若干独立分配的 int 数组
```

而真正的二维数组 `int matrix[3][4]` 是一整块连续存储。它在表达式中转换为“指向一行的指针”，类型是 `int (*)[4]`，不是 `int **`。

```c
void print_matrix(size_t rows, int matrix[][4]);
// 等价参数类型：int (*matrix)[4]
```

<span style="color: #F56C6C;">把二维数组强行转换成 `int **` 再访问，会用错误方式解释内存。</span>

## 指针数组与数组指针

```c
int *pointers[4];   // 数组，包含 4 个 int *
int (*row)[4];      // 指针，指向“包含 4 个 int 的数组”
```

判断时从变量名向外读：

- `pointers` 先和 `[]` 结合，所以它首先是数组；
- `row` 被括号包住，先和 `*` 结合，所以它首先是指针。

## 函数也有地址

```c
int add(int a, int b)
{
    return a + b;
}

int (*operation)(int, int) = add;
int result = operation(3, 4);
```

`operation` 是函数指针：它指向一个“接收两个 `int`、返回 `int`”的函数。

通过 `typedef` 可以降低阅读负担：

```c
typedef int (*BinaryOperation)(int, int);

int calculate(int a, int b, BinaryOperation op)
{
    return op(a, b);
}
```

## 回调：把策略交给调用者

```c
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>

typedef bool (*Predicate)(int value);

void print_if(const int *data, size_t length, Predicate predicate)
{
    if (data == NULL || predicate == NULL) return;

    for (size_t i = 0; i < length; i++) {
        if (predicate(data[i])) {
            printf("%d ", data[i]);
        }
    }
    putchar('\n');
}

bool is_even(int value)
{
    return value % 2 == 0;
}
```

`print_if` 不需要知道“偶数”的具体规则，它只负责遍历。调用者传入的函数决定筛选策略。这就是回调：某段代码保存或接收一个函数，并在合适时机调用它。

标准库的 `qsort` 也使用比较函数回调。不过它的参数是 `const void *`，初学时必须谨慎转换并保证比较器满足一致的排序关系。

## 回调中的上下文问题

单纯函数指针不能自动携带一组对象状态。C 接口常把“函数指针 + `void *context`”一起传递：

```c
typedef void (*Visitor)(int value, void *context);
```

回调执行时，调用方把原来的上下文指针传回去。这样同一个回调函数可以服务于不同对象。`void *` 会失去静态类型信息，因此约定必须写清楚，并在转换前确认它实际指向什么。

## 常见错误

1. `int **` 和二维数组混用；
2. 忘记检查输出参数本身是否为 `NULL`；
3. 函数指针声明的返回类型或参数类型不匹配；
4. 回调保存了已经失效的上下文地址；
5. 通过不兼容的函数指针类型调用函数，导致未定义行为。

## 本章心智模型

普通指针让函数找到调用者的对象；二级指针让函数找到调用者的“指针对象”；函数指针让程序找到一段符合约定的可执行逻辑。它们都不是魔法，只是“地址 + 类型约束”。

<span style="color: #E6A23C;">掌握多级指针后，下一篇进入动态内存：程序将能够在运行时决定对象数量和生命周期，但也必须开始承担所有权与释放责任。</span>
