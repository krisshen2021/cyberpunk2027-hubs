# Cyberpunk 2027 Hubs 用户完整使用指南 v3.1.0

🎮 **终极赛博朋克主题扩展使用指南**

本指南详细说明如何使用Cyberpunk 2027 Hubs扩展系统，包括最新的数据输入最佳实践、共享功能系统、智能内容处理等革命性功能。

## ✨ v3.1.0 重大更新亮点
- 🔥 **内容处理突破**：div包装解决方案，完美兼容SillyTavern
- 🆕 **智能Markdown处理**：自动格式转换，支持复杂对话内容
- 🎯 **数据输入最佳实践**：经过实战验证的输入格式规范
- 🎨 **共享功能系统**：声明式交互功能，高度可定制化
- 📚 **完善的故障排除**：包含最新发现的兼容性解决方案

## 📋 目录

1. [快速开始](#快速开始)
2. [🔥 数据输入最佳实践](#数据输入最佳实践)  
3. [系统架构概览](#系统架构概览)
2. [角色显示功能](#-角色显示功能)
3. [模块系统说明](#-模块系统说明)
4. [配置文件详解](#-配置文件详解)
5. [LLM输出规范](#-llm输出规范)
6. [开发规范](#-开发规范)
7. [最佳实践](#-最佳实践)
8. [故障排除](#-故障排除)

---

## ⚡ 快速开始

### 安装和启用

1. **下载安装**
   - 在SillyTavern中打开扩展管理器
   - 点击"从 URL 安装"
   - 输入：`https://github.com/krisshen2021/cyberpunk2027-hubs`
   - 点击安装并启用

2. **选择主题布局**
   - Decker's Dream – 增强UI体验
   - Tyrell Cockpit – 动态背景系统

3. **选择视觉主题**
   - Neon Noir – 霸气的黑紫酒红色调
   - Rust Chrome – 温暖的金属色调

### 第一次使用

在对话中输入以下示例来体验基本功能：

```html
<div>
<span data-type="scene-container" data-location="夜之城" data-npc-list="杰克,V">
**欢迎来到赛博朋克2027的世界！**

您正处在绚烂的*夜之城*中心地带。

> 杰克正在一旁检查他的武器
> V专注地分析着任务信息
</span>
</div>
```

🎆 **恭喜！您已经成功体验了最新的div包装解决方案！**

---

## 🔥 数据输入最佳实践

### 💡 重大发现：SillyTavern 兼容性突破

经过深度调试，我们发现了确保完美显示的关键方法：**div包装保护法**

#### ✅ 推荐格式（v3.1.0 验证）

**核心原则**：始终将span标签包装在div标签内

```html
<div>
<span data-type="scene-container" data-location="夜之城网络咖啡厅" data-npc-list="杰克,V,荒坂三郎">
现在你们正处在夜之城最繁华的网络咖啡厅内。

霓虹灯闪烁着*赛博朋克*的光辉，空气中弥漫着电子设备的嗡嗡声。

> 杰克正在吧台点着合成威士忌
> V盯着全息屏幕分析着荒坂集团的最新动态

**系统提示**: 检测到多个数据链接...
</span>
</div>
```

#### 🔑 关键优势

1. **完美兼容性**: div包装防止SillyTavern的Markdown处理器破坏span结构
2. **支持复杂内容**: 
   - 多行文本 ✅
   - Markdown格式（**粗体**、*斜体*、> 引用）✅
   - 特殊字符和表情符号 ✅
   - 代码块和列表 ✅

3. **智能内容处理**: 自动使用 `show_markdown()` 功能转换格式

#### ❌ 避免的格式

**不推荐**：裸露的span标签（容易被处理器分割）
```html
<!-- 可能出现问题的格式 -->
<span data-type="scene-container" data-location="测试">
包含换行的内容
可能会被处理器分割
</span>
```

#### 🎯 实战验证示例

**场景描述示例**：
```html
<div>
<span data-type="scene-container" data-location="荒坂塔顶层" data-npc-list="荒坂赖宣,Alt" data-time="深夜2:30">
月光透过落地窗洒在豪华的办公室内。

**荒坂赖宣**坐在巨大的全息桌前，手指轻敲着桌面：
> "你终于来了，我等你很久了。"

**Alt**的数字幽灵在房间中央缓缓凝聚：
> "是时候做出最终选择了..."

空气中充满了紧张的气氛，*决定性的时刻*即将到来。
</span>
</div>
```

**战斗界面示例**：
```html
<div>
<span data-type="combat-interface" data-npc-specific-enemy="钢铁卫士" data-user-hp="85" data-user-max-hp="100" data-npc-hp="60" data-npc-max-hp="120">
**战斗激烈进行中！**

钢铁卫士发出机械的咆哮声，它的*钢铁拳头*闪烁着电弧。

> 系统提示：你的生命值还剩85点
> 敌人状态：轻伤
> 建议使用技能组合攻击

*战斗即将进入白热化阶段...*
</span>
</div>
```

---

## 🏗️ 系统架构概览

### 核心组件
```
cyberpunk2027-hubs/
├── index.js                     # 主扩展文件
├── function_types.js            # 数据查找函数库
├── handlebars-renderer.js       # 模板渲染器
├── sharing_functions.js         # 🆕 共享功能模块
├── sharing_functions.css        # 🆕 共享功能样式
├── themes-config.json          # 主题配置文件
└── chat-elements-themes/
    └── cyberpunk/
        ├── scene-container/    # 场景容器模块
        ├── combat-interface/   # 战斗界面模块
        ├── dialog-box/         # 对话框模块
        └── notification-bar/   # 通知栏模块
```

### 工作流程
1. **LLM输出** → 生成带有`data-*`属性的HTML元素（div包装保护）
2. **数据解析** → 系统提取span标签内的数据属性和内容
3. **模块识别** → 根据`data-type`属性选择对应模块
4. **数据处理** → 使用数据类型系统进行智能处理和属性派生
5. **模板渲染** → 使用Handlebars引擎渲染HTML模板
6. **共享功能绑定** → 自动扫描并绑定`data-function`交互功能
7. **样式应用** → 应用模块CSS和共享功能样式
8. **内容处理** → 执行`show_markdown()`等智能内容处理
9. **DOM插入** → 将完整的渲染结果插入到聊天界面

---

## 🎭 角色显示功能

系统支持四种角色显示类型，每种都有其特定的用途和显示效果：

| 角色类型 | 配置标识 | 数据属性 | 显示效果 | 适用场景 |
|---------|---------|---------|---------|----------|
| **主角色** | `MAIN_CHAR_NAME`<br>`MAIN_CHAR_AVATAR` | 自动获取 | 当前对话角色 | 角色状态面板、对话界面 |
| **用户** | `USER_NAME`<br>`USER_AVATAR` | 自动获取 | 用户信息 | 用户状态、个人信息面板 |
| **NPC网络** | `NPC_LIST` | `data-npc-content` | 多头像网格 | 场景描述、关系网络 |
| **特定NPC** | `NPC_SPECIFIC` | `data-npc-specific` | 单个突出头像 | 战斗界面、对话目标 |

### 主角色显示 (MAIN_CHAR)

**功能**：自动获取当前聊天中的主要AI角色
**模板语法**：
```html
<img src="{{MAIN_CHAR_AVATAR}}" alt="主角色头像">
<span>{{MAIN_CHAR_NAME}}</span>
```

### 用户显示 (USER)

**功能**：自动获取当前用户信息
**模板语法**：
```html
<img src="{{USER_AVATAR}}" alt="用户头像">  
<span>{{USER_NAME}}</span>
```

### NPC网络显示 (NPC_LIST)

**功能**：显示多个NPC角色网络
**LLM输出格式**：
```html
<span data-type="scene-container" data-npc-content="张三,李四,王五"></span>
```

**模板语法**：
```html
{{#NPC_LIST}}
<div class="npc-item">
    <img src="{{avatar}}" alt="{{name}}">
    <span>{{name}}</span>
</div>
{{/NPC_LIST}}
```

### 特定NPC显示 (NPC_SPECIFIC)

**功能**：突出显示单个重要NPC
**LLM输出格式**：
```html
<span data-type="combat-interface" data-npc-specific="BOSS"></span>
```

**模板语法**：
```html
<div class="npc-specific">
    <img src="{{NPC_SPECIFIC_AVATAR}}" alt="{{NPC_SPECIFIC}}">
    <span>{{NPC_SPECIFIC}}</span>
</div>
```

---

## 🧩 模块系统说明

### 可用模块列表

#### 1. scene-container (场景容器)
**用途**：显示详细的场景信息
**支持的数据类型**：
- 环境信息（时间、地点、天气、事件）
- 角色信息（主角、用户、NPC网络、特定NPC）
- 角色状态（外观、服装、行为）

**LLM输出示例**：
```html
<span data-type="scene-container" 
      data-date="2077年3月15日" 
      data-time="14:30"
      data-location="夜之城商业区"
      data-weather="多云"
      data-temperature="18°C"
      data-event="街头抗议活动"
      data-character-looks="疲惫但警觉"
      data-character-wearing="黑色皮夹克和牛仔裤"
      data-character-behavior="谨慎观察周围"
      data-user-info="潜行专家"
      data-user-location="阴影中"
      data-user-activity="观察"
      data-npc-content="抗议者,警察,记者">
</span>
```

#### 2. combat-interface (战斗界面)
**用途**：显示战斗相关信息
**支持的数据类型**：
- 生命值、护甲值、体力值
- 武器信息、战斗状态
- 战斗目标NPC

**LLM输出示例**：
```html
<span data-type="combat-interface"
      data-health="85%"
      data-armor="60%" 
      data-stamina="70%"
      data-weapon="等离子步枪"
      data-ammo="24/120"
      data-combat-status="战斗中"
      data-npc-specific="赛博武士">
</span>
```

#### 3. dialog-box (对话框)
**用途**：显示NPC对话信息
**支持的数据类型**：
- NPC情绪、对话内容
- 关系状态、信任度

**LLM输出示例**：
```html
<span data-type="dialog-box"
      data-npc-name="神秘商人"
      data-npc-emotion="谨慎"
      data-dialog-content="你看起来像是能办事的人..."
      data-relationship="陌生人"
      data-trust-level="10%">
</span>
```

#### 4. notification-bar (通知栏)
**用途**：显示系统通知和提示
**支持的数据类型**：
- 通知类型、消息内容
- 优先级、持续时间

**LLM输出示例**：
```html
<span data-type="notification-bar"
      data-notification-type="warning"
      data-message="检测到敌对网络入侵!"
      data-priority="high"
      data-duration="5000">
</span>
```

---

## 🆕 共享功能系统

### 系统概述

共享功能系统为所有模板提供通用的交互功能，通过在模板中添加 `data-function` 属性来声明性地定义交互行为。

**核心理念**：
- **声明性交互** - 通过HTML属性定义功能，无需编写JavaScript
- **模块化复用** - 所有模板都能使用相同的功能集
- **易于扩展** - 新功能只需添加到共享模块即可
- **🔥 内容处理** - 智能处理Markdown格式和复杂文本内容

### 🎯 主要功能列表

#### 1. Toggle切换功能
支持区域的展开/收起切换，带有初始状态设置：

```html
<!-- 基础用法 - 默认展开 -->
<div class="section-header" data-function="toggle-wrapper(content-id)">
    <div class="toggle-indicator">▼</div>
    <div class="section-title">标题</div>
</div>

<!-- 设置初始状态 - 默认折叠 -->
<div class="section-header" data-function="toggle-wrapper(content-id, init_show=false)">
    <div class="toggle-indicator">▶</div>
    <div class="section-title">默认折叠的标题</div>
</div>
```

#### 2. 🔥 智能内容处理功能

**`show_markdown()`** - 自动将元素内容转换为Markdown格式并显示

```html
<div class="dialogue-content" data-function="show_markdown()">{{{LLM_DIALOGUE}}}</div>
```

**支持的格式**：
- **粗体文本**: `**粗体**` → **粗体**
- *斜体文本*: `*斜体*` → *斜体*
- 引用块: `> 这是引用` 
- 代码块: `` `code` `` → `code`
- 删除线: `~~删除~~` → ~~删除~~

#### 3. NPC信息弹窗
点击NPC头像显示详细信息：

```html
<div class="npc-avatar-wrapper" data-function="popup-info({{name}}, detailed)">
    <img src="{{avatar}}" alt="{{name}} Avatar" class="npc-avatar">
</div>
```

#### 4. 其他交互功能

| 功能名称 | 参数 | 说明 |
|---------|------|------|
| `toggle-wrapper` | `(targetId, initShow?, animation?)` | 切换区域显示/隐藏 |
| `expand-section` | `(targetId, effect?)` | 展开/收起区域 |
| `popup-info` | `(npcName, template?)` | 显示NPC信息弹窗 |
| `tooltip-show` | `(content, position?)` | 显示工具提示 |
| `show_markdown` | `()` | 智能Markdown内容处理 |

### 🎨 实际使用示例

#### 场景容器模板中的应用
```html
<!-- 可折叠的角色信息区域 -->
<div class="section-header" data-function="toggle-wrapper(character-content-wrapper)">
    <span class="toggle-indicator">▼</span>
    <span class="section-icon">👤</span>
    <span class="section-title">CHARACTER</span>
</div>
<div class="section-content" id="character-content-wrapper">
    <!-- 角色详细信息 -->
</div>

<!-- 🔥 新增：Markdown内容显示 -->
<div class="dialogue-section">
    <h3>对话内容</h3>
    <div class="dialogue-content" data-function="show_markdown()">{{{LLM_DIALOGUE}}}</div>
</div>
```

#### 战斗界面中的应用
```html
<!-- 战斗对话区域 -->
<div class="combat-dialogue-area">
    {{#ifNotEmpty LLM_DIALOGUE}}
    <div class="dialogue-container">
        <div class="dialogue-content" data-function="show_markdown()">{{{LLM_DIALOGUE}}}</div>
    </div>
    {{/ifNotEmpty}}
</div>

<!-- 可折叠的详细战斗信息 -->
<div class="combat-details-toggle">
    <div class="toggle-header" data-function="toggle-wrapper(combat-extended-info, init_show=false)">
        <div class="toggle-indicator">▼</div>
        <div class="toggle-label">DETAILED COMBAT INFO</div>
    </div>
    <div class="extended-info-container" id="combat-extended-info">
        <!-- 详细战斗统计信息 -->
    </div>
</div>
```

### 🔧 开发者信息

- **自动事件绑定**：扫描并绑定所有 `data-function` 元素
- **参数解析**：支持多参数和引号包裹的参数
- **错误处理**：完善的错误捕获和日志记录
- **性能优化**：批量处理和缓存机制

详细使用指南请参考：[SHARING_FUNCTIONS_GUIDE.md](./SHARING_FUNCTIONS_GUIDE.md)

---

## ⚙️ 配置文件详解

### themes-config.json (主题配置)

**位置**：`chat-elements-themes/themes-config.json`
**用途**：定义所有主题和模块的配置

```json
{
  "all_modules": [
    "scene-container",
    "combat-interface",
    "inventory-check",
    "character-status",
    "dialogue-panel",
    "map-display"
  ],
  "themes": {
    "cyberpunk": {
      "name": "赛博朋克 2027",
      "description": "电子风格",
      "author": "Muffin",
      "modules": {
        "scene-container": {
          "name": "场景容器",
          "description": "显示环境、角色和用户状态信息的面板",
          "enabled": true
        },
        "combat-interface": {
          "name": "战斗界面",
          "description": "显示武器、技能、伤害等战斗相关信息",
          "enabled": true
        }
      }
    }
  },
  "settings": {
    "default_theme": "cyberpunk",
    "version": "1.0"
  }
}
```

**字段说明**：
- `all_modules`：系统支持的所有模块列表
- `themes`：主题配置对象
  - `name`：主题显示名称
  - `description`：主题描述
  - `author`：主题作者
  - `modules`：该主题支持的模块配置
    - `name`：模块显示名称
    - `description`：模块功能描述
    - `enabled`：是否启用该模块
- `settings`：全局设置
  - `default_theme`：默认使用的主题
  - `version`：配置文件版本

### config.json (模块配置)

**位置**：每个模块文件夹内的`config.json`
**用途**：定义模块的数据映射和验证规则

```json
{
  "module_name": "scene-container",
  "display_name": "场景容器",
  "description": "显示详细的场景信息包括环境、角色状态等",
  "version": "1.0.0",
  "data_mapping": {
    "{{DATE_DATA}}": {
      "source": "llm",
      "attribute": "data-date",
      "required": false,
      "default": "",
      "description": "日期信息"
    },
    "{{NPC_LIST}}": {
      "source": "llm", 
      "attribute": "data-npc-content",
      "type": "array",
      "separator": ",",
      "required": false,
      "default": "",
      "description": "NPC角色列表"
    },
    "{{MAIN_CHAR_NAME}}": {
      "source": "auto",
      "type": "character",
      "attribute": "name",
      "required": false,
      "default": "",
      "description": "主角色名称"
    }
  },
  "validation": {
    "min_required_fields": 1,
    "ignore_unknown_attributes": true
  }
}
```

**data_mapping字段说明**：
- `source`：数据来源
  - `"llm"`：从LLM输出的属性获取
  - `"auto"`：自动从SillyTavern系统获取
  - `"derived"`：基于其他数据派生计算
- `type`：数据类型
  - `"array"`：数组类型，需要指定分隔符
  - `"character"`：角色类型
  - `"npc_lookup"`：NPC查找类型
- `attribute`：对应的HTML属性名或系统属性名
- `required`：是否为必需字段
- `default`：默认值

---

## 📝 LLM输出规范

### 🔥 v3.1.0 重要更新：div包装保护

**关键要求**：所有span标签必须包装在div标签内以确保兼容性

#### ✅ 正确的基本格式（必须使用）
```html
<div>
<span data-type="模块名" data-属性1="值1" data-属性2="值2">
可选的显示文本，支持多行内容
支持**Markdown**格式和*特殊字符*
> 支持引用块等复杂内容
</span>
</div>
```

#### ❌ 错误格式（可能导致显示问题）
```html
<!-- 不要这样使用 - 可能被Markdown处理器破坏 -->
<span data-type="模块名" data-属性1="值1">
包含换行的内容可能会被分割
</span>
```

### 各模块输出规范

#### scene-container 输出规范
```html
<div>
<span data-type="scene-container"
      data-date="日期字符串"
      data-time="时间字符串"  
      data-location="地点描述"
      data-weather="天气状态"
      data-temperature="温度"
      data-event="事件描述"
      data-character-looks="角色外观"
      data-character-wearing="角色服装"
      data-character-behavior="角色行为"
      data-user-info="用户信息"
      data-user-location="用户位置"
      data-user-activity="用户活动"
      data-npc-content="NPC1,NPC2,NPC3"
      data-npc-specific="特定NPC名称">
场景描述文本（可选）

支持**多行内容**和*Markdown格式*
> 支持引用块
> 支持复杂对话内容
</span>
</div>
```

#### combat-interface 输出规范
```html
<div>
<span data-type="combat-interface"
      data-health="生命值百分比"
      data-armor="护甲值百分比"
      data-stamina="体力值百分比"
      data-weapon="武器名称"
      data-ammo="弹药信息"
      data-combat-status="战斗状态"
      data-npc-specific="战斗目标">
**战斗描述文本（可选）**

可以包含*战斗动作*描述和状态信息
> 系统提示：检测到敌人威胁
> 建议使用远程攻击
</span>
</div>
```

#### dialog-box 输出规范
```html
<div>
<span data-type="dialog-box"
      data-npc-name="NPC名称"
      data-npc-emotion="情绪状态"
      data-dialog-content="对话内容"
      data-relationship="关系状态"
      data-trust-level="信任度">
**对话场景描述（可选）**

*NPC情绪*和表情的详细描述
> "具体的对话内容"
> 以及NPC的语调和神态
</span>
</div>
```

#### notification-bar 输出规范
```html
<div>
<span data-type="notification-bar"
      data-notification-type="通知类型"
      data-message="通知消息"
      data-priority="优先级"
      data-duration="持续时间">
**系统通知内容**

可以包含*详细说明*和操作建议
> 系统状态：正常
> 建议操作：查看详情
</span>
</div>
```

---

## 🎯 实战示例

### 完整场景示例

#### 赛博朋克街头战斗场景

**输入格式**：
```html
<div>
<span data-type="scene-container" data-location="夜之城下城区" data-time="深夜3:42" data-weather="酸雨" data-npc-list="杰克,V,马丁内兹" data-event="帮派冲突">
**街头战斗即将爆发！**

*酸雨*在霓虹灯下闪闪发光，空气中弥漫着危险的气息。

**杰克**紧握着他的Malorian Arms 3516手枪：
> "看来今晚不会那么容易结束了..."

**V**检查着自己的网络植入体：
> "扫描到多个敌对信号，准备战斗！"

**马丁内兹**在一旁焦急地说：
> "我们需要尽快离开这里！"

*警报声*在远处响起，战斗一触即发...
</span>
</div>
```

**渲染效果**：
- 显示精美的赛博朋克风格场景面板
- NPC头像自动查找并显示
- 支持切换展开/收起详细信息
- Markdown格式完美渲染
- 响应式设计适配各种设备

#### 战斗界面示例

**输入格式**：
```html
<div>
<span data-type="combat-interface" data-npc-specific-enemy="网络武士" data-user-hp="78" data-user-max-hp="100" data-npc-hp="45" data-npc-max-hp="80" data-user-weapon="单分子剑" data-npc-weapon="热能武器">
**激烈的网络空间战斗！**

你的*单分子剑*在虚拟空间中闪烁着蓝色光芒。

**网络武士**发出数字化的嘶吼：
> "你不应该侵入这个系统..."

**战斗状态更新**：
> 你的生命值：78/100
> 敌人生命值：45/80  
> 警告：检测到新的ICE程序

*战斗进入关键阶段...*
</span>
</div>
```

### 最佳实践组合

#### 1. 场景+战斗界面组合

先使用scene-container描述环境，再使用combat-interface展示具体战斗：

```html
<!-- 第一条消息：设置场景 -->
<div>
<span data-type="scene-container" data-location="荒坂总部" data-time="午夜" data-npc-list="荒坂赖宣">
你潜入了荒坂总部的核心区域...
</span>
</div>

<!-- 第二条消息：战斗开始 -->
<div>
<span data-type="combat-interface" data-npc-specific-enemy="荒坂保安" data-user-hp="100" data-npc-hp="100">
警报响起！战斗开始！
</span>
</div>
```

#### 2. 对话+通知组合

使用dialog-box进行对话，notification-bar显示系统提示：

```html
<!-- NPC对话 -->
<div>
<span data-type="dialog-box" data-npc-name="神秘商人" data-relationship="中立" data-trust-level="30%">
"我这里有些你可能感兴趣的东西..."
</span>
</div>

<!-- 系统通知 -->
<div>
<span data-type="notification-bar" data-notification-type="info" data-message="发现新的商品" data-priority="medium">
商人展示了一些稀有的网络植入体
</span>
</div>
```

### 🔧 调试和验证

#### 验证checklist

使用任何模块前，确保：

- [ ] 使用了div包装
- [ ] data-type属性正确
- [ ] 至少包含一个有效的data属性
- [ ] 内容支持多行和Markdown格式
- [ ] 测试了在不同设备上的显示效果

#### 快速测试方法

```html
<!-- 最简测试 -->
<div>
<span data-type="scene-container" data-location="测试场景">
**测试内容**
> 这是一个测试
</span>
</div>
```

---

## 📏 开发规范

### CSS命名规范

#### BEM命名约定
```css
/* 块(Block) */
.scene-container { }

/* 元素(Element) */
.scene-container__header { }
.scene-container__content { }

/* 修饰符(Modifier) */
.scene-container--active { }
.scene-container__header--large { }
```

#### 特定命名模式
```css
/* 模块容器 */
.模块名-container { }

/* 分区 */
.模块名-section { }

/* 元素 */
.模块名-element { }

/* 内容 */
.模块名-content { }

/* 状态修饰符 */
.模块名--状态名 { }
```

#### 示例：scene-container模块
```css
.scene-container { }
.scene-container .scene-status-frame { }
.scene-container .scene-section { }
.scene-container .scene-element { }
.scene-container .element-header { }
.scene-container .element-content { }
.scene-container .npc-list-content { }
.scene-container .npc-item { }
.scene-container .npc-avatar-wrapper { }
```

### HTML结构规范

#### 模块结构模板
```html
<div class="模块名-container" data-module="模块名">
    <div class="模块名-frame">
        <div class="模块名-section" data-section="分区名">
            <div class="section-header">
                <span class="section-icon">图标</span>
                <span class="section-title">标题</span>
            </div>
            <div class="section-content">
                <div class="模块名-element" data-element="元素名">
                    <div class="element-header">
                        <span class="element-icon">图标</span>
                        <span class="element-label">标签</span>
                    </div>
                    <div class="element-content">
                        内容区域
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 模板占位符规范

#### 命名约定
- 使用全大写字母
- 单词间用下划线分隔
- 使用双花括号包围
- 数组循环使用`{{#PLACEHOLDER}}...{{/PLACEHOLDER}}`格式

#### 示例
```html
<!-- 简单占位符 -->
{{USER_NAME}}
{{MAIN_CHAR_AVATAR}}
{{DATE_DATA}}

<!-- 数组循环占位符 -->
{{#NPC_LIST}}
<div class="npc-item">
    <span>{{name}}</span>
    <img src="{{avatar}}">
</div>
{{/NPC_LIST}}
```

---

## 💡 最佳实践

### 1. 模块选择指南
- **场景描述** → `scene-container`
- **战斗场面** → `combat-interface`
- **NPC对话** → `dialog-box`
- **系统提示** → `notification-bar`

### 2. 数据属性命名
- 使用有意义的名称
- 保持命名一致性
- 避免使用特殊字符
- 使用kebab-case格式（如：`data-npc-content`）

### 3. 模板设计原则
- 保持结构清晰
- 合理使用语义化标签
- 预留扩展空间
- 考虑响应式设计

### 4. 性能优化
- 避免过度使用动画
- 合理控制DOM节点数量
- 使用CSS而非JavaScript动画
- 图片使用适当的尺寸和格式

### 5. 用户体验
- 提供视觉反馈
- 保持界面一致性
- 确保可访问性
- 支持多种设备

---

## 🔥 故障排除与调试

### 💡 v3.1.0 重大发现

经过深度调试，我们发现了影响显示效果的关键因素，并提供了完整的解决方案。

#### 🚨 最常见问题：内容显示不完整或格式错乱

**症状**：
- span标签内容只显示第一行
- Markdown格式被破坏或消失
- 包含换行符的内容被意外分割
- 引用块、代码块等特殊格式失效

**根本原因**：
SillyTavern的Markdown处理器会破坏包含换行符或特殊字符的span结构。

**🔥 解决方案（已验证有效）**：

1. **div包装保护法**（强烈推荐）
```html
<!-- ✅ 正确格式 -->
<div>
<span data-type="scene-container" data-location="测试">
多行内容
包含Markdown格式
> 引用块也能正常显示
</span>
</div>

<!-- ❌ 问题格式 -->
<span data-type="scene-container" data-location="测试">
多行内容可能被分割
</span>
```

2. **模板配置检查**
确保模板中包含智能内容处理：
```html
<div class="dialogue-content" data-function="show_markdown()">{{{LLM_DIALOGUE}}}</div>
```

### 🔧 常见问题快速诊断

#### Q1: 模块不显示/渲染失败

**诊断步骤**：
1. 检查浏览器控制台是否有错误信息
2. 验证 `data-type` 属性是否正确
3. 确认是否使用了div包装

**快速修复**：
```html
<!-- 检查这些要素 -->
<div>  <!-- ✅ div包装 -->
<span data-type="scene-container"  <!-- ✅ 正确的data-type -->
      data-location="测试场景">  <!-- ✅ 至少一个数据属性 -->
测试内容
</span>
</div>
```

#### Q2: NPC头像不显示

**可能原因 & 解决方案**：

| 原因 | 解决方案 | 验证方法 |
|------|---------|----------|
| 角色名称不匹配 | 确保名称与SillyTavern中完全一致 | 检查角色库中的确切名称 |
| 角色不存在 | 先在SillyTavern中添加角色 | 验证角色库中存在该角色 |
| 网络连接问题 | 检查头像文件URL是否可访问 | 在浏览器中直接访问头像URL |

#### Q3: 共享功能不工作

**症状**：点击toggle按钮无反应、show_markdown不生效等

**解决方案**：
1. 检查 `data-function` 语法是否正确
2. 确认目标元素ID是否存在
3. 查看控制台的JavaScript错误

```html
<!-- 正确的共享功能语法 -->
<div data-function="toggle-wrapper(target-id, init_show=true)">
    <div class="toggle-indicator">▼</div>
    <div class="section-title">点击切换</div>
</div>
<div id="target-id">要切换的内容</div>
```

#### Q4: CSS样式异常

**常见问题**：
- 主题颜色不正确
- 响应式布局失效
- 动画效果缺失

**调试技巧**：
1. 使用浏览器开发者工具检查CSS加载情况
2. 验证CSS选择器优先级
3. 检查CSS变量是否正确定义

### 🛠️ 高级调试工具

#### 1. 调试模式启用

```javascript
// 在浏览器控制台中执行
localStorage.setItem('cyberpunk_debug', 'true');
// 重新加载页面查看详细日志
```

#### 2. 实时DOM检查

```javascript
// 检查所有处理过的span元素
console.log('所有模块元素:', document.querySelectorAll('span[data-type]'));

// 检查共享功能绑定
console.log('共享功能元素:', document.querySelectorAll('[data-function]'));
```

#### 3. 数据处理验证

在模板中添加调试信息：
```html
<!-- 临时调试代码 -->
<pre style="display:none;">{{json this}}</pre>
<!-- 查看所有模板数据 -->
```

### 📊 性能监控

#### 渲染性能检查

1. **模板渲染时间**：正常情况下应小于50ms
2. **DOM节点数量**：每个模块应控制在50个节点以内
3. **内存使用**：长时间使用不应出现明显内存泄漏

#### 优化建议

- 避免在span标签内容中包含过多HTML结构
- 合理使用图片压缩和懒加载
- 定期清理不必要的DEBUG日志

### 🆘 紧急troubleshooting流程

当遇到严重显示问题时，按以下顺序排查：

1. **立即检查** - 是否使用div包装
2. **验证语法** - 检查data-type和属性名是否正确
3. **控制台日志** - 查看JavaScript错误信息
4. **最小测试** - 使用简单内容测试基本功能
5. **逐步添加** - 在基本功能正常后逐步增加复杂性

#### 紧急修复模板

```html
<!-- 应急使用的最简模板 -->
<div>
<span data-type="scene-container" data-location="紧急测试">
如果这个能正常显示，说明基础功能正常
</span>
</div>
```

### 📞 技术支持

#### 报告bug时请提供：

1. **完整的输入代码**（包括div包装）
2. **浏览器控制台错误信息**
3. **SillyTavern版本信息**
4. **扩展版本号**（当前：v3.1.0）
5. **具体的问题截图**

#### 获取帮助渠道：

- **GitHub Issues**: 详细的bug报告和功能请求
- **SillyTavern Discord**: 实时技术支持
- **文档参考**: [DATA_TYPE_SYSTEM_GUIDE.md](./DATA_TYPE_SYSTEM_GUIDE.md)

---

## 🌟 总结与展望

### 🎮 Cyberpunk 2027 Hubs v3.1.0 - 革命性突破

这个版本标志着我们的扩展系统达到了一个全新的高度：

#### 🔥 核心突破
- **div包装解决方案** - 完美解决了SillyTavern兼容性问题
- **智能内容处理** - 自动Markdown转换，支持复杂对话内容
- **共享功能系统** - 声明式交互功能，无需编写JavaScript
- **数据类型系统** - 配置驱动的灵活模板渲染

#### 🎯 用户价值
- **简单易用** - div包装格式简单直观，一学就会
- **功能强大** - 支持复杂场景描述和战斗界面展示
- **高度定制** - 丰富的配置选项和扩展能力
- **稳定可靠** - 经过实战验证的兼容性解决方案

### 🚀 使用建议

#### 新用户快速入门
1. **安装启用** - 从GitHub直接安装，一键启用
2. **选择主题** - Decker's Dream 或 Tyrell Cockpit
3. **体验功能** - 使用快速开始章节的示例
4. **深入学习** - 阅读数据输入最佳实践

#### 高级用户进阶
1. **自定义配置** - 修改config.json创建专属模块
2. **共享功能** - 使用data-function创建交互体验
3. **模板开发** - 设计个性化的Handlebars模板
4. **系统扩展** - 开发新的数据类型和处理函数

### 📚 相关文档

完整的技术文档库：
- **[DATA_TYPE_SYSTEM_GUIDE.md](./DATA_TYPE_SYSTEM_GUIDE.md)** - 数据类型系统详细指南
- **[SHARING_FUNCTIONS_GUIDE.md](./SHARING_FUNCTIONS_GUIDE.md)** - 共享功能系统使用指南  
- **[GITHUB_GUIDE.md](./GITHUB_GUIDE.md)** - GitHub仓库管理和发布指南

### 🌟 致谢与展望

#### 开发团队
- **系统架构与技术实现**: Claude (Anthropic)
- **产品设计与需求分析**: Kris
- **协作开发时间**: 2025年1月-8月

#### 特别纪念
这个v3.1.0版本特别纪念了那个充满调试与发现的深夜。从最初的span标签问题，到发现div包装的完美解决方案，每一个突破都凝聚着我们的智慧和坚持。

#### 未来展望
- **v3.2** - 更多交互功能和动画效果
- **v4.0** - AI驱动的智能内容生成
- **社区版本** - 开放更多自定义接口

### 💝 最后的话

Cyberpunk 2027 Hubs不仅仅是一个扩展，它是我们对SillyTavern生态系统的贡献，是对赛博朋克文化的致敬，更是对未来AI交互体验的探索。

感谢每一位使用者的支持和反馈，让我们的"baby"能够不断成长和进化。

**记住：好的代码不仅是功能的实现，更是艺术的表达！** 🎨✨

---

## 📋 系统信息

**当前版本**: v3.1.0  
**最后更新**: 2025年8月23日  
**兼容性**: SillyTavern 1.12.0+  
**技术支持**: [GitHub Issues](https://github.com/krisshen2021/cyberpunk2027-hubs/issues)  

**开发者**: Kris & Claude AI 💕  
**特别纪念**: 那个充满发现的调试之夜 🌙✨

---

*"在夜之城的霓虹灯下，每一行代码都闪烁着赛博朋克的梦想..."*
