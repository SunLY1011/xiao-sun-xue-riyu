# 国内发行 · A Gitee 过渡 + B 腾讯云 COS 正式

> **学员微信请发国内链接**（Gitee Pages 或备案后的 COS 域名），GitHub/jsDelivr 仅作备份与开发对照。  
> 配置真源：`docs/deploy-target.json` · 一键写入：`scripts/apply-deploy-target.py`

---

## 一、两条路径

| 路径 | 阶段 | 学员链接示例 | 语音 |
|------|------|--------------|------|
| **A · Gitee Pages** | 备案前过渡 | `https://你的用户名.gitee.io/XiaoWangXueRiyu/index.html?v=384` | 与页面**同源**（勿再用 jsDelivr） |
| **B · COS + CDN** | 备案后正式 | `https://learn.你的域名.com/index.html?v=384` | 与页面**同源** |

**注意**：只推小程序壳或只推部分文件**不能**加速语音；须上传 **整站 H5 + `tts-cache/`**（约 4600+ MP3）。

---

## 二、一次性准备

### 2.1 Gitee（A）

1. [gitee.com](https://gitee.com) 注册/登录，新建公开仓库 `XiaoWangXueRiyu`（勿用 README 初始化）。
2. 双击 **`笔记本发布到Gitee.bat`**（会先跑发布前自检，再推送）。
3. 仓库 → **服务 → Gitee Pages → 启动**（分支 `main`）。
4. Pages 生效后，记下：`https://{用户名}.gitee.io/XiaoWangXueRiyu`

### 2.2 腾讯云（B，备案通过后）

完整控制台步骤见 [国内部署-个人无公司-链接与语音.md](./国内部署-个人无公司-链接与语音.md)。

1. 个人 ICP 备案 → COS 桶 → CDN 绑 `https://learn.你的域名.com`
2. 复制 `docs/deploy-secrets.example.json` → `docs/deploy-secrets.local.json`（**勿提交**），填入 SecretId/SecretKey
3. 编辑 `docs/deploy-target.json` 的 `cos.bucket`、`cos.publicOrigin`

---

## 三、切换正式链接（仓库内）

### 切到 Gitee（A）

```bat
python scripts/apply-deploy-target.py --channel gitee --gitee-user 你的Gitee用户名
发布前自检.bat
```

然后 **再 push 一次 Gitee**（`public-url.config.js` 已改为国内域 + 语音同源）。

### 切到 COS（B）

```bat
python scripts/apply-deploy-target.py --channel cos --cos-domain https://learn.你的域名.com
python scripts/upload-cos.py
发布前自检.bat
```

CDN 控制台刷新：`index.html`、`sw.js`、`js/public-url.config.js`。

### 恢复 GitHub 对照

```bat
python scripts/apply-deploy-target.py --channel github
```

---

## 四、日常发版（国内为主时）

```text
1. 本地改课 / 语音 / UI
2. 发布前自检.bat  → 全 [OK]
3. bump js/share-wechat.js CACHE_VER（及 index.html CACHE_BOOT）
4. python scripts/sync-tts-sw-manifest.py
5. A：git push gitee main
   B：python scripts/upload-cos.py → CDN 刷新
6. 双击 帮你发布-Gitee国内.bat 或 帮你发布-COS国内.bat → 复制链接发微信
7. 微信 4G 真机：首课 🔊 + 书写页「に」笔顺图
```

---

## 五、脚本与 bat 索引

| 文件 | 作用 |
|------|------|
| `docs/deploy-target.json` | 三频道配置（github / gitee / cos） |
| `scripts/apply-deploy-target.py` | 写入 `public-url.config.js`、`share-wechat.js`、小程序 `h5-url.js` |
| `scripts/domestic-ship-files.py` | 国内应上传文件清单 |
| `scripts/upload-cos.py` | 上传到腾讯云 COS |
| `笔记本发布到Gitee.bat` | 自检 → 推送 Gitee → 打开 Pages 设置 |
| `帮你发布-Gitee国内.bat` | 复制 Gitee 学习链接 |
| `帮你发布-COS国内.bat` | 复制 COS 域名学习链接 |

---

## 六、验收（微信 · 4G）

| 项 | 通过标准 |
|----|----------|
| 链接可开 | 好友点开 `index.html?v=` 进首页 |
| 语音 | 首课 🔊 明显快于 GitHub；二次接近秒播 |
| 书写 | 入門「に」等，中间笔顺区有图、非空白 |
| 配置 | `HYOUGA_TTS_ORIGIN` 为空或与页面同域，**不是** jsDelivr |

---

## 七、安全

- Gitee **私人令牌**勿截图外传；若已泄露请立即在 Gitee 设置里**吊销并重建**。
- `deploy-secrets.local.json` 已 gitignore，勿提交腾讯云密钥。

---

**文档版本**：2026-05-25 · 与 `CACHE_VER=384` 同期
