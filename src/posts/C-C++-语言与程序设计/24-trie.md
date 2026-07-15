---
title: 字典树 Trie
date: 2026-07-10
icon: folder-tree
order: 24
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - C++
  - 数据结构
  - Trie
  - 字符串
author: Kingcq
---

## 为什么需要 Trie？

你有没有想过，手机输入法怎么根据你敲的前几个字母，快速提示出所有可能的单词？搜索引擎又是如何瞬间补全搜索词的？这些功能背后常常有一种叫 **Trie（字典树 / 前缀树）** 的数据结构。

Trie 把每个单词拆成字符，按字符顺序建成一棵多叉树。从根节点出发，沿着字符路径走，就能判断一个字符串是否存在，或者是否存在以某段字符开头的单词。

和普通查找相比，Trie 的最大优势是：**查找时间只和单词长度有关，和字典里有多少单词关系不大**。

## 学习目标

读完本文后，你将能够：

- 理解 Trie 的节点结构和前缀查找思想；
- 用 C 语言实现插入、查找、前缀匹配；
- 了解 Trie 的时间复杂度优势和典型应用场景。

## Trie 的基本思想

假设我们要保存 `cat`、`car`、`dog`、`do` 这几个单词。

Trie 会从根节点开始，为每个单词逐字符建立路径：

```text
              root
             /    \
            c      d
            |      |
            a      o
           / \      \
          t   r      g
         /            \
       $              $
      /                \
   cat                dog
                      |
                      $
                     /
                   do
```

- 每条边代表一个字符；
- `$` 表示有单词在这里结束（用代码里的 `is_end_of_word` 标记）；
- 前缀相同的单词会共享路径，比如 `cat` 和 `car` 共享 `c -> a`。

## 节点结构

为了简单起见，我们先假设只存小写英文字母。每个节点最多有 26 个孩子，用指针数组表示：

```c
#define ALPHABET_SIZE 26

typedef struct TrieNode {
    struct TrieNode* children[ALPHABET_SIZE];
    int is_end_of_word;  // 标记是否有单词在此结束
} TrieNode;
```

字符到数组下标的转换：

```c
int index = ch - 'a';
```

:::tip 想支持更多字符怎么办？
这里用固定大小的数组是为了让初学者先看懂核心逻辑。实际工程中，如果字符集很大（比如中文、Unicode），可以用动态数组、哈希表或者有序结构来存储子节点，避免每个节点都开 26 个指针的浪费。
:::

## 基本操作

### 创建节点

```c
TrieNode* create_node() {
    TrieNode* node = (TrieNode*)malloc(sizeof(TrieNode));
    node->is_end_of_word = 0;
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    return node;
}
```

### 插入

逐个字符往下走，路径不存在就创建新节点，最后把结尾标记置为真。

```c
void trie_insert(TrieNode* root, const char* word) {
    TrieNode* cur = root;
    for (int i = 0; word[i] != '\0'; i++) {
        int idx = word[i] - 'a';
        if (cur->children[idx] == NULL) {
            cur->children[idx] = create_node();
        }
        cur = cur->children[idx];
    }
    cur->is_end_of_word = 1;
}
```

### 查找

```c
int trie_search(TrieNode* root, const char* word) {
    TrieNode* cur = root;
    for (int i = 0; word[i] != '\0'; i++) {
        int idx = word[i] - 'a';
        if (cur->children[idx] == NULL) {
            return 0;
        }
        cur = cur->children[idx];
    }
    return cur->is_end_of_word;
}
```

### 前缀匹配

判断字典中是否存在以 `prefix` 开头的单词。

```c
int trie_starts_with(TrieNode* root, const char* prefix) {
    TrieNode* cur = root;
    for (int i = 0; prefix[i] != '\0'; i++) {
        int idx = prefix[i] - 'a';
        if (cur->children[idx] == NULL) {
            return 0;
        }
        cur = cur->children[idx];
    }
    return 1;
}
```

注意：前缀匹配走到末尾即可返回成功，不需要 `is_end_of_word` 为真。

### 释放 Trie

```c
void trie_free(TrieNode* root) {
    if (root == NULL) return;
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        trie_free(root->children[i]);
    }
    free(root);
}
```

释放时需要递归释放所有子节点，只 `free` 当前节点会漏掉整棵子树。

## 完整可运行代码

```c
#include <stdio.h>
#include <stdlib.h>

#define ALPHABET_SIZE 26

typedef struct TrieNode {
    struct TrieNode* children[ALPHABET_SIZE];
    int is_end_of_word;
} TrieNode;

TrieNode* create_node() {
    TrieNode* node = (TrieNode*)malloc(sizeof(TrieNode));
    node->is_end_of_word = 0;
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    return node;
}

void trie_insert(TrieNode* root, const char* word) {
    TrieNode* cur = root;
    for (int i = 0; word[i] != '\0'; i++) {
        int idx = word[i] - 'a';
        if (cur->children[idx] == NULL) {
            cur->children[idx] = create_node();
        }
        cur = cur->children[idx];
    }
    cur->is_end_of_word = 1;
}

int trie_search(TrieNode* root, const char* word) {
    TrieNode* cur = root;
    for (int i = 0; word[i] != '\0'; i++) {
        int idx = word[i] - 'a';
        if (cur->children[idx] == NULL) {
            return 0;
        }
        cur = cur->children[idx];
    }
    return cur->is_end_of_word;
}

int trie_starts_with(TrieNode* root, const char* prefix) {
    TrieNode* cur = root;
    for (int i = 0; prefix[i] != '\0'; i++) {
        int idx = prefix[i] - 'a';
        if (cur->children[idx] == NULL) {
            return 0;
        }
        cur = cur->children[idx];
    }
    return 1;
}

void trie_free(TrieNode* root) {
    if (root == NULL) return;
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        trie_free(root->children[i]);
    }
    free(root);
}

int main() {
    TrieNode* root = create_node();

    trie_insert(root, "cat");
    trie_insert(root, "car");
    trie_insert(root, "dog");
    trie_insert(root, "do");

    printf("search cat: %s\n", trie_search(root, "cat") ? "找到" : "未找到");
    printf("search car: %s\n", trie_search(root, "car") ? "找到" : "未找到");
    printf("search cap: %s\n", trie_search(root, "cap") ? "找到" : "未找到");
    printf("starts_with ca: %s\n", trie_starts_with(root, "ca") ? "有" : "没有");
    printf("starts_with do: %s\n", trie_starts_with(root, "do") ? "有" : "没有");
    printf("starts_with zebra: %s\n", trie_starts_with(root, "zebra") ? "有" : "没有");

    trie_free(root);
    return 0;
}
```

运行结果：

```text
search cat: 找到
search car: 找到
search cap: 未找到
starts_with ca: 有
starts_with do: 有
starts_with zebra: 没有
```

## 复杂度优势

设单词长度为 `m`。

- **插入**：O(m)，因为只需要沿着单词走一次。
- **查找**：O(m)，也只走一次。
- **前缀匹配**：O(m)。

重点是，这些操作的时间与 Trie 中已经存了多少个单词无关。如果用一个数组把所有单词存起来再线性查找，时间会随着单词数量增加而变长。Trie 用空间（较多的指针）换来了更快的查找速度。

:::tip 空间换时间
Trie 不是万能的。如果字符集很大、单词很长，或者前缀重复率很低，Trie 的内存开销可能不划算。实际使用时需要根据场景权衡。
:::

## 常见错误与注意事项

1. **字符大小写没统一**：`cat` 和 `Cat` 会被当成不同的路径，通常插入前先统一转小写。
2. **忘记标记 `is_end_of_word`**：如果不标记，就无法区分 `do` 和 `dog`，会认为 `do` 不存在。
3. **数组初始化不完整**：`children` 数组一定要全部初始化为 `NULL`，否则可能访问到野指针。
4. **释放时只 free 当前节点**：Trie 是树结构，必须递归释放所有孩子节点。
5. **查找和前缀匹配混淆**：查找要求路径存在且结尾标记为真；前缀匹配只要路径存在即可。

## 应用场景

- **自动补全 / 搜索建议**：输入前缀后，遍历该前缀对应子树的所有单词。
- **拼写检查**：快速判断输入的单词是否在词典中。
- **IP 路由最长前缀匹配**：网络路由表中常用 Trie 优化查找。
- **字符串去重统计**：通过 Trie 统计不同单词出现的次数。

## 小结与预告

Trie 把字符串的前缀关系转化成了树的层级关系，查找速度快且天然支持前缀匹配。它是学习字符串算法、自动补全和搜索引擎相关技术的重要基础。

到这里，我们已经学习了链表、栈、队列和 Trie 这几种经典结构。下一篇我们再补充一种非常实用的集合型数据结构——并查集，然后进入算法篇。
