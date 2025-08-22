# Cyberpunk 2027 数据类型系统完整指南

## 📋 目录
1. [系统概览](#系统概览)
2. [核心架构](#核心架构)
3. [🆕 共享功能系统](#共享功能系统)
4. [数据类型详解](#数据类型详解)
5. [配置文件说明](#配置文件说明)
6. [模板使用指南](#模板使用指南)
7. [扩展开发指南](#扩展开发指南)
8. [故障排除](#故障排除)
9. [API参考](#api参考)

---

## 📊 系统概览

Cyberpunk 2027 数据类型系统是一个基于配置驱动的灵活模板渲染系统，支持动态数据类型定义和自动属性派生。系统允许用户在聊天消息中嵌入结构化数据，并自动渲染为美观的UI组件。

### 🎯 核心特性
- **配置驱动**：通过JSON配置文件定义数据类型和映射规则
- **自动属性派生**：支持基于名称自动查找头像、稀有度等属性
- **类型化处理**：支持列表、特定对象、基础数据等多种数据类型
- **模块化架构**：查找函数和处理逻辑分离，便于扩展
- **Handlebars集成**：使用现代模板引擎进行渲染
- **🆕 共享功能系统**：声明式交互功能，支持切换、弹窗、工具提示等
- **🆕 Grid布局系统**：现代化的CSS Grid布局，高度可定制化

### 📁 文件结构
```
cyberpunk2027-hubs/
├── index.js                     # 主扩展文件
├── function_types.js            # 数据查找函数库
├── handlebars-renderer.js       # 模板渲染器
├── sharing_functions.js         # 🆕 共享功能模块
├── sharing_functions.css        # 🆕 共享功能样式
├── SHARING_FUNCTIONS_GUIDE.md   # 🆕 共享功能使用指南
├── chat-elements-themes/        # 主题文件夹
│   └── cyberpunk/              # 具体主题
│       └── scene-container/    # 模块类型
│           ├── config.json     # 配置文件
│           ├── template.html   # HTML模板
│           └── template.css    # CSS样式
└── DATA_TYPE_SYSTEM_GUIDE.md   # 本指南文档
```

---

## 🏗️ 核心架构

### 数据流程图
```
LLM输出/用户输入 → 数据解析 → 类型识别 → 属性派生 → 模板渲染 → UI显示
      ↓              ↓           ↓           ↓           ↓
   span标签      config.json  数据类型   function_types  handlebars
```

### 关键组件

1. **配置系统** (`config.json`)
   - 定义数据类型和映射规则
   - 指定自动属性和默认值

2. **数据处理器** (`index.js`)
   - 解析span标签中的数据属性
   - 根据配置进行类型化处理
   - 调用查找函数获取派生属性

3. **查找函数库** (`function_types.js`)
   - 提供统一的属性查找接口
   - 支持NPC、物品、技能等多种数据类型
   - 可扩展的模块化设计

4. **模板渲染器** (`handlebars-renderer.js`)
   - 基于Handlebars的模板引擎
   - 支持条件渲染和循环
   - 内置辅助函数

5. **🆕 共享功能系统** (`sharing_functions.js`)
   - 声明式交互功能定义
   - 支持切换、弹窗、工具提示等交互
   - 自动事件绑定和状态管理
   - Grid布局系统集成

---

## 🔧 共享功能系统

### 系统简介

共享功能系统为所有模板提供通用的交互功能，通过在模板中添加 `data-function` 属性来声明性地定义交互行为。

**核心理念**：
- **声明性交互** - 通过HTML属性定义功能，无需编写JavaScript
- **模块化复用** - 所有模板都能使用相同的功能集
- **易于扩展** - 新功能只需添加到共享模块即可
- **现代化布局** - 基于CSS Grid的响应式设计

### 🎯 主要功能

#### 1. Toggle切换功能
支持区域的展开/收起切换，带有初始状态设置：

```html
<!-- 基础用法 -->
<div class="section-header" data-function="toggle-wrapper(content-id)">
    <div class="toggle-indicator">▼</div>
    <div class="section-title">标题</div>
</div>

<!-- 设置初始状态 -->
<div class="section-header" data-function="toggle-wrapper(content-id, init_show=false)">
    <div class="toggle-indicator">▼</div>
    <div class="section-title">默认折叠的标题</div>
</div>

<!-- 完整参数 -->
<div class="section-header" data-function="toggle-wrapper(content-id, init_show=true, fade)">
    <div class="toggle-indicator">▼</div>
    <div class="section-title">自定义动画的标题</div>
</div>
```

#### 2. NPC信息弹窗
点击NPC头像显示详细信息：

```html
<div class="npc-avatar-wrapper" data-function="popup-info({{name}}, detailed)">
    <img src="{{avatar}}" alt="{{name}} Avatar" class="npc-avatar">
</div>
```

#### 3. CSS Grid布局系统
现代化的3列布局设计：

```css
.section-header {
    display: grid;
    grid-template-columns: 20px 24px 1fr; /* 指示器 图标 标题 */
    align-items: center;
    gap: 8px;
}

.toggle-indicator {
    justify-self: center;
    align-self: center;
    transition: transform 0.3s ease;
    transform-origin: center;
}
```

### 🎨 高度可定制化

#### 自定义Toggle指示器样式
```css
/* 用户只需要修改toggle-indicator样式 */
.toggle-indicator {
    background: url('my-custom-arrow.svg') no-repeat center;
    background-size: contain;
    border-radius: 50%;
    background-color: #00ffdd;
}

/* 或者使用图标字体 */
.toggle-indicator {
    font-family: 'Material Icons';
    font-size: 16px;
}

/* 高级动画效果 */
.toggle-indicator {
    transition: all 0.3s ease;
}

.toggle-expanded .toggle-indicator {
    transform: rotate(0deg) scale(1.1);
    background-color: #00ffdd;
}

.toggle-collapsed .toggle-indicator {
    transform: rotate(-90deg) scale(0.9);
    opacity: 0.7;
}
```

#### 布局自定义
```css
/* 调整指示器大小 */
grid-template-columns: 24px 24px 1fr; /* 20px → 24px */

/* 调整间距 */
gap: 12px; /* 8px → 12px */

/* 响应式设计 */
grid-template-columns: 
    minmax(16px, 24px)  /* 响应式指示器宽度 */
    auto 
    1fr;
```

### 📚 功能完整列表

| 功能名称 | 参数 | 说明 |
|---------|------|------|
| `toggle-wrapper` | `(targetId, initShow?, animation?)` | 切换区域显示/隐藏 |
| `expand-section` | `(targetId, effect?)` | 展开/收起区域 |
| `slide-toggle` | `(targetId, direction?)` | 滑动切换效果 |
| `popup-info` | `(npcName, template?)` | 显示NPC信息弹窗 |
| `tooltip-show` | `(content, position?)` | 显示工具提示 |
| `modal-display` | `(templateId, data?)` | 显示模态窗口 |
| `filter-list` | `(targetClass, filterValue)` | 过滤列表项 |
| `sort-items` | `(targetClass, sortBy)` | 排序项目 |
| `search-highlight` | `(keyword)` | 搜索高亮 |

详细使用说明请参考：[SHARING_FUNCTIONS_GUIDE.md](./SHARING_FUNCTIONS_GUIDE.md)

---

## 🔧 数据类型详解

### 1. npc_list (NPC列表类型)

**用途**：处理逗号分隔的NPC名称列表，自动查找每个NPC的头像

**配置示例**：
```json
"{{NPC_LIST_ALLIES}}": {
  "source": "llm",
  "category": "npc_list",
  "attribute": "data-npc-list-allies",
  "default": [],
  "description": "盟友NPC列表"
}
```

**数据类型配置**：
```json
"npc_list": {
  "description": "NPC列表数据类型，自动处理为数组",
  "output_format": "array",
  "auto_properties": ["name", "avatar"],
  "separator": ","
}
```

**输入示例**：
```html
<span data-type="scene-container" data-npc-list-allies="张三,李四,王五"></span>
```

**输出结果**：
```javascript
NPC_LIST_ALLIES: [
  { name: "张三", avatar: "/images/characters/zhangsan.png" },
  { name: "李四", avatar: "/images/characters/lisi.png" },
  { name: "王五", avatar: "" }
]
```

**模板使用**：
```handlebars
{{#ifNotEmpty NPC_LIST_ALLIES}}
  <div class="allies-section">
    <h3>盟友</h3>
    {{#each NPC_LIST_ALLIES}}
      <div class="npc-item">
        {{#if avatar}}<img src="{{avatar}}" alt="{{name}}">{{/if}}
        <span>{{name}}</span>
      </div>
    {{/each}}
  </div>
{{/ifNotEmpty}}
```

### 2. npc_specific (特定NPC类型)

**用途**：处理单个NPC名称，自动派生 `_NAME` 和 `_AVATAR` 属性

**配置示例**：
```json
"{{NPC_SPECIFIC_LEADER}}": {
  "source": "llm", 
  "category": "npc_specific",
  "attribute": "data-npc-specific-leader",
  "default": "Unknown",
  "description": "领导者NPC"
}
```

**输入示例**：
```html
<span data-type="scene-container" data-npc-specific-leader="Boss张"></span>
```

**输出结果**：
```javascript
// 自动生成三个属性：
NPC_SPECIFIC_LEADER: "Boss张",
NPC_SPECIFIC_LEADER_NAME: "Boss张", 
NPC_SPECIFIC_LEADER_AVATAR: "/images/characters/boss_zhang.png"
```

**模板使用**：
```handlebars
{{#ifExists NPC_SPECIFIC_LEADER}}
  <div class="leader-section">
    <h3>领导者</h3>
    <div class="leader-info">
      {{#if NPC_SPECIFIC_LEADER_AVATAR}}
        <img src="{{NPC_SPECIFIC_LEADER_AVATAR}}" alt="{{NPC_SPECIFIC_LEADER_NAME}}">
      {{/if}}
      <span class="leader-name">{{NPC_SPECIFIC_LEADER_NAME}}</span>
    </div>
  </div>
{{/ifExists}}
```

### 3. basic_data (基础数据类型)

**用途**：简单的字符串数据，不进行特殊处理

**配置示例**：
```json
"{{LOCATION_DATA}}": {
  "source": "llm",
  "category": "basic_data", 
  "attribute": "data-location",
  "default": "未知位置",
  "description": "当前位置信息"
}
```

### 4. auto_data (自动数据类型)

**用途**：从SillyTavern系统自动获取的数据

**配置示例**：
```json
"{{USER_NAME}}": {
  "source": "auto",
  "category": "auto_data",
  "type": "user",
  "attribute": "name", 
  "default": "User",
  "description": "用户名称（自动获取）"
}
```

---

## ⚙️ 配置文件说明

### config.json 结构

```json
{
  "template_type": "scene-container",
  "version": "2.0.0",
  "description": "模板描述",
  
  // 数据类型定义
  "data_types": {
    "npc_list": {
      "description": "类型描述",
      "output_format": "array",
      "auto_properties": ["name", "avatar"],
      "separator": ","
    }
  },
  
  // 数据映射配置
  "data_mapping": {
    "{{PLACEHOLDER}}": {
      "source": "llm|auto|derived",
      "category": "npc_list|npc_specific|basic_data|auto_data",
      "attribute": "data-attribute-name",
      "required": false,
      "default": "默认值",
      "description": "字段描述"
    }
  },
  
  // 验证规则
  "validation": {
    "min_required_fields": 1,
    "ignore_unknown_attributes": true
  }
}
```

### 配置字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `source` | string | 数据源：`llm`(LLM输出)、`auto`(系统自动)、`derived`(派生) |
| `category` | string | 数据类别，对应 `data_types` 中的定义 |
| `attribute` | string | HTML属性名称（不含data-前缀） |
| `required` | boolean | 是否必需字段 |
| `default` | any | 默认值，支持字符串、数组等 |
| `type` | string | 仅用于 `auto` 数据源，指定自动获取的类型 |

---

## 📝 模板使用指南

### Handlebars 语法

#### 基本变量
```handlebars
{{VARIABLE_NAME}}           <!-- 输出变量值 -->
{{{HTML_CONTENT}}}          <!-- 输出HTML内容（不转义） -->
```

#### 条件渲染
```handlebars
{{#if CONDITION}}
  <!-- 条件为真时显示 -->
{{else}}
  <!-- 条件为假时显示 -->
{{/if}}

{{#ifExists VARIABLE}}      <!-- 检查变量是否存在且不为空 -->
  <!-- 变量存在时显示 -->
{{/ifExists}}

{{#ifNotEmpty ARRAY}}       <!-- 检查数组是否不为空 -->
  <!-- 数组有内容时显示 -->
{{/ifNotEmpty}}
```

#### 循环渲染
```handlebars
{{#each ARRAY}}
  <div>{{name}} - {{avatar}}</div>  <!-- 访问数组元素属性 -->
{{/each}}
```

### 完整模板示例

```html
<div class="scene-container cyberpunk-theme">
  <!-- 基本信息区域 -->
  <div class="scene-header">
    <div class="location-info">
      <span class="location">📍 {{LOCATION_DATA}}</span>
      <span class="time">🕐 {{TIME_DATA}}</span>
    </div>
    {{#if WEATHER_DATA}}
      <div class="weather">🌤️ {{WEATHER_DATA}}</div>
    {{/if}}
  </div>

  <!-- NPC区域 -->
  <div class="npcs-section">
    <!-- 特定NPC显示 -->
    {{#ifExists NPC_SPECIFIC_LEADER}}
      <div class="leader-panel">
        <h3>🎯 关键人物</h3>
        <div class="npc-card leader">
          {{#if NPC_SPECIFIC_LEADER_AVATAR}}
            <img src="{{NPC_SPECIFIC_LEADER_AVATAR}}" alt="{{NPC_SPECIFIC_LEADER_NAME}}" class="npc-avatar">
          {{/if}}
          <span class="npc-name">{{NPC_SPECIFIC_LEADER_NAME}}</span>
        </div>
      </div>
    {{/ifExists}}

    <!-- NPC列表显示 -->
    {{#ifNotEmpty NPC_LIST_ALLIES}}
      <div class="allies-panel">
        <h3>🤝 盟友</h3>
        <div class="npc-grid">
          {{#each NPC_LIST_ALLIES}}
            <div class="npc-card ally">
              {{#if avatar}}
                <img src="{{avatar}}" alt="{{name}}" class="npc-avatar">
              {{else}}
                <div class="npc-avatar placeholder">👤</div>
              {{/if}}
              <span class="npc-name">{{name}}</span>
            </div>
          {{/each}}
        </div>
      </div>
    {{/ifNotEmpty}}
  </div>
</div>
```

---

## 🚀 扩展开发指南

### 添加新的数据类型

#### 步骤1：定义配置（config.json）

```json
// 1. 在 data_types 中添加新类型定义
"item_list": {
  "description": "物品列表数据类型",
  "output_format": "array", 
  "auto_properties": ["name", "icon", "rarity"],
  "separator": ","
},

// 2. 在 data_mapping 中添加具体实例
"{{ITEM_LIST_WEAPONS}}": {
  "source": "llm",
  "category": "item_list",
  "attribute": "data-item-list-weapons",
  "default": [],
  "description": "武器物品列表"
}
```

#### 步骤2：更新处理逻辑（index.js）

```javascript
// 在 processTemplateData 函数的 switch 语句中添加：
case 'item_list':
    value = processListData(value, config.data_types?.item_list);
    break;
```

#### 步骤3：实现查找函数（function_types.js）

```javascript
/**
 * 查找物品图标
 * @param {string} itemName - 物品名称
 * @returns {string} 图标URL或表情符号
 */
findItemIcon(itemName) {
    const itemIconMap = {
        '传说之剑': '⚔️',
        '龙鳞盾': '🛡️', 
        '治疗药水': '🧪',
        // 更多映射...
    };
    return itemIconMap[itemName] || '📦';
}

/**
 * 查找物品稀有度
 * @param {string} itemName - 物品名称
 * @returns {string} 稀有度等级
 */
findItemRarity(itemName) {
    const itemRarityMap = {
        '传说之剑': 'legendary',
        '龙鳞盾': 'epic',
        '治疗药水': 'common',
        // 更多映射...
    };
    return itemRarityMap[itemName] || 'common';
}
```

#### 步骤4：更新统一查找函数

```javascript
// 在 findPropertyValue 方法中添加新的属性处理：
case 'icon':
    return this.findItemIcon(itemName);
case 'rarity':  
    return this.findItemRarity(itemName);
```

#### 步骤5：更新模板（template.html）

```html
{{#ifNotEmpty ITEM_LIST_WEAPONS}}
  <div class="weapons-section">
    <h3>⚔️ 武器装备</h3>
    <div class="item-grid">
      {{#each ITEM_LIST_WEAPONS}}
        <div class="item-card {{rarity}}">
          <span class="item-icon">{{icon}}</span>
          <span class="item-name">{{name}}</span>
          <span class="item-rarity">{{rarity}}</span>
        </div>
      {{/each}}
    </div>
  </div>
{{/ifNotEmpty}}
```

### 创建新的模块类型

#### 步骤1：创建文件夹结构
```
chat-elements-themes/cyberpunk/inventory-check/
├── config.json     # 配置文件
├── template.html   # HTML模板  
└── template.css    # CSS样式
```

#### 步骤2：编写配置文件
参考现有的 `scene-container/config.json` 结构

#### 步骤3：设计HTML模板
使用Handlebars语法编写响应式模板

#### 步骤4：编写CSS样式
创建符合赛博朋克主题的现代样式

#### 步骤5：更新主题配置
在 `themes-config.json` 中注册新模块

---

## 🔍 故障排除

### 常见问题

#### 1. 模板不显示/条件渲染失效

**症状**：`{{#ifExists}}` 或 `{{#ifNotEmpty}}` 不工作
**原因**：数据处理时设置了默认值导致条件始终为真
**解决**：检查 `processNPCSpecificData` 等函数，确保空值时不设置属性

```javascript
// ❌ 错误：总是设置值
processedData[baseName] = cleanValue || 'Unknown';

// ✅ 正确：只在有值时设置
if (cleanValue && cleanValue !== '') {
    processedData[baseName] = cleanValue;
}
```

#### 2. NPC头像显示不出来

**症状**：NPC名称正确但头像为空
**原因**：角色库中找不到对应角色或头像文件缺失
**解决**：
1. 检查角色名称是否完全匹配
2. 确认角色库中存在该角色
3. 验证头像文件路径正确

```javascript
// 调试NPC查找
console.log('查找NPC:', npcName);
const npc = dataTypeFunctions.findNPCByName(npcName);
console.log('找到NPC:', npc);
```

#### 3. 数据类型处理错误

**症状**：列表数据显示为字符串而非数组
**原因**：`processListData` 函数未被调用或配置错误
**解决**：
1. 检查 `config.json` 中的 `category` 设置
2. 确认 `processTemplateData` 中的 switch 语句包含对应分支

#### 4. CSS样式不生效

**症状**：模板渲染但样式不正确
**原因**：CSS文件未加载或选择器优先级问题
**解决**：
1. 检查浏览器开发者工具确认CSS已加载
2. 使用更具体的CSS选择器
3. 确认CSS文件路径正确

### 调试技巧

#### 启用详细日志
```javascript
// 在浏览器控制台中设置
localStorage.setItem('cyberpunk_debug', 'true');
```

#### 查看处理后的数据
```javascript  
// 在模板中添加调试信息
<pre style="display:none;">{{json this}}</pre>
```

#### 测试数据查找函数
```javascript
// 在浏览器控制台中测试
console.log(cyberpunk2027.dataTypeFunctions.findNPCByName('测试角色'));
```

---

## 📚 API参考

### DataTypeFunctions 类

#### NPC相关方法
```javascript
// 查找NPC对象
findNPCByName(npcName: string): Object|null

// 获取NPC头像URL  
findNPCAvatar(npcName: string): string
```

#### 物品相关方法
```javascript
// 查找物品图标
findItemIcon(itemName: string): string

// 查找物品稀有度
findItemRarity(itemName: string): string

// 查找物品价值
findItemValue(itemName: string): number
```

#### 技能相关方法
```javascript
// 查找技能等级
findSkillLevel(skillName: string): number

// 查找技能冷却时间
findSkillCooldown(skillName: string): number

// 查找技能魔法消耗
findSkillManaCost(skillName: string): number
```

#### 通用方法
```javascript
// 统一属性查找接口
findPropertyValue(propName: string, itemName: string, itemType?: string): any

// 批量属性查找
findMultipleProperties(propNames: string[], itemName: string, itemType?: string): Object

// 检查属性支持
isPropertySupported(propName: string): boolean
```

### 处理函数

```javascript
// 列表数据处理
processListData(value: string, typeConfig: Object): Array

// NPC特定数据处理
processNPCSpecificData(placeholder: string, value: string, processedData: Object, typeConfig: Object): void

// 模板数据处理
processTemplateData(element: Element, config: Object): Object

// 模板渲染
renderTemplateWithConfig(template: string, data: Object, config: Object): string
```

---

## 📄 许可证和贡献

本系统是 Cyberpunk 2027 SillyTavern 扩展的一部分。

**开发原则**：
- 配置驱动，易于扩展
- 模块化设计，职责分离  
- 类型安全，错误处理完善
- 文档完整，便于维护

**贡献指南**：
1. 遵循现有代码风格和架构
2. 添加新功能时更新相应文档
3. 确保向后兼容性
4. 编写必要的测试用例

---

## 👥 开发团队

**系统架构与文档**：Claude (Anthropic)  
**产品设计与需求**：Kris  
**协作开发时间**：2025年1月

### 🤝 致谢
感谢 Kris 提供的创新想法和详细需求，让这个灵活的数据类型系统得以实现。本系统从简单的字符串替换升级为配置驱动的类型化处理系统，体现了协作开发的力量。

特别感谢在开发过程中的迭代优化：
- 🔧 修复了 `{{#ifExists}}` 条件渲染问题
- 📁 重构代码为模块化架构
- 🎨 设计了用户友好的配置系统
- 📚 创建了完整的开发文档
- 🆕 **v3.0新增**：共享功能系统 - 声明式交互功能
- 🆕 **v3.0新增**：Grid布局系统 - 现代化响应式设计
- 🆕 **v3.0新增**：Toggle指示器重构 - 高度可定制化
- 🆕 **v3.0新增**：初始状态控制 - `init_show` 参数支持

---

*最后更新：2025年8月 - v3.0.0*  
*开发者：Claude & Kris 联合开发*