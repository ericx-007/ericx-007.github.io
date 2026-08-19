/* ============================================================
 * 项目数据 —— 三档：done(已完成) / doing(进行中) / planned(计划中)
 *
 * 字段说明：
 *   title    项目名
 *   desc     一句话简介
 *   tags     技术栈标签
 *   status   done | doing | planned
 *   date     完成日期（done）或 最近更新（doing）
 *   links    { repo, demo } 可选
 *   progress 0-100，仅 doing 用（画进度条）
 *   note     进行中补充说明（doing）或 预计时间（planned）
 *   priority P0/P1/P2，仅 planned 用（P0 最想做）
 * ============================================================ */
window.PROJECTS = [
  /* ---------- 已完成 ---------- */
  {
    title: "示例：我的第一个项目",
    desc: "把示例项目替换成你真正做完的东西 —— 哪怕很小，做完就是胜利。写清楚它解决了什么问题。",
    tags: ["Python", "爬虫"],
    status: "done",
    date: "2025.06",
    links: { repo: "https://github.com/你的用户名/项目", demo: "" },
  },
  {
    title: "示例：期末大作业",
    desc: "课程作业也可以放上来：题目、你的实现思路、最后的效果。",
    tags: ["C++", "数据结构"],
    status: "done",
    date: "2025.01",
    links: { repo: "", demo: "" },
  },

  /* ---------- 进行中 ---------- */
  {
    title: "示例：正在做的项目",
    desc: "写到一半的项目更要展示 —— 它会提醒你把它做完。",
    tags: ["React", "Vite"],
    status: "doing",
    date: "2026.08",
    progress: 65,
    note: "目前完成了主体功能，正在补测试和文档。",
    links: { repo: "https://github.com/你的用户名/项目" },
  },

  /* ---------- 计划中 ---------- */
  {
    title: "示例：想做的项目",
    desc: "计划中的项目用 P0/P1/P2 标优先级，先做最想做的那个。",
    tags: ["Rust"],
    status: "planned",
    priority: "P0",
    note: "预计 20XX QX 开工",
  },
  {
    title: "示例：更大的想法",
    desc: "暂时还不会做也没关系，写下来就是第一步。",
    tags: ["AI", "Web"],
    status: "planned",
    priority: "P1",
    note: "等基础积累够了就动手",
  },
];
