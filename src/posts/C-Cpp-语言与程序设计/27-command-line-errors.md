---
title: 命令行参数、错误码与错误传播
date: 2026-07-06
icon: terminal
order: 27
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 命令行参数
  - errno
  - 错误处理
author: Kingcq
---

真实程序不能把文件名、选项和数据都写死在源代码里。命令行参数让用户在启动程序时传入配置；<span style="color: #F56C6C;">明确的错误传播则让调用者知道程序为什么失败。</span>

## `argc` 与 `argv`

```c
int main(int argc, char *argv[]);
```

也可以写成：

```c
int main(int argc, char **argv);
```

在函数参数位置，这两种写法等价。

- `argc`：参数字符串数量，至少为 1；
- `argv[0]`：程序名或启动命令的某种表示；
- `argv[1]` 到 `argv[argc - 1]`：用户参数；
- `argv[argc]`：空指针。

## 最小示例

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("argc = %d\n", argc);
    for (int i = 0; i < argc; ++i) {
        printf("argv[%d] = %s\n", i, argv[i]);
    }
    return 0;
}
```

终端中的引号和转义由 shell 先处理。因此：

```bash
./app "hello world"
```

通常会把 `hello world` 作为一个参数传给程序，而不是三个。

## 先定义命令行接口

假设编写一个统计文件行数的工具：

```text
用法：linecount [-n] FILE

-n    同时显示行号
-h    显示帮助
```

命令行接口也是公开接口，需要考虑：

- 必填参数；
- 可选参数；
- 参数顺序；
- 重复选项；
- 未知选项；
- `--` 后是否停止解析选项；
- 错误时输出到标准错误还是标准输出。

## 手动解析简单选项

```c
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    bool show_numbers = false;
    const char *path = NULL;

    for (int i = 1; i < argc; ++i) {
        if (strcmp(argv[i], "-n") == 0) {
            show_numbers = true;
        } else if (strcmp(argv[i], "-h") == 0) {
            printf("用法：%s [-n] FILE\n", argv[0]);
            return 0;
        } else if (argv[i][0] == '-') {
            fprintf(stderr, "未知选项：%s\n", argv[i]);
            return 2;
        } else if (path == NULL) {
            path = argv[i];
        } else {
            fprintf(stderr, "只能指定一个文件。\n");
            return 2;
        }
    }

    if (path == NULL) {
        fprintf(stderr, "缺少文件名。\n");
        return 2;
    }

    printf("path=%s, number=%s\n", path, show_numbers ? "yes" : "no");
    return 0;
}
```

参数很多时可以使用平台提供的 `getopt` 或第三方库，但要先理解解析规则。

## 标准输出和标准错误

- `stdout`：程序的正常结果；
- `stderr`：诊断和错误信息。

```c
printf("结果：42\n");
fprintf(stderr, "配置文件无效\n");
```

分开后，用户可以把结果重定向到文件，同时仍在终端看到错误。

## 退出状态

`main` 返回 0 通常表示成功，非 0 表示失败：

```c
#include <stdlib.h>

return EXIT_SUCCESS;
return EXIT_FAILURE;
```

对于命令行工具，可以约定更具体的状态，例如：

```text
0  成功
1  运行时失败
2  命令行使用错误
```

<span style="color: #F56C6C;">不要返回随意的大数并期待所有环境都原样保留。</span>

## `errno` 不是全局错误答案

某些库函数失败时会设置 `errno`：

```c
FILE *file = fopen(path, "r");
if (file == NULL) {
    perror(path);
    return 1;
}
```

注意：

- 只有文档说明失败时会设置 `errno` 的函数才能这样用；
- 成功调用不一定清除旧值；
- 必须先检查函数返回值，再读取 `errno`；
- `errno` 的文本适合给人看，不适合程序逻辑精确分类。

`strtol` 这类函数要求调用前先把 `errno` 设为 0，因为它可能返回一个看似合法的边界值。

## 函数怎样报告错误

常见方式有：

### 返回真假，结果通过输出参数

```c
#include <stdbool.h>

bool divide(double a, double b, double *result) {
    if (b == 0.0) return false;
    *result = a / b;
    return true;
}
```

### 返回枚举错误码

```c
typedef enum {
    PARSE_OK,
    PARSE_EMPTY,
    PARSE_INVALID,
    PARSE_OUT_OF_RANGE
} ParseStatus;
```

枚举比只返回 `-1` 更能表达失败原因。

### 返回空指针

<span style="color: #F56C6C;">分配或查找函数常用空指针表示失败，但要明确：空指针究竟表示“没找到”还是“发生错误”。</span>必要时另外返回状态。

## 不要在底层函数里随意退出程序

```c
void load_config(void) {
    if (/* 失败 */) {
        exit(1); // 库函数直接结束整个进程
    }
}
```

这会让上层无法恢复、重试或清理其他资源。<span style="color: #67C23A;">除非函数本来就是最顶层程序流程，否则更推荐把错误返回给调用者。</span>

## 错误信息要包含上下文

差的错误信息：

```text
打开失败
```

更有用的错误信息：

```text
无法读取配置文件 "config/app.conf"：Permission denied
```

包含正在做的操作、对象名称和底层原因，调试效率会高很多。

## 一个完整的小工具

```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "用法：%s FILE\n", argv[0]);
        return 2;
    }

    FILE *file = fopen(argv[1], "r");
    if (file == NULL) {
        perror(argv[1]);
        return 1;
    }

    size_t lines = 0;
    int ch;
    int last = '\n';
    while ((ch = fgetc(file)) != EOF) {
        if (ch == '\n') ++lines;
        last = ch;
    }

    if (ferror(file)) {
        perror("读取文件");
        fclose(file);
        return 1;
    }

    if (last != '\n') ++lines;

    if (fclose(file) == EOF) {
        perror("关闭文件");
        return 1;
    }

    printf("%zu\n", lines);
    return 0;
}
```

空文件的 `last` 初值会导致错误吗？不会：空文件时循环不执行，`last` 仍为换行，因此不会多计一行。这就是通过初始化表达边界状态。
