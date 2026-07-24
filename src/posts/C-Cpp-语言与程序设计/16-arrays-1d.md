---
title: 一维数组
date: 2026-07-03
icon: list-ol
order: 16
category:
  - C/C++ 语言与程序设计
tag:
  - 数组
  - 一维数组
  - 循环
author: Kingcq
---

## 引入：为什么需要数组

假设你要记录一个班级 50 名学生的成绩。如果不用数组，你得定义 50 个变量：

```c
int score1, score2, score3, /* ... */, score50;
```

光写变量名就累死人，更别说求平均分、找最高分了。数组（array）就是来解决这个问题的：它可以把<span style="color: #E6A23C;">同一类型的多个数据</span>存到一个名字下，通过“编号”来访问。

## 数组的声明、初始化与访问

### 声明数组

```c
int scores[50];  // 声明一个能放 50 个 int 的数组
```

方括号里的数字叫数组长度，必须是常量或常量表达式。

### 初始化数组

```c
int a[5] = {85, 90, 78, 92, 88};
```

也可以只初始化一部分，剩下的自动补 0：

```c
int b[5] = {1, 2};  // b[0]=1, b[1]=2, b[2]=b[3]=b[4]=0
```

如果想让编译器自动算长度，可以省略数字：

```c
int c[] = {1, 2, 3, 4, 5};  // 编译器知道长度为 5
```

### 访问数组元素

数组通过下标访问，下标从 <span style="color: #409EFF;">0</span> 开始：

```c
#include <stdio.h>

int main(void) {
    int scores[5] = {85, 90, 78, 92, 88};
    printf("第 1 个学生的成绩：%d\n", scores[0]);
    printf("第 3 个学生的成绩：%d\n", scores[2]);
    return 0;
}
```

输出：

```text
第 1 个学生的成绩：85
第 3 个学生的成绩：78
```

## 数组下标为什么从 0 开始

这是很多初学者困惑的地方。

数组名代表数组在内存中的起始地址。`scores[0]` 表示从起始地址偏移 0 个元素的位置；`scores[1]` 表示偏移 1 个元素的位置。底层计算时，

```c
scores[i]
```

等价于

```c
*(scores + i)
```

从 0 开始让内存地址的计算更直接，也符合计算机底层的寻址习惯。刚开始可能不习惯，但写多了就会觉得自然。

:::tip 奇怪的写法：i[arr]
既然 `arr[i]` 等价于 `*(arr + i)`，而加法满足交换律，所以 `i[arr]` 也是合法的——它会编译通过并输出同样的结果：

```c
int arr[5] = {10, 20, 30, 40, 50};
printf("%d\n", 2[arr]);   // 输出 30，等价于 arr[2]
```

不过这只是语言的一个小彩蛋，实际代码里永远不要这么写。知道它存在只是为了让你更深入地理解 "下标就是指针偏移" 这个本质。
:::

## 数组越界问题

C 语言不会主动检查下标是否越界。<span style="color: #F56C6C;">如果你访问了 `scores[10]`，而数组只有 5 个元素，编译器通常不会报错，但程序可能读到垃圾值，甚至破坏其他内存，导致崩溃。</span>

```c
int a[5] = {1, 2, 3, 4, 5};
// a[5] = 100;  // 危险！有效下标是 0~4
```

:::tip 养成好习惯
写循环时，条件写成 `i < n` 而不是 `i <= n`，其中 `n` 是数组长度。这样能很大程度上避免越界。
:::

## 数组与循环遍历

数组和 `for` 循环是黄金搭档：

```c
#include <stdio.h>

int main(void) {
    int scores[5] = {85, 90, 78, 92, 88};

    for (int i = 0; i < 5; i++) {
        printf("scores[%d] = %d\n", i, scores[i]);
    }

    return 0;
}
```

输出：

```text
scores[0] = 85
scores[1] = 90
scores[2] = 78
scores[3] = 92
scores[4] = 88
```

## 基础操作示例

### 求和与平均值

```c
#include <stdio.h>

int main(void) {
    int scores[5] = {85, 90, 78, 92, 88};
    int sum = 0;

    for (int i = 0; i < 5; i++) {
        sum += scores[i];
    }

    double avg = (double)sum / 5;
    printf("总分：%d\n", sum);
    printf("平均分：%.2f\n", avg);
    return 0;
}
```

### 求最大值和最小值

```c
#include <stdio.h>

int main(void) {
    int a[5] = {34, 12, 89, 5, 67};
    int max = a[0];
    int min = a[0];

    for (int i = 1; i < 5; i++) {
        if (a[i] > max) {
            max = a[i];
        }
        if (a[i] < min) {
            min = a[i];
        }
    }

    printf("最大值：%d\n", max);
    printf("最小值：%d\n", min);
    return 0;
}
```

### 计数

统计数组中有多少个偶数：

```c
#include <stdio.h>

int main(void) {
    int nums[8] = {1, 2, 3, 4, 5, 6, 7, 8};
    int count = 0;

    for (int i = 0; i < 8; i++) {
        if (nums[i] % 2 == 0) {
            count++;
        }
    }

    printf("偶数个数：%d\n", count);
    return 0;
}
```

## 常见错误与注意事项

1. <span style="color: #F56C6C;">数组越界访问</span>：C 不会帮你检查，后果可能很严重。
2. <span style="color: #F56C6C;">初始化时长度不够</span>：`int a[3] = {1, 2, 3, 4};` 会报错或警告。
3. <span style="color: #F56C6C;">用变量声明数组长度</span>：在 C99 之前，数组长度必须是常量；C99 支持变长数组，但初学阶段建议先用固定长度。
4. <span style="color: #F56C6C;">数组名不能整体赋值</span>：`int a[5]; a = {1,2,3,4,5};` 是错误的，初始化只能在声明时进行。

## 数组同时包含“元素类型”和“元素数量”

```c
int data[10];
```

它的类型不是笼统的 `int *`，而是“包含 10 个 `int` 的数组”。只有在大多数表达式中，数组才转换为首元素指针。

同一作用域内可以计算元素数：

```c
size_t length = sizeof data / sizeof data[0];
```

但传给函数后，参数声明中的数组会调整为指针：

```c
void print_array(int data[], size_t length); // data 实际是 int *
```

在函数内部对 `data` 使用上述 `sizeof` 技巧，只会得到指针大小。数组参数必须同时传长度。

## 初始化不完整时其余元素为零

```c
int values[5] = {1, 2}; // 后三个元素为 0
int zeros[100] = {0};   // 全部为 0
```

这与完全没有初始化不同。普通自动数组 `int values[5];` 的元素是未确定值，读取前必须逐个赋值。

## 小结与下一篇预告

今天我们学习了数组的声明、初始化、访问方式，理解了为什么下标从 0 开始，还练习了求和、求最值、计数等常见操作。数组是处理批量数据的基础工具，一定要多注意越界问题。

下一篇我们会把数组“升维”，学习<span style="color: #409EFF;">二维数组</span>——它非常适合表示表格、矩阵这类数据。
