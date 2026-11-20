/**
 * Public résumé and portfolio — the only copy source for /portfolio and /resume.
 * Facts follow experience-library v2026-10 and knowledge-base §0.
 * Do not add a phone number. `linkedin` stays optional until a real URL exists.
 */

export type Lang = "zh" | "en";

export interface Copy {
  zh: string;
  en: string;
}

export function tx(copy: Copy, lang: Lang): string {
  return copy[lang];
}

export type ProjectCategory = "commerce" | "ai" | "fintech" | "opensource";
export type EmployerId = "root" | "bank" | "personal";

export interface ProjectLink {
  href: string;
  label: Copy;
}

export interface Project {
  id: string;
  employer: EmployerId;
  category: ProjectCategory;
  featured?: boolean;
  title: Copy;
  org: Copy;
  role: Copy;
  period: string;
  domain: Copy;
  summary: Copy;
  metrics: Copy[];
  context: Copy[];
  actions: Copy[];
  impact: Copy[];
  resumeLine: Copy;
  links?: ProjectLink[];
}

export interface SkillGroup {
  id: string;
  title: Copy;
  items: Copy[];
}

const c = (zh: string, en: string): Copy => ({ zh, en });

export const profile = {
  name: c("张寒梅", "Hanmei Zhang"),
  nameEn: "Hanmei Zhang",
  nameZh: "张寒梅",
  aka: "Zoe",
  title: c(
    "软件项目经理 · 用 AI 把交付做成可运行的系统",
    "Software Project Manager · I ship the systems, and I build with AI",
  ),
  kicker: c("5 年 · 零售电商 × 金融科技", "5 years · Commerce × FinTech"),
  email: "zhanghanmei1205@163.com",
  github: "https://github.com/Hathawaymm",
  githubLabel: "github.com/Hathawaymm",
  location: c("深圳", "Shenzhen, China"),
  /** Optional. Leave unset until a real profile URL is available. */
  linkedin: undefined as string | undefined,
  summary: c(
    "5 年软件研发项目管理经验，PMP，重庆邮电大学计算机科学与技术硕士（人工智能与图像处理）。在深圳市路特创新科技有限公司（Momcozy）信息技术中心担任软件项目经理，负责订单、CRM、客服中台与大促交付，并推动 AI 与 RPA 落地；在重庆农村商业银行软件开发部担任项目经理，交付信用卡核心分布式重构、汽车金融、支付收单与强监管对接。按项目组合敏捷与瀑布，把评审、门禁和审计取数做成可重复的机制，也用 AI 编程工具做出自己每天在用的产品。",
    "Software project manager with 5 years of experience, a PMP, and an M.S. in Computer Science from Chongqing University of Posts and Telecommunications (AI and image processing). At Shenzhen Root Innovation Technology Co., Ltd. (Momcozy) I ran order, CRM, service-platform, and peak-season delivery and put AI and RPA into daily operations. At Chongqing Rural Commercial Bank I delivered a distributed credit-card core, auto finance, payment acquiring, and regulated integrations. I mix agile and waterfall to fit the work, turn reviews, quality gates, and audit data pulls into repeatable systems, and use AI coding tools to build products I actually run.",
  ),
};

export const heroMetrics: { value: Copy; label: Copy }[] = [
  { value: c("5 年", "5 yrs"), label: c("项目管理经验", "Project management") },
  { value: c("3–5 分钟", "3–5 min"), label: c("EDI 单笔，原约 20 分钟", "EDI per order, from ~20 min") },
  { value: c("500+", "500+"), label: c("RPA 每月节省小时", "RPA hours saved / month") },
  { value: c("2023", "2023"), label: c("全国金融科技发展奖", "National FinTech Award") },
];

export const ui = {
  portfolio: c("作品集", "Portfolio"),
  resume: c("简历", "Resume"),
  print: c("导出 / 打印 PDF", "Export / Print PDF"),
  langZh: "中文",
  langEn: "EN",
  langSwitch: c("语言", "Language"),
  navProjects: c("项目", "Projects"),
  navGovernance: c("流程与治理", "Governance"),
  navTimeline: c("经历", "Timeline"),
  navCredentials: c("教育与证书", "Credentials"),
  navSkills: c("技能", "Skills"),
  viewResume: c("简洁简历", "Concise résumé"),
  viewPortfolio: c("交互作品集", "Interactive portfolio"),
  filterAll: c("全部", "All"),
  categories: {
    commerce: c("电商与履约", "Commerce & Fulfillment"),
    ai: c("AI 与数字化", "AI & Digital"),
    fintech: c("金融科技与合规", "FinTech & Compliance"),
    opensource: c("个人开源", "Open Source"),
  } satisfies Record<ProjectCategory, Copy>,
  searchLabel: c("搜索项目", "Search projects"),
  searchPlaceholder: c("搜索项目、指标、客户…", "Search projects, metrics, clients…"),
  noResults: c("没有匹配的项目", "No projects match"),
  resultCount: c("个项目", "projects"),
  expand: c("展开案例", "Open case"),
  collapse: c("收起", "Close"),
  expandAll: c("全部展开", "Expand all"),
  collapseAll: c("全部收起", "Collapse all"),
  context: c("背景与挑战", "Context"),
  actions: c("关键举措", "Actions"),
  impact: c("量化成果", "Impact"),
  featured: c("主项目", "Flagship"),
  role: c("角色", "Role"),
  employers: {
    root: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    bank: c("重庆农村商业银行", "Chongqing Rural Commercial Bank"),
    personal: c("个人项目", "Personal work"),
  } satisfies Record<EmployerId, Copy>,
  experienceTitle: c("工作经历", "Experience"),
  projectsTitle: c("项目案例", "Case studies"),
  resumeProjectsTitle: c("代表项目", "Selected work"),
  educationTitle: c("教育", "Education"),
  credentialsTitle: c("证书、专利与荣誉", "Credentials & patents"),
  skillsTitle: c("技能", "Skills"),
  governanceTitle: c("流程体系建设与合规治理", "Delivery governance, process systems & compliance"),
  contactEmail: c("邮箱", "Email"),
  contactGitHub: c("GitHub", "GitHub"),
  contactLocation: c("所在地", "Location"),
  contactLinkedIn: c("LinkedIn", "LinkedIn"),
  skip: c("跳到内容", "Skip to content"),
  publicNote: c("公开页面，无需登录", "Public — no login required"),
  resumeIntro: c(
    "这一页是给招聘方直接打印或导出 PDF 的简洁简历。完整案例、筛选和流程蓝图在作品集。",
    "This page is the concise résumé for print or PDF. Full case studies, filters, and governance blueprints live on the portfolio.",
  ),
};

export const experience: {
  id: EmployerId;
  company: Copy;
  unit: Copy;
  role: Copy;
  period: string;
  summary: Copy;
  highlights: Copy[];
}[] = [
  {
    id: "root",
    company: c(
      "深圳市路特创新科技有限公司（Momcozy）",
      "Shenzhen Root Innovation Technology Co., Ltd. (Momcozy)",
    ),
    unit: c("信息技术中心", "Information Technology Center"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.07 – 2026.05",
    summary: c(
      "统筹 OMS 订单中心、To B CRM、客服中台与中国区 APP，支撑年末大促和多业务线迭代，并把研发交付从口头协同收成评审、门禁和看板。",
      "Owned the OMS order hub, B2B CRM, customer-service platform, and China app, supported the year-end peak, and turned delivery from hallway coordination into reviews, gates, and a live board.",
    ),
    highlights: [
      c(
        "订单履约双线升级：EDI 单笔处理时间由约 20 分钟降至 3–5 分钟；自研 OMS 按店铺和大区分阶段切换，并与库存、仓储、运输等 5+ 下游系统集成。",
        "Two-track fulfillment upgrade: EDI handling per order fell from about 20 minutes to 3–5 minutes; the in-house OMS rolled out by store and region and integrated with 5+ downstream inventory, warehouse, and transport systems.",
      ),
      c(
        "从 0 到 1 建立四层质量门禁与飞书多维表格监控（自动周报、超期预警）。核心版本按期交付率 100%，上线缺陷率 < 5%。",
        "Built a four-stage quality gate and a Feishu Bitable monitor (automated weekly reports, overdue alerts) from scratch. Core releases hit 100% on-time delivery, with a post-release defect rate under 5%.",
      ),
      c(
        "海外 EDI 服务商的唯一接口人，用英语写邮件、开周会。企业级 RPA 月省 500+ 小时。",
        "Sole counterpart to the overseas EDI provider — email and weekly meetings in English. Enterprise RPA saved 500+ hours a month.",
      ),
    ],
  },
  {
    id: "bank",
    company: c("重庆农村商业银行", "Chongqing Rural Commercial Bank"),
    unit: c("软件开发部", "Software Development Department"),
    role: c("项目经理", "Project Manager"),
    period: "2021.07 – 2025.03",
    summary: c(
      "在强监管下交付中后台战略项目，并把代码质量、合作方接入、算法评测和年度外部审计取数做成可复用的规范。",
      "Delivered core and mid-office programs under heavy regulation, and turned code quality, partner onboarding, algorithm evaluation, and the yearly external-audit data pull into reusable standards.",
    ),
    highlights: [
      c(
        "信用卡核心分布式重构获 2023 全国金融科技发展奖三等奖：发卡超 200 万张，新增用信超 100 亿，并发能力提升 3 倍。",
        "Distributed rebuild of the credit-card core won a 2023 National FinTech Development Award (third prize): 2 million+ cards issued, 10 billion+ RMB in new credit outstanding, and 3× concurrency.",
      ),
      c(
        "牵头全行《代码质量管理办法》（自动化扫描 + 两级人工审查），覆盖 100+ 系统。",
        "Led the bank-wide Code Quality Management Measures — automated scanning plus two levels of human review — covering 100+ systems.",
      ),
      c(
        "每年配合外部审计完成跨系统取数、多方复核与合规报告按期报送；住建委资金监管为首批通过验收的合作银行。",
        "Each year, supported external audit with cross-system extracts, multi-party review, and on-time compliance reports. The housing-escrow integration was in the first batch of partner banks to pass acceptance.",
      ),
    ],
  },
];

export const education = {
  school: c("重庆邮电大学", "Chongqing University of Posts and Telecommunications"),
  degree: c("计算机科学与技术 · 硕士", "M.S., Computer Science and Technology"),
  period: "2018.09 – 2021.06",
  detail: c(
    "研究方向：人工智能与图像处理。一等学业奖学金（前 10%）。已授权发明专利 CN113011286B《基于视频的深度神经网络回归模型的斜视判别方法及系统》。",
    "Research: AI and image processing. First-class academic scholarship (top 10%). Granted invention patent CN113011286B, a video-based deep-network method and system for strabismus screening.",
  ),
};

export const credentials: { title: Copy; detail: Copy }[] = [
  {
    title: c("PMP", "PMP"),
    detail: c("PMI 项目管理专业人士，2024.03 取得，2027.03 到期。", "PMI Project Management Professional, granted 2024.03, valid through 2027.03."),
  },
  {
    title: c("CET-6", "CET-6"),
    detail: c("英语可作为工作语言。路特期间独立对接海外 EDI 服务商。", "English as a working language. Sole counterpart to an overseas EDI provider at Root Innovation."),
  },
  {
    title: c("发明专利 CN113011286B", "Invention patent CN113011286B"),
    detail: c("已授权。硕士阶段，人工智能与图像处理。", "Granted. Master’s research in AI and image processing."),
  },
  {
    title: c("发明专利 CN118135636A", "Invention patent CN118135636A"),
    detail: c(
      "已申请并公开，实质审查中（不是已授权）。《一种人脸比对算法的多维评测方法、装置、设备及介质》，申请人重庆农商行。",
      "Filed and published; in substantive examination (not yet granted). A multi-dimensional evaluation method for face-comparison algorithms. Applicant: Chongqing Rural Commercial Bank.",
    ),
  },
  {
    title: c("2023 全国金融科技发展奖", "2023 National FinTech Development Award"),
    detail: c("三等奖。分布式信用卡核心建设及异构数据平滑迁移。", "Third prize. Distributed credit-card core and smooth migration of heterogeneous data."),
  },
];

export const skillGroups: SkillGroup[] = [
  {
    id: "pm",
    title: c("项目管理", "Project management"),
    items: [
      c("端到端交付", "End-to-end delivery"),
      c("多项目并行", "Parallel programs"),
      c("版本切割", "Version cutting"),
      c("敏捷 / 瀑布", "Agile / waterfall"),
      c("OKR 与 MVP", "OKR and MVP"),
      c("风险前置", "Risk upfront"),
      c("干系人管理", "Stakeholder management"),
      c("SOP / 验收模板", "SOP and acceptance templates"),
    ],
  },
  {
    id: "domain",
    title: c("行业与系统", "Domains & systems"),
    items: [
      c("OMS / 订单履约", "OMS / order fulfillment"),
      c("EDI 850 · 855 · 856 · 810", "EDI 850 · 855 · 856 · 810"),
      c("Salesforce CRM / LTC", "Salesforce CRM / lead-to-cash"),
      c("数据治理与主数据", "Data governance and master data"),
      c("核心系统重构", "Core-system rebuild"),
      c("支付收单", "Payment acquiring"),
      c("商品房资金监管", "Pre-sale housing escrow"),
    ],
  },
  {
    id: "ai",
    title: c("AI 与数字化", "AI & digital"),
    items: [
      c("AI Agent 场景立项", "AI-agent business cases"),
      c("VOC 多模型级联", "VOC model cascade"),
      c("Human-in-the-loop", "Human-in-the-loop"),
      c("企业级 RPA", "Enterprise RPA"),
      c("AI 编程工具", "AI coding tools"),
      c("飞书多维表格与工作流", "Feishu Bitable and workflows"),
    ],
  },
  {
    id: "tools",
    title: c("工具", "Tools"),
    items: [
      c("飞书", "Feishu"),
      c("Teambition", "Teambition"),
      c("禅道", "ZenTao"),
      c("XMind", "XMind"),
      c("Visio", "Visio"),
      c("Excel", "Excel"),
      c("Git", "Git"),
      c("VS Code", "VS Code"),
      c("Python", "Python"),
      c("MySQL", "MySQL"),
      c("JMeter", "JMeter"),
    ],
  },
];

export const projects: Project[] = [
  {
    id: "oms",
    employer: "root",
    category: "commerce",
    featured: true,
    title: c("OMS 自研重构与 EDI 中台及数据治理", "In-house OMS, EDI hub, and data governance"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.07 – 2026.05",
    domain: c("订单履约 · 三线合一", "Order fulfillment · one program"),
    summary: c(
      "把 B 端 EDI 中台、C 端自研 OMS 替换和订单主数据治理放在同一个项目里交付，不拆成三张无关的简历。",
      "One program, three tracks: a B2B EDI hub, a C-end OMS replacing the third-party ERP, and order master-data governance.",
    ),
    metrics: [
      c("单笔约 20 分钟 → 3–5 分钟", "About 20 min → 3–5 min per order"),
      c("Walmart · Target · McKesson", "Walmart · Target · McKesson"),
      c("报文 850 / 855 / 856 / 810", "Messages 850 / 855 / 856 / 810"),
      c("5+ 下游系统", "5+ downstream systems"),
    ],
    context: [
      c(
        "KA 客户订单靠人工在门户处理再录入 ERP，容易错过零售商的到货窗口。C 端履约长期依赖第三方 ERP，规则改不动、切换没有退路。",
        "Key-account orders were keyed by hand from a portal into the ERP, and late files missed retailer delivery windows. C-end fulfillment sat on a third-party ERP whose rules were rigid and whose cutover had no way back.",
      ),
      c(
        "SKU、国家、渠道和店铺主数据在多个系统里各有一套说法，订单对不上时只能人工对账。",
        "SKU, country, channel, and store master data meant different things in each system, so breaks in the order chain were reconciled by hand.",
      ),
    ],
    actions: [
      c(
        "主导 EDI 服务商调研、选型与商务谈判。架构按「底座先行、客户适配」推进，报文覆盖 850 / 855 / 856 / 810。",
        "Led EDI provider research, selection, and commercial negotiation. Architecture was platform-first, then customer-specific, covering 850 / 855 / 856 / 810.",
      ),
      c(
        "担任与海外服务商的唯一接口人，英文邮件加周例会。Walmart 报文最严、进度延后两周时，先交付 McKesson 与 Target，临时增加一名开发，并把 860 变更单延后。",
        "Sole counterpart to the overseas provider: English email and a weekly meeting. When Walmart’s stricter messages slipped by two weeks, McKesson and Target shipped first, one developer was added, and the 860 change document was deferred.",
      ),
      c(
        "推动自研 OMS 承接 C 端履约：创建、审核、拆单、分仓、预占、出库、完成。拆单 / 合单、仓库、赠品、黑名单等规则改为可配置。",
        "Moved C-end fulfillment onto an in-house OMS: create, review, split, allocate, reserve, ship, complete. Split/merge, warehouse, gift, and blocklist rules became configuration.",
      ),
      c(
        "按店铺和大区分阶段切换，并准备回滚预案；打通库存中心、仓储、运输等 5+ 下游系统。同步统一 SKU 与商品主数据，建立映射规范、接口规范和订单一致性看板。",
        "Cut over by store and region with a rollback plan, and integrated 5+ downstream systems including inventory, warehouse, and transport. Unified SKU and product master data, with mapping rules, interface specs, and an order-consistency board.",
      ),
    ],
    impact: [
      c("单笔订单处理时间：改造前约 20 分钟，改造后 3–5 分钟。", "Per-order handling: about 20 minutes before, 3–5 minutes after."),
      c("Walmart、Target、McKesson 三家 KA 客户完成对接上线。", "Walmart, Target, and McKesson went live on the EDI path."),
      c("人工录单改为报文自动解析与状态回传；主数据有了单一来源和可核对的一致性看板。", "Manual keying gave way to automated message parsing and status return; master data has one source and a consistency board that can be checked."),
    ],
    resumeLine: c(
      "三线合一交付 EDI 中台、自研 OMS 与订单主数据治理。单笔处理时间约 20 分钟 → 3–5 分钟；上线 Walmart、Target、McKesson；集成 5+ 下游系统。",
      "One program for the EDI hub, in-house OMS, and order master data. Handling time about 20 minutes → 3–5 minutes; Walmart, Target, and McKesson live; 5+ downstream systems integrated.",
    ),
  },
  {
    id: "crm",
    employer: "root",
    category: "commerce",
    title: c("To B CRM 从 0 到 1", "B2B CRM from zero to one"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.08 – 2026.01",
    domain: c("Salesforce · LTC", "Salesforce · lead-to-cash"),
    summary: c(
      "基于 Salesforce 做线下业务 CRM，贯通线索到回款。上线窗口收紧时用 P0 / P1 / P2 把范围切开，12 月底完成试运行。",
      "A Salesforce CRM for offline sales, lead to cash. When the launch window tightened, P0 / P1 / P2 cut the scope, and trial operation started at the end of December.",
    ),
    metrics: [
      c("15+ 主架构 · 50+ 模块", "15+ domains · 50+ modules"),
      c("82 项问题追踪", "82 issues tracked"),
      c("100+ 文档与手册", "100+ docs and manuals"),
      c("2025.12 上线试运行", "Trial go-live, Dec 2025"),
    ],
    context: [
      c(
        "线下客户、报价和订单靠表格和即时通讯审批，线索到回款没有一条系统。",
        "Offline accounts, quotes, and orders lived in spreadsheets and chat approvals. There was no lead-to-cash system.",
      ),
      c(
        "测试验收阶段问题堆积，上线窗口只剩几周，业务方仍坚持 11 月上线。",
        "By acceptance testing the defect pile was high, only a few weeks remained, and the business still wanted a November launch.",
      ),
    ],
    actions: [
      c(
        "统筹跨部门规则与交付：信息技术、财经、供应链、营运、法务。每日专项会把问题责任到人。",
        "Ran cross-functional rules and delivery across IT, finance, supply chain, operations, and legal. A daily working session assigned every issue to an owner.",
      ),
      c(
        "建立 P0 / P1 / P2 三级分级。业务坚持 11 月上线时，用版本切割达成共识：P0 与 P1 先行，P2 放到 12 月。",
        "Introduced P0 / P1 / P2 severity. When the business held the November date, a version cut was the agreement: P0 and P1 first, P2 in December.",
      ),
      c(
        "组织数据初始化、周边集成、培训和操作手册，把上线从「系统可用」推到「业务会用」。",
        "Drove data initialization, surrounding integrations, training, and operating manuals so go-live meant the business could actually use it.",
      ),
    ],
    impact: [
      c("15+ 主架构、50+ 功能模块，贯通 LTC（线索到回款）。", "15+ architecture domains and 50+ modules, covering lead-to-cash."),
      c("100+ 调研文档、设计报告与操作手册。解决 7 项关键业务难题。", "100+ research notes, design reports, and manuals. Seven critical business problems resolved."),
      c(
        "登记并分级追踪 82 项验收问题：67 项已处理，9 项处理中，6 项列为上线后优化。2025 年 12 月底上线试运行。",
        "82 acceptance issues logged and ranked: 67 resolved, 9 in progress, 6 deferred to post-launch improvement. Trial operation at the end of December 2025.",
      ),
    ],
    resumeLine: c(
      "Salesforce To B CRM，15+ 主架构、50+ 模块，LTC 全链路。82 项问题分级追踪（67 已处理 / 9 处理中 / 6 上线后优化），12 月底试运行。",
      "Salesforce B2B CRM, 15+ domains, 50+ modules, full lead-to-cash. 82 issues ranked (67 resolved / 9 in progress / 6 post-launch). Trial run at end of December.",
    ),
  },
  {
    id: "service-hub",
    employer: "root",
    category: "commerce",
    title: c("客服中台产品化建设", "Customer-service platform, productized"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("全球客服项目经理", "Global customer-service project manager"),
    period: "2025.07 – 2025.12",
    domain: c("客服工单 · 帮助中心", "Tickets · help center"),
    summary: c(
      "把散落在店铺后台和工单工具里的售后动作收成以 ERP 为唯一入口的产品能力，而不是再叠一个插件。",
      "Pulled after-sales work out of store admin and ticket tools into product capabilities with the ERP as the only ticket entry — not another plugin on the side.",
    ),
    metrics: [
      c("ERP 唯一工单入口", "ERP as the only ticket entry"),
      c("帮助中心 V1.0", "Help Center V1.0"),
      c("退款校验与重复拦截", "Refund checks and duplicate blocks"),
    ],
    context: [
      c(
        "客服在店铺后台、ERP 和工单工具之间来回切换，售前、售中、售后各看各的数据。",
        "Agents switched among store admin, the ERP, and ticket tools. Pre-sale, in-sale, and after-sales each saw a different picture.",
      ),
      c(
        "接手时浏览器侧插件已经存在。我的工作是后续产品化迭代，不是宣称从零做了一个插件。",
        "A browser-side plugin already existed when I joined. My work was the productized follow-on, not a claim that the plugin was built from zero.",
      ),
    ],
    actions: [
      c("以 ERP 作为唯一客服工单入口，减少跨系统复制粘贴。", "Made the ERP the only customer-service ticket entry, cutting cross-system copy-paste."),
      c(
        "交付退款路径优化：可退金额校验、重复退款拦截；分类信息自动带入补发原因；物流单号生成追踪链接。",
        "Shipped refund-path improvements: refundable-amount checks and duplicate-refund blocks; classification carried into reship reasons; tracking links from shipment numbers.",
      ),
      c("帮助中心按四期规划推进，V1.0 于 12 月上线；AI 标签回写进入已上线范围。", "Help Center followed a four-phase plan; V1.0 launched in December. AI tag write-back shipped."),
    ],
    impact: [
      c("售后操作从多系统跳转收拢到 ERP 工单入口。", "After-sales work moved from multi-system hopping to the ERP ticket entry."),
      c("可退金额校验和重复退款拦截做进流程，降低重复退款带来的资金风险。", "Refundable-amount checks and duplicate blocks sit in the flow, reducing the cash risk of paying twice."),
      c("帮助中心 V1.0 上线，标签回写让客服侧分类能回到业务系统。", "Help Center V1.0 is live, and tag write-back returns service classifications to the business system."),
    ],
    resumeLine: c(
      "客服中台产品化：ERP 作为唯一工单入口，退款校验与重复拦截、分类自动带入、物流追踪；帮助中心 V1.0 于 12 月上线。",
      "Productized the service platform: ERP as the only ticket entry, refund checks and duplicate blocks, classification autofill, shipment tracking; Help Center V1.0 in December.",
    ),
  },
  {
    id: "cn-app",
    employer: "root",
    category: "commerce",
    title: c("中国区 APP 从 0 到 1 上线", "China app, zero to launch"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.07 – 2025.10",
    domain: c("智能硬件 · iOS / Android", "Connected hardware · iOS / Android"),
    summary: c(
      "中国区独立 APP：注册登录、设备绑定、远程控制和数据看板。上架前先处理跨境数据是否迁回国内，9 月提前完成六大安卓市场和 App Store。",
      "The China app: sign-in, device binding, remote control, and a data dashboard. Before launch I forced the decision on moving China-user device data back onshore. In September it reached six Android stores and the App Store ahead of the milestone.",
    ),
    metrics: [
      c("6 大安卓市场 + App Store", "6 Android stores + App Store"),
      c("9 月提前达成里程碑", "September, ahead of the milestone"),
      c("iOS · Android", "iOS · Android"),
    ],
    context: [
      c("中国区用户没有独立 APP。测试验收已完成，但境外数据中心上的中国用户设备数据是否迁回国内没有决定，原定上线日有合规风险。", "China users had no standalone app. Test acceptance was done, but whether their device data should leave the overseas data center was undecided, and the planned launch date carried a compliance risk."),
      c("国内设备绑定要求手机号实名，仅邮箱登录不满足合规要求。", "Domestic device binding required a real-name mobile number. Email-only sign-in was not compliant."),
    ],
    actions: [
      c("暂停生产发布，先推进上架审核与整改，避免带着未决的数据驻留问题上线。", "Paused the production release and pushed store review and remediation first, rather than launching with data residency unresolved."),
      c("拉通 AIOT、品牌、法务和合规，把「我感觉可以」拆成各方事实后再做迁回决策。", "Brought AIOT, brand, legal, and compliance to the same table so the move-back decision rested on each party’s facts, not a hunch."),
      c("执行期邮件打开率不到 40%。改为短信、APP 公告和客服话术并行，并分批迁移，而不是一次切完全部老用户。", "During execution, email open rate was under 40%. SMS, in-app notices, and agent scripts ran together, and migration was batched instead of cutting every existing user at once."),
    ],
    impact: [
      c("9 月上架国内 6 大安卓应用市场和 App Store，提前完成里程碑。", "Listed on six major domestic Android stores and the App Store in September, ahead of the milestone."),
      c("上线后成为中国区用户的核心入口，承接后续运营触达。", "After launch it became the main China entry point for later operating campaigns."),
    ],
    resumeLine: c(
      "中国区智能硬件 APP（iOS / Android）从 0 到 1。先决断数据迁回再发布；9 月上架 6 大安卓市场与 App Store，提前完成里程碑。",
      "China connected-hardware app (iOS / Android) from zero. Data-residency decision before release; six Android stores and the App Store in September, ahead of the milestone.",
    ),
  },
  {
    id: "peak",
    employer: "root",
    category: "commerce",
    title: c("Momcozy 年末大促季全链路交付", "Momcozy year-end peak, end to end"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.09 – 2026.01",
    domain: c("黑五 · 圣诞 · 新年", "Black Friday · Christmas · New Year"),
    summary: c(
      "黑五、圣诞、新年前后衔接。我负责里程碑、版本切割、黑五按期上线和值班 / 扩容机制；圣诞在完成规划与一期技术评审后按安排交接。",
      "Black Friday, Christmas, and New Year overlapped. I owned milestones, version cuts, the Black Friday release, and the on-call / scale-up mechanism. Christmas was handed over after planning and the first technical review, as arranged.",
    ),
    metrics: [
      c("11.06 版本 12 项准时上线", "Nov 6 release: 12 items on time"),
      c("24 小时值班与扩容降级预案", "24-hour on-call, scale and degrade plans"),
      c("后端 16.5 + 前端 15 + 测试 10 人天", "16.5 BE + 15 FE + 10 QA person-days"),
    ],
    context: [
      c("三大节点前后衔接，预热和返场重叠，独立站、APP 和 Web 同时改。", "Three peaks overlapped, including warm-up and return traffic, with the storefront, app, and web changing together."),
      c("商品未定会直接把 UI 和排期往后推。紧急营销自动化需求如果硬塞进已冻结的版本，会打穿黑五。", "Undecided products push UI and the schedule. An urgent marketing-automation request, forced into a frozen release, would have broken Black Friday."),
    ],
    actions: [
      c("做全链路里程碑：需求评审、版本拆分、设计评审、技术排期、测试验证、上线节点，并安排跨节点复用人力。", "Built the milestone chain: requirements review, version split, design review, engineering schedule, test, launch — and reused people across peaks."),
      c("黑五 11 月 6 日版本 12 项需求准时上线，2 项遗留在 11 月 11 日修复。营销自动化紧急需求按变更标准改到 11 月 11 日并列为最高优先级。", "The November 6 Black Friday release shipped 12 items on time; 2 leftovers were fixed on November 11. The urgent marketing-automation request moved to November 11 at top priority, under the change rule."),
      c("建立大促 24 小时值班、扩容与降级预案。圣诞活动完成里程碑规划（12.2 预热 / 12.4 转盘 / 12.12 倒计时 / 12.26 新年）和一期技术评审（后端 16.5、前端 15、测试 10 人天），识别「商品未定 → UI 延迟」并推动 11 月 17 日前关闭，随后按安排交接。", "Set up 24-hour peak on-call plus scale-up and degrade plans. Christmas had a milestone plan (Dec 2 warm-up / Dec 4 wheel / Dec 12 countdown / Dec 26 New Year) and a first technical review (16.5 backend, 15 frontend, 10 QA person-days). The “product not final → UI slips” risk was pushed to close before November 17, then handed over as arranged."),
    ],
    impact: [
      c("11 月 6 日版本 12 项需求准时上线，无超期未处理事项。", "November 6 shipped 12 requirements on time, with nothing left overdue."),
      c("变更有标准：冻结版本不硬塞紧急需求，改期后的优先级写清楚。", "Changes had a rule: a frozen release does not absorb an urgent request, and the deferred item’s priority is explicit."),
      c("值班、扩容和降级预案在大促前就位，而不是当天现编。", "On-call, scale-up, and degrade plans were in place before the peak, not written on the day."),
    ],
    resumeLine: c(
      "年末大促（2025.09–2026.01）：黑五 12 项需求准时上线；建立 24 小时值班与扩容降级预案；圣诞完成规划与技术评审（16.5 + 15 + 10 人天）后按安排交接。",
      "Year-end peak (2025.09–2026.01): 12 Black Friday items on time; 24-hour on-call plus scale and degrade plans; Christmas planned and technically reviewed (16.5 + 15 + 10 person-days), then handed over as arranged.",
    ),
  },
  {
    id: "ai-insight",
    employer: "root",
    category: "ai",
    title: c("AI 新品机会洞察工具", "AI new-product opportunity tool"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.07 – 2026.01",
    domain: c("AI Agent · 新品方法论", "AI agents · product method"),
    summary: c(
      "把新品调研从个人经验收成一套工具：15 个 Agent、六大模块。V1.0 的效率区间是提升 30%–50%，并沉淀成公司统一的新品分析方法。",
      "Turned new-product research from personal experience into a tool: 15 agents, six modules. V1.0’s efficiency band was a 30–50% gain, written down as the company’s shared method.",
    ),
    metrics: [
      c("15 个 Agent · 6 大模块", "15 agents · 6 modules"),
      c("V1.0 效率 +30%–50%", "V1.0 efficiency +30–50%"),
      c("2025.09.11 MVP", "MVP on 2025.09.11"),
    ],
    context: [
      c("产品中心靠人工调研，趋势滞后，竞品看不全，隐性需求难以量化。", "Product teams researched by hand. Trends arrived late, competitor coverage was patchy, and latent demand was hard to quantify."),
    ],
    actions: [
      c("推动立项，拉通产品、研发、数据和外部供应商，写清范围、边界和节点。路线图：2025.09.11 MVP，10 月底 1.0，11 月正式使用。", "Drove the case for the project with product, engineering, data, and the vendor, and wrote scope, boundaries, and dates. Roadmap: MVP on 2025.09.11, 1.0 at the end of October, regular use in November."),
      c("覆盖六个模块：市场机会、竞品、VOC、用户、产品定位、营销策略。规划 15 个 Agent。", "Six modules: market opportunity, competitors, VOC, users, positioning, and marketing strategy. Fifteen agents planned."),
      c("制定使用规范并组织培训，让业务从「问问有经验的人」转到「先跑工具，再判断」。", "Wrote the usage standard and ran training so teams moved from “ask the experienced person” to “run the tool, then judge.”"),
    ],
    impact: [
      c("V1.0 新品分析效率提升 30%–50%（文档中的区间，不单写成 50%）。", "V1.0 new-product analysis efficiency improved 30–50% — the documented range, not a single 50% figure."),
      c("工具进入日常使用，为原创产品立项提供决策输入，并留下公司级新品分析方法。", "The tool entered daily use, fed original-product decisions, and left a company-level method for new-product analysis."),
    ],
    resumeLine: c(
      "AI 新品洞察：15 个 Agent、六大模块，2025.09.11 MVP。V1.0 新品分析效率 +30%–50%，并沉淀统一分析方法。",
      "AI new-product insight: 15 agents, six modules, MVP on 2025.09.11. V1.0 analysis efficiency +30–50%, plus a shared method.",
    ),
  },
  {
    id: "voc",
    employer: "root",
    category: "ai",
    title: c("全渠道 VOC 洞察平台", "Omnichannel VOC insight platform"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.12 – 2026.04",
    domain: c("NLP · 人机协同", "NLP · human in the loop"),
    summary: c(
      "把评论、工单和社媒里的非结构化声音收成可检索的产品洞察：五层架构、多模型级联、人工核对后再反哺规则。",
      "Turned reviews, tickets, and social posts into searchable product insight: five layers, a model cascade, and human review that writes rules back.",
    ),
    metrics: [
      c("五层架构", "Five-layer architecture"),
      c("多模型级联", "Cascaded models"),
      c("Human-in-the-loop", "Human-in-the-loop"),
      c("1–4 级标签", "Tags, levels 1–4"),
    ],
    context: [
      c("用户声音散落在独立站、亚马逊、TikTok、社媒和客服沟通里。人工读完再分类，洞察永远晚一拍。", "Voice of customer was scattered across the storefront, Amazon, TikTok, social, and service conversations. Reading and tagging by hand meant insight always arrived late."),
    ],
    actions: [
      c("搭建全渠道采集，用 NLP 做清洗、自动打标和情感分析。", "Built omnichannel collection, with NLP for cleaning, auto-tagging, and sentiment."),
      c("五层架构：数据来源 → 数据资产 → 智能能力 → 业务应用 → 管理协同。多模型按品类、部件、问题分类逐级标注。", "Five layers: sources → data assets → intelligence → business use → management. Models cascade from category to component to issue type."),
      c("Human-in-the-loop：AI 打标 → 人工核对 → 规则反哺。标签做到 1–4 级。我直接落地的部分包括分类与部件映射，以及评论 / 退货看板。", "Human-in-the-loop: AI tags, a person checks, rules feed back. Tags run four levels deep. The pieces I landed directly include classification-to-component mapping and the review / returns board."),
    ],
    impact: [
      c("非结构化声音变成可筛选的标签和情感，产品与客服能定位同一类问题。", "Unstructured voice became filterable tags and sentiment, so product and service could point at the same issue."),
      c("人工核对留在闭环里，模型输出可以追溯、可以改，而不是一次性黑盒。", "Human review stays in the loop, so model output can be traced and corrected instead of treated as a one-shot black box."),
    ],
    resumeLine: c(
      "全渠道 VOC：五层架构，多模型级联打标，Human-in-the-loop（AI 打标 → 人工核对 → 规则反哺），1–4 级标签。",
      "Omnichannel VOC: five layers, cascaded tagging, human-in-the-loop (AI tag → human check → rule feedback), tags at levels 1–4.",
    ),
  },
  {
    id: "rpa",
    employer: "root",
    category: "ai",
    title: c("企业级 RPA 选型与内部数字化赋能", "Enterprise RPA selection and internal enablement"),
    org: c("路特创新 / Momcozy", "Root Innovation / Momcozy"),
    role: c("软件项目经理", "Software Project Manager"),
    period: "2025.07 – 2025.10",
    domain: c("RPA · SOP", "RPA · SOP"),
    summary: c(
      "多厂商评估后引入企业级 RPA，用《RPA 需求 SOP》和公司级培训把零散提需收成可排期的自动化，合计月省 500+ 小时。",
      "After a multi-vendor evaluation I brought in an enterprise RPA platform. A demand SOP and company training turned ad-hoc requests into scheduled automation, saving 500+ hours a month.",
    ),
    metrics: [
      c("月省 500+ 小时", "500+ hours saved / month"),
      c("《RPA 需求 SOP》", "RPA demand SOP"),
      c("公司级培训", "Company-wide training"),
    ],
    context: [
      c("运营、客服、财务有大量跨系统的重复操作，人力耗在复制粘贴上。", "Operations, service, and finance spent people on repetitive cross-system work — mostly copy and paste."),
    ],
    actions: [
      c("7 月完成供应商调研，从产品能力、报价和实施周期评估并选定企业级 RPA 平台，驻场实施随后进场。", "Finished vendor research in July and selected an enterprise RPA platform on capability, price, and implementation time. On-site delivery followed."),
      c("输出《RPA 需求 SOP》，组织公司级培训，让业务自己识别可自动化场景，而不是每个想法都直接找研发。", "Wrote the RPA Demand SOP and ran company training so business teams could spot automatable work instead of sending every idea straight to engineering."),
      c("落地的场景包括跨平台取数、财务报表、运营看板等。被问到明细时：总结里的分项只是代表性场景，全部场景合计月省 500+ 小时。", "Shipped scenarios include cross-platform data pulls, finance reports, and operating dashboards. If asked for the breakdown: the written line items are samples; all scenarios together save 500+ hours a month."),
    ],
    impact: [
      c("每月节省人力 500+ 小时。", "500+ hours of labor saved each month."),
      c("从「谁有空谁做一遍」变成有受理标准和可复用场景的自助自动化。", "Work moved from “whoever is free does it again” to self-serve automation with an intake standard and reusable scenarios."),
    ],
    resumeLine: c(
      "企业级 RPA 选型与推广，发布《RPA 需求 SOP》并完成公司级培训。全部场景合计月省 500+ 小时。",
      "Selected and rolled out enterprise RPA, published the RPA Demand SOP, and trained the company. All scenarios together save 500+ hours a month.",
    ),
  },
  {
    id: "core-banking",
    employer: "bank",
    category: "fintech",
    title: c("信用卡核心业务系统分布式重构", "Distributed rebuild of the credit-card core"),
    org: c("重庆农村商业银行", "Chongqing Rural Commercial Bank"),
    role: c("项目经理", "Project Manager"),
    period: "2023.01 – 2023.11",
    domain: c("核心系统 · 数据迁移", "Core system · data migration"),
    summary: c(
      "信用卡核心从集中式架构迁到分布式，覆盖全生命周期业务和不停机迁移。项目获得 2023 全国金融科技发展奖三等奖。",
      "Moved the credit-card core from a centralized architecture to a distributed one, including the full card lifecycle and a migration without a customer-facing outage. Third prize, 2023 National FinTech Development Award.",
    ),
    metrics: [
      c("发卡超 200 万张", "2 million+ cards issued"),
      c("新增用信超 100 亿", "10 billion+ RMB new credit"),
      c("并发能力 ×3", "3× concurrency"),
      c("2023 金融科技发展奖三等奖", "2023 FinTech Award, 3rd prize"),
    ],
    context: [
      c("集中式信用卡核心在高并发和业务扩展上到了瓶颈。迁移必须零中断，而且要经得起对账。", "The centralized credit-card core had hit its limit on concurrency and new products. Migration had to be invisible to customers and reconcilable afterwards."),
    ],
    actions: [
      c("按方案、开发与集成、UAT 与迁移演练、灰度到全量四段推进，严控开发、UAT 和灰度投产节点。", "Ran four stages — solution, build and integration, UAT and migration rehearsals, then canary to full — with hard gates on build, UAT, and production canary."),
      c("协调超 10 个跨职能团队（开发、测试、业务、外部供应商）。关键问题平均 48 小时内闭环。", "Coordinated 10+ cross-functional teams (engineering, test, business, vendors). Critical issues closed in 48 hours on average."),
      c("三轮迁移演练：第一轮跑通但超时，卡住不进第二轮；后续把停机窗口压进可接受范围。切换当天作战室、逐步签字和对账脚本一起用。", "Three migration rehearsals: the first finished the path but missed the window, so it did not proceed; later rounds brought the outage inside the acceptable window. Cutover day used a war room, stepwise sign-off, and reconciliation scripts."),
    ],
    impact: [
      c("全业务功能投产，数据迁移对客户无感。发卡超 200 万张，新增用信超 100 亿，并发能力提升 3 倍。", "Full card lifecycle in production and a migration customers did not feel. 2 million+ cards issued, 10 billion+ RMB in new credit outstanding, 3× concurrency."),
      c("获 2023 全国金融科技发展奖三等奖（分布式信用卡核心及异构数据平滑迁移）。", "Third prize, 2023 National FinTech Development Award, for the distributed credit-card core and smooth heterogeneous-data migration."),
    ],
    resumeLine: c(
      "信用卡核心分布式重构（2023.01–2023.11），获 2023 全国金融科技发展奖三等奖。发卡超 200 万张，新增用信超 100 亿，并发 ×3。",
      "Distributed credit-card core (2023.01–2023.11), third prize in the 2023 National FinTech Development Award. 2 million+ cards, 10 billion+ RMB new credit, 3× concurrency.",
    ),
  },
  {
    id: "xiaomi",
    employer: "bank",
    category: "fintech",
    title: c("小米汽车金融服务平台", "Xiaomi Auto financial-services platform"),
    org: c("重庆农村商业银行", "Chongqing Rural Commercial Bank"),
    role: c("项目经理", "Project Manager"),
    period: "2023.12 – 2024.04",
    domain: c("汽车金融 · 0 到 1", "Auto finance · zero to one"),
    summary: c(
      "银行第一个汽车零售金融项目，与小米汽车一起做分期购车和租赁的全流程数字化。用 OKR 和 MVP 把开发周期缩短 25%。",
      "The bank’s first auto-retail finance program, with Xiaomi Auto: a digital path for installment purchase and leasing. OKRs and an MVP cut the build cycle by 25%.",
    ),
    metrics: [
      c("开发周期 −25%", "Build cycle −25%"),
      c("累计交易额超 1.25 亿", "1.25 亿+ RMB transacted"),
      c("业务效率 +50%", "Operating efficiency +50%"),
    ],
    context: [
      c("没有现成的汽车金融平台。行内、车企和外部合作方对「第一期必须有什么」并不一致。", "There was no auto-finance platform. The bank, the automaker, and outside partners did not agree on what release one had to contain."),
    ],
    actions: [
      c("主持跨部门、跨组织研讨，用 OKR 把核心流程从愿望清单里拣出来。", "Ran cross-team, cross-organization workshops and used OKRs to pull the core flow out of the wish list."),
      c("整合行内、小米汽车和外部合作方；看板上只留 MVP，避免第一期做成全量产品。", "Aligned the bank, Xiaomi Auto, and external partners. The board held only the MVP, so release one did not become the full product."),
    ],
    impact: [
      c("开发周期缩短 25%。上线后累计交易额超 1.25 亿，业务效率提升 50% 以上。", "Build cycle shortened by 25%. After launch, cumulative volume exceeded RMB 125 million, and operating efficiency rose by more than 50%."),
    ],
    resumeLine: c(
      "小米汽车金融服务平台（0→1，2023.12–2024.04）。开发周期 −25%，累计交易额超 1.25 亿，业务效率 +50%。",
      "Xiaomi Auto financial services (0→1, 2023.12–2024.04). Build cycle −25%, RMB 125 million+ transacted, operating efficiency +50%.",
    ),
  },
  {
    id: "acquiring",
    employer: "bank",
    category: "fintech",
    title: c("多行业合作方标准化接入支付收单系统", "Standardized multi-industry payment acquiring"),
    org: c("重庆农村商业银行", "Chongqing Rural Commercial Bank"),
    role: c("项目经理", "Project Manager"),
    period: "2023.08 – 2023.11",
    domain: c("支付收单 · 商户接入", "Acquiring · merchant onboarding"),
    summary: c(
      "为商超、学校、医院、公安系统等行业做可复用的合作方接入：预评估清单、风险评估和商户画像，而不是每来一家都重新谈一遍接口。",
      "A reusable onboarding path for supermarkets, schools, hospitals, public security systems, and similar partners: a pre-assessment checklist, a risk review, and a merchant profile — not a fresh interface negotiation every time.",
    ),
    metrics: [
      c("前置风险识别率 +50%", "Upfront risk detection +50%"),
      c("收单年规模 +15%", "Annual acquiring volume +15%"),
      c("对接周期 −70%", "Onboarding cycle −70%"),
    ],
    context: [
      c("收单场景铺开后，每家合作方的系统、支付方式和故障史都不一样，接入周期被个案拖长。", "As acquiring spread, every partner brought a different system, payment method, and failure history, and each case stretched the onboarding cycle."),
    ],
    actions: [
      c("设计并推行《合作方接入预评估清单》和风险评估流程。", "Designed and rolled out the Partner Onboarding Pre-assessment Checklist and the risk-review process."),
      c("建立商户画像库：系统适配性、对接耗时、故障历史，用来决定接入策略和人力。", "Built a merchant-profile library: system fit, integration time, and failure history, used to set the onboarding plan and staffing."),
      c("按行业处理差异：收单与结算的个性化需求，刷卡 / 主扫 / 被扫，以及银联、微信、支付宝。", "Handled industry differences: custom acquiring and settlement needs, card / merchant-scan / customer-scan, and UnionPay, WeChat Pay, and Alipay."),
    ],
    impact: [
      c("前置风险识别率提升 50%。收单业务年规模增长 15%。单场景对接周期缩短 70%。", "Upfront risk detection +50%. Annual acquiring volume +15%. Per-scenario onboarding cycle −70%."),
      c("留下的是可复用的接入能力，而不是某一家商户的项目纪要。", "What remained is a reusable onboarding capability, not one merchant’s project notes."),
    ],
    resumeLine: c(
      "支付收单标准化接入（商超、学校、医院、公安系统等，2023.08–2023.11）。风险识别 +50%，年规模 +15%，对接周期 −70%。",
      "Standardized acquiring onboarding (supermarkets, schools, hospitals, public security, and others; 2023.08–2023.11). Risk detection +50%, annual volume +15%, cycle −70%.",
    ),
  },
  {
    id: "housing",
    employer: "bank",
    category: "fintech",
    title: c("市住建委资金监管系统对接", "Municipal housing-escrow system integration"),
    org: c("重庆农村商业银行", "Chongqing Rural Commercial Bank"),
    role: c("项目经理", "Project Manager"),
    period: "2024.08 – 2024.12",
    domain: c("商品房交易资金封闭监管", "Pre-sale housing fund escrow"),
    summary: c(
      "对接市住建委监管系统，实现商品房交易资金封闭监管。接口月均变更 10 次以上，仍按期成为首批通过验收的合作银行。",
      "Integrated with the municipal housing commission’s supervision system for escrow of pre-sale housing funds. Interfaces changed 10+ times a month, and the bank still passed in the first acceptance batch.",
    ),
    metrics: [
      c("关键问题响应时效 +60%", "Critical-issue response +60%"),
      c("接口月均变更 10+ 次", "10+ interface changes / month"),
      c("3 名备用开发 + 2 名测试", "Pool of 3 developers + 2 testers"),
      c("首批通过验收", "First acceptance batch"),
    ],
    context: [
      c("商品房预售资金必须封闭监管。政策文本和接口在验收前仍频繁变化，异常划转等高风险场景不能留白。", "Pre-sale housing funds had to sit in escrow. Policy text and interfaces kept changing up to acceptance, and high-risk cases such as abnormal transfers could not be left unspecified."),
    ],
    actions: [
      c("解读住建委政策文件，把异常划转等高风险交易的规则写成可开发的逻辑。", "Read the commission’s policy papers and turned high-risk flows, including abnormal transfers, into logic engineering could build."),
      c("搭建监管变更同步表和分级沟通机制，让变更的收集、分发和确认有固定入口。", "Set up a regulatory-change log and a tiered communication path so changes were collected, routed, and confirmed in one place."),
      c("预判规则还会变，提前留出弹性资源池：3 名备用开发、2 名测试。", "Assumed the rules would keep moving and held an elastic pool: 3 reserve developers and 2 testers."),
    ],
    impact: [
      c("关键问题响应时效提升 60%。在月均 10+ 次接口变更下按期通过验收，成为首批通过验收的合作银行。", "Critical-issue response improved 60%. Acceptance was on time despite 10+ interface changes a month, in the first batch of partner banks to pass."),
    ],
    resumeLine: c(
      "市住建委商品房交易资金监管对接（2024.08–2024.12）。月均变更 10+ 次，响应时效 +60%，3 名备用开发 + 2 名测试，首批通过验收。",
      "Municipal pre-sale housing escrow integration (2024.08–2024.12). 10+ interface changes a month, response +60%, pool of 3 developers + 2 testers, first acceptance batch.",
    ),
  },
  {
    id: "face",
    employer: "bank",
    category: "fintech",
    title: c("人脸比对算法评测体系", "Face-comparison algorithm evaluation"),
    org: c("重庆农村商业银行", "Chongqing Rural Commercial Bank"),
    role: c("项目经理", "Project Manager"),
    period: "2022.06 – 2022.08",
    domain: c("算法评测 · 生物识别", "Algorithm evaluation · biometrics"),
    summary: c(
      "行内人脸算法没有统一评测标准。我定义指标和数据集，用 Python 与 JMeter 把评测跑起来，误识率从 0.08% 降到 0.028%，并申请发明专利 CN118135636A。",
      "The bank’s face algorithms had no shared evaluation standard. I defined metrics and datasets, ran the evaluation with Python and JMeter, cut the false acceptance rate from 0.08% to 0.028%, and filed invention patent CN118135636A.",
    ),
    metrics: [
      c("FAR 0.08% → 0.028%", "FAR 0.08% → 0.028%"),
      c("远程核验通过率 +5%", "Remote verification pass rate +5%"),
      c("CN118135636A 已申请", "CN118135636A filed"),
    ],
    context: [
      c("缺少评测标准时，误识率高、响应慢，业务侧无法判断换供应商有没有变好。", "Without a standard, false accepts stayed high and responses slow, and the business could not tell whether a new vendor was actually better."),
    ],
    actions: [
      c("定义 8 项评测指标（含 FAR、TAR、FRR、ACC 和响应时间）和 6 类数据集（人种、光照、清晰度等）。", "Defined 8 metrics (including FAR, TAR, FRR, ACC, and response time) and 6 dataset types (demographic group, lighting, sharpness, and others)."),
      c("用 Python 做预处理和结果可视化，用 JMeter 做批量接口和高并发测试，推动供应商完成 3 轮迭代。", "Used Python for preprocessing and result charts, and JMeter for batched and high-concurrency API tests, driving the vendor through 3 iterations."),
      c("输出企业级《生物特征识别算法评测规范》，并复用到语音语义和 OCR。专利已申请并公开，目前实质审查中。", "Published an enterprise Biometric Algorithm Evaluation Standard and reused it for speech and OCR. The patent is filed and published, and is in substantive examination."),
    ],
    impact: [
      c("误识率（FAR，false acceptance rate）由 0.08% 降至 0.028%。远程身份核验通过率提升 5%。", "False acceptance rate fell from 0.08% to 0.028%. Remote identity-verification pass rate rose by 5%."),
      c("发明专利 CN118135636A 已申请（2024-03-12 申请，2024-06-04 公开），尚未授权。", "Invention patent CN118135636A was filed on 2024-03-12 and published on 2024-06-04. It is not yet granted."),
    ],
    resumeLine: c(
      "人脸比对评测体系：FAR 0.08% → 0.028%，远程核验通过率 +5%。企业级评测规范，发明专利 CN118135636A 已申请并公开（实质审查中）。",
      "Face-comparison evaluation: FAR 0.08% → 0.028%, remote pass rate +5%. Enterprise standard. Invention patent CN118135636A filed and published (in substantive examination).",
    ),
  },
  {
    id: "job-tracker",
    employer: "personal",
    category: "opensource",
    title: c("AI 求职助手 job-tracker", "AI job-search assistant, job-tracker"),
    org: c("个人开源", "Personal open source"),
    role: c("产品、架构与实现", "Product, architecture, and build"),
    period: "2026 · 约 2 周",
    domain: c("Chrome 扩展 · 本地优先", "Chrome extension · local-first"),
    summary: c(
      "自己每天在用的求职工具：抓取岗位、可解释地匹配、从单一经历库生成简历。数据留在本机，不做自动投递。",
      "A job-search tool I use myself: scrape roles, match them with a stated reason, and generate résumés from one experience bank. Data stays on the machine. It does not auto-apply.",
    ),
    metrics: [
      c("约 10,300 行 · 68 个文件", "~10,300 lines · 68 files"),
      c("479 条岗位", "479 roles captured"),
      c("15 条经历库", "15 experience-bank entries"),
      c("不做自动投递", "Does not auto-apply"),
    ],
    context: [
      c("换工作期间，筛岗位、改简历、准备面试都是重复劳动，而且多份简历很快互相不一致。", "While job hunting, screening roles, rewriting a résumé, and preparing interviews were repetitive — and several résumé files drifted apart."),
    ],
    actions: [
      c("Chrome 扩展（WXT，Manifest V3）抓取岗位，后台队列去重入库。前端 React / Vite / TypeScript，后端 Express + SQLite。", "A Chrome extension (WXT, Manifest V3) scrapes roles; a background queue de-duplicates them into the database. React / Vite / TypeScript on the front, Express + SQLite on the back."),
      c("经历库是唯一事实来源：项目、工作、教育、基本信息只存一处。简历是勾选后的视图，AI 生成也读同一份数据。", "The experience bank is the single source of truth: projects, roles, education, and profile are stored once. A résumé is a selected view, and AI generation reads the same data."),
      c("匹配必须给出理由。AI 密钥只从本机读取。只有主动触发时才把必要文本送到自行配置的模型 API。约 15 个测试文件。", "Every match must state its reason. AI keys are read only on the machine. Text goes to a model API I configure only when I explicitly ask. About 15 test files."),
    ],
    impact: [
      c("约 10,300 行、68 个文件；已抓取 479 条岗位；经历库 15 条（11 个项目、2 段工作、1 条教育、1 条基本信息）。", "About 10,300 lines and 68 files; 479 roles captured; 15 bank entries (11 projects, 2 roles, 1 education record, 1 profile)."),
      c("改一处经历，所有简历版本一起更新。投不投由我决定，工具只负责效率和排序。", "Edit an experience once and every résumé version updates. I decide whether to apply; the tool only handles speed and ranking."),
    ],
    resumeLine: c(
      "开源 AI 求职助手：本地优先的 Chrome 扩展 + Web，可解释匹配，经历库单一事实来源，不做自动投递。约 10,300 行，479 条岗位。",
      "Open-source AI job assistant: local-first Chrome extension plus web app, explainable matching, one experience bank, no auto-apply. ~10,300 lines, 479 roles.",
    ),
    links: [
      { href: "https://github.com/Hathawaymm/job-tracker", label: c("GitHub 仓库", "GitHub repository") },
    ],
  },
  {
    id: "personal-site",
    employer: "personal",
    category: "opensource",
    title: c("个人门户 personal-site", "Personal portal, personal-site"),
    org: c("个人开源", "Personal open source"),
    role: c("产品、架构与实现", "Product, architecture, and build"),
    period: "2026 · 约 1 周",
    domain: c("Next.js · 权限模型", "Next.js · permission model"),
    summary: c(
      "这个网站本身：Next.js 16 + React 19，GitHub OAuth，四类访客状态和六个独立权限位。家庭与照片按权限开放；你正在看的简历不需要登录。",
      "This site: Next.js 16 and React 19, GitHub OAuth, four visitor states and six independent permission flags. Family and photos stay permissioned; the résumé you are reading does not require a login.",
    ),
    metrics: [
      c("4 类访客状态", "4 visitor states"),
      c("6 个权限位", "6 permission flags"),
      c("8 个云函数", "8 cloud functions"),
    ],
    context: [
      c("需要一个自己掌控的空间放作品、照片和记录，而不是把家庭内容放到谁都能翻的平台上。", "I needed a place I control for work, photos, and notes — not a platform where family content is public by default."),
    ],
    actions: [
      c("认证只用 GitHub OAuth。访客分管理员、待审批、已授权、已拒绝；照片权限和文字权限分开。审批、权限变更和访问尝试都留日志。", "Authentication is GitHub OAuth only. Visitors are admin, pending, approved, or rejected. Photo access is separate from text access. Approvals, permission changes, and access attempts are logged."),
      c("内容包括作品、富文本博客、照片墙、家庭成员和简历编辑。大文件用对象存储浏览器直传，绕过托管平台的请求体限制。", "Content covers works, a rich-text blog, a photo wall, family members, and résumé editing. Large files upload from the browser to object storage, around the host’s request-size limit."),
      c("约一周完成，含调试。线上同时部署前端和云函数。", "Built in about a week, including debugging. The front end and cloud functions deploy together."),
    ],
    impact: [
      c("公开简历与作品集可以直接打开。私人空间仍按六个权限位控制。", "The public résumé and portfolio open directly. The private space is still controlled by six permission flags."),
      c("8 个云函数承担认证、内容、权限、日志等职责，鉴权放在应用层而不是把权限过滤塞进内容函数。", "Eight cloud functions cover auth, content, permissions, and logs. Authorization sits in the application layer rather than inside the content function."),
    ],
    resumeLine: c(
      "个人门户（本站）：Next.js 16 + React 19，GitHub OAuth，四类访客状态、六个权限位、八个云函数。公开简历无需登录。",
      "Personal portal (this site): Next.js 16 + React 19, GitHub OAuth, four visitor states, six permission flags, eight cloud functions. The public résumé needs no login.",
    ),
    links: [
      { href: "https://github.com/Hathawaymm/personal-site", label: c("GitHub 仓库", "GitHub repository") },
    ],
  },
  {
    id: "mobile-ai",
    employer: "personal",
    category: "opensource",
    title: c("移动端 AI 助手", "Mobile AI assistant"),
    org: c("个人项目", "Personal project"),
    role: c("设计与实现", "Design and build"),
    period: "2026",
    domain: c("只读监控 · 远程驱动", "Read-only monitor · remote control"),
    summary: c(
      "两件套：一个只读的终端工作台，用来回看和监控本机 AI 在做什么；一条从手机飞书到本机 AI 的远程驱动链路。",
      "Two pieces: a read-only terminal desk to review and watch what the local AI is doing, and a path from Feishu on my phone to the AI on my machine.",
    ),
    metrics: [
      c("只读，不改历史数据", "Read-only — history is not rewritten"),
      c("手机消息驱动本机 AI", "Phone messages drive the local AI"),
    ],
    context: [
      c("AI 做的事越来越多，但对话留在本机数据库里，没有界面可回看。人不在电脑前，任务就停着。", "The AI was doing more, but the conversations sat in a local database with no way to review them. Away from the desk, the work stopped."),
    ],
    actions: [
      c("用 Python、Click 和 Rich 做只读终端：列出历史对话、按关键词检索、看当前正在执行的步骤。只加视图，不改原数据。", "Built a read-only terminal with Python, Click, and Rich: list past conversations, search by keyword, and watch the step in progress. A view on top of the data, not a rewrite of it."),
      c("链路是：手机飞书 → 机器人回调 → 内网穿透 → 本机服务 → AI 执行 → 结果返回。交互用现成的飞书客户端，不另做 App。", "The path is Feishu on the phone → bot callback → a tunnel → the local service → the AI → the result. The Feishu client is the interface; I did not build another app."),
    ],
    impact: [
      c("可以复盘某一次任务实际跑了什么，也可以在外面用一条消息让家里的 AI 开始干活。", "I can reconstruct what a task actually did, and I can start the AI at home with one message while I am out."),
      c("同一套「看板 + 超期提醒」的思路，我也配进了工作里的飞书多维表格。", "The same “board plus overdue alert” idea is what I configured in Feishu Bitable at work."),
    ],
    resumeLine: c(
      "移动端 AI 助手：只读终端回看本机对话；飞书消息经内网穿透驱动本地 AI。不改原数据，不另做 App。",
      "Mobile AI assistant: a read-only terminal over local conversations, and Feishu messages that drive the local AI through a tunnel. Original data stays untouched; no separate app.",
    ),
  },
];

export interface GovernanceStage {
  title: Copy;
  detail: Copy;
}

export interface GovernanceCard {
  title: Copy;
  detail: Copy;
}

export const governance = {
  eyebrow: c("贯穿两家公司的工作方式", "How the work was run at both companies"),
  title: c("流程体系建设与合规治理", "Delivery governance, process systems & compliance"),
  lede: c(
    "项目会结束，门禁、规范和取数闭环还在。下面四块是我留下来、别人能接着用的东西。",
    "Projects end. Gates, standards, and the audit-data loop stay. These four are what I left behind for the next person to use.",
  ),
  gates: {
    title: c("0→1 研发交付与四层质量门禁", "Delivery from zero, and four quality gates"),
    where: c("路特创新 · 信息技术中心", "Root Innovation · IT Center"),
    lede: c(
      "部门原来没有统一的研发节奏。我从晨会、评审、提测、发布到复盘搭了一整套，并用飞书多维表格把版本状态从聊天记录里拿出来。",
      "The department had no shared engineering rhythm. I set up standups, reviews, test entry, release, and retrospectives, and used Feishu Bitable to pull version status out of chat.",
    ),
    stages: [
      { title: c("需求评审", "Requirements review"), detail: c("范围、规则和验收标准先写清，再进开发。", "Scope, rules, and acceptance criteria are written before build starts.") },
      { title: c("技术评审", "Technical review"), detail: c("方案、依赖和排期放在同一张桌上确认。", "Approach, dependencies, and the schedule are confirmed in one room.") },
      { title: c("提测主流程走查", "Main-path walkthrough"), detail: c("提测前当面跑通主流程。这条规定加上之后，返工明显下降。", "The main path is walked in person before test entry. Rework dropped once this rule was in place.") },
      { title: c("分级发布与复盘", "Staged release & retro"), detail: c("按风险分级发布，留回滚，版本结束后复盘遗留问题。", "Release by risk level, keep a rollback, and review leftovers after the version.") },
    ] satisfies GovernanceStage[],
    signals: [
      { value: c("100%", "100%"), label: c("核心版本按期交付率", "Core releases on time") },
      { value: c("< 5%", "< 5%"), label: c("上线缺陷率", "Post-release defect rate") },
      { value: c("38", "38"), label: c("2025 年 7 月评审覆盖的需求", "Requirements reviewed in July 2025") },
      { value: c("100%", "100%"), label: c("同期待办闭环率", "Action closure that month") },
    ],
    board: c(
      "飞书多维表格做版本监控看板：自动汇总周报，任务超期直接预警，不再靠逐人催。",
      "A Feishu Bitable board monitors versions: weekly reports assemble themselves, and overdue tasks alert on their own — no more chasing people one by one.",
    ),
  },
  standards: {
    title: c("企业级规范与可复用标准", "Enterprise standards that outlive the project"),
    where: c("重庆农商行 + 路特创新", "Rural Commercial Bank + Root Innovation"),
    lede: c(
      "规范要能被下一个人拿去用。下面四份是写出来、推下去、并且在后续项目里真的被引用的。",
      "A standard has to be usable by the next person. These four were written, rolled out, and actually cited on later work.",
    ),
    cards: [
      {
        title: c("全行《代码质量管理办法》", "Bank-wide Code Quality Management Measures"),
        detail: c("自动化扫描加上两级人工审查，推动 100+ 系统接入。农商行软件开发部牵头。", "Automated scanning plus two levels of human review, rolled out to 100+ systems. Led from the bank’s software development department."),
      },
      {
        title: c("《合作方接入预评估清单》与商户画像库", "Partner pre-assessment checklist and merchant profiles"),
        detail: c("接入前先评风险和系统适配，画像记录对接耗时与故障史。支付收单项目里前置风险识别率 +50%。", "Risk and system fit are scored before onboarding. Profiles record integration time and failure history. Upfront risk detection on the acquiring program rose 50%."),
      },
      {
        title: c("《RPA 需求 SOP》", "RPA Demand SOP"),
        detail: c("业务按清单提需，而不是在聊天里丢一句话。配合公司级培训，全部场景合计月省 500+ 小时。", "Business teams file requests against a checklist instead of a chat message. With company training, all scenarios together save 500+ hours a month."),
      },
      {
        title: c("《生物特征识别算法评测规范》", "Biometric Algorithm Evaluation Standard"),
        detail: c("8 项指标、6 类数据集。评测方案复用到语音语义和 OCR。对应发明专利 CN118135636A（已申请并公开，实质审查中）。", "Eight metrics, six dataset types. The method was reused for speech and OCR. Invention patent CN118135636A is filed and published, in substantive examination."),
      },
    ] satisfies GovernanceCard[],
    also: c(
      "同一时期还在用的配套件：《需求风险跟踪表》《验收台账》《共性问题知识库》，以及路特侧的《需求变更跟踪表》和迭代复盘模板。",
      "Alongside these: a requirements-risk log, an acceptance ledger, a shared-issue knowledge base, and — at Root Innovation — a change log and retrospective templates.",
    ),
  },
  risk: {
    title: c("复杂项目的风险与变更控盘", "Risk and change control on messy programs"),
    where: c("两家公司的高压项目", "The high-pressure programs at both companies"),
    lede: c(
      "范围会变。我要的是变更有级别、有负责人和有资源，而不是群里说一声就算数。",
      "Scope will change. What I want is a severity, an owner, and capacity — not a message in a group chat.",
    ),
    cards: [
      {
        title: c("P0 / P1 / P2 三级闭环", "P0 / P1 / P2 closure"),
        detail: c("To B CRM 登记 82 项验收问题：67 项已处理，9 项处理中，6 项明确放到上线后。11 月窗口只承诺 P0 和 P1。", "The B2B CRM logged 82 acceptance issues: 67 resolved, 9 in progress, 6 explicitly post-launch. The November window committed only to P0 and P1."),
      },
      {
        title: c("大促 24 小时值班与扩容降级", "Peak on-call, scale-up, and degrade"),
        detail: c("黑五前写好值班、扩容和降级预案。11 月 6 日版本 12 项准时上线；冻结后的紧急需求改期并提高优先级，不挤进已锁定的版本。", "On-call, scale-up, and degrade plans were written before Black Friday. The November 6 release shipped 12 items on time. Urgent work arriving after freeze was rescheduled and reprioritized, not forced into the locked version."),
      },
      {
        title: c("监管变更同步与弹性资源池", "Regulatory-change log and an elastic pool"),
        detail: c("住建委资金监管：变更同步表加分级沟通，关键问题响应时效 +60%。提前储备 3 名备用开发和 2 名测试，接口月均变更 10+ 次仍按期验收。", "Housing escrow: a change log plus tiered communication improved critical-issue response by 60%. A pool of 3 reserve developers and 2 testers was ready. Acceptance stayed on time through 10+ interface changes a month."),
      },
    ] satisfies GovernanceCard[],
  },
  audit: {
    title: c("年度外部审计取数与合规报告", "Yearly external-audit data pulls and compliance reports"),
    where: c("重庆农村商业银行 · 软件开发部", "Chongqing Rural Commercial Bank · Software Development"),
    lede: c(
      "在农商行，每年都要配合外部审计取数并提交合规报告。强监管下，审计要的是口径一致、能指出数据从哪个系统哪一次运行来的。我把它做成固定闭环，而不是年底临时加班。",
      "At the bank, every year meant supporting an external audit: extract the data and file the compliance report. Under heavy regulation the audit wants one definition of each figure, and a way to point at the system and the run that produced it. I made that a fixed loop, not a year-end scramble.",
    ),
    stages: [
      { title: c("审计口径拆解与对齐", "Break down and align the audit definitions"), detail: c("先把报告要的每个数拆成口径、时间范围和责任系统，和业务、数据负责人对齐后再取数。", "Each figure in the report is split into a definition, a time window, and an owning system, and agreed with business and data owners before anyone extracts it.") },
      { title: c("跨系统取数与多方复核", "Cross-system extracts and multi-party review"), detail: c("开发、测试和业务各自从自己的系统取数，再交叉核对，避免单一路径上的数直接进报告。", "Engineering, test, and business each extract from their own systems, then cross-check, so a number from a single path never goes straight into the report.") },
      { title: c("差异排查与证据链归档", "Resolve breaks and archive the evidence"), detail: c("对不上的数要留下差异原因、修正记录和原始导出。后来被问到，能找出那一次是谁确认的。", "Breaks keep a cause, a correction, and the original export. When someone asks later, you can see who confirmed that run.") },
      { title: c("合规报告汇总与按期报送", "Compile the report and file it on time"), detail: c("汇总成审计要的报告结构，按节点报送。日历是外部给的，资源要提前留出来。", "Assemble the report in the structure the audit asked for, and file it on the given date. The calendar is external, so the capacity has to be reserved early.") },
    ] satisfies GovernanceStage[],
    note: c(
      "这一段只描述闭环和协同方式。审计机构名称、次数和通过率没有写进公开材料，这里也不补。",
      "This section describes the loop and how teams worked. Audit-firm names, counts, and pass rates are not in the public record, and they are not added here.",
    ),
  },
};

export const categoryOrder: ProjectCategory[] = ["commerce", "ai", "fintech", "opensource"];

export function projectSearchText(project: Project, lang: Lang): string {
  const chunks = [
    project.title,
    project.org,
    project.role,
    project.domain,
    project.summary,
    project.resumeLine,
    ...project.metrics,
    ...project.context,
    ...project.actions,
    ...project.impact,
  ];
  return chunks.map((item) => item[lang]).join("\n").toLowerCase();
}
