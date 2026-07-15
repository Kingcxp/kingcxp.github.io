---
title: 节点与单向链表
date: 2026-07-09
icon: link
order: 22
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - C++
  - 数据结构
  - 链表
author: Kingcq
---

## 为什么需要链表？

之前我们用数组存一组整数，写起来很直接，但数组有个天生的“倔强”：它的大小在定义时就固定了。如果事先不知道要存多少数据，就得拍脑袋猜一个最大值；要么浪费内存，要么数据塞不下。而且如果要在数组中间插入或删除一个元素，往往要把后面的元素整体搬家，时间开销较大。

链表就是为了解决这些问题而生的：它不必连续占用内存，插入删除时也不需要搬动大量元素，只要改几个指针的指向即可。代价是，它无法像数组那样随机访问第 `i` 个元素，查找时需要从头节点一步步走。

## 学习目标

读完本文后，你将能够：

- 理解链表的节点结构和头指针的作用；
- 用 C 语言创建、遍历、插入、删除、查找和释放一个单向链表；
- 通过画图弄清指针之间的指向关系。

## 节点结构

链表的基本单位是**节点（Node）**。每个节点分成两部分：

1. **数据域**：存放我们想保存的值；
2. **指针域**：存放下一个节点的地址。

```c
typedef struct Node {
    int data;
    struct Node* next;
} Node;
```

如果下一个节点不存在，指针就写成 `NULL`，表示这是链表的末尾。

下面这张图展示了三个节点 `10 -> 20 -> 30` 的连接关系：


```mermaid
graph LR
    head --> N1[10]
    N1 --> N2[20]
    N2 --> N3[30]
    N3 --> NULL[NULL]
```


```text
head
  │
  ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ data=10 │   │ data=20 │   │ data=30 │
│ next ───┼──►│ next ───┼──►│ next=NULL│
└─────────┘   └─────────┘   └─────────┘
```

`head`（头指针）始终指向第一个节点。如果链表为空，`head == NULL`。

## 创建与遍历链表

我们通常不会手动把节点“串”在一起，而是写几个辅助函数。先写一个创建节点的函数：

```c
Node* create_node(int value) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    if (new_node == NULL) {
        fprintf(stderr, "内存分配失败！\n");
        exit(1);
    }
    new_node->data = value;
    new_node->next = NULL;
    return new_node;
}
```

遍历链表就是从头走到尾：

```c
void print_list(Node* head) {
    Node* cur = head;
    while (cur != NULL) {
        printf("%d -> ", cur->data);
        cur = cur->next;
    }
    printf("NULL\n");
}
```

注意：遍历时一定要用临时指针 `cur`，不要直接动 `head`，否则遍历完之后就找不到链表开头了。

## 插入节点

### 头插法

新节点插到最前面，最简单。步骤如下：

1. 创建新节点；
2. 让新节点的 `next` 指向原来的头节点；
3. 更新 `head` 指向新节点。

```c
void insert_head(Node** head, int value) {
    Node* new_node = create_node(value);
    new_node->next = *head;
    *head = new_node;
}
```

因为 `head` 本身需要被修改，所以这里用了二级指针 `Node** head`。这是很多初学者第一次觉得绕的地方——你可以把它理解为“通过地址去改地址”。

### 尾插法

尾插法要先一路走到最后一个节点，再把新节点挂上去：

```c
void insert_tail(Node** head, int value) {
    Node* new_node = create_node(value);
    if (*head == NULL) {
        *head = new_node;
        return;
    }
    Node* cur = *head;
    while (cur->next != NULL) {
        cur = cur->next;
    }
    cur->next = new_node;
}
```

### 按位置插入

假设位置从 0 开始计数，插入到第 `pos` 个位置之前。如果 `pos` 为 0，就是头插。

```c
void insert_at(Node** head, int value, int pos) {
    if (pos < 0) {
        printf("位置不能为负数\n");
        return;
    }
    if (pos == 0) {
        insert_head(head, value);
        return;
    }
    Node* cur = *head;
    for (int i = 0; i < pos - 1 && cur != NULL; i++) {
        cur = cur->next;
    }
    if (cur == NULL) {
        printf("位置超出链表长度\n");
        return;
    }
    Node* new_node = create_node(value);
    new_node->next = cur->next;
    cur->next = new_node;
}
```

:::tip 画图辅助理解
指针操作最容易出错的地方在于“先后顺序”。插入新节点时，一定要先把新节点指向后面的节点，再把前面的节点指向新节点。如果顺序反过来，就会丢失后面的链表，造成内存泄漏。


```mermaid
graph LR
    subgraph 正确顺序
        A1[A] --> New1[new]
        New1 --> B1[B]
    end
    subgraph 错误顺序
        A2[A] --> New2[new]
        A2 -.-> B2[B]
        New2 -.x B2
    end
```


```text
插入前：A -> B
插入后：A -> new -> B
```
:::

## 删除与查找

删除第一个值等于 `value` 的节点：

```c
void delete_value(Node** head, int value) {
    if (*head == NULL) return;

    if ((*head)->data == value) {
        Node* temp = *head;
        *head = (*head)->next;
        free(temp);
        return;
    }

    Node* cur = *head;
    while (cur->next != NULL && cur->next->data != value) {
        cur = cur->next;
    }

    if (cur->next != NULL) {
        Node* temp = cur->next;
        cur->next = cur->next->next;
        free(temp);
    }
}
```

查找返回节点指针：

```c
Node* find(Node* head, int value) {
    Node* cur = head;
    while (cur != NULL) {
        if (cur->data == value) return cur;
        cur = cur->next;
    }
    return NULL;
}
```

## 释放链表

程序结束前，一定要把 `malloc` 出来的节点都还回去：

```c
void free_list(Node** head) {
    Node* cur = *head;
    while (cur != NULL) {
        Node* temp = cur;
        cur = cur->next;
        free(temp);
    }
    *head = NULL;
}
```

如果忘了释放，程序结束时操作系统会回收，但在长时间运行的程序里就会造成内存泄漏。

## 完整可运行代码

下面把上面的函数拼成一个完整的程序，你可以直接复制、编译、运行：

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

Node* create_node(int value) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    if (new_node == NULL) {
        fprintf(stderr, "内存分配失败！\n");
        exit(1);
    }
    new_node->data = value;
    new_node->next = NULL;
    return new_node;
}

void insert_head(Node** head, int value) {
    Node* new_node = create_node(value);
    new_node->next = *head;
    *head = new_node;
}

void insert_tail(Node** head, int value) {
    Node* new_node = create_node(value);
    if (*head == NULL) {
        *head = new_node;
        return;
    }
    Node* cur = *head;
    while (cur->next != NULL) {
        cur = cur->next;
    }
    cur->next = new_node;
}

void insert_at(Node** head, int value, int pos) {
    if (pos < 0) {
        printf("位置不能为负数\n");
        return;
    }
    if (pos == 0) {
        insert_head(head, value);
        return;
    }
    Node* cur = *head;
    for (int i = 0; i < pos - 1 && cur != NULL; i++) {
        cur = cur->next;
    }
    if (cur == NULL) {
        printf("位置超出链表长度\n");
        return;
    }
    Node* new_node = create_node(value);
    new_node->next = cur->next;
    cur->next = new_node;
}

void print_list(Node* head) {
    Node* cur = head;
    while (cur != NULL) {
        printf("%d -> ", cur->data);
        cur = cur->next;
    }
    printf("NULL\n");
}

void delete_value(Node** head, int value) {
    if (*head == NULL) return;

    if ((*head)->data == value) {
        Node* temp = *head;
        *head = (*head)->next;
        free(temp);
        return;
    }

    Node* cur = *head;
    while (cur->next != NULL && cur->next->data != value) {
        cur = cur->next;
    }

    if (cur->next != NULL) {
        Node* temp = cur->next;
        cur->next = cur->next->next;
        free(temp);
    }
}

Node* find(Node* head, int value) {
    Node* cur = head;
    while (cur != NULL) {
        if (cur->data == value) return cur;
        cur = cur->next;
    }
    return NULL;
}

void free_list(Node** head) {
    Node* cur = *head;
    while (cur != NULL) {
        Node* temp = cur;
        cur = cur->next;
        free(temp);
    }
    *head = NULL;
}

int main() {
    Node* head = NULL;

    insert_tail(&head, 10);
    insert_tail(&head, 20);
    insert_head(&head, 5);
    insert_at(&head, 15, 2);

    printf("当前链表：");
    print_list(head);  // 5 -> 10 -> 15 -> 20 -> NULL

    Node* f = find(head, 15);
    if (f) printf("找到节点，值为：%d\n", f->data);

    delete_value(&head, 10);
    printf("删除 10 后：");
    print_list(head);  // 5 -> 15 -> 20 -> NULL

    free_list(&head);
    return 0;
}
```

编译命令示例：

```bash
gcc linked_list.c -o linked_list
./linked_list
```

## 常见错误与注意事项

1. **没有处理空链表**：尾插、删除时如果 `head` 为空，要单独判断。
2. **忘记更新头指针**：头插和删除头节点时，必须用二级指针修改 `head`。
3. **指针指向顺序错误**：插入时先连后面再连前面，否则后面那截链表会“断掉”。
4. **内存泄漏**：只 `free` 了部分节点，或者完全没释放链表。
5. **访问已释放内存**：`free` 后不要再读写被释放的节点，必要时把指针置为 `NULL`。

:::tip 调试小技巧
如果你发现链表输出到一半就崩溃，或者结果不对劲，可以在每次修改 `next` 指针前后都 `printf` 一下相关地址和值。 visually 画图也有助于发现“谁指向谁”的问题。
:::

:::tip 双向链表
本文只实现了单向链表——每个节点只保存指向下一个节点的指针。如果想让链表可以双向遍历（往前和往后），可以用**双向链表**：每个节点同时保存 `prev`（指向前一个）和 `next`（指向后一个）两个指针。

```c
typedef struct DNode {
    int data;
    struct DNode* prev;
    struct DNode* next;
} DNode;
```

双向链表在删除指定节点时不需要从头查找前驱节点，但每个节点需要额外存储一个指针，占用更多内存。理解单向链表后，双向链表只是多了一个方向而已。
:::

## 小结与预告

今天我们认识了单向链表：节点由数据域和指针域组成，通过 `head` 能找到整条链。掌握了头插、尾插、按位置插、删除、查找和释放这些基本操作后，链表就不再神秘了。

下一篇，我们会聊一种“后进先出”的结构——栈。它非常贴近生活，也是理解函数调用、表达式求值的基础。
