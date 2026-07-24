---
title: 阶段项目一：可靠的成绩统计程序
date: 2026-07-04
icon: list-check
order: 19
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 综合练习
  - 输入验证
  - 数组
author: Kingcq
---

<span style="color: #409EFF;">前面的章节已经覆盖变量、控制流、函数、数组和字符串。</span>现在用一个完整的小项目把这些知识串起来：编写一个能够反复读取成绩、验证输入、统计结果并按菜单操作的程序。

重点不是功能多，而是建立第一次完整的开发流程：

> 先写需求和数据约束，再拆函数，最后测试边界，而不是想到哪里写到哪里。

## 需求

程序支持：

1. 输入一组 `0` 到 `100` 的整数成绩；
2. 显示平均分、最高分、最低分和及格人数；
3. 按区间输出人数分布；
4. 查找某个成绩出现次数；
5. 输入不合法时不破坏已有数据；
6. 数据最多保存 100 项。

## 先设计数据和不变量

```c
#define MAX_SCORES 100

int scores[MAX_SCORES];
size_t count = 0;
```

需要始终成立的不变量：

- `0 <= count <= MAX_SCORES`；
- 合法元素只有 `scores[0]` 到 `scores[count - 1]`；
- 每个已保存成绩都在 `[0, 100]` 内。

只要程序的每个操作都维护这三条规则，后面的统计函数就更容易正确。

## 可靠读取一行

<span style="color: #F56C6C;">不要直接假定用户永远输入正确。</span>先读整行，再用 `strtol` 解析：

```c
#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

int read_int(const char *prompt, int *result) {
    char line[128];
    char *end = NULL;

    fputs(prompt, stdout);
    if (fgets(line, sizeof(line), stdin) == NULL) {
        return 0;
    }

    errno = 0;
    long value = strtol(line, &end, 10);
    if (line == end || errno == ERANGE) return -1;

    while (*end == ' ' || *end == '\t') ++end;
    if (*end != '\n' && *end != '\0') return -1;
    if (value < INT_MIN || value > INT_MAX) return -1;

    *result = (int)value;
    return 1;
}
```

约定：

- 返回 `1`：成功；
- 返回 `0`：输入流结束；
- 返回 `-1`：这一行不是合法整数。

## 添加成绩

```c
#include <stddef.h>

int add_score(int scores[], size_t *count, size_t capacity, int score) {
    if (score < 0 || score > 100) return 0;
    if (*count >= capacity) return 0;

    scores[*count] = score;
    ++(*count);
    return 1;
}
```

这里传入 `count` 的地址，是因为函数需要修改调用者保存的元素数量。后面的指针章节会从内存角度解释这种写法。

## 统计函数

```c
#include <stddef.h>

int minimum(const int scores[], size_t count) {
    int result = scores[0];
    for (size_t i = 1; i < count; ++i) {
        if (scores[i] < result) result = scores[i];
    }
    return result;
}

int maximum(const int scores[], size_t count) {
    int result = scores[0];
    for (size_t i = 1; i < count; ++i) {
        if (scores[i] > result) result = scores[i];
    }
    return result;
}

double average(const int scores[], size_t count) {
    long long sum = 0;
    for (size_t i = 0; i < count; ++i) sum += scores[i];
    return (double)sum / (double)count;
}
```

这些函数要求 `count > 0`。调用者必须先处理空数组，而不是让函数读取 `scores[0]`。

## 分布统计

```c
void build_histogram(const int scores[], size_t count, size_t bins[5]) {
    for (size_t i = 0; i < 5; ++i) bins[i] = 0;

    for (size_t i = 0; i < count; ++i) {
        int score = scores[i];
        if (score < 60) ++bins[0];
        else if (score < 70) ++bins[1];
        else if (score < 80) ++bins[2];
        else if (score < 90) ++bins[3];
        else ++bins[4];
    }
}
```

区间定义必须没有重叠也没有空洞：

```text
[0, 60) [60, 70) [70, 80) [80, 90) [90, 101)
```

## 完整菜单骨架

```c
#include <stddef.h>
#include <stdio.h>

int read_int(const char *prompt, int *result);
int add_score(int scores[], size_t *count, size_t capacity, int score);
int minimum(const int scores[], size_t count);
int maximum(const int scores[], size_t count);
double average(const int scores[], size_t count);

void print_menu(void) {
    puts("\n1. 添加成绩");
    puts("2. 显示统计");
    puts("3. 查找成绩");
    puts("4. 显示分布");
    puts("0. 退出");
}

int main() {
    int scores[100];
    size_t count = 0;

    for (;;) {
        int choice;
        print_menu();
        int state = read_int("请选择：", &choice);

        if (state == 0) break;
        if (state < 0) {
            puts("请输入一个整数。");
            continue;
        }

        if (choice == 0) break;

        switch (choice) {
        case 1: {
            int score;
            if (read_int("成绩：", &score) != 1) {
                puts("输入无效。");
            } else if (!add_score(scores, &count, 100, score)) {
                puts("成绩越界或存储已满。");
            }
            break;
        }
        case 2:
            if (count == 0) {
                puts("还没有成绩。");
            } else {
                printf("平均 %.2f，最低 %d，最高 %d\n",
                       average(scores, count),
                       minimum(scores, count),
                       maximum(scores, count));
            }
            break;
        default:
            puts("没有这个选项。");
            break;
        }
    }
    return 0;
}
```

为了让重点清楚，骨架省略了查找和分布分支。<span style="color: #67C23A;">你应当根据前面的函数自行补上。</span>

## 测试表

至少手动测试：

| 场景 | 预期 |
| :-- | :-- |
| 空数据时统计 | 提示没有成绩 |
| 输入 `0`、`100` | 接受边界值 |
| 输入 `-1`、`101` | 拒绝且不增加 `count` |
| 输入 `12abc` | 拒绝整行 |
| 输入空行 | 提示无效 |
| 添加 100 项 | 全部可保存 |
| 再添加第 101 项 | 拒绝且不越界 |
| 全部成绩相同 | 最小、最大、平均一致 |

## 可以继续扩展

- 删除指定下标的成绩；
- 对成绩排序；
- 保存到文件并重新加载；
- 把固定数组改成动态数组；
- 为每名学生增加姓名和学号。

后面每学到一个新主题，都可以回到这个项目升级它。这样新知识会落到已有问题上，而不是成为孤立语法。

<span style="color: #E6A23C;">项目目前受固定数组容量限制。</span>下一篇从地址开始学习指针，为修改调用者数据、动态扩容和更复杂的数据结构建立基础。
