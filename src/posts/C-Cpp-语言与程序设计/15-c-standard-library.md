---
title: C 标准库：不要重复制造已有工具
date: 2026-07-03
icon: toolbox
order: 15
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 标准库
  - 头文件
  - API
author: Kingcq
---

<span style="color: #67C23A;">会写函数之后，很容易产生一种错觉：所有功能都应该自己实现。</span>事实上，C 标准库已经提供了输入输出、字符串、内存、数学、字符分类、时间、排序和错误处理等基础工具。学会查阅和正确调用标准库，是从练习代码走向实际程序的重要一步。

## 标准库是什么

C 语言标准规定了一组头文件、类型、宏和函数。符合标准的实现应当提供它们。常见头文件包括：

| 头文件 | 主要用途 |
| :-- | :-- |
| `<stdio.h>` | 终端和文件输入输出 |
| `<stdlib.h>` | 动态内存、转换、排序、程序控制 |
| `<string.h>` | 字节串和 C 字符串处理 |
| `<ctype.h>` | 字符分类和大小写转换 |
| `<math.h>` | 数学函数 |
| `<stdint.h>` | 固定位宽或至少位宽整数类型 |
| `<limits.h>` | 整数类型边界 |
| `<float.h>` | 浮点类型特征 |
| `<stdbool.h>` | `bool`、`true`、`false` |
| `<assert.h>` | 断言 |
| `<errno.h>` | 错误码 |
| `<time.h>` | 时间与日期 |

头文件提供声明。真正的实现通常在 C 运行库中，链接阶段会把需要的符号连接进程序。

## 先查契约，再调用函数

使用库函数前至少要知道：

- 参数和返回值是什么；
- 输入是否必须满足额外条件；
- 返回的指针由谁拥有；
- 失败时怎样报告；
- 是否会修改输入缓冲区；
- 是否要求字符串以 `\0` 结尾。

例如 `strlen` 的前提不是“传入一块字符内存”，而是“传入一个能找到终止空字符的合法 C 字符串”。

## `<string.h>`：字符串与字节操作

常用函数：

```c
size_t strlen(const char *s);
int strcmp(const char *left, const char *right);
char *strchr(const char *s, int ch);
void *memcpy(void *dest, const void *src, size_t count);
void *memmove(void *dest, const void *src, size_t count);
void *memset(void *dest, int value, size_t count);
```

### `memcpy` 和 `memmove`

`memcpy` 要求源区域与目标区域不重叠；重叠时应使用 `memmove`：

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char text[] = "ABCDE";
    memmove(text + 1, text, 4);
    text[5] = '\0';
    puts(text); // AABCD
    return 0;
}
```

`memset` 按<span style="color: #409EFF;">字节</span>填充值，不能用来把 `int` 数组设置成任意整数：

```c
int values[4];
memset(values, 0, sizeof(values)); // 清零通常可行
```

<span style="color: #E6A23C;">但 `memset(values, 1, sizeof(values))` 并不等于把每个 `int` 设成 1。</span>

## `<ctype.h>`：字符分类

```c
#include <ctype.h>
#include <stdio.h>

int main(void)
{
    int ch = 'a';
    if (isalpha((unsigned char)ch)) {
        ch = toupper((unsigned char)ch);
    }
    putchar(ch);
    putchar('\n');
    return 0;
}
```

除 `EOF` 外，`isalpha`、`isdigit` 等函数的参数必须能表示为 `unsigned char`。<span style="color: #F56C6C;">直接把可能为负的普通 `char` 传进去可能产生未定义行为，因此常见写法是先转换。</span>

## `<stdlib.h>`：可靠地解析数字

`atoi` 无法区分“输入是 0”和“转换失败”，也不容易检查溢出。更可靠的选择是 `strtol`：

```c
#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

int parse_int(const char *text, int *result)
{
    char *end = NULL;
    errno = 0;
    long value = strtol(text, &end, 10);

    if (text == end) return 0;                 // 没读到数字
    if (*end != '\0' && *end != '\n') return 0; // 有多余字符
    if (errno == ERANGE) return 0;
    if (value < INT_MIN || value > INT_MAX) return 0;

    *result = (int)value;
    return 1;
}
```

这里体现了一个重要模式：<span style="color: #67C23A;">库函数通常给出原始机制，调用者负责根据自己的目标类型继续验证。</span>

## `qsort`：用回调函数排序

```c
#include <stdio.h>
#include <stdlib.h>

int compare_int(const void *left, const void *right)
{
    int a = *(const int *)left;
    int b = *(const int *)right;
    return (a > b) - (a < b);
}

int main(void)
{
    int values[] = {5, 1, 4, 2, 3};
    size_t count = sizeof(values) / sizeof(values[0]);

    qsort(values, count, sizeof(values[0]), compare_int);

    for (size_t i = 0; i < count; ++i) {
        printf("%d%c", values[i], i + 1 == count ? '\n' : ' ');
    }
    return 0;
}
```

不要用 `return a - b;` 作为通用整数比较器，因为减法可能溢出。

## `<stdint.h>` 和可移植整数

当数据格式确实要求固定宽度时，可以使用：

```c
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>

int main(void)
{
    int32_t value = INT32_C(123456);
    printf("%" PRId32 "\n", value);
    return 0;
}
```

`int32_t` 只有在实现提供恰好 32 位的有符号整数类型时才存在。普通计数并不需要强行使用固定宽度类型；`int`、`size_t` 往往更自然。

## `<math.h>` 与链接选项

```c
#include <math.h>
#include <stdio.h>

int main(void)
{
    printf("%.2f\n", sqrt(2.0));
    return 0;
}
```

某些 Unix 工具链需要显式链接数学库：

```bash
gcc demo.c -std=c17 -Wall -Wextra -Wpedantic -lm -o demo
```

链接选项通常放在使用它的目标文件之后。

## 时间函数只提供基础积木

`<time.h>` 可以获得时间戳、计算时间差并转换成本地时间，但时区、夏令时和线程安全会让真实日期时间处理迅速复杂化。入门阶段先掌握：

```c
#include <stdio.h>
#include <time.h>

int main(void)
{
    clock_t begin = clock();

    volatile long long sum = 0;
    for (long i = 0; i < 1000000; ++i) sum += i;

    clock_t end = clock();
    double seconds = (double)(end - begin) / CLOCKS_PER_SEC;
    printf("CPU time: %.6f s\n", seconds);
    return 0;
}
```

这测量的是进程消耗的 CPU 时间，不一定等于墙上时钟经过的时间。

## 标准库也有边界

- 库函数不会自动替你检查所有缓冲区长度；
- C 字符串接口仍依赖终止符和容量管理；
- `rand` 不适合密码学用途；
- `qsort` 的 `void *` 接口缺少静态类型信息；
- 时间和本地化问题通常需要更专业的库。

标准库的价值是提供通用、可移植的基础，而不是保证所有调用都天然安全。

## 阅读文档时的模板

看到一个新 API，可以记录：

```text
函数名：
头文件：
输入参数：
返回值：
失败方式：
前置条件：
是否修改输入：
返回资源由谁释放：
线程安全或平台差异：
```

下一阶段会进入数组。数组章节将频繁使用 `sizeof`、`memcpy`、字符处理和边界概念。
