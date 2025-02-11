---
title: 关于 CRLF 和 LF
date: 2023-01-12
icon: bug
order: 3
category:
  - C 语言学习分享
tag:
  - CPL
author: Kingcq
---

大家可能在做 `CQ's Challenge` 的时候发现利用 `getchar()` 读掉换行符的方式（这在平时 OJ 上都是非常有效的）出现了意想不到的问题，样例在本地跑的是对的，但是交上去就不大对劲，这到底是什么情况？

是这样的，某 CQ 在 `Windows` 下出题，一开始并没有考虑到这个问题，所以使用了自己用 C++ 编写的随机数程序，并直接在 `Windows` 平台的环境下自动生成数据。

那在 `Windows` 平台下生成数据会有什么区别呢？

是这样的，`Windows` 下的换行符和 `Linux` 下的换行符实际上并不一样，`Linux` 下的换行符是 `LF`，也就是大家平时碰到的，行末有一个换行符 `\n` 来表示换行，但是 `Windows` 下就不一样了，它实际上是 `CRLF`，也即用 `\r\n` 来表示换行，所以当你发现你的 `getchar` 不好用了，实际上也许就是 `CRLF` 在捣鬼。

虽然说 OJ 数据按照标准应当是统一使用 `LF` 换行的，大大地提高了各位的做题体验，但是大部分情况下，我们并无法确定出题人用的是 `CRLF` 还是 `LF`，所以还是需要一种更稳妥的读入数据的方式，来帮助我们绕过这个 `CRLF` 和 `LF` 的问题。

解决这个问题的方法一般有两种：

1.老老实实使用 `scanf` 进行读入数据

我们都非常清楚（应该？），`scanf` 读入数据的时候，除了读入单个字符（`%c`），其它情况下，`scanf` 都会自动跳过空白符和一些无关的特殊字符，甚至你还可以利用 `scanf` 来指定输入的格式（如果你会用正则表达式的话），也就是说，当输入数据一切正常的时候，直接使用 `scanf`，而不去在意输入格式的具体情况，是一种非常好的做法。

2.继续使用 `getchar()`，但用另一种方式

`scanf` 比 `getchar` 要智能的多，但是这种智能，是用时间来换的，也就是说，读入同样多的数据量，`scanf` 读入的速度，比 `getchar` 要慢不少，这么强大的工具，怎么会随手把它丢掉。

那用 `getchar` 如何绕过这些问题呢？
答案是：用 `while`，直到读入到自己需要的数据。

这里举个例子可能会更清楚一点。

`scanf`读入整数好慢好慢（当然printf也有点点慢，不过还好），如果你做过 `CQ's Challenge` C题的早期版本，你就会发现用 `scanf` 是无法通过的，只能拿到 80 分，那我们可以利用 `getchar` 来优化整数的读入过程：

```c
#define isdigit(ch) (ch >= '0' && ch <= '9')
// isdigit()实际上在ctype.h当中有定义，这里假定你没有引用
void readInt(int* n) {
    *n = 0;
    // 用来表示这个数字是正数还是负数
    int sign = 1;
    char ch = getchar();
    // 直到读到我们需要的数字
    while(!isdigit(ch)) {
        ch = getchar();
        // 有负号，是负数，在数据都是非负整数的情况下甚至可以舍去这条判断。
        if (ch == '-') {
            sign = -1;
        }
    }
    // 是数字，连续读入（因为是一个完整的数字），直到读到非数字（标志结束）
    while (isdigit(ch)) {
        // 因为上面已经读到一个了，所以我们先把它处理了
        *n = ((*n) << 3) + ((*n) << 1) + ch - '0';
        // 这里的((*n) << 3) + ((*n) << 1)实际上就是 (*n) * 10 的意思，只不过位运算和加法都比乘法快
        // 想一想为什么是这个式子
        ch = getchar();
    }
    *n = (*n) * sign; // 处理符号问题
}

// 具体使用：
int n;
readInt(&n);
```

利用这种写法我们就获得了一种读入整数的更快的方式，你看到我们是怎样绕过 `LF` 和 `CRLF` 的问题的了吗？

实际上这种绕过方式的精髓在于，我们不是碰到无关的就跳过，而是不断读入直到读入到我们需要的东西再进行处理，这样在读入的过程中就自然而然地略过了无关的字符，达成了目标。

用 `CRLF` 出题，我真的错了！特以此篇，以表歉意 OTZ
