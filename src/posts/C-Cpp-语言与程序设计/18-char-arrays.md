---
title: 字符数组与基础字符串操作
date: 2026-07-04
icon: font
order: 18
category:
  - C/C++ 语言与程序设计
tag:
  - 字符数组
  - 字符串
  - string.h
author: Kingcq
---

## 引入：C 语言怎么表示文字

前面我们处理的大多是数字，但程序经常要处理文字，比如用户名、密码、文件名等。C 语言本身没有专门的“字符串类型”，字符串是用**字符数组**来表示的。

理解字符数组，对后面学习字符串处理、文件读写都很重要。

## 字符数组与字符串的关系

字符数组就是元素类型为 `char` 的数组：

```c
char s[6] = {'H', 'e', 'l', 'l', 'o', '\0'};
```

这个数组表示字符串 `"Hello"`。注意最后一个字符 `\0`，它是字符串的**结束标志**。

更方便的写法是：

```c
char s[6] = "Hello";
```

编译器会自动在末尾加上 `\0`。如果写 `char s[] = "Hello";`，编译器会自动算出长度为 6。

## \0 结束符

`\0` 是一个特殊的字符，ASCII 码值为 0，表示字符串到此结束。所有处理字符串的函数都靠它来知道字符串在哪里结束。

```c
#include <stdio.h>

int main(void)
{
    char s[] = "Hello";
    printf("%s\n", s);
    return 0;
}
```

输出：

```text
Hello
```

:::tip 字符串长度 vs 数组长度
字符串 `"Hello"` 有 5 个可见字符，但存放它的数组至少需要 6 个字节，因为还要留一个位置给 `\0`。
:::

## 常用字符串函数

C 语言提供了很多字符串处理函数，声明在 `<string.h>` 中。

### strlen：求字符串长度

返回字符串中 `\0` 之前的字符个数，不算 `\0`。

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[] = "Hello";
    printf("长度：%zu\n", strlen(s));
    return 0;
}
```

输出：

```text
长度：5
```

### strcpy：复制字符串

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char src[] = "Hello";
    char dest[20];

    strcpy(dest, src);
    printf("dest = %s\n", dest);
    return 0;
}
```

:::warning `strcpy` 不知道目标容量
如果 `dest` 不够大，`strcpy` 会越界。问题不在函数名字，而在它的接口没有接收目标缓冲区容量。只有在调用前已经证明目标足够大时才可以使用。
:::

### `strncpy`：受长度限制的复制及其陷阱

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    const char src[] = "Hello, World!";
    char dest[10];

    strncpy(dest, src, sizeof(dest) - 1);
    dest[sizeof(dest) - 1] = '\0';

    printf("dest = %s\n", dest);
    return 0;
}
```

`strncpy` 不是简单的“安全版 `strcpy`”：

- 源字符串过长时，它可能不会写入终止空字符；
- 源字符串较短时，它会用大量零字节填满剩余长度；
- 它不会告诉调用者是否发生了截断；
- 对“必须完整保存”的姓名、路径等字段，静默截断可能比直接失败更糟。

更清楚的做法是先检查长度，再复制完整字符串：

```c
int copy_text(char *dest, size_t capacity, const char *src)
{
    size_t length = strlen(src);
    if (length >= capacity) return 0;

    memcpy(dest, src, length + 1);
    return 1;
}
```

这个函数的契约是“放不下就失败，不做截断”。若业务确实需要截断，也应由专门函数明确返回是否截断，并保证终止符。

### strcmp：比较字符串

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[] = "apple";
    char b[] = "banana";

    int result = strcmp(a, b);

    if (result < 0) {
        printf("a 在字典序上小于 b\n");
    } else if (result > 0) {
        printf("a 在字典序上大于 b\n");
    } else {
        printf("a 和 b 相等\n");
    }

    return 0;
}
```

:::tip 不要用 == 比较字符串
`if (a == b)` 比较的是地址，不是内容。比较字符串内容必须用 `strcmp`。
:::

### strcat：连接字符串

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[20] = "Hello";
    strcat(s, " World");
    printf("%s\n", s);
    return 0;
}
```

输出：

```text
Hello World
```

同样要注意目标数组要有足够空间。

## scanf 读字符串的注意事项

用 `scanf` 读取字符串很方便，但也有坑：

```c
#include <stdio.h>

int main(void)
{
    char name[20];
    printf("请输入你的名字：");
    scanf("%s", name);
    printf("你好，%s\n", name);
    return 0;
}
```

注意 `name` 前面不需要加 `&`，因为数组名本身就是地址。

但 `scanf("%s", ...)` 遇到空格就会停止。如果输入 "Kingcq Lee"，它只会读到 "Kingcq"。要读取带空格的字符串，可以用 `fgets`：

```c
#include <stdio.h>

int main(void)
{
    char line[100];
    printf("请输入一行文字：");
    fgets(line, sizeof(line), stdin);
    printf("你输入了：%s", line);
    return 0;
}
```

### sprintf 与 sscanf：字符串中的格式化

`sprintf` 和 `sscanf` 与 `printf`、`scanf` 作用类似，但操作对象是字符串而不是控制台：

```c
#include <stdio.h>

int main() {
    // 把格式化的数据写入字符串
    char buffer[100];
    int age = 20;
    double score = 89.5;
    sprintf(buffer, "年龄：%d，成绩：%.1f", age, score);
    printf("%s\n", buffer);  // 年龄：20，成绩：89.5

    // 从字符串中解析数据
    char data[] = "42 3.14";
    int a;
    double b;
    sscanf(data, "%d %lf", &a, &b);
    printf("a = %d, b = %.2f\n", a, b);  // a = 42, b = 3.14

    return 0;
}
```

`sprintf` 在拼接字符串时特别有用，但要注意目标缓冲区必须足够大，否则会越界。更安全的替代是 `snprintf`，它可以指定最大写入长度。

## 字符数组越界问题

字符数组越界是 C 语言最容易出 bug 的地方之一。

```c
char s[5] = "Hello";  // 错误！需要 6 个字节
```

这个例子中，`"Hello"` 需要 6 个字节（5 个字母加 `\0`），但数组只有 5 个字节，`\0` 被写到了数组外面，可能破坏其他数据。

使用 `strcpy`、`strcat` 时必须先证明目标容量足够。`strncpy` 也有不补终止符、零填充和静默截断等陷阱，不能只因为名字里有 `n` 就把它当作自动安全。

## 常见错误与注意事项

1. **忘记给 `\0` 留位置**：声明数组时长度要比可见字符多 1。
2. **用 `==` 比较字符串**：应该使用 `strcmp`。
3. **`scanf` 读入带空格的字符串**：会截断，需要用 `fgets`。
4. **`strcpy`/`strcat` 越界**：确保目标数组足够大，或改用带长度限制的版本。
5. **修改字符串常量**：`char *s = "Hello"; s[0] = 'h';` 是未定义行为，可能崩溃。

## 字节、字符和用户看到的文字不是一回事

C 字符串是以零字节结尾的 `char` 序列。它不知道 UTF-8 中一个用户可见字符可能占多个字节：

```c
strlen("你好")
```

在 UTF-8 环境中通常得到字节数 6，而不是汉字数量 2。字符串函数处理的是字节序列，编码、字形和人类字符边界是更高层问题。

## 始终区分长度和容量

- 长度：当前 `\0` 之前有多少字节；
- 容量：整个数组最多能保存多少字节，包括结尾 `\0`。

容量为 8 的数组最多保存 7 个普通字节再加终止符。复制前只比较字符串长度，不给终止符留空间，是典型越界来源。

## `fgets` 的两个细节

```c
char line[32];
if (fgets(line, sizeof line, stdin) != NULL) {
    line[strcspn(line, "\n")] = '\0';
}
```

- 如果读到了换行，`fgets` 会把它保存在数组中；
- 如果输入行太长，本次不会读到换行，剩余字符还留在流里。

因此稳健代码要识别“缓冲区已满但没有换行”的情况，并决定扩容、报错或丢弃剩余输入。

## 字符串字面量只读使用

```c
const char *message = "hello";
```

不要通过指针修改字符串字面量。需要可修改副本时使用数组：

```c
char message[] = "hello";
message[0] = 'H';
```

## 小结与下一篇预告

今天我们学习了字符数组和字符串的关系、结束符 `\0` 的作用，以及 `<string.h>` 中几个最常用的函数。字符数组是 C 语言处理文本的基础，越界问题需要格外小心。

下一篇先用一个成绩统计项目把控制流、函数、数组和字符串连起来；完成第一次综合练习后，再正式进入指针。
