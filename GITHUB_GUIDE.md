# GitHub仓库创建和管理指南

## 🚀 第一步：在GitHub上创建仓库

1. **登录GitHub**
   - 访问 [github.com](https://github.com)
   - 登录你的账户

2. **创建新仓库**
   - 点击右上角的 "+" 按钮
   - 选择 "New repository"
   - 仓库名称：`cyberpunk2027-hubs`
   - 描述：`A comprehensive cyberpunk-themed extension for SillyTavern`
   - 设置为 **Public**（推荐）
   - **不要**勾选 "Add a README file"（我们已经有了）
   - **不要**勾选 "Add .gitignore"（我们已经创建了）
   - **不要**选择 License（我们已经有MIT许可证）
   - 点击 "Create repository"

## 💻 第二步：本地Git初始化

在你的扩展目录中打开终端，执行以下命令：

```bash
# 进入扩展目录
cd /home/kris/Projects/SillyTavern/public/scripts/extensions/cyberpunk2027-hubs

# 初始化Git仓库
git init

# 添加所有文件到暂存区
git add .

# 创建第一次提交
git commit -m "🎉 Initial release: Cyberpunk 2027 Hubs v1.0.0

✨ Features:
- Complete cyberpunk theme system with multiple layouts
- Dynamic background system (video, character, AI-generated)
- RPG-style combat interface with real-time health bars
- Template rendering system with Handlebars
- Sharing functions module for interactive components
- Responsive design for all screen sizes

🎨 Themes:
- Decker's Dream layout with enhanced UI
- Tyrell Cockpit layout with character backgrounds
- Matrix Terminal and Neural Holographic chat styles
- Neon Noir and Rust Chrome visual themes

🛠️ Technical:
- Advanced data type processing system
- Resource management tools
- Performance optimizations
- Comprehensive documentation"

# 添加GitHub远程仓库（替换为你的GitHub用户名）
git remote add origin https://github.com/你的用户名/cyberpunk2027-hubs.git

# 推送到GitHub
git push -u origin main
```

## 🔄 第三步：日常Git操作

### 添加和提交更改
```bash
# 查看文件状态
git status

# 添加特定文件
git add 文件名.js

# 或添加所有更改
git add .

# 提交更改
git commit -m "✨ Add new feature: enhanced combat animations"

# 推送到GitHub
git push
```

### 创建版本标签
```bash
# 创建版本标签
git tag -a v1.0.1 -m "Version 1.0.1: Bug fixes and improvements"

# 推送标签到GitHub
git push origin v1.0.1
```

### 查看提交历史
```bash
# 查看提交日志
git log --oneline

# 查看文件更改
git diff
```

## 📋 第四步：GitHub仓库管理

### 设置仓库描述和标签
1. 进入你的仓库页面
2. 点击右侧的设置齿轮图标
3. 添加描述和标签：
   - **Description**: `A comprehensive cyberpunk-themed extension for SillyTavern with dynamic backgrounds, combat interface, and template system`
   - **Topics**: `sillytavern`, `cyberpunk`, `extension`, `theme`, `ai`, `chatbot`, `ui`, `javascript`

### 创建Release版本
1. 在仓库页面点击 "Releases"
2. 点击 "Create a new release"
3. 标签版本：`v1.0.0`
4. 标题：`🎉 Cyberpunk 2027 Hubs v1.0.0 - Initial Release`
5. 描述中包含主要功能和安装说明
6. 选择 "Set as the latest release"
7. 点击 "Publish release"

### 设置仓库特性
在仓库设置中启用：
- **Issues** - 用于bug报告和功能请求
- **Wiki** - 用于详细文档
- **Discussions** - 用于社区交流

## 🌟 第五步：推广和维护

### README优化
- 添加功能演示GIF
- 添加安装视频教程
- 创建详细的使用示例

### 社区建设
- 在SillyTavern Discord中分享
- 在Reddit相关社区发布
- 回应Issues和Pull Requests

### 持续更新
- 定期修复bug
- 添加新功能
- 更新文档
- 保持与SillyTavern最新版本的兼容性

## 🔧 常用Git命令速查

```bash
# 克隆仓库
git clone https://github.com/你的用户名/cyberpunk2027-hubs.git

# 检查远程仓库
git remote -v

# 拉取最新更改
git pull

# 查看分支
git branch

# 创建新分支
git checkout -b feature/new-feature

# 切换分支
git checkout main

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

## 📞 获取帮助

如果在Git或GitHub操作中遇到问题：

1. **GitHub文档**: https://docs.github.com/
2. **Git教程**: https://git-scm.com/docs
3. **在线Git练习**: https://learngitbranching.js.org/
4. **GitHub Desktop**: 如果命令行太复杂，可以使用GUI工具

---

**记住：经常提交，写清楚提交信息，这样方便以后查看和维护！** 🚀