# 徐铭杰 · 作品集 Personal Website

求职作品集:用**可直接体验的原型**展示 AI 应用、数据分析与产品界面能力,而不是一页静态简历。

- 在线地址:https://mmiinnxx.github.io/personal-website/
- 源码:<https://github.com/MmIiNnGgXx/personal-website>

## 目录结构

```
personal-website/
├── index.html                    # 作品集首页(项目矩阵)
├── README.md
├── assets/
│   └── screenshots/              # 各项目预览图
│       ├── ai-resume-reviewer.jpg
│       ├── commerce-cms-dashboard.jpg
│       ├── job-search-dashboard.jpg
│       └── product-analytics-dashboard.jpg
├── docs/                         # 设计与产品沉淀
│   ├── UI_OPTIMIZATION_GUIDE.md
│   └── UI_PRODUCT_LESSON.md
└── projects/
    ├── ai/                       # AI 应用
    │   └── ai-resume-reviewer/
    └── data-dashboards/          # 数据看板 / 运营工作台
        ├── commerce-cms-dashboard/
        ├── job-search-dashboard/
        └── product-analytics-dashboard/
```

## 项目

### AI 应用 `projects/ai/`

| 项目 | 说明 | 预览 |
|---|---|---|
| **简历与岗位诊断** | 对照岗位要求检查关键词覆盖,输出能力缺口、项目表达模板与诊断报告 | [打开](projects/ai/ai-resume-reviewer/) |

### 数据看板 / 工作台 `projects/data-dashboards/`

| 项目 | 说明 | 预览 |
|---|---|---|
| **求职管理工作台** | 集中管理投递阶段与跟进备注,支持搜索、筛选、编辑与本地保存 | [打开](projects/data-dashboards/job-search-dashboard/) |
| **产品数据分析** | 按用户分群与时间范围查看注册、激活、付费漏斗与事件汇总 | [打开](projects/data-dashboards/product-analytics-dashboard/) |
| **商品运营后台** | 管理商品资料与库存,筛选订单状态,查看客户消费与经营指标 | [打开](projects/data-dashboards/commerce-cms-dashboard/) |

## 本地预览

零依赖,任一静态服务器即可:

```bash
python -m http.server 8080
# 或
npx serve .
```

然后打开 <http://127.0.0.1:8080/>。

## 技术

- 纯 HTML / CSS / JavaScript,无构建步骤、无前端依赖
- 直接托管于 GitHub Pages;所有页面均为静态资源

## 后续计划

1. 为每个项目补充「详情页」(背景 / 方案 / 复盘)
2. 在首页标注每个项目的技术栈与亮点
3. 补充在线 Demo 链接与作品说明
