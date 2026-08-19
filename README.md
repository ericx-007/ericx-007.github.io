# 🐋 深海个人主页

纯静态个人主页，零依赖、无需构建，双击 `index.html` 就能看，推上 GitHub Pages 就能全世界访问。

配色灵感来自 DSH 的「深海女仆工坊」皮肤：深海蓝 / 长春花蓝 / 陶瓷白 / 柔金。

## 功能

- **关于我**：个人信息、教育背景、兴趣标签、当前状态
- **技能树**：熟练度进度条
- **项目三栏**：✅ 已完成 / 🔨 进行中（带进度条）/ 🗓 计划中（P0/P1/P2 优先级）
- **动力站**：
  - 每日一句（按日期轮换，可自定义语录）
  - 今日目标打卡：勾选完成，**连续打卡天数**存本地（localStorage），越坚持越有成就感
  - GitHub 统计卡片：填上用户名自动显示提交统计与连击热力图
- **里程碑时间线**：记录重要的节点
- **随笔预留区**：以后写博客直接填进配置
- 明暗双主题（跟随系统 + 手动切换）、深海气泡动画、响应式、404 页

## 目录结构

```
homepage/
├── index.html              # 页面骨架
├── css/style.css           # 深海主题样式
├── js/main.js              # 交互逻辑（零依赖）
├── data/
│   ├── site.config.js      # ★ 个人信息都在这改
│   └── projects.js         # ★ 项目数据都在这改
├── assets/                 # 头像、favicon
├── 404.html
└── .github/workflows/pages.yml   # GitHub Pages 自动部署
```

## 快速开始

1. **本地预览**：直接双击 `index.html`（纯静态，无需服务器）。
2. **填写个人信息**：打开 `data/site.config.js` 和 `data/projects.js`，把名字、GitHub 用户名、项目等替换成你的。
3. **部署到 GitHub Pages**（二选一）：

   **方式 A：Actions 自动部署（推荐）**
   ```bash
   cd homepage
   git init
   git add .
   git commit -m "我的个人主页"
   # 在 GitHub 上新建仓库（名字叫 <你的用户名>.github.io 可直接得到 https://<你的用户名>.github.io）
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git branch -M main
   git push -u origin main
   ```
   然后在仓库 **Settings → Pages** 里把 Source 选成 **GitHub Actions**，推送后 Actions 自动部署。

   **方式 B：gh-pages 分支**
   ```bash
   cd homepage
   git init && git add . && git commit -m "我的个人主页"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   git subtree push --prefix . origin gh-pages   # 或手动切 gh-pages 分支推送
   ```
   Settings → Pages 里 Source 选 **Deploy from a branch** → `gh-pages`。

4. **自定义域名**（可选）：仓库根放一个 `CNAME` 文件，内容写你的域名。

## 常见问题

| 问题 | 解决 |
|---|---|
| 头像不显示 | `site.config.js` 里 `avatar` 换成你自己的图片路径（如 `assets/me.jpg`） |
| GitHub 卡片没出现 | 确认 `site.config.js` 的 `github` 填了真实用户名（不是"你的用户名"） |
| 打卡数据丢了 | 打卡存在浏览器 localStorage，清浏览器缓存会清掉（这是特性：隐私） |
| 想加新板块 | 改 `index.html` 加 `<section>`，再在 `main.js` 里补渲染函数 |

## 更新

改完 `data/` 里的配置，`git add . && git commit && git push`，Actions 自动重新部署。

---

用 ♥ 和 🐋 搭建。加油，把"计划中"一个个变成"已完成"。
