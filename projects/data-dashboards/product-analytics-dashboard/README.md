# 产品数据分析

中文优先的可交互前端作品，英文仅作辅助标题。

[在线体验](https://mmiinnggxx.github.io/personal-website/product-analytics-dashboard/)

## 已实现

通过 Supabase Edge Function 调用 GA4 Data API，读取真实活跃用户、会话、事件、关键事件与每日趋势。

## 技术与运行

HTML、CSS、原生 JavaScript。直接打开 index.html，或通过 GitHub Pages 访问。无安装与构建步骤。

## 当前边界

没有 GA4 凭据或未登录时显示空状态，不生成模拟指标。Google 服务账号与 Property ID 仅保存在 Supabase Secrets。

## 验证

在原工作区通过 Playwright 验证 1440px 桌面与 390px 手机布局、核心交互及控制台错误。

[优化说明与验收方法](../docs/UI_OPTIMIZATION_GUIDE.md)
