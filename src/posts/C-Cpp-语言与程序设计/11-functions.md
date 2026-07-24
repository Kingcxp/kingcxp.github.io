---
title: 函数定义、调用与返回值
date: 2026-07-02
icon: gears
order: 11
category:
  - C/C++ 语言与程序设计
tag:
  - 函数
  - 返回值
author: Kingcq
---

## 引入：为什么需要函数

到现在，你已经能写一些包含变量、分支、循环的小程序了。可一旦程序变长，所有代码都堆在 `main` 函数里，就会像把所有东西塞进一个抽屉——找起来头疼，改起来更头疼。

函数（function）就是帮你“分门别类”的工具。把一段完成特定任务的代码取个名字，之后想用时直接叫这个名字就行。它的好处很明显：

- <span style="color: #E6A23C;">减少重复代码</span>：同样的逻辑不用复制粘贴很多遍。
- <span style="color: #E6A23C;">结构清晰</span>：大问题拆成小问题，每个函数负责一块。
- <span style="color: #E6A23C;">方便调试</span>：哪个功能出错，定位到对应函数即可。

比如，你想多次计算两个数的和，与其每次重写加法逻辑，不如写一个“加法函数”。

## 函数的定义、声明与调用

一个函数通常包含三个要素：<span style="color: #409EFF;">返回类型</span>、<span style="color: #409EFF;">函数名</span>、<span style="color: #409EFF;">参数列表</span>。

最简单的函数定义长这样：

```c
#include <stdio.h>

// 函数定义：返回类型 int，函数名 add，参数是 a 和 b
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(3, 5);  // 函数调用
    printf("3 + 5 = %d\n", result);
    return 0;
}
```

编译运行后输出：

```text
3 + 5 = 8
```

这里 `add(3, 5)` 是<span style="color: #409EFF;">调用</span>，括号里的 `3` 和 `5` 会传给函数里的 `a` 和 `b`，函数内部计算后通过 `return` 把结果返回来。

:::tip 函数名和变量名的规则类似
函数名只能由字母、数字、下划线组成，不能以数字开头，也不能和 C 语言关键字重名。养成“见名知意”的习惯，比如 `add`、`print_menu`、`is_even` 都很好。
:::

## return 与返回值

`return` 有两层含义：

1. 把结果交给调用它的地方；
2. 结束当前函数的执行。

如果函数返回类型不是 `void`，就必须写 `return` 语句，且返回值的类型最好和声明一致。

```c
#include <stdio.h>

int max(int a, int b) {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}

int main() {
    printf("较大值：%d\n", max(10, 20));
    return 0;
}
```

一个函数可以有多个 `return`。对参数检查使用“尽早返回”往往能减少嵌套；当函数需要统一释放多个资源时，集中到一个清理出口又可能更稳妥。不要机械追求出口数量，重点是让控制流和资源清理一眼可见。

:::tip main 函数的参数
你可能看到过 `main()` 和 `main()` 两种写法。在 `C` 语言中，`main()` 明确表示"不接受任何参数"，而 `main()` 表示"参数个数未指定"。为了代码清晰，推荐写 `int main()`。在 `C++` 中两者都表示没有参数。
:::

## void 函数

有些函数只是执行任务，不需要返回结果，比如打印菜单、输出提示。这时返回类型写成 `void`。

```c
#include <stdio.h>

void print_hello(void) {
    printf("你好，欢迎学习 C 语言！\n");
}

int main() {
    print_hello();  // 调用 void 函数，不需要接收返回值
    return 0;
}
```

:::tip void 函数里的 return
`void` 函数里可以写 `return;` 来提前结束，但不能返回具体值。多数情况下我们省略不写。
:::

## 函数原型

在 C 语言中，编译器是从上到下读取代码的。如果 `main` 写在某个函数前面，调用时编译器还不认识它，就会报错。

解决方法有两种：

1. 把函数定义写在 `main` 前面；
2. 在 `main` 前面加一个<span style="color: #409EFF;">函数原型</span>（也叫函数声明）。

函数原型只写函数头，末尾加分号：

```c
#include <stdio.h>

// 函数原型
int add(int a, int b);

int main() {
    printf("%d\n", add(2, 3));
    return 0;
}

// 函数定义
int add(int a, int b) {
    return a + b;
}
```

<span style="color: #67C23A;">实际项目中更推荐第二种做法：把函数原型集中放在头文件（`.h`）里，函数实现放在另一个 `.c` 文件里。</span>这样代码更有条理，也便于多人协作。

## 把函数拆到多个文件的基本思路

当程序变大后，一个文件会装不下。常见的做法是：

- `math_utils.h`：放函数原型；
- `math_utils.c`：放函数的具体实现；
- `main.c`：写 `main` 函数，并 `#include "math_utils.h"`。

```c
// math_utils.h
#ifndef MATH_UTILS_H
#define MATH_UTILS_H
int add(int a, int b);
#endif
```

```c
// math_utils.c
#include "math_utils.h"
int add(int a, int b) {
    return a + b;
}
```

```c
// main.c
#include <stdio.h>
#include "math_utils.h"

int main() {
    printf("%d\n", add(3, 4));
    return 0;
}
```

编译命令通常是：

```bash
gcc main.c math_utils.c -o main
```

现在你只需要知道“可以这样组织代码”即可，后面我们会专门讲多文件编程和头文件保护。

## 常见错误与注意事项

1. <span style="color: #F56C6C;">忘记写返回类型</span>：旧编译器可能默认当作 `int`，但现代 C 不允许，建议始终写明。
2. <span style="color: #F56C6C;">返回值类型不匹配</span>：比如函数声明为 `int`，却 `return 3.14;`，可能会收到警告。
3. <span style="color: #F56C6C;">函数原型和定义不一致</span>：参数类型或返回类型对不上，编译器会报错。
4. <span style="color: #F56C6C;">调用时参数个数不对</span>：`add(3)` 或 `add(3, 4, 5)` 都不行。
5. <span style="color: #F56C6C;">`main` 函数里的 `return 0;`</span>：表示程序正常结束，这是个好习惯。

## 函数首先是一份契约

一个函数不仅有参数和返回类型，还应说明：

- 哪些输入合法；
- 是否允许空指针；
- 会不会修改参数指向的对象；
- 失败怎样表示；
- 返回的指针由谁拥有、能用多久。

```c
// 成功返回 true，并把结果写入 *out；out 不能为空。
bool divide(int numerator, int denominator, double *out);
```

这种约定比“函数内部怎么写”更影响调用者能否正确使用。

## 函数的调用开销与内联优化

每次调用函数时，程序需要做几件事：

1. 把参数的值复制一份交给函数
2. 记住当前执行到哪里了，方便函数执行完后回来
3. 为函数的局部变量分配临时空间
4. 跳转到函数代码的位置执行
5. 执行完后把结果带回来，跳回原来的位置

这些操作在底层都有成本。对于很小的函数（比如只有一两行代码的函数），函数调用的开销可能比函数本身做的事情还多。

### 内联函数是什么？

**内联**（inline）是编译器做的一种优化：它会把函数调用的地方直接替换成函数体的代码，而不是真的跳转过去再跳回来。

打个比方：正常情况下，你需要跑到隔壁房间拿个工具，用完再跑回来（函数调用）。而内联优化相当于：你把工具直接复制一份放在手边，省去了来回跑的时间。


```mermaid
flowchart LR
    subgraph 普通调用
        A1[调用 add(3, 5)] --> B1[跳转到 add 函数]
        B1 --> C1[执行 a + b]
        C1 --> D1[返回结果]
        D1 --> E1[继续执行]
    end
    subgraph 内联优化
        A2[add(3, 5) 被替换<br/>为 3 + 5] --> B2[直接得到结果 8]
        B2 --> C2[继续执行]
    end
```

### 怎么使用 inline 关键字

在函数的返回类型前加上 `inline` 关键字，可以向编译器**建议**将这个函数内联展开：

```c
#include <stdio.h>

// 建议编译器将 add 内联展开
inline int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(3, 5);  // 编译器可能直接替换成 int result = 3 + 5;
    printf("%d\n", result);
    return 0;
}
```

:::tip inline 只是建议，不是命令
`inline` 关键字只是向编译器发出一个请求（建议），编译器**可以忽略它**。现代编译器优化能力很强，即使你不写 `inline`，编译器也会自动判断哪些小函数适合内联；反过来，你写了 `inline`，编译器也可能选择不内联。
:::

### 内联的效果

- **优点**：省去了函数调用的开销（参数的复制、栈帧的分配、跳转和返回），对于频繁调用的小函数，可以提升程序运行速度。
- **缺点**：每次调用都展开一次，如果调用很多次，生成的代码会变长（代码膨胀），反而可能降低程序性能（因为 CPU 缓存压力变大）。

所以内联最适合**短小、频繁调用**的函数，不适合代码很长或者很少调用的函数。

### 内联选择建议

在学习阶段，不要费心去给函数加 `inline`。写出清晰、正确的代码是第一位的。等你积累了一定的项目经验后，再在性能分析工具的指导下，针对性地考虑内联优化。

## 一个函数只做一件事

写函数的时候有一个很实用的原则：<span style="color: #409EFF;">一个函数应该只做一件确定的事</span>。

如果你写了一个函数，发现它既在接收用户输入，又在做计算，还在输出结果，那你应该把它拆开：

```c
// ❌ 混在一起：输入、计算、输出全在一个函数里
void process(void) {
    int a, b;
    scanf("%d%d", &a, &b);
    int sum = a + b;
    printf("%d\n", sum);
}

// ✅ 拆开：每个函数只负责一件事
int read_two_numbers(void) {
    int a, b;
    scanf("%d%d", &a, &b);
    return a + b;
}

void print_sum(int sum) {
    printf("%d\n", sum);
}
```

这样拆分之后，不管将来想把输入改成从文件读取，还是把输出改成写入文件，都只需要改对应的函数，不需要动其他部分。而且 `read_two_numbers` 这个逻辑可以被其他地方复用。

写函数时问自己一个问题：**这个函数的名字能准确概括它做的事情吗？** 如果不能，说明它可能做了太多事，需要拆开。
