# 徐铭杰 · 产品型前端与 AI 应用作品集

> 当前公开主项目已调整为 **弯路地图 Detour**。下方四个业务产品属于保留代码的归档原型，已经从首页下线；在完成真实端到端验收前，不再宣称它们“已接入”或“真实可用”。

## 旗舰项目：弯路地图 Detour

Detour 读取 Git 历史和用户明确选择的 Codex JSONL，提出可能的失败、回退与方向调整节点；所有结论和公开内容仍由人确认。

- [打开交互案例](projects/tools/detour/)
- [项目说明](projects/tools/detour/README.md)
- [本地扫描器](tools/detour.mjs)

```powershell
node tools/detour.mjs --scan --repo . --out .detour/review.js
node tools/detour.test.mjs
```

扫描器只使用 Node.js 标准库和本机 Git，不执行目标仓库脚本、不上传源码。

归档记录：以下内容保留此前求职产品探索过程，当前不作为公开完成项目展示。

- 在线地址:https://mmiinnxx.github.io/personal-website/
- 源码:<https://github.com/MmIiNnGgXx/personal-website>

## 目录结构

```
personal-website/
├── index.html                    # 精选作品集首页(旗舰 Detour + AI 四子棋)
├── README.md
├── assets/
│   └── screenshots/              # 各项目预览图
│       ├── ai-connect4.png
│       ├── detour.jpg
│       ├── ai-resume-reviewer.jpg
│       ├── commerce-cms-dashboard.jpg
│       ├── job-search-dashboard.jpg
│       └── product-analytics-dashboard.jpg
├── docs/                         # 设计与产品沉淀
│   ├── UI_OPTIMIZATION_GUIDE.md
│   ├── UI_PRODUCT_LESSON.md
│   └── REAL_INTEGRATIONS.md      # 真实集成凭据与验收步骤
├── scripts/                      # set-integration-secrets.ps1(服务端密钥写入)
├── supabase/                     # 迁移与 Edge Functions(归档实验)
├── tools/                        # detour 本地扫描器 CLI
└── projects/
    ├── ai/                       # AI 应用
    │   └── ai-resume-reviewer/
    ├── data-dashboards/          # 数据看板 / 运营工作台
    │   ├── commerce-cms-dashboard/
    │   ├── job-search-dashboard/
    │   └── product-analytics-dashboard/
    ├── games/                    # 小游戏 / 交互 Demo
    │   └── ai-connect4/
    ├── shared/                   # 共享云同步模块(cloud.js/css)
    └── tools/                    # 弯路地图 Detour(旗舰项目)
        └── detour/
```

## 项目

### 归档 AI 应用 `projects/ai/`

| 项目 | 说明 | 预览 |
|---|---|---|
| **简历与岗位诊断** | 上传真实 PDF/DOCX，通过 DeepSeek 生成匹配证据、缺口与人工确认的网申填写包 | [打开](projects/ai/ai-resume-reviewer/) |

### 归档数据看板 / 工作台 `projects/data-dashboards/`

| 项目 | 说明 | 预览 |
|---|---|---|
| **求职管理工作台** | 手工或 CSV 导入真实职位，管理匹配、投递、面试与跟进 | [打开](projects/data-dashboards/job-search-dashboard/) |
| **产品数据分析** | 读取真实 GA4 指标、事件和趋势；未连接时不显示模拟数字 | [打开](projects/data-dashboards/product-analytics-dashboard/) |
| **商品运营后台** | 只读同步 Shopify 商品、库存、订单和客户，不修改真实商店 | [打开](projects/data-dashboards/commerce-cms-dashboard/) |

### 小游戏 / 交互 Demo `projects/games/`

| 项目 | 说明 | 预览 |
|---|---|---|
| **AI 四子棋** | 单文件、零依赖网页小游戏;Minimax + Alpha-Beta 剪枝 AI,三档难度,含实时局势分析面板 | [打开](projects/games/ai-connect4/) |

## 技术

- 纯 HTML / CSS / JavaScript，无构建步骤、无前端框架
- 前端托管于 GitHub Pages；求职记录可先保存在浏览器，登录后同步到共享 Supabase
- 简历诊断通过 Supabase Edge Function 安全调用 DeepSeek；GA4 与 Shopify 凭据同样只保存在服务端

## 归档 Supabase 实验配置

根目录 `supabase/` 包含共享数据库迁移与三个 Edge Functions。当前架构使用 production/staging 两个项目：

1. 数据库迁移和登录重定向由 Supabase CLI 管理。
2. 前端 `config.js` 只包含 production URL 与 publishable key。
3. Edge Functions：`analyze-resume`、`sync-ga4`、`sync-shopify`。
4. Secrets：`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`GA4_PROPERTY_ID`、`GOOGLE_SERVICE_ACCOUNT_JSON`、`SHOPIFY_STORE_DOMAIN`、`SHOPIFY_ADMIN_ACCESS_TOKEN`。
5. 第三方连接未完成真实端到端验收；这些页面仅作为归档原型保留。

凭据配置和真实数据验收步骤见 [`docs/REAL_INTEGRATIONS.md`](docs/REAL_INTEGRATIONS.md)。

## 后续计划

1. 为每个项目补充「详情页」(背景 / 方案 / 复盘)
2. 在首页标注每个项目的技术栈与亮点
3. 补充在线 Demo 链接与作品说明
