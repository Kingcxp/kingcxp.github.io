---
title: C++ 的输入输出流：从键盘到文件再到字符串
date: 2026-07-16
icon: right-left
order: 59
category:
  - C/C++ 语言与程序设计
tag:
  - C++
  - iostream
  - 文件流
  - 字符串流
author: Kingcq
---

上一篇文章我们学了怎么用 `<<` 和 `>>` 运算符让自定义类型支持输入输出。这一篇我们来系统地看看 C++ 中的各种输入输出流——它们能帮你处理从键盘输入、屏幕输出、文件读写到字符串解析等各种场景。

## 学习目标

- 区分 `cout`、`cerr`、`clog`、`cin`
- 学会用 `ifstream` 和 `ofstream` 读写文件
- 学会用 `stringstream` 在字符串和数值之间转换
- 掌握流的状态检查和错误处理
- 会用格式控制符控制输出样式

## 三大标准流

C++ 在 `<iostream>` 中定义了四个标准流对象：

| 对象 | 类型 | 默认对应 | 说明 |
| :-- | :-- | :-- | :-- |
| `std::cin` | `std::istream` | 键盘 | 标准输入 |
| `std::cout` | `std::ostream` | 屏幕 | 标准输出，有缓冲区 |
| `std::cerr` | `std::ostream` | 屏幕 | 标准错误输出，无缓冲区 |
| `std::clog` | `std::ostream` | 屏幕 | 标准日志输出，有缓冲区 |

`cout` 和 `cerr`/`clog` 的区别在于：`cout` 有缓冲区，数据不会立即写到屏幕上，而是在缓冲区满了或者遇到 `std::endl` 时才刷新。`cerr` 没有缓冲区，写进去马上就显示，适合输出错误信息。`clog` 有缓冲区，适合输出日志。

```cpp
#include <iostream>

int main() {
    std::cout << "这条信息有缓冲" << std::endl;
    std::cerr << "这条错误信息立即显示" << std::endl;
    return 0;
}
```

`cin` 和 `cout` 你应该已经很熟悉了。下面重点看看文件流和字符串流。

## 文件流：读写文件

C++ 用 `<fstream>` 提供的 `ifstream`（输入文件流）和 `ofstream`（输出文件流）来读写文件。

### 写入文件

```cpp
#include <iostream>
#include <fstream>

int main() {
    std::ofstream out("data.txt");  // 打开文件用于写入
    if (!out) {                     // 检查是否成功打开
        std::cerr << "无法打开文件" << std::endl;
        return 1;
    }

    out << "姓名：Alice" << std::endl;
    out << "成绩：92.5" << std::endl;
    out << "年龄：20" << std::endl;

    out.close();  // 关闭文件（析构函数也会自动关闭）
    return 0;
}
```

### 读取文件

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream in("data.txt");
    if (!in) {
        std::cerr << "无法打开文件" << std::endl;
        return 1;
    }

    std::string line;
    while (std::getline(in, line)) {  // 逐行读取
        std::cout << line << std::endl;
    }

    in.close();
    return 0;
}
```

`std::getline` 可以从输入流中读取一整行，存到 `std::string` 里。它比你用 `>>` 更方便，因为它能读取带空格的文本。

### 以二进制方式读写

文本模式会自动处理换行符的转换（Windows 上 `\r\n` ↔ `\n`），而二进制模式不会。如果要写非文本数据（比如结构体），应该用二进制模式：

```cpp
#include <iostream>
#include <fstream>

int main() {
    int numbers[] = {1, 2, 3, 4, 5};

    // 二进制写入
    std::ofstream out("data.bin", std::ios::binary);
    out.write(reinterpret_cast<char*>(numbers), sizeof(numbers));
    out.close();

    // 二进制读取
    int read_back[5];
    std::ifstream in("data.bin", std::ios::binary);
    in.read(reinterpret_cast<char*>(read_back), sizeof(read_back));
    in.close();

    for (int n : read_back) {
        std::cout << n << ' ';
    }
    std::cout << std::endl;
    return 0;
}
```

## 字符串流：在字符串和数值间转换

`<sstream>` 提供了 `istringstream`（从字符串读）和 `ostringstream`（写入字符串）。它们让你像使用 `cin`/`cout` 一样操作字符串。

### 把数值转成字符串

```cpp
#include <iostream>
#include <sstream>
#include <string>

int main() {
    int age = 25;
    double score = 89.5;

    std::ostringstream oss;
    oss << "年龄：" << age << "，成绩：" << score;

    std::string result = oss.str();  // 获取拼接后的字符串
    std::cout << result << std::endl;
    return 0;
}
```

### 从字符串解析数值

```cpp
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::string data = "42 3.14 hello";
    std::istringstream iss(data);

    int a;
    double b;
    std::string c;

    iss >> a >> b >> c;

    std::cout << a << ", " << b << ", " << c << std::endl;
    return 0;
}
```

字符串流特别适合解析配置文件或格式化数据。和 C 语言的 `sscanf`/`sprintf` 相比，它更安全（不需要手动指定缓冲区大小）且支持自定义类型（如果你的类型重载了 `<<` 和 `>>`）。

## 流的状态检查

每次对流进行读写后，都应该检查操作是否成功。流对象可以隐式转换成 `bool`：

```cpp
std::ifstream in("data.txt");
if (in) {  // 等价于 !in.fail()
    // 文件正常打开
}

int value;
std::cin >> value;
if (std::cin.fail()) {
    // 输入的不是整数，或者流已经关闭
}
if (std::cin.eof()) {
    // 到达输入末尾
}
```

常用的状态函数：

| 函数 | 说明 |
| :-- | :-- |
| `good()` | 流处于正常状态 |
| `eof()` | 到达文件末尾或输入末尾 |
| `fail()` | 上次操作失败（比如类型不匹配） |
| `bad()` | 流发生严重错误（不可恢复） |
| `clear()` | 清除错误状态，让流恢复可用 |

## 格式化输出

C++ 提供了多种方式来控制输出格式：

```cpp
#include <iostream>
#include <iomanip>  // 格式化控制

int main() {
    double pi = 3.1415926535;

    std::cout << "默认：" << pi << std::endl;
    std::cout << "保留两位小数：" << std::fixed << std::setprecision(2) << pi << std::endl;
    std::cout << "科学计数法：" << std::scientific << pi << std::endl;

    int n = 255;
    std::cout << "十进制：" << n << std::endl;
    std::cout << "十六进制：" << std::hex << n << std::endl;
    std::cout << "八进制：" << std::oct << n << std::endl;

    // 输出宽度和对齐
    std::cout << std::setw(10) << std::left << "左对齐" << std::endl;
    std::cout << std::setw(10) << std::right << "右对齐" << std::endl;

    return 0;
}
```

常用的格式控制符定义在 `<iomanip>` 中：

| 控制符 | 作用 |
| :-- | :-- |
| `std::setw(n)` | 设置输出宽度为 n |
| `std::setprecision(n)` | 设置浮点数精度为 n 位 |
| `std::fixed` | 固定小数位输出 |
| `std::scientific` | 科学计数法输出 |
| `std::hex` / `std::dec` / `std::oct` | 十六进制 / 十进制 / 八进制 |
| `std::left` / `std::right` | 左对齐 / 右对齐 |
| `std::endl` | 输出换行并刷新缓冲区 |

:::tip cout vs printf
`cout` 用起来更简洁，支持自定义类型的自动扩展；`printf` 格式控制更精细直观。用哪个看个人喜好和项目风格，但同一个项目里最好统一。
:::

## 流操作的综合示例

下面是一个完整的例子，展示如何从文件读取学生成绩，计算总分，再写入另一个文件：

```cpp
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

int main() {
    std::ifstream in("scores.txt");
    if (!in) {
        std::cerr << "无法打开输入文件" << std::endl;
        return 1;
    }

    std::ofstream out("result.txt");
    if (!out) {
        std::cerr << "无法打开输出文件" << std::endl;
        return 1;
    }

    std::string line;
    int total = 0;

    while (std::getline(in, line)) {
        std::istringstream iss(line);
        std::string name;
        int score;

        if (iss >> name >> score) {
            total += score;
            out << name << " " << score << std::endl;
        } else {
            std::cerr << "无法解析行：" << line << std::endl;
        }
    }

    out << "总分：" << total << std::endl;

    in.close();
    out.close();
    return 0;
}
```

## 常见错误与注意事项

1. <span style="color: #F56C6C;">忘记检查文件是否打开成功</span>——不检查 `!out` 就直接写入，可能什么都不会发生。
2. <span style="color: #F56C6C;">用 `>>` 读取包含空格的文本</span>——`>>` 以空白字符分隔，读不到带空格的文本。需要用 `std::getline`。
3. <span style="color: #F56C6C;">忘记关闭文件</span>——虽然文件流析构时会自动关闭，但显式 `close()` 可以尽早释放资源。
4. <span style="color: #F56C6C;">混用 `getline` 和 `>>`</span>——`>>` 会在缓冲区留下换行符，紧接着的 `getline` 可能读到空行。可以在 `>>` 之后加 `ignore`：

```cpp
std::cin >> age;
std::cin.ignore();  // 吃掉留下的换行符
std::getline(std::cin, name);
```

## 小结

- C++ 提供了 `cin`、`cout`、`cerr`、`clog` 四种标准流，分别用于不同目的。
- `ifstream` 和 `ofstream` 提供类型安全的文件读写。
- `istringstream` 和 `ostringstream` 让你像操作流一样操作字符串。
- 每次读写后检查流状态是良好的编程习惯。
- `<iomanip>` 中的格式控制符可以精细控制输出样式。

下一篇我们进入继承的世界——在已有类的基础上扩展新的功能。
