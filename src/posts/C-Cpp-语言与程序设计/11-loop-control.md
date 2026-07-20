---
title: 循环控制
date: 2026-07-02
icon: hand
order: 11
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 循环
  - break
  - continue
author: Kingcq
---

上一篇我们学会了用循环让程序重复做事。但循环并不总是按部就班地跑完所有次数，有时候我们想提前结束，有时候想跳过某一次。这篇文章就来聊聊循环控制语句。

## 学习目标

读完这篇文章，你会掌握：

- `break` 和 `continue` 的区别
- 它们在什么场景下使用
- `break` 在嵌套循环中的限制
- `goto` 是什么，为什么不推荐使用
- 如何用循环控制语句让代码更清晰

## break：跳出循环

`break` 的作用是**立即终止当前所在的循环**，然后跳到循环后面的代码继续执行。

```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 10; i++) {
        if (i == 5) {
            break;   // 遇到 5 就结束整个循环
        }
        printf("%d ", i);
    }
    printf("\n循环结束\n");
    return 0;
}
```

输出：

```
1 2 3 4 
循环结束
```

:::tip
`break` 只能跳出一层循环。如果你在嵌套循环里用 `break`，它只会跳出最内层那个循环，外层的循环还会继续执行。

另外注意，`break` 在循环和 `switch` 中的效果是一样的——都是"立即跳出当前结构"。如果 `switch` 在一个循环内部，`break` 只跳出 `switch` 而不会跳出循环，反之亦然。
:::

## continue：跳过本次

`continue` 的作用是**跳过当前这次循环的剩余部分**，直接进入下一次循环的判断。

```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        if (i == 3) {
            continue;   // 跳过 i == 3 这次
        }
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}
```

输出：

```
1 2 4 5 
```

可以看到，`3` 没有被打印出来，但循环并没有结束，而是继续执行了后面的次数。

## break 与 continue 的区别

| 语句 | 作用 |
| :-- | :-- |
| `break` | 立即结束整个循环 |
| `continue` | 结束本次循环，进入下一次判断 |

用一句话记：`break` 是“不干了”，`continue` 是“这次算了，继续干”。

## 常见使用场景

### 用 break 提前退出

比如在一堆数里找第一个负数：

```c
#include <stdio.h>

int main() {
    int nums[] = {3, 7, 2, -5, 8, 1};
    int n = sizeof(nums) / sizeof(nums[0]);

    for (int i = 0; i < n; i++) {
        if (nums[i] < 0) {
            printf("找到第一个负数：%d，位置：%d\n", nums[i], i);
            break;   // 找到了，后面不用再看了
        }
    }

    return 0;
}
```

### 用 continue 跳过不符合条件的数据

比如只打印数组里的偶数：

```c
#include <stdio.h>

int main() {
    int nums[] = {1, 2, 3, 4, 5, 6};
    int n = sizeof(nums) / sizeof(nums[0]);

    printf("偶数有：");
    for (int i = 0; i < n; i++) {
        if (nums[i] % 2 != 0) {
            continue;   // 奇数跳过
        }
        printf("%d ", nums[i]);
    }
    printf("\n");

    return 0;
}
```

## break 在嵌套循环中的限制

在嵌套循环里，`break` 只能跳出它所在的最内层循环。

```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 3; j++) {
            if (i == 2 && j == 2) {
                break;   // 只跳出内层 j 循环
            }
            printf("(%d, %d) ", i, j);
        }
        printf("\n");
    }
    return 0;
}
```

输出：

```
(1, 1) (1, 2) (1, 3) 
(2, 1) 
(3, 1) (3, 2) (3, 3) 
```

如果想同时跳出多层循环，常见的做法是设置一个标志变量：

```c
#include <stdbool.h>
#include <stdio.h>

int main() {
    bool found = false;

    for (int i = 1; i <= 3 && !found; i++) {
        for (int j = 1; j <= 3; j++) {
            if (i == 2 && j == 2) {
                found = true;
                break;
            }
            printf("(%d, %d) ", i, j);
        }
        printf("\n");
    }

    return 0;
}
```

:::tip
当然，你也可以用 `goto` 来跳出多层循环，但正如我们接下来要讲的，那样做通常会让代码更难维护。
:::

## goto：存在但尽量别用

`C` 语言里确实有一个 `goto` 语句，它可以无条件跳转到代码中某个标签的位置。

```c
#include <stdio.h>

int main() {
    int i = 0;

loop:
    printf("%d\n", i);
    i++;
    if (i < 5) {
        goto loop;
    }

    return 0;
}
```

`goto` 看起来很简单，但它会让代码的执行流程变得像一团乱麻，随便跳来跳去。代码一旦复杂起来，`goto` 会让阅读和调试都非常痛苦。所以业界有个共识：能不用 `goto` 就不用 `goto`。

少数 `goto` 可以接受的场景，比如在函数末尾统一处理错误清理资源。但在初学阶段，你几乎不会遇到非用不可的情况。

## 用循环控制优化代码结构

循环控制语句能让代码更简洁、更高效。比如下面这段代码，不用 `continue` 也能写，但逻辑会更绕：

```c
// 不用 continue 的写法
for (int i = 0; i < n; i++) {
    if (nums[i] % 2 == 0) {
        printf("%d ", nums[i]);
    }
}

// 用 continue 的写法
for (int i = 0; i < n; i++) {
    if (nums[i] % 2 != 0) {
        continue;
    }
    printf("%d ", nums[i]);
}
```

哪种更好？其实都可以。当“跳过条件”比较复杂，或者主逻辑很长时，`continue` 能让主逻辑提前到缩进更少的位置，可读性反而更好。

:::tip
`break` 和 `continue` 本身不是必须的，很多循环不用它们也能实现。但合理地使用它们，可以减少嵌套层级，让意图更清晰。
:::

## 常见错误与注意事项

1. **`break` 和 `continue` 只能在循环或 `switch` 里使用**

```c
if (x > 0) {
    break;   // 错误！break 不能用在 if 里，除非 if 在循环内部
}
```

2. **`continue` 在 while 和 do-while 里要当心**

```c
int i = 0;
while (i < 5) {
    if (i == 2) {
        continue;   // 跳过了 i++，i 永远等于 2，死循环！
    }
    i++;
}
```

在 `while` 里用 `continue` 时，要确保更新循环变量的代码不会被跳过。

3. **滥用 break 导致循环逻辑不清晰**

如果循环里到处都是 `break`，读者很难判断循环到底什么时候结束。建议只在真正需要提前退出时使用。

## `break` 和 `continue` 都会改变证明路径

`continue` 会直接跳到本轮更新与下一次判断。使用 `while` 时，如果更新语句写在循环末尾，提前 `continue` 可能跳过更新并造成死循环：

```c
while (i < n) {
    if (data[i] < 0) {
        i++;       // 不能忘
        continue;
    }
    process(data[i]);
    i++;
}
```

能改成 `for` 或调整结构时，尽量让控制变量更新集中在一个位置。

## 多层循环退出的选择

`break` 只退出当前一层。常见做法有：

- 提取为函数并 `return`；
- 使用布尔标志控制外层；
- 重新组织为单独搜索函数；
- 在 C 中，对统一资源清理使用受控的 `goto cleanup`。

`goto` 不是绝对禁用。它不适合制造任意跳转，但在 C 函数尾部集中释放多项资源，往往比复制多段清理代码更安全：

```c
if (step1_failed) goto cleanup;
if (step2_failed) goto cleanup;

cleanup:
free(buffer);
fclose(file);
```

前提是跳转方向清楚、不跨越需要特殊初始化的逻辑，并且标签名称表达目的。

## 小结

这篇文章我们学习了循环控制语句：

- `break`：立即结束当前循环
- `continue`：跳过本次循环的剩余部分
- `break` 只能跳出一层循环，嵌套循环里可以用标志变量
- `goto` 虽然存在，但初学者应避免使用

合理使用 `break` 和 `continue`，可以让你的循环更简洁、意图更明确。

到这里，我们已经掌握了变量、输入输出、运算符、分支和循环这些 `C` 语言的基础知识。不过，程序变复杂之后，代码也会变长。下一篇开始，我们会学习如何把代码拆成一个个可以复用的块，也就是函数。
