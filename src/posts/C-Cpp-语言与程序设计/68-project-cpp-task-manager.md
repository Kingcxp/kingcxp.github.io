---
title: 阶段项目四：现代 C++ 任务管理器
date: 2026-07-19
icon: diagram-successor
order: 68
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - 综合练习
  - STL
  - RAII
author: Kingcq
---

<span style="color: #F56C6C;">最后一个阶段项目把现代 C++ 的值语义、标准容器、算法、lambda、文件资源和错误处理组合起来。</span>目标是做一个命令行任务管理器，而不是再手动实现一遍动态数组和字符串。

## 功能

```text
task add "完成报告" --priority 3
task list
task list --pending
task done 12
task remove 12
task save tasks.txt
task load tasks.txt
```

教学版可以先做交互菜单，再扩展成命令行子命令。

## 值类型 `Task`

```cpp
#include <cstdint>
#include <string>

class Task {
public:
    using Id = std::uint64_t;

    Task(Id id, std::string title, int priority)
        : id_(id), title_(std::move(title)), priority_(priority)
    {
        if (title_.empty()) {
            throw std::invalid_argument("title must not be empty");
        }
        if (priority_ < 1 || priority_ > 5) {
            throw std::out_of_range("priority must be 1..5");
        }
    }

    Id id() const noexcept { return id_; }
    const std::string& title() const noexcept { return title_; }
    int priority() const noexcept { return priority_; }
    bool done() const noexcept { return done_; }
    void mark_done() noexcept { done_ = true; }

private:
    Id id_;
    std::string title_;
    int priority_;
    bool done_ = false;
};
```

`Task` 不直接管理裸资源，因此遵循 Rule of Zero：默认复制、移动和析构即可。

## 仓库类

```cpp
#include <optional>
#include <vector>

class TaskRepository {
public:
    Task::Id add(std::string title, int priority);
    bool remove(Task::Id id);
    bool mark_done(Task::Id id);

    Task* find(Task::Id id);
    const Task* find(Task::Id id) const;

    const std::vector<Task>& all() const noexcept { return tasks_; }

private:
    std::vector<Task> tasks_;
    Task::Id next_id_ = 1;
};
```

返回裸指针在这里表示对仓库内部元素的临时借用。调用者不能保存到可能使 `vector` 扩容或删除元素之后。也可以返回下标或 `optional<reference_wrapper<Task>>`，但接口会更复杂。

## 查找与删除

```cpp
#include <algorithm>

Task* TaskRepository::find(Task::Id id) {
    const auto it = std::find_if(tasks_.begin(), tasks_.end(),
        [id](const Task& task) { return task.id() == id; });
    return it == tasks_.end() ? nullptr : &*it;
}

bool TaskRepository::remove(Task::Id id) {
    const auto it = std::remove_if(tasks_.begin(), tasks_.end(),
        [id](const Task& task) { return task.id() == id; });

    if (it == tasks_.end()) return false;
    tasks_.erase(it, tasks_.end());
    return true;
}
```

ID 唯一，因此最多删除一项。如果使用 `unordered_map<Id, Task>`，按 ID 查找更快，但按用户期望排序输出时仍要额外处理顺序。

## 展示与排序不应修改原数据

```cpp
std::vector<const Task*> sorted_view(const TaskRepository& repository) {
    std::vector<const Task*> result;
    result.reserve(repository.all().size());

    for (const Task& task : repository.all()) {
        result.push_back(&task);
    }

    std::sort(result.begin(), result.end(),
        [](const Task* a, const Task* b) {
            if (a->done() != b->done()) return !a->done();
            if (a->priority() != b->priority()) {
                return a->priority() > b->priority();
            }
            return a->id() < b->id();
        });
    return result;
}
```

排序的是借用指针数组，不会改变仓库原顺序。使用期间仓库不能增删元素，否则指针可能失效。

## 文件持久化

文件格式应明确版本：

```text
TASKS 1
1\t0\t3\t完成报告
2\t1\t5\t修复崩溃
```

<span style="color: #67C23A;">字段：ID、完成状态、优先级、标题。</span>需要规定标题中的制表符和换行如何转义。

使用 RAII 文件流：

```cpp
#include <fstream>
#include <stdexcept>

void save(const TaskRepository& repository, const std::string& path) {
    std::ofstream out(path);
    if (!out) throw std::runtime_error("cannot open output file: " + path);

    out << "TASKS 1\n";
    for (const Task& task : repository.all()) {
        out << task.id() << '\t'
            << task.done() << '\t'
            << task.priority() << '\t'
            << task.title() << '\n';
    }

    if (!out) throw std::runtime_error("failed to write: " + path);
}
```

完整版本应使用临时文件替换，并实现转义与加载验证。

## 加载采用“先解析后提交”

不要边读边破坏现有仓库：

1. 创建临时 `TaskRepository loaded`；
2. 读取并验证头部版本；
3. 逐行解析到临时仓库；
4. 检查重复 ID、范围和转义；
5. 全部成功后移动赋值给正式仓库。

<span style="color: #F56C6C;">这样加载失败时，原数据保持不变，属于强错误保证。</span>

## 测试

- 构造空标题和非法优先级应失败；
- 添加后 ID 单调且唯一；
- 查找存在和不存在 ID；
- 删除后其他任务仍保留；
- 完成状态正确更新；
- 排序视图不修改仓库；
- 保存后加载得到等价数据；
- 损坏文件不会覆盖原仓库；
- 移动、复制行为符合预期；
- Sanitizer 和警告构建通过。

## 工程结构

```text
task-manager/
├── CMakeLists.txt
├── include/task.h
├── include/task_repository.h
├── include/task_storage.h
├── src/task.cpp
├── src/task_repository.cpp
├── src/task_storage.cpp
├── src/main.cpp
└── tests/
```

<span style="color: #409EFF;">此时可以使用 CMake 创建核心库、主程序和测试程序三个目标。</span>下一篇调试章节会说明如何在这样的多文件项目中使用调试器定位问题。
