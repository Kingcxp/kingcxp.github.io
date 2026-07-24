---
title: 变量、数据类型与占位符
date: 2026-06-29
icon: database
order: 4
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 变量
  - 数据类型
  - printf
  - scanf
author: Kingcq
---

上一篇文章我们从计算机最底层讲到了 `C` 语言是怎么诞生的。现在，终于要开始写真正的代码了。这一篇我们先来解决一个最基础的问题：程序是怎么“记住”数据的。

## 变量是干什么用的？

想象一下，你要写一个程序，算一下圆的面积。公式是 `面积 = π × 半径 × 半径`。如果程序里不能“记住”半径和 π 的值，那你每次要用的时候都得重新写一遍，而且一旦半径变了，所有地方都要改。

变量就是程序里用来“临时存数据”的盒子。你给它取个名字，把数据放进去，之后就可以通过这个名字来读写它。

在 `C` 语言里，每个变量都有两个属性：

- <span style="color: #409EFF;">名字</span>：你叫它的方式，比如 `radius`、`pi`
- <span style="color: #409EFF;">类型</span>：这个盒子里能放什么形状的数据，比如整数、小数、字符

类型很重要，因为不同类型的数据在内存里占用的空间不同，能参与的操作也不一样。

## 基本数据类型

下面这张表列出了 `C` 语言里最常用的几种基本类型。

| 类型 | 说明 | 示例 | 占位符 |
| :-- | :-- | :-- | :-- |
| `int` | 整数 | `10`、`-5` | `%d` |
| `float` | 单精度小数 | `3.14f` | `%f` |
| `double` | 双精度小数 | `3.14159` | `printf` 用 `%f`，`scanf` 用 `%lf` |
| `char` | 单个字符 | `'A'` | `%c` |
| `bool` | 真 / 假 | `true`、`false` | 通常用 `%d` 输出 |

:::tip
`bool` 类型在 `C99` 标准之前并不是原生支持的。为了兼容性和可读性，我们在代码开头加上 `#include <stdbool.h>`，然后就可以使用 `bool`、`true`、`false` 了。在底层，它本质上就是 `_Bool` 类型。
:::

下面是一段展示这些类型的完整代码：

```c
#include <stdio.h>
#include <stdbool.h>

int main() {
    int age = 20;
    float pi = 3.14f;
    double precise_pi = 3.1415926535;
    char grade = 'A';
    bool passed = true;

    printf("age = %d\n", age);
    printf("pi = %f\n", pi);
    printf("precise_pi = %f\n", precise_pi);
    printf("grade = %c\n", grade);
    printf("passed = %d\n", passed);

    return 0;
}
```

编译运行之后，你会看到每个变量都按自己的格式输出了。注意 `bool` 用 `%d` 输出时，`true` 显示为 `1`，`false` 显示为 `0`。

## 声明与初始化

声明一个变量就是告诉编译器：“我要一个这种类型的盒子，名字叫这个”。

```c
int count;
```

初始化则是在声明的同时给它一个初值：

```c
int count = 0;
```

建议在声明变量的时候尽量顺手初始化。一个没有被初始化的变量，里面存的是内存里原来的“垃圾值”，直接拿去用很容易导致奇怪的结果。

:::tip
`C` 语言对变量声明的位置比较宽松。在 `C99` 之前，所有变量必须写在函数块的开头；`C99` 及以后，你可以在需要的地方再声明。为了养成良好的习惯，建议先声明再使用，不要声明得太零散。

<span style="color: #F56C6C;">直接使用没有被初始化的变量是一种“未定义行为”，未定义行为表示在编译器中没有明确定义执行效果的行为，包含该行为编译出来的程序运行时可能会出现任何结果，甚至程序崩溃。</span>

因此，为了避免这种情况，养成良好的习惯：<span style="color: #67C23A;">声明变量时就初始化</span>。
:::

## sizeof：看看类型占多大

不同的数据类型在内存里占用的字节数是不一样的。`sizeof` 运算符可以告诉你某个类型或变量占用多少字节。

```c
#include <stdio.h>

int main() {
    printf("sizeof(int) = %zu\n", sizeof(int));
    printf("sizeof(float) = %zu\n", sizeof(float));
    printf("sizeof(double) = %zu\n", sizeof(double));
    printf("sizeof(char) = %zu\n", sizeof(char));

    return 0;
}
```

输出大概是：

```
sizeof(int) = 4
sizeof(float) = 4
sizeof(double) = 8
sizeof(char) = 1
```

:::tip
`%zu` 是专门用来输出 `sizeof` 结果的格式符，因为 `sizeof` 返回的类型是 `size_t`。应直接使用 `%zu`；若工具链不支持 C99，应优先升级或明确选择兼容方案，而不是让格式符与实参类型不匹配。
:::

## 数据在内存中的存储细节

理解了变量和类型的基本概念后，再来看看这些数据在内存里到底是怎么存的。这对你理解类型的取值范围和潜在陷阱很有帮助。

### 整型：有符号与无符号

默认情况下，`int` 是<span style="color: #409EFF;">有符号</span>的（`signed`），即它可以表示正数和负数。你也可以用 `unsigned` 关键字声明<span style="color: #409EFF;">无符号</span>整型，它只能表示非负数，但正数的范围更大。

| 类型 | 大小 | 取值范围 |
| :-- | :-- | :-- |
| `int`（有符号） | 4 字节（32 位） | -2,147,483,648 ~ 2,147,483,647 |
| `unsigned int` | 4 字节（32 位） | 0 ~ 4,294,967,295 |
| `short` | 2 字节（16 位） | -32,768 ~ 32,767 |
| `unsigned short` | 2 字节（16 位） | 0 ~ 65,535 |
| `long long` | 8 字节（64 位） | -2^63 ~ 2^63-1 |

有符号整型用<span style="color: #409EFF;">最高位</span>（最左边的一位）作为符号位：0 表示正数，1 表示负数。剩下 31 位（以 32 位 `int` 为例）用来存数值。

那么具体数值是怎么算的呢？现代计算机一律采用<span style="color: #409EFF;">补码</span>（two's complement）来表示有符号整数。补码的规则很简单：

- <span style="color: #409EFF;">正数</span>：直接转成二进制，符号位为 0。比如 `+42` 就是 `0b000...00101010`。
- <span style="color: #409EFF;">负数</span>：先取绝对值的二进制，然后<span style="color: #409EFF;">按位取反（所有 0 变 1、1 变 0），再加 1</span>。

例如 `-42`：

1. `+42` 的二进制：`...00000000 00101010`
2. 按位取反：`...11111111 11010101`
3. 加 1：`...11111111 11010110`（即 `-42`）

<span style="color: #E6A23C;">为什么负数的范围比正数多 1？</span>

因为补码表示中，`0` 只有一种编码（所有位都是 0）。如果不把 `0` 算两次，那么对于 32 位来说，总共 2^32 种组合，有一半（2^31 个）用来表示非负数（`0` 和正数），另一半（2^31 个）用来表示负数。所以正数的最大值是 2^31 - 1（因为要留一个给 0），而负数的最小值是 -2^31。这就是为什么 `int` 的范围是 <span style="color: #409EFF;">-2,147,483,648 ~ 2,147,483,647</span>，负数比正数多了一个。

无符号整型则没有符号位，所有位都用来表示数值，所以 32 位无符号的范围是 0 ~ 4,294,967,295。

:::tip
判断一个类型是有符号还是无符号，可以用 `%d`（有符号十进制）和 `%u`（无符号十进制）来输出对比：

```c
unsigned int u = 4294967295;
printf("%u\n", u);   // 4294967295
printf("%d\n", u);   // 错误：格式符与实参类型不匹配，行为未定义
```
:::

### 浮点型：小数的存储方式

`float` 和 `double` 采用 <span style="color: #409EFF;">IEEE 754</span> 标准来存储小数。它的思想类似于科学记数法：

```
值 = (-1)^符号 × 1.尾数 × 2^(指数 - 偏移量)
```

以 32 位 `float` 为例，它在内存里分成三部分：

| 位数 | 名称 | 说明 |
| :-- | :-- | :-- |
| 1 位 | 符号位（S） | 0 代表正，1 代表负 |
| 8 位 | 指数位（E） | 实际指数 = E - 127（偏移量） |
| 23 位 | 尾数位（M） | 存储小数部分，整数部分的 1 被省略 |

举个例子，`3.14` 在内存中并不是精确等于 `3.14`，而是最接近它的一个二进制小数。这就是为什么浮点数运算有时会出现微小的精度误差（比如 `0.1 + 0.2` 不等于 `0.3`）。

`double` 用 1 位符号、11 位指数（偏移量 1023）、52 位尾数，精度更高，但结构原理相同。

### 布尔类型：为什么不用 1 位就够了？

`bool` 只有 `true`（1）和 `false`（0）两种状态，理论上 1 个二进制位就够了。但在 `C` 语言中，`bool` 占用 <span style="color: #E6A23C;">1 个字节（8 位）</span>。原因有两个：

1. <span style="color: #E6A23C;">最小寻址单位</span>：CPU 和内存之间传输数据的最小单位是字节（byte），而不是位（bit）。你无法单独请求"读取内存中的第 3 位"——一次至少读一个字节。
2. <span style="color: #E6A23C;">对齐与性能</span>：按字节对齐访问比按位操作快得多。用一个字节存一个布尔值，CPU 可以直接读写；如果用 1 位，每次都需要额外的"打包/拆包"操作，反而更慢。

所以，这是一次典型的<span style="color: #E6A23C;">用空间换时间</span>——多花 7 位的空间来换取更快的访问速度。

### 字符类型与 ASCII 表

`char` 在底层其实就是一个 <span style="color: #409EFF;">8 位整数</span>，它的值对应着 ASCII 编码表中的字符。

| ASCII 范围 | 对应字符 | 示例 |
| :-- | :-- | :-- |
| 48 ~ 57 | 数字 `'0'` ~ `'9'` | `'0'` = 48 |
| 65 ~ 90 | 大写字母 `'A'` ~ `'Z'` | `'A'` = 65 |
| 97 ~ 122 | 小写字母 `'a'` ~ `'z'` | `'a'` = 97 |
| 32 | 空格 | — |
| 0 ~ 127 | ASCII 标准字符集 | — |

你可以用 `%d` 输出字符的 ASCII 码值：

```c
char ch = 'A';
printf("%c\n", ch);  // A
printf("%d\n", ch);  // 65
```

普通 `char`、`signed char` 和 `unsigned char` 是三个不同的类型。普通 `char` 究竟按有符号还是无符号解释，由编译器和目标平台决定，不能写依赖某一种结果的代码。

- 表示 C 字符串中的字符时，使用普通 `char`。
- 表示明确的有符号小整数时，使用 `signed char`，但通常更推荐 `<stdint.h>` 中的 `int8_t`（如果平台提供）。
- 处理原始字节、文件内容或像素通道时，使用 `unsigned char`。

```c
char letter = 'A';
unsigned char byte = 200;
printf("%c %u\n", letter, (unsigned int)byte);
```

## 字面量

代码里直接写出来的值就叫做<span style="color: #409EFF;">字面量</span>。比如：

```c
int a = 100;          // 100 是整数字面量
float b = 3.14f;      // 3.14f 是浮点数字面量
double c = 2.718;     // 2.718 是双精度字面量
char d = 'x';         // 'x' 是字符字面量
```

注意几个细节：

- 写 `float` 字面量时，最好加上 `f` 后缀，比如 `3.14f`。不加的话编译器可能默认当成 `double`，再转换回 `float`，虽然通常能完成转换，但加上后缀能明确表达意图。
- 字符字面量用单引号 `'a'`，字符串字面量用双引号 `"hello"`，这两个不能混用。

## 常量：#define 和 const

有些值在程序运行期间不应该被修改，比如圆周率 π、数组的最大长度等。这时我们可以用<span style="color: #409EFF;">常量</span>。

`C` 语言里定义常量常见有两种方式。

### 用 #define 定义宏常量

```c
#include <stdio.h>

#define PI 3.14159
#define MAX_SIZE 100

int main() {
    printf("PI = %f\n", PI);
    printf("MAX_SIZE = %d\n", MAX_SIZE);
    return 0;
}
```

`#define` 是预处理指令，在编译之前，编译器会把代码里所有 `PI` 替换成 `3.14159`。它没有类型检查，也不能被调试器跟踪，所以用起来要稍微小心。

### 用 const 定义常量

```c
#include <stdio.h>

int main() {
    const double PI = 3.14159;
    const int MAX_SIZE = 100;

    printf("PI = %f\n", PI);
    printf("MAX_SIZE = %d\n", MAX_SIZE);

    return 0;
}
```

`const` 常量有类型，编译器会做类型检查。如果代码里试图修改它，编译器会直接报错。现在更推荐使用 `const`。

:::tip
`#define` 适合用来定义宏、条件编译，或者一些和代码结构相关的常量。单纯用来存一个不变的数值时，`const` 更安全、更清晰。
:::

:::tip 执行速度：变量、const 常量、#define 谁更快？

初学者常会好奇：用变量、`const` 和 `#define` 到底哪个执行更快？这背后涉及的是它们在内存中的处理方式。

<span style="color: #409EFF;">普通变量</span>
变量存储在内存中。程序运行时，CPU 每次读写变量都需要通过地址去访问内存，而内存的访问速度远慢于 CPU 自身的运算速度（虽然现代 CPU 有高速缓存来缓解，但本质仍是运行时的内存访问）。

<span style="color: #409EFF;">`const` 常量</span>
`const` 常量在大多数情况下也存储在内存中，访问时同样需要读内存。但在较高的优化级别下，编译器可能会把 `const` 常量的值直接嵌入到指令里（类似于 `#define` 的效果），从而省去一次内存访问。不过这种优化并不总是发生，取决于编译器、优化级别和代码上下文。

<span style="color: #409EFF;">`#define` 宏常量</span>
`#define` 在编译开始前就已经完成了文本替换。代码中的 `PI` 被直接替换成了 `3.14159`，这个值作为立即数直接出现在指令中，程序运行时<span style="color: #409EFF;">根本不需要再去内存中读取</span>。因此从理论上说，`#define` 完全没有运行时的内存访问开销，速度最快。

用一个生活类比来理解：

- <span style="color: #409EFF;">普通变量</span>：你把一个数字写在便利贴上，贴在冰箱上。每次要用都得跑过去看一眼。
- <span style="color: #409EFF;">`const` 常量</span>：你把数字写在便利贴上，又用透明胶带牢牢粘住。要用还是得跑去看，但聪明的编译器有时会说"我记得这个数，你不用跑了"。
- <span style="color: #409EFF;">`#define`</span>：你把数字直接刻在每件工具上。要用的时候低头就能看见，根本不用跑。

不过在实际开发中，这种速度差异通常微乎其微。除非在极端性能敏感的场景（如嵌入式系统、游戏引擎的核心循环），否则大可不必为此纠结。<span style="color: #67C23A;">代码的可读性和正确性远比这种微小的性能差异重要。</span>
:::

## printf 与 scanf 的格式占位符

`printf` 和 `scanf` 是 `C` 语言最常用的输入输出函数。它们本身并不清楚你要输出什么类型的数据，所以需要靠<span style="color: #409EFF;">格式占位符</span>来告诉它们。

常用的占位符有这些：

| 占位符 | 对应类型 | 说明 |
| :-- | :-- | :-- |
| `%d` | `int` | 十进制整数 |
| `%f` | `float` / `double`（输出） | 浮点数 |
| `%lf` | `double`（输入） | `scanf` 读 `double` 必须用 `%lf` |
| `%c` | `char` | 单个字符 |
| `%s` | 字符串 | 字符数组 |
| `%p` | 指针 | 输出地址 |
| `%lld` | `long long` | 长长整型 |
| `%zu` | `size_t` | `sizeof` 的结果 |

### 控制输出格式

占位符不仅可以指定数据类型，还可以通过附加修饰符来控制输出的具体样式——比如保留几位小数、输出宽度、进制转换等。基本语法是：

```
%[标志][宽度][.精度]类型
```

<span style="color: #409EFF;">控制小数位数</span>

用 `%.nf` 可以指定保留 `n` 位小数：

```c
double pi = 3.1415926535;
printf("%.2f\n", pi);   // 3.14
printf("%.4f\n", pi);   // 3.1416（四舍五入）
printf("%.10f\n", pi);  // 3.1415926535
```

<span style="color: #409EFF;">指定输出宽度</span>

用 `%Nd` 让输出至少占 `N` 个字符宽度，默认右对齐：

```c
int a = 42;
printf("%5d\n", a);   // "   42"（右对齐，宽度 5）
printf("%-5d\n", a);  // "42   "（左对齐，加 - 标志）
```

宽度不够时默认用空格补齐，加 `0` 标志可以用前导零补齐：

```c
printf("%05d\n", a);  // "00042"
```

<span style="color: #409EFF;">输出 8 进制与 16 进制</span>

整数可以用 `%o`（8 进制）、`%x`（16 进制小写）、`%X`（16 进制大写）输出：

```c
int n = 255;
printf("%d\n", n);   // 255     （十进制）
printf("%o\n", n);   // 377     （八进制）
printf("%x\n", n);   // ff      （十六进制小写）
printf("%X\n", n);   // FF      （十六进制大写）
```

如果希望 16 进制输出带 `0x` 前缀，可以加 `#` 标志：

```c
printf("%#x\n", n);  // 0xff
printf("%#X\n", n);  // 0xFF
```

<span style="color: #409EFF;">显示正号</span>

默认情况下负数显示负号，正数不显示正号。加 `+` 标志可以让正数也显示正号：

```c
int a = 42, b = -42;
printf("%+d\n", a);  // +42
printf("%+d\n", b);  // -42
```

这些修饰符可以组合使用，比如 `printf("%+08X\n", 255);` 输出 `+00000FF`。多动手试一试就能熟练掌握。

这里有一个特别容易踩的坑：`printf` 输出 `double` 时用 `%f` 可以正常工作，但 `scanf` 读 `double` 时必须用 `%lf`。如果你写成 `%f`，程序行为是未定义的，可能会直接崩溃。

```c
#include <stdio.h>

int main() {
    double x;
    printf("请输入一个小数：");
    scanf("%lf", &x);          // 注意这里是 %lf
    printf("你输入的是：%f\n", x);  // 输出时用 %f

    return 0;
}
```

### 为什么 scanf 需要 &？

这是一个初学者最容易困惑的问题，原因要从 `C` 语言的参数传递规则说起。

还记得我们一开始把变量比作"盒子"吗？每个盒子都摆在内存的某个位置上，都有一个独一无二的位置编号，这就是<span style="color: #E6A23C;">地址</span>。

`C` 语言中，函数参数默认是<span style="color: #E6A23C;">按值传递</span>的——也就是说，当你调用 `scanf("%lf", x)` 时，传入的是盒子里装的那个数值，而不是盒子本身。`scanf` 拿到数值后，虽然想"往这个盒子里写入新数据"，但它手上只有数值，不知道盒子在哪儿，所以没办法把新数据放进去。

`&` 符号的作用就是<span style="color: #E6A23C;">取地址</span>，即获取变量这个盒子的位置编号。你告诉 `scanf` 的是 `&x`（盒子 `x` 的位置编号），`scanf` 就能顺着这个编号找到盒子 `x` 所在的位置，直接把读到的数据放进去。

用更形象的比喻来说：

> 变量 `x` 就像一个带编号的信箱。`x` 的值是信箱里当前装的信件。`&x` 就是信箱的门牌号。如果你只把信件交给 `scanf`，它看完就扔了，没法把新信放回你的信箱。但如果你把门牌号告诉 `scanf`，它就能直接走过去，打开信箱，把新信放进去。

所以记住：<span style="color: #E6A23C;">凡是要通过 `scanf` 往变量里写入数据的，基本都要加 `&`</span>。

唯一例外是字符串（字符数组），因为数组名本身就已经表示地址，不需要再加 `&`。这个我们在讲到数组时会专门说明。

## 类型选择建议

初学时经常会纠结：什么时候用 `int`，什么时候用 `float`，什么时候用 `double`？这里给几个简单原则：

- 计数、索引、年龄、个数这一类“没有小数”的量，用 `int`。
- 需要小数的场景，优先用 `double`。`double` 精度更高，现代计算机上速度和 `float` 差别不大。
- 只有在内存或性能特别敏感，或者明确知道精度要求不高时，才用 `float`。
- 单个字符用 `char`，布尔状态用 `bool`。

不用一开始就追求“最高效”的类型，先把程序写对更重要。

## 命名规范

变量名虽然不会影响程序能不能跑，但会严重影响代码好不好读。写代码一半是在给计算机下指令，另一半是在给未来读代码的人（包括你自己）写文档。

常见的命名风格有三种：

| 风格 | 示例 | 常见使用场景 |
| :-- | :-- | :-- |
| <span style="color: #409EFF;">snake_case（蛇形命名）</span> | `student_name`、`max_value` | C 语言标准库、Linux 内核、Python |
| <span style="color: #409EFF;">camelCase（小驼峰）</span> | `studentName`、`maxValue` | Java、JavaScript、部分 C++ 项目 |
| <span style="color: #409EFF;">PascalCase（大驼峰）</span> | `StudentName`、`MaxValue` | C++/Java 类名、结构体名 |

### C 语言：基本只用 snake_case

C 语言社区的风格非常统一：<span style="color: #409EFF;">变量、函数、结构体类型几乎都用 snake_case</span>。唯一的例外是宏常量，习惯全大写加下划线：

```c
#define MAX_BUFFER_SIZE 1024
#define ARRAY_LENGTH 100
```

比如 Linux 内核、Redis、Nginx 这些大型 C 项目，源码里基本都是清一色的 snake_case。

### C++：风格相对混乱

C++ 因为同时继承了 C 语言和面向对象两种传统，命名风格比较杂：

- <span style="color: #409EFF;">类名 / 结构体名</span>：通常用大驼峰 `PascalCase`，比如 `class StudentManager`。
- <span style="color: #409EFF;">变量和函数</span>：标准库偏爱 snake_case（`std::vector`、`std::find_if`），但很多项目用 camelCase（`getStudentName`）。
- <span style="color: #409EFF;">成员变量</span>：有人喜欢加 `m_` 前缀（`m_name`），有人喜欢下划线后缀（`name_`），也有人什么都不加。
- <span style="color: #409EFF;">宏常量</span>：和 C 一样，全大写加下划线。

:::tip 我的建议
初学阶段不用纠结哪种风格“最正宗”，关键是<span style="color: #67C23A;">在同一个项目里保持一致</span>。如果你跟着我这套教程写 C 代码，建议统一使用 snake_case；到了 C++ 面向对象部分，类名用 PascalCase，变量和函数用 snake_case 或 camelCase 都可以，但选定一种就不要混着用。
:::

### 代码格式化工具

手动保持代码风格一致很累，而且容易遗漏。好在有工具可以自动帮你格式化代码。对于 `C/C++`，最常用的是 <span style="color: #409EFF;">clang-format</span>。

#### 安装 clang-format

```bash
# Windows (scoop)
scoop install llvm  # clang-format 包含在 llvm 中

# macOS (Homebrew)
brew install clang-format

# Linux (Ubuntu/Debian)
sudo apt install clang-format
```

#### 基本用法

```bash
# 格式化单个文件，直接修改原文件
clang-format -i hello.c

# 查看格式化结果但不修改（只输出到终端）
clang-format hello.c

# 使用自定义风格文件
clang-format -i --style=file hello.c
```

#### 配置代码风格

`clang-format` 支持多种预定义风格，也可以在项目根目录放一个 `.clang-format` 配置文件来自定义。生成配置文件的命令是：

```bash
clang-format -style=llvm -dump-config > .clang-format
```

常用的预定义风格有：

| 风格 | 特点 |
|------|------|
| `llvm` | LLVM 项目风格，缩进 2 空格 |
| `google` | Google 风格，缩进 2 空格 |
| `mozilla` | Mozilla 风格，缩进 2 空格 |
| `chromium` | Chromium 风格，缩进 2 空格 |
| `microsoft` | Microsoft 风格，缩进 4 空格 |
| `gnu` | GNU 风格，缩进 2 空格 |

```bash
# 使用 Google 风格格式化
clang-format -i --style=google hello.c
```

#### 在 VSCode 中使用

安装了 `C/C++` 插件后，VSCode 已经集成了 `clang-format`。打开设置（`Ctrl+,`），搜索 `format`，将 `Editor: Default Formatter` 设为 `C/C++` 插件，然后启用 `Editor: Format On Save`——这样每次保存文件时都会自动格式化。

你也可以随时按 `Shift+Alt+F`（Windows/Linux）或 `Shift+Option+F`（macOS）手动格式化当前文件。

:::tip 缩进：空格还是 Tab？
这是一个老生常谈的问题。`C` 语言社区的主流习惯是<span style="color: #409EFF;">缩进使用 4 个空格</span>（而不是 Tab）。因为不同编辑器对 Tab 的显示宽度可能不同（2 格、4 格、8 格），用空格可以确保代码在任何环境下看起来都一样。`clang-format` 默认也是用空格。

无论你选择哪种，<span style="color: #E6A23C;">同一个项目里必须统一</span>。最好直接用 `clang-format` 自动处理，省去手动对齐的麻烦。
:::

## 常见错误与注意事项

1. <span style="color: #F56C6C;">变量未初始化就使用</span>

```c
int x;
printf("%d\n", x);  // x 的值不确定，输出是垃圾值
```

2. <span style="color: #F56C6C;">`scanf` 读 `double` 写成 `%f`</span>

```c
double x;
scanf("%f", &x);   // 错误！应该是 %lf
```

3. <span style="color: #F56C6C;">字符和字符串混淆</span>

```c
char c = "A";      // 错误！"A" 是字符串，类型不匹配
char c = 'A';      // 正确
```

4. <span style="color: #F56C6C;">`#define` 末尾加分号</span>

```c
#define PI 3.14;   // 不要加分号！会把分号也替换进去
```

## 变量更准确的模型：对象、类型和值

“盒子”比喻适合入门，但要补上三点：

- <span style="color: #409EFF;">对象</span>是一段在生命周期内可用于保存值的存储；
- <span style="color: #409EFF;">类型</span>决定这段比特怎样解释、能做哪些运算；
- <span style="color: #409EFF;">变量名</span>只是源代码中访问对象的一种方式，对象还可能通过指针访问。

```c
int score = 90;
```

可以理解为：创建一个 `int` 对象，把 `90` 存入，并在当前作用域给它名字 `score`。编译器优化后不保证真的为它保留一个固定内存槽，但语言层面的类型和值仍然成立。

## 类型大小和范围不要写死

C 只保证 `sizeof(char) == 1`，且不同整型满足最低范围和大小顺序，不保证 `int` 永远是 32 位。需要明确宽度时，可以使用 `<stdint.h>` 中的 `int32_t`、`uint64_t` 等类型；其中某些精确宽度类型只有平台能够提供时才存在。

查询范围应使用头文件常量：

```c
#include <limits.h>
#include <float.h>

printf("int: %d 到 %d\n", INT_MIN, INT_MAX);
printf("double 有效十进制数字约为 %d 位\n", DBL_DIG);
```

## 隐式转换是很多坑的来源

```c
int total = 5;
int count = 2;
double average = total / count;  // 先做整数除法，结果是 2.0
```

至少一个操作数要先转成浮点类型：

```c
double average = (double)total / count;
```

有符号与无符号混合比较也可能先把负数转换成很大的无符号数。除非接口明确需要位级无符号语义，不要因为“数量不能为负”就无条件把所有循环变量改成 `unsigned int`；数组长度常用 `size_t`，与普通整数交互时要明确转换边界。

## 小结

这一篇我们讲了变量的意义、常用的数据类型、如何声明和初始化变量、字面量、两种常量定义方式，以及 `printf` 和 `scanf` 的格式占位符。

核心要记住的几点：

- 变量是程序用来临时存储数据的容器
- 每个变量都有类型，类型决定了它能存什么、占多少内存
- `scanf` 读 `double` 一定用 `%lf`
- 常量推荐用 `const`，宏常量用 `#define` 要谨慎

下一篇会先补上一个关键地基：程序的内存模型、对象存储期与生命周期。理解对象何时存在、通常存在哪里之后，再学习输入输出会更容易理解为什么 `scanf` 需要地址。
