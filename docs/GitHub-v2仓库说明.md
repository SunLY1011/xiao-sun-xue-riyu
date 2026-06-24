# XiaoWangXueRiyu-v2 · 新仓库说明

## 关系（与旧仓）

| 项目 | 旧仓 `origin` | 新仓 `v2` |
|------|----------------|-----------|
| GitHub 名 | `saivenwang-byte/XiaoWangXueRiyu` | `saivenwang-byte/XiaoWangXueRiyu-v2` |
| 可见性 | 公开（保持不动） | **公开** |
| 角色 | 学员现用链接、历史版本冻结 | **升级版 / 新分叉**，后续主要推这里 |
| 本地 remote | `origin` | `v2`（已配置） |

**原则**：不删、不改绑 `origin`；需要更新旧链接时再单独 `git push origin`（一般不必）。

## GitHub Pages 开通（Gmail 报错「Deploy failed」时必做）

| 状态 | 说明 |
|------|------|
| 本地 `localhost:8765` | 正常 |
| Gmail / Actions **#1** | 旧工作流 `configure-pages` 失败，**可忽略** |
| Actions **#4**（gh-pages 分支） | 应已成功，`gh-pages` 上已有 `index.html` |
| 公网仍 404 | **Pages 未在 Settings 里开通**（API `/repos/.../pages` 为 404） |

**还差你点一次 Save**（见根目录 `v2-Pages-开通说明.txt`）：

1. 双击 **`打开v2-Pages设置.bat`**  
2. **Source** → Deploy from a branch  
3. **Branch** → `main`（最快）或 `gh-pages`（与自动部署一致）  
4. **Folder** → `/ (root)` → **Save**  
5. 1～3 分钟后：`https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2/index.html?v=315`

`Resource not accessible by integration` 只出现在旧 run #1～#3，不是当前 gh-pages 发布流程。

---

## 一次性：在 GitHub 上建仓

任选其一。

### 方式 1 · 网页（无需 `gh` 登录）

1. 浏览器打开：<https://github.com/new>
2. Repository name：`XiaoWangXueRiyu-v2`
3. **Public**
4. **不要**勾选 “Add a README file”（避免与本地 `main` 首次推送冲突）
5. Create repository
6. 本机双击：`笔记本推送到GitHub-v2.bat`

### 方式 2 · GitHub CLI（笔记本已 `gh auth login`）

双击：`笔记本推送到GitHub-v2.bat`（脚本内会尝试 `gh repo create`）

## 日常推送（升级线）

```bat
笔记本推送到GitHub-v2.bat
```

等价命令：

```bash
git push -u v2 main
```

（脚本会先 `git add -A` 并尝试提交，再推送到 `v2`。）

## 学员链接（v2 开 Pages 后）

1. 仓库 **Settings → Pages → Source**：`Deploy from a branch` → `main` → `/ (root)`
2. 约 1～3 分钟后：

   `https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2/index.html?v=315`

（`v=` 与 `js/share-wechat.js` 的 `CACHE_VER` 一致；**微信默认分享已切 v2**。）

旧链接仍可用（内容停在最后一次 `origin` 推送）：

`https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=…`

## 本地 remote 检查

```bash
git remote -v
```

应看到：

- `origin` → `XiaoWangXueRiyu.git`
- `v2` → `XiaoWangXueRiyu-v2.git`
