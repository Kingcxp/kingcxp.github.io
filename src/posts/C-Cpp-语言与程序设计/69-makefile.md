---
title: Makefile：自动化项目构建
date: 2026-07-19
icon: gears
order: 69
category:
  - C/C++ 语言与程序设计
tag:
  - Makefile
  - 构建工具
  - make
  - C
  - C++
author: Kingcq
---

## 引入：为什么需要构建工具

随着程序变大，手动编译的方式逐渐暴露问题：

```bash
gcc -c main.c -o main.o
gcc -c utils.c -o utils.o
gcc -c network.c -o network.o
gcc main.o utils.o network.o -o program
```

每次修改代码都要重新敲一遍这些命令，不仅麻烦，还容易敲错。更糟糕的是，如果项目有几十个源文件，你不可能每次全部重新编译——大部分文件没变，只需要编译改过的文件。

`Makefile` 就是来解决这个问题的。它告诉 `make` 工具：项目有哪些源文件、它们之间的依赖关系、如何编译链接。你只需要在终端敲一个 `make`，剩下的交给工具自动完成。

---

## 学习目标

- 理解 `Makefile` 的基本语法：目标、依赖、命令
- 学会编写变量、模式规则和伪目标
- 掌握 `make clean` 清理构建产物

---

## Makefile 基本语法

一个 `Makefile` 由若干条<span style="color: #409EFF;">规则</span>组成。每条规则的格式是：

```makefile
目标: 依赖项
<Tab>命令
```

- <span style="color: #409EFF;">目标</span>：要生成的文件名（如 `hello.o`、`hello`）
- <span style="color: #409EFF;">依赖项</span>：生成目标所需的文件
- <span style="color: #409EFF;">命令</span>：如何从依赖项生成目标（<span style="color: #E6A23C;">注意：命令前面必须是 Tab 键，不是空格！</span>）

### 第一个 Makefile

假设项目有三个文件：`main.c`、`utils.c`、`utils.h`。

```makefile
# 最简单的 Makefile
hello: main.o utils.o
	gcc main.o utils.o -o hello

main.o: main.c utils.h
	gcc -c main.c -o main.o

utils.o: utils.c utils.h
	gcc -c utils.c -o utils.o

clean:
	rm -f *.o hello
```

<span style="color: #E6A23C;">把这个文件保存为 `Makefile`（注意没有后缀），然后在终端执行：</span>

```bash
make        # 编译整个项目
./hello     # 运行
make clean  # 清理中间文件和可执行文件
```

当你执行 `make` 时，它会：

1. 读入 `Makefile`
2. 找到第一个目标 `hello`，检查它的依赖 `main.o` 和 `utils.o` 是否存在
3. 如果某个 `.o` 文件不存在，或者对应的 `.c` 文件比 `.o` 文件更新，就重新编译
4. 所有 `.o` 文件就绪后，链接生成 `hello`

这就是 `make` 的增量编译：<span style="color: #409EFF;">只重新编译变动的文件</span>，没改过的文件直接用之前的编译结果，大大节省时间。

### 为什么用 Tab 而不是空格

这是一个历史遗留问题，但也是初学者最容易踩的坑。如果命令前面是空格而不是 Tab，`make` 会报错：

```makefile
# 错误示例：命令前是空格，不是 Tab
hello: main.o utils.o
    gcc main.o utils.o -o hello   # 这行前面是空格，会报错！
```

正确的写法是让编辑器的 Tab 键插入真正的 Tab 字符，而不是空格。大多数编辑器（包括 VSCode）在处理 `Makefile` 时会自动识别并插入 Tab。

---

## 使用变量

上面的 `Makefile` 中重复出现了 `gcc`、`-c` 等，可以用变量来消除重复：

```makefile
CC = gcc
CFLAGS = -Wall -g
LDFLAGS =
OBJS = main.o utils.o
TARGET = hello

$(TARGET): $(OBJS)
	$(CC) $(LDFLAGS) $(OBJS) -o $(TARGET)

main.o: main.c utils.h
	$(CC) $(CFLAGS) -c main.c -o main.o

utils.o: utils.c utils.h
	$(CC) $(CFLAGS) -c utils.c -o utils.o

clean:
	rm -f $(OBJS) $(TARGET)
```

- `CC`：编译器
- `CFLAGS`：编译选项（警告、调试信息等）
- `LDFLAGS`：链接选项
- `OBJS`：目标文件列表
- `TARGET`：最终生成的可执行文件

使用变量后，想换编译器只用改第一行，想加编译选项只用改第二行。

---

## 模式规则与自动变量

上面的 `Makefile` 里 `main.o` 和 `utils.o` 的规则几乎一样，可以用<span style="color: #E6A23C;">模式规则</span>合并：

```makefile
CC = gcc
CFLAGS = -Wall -g
LDFLAGS =
OBJS = main.o utils.o
TARGET = hello

$(TARGET): $(OBJS)
	$(CC) $(LDFLAGS) $(OBJS) -o $(TARGET)

# 模式规则：如何从 %.c 生成 %.o
%.o: %.c utils.h
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)
```

这里用到了一些<span style="color: #E6A23C;">自动变量</span>：

- `$@`：表示当前规则的目标（如 `main.o`）
- `$<`：表示第一个依赖项（如 `main.c`）
- `$^`：表示所有依赖项

`%.o: %.c utils.h` 的意思是：任何一个 `.o` 文件，如果存在同名的 `.c` 文件且加上 `utils.h` 作为依赖，就按下面的命令编译。

:::tip 自动变量让 Makefile 更通用
有了模式规则，你新增一个 `foo.c` 文件时只需要把 `foo.o` 加到 `OBJS` 列表里就行了，不需要再写一条新规则。
:::

---

## 伪目标

前面我们写了 `clean`，它不是一个真正的文件名，而是一个操作。这种目标叫<span style="color: #409EFF;">伪目标</span>，需要用 `.PHONY` 声明，避免目录下恰好有一个叫 `clean` 的文件导致 `make` 以为不需要执行：

```makefile
.PHONY: clean
clean:
	rm -f $(OBJS) $(TARGET)
```

也可以把所有非文件目标集中声明：

```makefile
.PHONY: clean all

all: $(TARGET)  # all 作为第一个目标，默认执行

clean:
	rm -f $(OBJS) $(TARGET)
```

习惯上会把 `all` 作为第一个目标，这样直接敲 `make` 就会执行 `all`。

---

## 一个完整的 Makefile 模板

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -g -O0
LDFLAGS =
OBJS = main.o utils.o
TARGET = my_program

.PHONY: all clean

# 默认目标
all: $(TARGET)

# 链接
$(TARGET): $(OBJS)
	$(CC) $(LDFLAGS) $^ -o $@

# 编译（模式规则）
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# 清理
clean:
	rm -f $(OBJS) $(TARGET)
```

把这个模板保存为 `Makefile`，根据需要修改 `OBJS` 和 `TARGET`，就可以直接用了。

---

## 多目录项目

当源文件分布在多个目录时，可以在 `Makefile` 中指定路径：

```makefile
CC = gcc
CFLAGS = -Wall -g -Isrc/include
OBJS = src/main.o src/utils.o
TARGET = bin/program

$(TARGET): $(OBJS)
	$(CC) $(LDFLAGS) $^ -o $@

src/%.o: src/%.c
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean
clean:
	rm -f $(OBJS) $(TARGET)
```

`-Isrc/include` 告诉编译器在 `src/include` 目录下搜索头文件。

---

## 常见错误与注意事项

1. <span style="color: #F56C6C;">命令前是空格不是 Tab</span>：`make` 会报 `*** missing separator. Stop.`。检查你的编辑器在 Makefile 中是否把 Tab 转成了空格。

2. <span style="color: #F56C6C;">忘记声明 `.PHONY`</span>：如果恰好有文件叫 `clean`，`make clean` 就会说"clean 已是最新"，不执行任何操作。

3. <span style="color: #F56C6C;">依赖项漏写头文件</span>：如果修改了 `utils.h`，但 `Makefile` 中没有把 `utils.h` 列为依赖，`make` 不会重新编译受影响的 `.c` 文件，导致链接了过时的 `.o` 文件。调试时会发现修改头文件后程序行为没变。

4. <span style="color: #F56C6C;">变量赋值时等号两边可以加空格</span>：`CC = gcc` 和 `CC=gcc` 都可以，习惯上都加空格提高可读性。

---

## 编译和链接应分成不同规则

```make
CC := gcc
CFLAGS := -std=c11 -Wall -Wextra -Wpedantic -g -MMD -MP
LDFLAGS :=
LDLIBS :=

TARGET := app
OBJECTS := main.o math_utils.o
DEPS := $(OBJECTS:.o=.d)

$(TARGET): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) $(LDLIBS) -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

-include $(DEPS)
```

- `CFLAGS` 放编译选项；
- `LDFLAGS` 放链接器选项；
- `LDLIBS` 放 `-lm`、`-lSDL2` 等库；
- `-MMD -MP` 生成头文件依赖，修改头文件后能自动重编相关目标。

## 链接库的顺序可能重要

对某些 Unix 风格链接器，使用库的目标文件应放在库参数之前：

```bash
gcc main.o math_utils.o -lm -o app
```

链接器通常按顺序解析未解决符号，顺序错误会出现明明安装了库却 `undefined reference`。

## `.PHONY` 避免文件名冲突

```make
.PHONY: all clean
```

若目录中恰好存在名为 `clean` 的文件，而目标未声明伪目标，`make clean` 可能认为无需执行。

## Makefile 的 Tab 不是排版习惯

传统 make 规则的命令行必须以 Tab 开头。编辑器把 Tab 自动转成空格会导致 `missing separator`。遇到错误先显示不可见字符检查缩进。

## 小结

- Makefile 通过"目标—依赖—命令"的规则描述构建过程
- 变量让 Makefile 更易维护，模式规则消除重复
- 伪目标（`.PHONY`）用于执行清理等非文件操作
- `make` 的增量编译只重新编译变动的文件，大大加快构建速度
- 命令前面必须是 Tab，不能是空格

`Makefile` 是 `C/C++` 项目最经典的构建方式。即使现代的构建工具（如 CMake）能自动生成 Makefile，理解其原理仍然非常重要——它帮你理解编译和链接的整个过程。

下一篇，我们将用 `CMake` 和 `SDL2` 构建一个真正的多依赖项目，看看现代构建工具链是如何工作的。
