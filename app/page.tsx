"use client";

import { useEffect, useState } from "react";

type Tab = "home" | "work" | "about";

const profileImage =
  "https://gitee.com/da-qiang-classmate/typora/raw/master/image/image-20260208022750247.webp";

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
  const [booting, setBooting] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    const bootTimer = window.setTimeout(() => setBooting(false), 1850);
    const updateTime = () =>
      setTime(new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateTime();
    const clockTimer = window.setInterval(updateTime, 30000);
    return () => {
      window.clearTimeout(bootTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  const changeTab = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (booting) {
    return (
      <main className="boot-screen" aria-label="系统正在启动">
        <div className="laptop">
          <div className="laptop-screen">
            <div className="terminal-bar"><i /><i /><i /><span>dqtx@universe ~ zsh</span></div>
            <div className="boot-terminal">
              <p><b>$</b> whoami</p>
              <p className="muted">&gt; 大强同学 · 数字生产力玩家</p>
              <p><b>$</b> echo &quot;1 Person + AI = 1 Team&quot;</p>
              <p className="gold">&gt; 用 AI 干掉 90% 的重复劳动</p>
              <p><b>$</b> open dqtx-os.app</p>
              <p className="muted">&gt; launching...</p>
              <p className="loading-line">[████████████] 100%</p>
            </div>
          </div>
          <div className="laptop-base" />
        </div>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <div className="wallpaper" aria-hidden="true">
        {stars.map((star, index) => (
          <span key={index} style={{ left: star.left, top: star.top, fontSize: star.size, animationDelay: star.delay }}>✦</span>
        ))}
      </div>

      <header className="menu-bar">
        <button className="brand" onClick={() => changeTab("home")}>dqtx OS</button>
        <button onClick={() => changeTab("about")}>About</button>
        <button onClick={() => changeTab("work")}>Works</button>
        <a href="mailto:sphinx308@proton.me">Contact</a>
        <time>{time}</time>
      </header>

      {tab === "home" && (
        <section className="desktop-page page-enter" aria-label="主页桌面">
          <div className="intro-card">
            <div className="portrait-ring">
              <img src={profileImage} alt="大强同学" />
            </div>
            <p className="eyebrow">DIGITAL PRODUCTIVITY PLAYER</p>
            <h1>你好，我是大强同学。</h1>
            <p>Build in Public 践行者、工作流构建者。探索 AI 新鲜玩法，也把复杂的工具链变成真正能落地的生产力。</p>
            <div className="status"><span /> 正在构建：让 AI Coding Agent Skills 跨平台管理更简单</div>
          </div>

          <div className="shortcut-grid">
            {shortcuts.map((item) => (
              <a className="shortcut" href={item.url} target="_blank" rel="noreferrer" key={item.label}>
                <span className={`shortcut-icon ${item.kind}`}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          <div className="desktop-note">
            <span>NOW PLAYING</span>
            <strong>Obsidian × AI Agent</strong>
            <small>写作工作流 / Skills 工程化 / CLI 工具链</small>
          </div>
        </section>
      )}

      {tab === "work" && (
        <section className="content-window works-window page-enter" aria-label="作品集">
          <div className="window-titlebar">
            <div><i /><i /><i /></div>
            <span>works — dqtx OS</span>
            <button onClick={() => changeTab("home")} aria-label="关闭作品集">×</button>
          </div>
          <div className="window-content">
            <p className="section-kicker">VIBE CODING ARCHIVE / 2026</p>
            <h2>做小而有用的工具，<br />让想法尽快上线。</h2>
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
        <section className="content-window about-window page-enter" aria-label="关于我">
          <div className="window-titlebar dark-titlebar">
            <div><i /><i /><i /></div>
            <span>dqtx@universe ~ about.md</span>
            <button onClick={() => changeTab("home")} aria-label="关闭关于页面">×</button>
          </div>
          <div className="about-grid">
            <div className="about-terminal">
              <p><span>$</span> cat about.md</p>
              <h2>92 年生人，<br />与 AI 一起把生活变简单。</h2>
              <p className="terminal-copy">我关注效率工具、AI Agent 生态、出海实操和可复用工作流。比起讨论未来，我更喜欢把今天能跑起来的东西做出来。</p>
              <p><span>$</span> cat now.txt</p>
              <ul>
                <li>🛠️ AI Coding Agent Skills 跨平台管理</li>
                <li>🌱 Obsidian 写作工作流与 CLI 工具链</li>
                <li>📝 多平台内容分发自动化</li>
              </ul>
              <p><span>$</span> cat contact.md</p>
              <div className="contact-links">
                <a href="mailto:sphinx308@proton.me">📮 sphinx308@proton.me</a>
                <a href="https://x.com/dqtx760" target="_blank" rel="noreferrer">🐦 X / Twitter @dqtx760</a>
                <a href="https://space.bilibili.com/491358682/video" target="_blank" rel="noreferrer">📺 Bilibili 大强同学</a>
              </div>
              <p className="cursor-line"><span>$</span> <i /></p>
            </div>
            <aside className="service-panel">
              <span className="panel-label">WORK WITH ME</span>
              <h3>把卡住你的技术问题，交给我。</h3>
              <ul>
                <li>网站搭建 / 环境配置</li>
                <li>AI Agent Skill 定制</li>
                <li>Obsidian → Git → 网站工作流</li>
                <li>系统优化 / 软件疑难排查</li>
                <li>OpenList 网盘挂载</li>
              </ul>
              <a className="service-button" href="https://742112.xyz" target="_blank" rel="noreferrer">查看远程服务 ↗</a>
              <small>单次问题解决 35 元起 · 远程配置 50 元起</small>
            </aside>
          </div>
        </section>
      )}

      <nav className="pill-nav" aria-label="页面导航">
        <button className={tab === "home" ? "active" : ""} onClick={() => changeTab("home")}><small>01</small>主页</button>
        <button className={tab === "work" ? "active" : ""} onClick={() => changeTab("work")}><small>02</small>作品集</button>
        <button className={tab === "about" ? "active" : ""} onClick={() => changeTab("about")}><small>03</small>关于我</button>
      </nav>

      <footer>© 2026 大强同学 · Built with AI &amp; attitude</footer>
    </main>
  );
}
