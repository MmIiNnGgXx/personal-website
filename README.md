# 徐铭杰 · 产品型前端与 AI 应用作品集

> 公开主项目为 **弯路地图 Detour**。仓库中另保留部分历史实验代码，仅作本地复盘，不作为公开展示项目。

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

## 其他公开作品

| 项目 | 说明 | 预览 |
|---|---|---|
| **AI 四子棋** | 单文件、零依赖网页小游戏；Minimax + Alpha-Beta 剪枝 AI，三档难度，含实时局势分析面板 | [打开](projects/games/ai-connect4/) |

## 在线地址

- 作品集：https://mmiinnxx.github.io/personal-website/
- 源码：<https://github.com/MmIiNnGgXx/personal-website>

## 目录结构

```
personal-website/
├── index.html                    # 精选作品集首页(旗舰 Detour + AI 四子棋)
├── README.md
├── assets/
│   └── screenshots/              # 首页用到的预览图
├── docs/                         # 设计沉淀(UI 优化与产品复盘)
├── tools/                        # detour 本地扫描器 CLI
└── projects/
    ├── games/                    # 小游戏 / 交互 Demo
    │   └── ai-connect4/
    └── tools/                    # 弯路地图 Detour(旗舰项目)
        └── detour/
```

## 技术

- 纯 HTML / CSS / JavaScript，无构建步骤、无前端框架
- 前端托管于 GitHub Pages
