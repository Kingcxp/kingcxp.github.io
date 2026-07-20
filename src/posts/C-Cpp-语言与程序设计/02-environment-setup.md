---
title: 开发环境搭建与编译运行
date: 2026-06-29
icon: hammer
order: 2
category:
  - C/C++ 语言与程序设计
tag:
  - 环境搭建
  - 编译器
  - C
  - C++
author: Kingcq
---

## 工欲善其事，必先利其器

在开始写代码之前，我们需要先搭建好开发环境。这套教程中，我们会同时用到 `C` 和 `C++`，因此编译器需要同时支持两者。好消息是，主流的 `GCC`、`Clang` 和 `MSVC` 都同时支持 `C` 和 `C++`，安装一个就够了。

下面我会分平台介绍最推荐的安装方式。

---

## Windows 环境

`Windows` 上的 `C/C++` 开发通常面临一个选择：用 `MinGW-w64`（`GCC` 的 `Windows` 移植版）还是用 `Visual Studio` 的 `MSVC`？

初学阶段没有必要同时维护两套工具链。建议先选择一套并把“编辑—编译—运行—调试”走通：想和本教程命令保持一致，可以选择 `MSYS2 UCRT64 + GCC`；准备使用 Visual Studio 或 Windows 原生生态，可以选择 `MSVC`。等你知道自己为什么需要另一套工具链时再安装也不迟。

### 使用 winget 安装（推荐）

`winget` 是 `Windows` 自带的包管理器，从 `Windows 10`（`21H1` 及以上）和 `Windows 11` 开始内置。

#### 打开管理员 PowerShell

`winget` 安装包时需要管理员权限。如果你还不熟悉如何打开"管理员 PowerShell"，请按以下步骤操作：

1. 点击任务栏上的**开始**按钮（或按键盘上的 `Win` 键）
2. 输入 `powershell`
3. 在搜索结果中，**右键**点击 `Windows PowerShell`，选择**以管理员身份运行**
4. 如果弹出用户账户控制（UAC）窗口，点击**是**
5. 此时你会看到一个蓝底的窗口，光标前面有 `PS C:\Windows\system32>` 提示符

完成后，在蓝底窗口中输入以下命令。

#### 安装 MinGW-w64

```powershell
winget search mingw
```

这会列出所有与 `mingw` 相关的包。选择最新版本安装：

```powershell
winget install -e --id MSYS2.MSYS2
```

安装完成后，打开 `MSYS2` 的终端（从开始菜单找到 `MSYS2` 并启动），在里面执行：

```bash
pacman -S mingw-w64-ucrt-x86_64-gcc
```

这样会把 `MinGW-w64` 安装到 `MSYS2` 的目录下。安装完成后，把 `C:\msys64\ucrt64\bin` 添加到系统环境变量 `PATH` 中。

:::tip 什么是 PATH
`PATH` 是系统用来查找可执行文件的目录列表。当你输入 `gcc` 并回车时，系统会在 `PATH` 中列出的目录里依次查找 `gcc.exe`。如果找不到，就会提示"不是内部或外部命令"。安装编译器后记得把它的 `bin` 目录加到 `PATH` 里。
:::

#### 添加环境变量

1. 在搜索栏输入"环境变量"，打开**编辑系统环境变量**
2. 点击**环境变量**按钮
3. 在"系统变量"列表中找到 `Path`，双击
4. 点击**新建**，输入 `C:\msys64\ucrt64\bin`
5. 一路点**确定**

验证安装：重新打开一个普通 PowerShell 窗口（不是管理员），输入：

```powershell
gcc --version
```

如果显示版本信息，说明安装成功。

#### 安装 MSVC

安装 `MSVC` 最直接的方式是安装 `Visual Studio 2022 Build Tools`（不需要安装完整的 `Visual Studio`，体积小很多）：

```powershell
winget search "visual studio build tools"
winget install -e --id Microsoft.VisualStudio.2022.BuildTools
```

安装器启动后，在"工作负载"页面勾选**使用 C++ 的桌面开发**，然后点击安装。安装完成后，从开始菜单打开 `Developer Command Prompt for VS 2022`，输入 `cl` 验证编译器是否可用。

### 使用 scoop 安装

`scoop` 是另一个 `Windows` 包管理器，它会把软件安装到用户目录下，不需要管理员权限（安装 `scoop` 本身时除外）。

#### 安装 scoop

先确保你安装了 `PowerShell 5`（或更高版本）和 `.NET Framework 4.5+`。然后打开普通（非管理员）PowerShell，执行：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex
```

#### scoop 的基本使用

```powershell
# 搜索包
scoop search gcc

# 安装 MinGW
scoop install gcc

# 安装 LLVM (Clang)
scoop install llvm

# 查看已安装的包
scoop list

# 更新所有包
scoop update *
```

#### 更改 scoop 的安装路径

`scoop` 默认将软件安装到 `C:\Users\<用户名>\scoop`。如果你想更改到其他盘（比如 `D:\scoop`），在安装 `scoop` 之前设置环境变量：

```powershell
$env:SCOOP='D:\scoop'
[Environment]::SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')
```

然后再执行安装命令。这样所有通过 `scoop` 安装的软件都会放到 `D:\scoop` 下。

更详细的使用说明可以查看 `scoop` 的官方文档。

---

## Linux / macOS 环境

### 使用 Homebrew

`Homebrew` 是 `macOS` 和 `Linux` 上最流行的包管理器。

#### 打开终端

- **macOS**：按 `Command + 空格`，输入 `terminal`，回车
- **Linux**（Ubuntu/Debian）：按 `Ctrl + Alt + T`

#### 安装 Homebrew

在终端中执行（如果已经安装 `git` 和 `curl`）：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装过程中会提示你输入密码，按提示操作即可。安装完成后，根据终端输出的提示，将 `brew` 加入 `PATH`。

#### 安装 GCC

```bash
# 搜索
brew search gcc

# 安装最新版 GCC
brew install gcc

# 安装 LLVM（Clang）
brew install llvm
```

`macOS` 系统自带了 `Clang`，直接输入 `clang --version` 就能看到。但你也可以安装最新版本：

```bash
brew install llvm
```

#### Linux 自带包管理器

如果你用的是 `Ubuntu` 或 `Debian`，也可以直接用系统自带的 `apt`：

```bash
sudo apt update
sudo apt install build-essential gdb
```

`build-essential` 包含了 `GCC`、`G++`、`Make` 等常用工具，一次装齐。

---

## 编辑器选择：VSCode 与 Zed

写好代码需要一款好用的编辑器。这里推荐两个选择。

### Visual Studio Code（VSCode）

`VSCode` 是微软出品的免费编辑器，插件生态丰富，非常适合 `C/C++` 开发。

#### 安装 VSCode

```powershell
# Windows (winget)
winget install -e --id Microsoft.VisualStudioCode

# macOS (Homebrew)
brew install --cask visual-studio-code
```

#### 必装插件

打开 VSCode，点击左侧扩展图标（或按 `Ctrl+Shift+X`），搜索并安装以下插件：

| 插件名称 | 作用 |
|----------|------|
| **C/C++**（Microsoft 出品） | 语法高亮、代码补全、调试支持 |
| **C/C++ Extension Pack** | 上面那个插件的全家桶，额外包含 CMake 等工具支持 |
| **CMake Tools** | 在进入多文件项目后，帮助配置和构建 CMake 项目（前期可不装） |
| **GitLens** | Git 历史记录可视化（非必须，但很有用） |
| **Chinese (Simplified) Language Pack** | 中文界面（如果你需要） |

安装完 `C/C++` 插件后，打开一个 `.c` 或 `.cpp` 文件，编辑器会自动激活语法高亮和智能提示。

### Zed

`Zed` 是一款强调高性能与协作体验的编辑器，目前提供 `Windows`、`macOS` 和 `Linux` 版本。它的安装方式和语言扩展可能随版本变化，实际操作时以安装页与编辑器内提示为准。

`Zed` 是一款新兴的编辑器，生态不如 `VSCode` 完善（甚至可以说，比较糟糕，很多方便的功能，比如说阅读 pdf 文件，`Zed` 编辑器都没有提供原生支持，也很难找到插件支持），但它的界面简洁、响应速度快，并且原生支持 agent 来用 AI 辅助编写项目，适合喜欢轻量级编辑器的用户。

#### 安装 Zed

```powershell
# Windows
winget install -e --id ZedIndustries.Zed
```

```bash
# macOS
brew install --cask zed

# Linux
curl -f https://zed.dev/install.sh | sh
```

#### Zed 的 C/C++ 支持

`Zed` 内置了 `C/C++` 的语言支持（基于 `Tree-sitter`），安装后打开 `.c` 或 `.cpp` 文件即可获得语法高亮、代码补全和跳转定义等功能，无需额外安装插件。对于 `Zed` 用户来说，开箱即用。

:::tip 选择哪个？
- **VSCode**：生态最完善，插件丰富，适合所有平台的初学者。
- **Zed**：界面简洁、响应较快，同样支持主流桌面系统；如果某个扩展或调试流程不顺手，可以先回到资料更多的 VSCode。
:::

---

## 编译并运行第一个程序

环境装好了，来编译一个真正的 `C` 程序试试。

### 创建源文件

打开编辑器，新建一个文件，输入以下代码，保存为 `hello.c`：

```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

### 使用 GCC 编译

打开终端（Windows 上打开 PowerShell，macOS/Linux 打开 Terminal），切换到源文件所在目录：

```bash
cd 你的文件路径
```

然后执行：

```bash
gcc hello.c -o hello
```

这条命令的含义是：用 `gcc` 编译 `hello.c`，生成可执行文件 `hello`（Windows 上为 `hello.exe`）。

编译成功后，运行它：

```bash
# Windows
.\hello.exe

# macOS / Linux
./hello
```

终端会输出：

```
Hello, World!
```

### 使用 MSVC 编译

如果安装了 `MSVC`，从开始菜单打开 `Developer Command Prompt for VS 2022`，同样切换到源文件目录，执行：

```bash
cl hello.c
```

这会生成 `hello.exe`，直接输入 `hello` 运行即可。

### g++ 编译 C++ 程序

如果你写的是 `C++` 程序（文件后缀为 `.cpp`），用 `g++` 代替 `gcc`：

```bash
g++ hello.cpp -o hello
./hello
```

### 常用编译选项

```bash
# 指定输出文件名（-o）
gcc hello.c -o my_program.exe

# 开启所有警告（-Wall）
gcc hello.c -std=c17 -Wall -Wextra -Wpedantic -o hello

# 开启调试信息（-g），后面调试程序时会用到
gcc hello.c -g -o hello

# 指定 C 语言标准（-std）
gcc hello.c -std=c17 -o hello

# 优化等级（-O2 是常用优化级别）
gcc hello.c -O2 -o hello
```

### 常见编译错误

初学者最常遇到的几个编译错误：

1. **`'gcc' 不是内部或外部命令`**（Windows）/ **`command not found: gcc`**（macOS/Linux）：编译器没有正确安装或没有添加到 `PATH`。重新检查安装步骤，确认环境变量配置正确。

2. **`fatal error: stdio.h: No such file or directory`**：标准库头文件找不到。通常是编译器安装不完整，尝试重新安装。

3. **`undefined reference to 'main'`**：程序没有 `main` 函数，或者 `main` 拼写错误（比如写成了 `mian`）。检查代码。

---

## 先分清四种工具

初学者经常把“编辑器”和“编译器”混为一谈：

| 工具 | 负责什么 |
|---|---|
| 编辑器 | 编写和浏览源代码，例如 VSCode、Zed |
| 编译器 | 把 `.c` / `.cpp` 翻译成目标文件，例如 GCC、Clang、MSVC |
| 调试器 | 暂停程序、查看变量和调用栈，例如 GDB、LLDB |
| 构建系统 | 管理多文件编译命令，例如 Make、CMake、XMake |

编辑器里出现红色波浪线不等于编译一定失败；点击“一键运行”成功也不表示你已经知道实际用了哪个编译器和参数。前几章建议坚持在终端手动输入编译命令，直到能解释命令中的每一部分。

### 推荐的学习期命令

```bash
# C
gcc hello.c -std=c17 -Wall -Wextra -Wpedantic -g -o hello

# C++
g++ hello.cpp -std=c++17 -Wall -Wextra -Wpedantic -g -o hello
```

- `-std=` 固定语言版本，避免不同机器默认标准不同；
- `-Wall -Wextra -Wpedantic` 尽量暴露可疑写法；
- `-g` 写入调试信息；
- 暂时不加高优化，便于单步观察。

不要为了“没有黄色提示”而随手关闭警告。先读懂它指出的类型、格式符、未使用变量或控制流问题，再决定如何修复。

### 路径和终端的两个常见坑

- 终端当前目录必须是源文件所在目录，或命令中写出正确路径；
- Windows PowerShell 运行当前目录的程序通常写 `./hello.exe` 或 `.\hello.exe`，只写 `hello` 可能不会搜索当前目录。

环境搭建的验收标准不是“插件都装了”，而是你能独立完成：创建文件、编译、读警告、运行、修改后重新编译。

## 小结

- `Windows` 推荐同时安装 `MinGW-w64`（通过 `MSYS2` 或 `scoop`）和 `MSVC`（通过 `Visual Studio Build Tools`）
- `macOS` / `Linux` 推荐 `Homebrew` 安装 `GCC` / `LLVM`
- 编辑器推荐 `VSCode` + `C/C++` 插件，或 `Zed`（macOS/Linux）
- 编译命令：`gcc 源文件.c -o 输出文件`，运行 `./输出文件`
- 学习阶段推荐：`-std=c17 -Wall -Wextra -Wpedantic -g`。先看懂警告，再考虑 `-O2` 优化

下一篇我们将回到计算机底层，看看汇编语言是怎么一步步演变成 `C` 语言的。
