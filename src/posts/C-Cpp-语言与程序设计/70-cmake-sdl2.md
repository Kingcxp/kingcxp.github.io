---
title: CMake 与 XMake：现代项目构建
date: 2026-07-20
icon: hammer
order: 70
category:
  - C/C++ 语言与程序设计
tag:
  - CMake
  - XMake
  - SDL2
  - 构建工具
  - 交叉编译
  - 链接库
author: Kingcq
---

## 引入：从 Makefile 到更现代的构建

上一篇的 `Makefile` 虽然能自动构建项目，但有几个明显的不足：

- <span style="color: #409EFF;">跨平台困难</span>：Windows 用 `MinGW` 或 `MSVC`，Linux 用 `GCC`，macOS 用 `Clang`，`Makefile` 要为每个平台写不同版本。
- <span style="color: #409EFF;">依赖管理原始</span>：如果项目依赖了第三方库（如 `SDL2`、`OpenGL`），找库、配置路径全靠手动。
- <span style="color: #409EFF;">语法简陋</span>：条件判断、循环、函数等高级功能写起来很别扭。

于是社区发展出了更高级的构建工具。最流行的是 <span style="color: #409EFF;">CMake</span>（事实标准），新兴的还有 <span style="color: #409EFF;">XMake</span>（更简洁的语法）。它们不直接编译代码，而是先生成本地构建文件（如 `Makefile`、`Visual Studio 解决方案`），再调用底层的编译器。

---

## 学习目标

- 理解 CMake 和 XMake 的基本概念
- 学会编写 `CMakeLists.txt` 和 `xmake.lua`
- 理解静态链接库（`.a`/`.lib`）与动态链接库（`.so`/`.dll`/`.dylib`）的区别
- 学会在项目中引入和链接第三方库（以 SDL2 为例）
- 了解交叉编译的概念

---

## 静态链接库与动态链接库

<span style="color: #E6A23C;">在动手写代码之前，先弄清楚两种库的区别，因为后面你会频繁遇到。</span>

### 静态链接库

- <span style="color: #409EFF;">Windows</span>：`.lib`
- <span style="color: #409EFF;">Linux</span>：`.a`
- <span style="color: #409EFF;">macOS</span>：`.a`

静态库在<span style="color: #409EFF;">链接阶段</span>被完整地复制到可执行文件中。生成的可执行文件<span style="color: #409EFF;">不依赖外部的库文件</span>，可以直接运行。

优点：部署简单，只要一个可执行文件就能跑。
缺点：多个程序使用同一个静态库时，每个程序都有一份副本，浪费磁盘和内存；库升级时需要重新链接。

### 动态链接库

- <span style="color: #409EFF;">Windows</span>：`.dll`（搭配 `.lib` 导入库）
- <span style="color: #409EFF;">Linux</span>：`.so`
- <span style="color: #409EFF;">macOS</span>：`.dylib`

动态库在<span style="color: #409EFF;">运行阶段</span>才被加载到内存中。可执行文件只记录"我需要这个库"，运行时由系统加载器去找并加载。

优点：多个程序共享一份库文件，节省内存；库升级时只要替换 `.dll`/`.so` 文件即可，程序无需重新链接。
缺点：部署时需要带上所有依赖的 `.dll`/`.so`，缺少任何一个程序都无法启动。

### 怎么选？

- 小工具、教学项目：静态链接最简单，一个文件到处跑
- 大型项目、需要频繁更新库：动态链接更灵活
- 第三方库通常两种都提供，看你需要

---

## 使用 SDL2 开发一个简单游戏

`SDL2`（Simple DirectMedia Layer）是一个跨平台的多媒体库，提供窗口创建、图像渲染、音频播放、键盘鼠标输入等功能。我们用它来做一个简单的弹球游戏，同时学习如何管理外部依赖。

### SDL2 的安装

首先需要把 `SDL2` 安装到系统上。

```bash
# Windows (MSYS2)
pacman -S mingw-w64-ucrt-x86_64-SDL2 mingw-w64-ucrt-x86_64-SDL2_mixer mingw-w64-ucrt-x86_64-SDL2_image mingw-w64-ucrt-x86_64-SDL2_ttf

# macOS (Homebrew)
brew install sdl2 sdl2_mixer sdl2_image sdl2_ttf

# Linux (Ubuntu/Debian)
sudo apt install libsdl2-dev libsdl2-mixer-dev libsdl2-image-dev libsdl2-ttf-dev
```

### 一个简单的 SDL2 弹球游戏

```c
// game.c
#include <SDL2/SDL.h>
#include <stdio.h>

#define WINDOW_WIDTH 800
#define WINDOW_HEIGHT 600

int main(int argc, char* argv[]) {
    // 初始化 SDL
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        printf("SDL 初始化失败: %s\n", SDL_GetError());
        return 1;
    }

    // 创建窗口
    SDL_Window* window = SDL_CreateWindow(
        "弹球游戏", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        WINDOW_WIDTH, WINDOW_HEIGHT, SDL_WINDOW_SHOWN);
    if (!window) {
        printf("窗口创建失败: %s\n", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    // 创建渲染器
    SDL_Renderer* renderer = SDL_CreateRenderer(
        window, -1, SDL_RENDERER_ACCELERATED);
    if (!renderer) {
        printf("渲染器创建失败: %s\n", SDL_GetError());
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    // 球的属性
    float ball_x = 400, ball_y = 300;
    float ball_vx = 3, ball_vy = 3;
    int ball_radius = 15;
    int running = 1;
    SDL_Event event;

    // 游戏主循环
    while (running) {
        // 处理事件
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) {
                running = 0;
            }
        }

        // 更新球的位置
        ball_x += ball_vx;
        ball_y += ball_vy;

        // 边界碰撞检测
        if (ball_x - ball_radius < 0 || ball_x + ball_radius > WINDOW_WIDTH)
            ball_vx = -ball_vx;
        if (ball_y - ball_radius < 0 || ball_y + ball_radius > WINDOW_HEIGHT)
            ball_vy = -ball_vy;

        // 渲染
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);  // 黑色背景
        SDL_RenderClear(renderer);

        // 画球（白色圆形，用矩形近似）
        SDL_Rect ball = {
            (int)(ball_x - ball_radius),
            (int)(ball_y - ball_radius),
            ball_radius * 2,
            ball_radius * 2
        };
        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);  // 白色
        SDL_RenderFillRect(renderer, &ball);

        SDL_RenderPresent(renderer);
        SDL_Delay(16);  // 约 60 FPS
    }

    // 清理
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
```

这个程序创建了一个窗口，里面有一个白色方块在弹跳。虽然简单，但它包含了游戏程序的基本骨架：初始化、事件循环、更新状态、渲染、清理。

---

## 用 CMake 构建 SDL2 项目

### 什么是 CMake

`CMake` 是目前 `C/C++` 项目最流行的构建系统生成器。它不直接编译，而是读取 `CMakeLists.txt` 配置文件，生成对应平台的构建文件（`Makefile`、`Visual Studio 解决方案`、`Ninja` 构建文件等）。

### CMakeLists.txt 的基本写法

在项目根目录下创建 `CMakeLists.txt`：

```cmake
# 指定最低 CMake 版本
cmake_minimum_required(VERSION 3.10)

# 项目名称和语言
project(BouncingBall C)

# 指定 C 语言标准
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# 查找 SDL2 库
find_package(SDL2 REQUIRED)

# 添加可执行文件目标
add_executable(bouncing_ball game.c)

# 链接 SDL2 库
target_link_libraries(bouncing_ball PRIVATE SDL2::SDL2)
```

逐行解释：

- `cmake_minimum_required(VERSION 3.10)`：声明用的 CMake 版本。版本太旧可能不支持某些语法。
- `project(BouncingBall C)`：项目名和语言。CMake 会根据语言选择合适的编译器。
- `set(CMAKE_C_STANDARD 11)`：要求使用 `C11` 标准。
- `find_package(SDL2 REQUIRED)`：<span style="color: #409EFF;">查找 SDL2 库</span>。`REQUIRED` 表示如果找不到就报错。CMake 会在系统的标准路径（以及你额外指定的路径）下搜索 `SDL2` 的配置脚本（`SDL2Config.cmake` 或 `sdl2-config.cmake`）。
- `add_executable(bouncing_ball game.c)`：声明要生成的可执行文件及其源文件。
- `target_link_libraries(bouncing_ball PRIVATE SDL2::SDL2)`：把 SDL2 库链接到目标。`PRIVATE` 表示这个依赖只对 `bouncing_ball` 自己可见。

### 构建和运行

```bash
# 创建构建目录（CMake 推荐在单独的目录中构建，不污染源码目录）
mkdir build && cd build

# 生成构建文件（默认生成 Makefile）
cmake ..

# 编译
make

# 运行
./bouncing_ball
```

用 `cmake ..` 时，CMake 会读取上一级目录的 `CMakeLists.txt`，自动检测编译器、查找依赖库，然后生成 `Makefile`。之后 `make` 编译，和上篇一样。

### CMake 中链接第三方库的通用方式

`target_link_libraries` 是 CMake 中链接库的核心命令。通用的形式是：

```cmake
target_link_libraries(目标名称 可见性 库1 库2 ...)
```

可见性有三种：

| 可见性 | 含义 |
|--------|------|
| `PRIVATE` | 只供当前目标使用，不传递给依赖当前目标的其他目标 |
| `PUBLIC` | 既供当前目标使用，也传递给依赖者 |
| `INTERFACE` | 当前目标不使用，只传递给依赖者（常用于纯头文件库） |

对于 `find_package` 找到的库，通常用 `PRIVATE` 链接即可。

### 如果 find_package 找不到 SDL2

`find_package` 在系统标准路径下搜索。如果 SDL2 安装在非标准位置（如通过 `MSYS2` 安装到 `C:\msys64`），需要手动指定路径：

```cmake
# 方法一：在运行 cmake 时指定
cmake .. -DCMAKE_PREFIX_PATH=C:/msys64/ucrt64

# 方法二：在 CMakeLists.txt 中指定（不推荐，硬编码路径不好移植）
set(CMAKE_PREFIX_PATH "C:/msys64/ucrt64")
```

`CMAKE_PREFIX_PATH` 告诉 CMake 去哪些额外目录搜索库的配置文件。

你也可以从网上（如 `https://github.com/libsdl-org/SDL/releases`）下载 SDL2 的预编译开发包，解压后同样用 `CMAKE_PREFIX_PATH` 指向解压目录。

---

## 用 XMake 构建 SDL2 项目

`XMake` 是一个比 CMake 更现代化的构建工具，语法更简洁（基于 Lua），而且内置了包管理——不需要提前安装 SDL2，XMake 会自动从网上下载。

### 安装 XMake

```bash
# Windows (scoop)
scoop install xmake

# macOS (Homebrew)
brew install xmake

# Linux
curl -f https://xmake.io/shget.text | sh
```

### xmake.lua 的写法

在项目根目录下创建 `xmake.lua`：

```lua
-- 项目名称和语言
target("bouncing_ball")
    set_kind("binary")
    add_files("game.c")
    add_requires("sdl2")
    add_packages("sdl2")
```

逐行解释：

- `target("bouncing_ball")`：定义一个构建目标。
- `set_kind("binary")`：目标是可执行文件（还有 `static` 静态库、`shared` 动态库）。
- `add_files("game.c")`：添加源文件。
- `add_requires("sdl2")`：声明需要 SDL2 库。XMake 会自动从网上下载并编译 SDL2。
- `add_packages("sdl2")`：把 SDL2 链接到目标。

### 构建和运行

```bash
# 配置、下载依赖、编译一步完成
xmake

# 运行
xmake run
```

XMake 的语法比 CMake 直观很多，而且内置包管理意味着你不再需要手动安装 SDL2。这也是它越来越受欢迎的原因。

### XMake 的更多配置

```lua
target("my_app")
    set_kind("binary")
    add_files("src/*.c")
    add_includedirs("include")       -- 添加头文件搜索路径
    set_languages("c11")             -- 设置 C 语言标准
    add_requires("sdl2", "sdl2_mixer", "sdl2_image")
    add_packages("sdl2", "sdl2_mixer", "sdl2_image")

-- 编译选项
set_config("cflags", "-Wall -g")
```

---

## 工具链选择与交叉编译

### 工具链是什么

<span style="color: #409EFF;">工具链</span>（Toolchain）是一组工具的集合，包括编译器、链接器、汇编器、调试器等。不同的平台有不同的工具链：

| 平台 | 常用工具链 |
|------|-----------|
| Windows (x86) | `MinGW-w64`（GCC）、`MSVC`（cl.exe） |
| Linux (x86) | `GCC`、`Clang` |
| macOS (x86/ARM) | `Apple Clang`（Xcode Command Line Tools） |
| ARM 嵌入式 | `arm-none-eabi-gcc` |

### 在 CMake 中选择工具链

CMake 会自动检测当前系统的默认工具链。如果要指定特定的工具链，可以在运行 `cmake` 时设置：

```bash
# 使用 MinGW（在 Windows 上）
cmake .. -G "MinGW Makefiles"

# 使用 MSVC（在 Windows 上，需要从 Developer Command Prompt 运行）
cmake .. -G "Visual Studio 17 2022"

# 使用 Ninja（更快的构建系统）
cmake .. -G "Ninja"
```

### 交叉编译

<span style="color: #409EFF;">交叉编译</span>（Cross Compilation）是在一个平台上编译出另一个平台可运行的程序。比如在 Windows 上编译 Linux 可执行文件，或者在 x86 电脑上编译 ARM 开发板的程序。

CMake 通过<span style="color: #409EFF;">工具链文件</span>（toolchain file）来支持交叉编译。创建一个 `arm-toolchain.cmake`：

```cmake
# 指定目标系统
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR arm)

# 指定交叉编译器
set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
set(CMAKE_CXX_COMPILER arm-linux-gnueabihf-g++)

# 指定目标系统的根文件系统路径（用于查找库和头文件）
set(CMAKE_SYSROOT /path/to/arm/sysroot)
```

然后这样构建：

```bash
cmake .. -DCMAKE_TOOLCHAIN_FILE=arm-toolchain.cmake
make
```

在 XMake 中配置交叉编译更简洁：

```bash
# 列出可用的工具链
xmake show -l toolchains

# 指定工具链
xmake f --toolchain=arm-linux-gnueabihf
xmake
```

:::tip 为什么要交叉编译？
嵌入式设备（如树莓派、STM32）的运算能力和内存有限，无法直接在上面编译大型程序。交叉编译让你用强大的 PC 编译，再把编译好的程序传过去运行。

对于初学者来说，理解交叉编译的概念就足够了。真正用到时再深入学习。
:::

---

## CMake 中的动态链接与静态链接

CMake 默认使用动态链接（生成的可执行文件依赖 `.so`/`.dll`）。如果要强制静态链接，可以：

```cmake
# 方式一：要求静态链接所有库
set(CMAKE_FIND_LIBRARY_SUFFIXES .a ${CMAKE_FIND_LIBRARY_SUFFIXES})

# 方式二：如果库同时提供了静态和动态版本，显式指定
find_package(SDL2 REQUIRED)
target_link_libraries(bouncing_ball PRIVATE SDL2::SDL2-static)  # 静态版本
```

判断一个库提供的是动态还是静态版本，要看 `find_package` 找到的 target 名字。通常 `SDL2::SDL2` 是动态，`SDL2::SDL2-static` 是静态，但不同的库命名规则不同，需要查阅对应库的文档。

在 XMake 中：

```lua
add_requires("sdl2", {configs = {shared = false}})  -- 静态链接
```

---

## 如何查找第三方库的 CMake 配置

当你需要引入一个新的第三方库时，如何知道 `find_package` 怎么写？

1. <span style="color: #409EFF;">查看库的官方文档</span>：大多数现代库都会提供 CMake 集成指南。
2. <span style="color: #409EFF;">查看库的安装目录</span>：安装后，在库的 `lib/cmake` 目录下找 `.cmake` 文件。
3. <span style="color: #409EFF;">搜索 GitHub</span>：搜索 `库名 cmake find_package`。
4. <span style="color: #409EFF;">使用 CMake 的 `find_package` 手册</span>：

```bash
cmake --help-module-list | grep SDL
```

5. <span style="color: #409EFF;">对于没有提供 CMake 配置的旧库</span>，可以用 `FindXXX.cmake` 模块或手动指定路径：

```cmake
# 手动指定库路径（不推荐，除非万不得已）
set(SDL2_INCLUDE_DIR "C:/path/to/SDL2/include")
set(SDL2_LIBRARY "C:/path/to/SDL2/lib/libSDL2.a")
find_package(SDL2 REQUIRED)
```

---

## 常见错误与注意事项

1. <span style="color: #F56C6C;">`find_package` 找不到库</span>：库没安装，或安装在非标准路径。用 `CMAKE_PREFIX_PATH` 指定搜索路径。
2. <span style="color: #F56C6C;">链接时提示 `undefined reference`</span>：忘记链接某个库，或者链接顺序不对。在 CMake 中确保所有 `target_link_libraries` 写全了。
3. <span style="color: #F56C6C;">运行时提示找不到 `.dll`/`.so`</span>：动态库不在系统的库搜索路径中。Windows 上可以把 `.dll` 和可执行文件放在同一目录，Linux 上可以设置 `LD_LIBRARY_PATH`。
4. <span style="color: #F56C6C;">CMake 版本太低</span>：某些语法需要新版本支持。升级 CMake 或在配置中降低要求。
5. <span style="color: #F56C6C;">XMake 下载依赖失败</span>：网络问题导致无法下载。检查网络，或配置镜像源。

---

## 现代 CMake 以 target 为中心

不要把所有设置都放进全局变量。先创建目标，再把需求绑定给目标：

```cmake
cmake_minimum_required(VERSION 3.20)
project(tiny_game LANGUAGES C)

add_executable(tiny_game game.c)
target_compile_features(tiny_game PRIVATE c_std_17)
target_compile_options(tiny_game PRIVATE
    $<$<C_COMPILER_ID:GNU,Clang>:-Wall;-Wextra;-Wpedantic>
)
```

`PRIVATE` 表示这些要求只用于当前目标；库项目还会用 `PUBLIC` 和 `INTERFACE` 传播头文件目录、编译特性和链接依赖。

## 优先链接导入目标

第三方包若提供 CMake 配置，常暴露类似 `SDL2::SDL2` 的导入目标：

```cmake
find_package(SDL2 CONFIG REQUIRED)
target_link_libraries(tiny_game PRIVATE SDL2::SDL2)
```

导入目标会携带正确头文件目录、库路径和平台依赖，比手写绝对路径更可移植。不同 SDL2 安装方式提供的包名和目标可能不同，应查看该包实际导出的 CMake 配置。

## 始终使用源外构建

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

`-S` 指源目录，`-B` 指构建目录。删除 `build` 就能清理生成文件，不污染源码。

多配置生成器（如 Visual Studio）通常在构建时指定配置：

```bash
cmake --build build --config Debug
```

## 静态和动态链接不是一个全局开关

库是否可静态链接、依赖是否也有静态版本、许可证和运行时选择都要逐目标确认。强行设置全局后缀或硬编码 `.a` / `.lib` 容易破坏跨平台构建。优先使用包提供的目标和选项。

## 构建系统不能替代依赖管理

CMake 描述怎样构建和连接目标，但库从哪里安装、版本怎样固定，还可能由系统包管理器、vcpkg、Conan、FetchContent 或 XMake 包管理处理。教程示例要把“发现依赖失败”和“源码编译失败”分开排查。

## 小结

- 静态库（`.a`/`.lib`）在链接时嵌入可执行文件，动态库（`.so`/`.dll`/`.dylib`）在运行时加载
- CMake 通过 `CMakeLists.txt` 描述项目结构，用 `find_package` 查找依赖，`target_link_libraries` 链接库
- XMake 用 Lua 语法，内置包管理，使用更简洁
- 交叉编译是在一个平台上编译另一个平台的可执行程序
- 引入第三方库时，优先查看官方文档，次选 `CMAKE_PREFIX_PATH`

到这里，你已经有能力搭建完整的 `C/C++` 开发环境、使用调试器定位 bug、用 Makefile 或 CMake/XMake 管理项目了。这些工具和经验会在后续的学习和实际开发中持续发挥作用。
