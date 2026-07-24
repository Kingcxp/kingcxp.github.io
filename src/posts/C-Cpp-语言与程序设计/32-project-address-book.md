---
title: 阶段项目二：可保存的通讯录
date: 2026-07-08
icon: address-book
order: 32
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 综合练习
  - 结构体
  - 文件
author: Kingcq
---

这一阶段已经学过结构体、指针、动态内存、文件和错误处理。现在把它们组合成一个可以真正保存数据的通讯录。

## 功能范围

第一版只实现：

- 添加联系人；
- 按姓名查找；
- 列出全部联系人；
- 删除联系人；
- 保存到文本文件；
- 启动时从文本文件加载。

<span style="color: #F56C6C;">不要一开始就加入登录、网络同步、图形界面等功能。</span>综合项目的目标是练习清晰边界，而不是无限堆需求。

## 数据模型

```c
#define NAME_CAPACITY 64
#define PHONE_CAPACITY 32
#define EMAIL_CAPACITY 128

typedef struct {
    unsigned long id;
    char name[NAME_CAPACITY];
    char phone[PHONE_CAPACITY];
    char email[EMAIL_CAPACITY];
} Contact;

typedef struct {
    Contact *items;
    size_t size;
    size_t capacity;
    unsigned long next_id;
} AddressBook;
```

这里把“联系人”和“通讯录容器”分开。通讯录维护的不变量是：

- `size <= capacity`；
- `items == NULL` 时 `capacity == 0`；
- `items[0..size-1]` 都是有效联系人；
- `next_id` 不与现有 ID 冲突。

## 初始化与销毁

```c
#include <stdlib.h>

void address_book_init(AddressBook *book) {
    book->items = NULL;
    book->size = 0;
    book->capacity = 0;
    book->next_id = 1;
}

void address_book_destroy(AddressBook *book) {
    free(book->items);
    address_book_init(book);
}
```

<span style="color: #F56C6C;">销毁后恢复到可再次初始化使用的空状态，可以减少悬空指针风险。</span>

## 扩容

```c
#include <stdint.h>

int address_book_reserve(AddressBook *book, size_t new_capacity) {
    if (new_capacity <= book->capacity) return 1;
    if (new_capacity > SIZE_MAX / sizeof(book->items[0])) return 0;

    Contact *new_items = realloc(
        book->items,
        new_capacity * sizeof(book->items[0])
    );
    if (new_items == NULL) return 0;

    book->items = new_items;
    book->capacity = new_capacity;
    return 1;
}
```

扩容失败时，原 `items` 仍然有效。因此不能直接把 `realloc` 返回值覆盖原指针。

## 安全复制字段

不要把 `strncpy` 简单理解成“安全的 `strcpy`”。这里写一个契约更明确的辅助函数：

```c
#include <string.h>

int copy_text(char *dest, size_t capacity, const char *src) {
    size_t length = strlen(src);
    if (length >= capacity) return 0;
    memcpy(dest, src, length + 1);
    return 1;
}
```

它不截断：字段放不下就明确失败。对于姓名和邮箱，悄悄截断往往比拒绝输入更危险。

## 添加联系人

```c
int address_book_add(AddressBook *book,
                     const char *name,
                     const char *phone,
                     const char *email) {
    if (book->size == book->capacity) {
        size_t next = book->capacity == 0 ? 8 : book->capacity * 2;
        if (next < book->capacity || !address_book_reserve(book, next)) {
            return 0;
        }
    }

    Contact temp = {0};
    temp.id = book->next_id;
    if (!copy_text(temp.name, sizeof(temp.name), name) ||
        !copy_text(temp.phone, sizeof(temp.phone), phone) ||
        !copy_text(temp.email, sizeof(temp.email), email)) {
        return 0;
    }

    book->items[book->size++] = temp;
    ++book->next_id;
    return 1;
}
```

先把所有字段写入临时结构体，全部成功后再修改通讯录。这样失败不会留下“只写了一半”的联系人。

## 查找和删除

```c
#include <string.h>

Contact *address_book_find_name(AddressBook *book, const char *name) {
    for (size_t i = 0; i < book->size; ++i) {
        if (strcmp(book->items[i].name, name) == 0) {
            return &book->items[i];
        }
    }
    return NULL;
}

int address_book_remove_id(AddressBook *book, unsigned long id) {
    for (size_t i = 0; i < book->size; ++i) {
        if (book->items[i].id == id) {
            book->items[i] = book->items[book->size - 1];
            --book->size;
            return 1;
        }
    }
    return 0;
}
```

这里用末尾元素覆盖被删位置，删除是 `O(1)`，但会改变顺序。<span style="color: #E6A23C;">如果必须保持顺序，就要移动后续元素。</span>

## 设计文本格式

最简单的格式可以是一行一个联系人：

```text
1\tAlice\t123456\talice@example.com
2\tBob\t654321\tbob@example.com
```

但要先规定字段中能否出现制表符和换行。若允许，就必须设计转义规则。教学版可以明确禁止这些字符，并在输入时验证。

## 保存

```c
#include <stdio.h>

int address_book_save(const AddressBook *book, const char *path) {
    FILE *file = fopen(path, "w");
    if (file == NULL) return 0;

    int ok = 1;
    for (size_t i = 0; i < book->size; ++i) {
        const Contact *c = &book->items[i];
        if (fprintf(file, "%lu\t%s\t%s\t%s\n",
                    c->id, c->name, c->phone, c->email) < 0) {
            ok = 0;
            break;
        }
    }

    if (fclose(file) == EOF) ok = 0;
    return ok;
}
```

更稳妥的版本应先写临时文件，成功后再替换原文件。

## 加载时不要信任文件

文件可能损坏、被手动编辑或来自旧版本。加载流程应当：

1. 逐行读取；
2. 检查字段数量；
3. 检查 ID 是否为合法整数；
4. 检查字段长度；
5. 检查重复 ID；
6. 任一行失败时给出行号；
7. 决定是整体失败还是跳过坏行。

不要把文件直接读取进结构体内存；文本解析虽然代码多，但格式更明确、可调试，也不依赖结构体填充和机器字节序。

## 模块拆分

```text
address-book/
├── include/address_book.h
├── src/address_book.c
├── src/storage.c
├── src/input.c
├── src/main.c
└── tests/test_address_book.c
```

- `address_book.c`：纯数据操作；
- `storage.c`：文件格式；
- `input.c`：终端输入；
- `main.c`：菜单和流程；
- `tests`：不依赖手工输入的测试。

## 必测场景

- 空通讯录保存和加载；
- 添加第一项触发初次分配；
- 扩容前后数据不丢失；
- 字段刚好能放下与超长；
- 删除首项、中间项、末项和不存在 ID；
- 文件缺失、无权限、半行、字段过多；
- 保存失败时不破坏原数据；
- 加载后 `next_id` 正确更新。

这个项目把“数据、所有权、文件格式、错误传播、模块边界”放在一起。<span style="color: #409EFF;">后面的动态数组章节会把其中的扩容逻辑抽象成更通用的数据结构。</span>
