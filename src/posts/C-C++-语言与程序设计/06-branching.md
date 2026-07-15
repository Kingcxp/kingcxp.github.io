---
title: 分支结构
date: 2026-07-01
icon: code-branch
order: 7
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 分支
  - if
  - switch
author: Kingcq
---

前面我们学会了用变量存数据和用运算符做判断。但程序不能只“一条道走到黑”，它需要根据不同的情况走不同的路。这就是**分支结构**要做的事情。这篇文章我们来讲 `C` 语言里的分支语句。

## 学习目标

读完这篇文章，你会掌握：

- `if`、`if-else`、`if-else if-else` 的写法
- 嵌套 `if` 的注意事项
- `switch-case` 的用法和 `break` 的作用
- 分支结构里最容易踩的几个坑

## 为什么需要分支

想象你在写一个成绩管理系统：

- 如果分数大于等于 90，输出“优秀”
- 如果分数在 60 到 89 之间，输出“及格”
- 否则输出“不及格”

这种“如果……就……否则……”的逻辑，靠我们前面学的顺序执行和运算是表达不了的，必须引入分支结构。

## if 语句

最简单的分支是 `if`：如果条件成立，就执行大括号里的代码。

```c
#include <stdio.h>

int main() {
    int score = 85;

    if (score >= 60) {
        printf("及格了\n");
    }

    return 0;
}
```

如果 `if` 后面只有一行代码，大括号可以省略：

```c
if (score >= 60)
    printf("及格了\n");
```

但我不建议你省略。以后加代码时很容易忘记补大括号，导致逻辑错误。养成写大括号的习惯，能避免很多麻烦。

## if-else 语句

`if-else` 表示二选一：条件成立走一个分支，不成立走另一个分支。

```c
#include <stdio.h>

int main() {
    int score = 55;

    if (score >= 60) {
        printf("及格了\n");
    } else {
        printf("不及格，补考吧\n");
    }

    return 0;
}
```

## if-else if-else 语句

如果需要判断多种情况，就用 `if-else if-else`：

```c
#include <stdio.h>

int main() {
    int score = 85;

    if (score >= 90) {
        printf("优秀\n");
    } else if (score >= 80) {
        printf("良好\n");
    } else if (score >= 60) {
        printf("及格\n");
    } else {
        printf("不及格\n");
    }

    return 0;
}
```

执行顺序是从上到下，一旦某个条件成立，就会执行对应的代码块，然后整个分支结构结束，后面的条件不会再判断。

:::tip
写 `if-else if` 的时候，要注意条件的顺序。如果把 `score >= 60` 写在 `score >= 90` 前面，那 90 分以上的学生也会被判成“及格”。
:::tip else 的匹配规则：悬挂 else
当 `if-else` 嵌套时，`else` 总是与最近的未匹配 `if` 结合。初学者写嵌套时容易产生误解：

```c
if (a > 0)
    if (a > 10)
        printf("a > 10\n");
else
    printf("a <= 0\n");   // 这个 else 其实属于第二个 if，不是第一个！
```

为了帮助自己和读者理解，建议总是用大括号明确范围：

```c
if (a > 0) {
    if (a > 10) {
        printf("a > 10\n");
    }
} else {
    printf("a <= 0\n");
}
```
:::

## 嵌套 if

`if` 里面还可以再写 `if`，这叫嵌套分支。

```c
#include <stdio.h>

int main() {
    int score = 75;
    int attendance = 85;

    if (score >= 60) {
        if (attendance >= 80) {
            printf("成绩和出勤都达标\n");
        } else {
            printf("成绩达标，但出勤不够\n");
        }
    } else {
        printf("成绩不达标\n");
    }

    return 0;
}
```

嵌套层数多了代码会变得很难读。如果发现自己写了三四层嵌套，可以考虑用更清晰的结构，或者把逻辑拆成函数。

## switch-case 语句

当要判断一个变量是否等于某个固定值时，`switch-case` 比一堆 `if-else if` 更清爽。

```c
#include <stdio.h>

int main() {
    int day = 3;

    switch (day) {
        case 1:
            printf("星期一\n");
            break;
        case 2:
            printf("星期二\n");
            break;
        case 3:
            printf("星期三\n");
            break;
        case 4:
            printf("星期四\n");
            break;
        case 5:
            printf("星期五\n");
            break;
        default:
            printf("周末\n");
            break;
    }

    return 0;
}
```

### break 的作用

`switch` 里每个 `case` 后面通常都要跟 `break`。如果没有 `break`，程序会继续执行下一个 `case` 的代码，这种现象叫做“贯穿”。

```c
switch (day) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
        printf("工作日\n");
        break;
    case 6:
    case 7:
        printf("周末\n");
        break;
    default:
        printf("无效日期\n");
}
```

在这个例子里，1 到 5 都会走到同一个输出，这是“贯穿”的合理利用。但大部分时候，我们写 `case` 是想让它只执行一个分支，所以别忘了 `break`。

:::tip
`switch` 只能用于整型、字符型或枚举类型，不能用于浮点数或字符串。如果你需要判断小数范围，还是得用 `if-else`。
:::

### default

`default` 相当于 `if-else` 里的 `else`，处理所有没被列出来的情况。写上它是个好习惯，可以提高程序的健壮性。

## 条件表达式

上一篇我们学过的三元运算符 `?:` 也可以用来做分支，适合简单的二选一。

```c
#include <stdio.h>

int main() {
    int a = 5, b = 3;
    int max = (a > b) ? a : b;
    printf("较大值是：%d\n", max);
    return 0;
}
```

三元表达式写在一行里很简洁，但嵌套太多会降低可读性。一般只建议一层三元表达式。

## 常见错误与注意事项

1. **把 `==` 写成 `=`**

这是 `C` 语言里最常见的 bug 之一：

```c
int a = 0;
if (a = 1) {       // 这里是赋值，a 被改成 1，条件恒为真
    printf("a 等于 1\n");
}
```

正确的写法：

```c
if (a == 1) {
    printf("a 等于 1\n");
}
```

有些程序员会故意把常量写在左边，比如 `if (1 == a)`，这样如果漏写一个等号，`1 = a` 会直接编译报错。这个习惯叫“Yoda 条件”，你可以试试。

2. **忘记写大括号**

```c
if (score >= 60)
    printf("及格\n");
    printf("奖励一朵小红花\n");   // 这一行其实不在 if 里！
```

3. **`switch` 里漏写 break**

```c
case 1:
    printf("一\n");
    // 漏了 break，会继续执行 case 2
case 2:
    printf("二\n");
    break;
```

4. **用 `switch` 判断范围**

```c
switch (score) {
    case score >= 90:   // 错误！case 后面必须是常量表达式
        ...
}
```

## 小结

这篇文章我们讲了 `C` 语言的分支结构：

- `if`：单分支
- `if-else`：二选一
- `if-else if-else`：多分支
- 嵌套 `if`：处理更复杂的组合条件
- `switch-case`：适合判断离散值，注意 `break` 和 `default`
- 三元表达式：简单二选一时使用

分支结构让程序有了“判断力”。但程序还需要能反复做一件事的能力，这就是我们下一篇要讲的内容：循环结构。
