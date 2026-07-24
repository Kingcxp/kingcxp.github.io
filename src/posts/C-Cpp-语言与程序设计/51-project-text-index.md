---
title: 阶段项目三：文本词频与索引工具
date: 2026-07-14
icon: book-open
order: 51
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 综合练习
  - 哈希表
  - 排序
author: Kingcq
---

完成主要数据结构后，做一个命令行文本分析工具：读取文件，统计单词频率，按频率或字典序输出，并支持查询某个单词。

这个项目会综合：

- 文件逐块或逐行读取；
- 字符分类与规范化；
- 动态字符串；
- 哈希表计数；
- 动态数组收集结果；
- 排序和二分查找；
- 命令行参数；
- 测试与错误处理。

## 命令行设计

```text
wordindex [选项] FILE

--top N       输出频率最高的 N 个单词
--alpha       按字典序输出
--query WORD  查询一个单词
--case        区分大小写
```

第一版可以只实现 `--top N` 和文件名，再逐步添加其他选项。

## 什么算一个单词

必须先定义规则。例如教学版规定：

- ASCII 字母和数字属于单词；
- 撇号只在单词内部保留；
- 其他字符都是分隔符；
- 默认统一转换为小写；
- 非 ASCII 文本按字节处理，不承诺正确分词。

这条限制很重要。<span style="color: #F56C6C;">UTF-8 中文分词、Unicode 大小写折叠和规范化是完全不同的主题，不能假装 `tolower` 已经解决。</span>

## 词法状态机

逐字符读取时维护动态缓冲区：

```text
分隔状态 --遇到单词字符--> 单词状态
单词状态 --遇到单词字符--> 追加字符
单词状态 --遇到分隔符--> 提交单词并清空缓冲
文件结束时若仍在单词状态，也要提交
```

这比只用 `strtok` 更容易明确跨行、超长单词和字符规则。

## 计数表

哈希表节点可以改成：

```c
typedef struct WordEntry {
    char *word;
    size_t count;
    struct WordEntry *next;
} WordEntry;
```

每读到一个单词：

1. 计算哈希；
2. 在桶链表中查找；
3. 找到则 `count++`；
4. 未找到则复制字符串并创建计数为 1 的节点。

## 为什么还需要动态数组

哈希表便于查找，但不便于排序。统计结束后，把所有节点指针收集到数组：

```c
WordEntry **entries = malloc(table.size * sizeof(entries[0]));
```

<span style="color: #409EFF;">数组元素只是借用节点地址，节点仍由哈希表拥有。</span>排序数组不会移动或复制字符串内容。

## 比较器

按频率降序，同频时按字典序：

```c
int compare_frequency(const void *left, const void *right)
{
    const WordEntry *a = *(const WordEntry *const *)left;
    const WordEntry *b = *(const WordEntry *const *)right;

    if (a->count < b->count) return 1;
    if (a->count > b->count) return -1;
    return strcmp(a->word, b->word);
}
```

指针层级看起来复杂，可以从外往里读：`left` 指向数组元素，而数组元素本身是 `WordEntry *`。

## 输出与大文件

不要把整个文件一次性读入内存。<span style="color: #E6A23C;">逐块或逐行处理，内存主要取决于：</span>

- 不同单词数量；
- 单词字符串总长度；
- 哈希桶；
- 排序指针数组。

但如果输入包含数百万个互不相同的超长单词，内存仍可能耗尽。因此需要：

- 限制单词最大长度，或动态增长并检测溢出；
- 处理分配失败；
- 输出清楚的失败原因。

## 模块建议

```text
wordindex/
├── include/tokenizer.h
├── include/word_table.h
├── src/tokenizer.c
├── src/word_table.c
├── src/options.c
├── src/main.c
└── tests/
    ├── test_tokenizer.c
    └── test_word_table.c
```

<span style="color: #67C23A;">分词器可以通过回调把每个单词交给计数器，从而避免把所有 token 先存起来。</span>

## 测试数据

```text
Hello, hello!
C and C++ are different.
Don't split don't incorrectly.
```

测试：

- 空文件；
- 只有分隔符；
- 最后一个单词后没有换行；
- 大小写；
- 超长单词；
- 重复词；
- 包含高位字节的 UTF-8 文本；
- 文件读取中途错误；
- `--top 0`、负数、非数字和超大数字。

## 性能分析

设总字符数为 `m`，不同单词数为 `n`：

- 分词约 `O(m)`；
- 哈希计数平均约 `O(m)` 级别；
- 收集节点 `O(n)`；
- 排序 `O(n log n)`；
- 空间约为所有不同单词及节点总量。

这也是第一次可以把复杂度分析与真实数据规模对应起来的项目。

C 部分到这里完成了从语言、内存到数据结构和实际工具的闭环。下一篇开始过渡到现代 C++，重点不是更换输入输出语法，而是让类型和生命周期承担更多约束。
