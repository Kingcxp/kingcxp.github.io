---
title: 基本输入与输出
date: 2026-06-30
icon: keyboard
order: 5
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 输入输出
  - printf
  - scanf
author: Kingcq
---

上一篇我们认识了变量和数据类型，但光声明变量还不够，程序得能和用户交互才行。输入输出就是程序与外界沟通的桥梁。这篇文章我们来把 `C` 语言里最常用的输入输出函数彻底讲清楚。

## 学习目标

读完这篇文章，你会掌握：

- `printf` 的格式控制方法
- `scanf` 读取各种类型数据的方式
- `scanf` 留下的缓冲区坑怎么踩、怎么绕
- `getchar` 和 `putchar` 的用法
- 一些初学者最常犯的输入输出错误

## 什么是输入输出流

在 `C` 语言里，输入输出被抽象成**流（stream）**——你可以把它想象成一根水管，数据像水一样在水管里流动。

程序启动时，系统会自动打开三个标准流：

| 流名称 | 对应设备 | 说明 |
| :-- | :-- | :-- |
| `stdin`（标准输入） | 键盘 | 程序从键盘读取数据，也叫标准输入 |
| `stdout`（标准输出） | 屏幕 | 程序向屏幕输出普通信息，也叫标准输出 |
| `stderr`（标准错误） | 屏幕 | 程序向屏幕输出错误信息，也叫标准错误 |

`stdout` 和 `stderr` 都输出到屏幕，看起来没区别，但系统把它们分开是因为你可以把它们重定向到不同的地方。比如只把错误信息记录到文件里，而正常输出不管。初学阶段，你只用关心 `stdin`（程序从哪里读数据）和 `stdout`（程序把结果写到哪里）。我们接下来要学的 `printf`、`scanf`、`getchar`、`putchar` 默认就使用 `stdin` 和 `stdout`。

## printf：按格式输出

`printf` 的全称是 `print formatted`，意思是“按格式打印”。你可以把它理解成一个模板：先写好格式字符串，再把要填进去的值放在后面。

```c
#include <stdio.h>

int main() {
    int age = 20;
    printf("我今年 %d 岁。\n", age);
    return 0;
}
```

运行结果：

```
我今年 20 岁。
```

`%d` 就是一个占位符，会被后面的 `age` 替换掉。格式字符串里可以写多个占位符，只要后面的值一一对应就行。

```c
printf("姓名：%s，年龄：%d，成绩：%f\n", "Alice", 20, 92.5);
```

### 控制输出宽度与精度

`printf` 还能控制输出格式，比如对齐、小数位数等。

```c
#include <stdio.h>

int main() {
    double pi = 3.14159265;
    int n = 42;

    printf("默认输出：%f\n", pi);
    printf("保留两位小数：%.2f\n", pi);
    printf("占 10 个字符宽度：%10d\n", n);
    printf("左对齐：%-10d\n", n);

    return 0;
}
```

输出：

```
默认输出：3.141593
保留两位小数：3.14
占 10 个字符宽度：        42
左对齐：42        
```

- `%.2f` 表示保留两位小数
- `%10d` 表示至少占 10 个字符宽度，不够就左边补空格
- `%-10d` 表示左对齐，右边补空格

:::tip
如果你发现 `printf` 输出的小数位数和你想的不一样，不要慌，用 `%.nf` 明确指定小数位数即可。`printf` 默认输出 6 位小数。
:::

## printf 的输出目标

`printf` 默认把内容写到 `stdout`。如果需要把内容写到 `stderr`，通常用 `fprintf(stderr, ...)`。初学阶段，你只需知道存在这两种方式即可，大部分时候我们用 `printf` 就足够了。

## scanf：从键盘读取数据

`scanf` 用来从标准输入读取数据，并存到变量里。它的工作方式和 `printf` 类似，也是通过格式占位符来解析输入。

```c
#include <stdio.h>

int main() {
    int age;
    printf("请输入你的年龄：");
    scanf("%d", &age);
    printf("你的年龄是：%d\n", age);
    return 0;
}
```

<span style="color: #E6A23C;">注意 `scanf` 里变量前面要加 `&`，这是取地址运算符。</span>因为 `scanf` 需要知道数据应该写回到内存的哪个位置。

### 连续读取多个值

```c
#include <stdio.h>

int main() {
    int a, b;
    printf("请输入两个整数，用空格隔开：");
    scanf("%d %d", &a, &b);
    printf("a = %d, b = %d\n", a, b);
    return 0;
}
```

你可以输入 `3 5`，也可以输入 `3` 之后按回车再输入 `5`。`scanf` 会自动跳过空白字符。

## scanf 的缓冲区遗留问题

这是初学者最容易踩的坑之一。

当你用 `%d` 读取一个整数后按下回车，回车符 `\n` 会留在输入缓冲区里。如果你紧接着用 `%c` 读取一个字符，`scanf` 会直接把这个残留的 `\n` 读走，导致你以为它“没有读取”。

```c
#include <stdio.h>

int main() {
    int age;
    char grade;

    printf("请输入年龄：");
    scanf("%d", &age);

    printf("请输入等级：");
    scanf("%c", &grade);   // 这里会读到之前剩下的 \n

    printf("年龄：%d，等级：%c\n", age, grade);
    return 0;
}
```

输入：

```
20
A
```

输出：

```
年龄：20，等级：
```

看到没有，等级变成空了，因为 `%c` 把回车读走了。

### 怎么解决

最稳妥的方法是在 `%c` 前面加一个空格：`" %c"`。这个空格会告诉 `scanf` 跳过所有空白字符。

```c
scanf(" %c", &grade);   // 注意 %c 前面有个空格
```

你也可以在两次输入之间用一个 `getchar()` 把残留的回车吃掉：

```c
getchar();             // 吃掉缓冲区里的 \n
scanf("%c", &grade);
```

:::tip
用 `%c` 读字符时，前面加空格是一个好习惯。除非你确实想读取空白字符，否则建议都写成 `" %c"`。
:::

## scanf 的返回值

用户可能输入字母、超出范围的数字，也可能直接结束输入。`scanf` 的返回值表示成功完成了多少个转换：

```c
int age;
if (scanf("%d", &age) != 1) {
    printf("输入有误，请输入整数\n");
    return 1;
}
```

如果输入了非数字，`scanf` 会返回 0，就不会读到 `age` 里。检查返回值是一个好的编程习惯，初学阶段至少要知道它的存在。

## getchar 与 putchar

如果只想读一个字符或输出一个字符，可以用更轻量的 `getchar` 和 `putchar`。

```c
#include <stdio.h>

int main() {
    char c;
    printf("请输入一个字符：");
    c = getchar();

    printf("你输入的是：");
    putchar(c);
    putchar('\n');

    return 0;
}
```

`getchar` 会从标准输入读取一个字符，`putchar` 会向标准输出打印一个字符。它们同样会受到输入缓冲区的影响。

## C++ 中的 cin 和 cout

既然这个系列叫 `C/C++ 语言与程序设计`，提一下 `C++` 的输入输出也无妨。`C++` 用 `cin` 和 `cout`：

```cpp
#include <iostream>

int main() {
    int age;
    std::cout << "请输入年龄：";
    std::cin >> age;
    std::cout << "你的年龄是：" << age << std::endl;
    return 0;
}
```

`cin` 和 `cout` 不需要格式占位符，也不需要写 `&`，代码看起来简洁一些。但在学习初期，我建议你先扎实地掌握 `scanf` 和 `printf`，因为它们能让你更清楚地理解数据类型和内存地址这些概念。

## 常见输入输出错误

1. <span style="color: #F56C6C;">变量前面忘记加 `&`</span>

```c
int x;
scanf("%d", x);    // 错误！应该是 &x
```

2. <span style="color: #F56C6C;">格式占位符和变量类型不匹配</span>

```c
int x;
scanf("%f", &x);   // 错误！%f 对应 float，不是 int
```

3. <span style="color: #F56C6C;">缓冲区残留导致字符读取异常</span>

这个问题前面已经详细讲过了，解决办法是 `" %c"` 或中间加 `getchar()`。

4. <span style="color: #F56C6C;">输出字符串用了单引号</span>

```c
printf('hello');   // 错误！printf 第一个参数应该是字符串，用双引号
printf("hello");   // 正确
```

5. <span style="color: #F56C6C;">`printf` 占位符数量和后面对应不上</span>

```c
printf("a = %d, b = %d\n", a);   // 少了一个参数，行为未定义
```

## 小结

这篇文章我们讲了 `C` 语言的基本输入输出：

- 程序通过**流**与外界交互，最常用的是 `stdin`（键盘输入）和 `stdout`（屏幕输出）
- `printf` 按格式输出，可以用 `%.2f`、`%10d` 等控制显示样式
- `scanf` 按格式读取，变量前要加 `&`
- `scanf` 读字符时容易受到缓冲区残留换行符的影响，用 `" %c"` 可以解决
- `getchar` 和 `putchar` 适合单个字符的读写
- `C++` 的 `cin`/`cout` 更简洁，但学习初期建议先掌握 `scanf`/`printf`

下一篇，我们进入运算的世界，看看 `C` 语言里的算术、关系和逻辑运算符。
