---
title: 8. 世界生成：成为造物主
date: 2025-05-28
icon: earth-asia
order: 8
category:
  - Minecraft Paper 服务器插件开发
tag:
  - 世界生成
  - ChunkGenerator
  - NBT 结构
  - 安全卸载
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 世界生成：重塑 Minecraft 的版图

如果你不满足于仅仅修改物品和命令，而是想创造一个全新的维度——比如全是浮空的空岛、地狱般的焦土，或者自动生成的玩家基地，那么你需要掌握 **世界生成 (World Generation)** 系统。

## 一、 拆解造物流水线：Chunk 生成管线

生成一个 16x16 的区块（Chunk）并不是一蹴而就的，它在 Paper 底层像流水线一样分为多个阶段。我们可以介入其中的任何一个环节：

1.  **群系分布 (BiomeProvider)**：决定哪里是沙漠，哪里是海洋（决定温度和湿度）。
2.  **噪音地形 (Noise Generation)**：搭骨架。利用数学噪声函数决定哪些坐标是石头，哪些是空气。
3.  **地表覆盖 (Surface Generation)**：上色。把顶层的石头换成草方块或沙子。
4.  **基岩与洞穴**：托底并雕刻出地下的空腔。
5.  **自然装饰 (BlockPopulators)**：种树、撒花、点缀矿石。

---

## 二、 注册你的生成器

要让服务器使用你的生成逻辑，有两条路径：

### 1. 接管主世界
在插件主类重写 `getDefaultWorldGenerator`：
```java
@Override
public ChunkGenerator getDefaultWorldGenerator(String worldName, String id) {
    return new MyCustomGenerator();
}
```
并在服务器的 `bukkit.yml` 中指定：
```yaml
worlds:
  world:
    generator: MyPluginName
```

### 2. 动态创建副世界 (小游戏常用)
```java
WorldCreator creator = new WorldCreator("mini_game_room");
creator.generator(new MyCustomGenerator());
World newWorld = Bukkit.createWorld(creator);
```

---

## 三、 安全陷阱：如何彻底删除一个世界？

**痛点**：直接用 Java 删除文件夹会失败，因为文件被服务器占用。直接 `unloadWorld` 可能会因为世界正在 Tick 而报错。

**解决方案：两步走销毁法**
我们需要理解服务器的 Tick 阶段：网络 -> 调度器任务 -> 世界 Tick。我们要避开世界 Tick 阶段。

```java
public void deleteWorld(String worldName) {
    World world = Bukkit.getWorld(worldName);
    if (world == null) return;

    // 1. 将玩家传送走，并在下一个 Tick 卸载世界
    new BukkitRunnable() {
        @Override
        public void run() {
            for (Player p : world.getPlayers()) p.teleport(Bukkit.getWorlds().get(0).getSpawnLocation());
            Bukkit.unloadWorld(world, false); // 卸载不保存

            // 2. 再延迟一点点时间执行物理删除
            new BukkitRunnable() {
                @Override
                public void run() {
                    File folder = world.getWorldFolder();
                    deleteFolder(folder);
                }
            }.runTaskLater(plugin, 5L);
        }
    }.runTask(plugin);
}
```

---

## 四、 实战：从零构建自定义地形

### 1. 群系分布 (BiomeProvider)
我们在这个阶段确定每个区块的群系类型。
```java
public class MyBiomeProvider extends BiomeProvider {
    @Override
    public @NotNull Biome getBiome(@NotNull WorldInfo worldInfo, int x, int y, int z) {
        return Biome.FOREST;
    }

    @Override
    public @NotNull List<Biome> getBiomes(@NotNull WorldInfo worldInfo) {
        return List.of(Biome.FOREST);
    }
}
```

### 2. 生成地形（ChunkGenerator）
我们在这个阶段生成地形。
```java
public class MyWorldGenerator extends ChunkGenerator {
    // 噪音地形
    @Override
    public void generateNoise(@NotNull WorldInfo worldInfo, @NotNull Random random, int chunkX, int chunkZ, @NotNull ChunkData chunkData) {
        for (int x = 0; x < 16; ++x) {
            for (int z = 0; z < 16; ++z) {
                for (int y = chunkData.getMinHeight(); y < Math.min(60, chunkData.getMaxHeight()); ++y) {
                    chunkData.setBlock(x, y, z, Material.STONE);
                }
            }
        }
    }

    // 表面覆盖
    @Override
    public void generateSurface(@NotNull WorldInfo worldInfo, @NotNull Random random, int chunkX, int chunkZ, ChunkData chunkData) {
        // 我们在这个阶段寻找最顶层的石头，并把它替换成我们想要的表面
        for (int x = 0; x < 16; x++) {
            for (int z = 0; z < 16; z++) {
                chunkData.setBlock(x, 60, z, Material.GRASS_BLOCK);
                chunkData.setBlock(x, 59, z, Material.DIRT);
            }
        }
    }

    // 基岩
    @Override
    public void generateBedrock(@NotNull WorldInfo worldInfo, @NotNull Random random, int chunkX, int chunkZ, ChunkData chunkData) {
        for (int x = 0; x < 16; x++) {
            for (int z = 0; z < 16; z++) {
                chunkData.setBlock(x, worldInfo.getMinHeight(), z, Material.BEDROCK);
            }
        }
    }

    // 矿物生成
    @Override
    public @NotNull List<BlockPopulator> getDefaultPopulators(@NotNull World world) {
        return List.of(new DiamondPopulator());
    }
}
```

### 3. 装饰器：生成随机矿柱 (Populator)
装饰器阶段使用的是 **绝对坐标**。
```java
public class DiamondPopulator extends BlockPopulator {
    @Override
    public void populate(@NotNull WorldInfo worldInfo, @NotNull Random random, int chunkX, int chunkZ, @NotNull LimitedRegion region) {
        int worldX = (chunkX << 4) + random.nextInt(16);
        int worldZ = (chunkZ << 4) + random.nextInt(16);

        int startY = 61;

        region.setType(worldX, startY, worldZ, Material.DIAMOND_BLOCK);
        region.setType(worldX, startY + 1, worldZ, Material.DIAMOND_BLOCK);
        region.setType(worldX, startY + 2, worldZ, Material.DIAMOND_BLOCK);
    }
}
```

---

## 五、 高级：粘贴 NBT 结构建筑

这是最实用的技术。你可以先在游戏里用“结构方块”导出一个 `.nbt` 文件，然后在世界生成时强行“粘贴”它。

```java
@Override
public void populate(WorldInfo worldInfo, Random random, int chunkX, int chunkZ, LimitedRegion region) {
    if (chunkX == 0 && chunkZ == 0) { // 在 0,0 区块生成出生点建筑
        NamespacedKey key = new NamespacedKey(plugin, "lobby_building");
        Structure structure = Bukkit.getStructureManager().getStructure(key);

        if (structure != null) {
            Location loc = new Location(null, 0, 61, 0);
            // 将建筑粘贴到世界中
            structure.place(region, loc, false, StructureRotation.NONE, Mirror.NONE, 0, 1.0f, random);
        }
    }
}
```

::: tip 结构文件放哪里？
你可以将 `.nbt` 文件放在插件生成的 `structures` 文件夹中，或者打包在 `.jar` 文件的 resources 路径下，通过 `plugin.getResource()` 读取流并使用 `loadStructure(stream)` 加载。
:::

---

## 六、 总结

1.  **世界生成**是一个分层加工的过程，从群系到骨架，再到皮肤和装饰。
2.  **安全性**：卸载世界必须避开主线程正在 Tick 世界的时间点。
3.  **结构系统**是快速生成精美建筑的最佳方案，配合 `StructureManager` 可以实现极其复杂的地图自动化。

::: info 接下来
我们已经掌握了从微观（物品）到宏观（世界）的所有逻辑。但是，插件的“视觉上限”被原版材质限制住了。如何给插件加入全新的 3D 模型和高清贴图？最后一章，我们将探索 **客户端视觉掌控**。
:::
