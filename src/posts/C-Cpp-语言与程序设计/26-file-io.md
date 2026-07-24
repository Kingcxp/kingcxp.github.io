---
title: 文件输入输出：让数据跨越程序运行周期
date: 2026-07-06
icon: file-lines
order: 26
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 文件
  - fopen
  - 二进制
author: Kingcq
---

变量和动态内存在程序结束后都会失去意义。要让数据在下一次运行时仍然存在，需要把它写入文件。文件 I/O 也是程序与配置、日志、数据集和其他工具交换信息的基础。

## `FILE *` 是什么

C 标准库使用 `FILE` 对象表示一个已打开的流。程序通常只持有 `FILE *`，不直接访问内部字段：

```c
FILE *file = fopen("scores.txt", "r");
```

<span style="color: #F56C6C;">`FILE` 是标准库管理的抽象对象，里面可能包含缓冲区、当前位置、错误状态和系统文件描述符等信息。</span>

## 打开与关闭

```c
#include <stdio.h>

int main(void)
{
    FILE *file = fopen("message.txt", "w");
    if (file == NULL) {
        perror("无法打开 message.txt");
        return 1;
    }

    fputs("Hello, file!\n", file);

    if (fclose(file) == EOF) {
        perror("关闭文件失败");
        return 1;
    }
    return 0;
}
```

打开模式常见有：

| 模式 | 含义 |
| :-- | :-- |
| `"r"` | 只读，文件必须存在 |
| `"w"` | 写入，原文件会截断；不存在则创建 |
| `"a"` | 追加，写入位置在末尾 |
| `"r+"` | 读写，文件必须存在 |
| `"w+"` | 读写并截断 |
| `"a+"` | 读和追加 |

加上 `b` 表示二进制模式，如 `"rb"`、`"wb"`。<span style="color: #E6A23C;">在某些系统上文本模式与二进制模式没有区别，但可移植程序应按数据含义选择。</span>

## 逐行读取文本

```c
#include <stdio.h>

int main(void)
{
    FILE *file = fopen("scores.txt", "r");
    if (file == NULL) {
        perror("scores.txt");
        return 1;
    }

    char line[256];
    while (fgets(line, sizeof(line), file) != NULL) {
        fputs(line, stdout);
    }

    if (ferror(file)) {
        perror("读取失败");
        fclose(file);
        return 1;
    }

    fclose(file);
    return 0;
}
```

循环结束可能有两种原因：到达文件末尾，或者发生错误。因此需要用 `ferror` 区分。

## 一行比缓冲区长怎么办

`fgets` 最多读取 `capacity - 1` 个字符并补 `\0`。如果缓冲区里没有读到换行符，可能是：

- 文件这一行本来就没有换行且到达末尾；
- 当前缓冲区只装下了一行的一部分。

实际程序可以：

1. 把多个片段拼到动态缓冲区；
2. 明确规定最大行长，超长就报错并丢弃剩余部分；
3. 在支持的平台上使用 `getline`，但它不是 ISO C 标准的一部分。

## 格式化写入与读取

```c
fprintf(file, "%s %d %.2f\n", name, age, score);
```

`fscanf` 可以按格式读取，但和 `scanf` 一样容易受到分隔符、残留字符和缓冲区宽度影响。对结构化文本，常见稳健模式仍然是：

> `fgets` 读取一行，再用 `strtol`、`strtod` 或受控的 `sscanf` 解析。

使用 `%s` 时必须给出最大宽度：

```c
char name[32];
if (fscanf(file, "%31s", name) == 1) {
    /* 成功 */
}
```

## 二进制读写

```c
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int values[] = {10, 20, 30, 40};
    size_t count = sizeof(values) / sizeof(values[0]);

    FILE *out = fopen("values.bin", "wb");
    if (out == NULL) return 1;

    size_t written = fwrite(values, sizeof(values[0]), count, out);
    if (written != count) {
        perror("写入失败");
        fclose(out);
        return 1;
    }
    fclose(out);

    FILE *in = fopen("values.bin", "rb");
    if (in == NULL) return 1;

    int loaded[4];
    size_t read_count = fread(loaded, sizeof(loaded[0]), 4, in);
    fclose(in);

    for (size_t i = 0; i < read_count; ++i) {
        printf("%d\n", loaded[i]);
    }
    return 0;
}
```

### 不要把内存布局当成通用文件格式

直接把结构体 `fwrite` 到文件，可能受到以下影响：

- 字节序；
- 类型宽度；
- 结构体填充；
- 编译器和平台差异；
- 结构体版本变化；
- 指针字段在下一次运行中毫无意义。

如果文件需要跨平台或长期保存，应明确设计字段宽度、顺序、编码和版本，并逐字段序列化。

## 文件位置

```c
long position = ftell(file);
fseek(file, 0, SEEK_END);
rewind(file);
```

文本流上的随机定位有一些实现限制。<span style="color: #F56C6C;">处理通用文件格式时，不要假设文本文件每个字符都恰好对应一个字节位置。</span>

## 刷新缓冲区

标准 I/O 通常带缓冲：

```c
fprintf(log, "started\n");
fflush(log);
```

`fflush` 可以请求把输出缓冲写向底层对象。对输入流调用 `fflush(stdin)` 不是可移植的清空输入方式。

## 安全保存：临时文件与替换

直接用 `"w"` 打开原文件会立即截断。<span style="color: #F56C6C;">一旦中途失败，旧数据也可能丢失。</span>更安全的保存流程是：

1. 写到同目录临时文件；
2. 检查所有写入和关闭操作；
3. 成功后再用重命名替换原文件；
4. 失败则保留旧文件并删除临时文件。

跨平台的原子替换细节不同，但这个思路值得从一开始建立。

## 路径不是普通字符串问题

路径分隔符、字符编码、当前工作目录和权限都与平台有关。入门程序可以使用简单相对路径，但应知道：

- `"data.txt"` 相对于程序的当前工作目录，不一定是可执行文件所在目录；
- 用户输入的路径不能盲目拼接到命令字符串中；
- 打开失败时应输出具体路径和错误原因。

## 文件资源的所有权

每次成功 `fopen` 都应有对应的 `fclose`。复杂函数可以统一跳到清理区：

```c
int process_file(const char *path)
{
    int status = 1;
    FILE *file = fopen(path, "r");
    if (file == NULL) return status;

    /* 处理；遇到错误时 goto cleanup */
    status = 0;

cleanup:
    if (fclose(file) == EOF) status = 1;
    return status;
}
```

在 C 中，集中清理是避免多条错误路径漏资源的常见方法。C++ 之后会用 RAII 自动完成这类清理。
