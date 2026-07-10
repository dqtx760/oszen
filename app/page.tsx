"use client";

import { useEffect, useState } from "react";

type Tab = "home" | "work" | "about";
type CardId = "portrait" | "identity" | "timeline" | "story" | "skills" | "service" | "sticky";

const initialCardPositions: Record<CardId, { x: number; y: number }> = {
  portrait: { x: 105, y: 155 },
  identity: { x: 500, y: 160 },
  timeline: { x: 1015, y: 110 },
  story: { x: 520, y: 585 },
  skills: { x: 1050, y: 650 },
  service: { x: 1435, y: 370 },
  sticky: { x: 110, y: 690 },
};

const canvasLayers: { id: CardId; label: string; color: string }[] = [
  { id: "portrait", label: "个人照片", color: "blue" },
  { id: "identity", label: "个人信息", color: "yellow" },
  { id: "timeline", label: "经历时间线", color: "blue" },
  { id: "story", label: "核心叙事", color: "yellow" },
  { id: "skills", label: "技能标签", color: "blue" },
  { id: "service", label: "商业服务", color: "yellow" },
  { id: "sticky", label: "正在发生", color: "yellow" },
];

const canvasConnectors: { from: CardId; to: CardId; fromOffset: [number, number]; toOffset: [number, number]; color: string }[] = [
  { from: "portrait", to: "identity", fromOffset: [300, 190], toOffset: [0, 190], color: "#8bb2e6" },
  { from: "identity", to: "timeline", fromOffset: [380, 180], toOffset: [0, 220], color: "#8bb2e6" },
  { from: "identity", to: "story", fromOffset: [195, 360], toOffset: [195, 0], color: "#f2c93d" },
  { from: "story", to: "skills", fromOffset: [390, 170], toOffset: [0, 120], color: "#8bb2e6" },
  { from: "timeline", to: "service", fromOffset: [360, 230], toOffset: [0, 150], color: "#8bb2e6" },
];

const profileImage = "/profile.png";

const shortcuts = [
  { icon: "🌐", label: "个人博客", url: "https://dqtx.cc", kind: "folder" },
  { icon: "📄", label: "个人简历", url: "https://cv.dqtx.cc", kind: "file" },
  { icon: "⚙️", label: "数字工坊", url: "https://app.dqtx.cc", kind: "folder" },
  { icon: "💻", label: "远程服务", url: "https://742112.xyz", kind: "file" },
  { icon: "🧭", label: "大强导航", url: "https://123.dqtx.cc", kind: "folder" },
  { icon: "🧩", label: "Chrome 插件", url: "https://110.dqtx.cc", kind: "file" },
  { icon: "⌘", label: "GitHub", url: "https://github.com/dqtx760", kind: "file" },
  { icon: "𝕏", label: "@dqtx760", url: "https://x.com/dqtx760", kind: "file" },
];

const projects = [
  { icon: "📺", name: "电视喵", desc: "轻量在线电视工具", url: "https://tv.dqtx.cc" },
  { icon: "✨", name: "魔法指南", desc: "把复杂配置讲明白", url: "https://77.dqtx.cc" },
  { icon: "🔐", name: "密码生成器", desc: "安全、直接、无需登录", url: "https://key.dqtx.cc" },
  { icon: "🃏", name: "卡片生成器", desc: "把内容铸成视觉卡片", url: "https://cd.dqtx.cc" },
  { icon: "🏥", name: "医疗报销查询", desc: "让查询过程更简单", url: "https://bx.dqtx.cc" },
  { icon: "🎨", name: "在线生图", desc: "快速开始 AI 创作", url: "https://ai.dqtx.cc" },
];

const openSource = [
  { name: "Firefly", note: "个人博客", url: "https://github.com/dqtx760/Firefly" },
  { name: "StarTab", note: "标签页扩展", url: "https://github.com/dqtx760/StarTab" },
  { name: "cfg", note: "自用软件备份", url: "https://github.com/dqtx760/cfg" },
  { name: "oplist-Neumorphism", note: "OpenList 主题", url: "https://github.com/dqtx760/oplist-Neumorphism" },
];

const stars = Array.from({ length: 58 }, (_, index) => ({
  left: `${(index * 37 + 7) % 97}%`,
  top: `${(index * 53 + 5) % 94}%`,
  size: `${6 + (index % 4) * 3}px`,
  delay: `${(index % 9) * 0.23}s`,
}));

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [time, setTime] = useState("");
  const [zoom, setZoom] = useState(0.82);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cardPositions, setCardPositions] = useState(initialCardPositions);
  const [selectedCard, setSelectedCard] = useState<CardId>("identity");
  const [interaction, setInteraction] = useState<{
    type: "pan" | "card";
    cardId?: CardId;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const updateTime = () =>
      setTime(new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateTime();
    const clockTimer = window.setInterval(updateTime, 30000);
    return () => {
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    const syncTabWithUrl = () => {
      if (window.location.hash === "#works") setTab("work");
      else if (window.location.hash === "#about") setTab("about");
      else setTab("home");
    };
    syncTabWithUrl();
    window.addEventListener("hashchange", syncTabWithUrl);
    window.addEventListener("popstate", syncTabWithUrl);
    return () => {
      window.removeEventListener("hashchange", syncTabWithUrl);
      window.removeEventListener("popstate", syncTabWithUrl);
    };
  }, []);

  const changeTab = (next: Tab) => {
    setTab(next);
    const nextUrl = next === "work" ? "#works" : next === "about" ? "#about" : `${window.location.pathname}${window.location.search}`;
    window.history.pushState(null, "", nextUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;

    const handle = target.closest<HTMLElement>("[data-drag-handle]");
    const card = handle?.closest<HTMLElement>("[data-card]");
    event.currentTarget.setPointerCapture(event.pointerId);

    if (card) {
      const cardId = card.dataset.card as CardId;
      setSelectedCard(cardId);
      setInteraction({
        type: "card",
        cardId,
        startX: event.clientX,
        startY: event.clientY,
        originX: cardPositions[cardId].x,
        originY: cardPositions[cardId].y,
      });
      return;
    }

    if (!target.closest(".canvas-card")) {
      setInteraction({ type: "pan", startX: event.clientX, startY: event.clientY, originX: pan.x, originY: pan.y });
    }
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interaction) return;
    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;
    if (interaction.type === "pan") {
      setPan({ x: interaction.originX + deltaX, y: interaction.originY + deltaY });
      return;
    }
    if (interaction.cardId) {
      setCardPositions((current) => ({
        ...current,
        [interaction.cardId as CardId]: {
          x: interaction.originX + deltaX / zoom,
          y: interaction.originY + deltaY / zoom,
        },
      }));
    }
  };

  const focusCard = (cardId: CardId) => {
    const position = cardPositions[cardId];
    setSelectedCard(cardId);
    setPan({ x: 300 - position.x * zoom, y: 150 - position.y * zoom });
  };

  const resetCanvas = () => {
    setCardPositions(initialCardPositions);
    setPan({ x: 0, y: 0 });
    setZoom(0.82);
    setSelectedCard("identity");
  };

  return (
    <main className={`site-shell tab-${tab}`}>
      {tab === "home" && <div className="wallpaper" aria-hidden="true">
        {stars.map((star, index) => (
          <span key={index} style={{ left: star.left, top: star.top, fontSize: star.size, animationDelay: star.delay }}>✦</span>
        ))}
      </div>}

      {tab !== "work" && <header className="menu-bar">
        <button className="brand" onClick={() => changeTab("home")}>dqtx OS</button>
        <button onClick={() => changeTab("about")}>About</button>
        <button onClick={() => changeTab("work")}>Works</button>
        <a href="mailto:sphinx308@proton.me">Contact</a>
        <time>{time}</time>
      </header>}

      {tab === "home" && (
        <section className="desktop-page page-enter" aria-label="主页桌面">
          <div className="shortcut-grid">
            {shortcuts.map((item) => (
              <a className="shortcut" href={item.url} target="_blank" rel="noreferrer" key={item.label}>
                <span className={`shortcut-icon ${item.kind}`}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {tab === "work" && (
        <section className="works-page page-enter" aria-label="作品集">
          <div className="works-inner">
            <p className="section-kicker">VIBE CODING ARCHIVE / 2026</p>
            <div className="works-hero">
              <h1>1 Person + AI = 1 Team</h1>
              <p>做小而有用的工具，让想法尽快上线。</p>
            </div>
            <div className="project-grid">
              {projects.map((project, index) => (
                <a href={project.url} target="_blank" rel="noreferrer" className="project-card" key={project.name}>
                  <span className="project-index">0{index + 1}</span>
                  <span className="project-emoji">{project.icon}</span>
                  <h3>{project.name}</h3>
                  <p>{project.desc}</p>
                  <b>打开项目 ↗</b>
                </a>
              ))}
            </div>
            <div className="repo-strip">
              <div><span>OPEN SOURCE</span><strong>代表项目</strong></div>
              {openSource.map((repo) => (
                <a href={repo.url} target="_blank" rel="noreferrer" key={repo.name}>
                  <b>{repo.name}</b><small>{repo.note}</small><em>↗</em>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "about" && (
        <section className="canvas-app page-enter" aria-label="大强同学个人画布">
          <div className="canvas-toolbar">
            <strong><span>DQ</span> DQTX Canvas</strong>
            <div>Scroll 缩放 · Drag 移动画布 · 拖拽卡片</div>
            <button onClick={resetCanvas}>↶ 重置</button>
          </div>

          <aside className="canvas-layers">
            <h2>✦ Layers</h2>
            <div className="layer-list">
              {canvasLayers.map((layer) => (
                <button className={selectedCard === layer.id ? "active" : ""} onClick={() => focusCard(layer.id)} key={layer.id}>
                  <i className={layer.color} />{layer.label}<small>◉</small>
                </button>
              ))}
            </div>
            <button className="new-layer" onClick={() => focusCard("sticky")}>＋ 聚焦正在发生</button>
            <div className="mini-map" aria-hidden="true">
              <span>✦ Minimap</span>
              <div><i /><i /><i /><i /><i /></div>
            </div>
          </aside>

          <div
            className={`canvas-board ${interaction ? "is-dragging" : ""}`}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={() => setInteraction(null)}
            onPointerCancel={() => setInteraction(null)}
            onWheel={(event) => {
              if (Math.abs(event.deltaY) < 2) return;
              setZoom((current) => Math.min(1.25, Math.max(0.48, current - event.deltaY * 0.0008)));
            }}
          >
            <div className="canvas-stage" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
              {canvasConnectors.map((connector) => {
                const from = cardPositions[connector.from];
                const to = cardPositions[connector.to];
                const x1 = from.x + connector.fromOffset[0];
                const y1 = from.y + connector.fromOffset[1];
                const x2 = to.x + connector.toOffset[0];
                const y2 = to.y + connector.toOffset[1];
                const width = Math.hypot(x2 - x1, y2 - y1);
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                return <i className="canvas-connector" key={`${connector.from}-${connector.to}`} style={{ left: x1, top: y1, width, borderColor: connector.color, transform: `rotate(${angle}deg)` }} />;
              })}

              <article className={`canvas-card portrait-card ${selectedCard === "portrait" ? "selected" : ""}`} data-card="portrait" style={{ left: cardPositions.portrait.x, top: cardPositions.portrait.y }}>
                <div className="card-grip" data-drag-handle>PERSON.JPG <span>⠿</span></div>
                <img src={profileImage} alt="大强同学" />
              </article>

              <article className={`canvas-card identity-card ${selectedCard === "identity" ? "selected" : ""}`} data-card="identity" style={{ left: cardPositions.identity.x, top: cardPositions.identity.y }}>
                <div className="card-grip" data-drag-handle>PROFILE.MD <span>⠿</span></div>
                <div className="avatar-mini"><img src={profileImage} alt="" /></div>
                <h2>大强同学</h2>
                <p>AI 工具 · Obsidian · 个人网站 · Agent 工作流</p>
                <b>Build in Public</b>
                <blockquote>1 person + AI = 1 team</blockquote>
                <p className="canvas-quote">把 AI 工具用起来，把知识库搭起来，把个人网站上线。</p>
                <div className="canvas-links">
                  <a href="mailto:sphinx308@proton.me">📮 Email</a>
                  <a href="https://x.com/dqtx760" target="_blank" rel="noreferrer">𝕏 @dqtx760</a>
                </div>
              </article>

              <article className={`canvas-card timeline-card ${selectedCard === "timeline" ? "selected" : ""}`} data-card="timeline" style={{ left: cardPositions.timeline.x, top: cardPositions.timeline.y }}>
                <div className="card-grip" data-drag-handle>📍 经历时间线 <span>⠿</span></div>
                <div className="timeline-item"><b>NOW</b><strong>AI Coding Agent Skills</strong><small>跨平台管理与工程化</small></div>
                <div className="timeline-item"><b>2024 — 2026</b><strong>Build in Public</strong><small>持续构建 Vibe Coding 产品</small></div>
                <div className="timeline-item"><b>2023 — 2025</b><strong>Obsidian 工作流</strong><small>写作、Git 与多平台分发</small></div>
                <div className="timeline-item"><b>2019 — 现在</b><strong>远程技术服务</strong><small>把问题解决在一线</small></div>
              </article>

              <article className={`canvas-card story-card ${selectedCard === "story" ? "selected" : ""}`} data-card="story" style={{ left: cardPositions.story.x, top: cardPositions.story.y }}>
                <div className="card-grip" data-drag-handle>💡 核心叙事 <span>⠿</span></div>
                <p className="story-mark">〃</p>
                <h3>我不只安装工具，<br />我帮你把它真正用起来。</h3>
                <p>从 AI 工具、Obsidian 知识库，到个人网站和 Agent 工作流，我更关心方案能否落地、能否长期使用、能否减少重复劳动。</p>
                <em>CREATE → CONNECT → SHIP</em>
              </article>

              <article className={`canvas-card skills-card ${selectedCard === "skills" ? "selected" : ""}`} data-card="skills" style={{ left: cardPositions.skills.x, top: cardPositions.skills.y }}>
                <div className="card-grip" data-drag-handle>⚡ SKILLS <span>⠿</span></div>
                <div>{["AI Agent", "Obsidian", "Claude Skills", "Codex", "CLI", "自动化", "网站搭建", "内容分发"].map((skill) => <span key={skill}>{skill}</span>)}</div>
              </article>

              <article className={`canvas-card service-canvas-card ${selectedCard === "service" ? "selected" : ""}`} data-card="service" style={{ left: cardPositions.service.x, top: cardPositions.service.y }}>
                <div className="card-grip" data-drag-handle>WORK WITH ME <span>⠿</span></div>
                <h3>从安装修复，<br />到长期技术顾问。</h3>
                <div className="service-price-list">
                  <p><span>技术咨询</span><b>50 / 小时</b></p>
                  <p><span>Claude Code 配置</span><b>99</b></p>
                  <p><span>Codex App 安装修复</span><b>50</b></p>
                  <p><span>Obsidian 模板指导</span><b>99～399</b></p>
                  <p><span>个人笔记网站</span><b>300</b></p>
                  <p><span>个人简历网站</span><b>168</b></p>
                  <p><span>Agent Skill 定制</span><b>50～300</b></p>
                  <p><span>年度技术顾问</span><b>6800 / 年</b></p>
                </div>
                <a href="https://742112.xyz" target="_blank" rel="noreferrer">查看全部服务 ↗</a>
              </article>

              <article className={`canvas-card sticky-card ${selectedCard === "sticky" ? "selected" : ""}`} data-card="sticky" style={{ left: cardPositions.sticky.x, top: cardPositions.sticky.y }}>
                <div className="card-grip" data-drag-handle>NOW.TXT <span>⠿</span></div>
                <strong>正在发生</strong>
                <p>Agent Skills 跨平台管理</p>
                <p>Obsidian 写作工作流</p>
                <p>CLI 工具链工程化</p>
              </article>
            </div>
          </div>

          <div className="canvas-zoom">
            <button onClick={() => setZoom((current) => Math.max(0.48, current - 0.1))}>−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((current) => Math.min(1.25, current + 0.1))}>＋</button>
          </div>
        </section>
      )}

      <nav className="pill-nav" aria-label="页面导航">
        <button className={tab === "home" ? "active" : ""} onClick={() => changeTab("home")}><small>01</small>主页</button>
        <button className={tab === "work" ? "active" : ""} onClick={() => changeTab("work")}><small>02</small>作品集</button>
        <button className={tab === "about" ? "active" : ""} onClick={() => changeTab("about")}><small>03</small>关于我</button>
      </nav>

    </main>
  );
}
