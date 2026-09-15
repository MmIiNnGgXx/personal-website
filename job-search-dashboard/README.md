# 求职管理工作台

中文优先的可交互前端作品，英文仅作辅助标题。

[在线体验](https://mmiinnggxx.github.io/personal-website/job-search-dashboard/)

## 已实现

- 职位管理：看板与列表切换，搜索公司/岗位/城市，阶段与优先级筛选，排序。
- 职位详情：公司、薪资、城市、渠道、下一步动作、跟进日期和备注。
- 面试记录：新增、编辑复盘、完成/恢复状态和删除。
- 跟进日程：今天、逾期、未来七天与全部待办，完成后同步概览。
- 求职概览：阶段分布、优先跟进、最近动态，指标从本地记录计算。
- 数据管理：旧版数据兼容、JSON 备份、导入校验和同编号去重、存储失败反馈。

## 技术与运行

HTML、CSS、原生 JavaScript。直接打开 index.html，或通过 GitHub Pages 访问。页面运行无安装与构建步骤。

图标来自 [Lucide 0.468.0](https://lucide.dev/)，按需保存在 icons/，无需访问外部 CDN。授权文件见 icons/LICENSE。

index.html 负责页面结构，style.css 负责布局与视觉规范，app.js 负责本地数据、视图与交互。

## 当前边界

数据保存在当前浏览器，没有账号同步和云数据库。日程按设备本地日期展示，不发送系统推送；跨日刷新页面更新“今天”。示例公司为虚构，同编号导入保留当前版本。

## 验证

通过 Playwright 验证 1440px 桌面与 390px 手机布局，以及职位增改删、面试复盘、阶段/列表切换、日程完成、备份导入导出、旧数据迁移和存储失败。浏览器测试不代表已完成跨设备、无障碍或安全审计。

开发验收：npm install，然后 npx playwright install chromium，最后 npm test。

[优化说明与验收方法](../docs/UI_OPTIMIZATION_GUIDE.md)

[从本项目学习产品 UI](../docs/UI_PRODUCT_LESSON.md)
