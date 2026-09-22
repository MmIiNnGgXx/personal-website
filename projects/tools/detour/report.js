window.DETOUR_REPORT={
  meta:{title:"OfferPilot 与四个后台的弯路",subtitle:"从“功能很多”到“证据优先”的一次真实产品转向",period:"2026-09-02 — 2026-09-22",mode:"public",verified:true,summary:"最终没有继续包装未完成的业务系统，而是停止扩张，重新建立作品集选题与验收规则。"},
  nodes:[
    {id:"research",stage:"探索",title:"从自动求职 Agent 开始",goal:"寻找能自动匹配职位和辅助网申的产品方向",assumption:"热门赛道更容易成为有价值的作品",outcome:"确定 OfferPilot 概念并收集落地页结构",reason:"当时优先考虑市场热度，还没有评估真实数据和公开演示成本。",cost:"方向研究",status:"unverified",approved:true,timestamp:"2026-09-02",evidence:[{label:"需求记录",detail:"先提出职位匹配、网申辅助和进度跟踪三类能力。",kind:"note"}],lesson:"市场热度不能替代个人差异和可演示性。"},
    {id:"landing",stage:"实现",title:"完成 OfferPilot 落地页",goal:"把产品概念做成有完成度的中文产品页面",assumption:"先把产品形态表达清楚，再补真实能力",outcome:"完成响应式落地页和本地简历选择演示",reason:"页面证明了视觉与交互能力，但没有证明职位数据、匹配或网申能力。",cost:"1 个完整落地页",status:"kept",approved:true,timestamp:"2026-09-03",evidence:[{label:"构建结果",detail:"React、Vite 与 Tailwind 页面构建通过；上传只在浏览器本地演示。",kind:"check"}],lesson:"视觉原型可以保留，但必须准确标注能力边界。"},
    {id:"four-products",stage:"实现",title:"扩张为四个业务产品",goal:"用简历诊断、求职管理、数据分析和商品运营丰富作品集",assumption:"项目数量越多，展示的岗位覆盖越广",outcome:"页面完整度提升，但核心数据仍由静态数组与浏览器状态支撑",reason:"同时推进多个大系统，导致每个项目只有界面，没有可信业务闭环。",cost:"4 个产品界面与多轮样式调整",status:"reversed",approved:true,timestamp:"2026-09-16",evidence:[{label:"用户验收",detail:"明确指出“项目就是一个空壳，没有实际功能且后端数据都是捏造的”。",kind:"review"}],lesson:"一个完整旗舰项目胜过多个半成品。"},
    {id:"remove-fakes",stage:"转向",title:"删除虚构数据，改接真实服务",goal:"用 Supabase、DeepSeek、GA4 和 Shopify 替换模拟数据",assumption:"把数据源换成真实 API 就能解决空壳问题",outcome:"数据库、RLS 和三个 Edge Function 完成部署",reason:"技术连接变真实了，但产品同时背上登录、密钥、权限、数据源和费用约束。",cost:"2 套云环境、16 张表、3 个函数",status:"reversed",approved:true,timestamp:"2026-09-20",evidence:[{label:"部署检查",detail:"函数状态显示 ACTIVE，匿名调用返回 401。",kind:"check"},{label:"边界",detail:"ACTIVE 只能证明函数已部署，不能证明真实业务成功。",kind:"warning"}],lesson:"部署状态不是端到端结果。"},
    {id:"test-gap",stage:"验证",title:"测试通过，但没有测真实主流程",goal:"确认四个产品没有明显回归",assumption:"冒烟测试通过即可证明改造有效",outcome:"测试只覆盖空状态、未登录提示和静态交互",reason:"没有真实登录、模型调用、第三方同步和数据库写入，因此“通过”不等于可用。",cost:"一次误导性的通过结论",status:"abandoned",approved:true,timestamp:"2026-09-20",evidence:[{label:"测试范围",detail:"验证了未登录提示和无模拟数据，没有验证 DeepSeek、GA4 或 Shopify 成功响应。",kind:"test"}],lesson:"测试名称和结论必须与真实覆盖范围一致。"},
    {id:"secret",stage:"验证",title:"线上函数缺少真实密钥",goal:"使用 DeepSeek 完成真实简历诊断",assumption:"此前配置步骤已经把密钥写入生产环境",outcome:"线上仅存在模型名，不存在 DEEPSEEK_API_KEY；GA4 与 Shopify 凭据同样缺失",reason:"配置脚本强制一次填写所有服务，只配置单项时无法形成可用闭环。",cost:"功能保持不可用",status:"abandoned",approved:true,timestamp:"2026-09-20",evidence:[{label:"线上只读检查",detail:"Secret 列表存在 DEEPSEEK_MODEL，不存在 DEEPSEEK_API_KEY。",kind:"audit"},{label:"安全事件",detail:"一枚密钥曾被粘贴到聊天中，已按泄露处理，不进入公开数据。",kind:"security"}],lesson:"密钥只通过 Secret 管理；公开后必须立即撤销。"},
    {id:"market",stage:"探索",title:"发现产品价值与成本不匹配",goal:"判断是否值得继续补齐整个 AI 求职系统",assumption:"技术上能继续完成，就值得继续开发",outcome:"确认需要依赖过多外部平台，且与市面求职产品趋同",reason:"即使接通服务，招聘者也难在公开页面直接体验，个人差异仍然不足。",cost:"停止继续投入，保留已有代码",status:"abandoned",approved:true,timestamp:"2026-09-21",evidence:[{label:"产品复盘",detail:"从开发成本、市场同质化、公开演示性和个人辨识度四项重新评估。",kind:"decision"}],lesson:"编码前先验证差异化、数据来源和公开演示路径。"},
    {id:"detour",stage:"转向",title:"把失败过程变成产品",goal:"将散落在会话和提交中的弯路转化为可复用决策资产",assumption:"真实判断过程比虚构业务指标更能体现能力",outcome:"确定本地优先的弯路地图：扫描、复核、证据、规则和静态导出",reason:"它源于真实问题，核心无需账号与第三方服务，并能用自身开发过程验证。",cost:"重新收敛为 1 个旗舰项目",status:"kept",approved:true,timestamp:"2026-09-22",evidence:[{label:"验收标准",detail:"没有 AI Key 时也必须完成扫描、复核、地图和导出。",kind:"acceptance"}],lesson:"让真实经历成为产品数据，而不是再编一个业务背景。"}
  ],
  lessons:[
    {title:"核心体验独立",body:"核心流程不能依赖未配置的第三方服务。",source:"secret"},
    {title:"部署不等于可用",body:"只有真实主流程完成端到端验证，才能宣称已接入。",source:"remove-fakes"},
    {title:"测试结论要诚实",body:"冒烟测试不能包装成真实业务验收。",source:"test-gap"},
    {title:"先验证再扩张",body:"先做成一个完整旗舰项目，再考虑增加作品数量。",source:"four-products"},
    {title:"先看差异化",body:"开发前检查市场相似度、数据来源和公开演示成本。",source:"market"},
    {title:"密钥不进公开记录",body:"密钥只进入服务端 Secret；一旦公开立即撤销。",source:"secret"}
  ]
};
