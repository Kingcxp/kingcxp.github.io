---
title: 南哪 2022-8-pointer EX 手搓链表
date: 2022-11-18
icon: ruler
order: 13
category:
  - CPL DotOJ 补完计划
tag:
  - CPL
  - DotOJ
author: Kingcq
---

链表在需要节省内存空间，同时不需要进行随机寻址操作时（也就是使用数组下标那种方式快速访问其中的任意一个元素），是非常优秀的数据结构。

要想看懂它，实际上一段代码就足够：

```c
#include <stdio.h>
#include <stdlib.h>

// 链表的特点在于它占用的内存不像数组那样是连续的，
// 这也正导致了链表需要更多的内存用来记录与某一个节点相连的其他节点，且不能直接调用链表当中某个元素的值
// 但是链表的好处在于它的内存是动态的，而且从头到尾顺序访问并不受影响
// 单独链表的应用范围，抛开没有不谈，还是有一点的
// 比如说某些非逼你需要动态维护数组大小的（我不说是哪道题，自己心里清楚

// 单个链表节点，这里演示的是两个方向都能查找的链表
typedef struct list_node list_node_t;
struct list_node {
	int data;
	list_node_t *prev, *next;
};

// 在pos指向的元素之后添加一个新的元素
void add(list_node_t *pos, int data) {
	list_node_t *node = malloc(sizeof(list_node_t));
	node->prev = pos;
	node->next = pos->next;
	if (pos->next != NULL)
		pos->next->prev = node;
	pos->next = node;
	node->data = data;
}

// 删除pos指向的元素
void del(list_node_t *pos) {
	if (pos->prev != NULL)
		pos->prev->next = pos->next;
	if (pos->next != NULL)
		pos->next->prev = pos->prev;
	free(pos);
}

int main() {
    // 新建一个节点指向链表的开头以方便链表的遍历和添加删除。
	list_node_t *list = malloc(sizeof(list_node_t));
	list->prev = NULL;
	list->next = NULL;
	list->data = 114514;
	return 0;
}
// 代码未经检查，如果有误自己去改，意思到了（
```

题单链接：

[南哪2022-8-pointer EX 手搓链表 - 题单 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/training/252209)

然而这也没有题……
