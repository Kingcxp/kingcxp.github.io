---
title: 内存安全：越界、泄漏与悬空指针
date: 2026-07-06
icon: shield-halved
order: 25
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 内存安全
  - 未定义行为
  - Sanitizer
author: Kingcq
---

动态内存的语法并不难，难的是维护一组始终成立的约束：访问不能越界、对象必须仍然存活、资源只能释放一次，并且最终必须有人释放。

## 先建立“合法访问”的四个条件

通过指针访问对象之前，至少确认：

1. 指针不是空指针；
2. 指针指向的对象仍在生命周期内；
3. 访问范围没有越过对象边界；
4. 访问方式与对象类型、对齐要求相容。

只检查 `p != NULL` 远远不够。<span style="color: #F56C6C;">非空地址也可能悬空、越界或类型错误。</span>

## 未初始化读取

```c
int value;
printf("%d\n", value);  // 未定义行为
```

自动对象不会自动变成零。编译器可能把未初始化读取当作“不可能发生”，从而做出令初学者意外的优化。最稳妥的习惯是让对象在第一次读取前拥有明确值。

## 数组越界

```c
int data[4] = {0};
data[4] = 10;  // 合法下标只有 0、1、2、3
```

C 通常不会自动检查边界。写出的地址可能覆盖另一个局部变量、返回信息或尚未分配的页面。<span style="color: #E6A23C;">程序“这次没有崩溃”不等于代码正确。</span>

统一使用半开区间可以减少边界错误：长度为 `n` 的数组，其合法范围是 `[0, n)`。

## 缓冲区溢出

```c
char name[8];
scanf("%s", name);  // 输入过长会越界
```

至少要限制宽度：

```c
scanf("%7s", name);
```

<span style="color: #67C23A;">但更推荐用 `fgets` 读取一整行，再解析：</span>

```c
char line[64];
if (fgets(line, sizeof line, stdin) == NULL) {
    /* 处理 EOF 或读取错误 */
}
```

`fgets` 可能保留换行符；如果一行长于缓冲区，还要识别并丢弃剩余部分。

## 使用已释放内存

```c
int *p = malloc(sizeof *p);
if (p == NULL) return 1;

free(p);
printf("%d\n", *p);  // use-after-free
```

`free` 不会把所有指针副本自动改成 `NULL`，也不保证立即清空内容。释放后，分配器可以把同一块存储交给别的对象。

把当前变量设成 `NULL` 有助于阻止它被再次使用：

```c
free(p);
p = NULL;
```

但如果还有 `alias = p` 之类的别名，它们仍然悬空。真正的解决方案是明确所有权，避免到处保存可释放资源的裸别名。

## 重复释放

```c
free(p);
free(p);  // 未定义行为
```

`free(NULL)` 是安全的，但释放同一个非空分配两次不是。一个资源应有一个明确拥有者，拥有者负责恰好释放一次。

## 内存泄漏

```c
void leak(void)
{
    int *data = malloc(100 * sizeof *data);
    if (data == NULL) return;

    /* 忘记 free(data) */
}
```

<span style="color: #409EFF;">函数返回后，指针变量消失了，但那块动态存储仍然被占用，并且程序已经失去地址。</span>短命令行工具结束时系统会回收进程资源，但长时间运行的服务、循环调用或库代码会不断累积。

## `realloc` 的正确失败路径

```c
int *new_data = realloc(data, new_count * sizeof *data);
if (new_data == NULL) {
    // 原来的 data 仍然有效，不能丢掉
    free(data);
    return 1;
}
data = new_data;
```

不要直接写：

```c
data = realloc(data, new_size);  // 失败时会覆盖唯一地址，造成泄漏
```

当请求大小为零时，不同标准版本和实现细节容易让代码难以阅读。想释放就直接 `free`，不要把 `realloc(ptr, 0)` 当作通用释放方式。

## 分配大小也会溢出

```c
size_t bytes = count * sizeof(int);
```

如果 `count` 太大，乘法可能按 `size_t` 回绕，得到一个很小的结果。随后循环仍按原 `count` 写入，就会严重越界。

```c
#include <stdint.h>

if (count > SIZE_MAX / sizeof(int)) {
    return 1;
}
int *data = malloc(count * sizeof *data);
```

`SIZE_MAX` 是 `size_t` 能表示的最大值，常由 `<stdint.h>` 提供。如果希望不依赖该宏，也可以直接用 `(size_t)-1` 得到同一类型的最大值：

```c
if (count != 0 && sizeof *data > (size_t)-1 / count) {
    return 1;
}
```

## 返回局部变量地址

```c
int *bad(void)
{
    int value = 42;
    return &value;
}
```

函数返回后 `value` 的生命周期结束。这个错误与 `free` 后使用本质相同：指针还保存着一个数值，但对象已经不存在。

## 未定义行为为什么危险

未定义行为不只是“结果随机”。编译器可以假定正确程序不会触发它，并据此删除分支、重排访问或推导出更强结论。因此：

- Debug 版本正常、Release 版本崩溃并不奇怪；
- 加一行打印后错误消失，不表示修好了；
- 换台机器结果不同，也不表示某台机器“兼容”。

## 用工具尽早发现错误

GCC 或 Clang 的学习阶段命令：

```bash
gcc demo.c -std=c17 -Wall -Wextra -Wpedantic \
    -fsanitize=address,undefined -fno-omit-frame-pointer -g -o demo
```

- AddressSanitizer 常用于发现越界、释放后使用和重复释放；
- UndefinedBehaviorSanitizer 可发现许多整数、对齐和非法操作问题；
- 警告和 Sanitizer 不能证明程序完全安全，但能显著缩短定位时间。

## 所有权表

对动态资源写代码前，先列清楚：

| 问题 | 示例答案 |
|---|---|
| 谁创建？ | `list_create` |
| 谁拥有？ | 返回值接收者 |
| 谁可以借用？ | 遍历函数，只在调用期间 |
| 谁释放？ | `list_destroy` |
| 释放后怎样表示？ | 拥有者指针设为 `NULL` |

只要所有权无法用一句话说清楚，接口就值得重新设计。

内存中的数据只在当前进程生命期内有效。下一篇学习文件输入输出，让程序能够保存结果、读取配置，并处理来自外部世界的不可信数据。
