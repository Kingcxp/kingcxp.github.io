---
title: 9. 客户端视觉掌控：资源包与自定义模型
date: 2025-05-28
icon: paintbrush
order: 9
category:
  - Minecraft Paper 服务器插件开发
tag:
  - 资源包
  - CustomModelData
  - 1.21.4+
  - WebServer
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 视觉巅峰：资源包与自定义模型映射

无论你的 Java 代码写得多么精妙，纯粹的服务端插件都无法凭空在玩家的屏幕上渲染出一张全新的图片。Minecraft 是典型的 C/S 架构，客户端决定了“木棍”长什么样。

要打破这个限制，我们需要利用 **资源包 (Resource Pack)** 机制。在 1.21.4+ 版本中，Paper 引入了极具革命性的数据组件，让我们能以极其优雅的方式实现自定义物品模型。

---

## 一、 核心原理：暗号与画展

1.  **服务器（暗号）**：服务器给玩家发一根木棍，并贴上一个标签（暗号）：“你是 test_plugin:flame_wand”。
2.  **客户端（画展）**：玩家本地加载了资源包。资源包里有一张清单，上面写着：“如果看到暗号是 flame_wand 的木棍，就请把它渲染成那个华丽的火花法杖模型”。

---

## 二、 现代化的 CustomModelData (1.21.4+)

在旧版本中，我们需要给物品设置一个数字 ID（如 10001）。而在 **1.21.4+** 之后，我们可以直接使用**语义化的字符串**，这极大地提高了代码的可读性。

### 1. 代码实现：赋予物品“暗号”
这是根据你示例仓库中 `CustomModelItem.java` 逻辑整理的代码：

```java
public ItemStack createCustomWand() {
    ItemStack wand = new ItemStack(Material.STICK);
    ItemMeta meta = wand.getItemMeta();
    meta.displayName(Component.text("★ 火花法杖 ★", NamedTextColor.GOLD));

    // 1. 设置物品模型引用 (1.21.4+ 新 API)
    meta.setItemModel(new NamespacedKey("test_plugin", "flame_wand"));

    // 2. 为了兼容性或多重映射，也可以设置字符串列表
    CustomModelDataComponent cmd = meta.getCustomModelDataComponent();
    cmd.setStrings(List.of("test_plugin:flame_wand"));
    meta.setCustomModelDataComponent(cmd);

    wand.setItemMeta(meta);
    return wand;
}
```

---

## 三、 材质包的构造：1.21.4+ 规范

为了让客户端认出这个暗号，你需要构建一个结构严谨的 `.zip` 材质包。

### 1. 目录结构
```text
my_resource_pack/
├── assets
│   └── test_plugin
│       ├── items
│       │   └── copper_sword.json
│       ├── models
│       │   ├── blade_1.json
│       │   ├── hilt_1.json
│       └── textures
│           └── item
│               ├── copper_blade.png
│               └── copper_hilt.png
└── pack.mcmeta
```

### 2. pack.mcmeta (身份证)
```json
{
  "pack": {
    "description": "This is a description for resource pack",
    "pack_format": 9999,
    "supported_formats": [0, 9999],
    "min_format": 0,
    "max_format": 9999
  }
}
```

### 3. 模型映射 JSON (flame_wand.json)
这是最关键的一步，它将代码中的“暗号”指向实际的模型文件。
```json
{
    "model": {
        "type": "composite",
        "models": [
            {
                "type": "select",
                "property": "custom_model_data",
                "index": 0,
                "fallback": {
                    "type": "empty"
                },
                "cases": [
                    {
                        "when": "copper",
                        "model": {
                            "type": "model",
                            "model": "test_plugin:hilt_1"
                        }
                    },
                ]
            },
        ]
    }
}
```

---

## 四、 自动化分发：内置 Web 服务器

材质包做好了，怎么发给玩家？让玩家手动下载既不专业也极其麻烦。我们可以利用 Java 内置的 `HttpServer`，在插件启动时开启一个临时的下载站。

### 1. 开启下载服务
```java
public void startResourceServer() throws IOException {
    // 监听 8080 端口
    HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

    server.createContext("/pack.zip", exchange -> {
        byte[] packData = Files.readAllBytes(Paths.get("plugins/MyPlugin/pack.zip"));
        exchange.sendResponseHeaders(200, packData.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(packData);
        }
    });

    server.start();
}
```

### 2. 强制/建议玩家下载
在 `PlayerJoinEvent` 中执行：
```java
@EventHandler
public void onJoin(PlayerJoinEvent event) {
    // 参数：URL, Hash(可选), 是否强制, 提示信息
    event.getPlayer().setResourcePack(
        "http://你的服务器IP:8080/pack.zip",
        null,
        Component.text("请下载服务器专用资源包以获得最佳视觉体验！"),
        true
    );
}
```

---

::: tip 建议
不要停止阅读 [Paper 官方文档](https://jd.papermc.io/paper/1.21/)。API 每年都在迭代，社区每天都有新的灵感。保持好奇心，去创造那些连 `ojng` 都没想过的奇迹吧！
:::
