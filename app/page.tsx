"use client";

import { useEffect, useState } from "react";

type Tab = "home" | "work" | "about";
type CardId = "identity" | "timeline" | "story" | "skills" | "service" | "sticky";
type DesktopApp = "computer" | "chrome" | "cmd" | "notepad" | "tools" | "agent";

const initialCardPositions: Record<CardId, { x: number; y: number }> = {
  identity: { x: 170, y: 150 },
  timeline: { x: 660, y: 120 },
  service: { x: 1080, y: 230 },
  story: { x: 180, y: 540 },
  skills: { x: 690, y: 555 },
  sticky: { x: 1100, y: 70 },
};

const canvasLayers: { id: CardId; label: string; color: string }[] = [
  { id: "identity", label: "个人信息", color: "yellow" },
  { id: "timeline", label: "经历时间线", color: "blue" },
  { id: "story", label: "核心叙事", color: "yellow" },
  { id: "skills", label: "技能标签", color: "blue" },
  { id: "service", label: "商业服务", color: "yellow" },
  { id: "sticky", label: "正在发生", color: "yellow" },
];

const canvasConnectors: { from: CardId; to: CardId; fromOffset: [number, number]; toOffset: [number, number]; color: string }[] = [
  { from: "identity", to: "timeline", fromOffset: [390, 140], toOffset: [0, 170], color: "#8bb2e6" },
  { from: "identity", to: "story", fromOffset: [195, 360], toOffset: [195, 0], color: "#f2c93d" },
  { from: "timeline", to: "service", fromOffset: [360, 170], toOffset: [0, 180], color: "#8bb2e6" },
  { from: "story", to: "skills", fromOffset: [400, 150], toOffset: [0, 110], color: "#8bb2e6" },
  { from: "sticky", to: "service", fromOffset: [210, 135], toOffset: [260, 0], color: "#f2c93d" },
];

const profileImage = "/profile.png";

const shortcuts = [
  { icon: "/icons/web.png", label: "个人博客", url: "https://dqtx.cc", kind: "folder", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/files.png", label: "个人简历", url: "https://ai.dqtx.cc/", kind: "file", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/agent.png", label: "数字工坊", url: "https://app.dqtx.cc", kind: "folder", iconClass: "image-logo" },
  { icon: "/icons/remote.png", label: "远程服务", url: "https://742112.xyz", kind: "file", iconClass: "image-logo" },
  { icon: "/icons/star.png", label: "大强导航", url: "https://123.dqtx.cc", kind: "folder", iconClass: "image-logo" },
  { icon: "/icons/github.webp", label: "GitHub", url: "https://github.com/dqtx760", kind: "file", iconClass: "image-logo" },
  { icon: "/icons/x.png", label: "推特/X", url: "https://x.com/dqtx760", kind: "file", iconClass: "image-logo" },
  { icon: "/icons/files.png", label: "Codex APP指南.md", url: "https://mp.weixin.qq.com/s/F3HS6BUfTDP0h3rFipoJhA", kind: "file", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/files.png", label: "Obsidian模板.md", url: "https://mp.weixin.qq.com/s/5LkcBS6TvwXEGxIMiA-1jQ", kind: "file", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/package.png", label: "SetProxy.bat", url: "https://lz.qaiu.top/parser?url=https://wwbxq.lanzouq.com/iILcv3tj3web", kind: "file", iconClass: "image-logo", maximizeOnOpen: true },
];

const desktopApps: { id: DesktopApp; icon: string; label: string; iconClass: string }[] = [
  { id: "computer", icon: "/icons/computer.png", label: "计算机", iconClass: "image-logo" },
  { id: "chrome", icon: "/icons/chrome.png", label: "Chrome", iconClass: "image-logo" },
  { id: "cmd", icon: "/icons/cmd.png", label: "Cmd", iconClass: "image-logo" },
  { id: "notepad", icon: "/icons/files.png", label: "记事本", iconClass: "image-logo" },
  { id: "tools", icon: "/icons/drive.png", label: "效率工具", iconClass: "image-logo" },
  { id: "agent", icon: "/icons/agent.png", label: "Ai Agent", iconClass: "image-logo" },
];

const efficiencyTools = [
  { note: "截图", links: [{ name: "PixPin", url: "https://pixpin.cn/" }, { name: "ShareX", url: "https://getsharex.com/" }] },
  { note: "网页下载", links: [{ name: "IDM", url: "https://www.internetdownloadmanager.com/" }] },
  { note: "全能搜索", links: [{ name: "Listary", url: "https://www.listary.com/" }] },
  { note: "语音输入", links: [{ name: "秘塔回响", url: "https://metaso.cn/echo/downloads" }] },
  { note: "局域网传输", links: [{ name: "LANDrop", url: "https://landrop.app/" }] },
  { note: "语音输入、常用语同步", links: [{ name: "微信输入法", url: "https://z.weixin.qq.com/" }] },
  { note: "图床管理", links: [{ name: "PicGo", url: "https://github.com/Molunerfinn/PicGo" }, { name: "PicList", url: "https://piclist.cn/" }] },
  { note: "极速预览", links: [{ name: "QuickLook", url: "https://pooi.moe/QuickLook/" }] },
  { note: "无残留卸载", links: [{ name: "HiBit", url: "https://hibitsoft.ir/" }] },
  { note: "你的数字工程师", links: [{ name: "Claude Code", url: "https://claude.ai/code" }, { name: "Codex", url: "https://openai.com/codex/" }] },
  { note: "Agent 模型快速切换", links: [{ name: "CC-switch", url: "https://github.com/farion1231/cc-switch" }] },
  { note: "智能体", links: [{ name: "Cherry Studio", url: "https://cherry-ai.com/" }] },
  { note: "多标签终端", links: [{ name: "Warp", url: "https://www.warp.dev/" }, { name: "Terminal", url: "https://support.apple.com/guide/terminal/welcome/mac" }, { name: "wezterm", url: "https://wezterm.org/" }] },
];

const agentTools = [
  { name: "Codex APP", links: ["https://apps.microsoft.com/detail/9plm9xgg6vks?hl=zh-CN&gl=CN", "https://store.rg-adguard.net/", "https://openai.com/zh-Hans-CN/codex/"] },
  { name: "Coder Work", links: ["https://qoder.com/qoderwork"] },
  { name: "Workbody", links: ["https://www.codebuddy.cn/work/#download-section"] },
  { name: "ZCode", links: ["https://zcode.z.ai/cn"] },
  { name: "Reasonix", links: ["https://reasonix.io/#start"] },
  { name: "Kimi Code", links: ["https://www.kimi.com/code"] },
  { name: "Zed", links: ["https://zed.dev/"] },
  { name: "Orca / AionUi", links: ["https://github.com/stablyai/orca", "https://aionui.com/"] },
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
  const [openApps, setOpenApps] = useState<DesktopApp[]>([]);
  const [minimizedApps, setMinimizedApps] = useState<DesktopApp[]>([]);
  const [maximizedApps, setMaximizedApps] = useState<DesktopApp[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [desktopLaunched, setDesktopLaunched] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [chromeUrl, setChromeUrl] = useState("");
  const [chromePageUrl, setChromePageUrl] = useState("https://www.google.com/webhp?igu=1");
  const [notepadText, setNotepadText] = useState("大强同学的桌面\n\n正在做：AI Coding Agent Skills 跨平台管理\n正在玩：Obsidian 写作工作流、CLI 工具链\n联系邮箱：sphinx308@proton.me");
  const [cmdInput, setCmdInput] = useState("");
  const [cmdLines, setCmdLines] = useState(["Microsoft Windows [Version 11.0.2026]", "(c) DQTX OS. All rights reserved.", "", "输入 help 查看可用命令。"]);
  const [windowPositions, setWindowPositions] = useState<Record<DesktopApp, { x: number; y: number }>>({
    computer: { x: 230, y: 100 },
    chrome: { x: 330, y: 80 },
    cmd: { x: 270, y: 150 },
    notepad: { x: 390, y: 120 },
    tools: { x: 250, y: 110 },
    agent: { x: 280, y: 120 },
  });
  const [windowDrag, setWindowDrag] = useState<{ app: DesktopApp; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const renderIcon = (icon: string, iconClass: string) => <span className={`app-symbol ${iconClass}`}>{icon.startsWith("/") ? <img src={icon} alt="" /> : icon}</span>;

  const getCenteredWindowPosition = () => ({
    x: Math.max(12, Math.round((window.innerWidth - Math.min(720, window.innerWidth - 40)) / 2)),
    y: Math.max(12, Math.round((window.innerHeight - Math.min(500, window.innerHeight - 100)) / 2) - 20),
  });

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
    if (tab !== "home" || desktopLaunched || isLaunching) return;
    const launchOnEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (isLocked) unlockDesktop();
        else launchDesktop();
      }
    };
    window.addEventListener("keydown", launchOnEnter);
    return () => window.removeEventListener("keydown", launchOnEnter);
  }, [desktopLaunched, isLaunching, isLocked, tab]);

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

  const launchDesktop = () => {
    if (isLaunching || desktopLaunched || isLocked) return;
    setIsLaunching(true);
    window.setTimeout(() => {
      setIsLaunching(false);
      setIsLocked(true);
    }, 1650);
  };

  const unlockDesktop = () => {
    setIsLocked(false);
    setDesktopLaunched(true);
  };

  const lockDesktop = () => {
    setStartOpen(false);
    setOpenApps([]);
    setMinimizedApps([]);
    setMaximizedApps([]);
    setDesktopLaunched(false);
    setIsLocked(true);
  };

  const openApp = (app: DesktopApp, options?: { maximized?: boolean }) => {
    setStartOpen(false);
    setWindowPositions((current) => ({ ...current, [app]: getCenteredWindowPosition() }));
    setMaximizedApps((current) => {
      const withoutApp = current.filter((item) => item !== app);
      return options?.maximized ? [...withoutApp, app] : withoutApp;
    });
    setMinimizedApps((current) => current.filter((item) => item !== app));
    setOpenApps((current) => [...current.filter((item) => item !== app), app]);
  };

  const closeApp = (app: DesktopApp) => {
    setOpenApps((current) => current.filter((item) => item !== app));
    setMinimizedApps((current) => current.filter((item) => item !== app));
    setMaximizedApps((current) => current.filter((item) => item !== app));
  };

  const minimizeApp = (app: DesktopApp) => {
    setMinimizedApps((current) => current.includes(app) ? current : [...current, app]);
  };

  const toggleMaximizeApp = (app: DesktopApp) => {
    setMaximizedApps((current) => current.includes(app) ? current.filter((item) => item !== app) : [...current, app]);
  };

  const handleWindowPointerDown = (event: React.PointerEvent<HTMLDivElement>, app: DesktopApp) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (maximizedApps.includes(app)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const position = windowPositions[app];
    setOpenApps((current) => [...current.filter((item) => item !== app), app]);
    setWindowDrag({ app, startX: event.clientX, startY: event.clientY, originX: position.x, originY: position.y });
  };

  const handleWindowPointerMove = (event: React.PointerEvent<HTMLDivElement>, app: DesktopApp) => {
    if (!windowDrag || windowDrag.app !== app) return;
    setWindowPositions((current) => ({
      ...current,
      [app]: {
        x: Math.max(0, windowDrag.originX + event.clientX - windowDrag.startX),
        y: Math.max(0, windowDrag.originY + event.clientY - windowDrag.startY),
      },
    }));
  };

  const openChromeUrl = () => {
    const value = chromeUrl.trim();
    if (!value) {
      setChromePageUrl("https://www.google.com/webhp?igu=1");
      return;
    }
    const isUrl = /^https?:\/\//i.test(value) || /^[\w-]+(?:\.[\w-]+)+(?:[/?#].*)?$/i.test(value);
    const url = isUrl
      ? (/^https?:\/\//i.test(value) ? value : `https://${value}`)
      : `https://www.google.com/search?igu=1&q=${encodeURIComponent(value)}`;
    setChromeUrl(url);
    setChromePageUrl(url);
  };

  const openInChrome = (url: string, maximized = false) => {
    setChromeUrl(url);
    setChromePageUrl(url);
    openApp("chrome", { maximized });
  };

  const runCommand = () => {
    const command = cmdInput.trim().toLowerCase();
    if (!command) return;
    if (command === "clear" || command === "cls") {
      setCmdLines([]);
    } else if (command === "help") {
      setCmdLines((current) => [...current, `C:\\Users\\dqtx> ${cmdInput}`, "可用命令：help、about、works、resume、date、clear"]);
    } else if (command === "about") {
      setCmdLines((current) => [...current, `C:\\Users\\dqtx> ${cmdInput}`, "正在打开个人画布…"]);
      changeTab("about");
    } else if (command === "works") {
      setCmdLines((current) => [...current, `C:\\Users\\dqtx> ${cmdInput}`, "正在打开作品集…"]);
      changeTab("work");
    } else if (command === "resume") {
      setCmdLines((current) => [...current, `C:\\Users\\dqtx> ${cmdInput}`, "正在打开个人简历…"]);
      window.open("https://ai.dqtx.cc/", "_blank", "noopener,noreferrer");
    } else if (command === "date") {
      setCmdLines((current) => [...current, `C:\\Users\\dqtx> ${cmdInput}`, new Date().toLocaleString("zh-CN")]);
    } else {
      setCmdLines((current) => [...current, `C:\\Users\\dqtx> ${cmdInput}`, `“${cmdInput}” 不是可识别的命令。`]);
    }
    setCmdInput("");
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

  const handleCanvasWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 2) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    const nextZoom = Math.min(1.15, Math.max(0.6, zoom - event.deltaY * 0.0007));
    const ratio = nextZoom / zoom;
    setPan({
      x: pointerX - (pointerX - pan.x) * ratio,
      y: pointerY - (pointerY - pan.y) * ratio,
    });
    setZoom(nextZoom);
  };

  return (
    <main className={`site-shell tab-${tab}`}>
      {tab === "home" && <div className="win11-wallpaper" aria-hidden="true" />}

      {tab === "about" && <header className="menu-bar">
        <button className="brand" onClick={() => changeTab("home")}>dqtx OS</button>
        <button onClick={() => changeTab("about")}>About</button>
        <button onClick={() => changeTab("work")}>Works</button>
        <a href="mailto:sphinx308@proton.me">Contact</a>
        <time>{time}</time>
      </header>}

      {tab === "home" && (
        <section className="desktop-page windows-desktop page-enter" aria-label="Windows 11 风格主页桌面">
          {!desktopLaunched && !isLocked && (
            <div className={`launch-screen ${isLaunching ? "is-launching" : ""}`} onClick={launchDesktop} role="button" tabIndex={0} aria-label="进入 dqtx OS 桌面">
              <div className="launch-laptop" aria-hidden="true">
                <div className="launch-screen-panel">
                  <div className="launch-dots"><i /><i /><i /></div>
                  <p><b>$</b> whoami</p>
                  <p>&gt; 大强同学</p>
                  <p><b>$</b> cat about.md</p>
                  <p>&gt; AI 工具 / Obsidian / Agent 工作流</p>
                  <p><b>$</b> echo "1 person + AI = 1 team"</p>
                  <p><mark>&gt; 1 person + AI = 1 team</mark></p>
                  <p><b>$</b> open dqtx-os.app</p>
                  {isLaunching && <div className="launch-progress" aria-label="正在启动"><span>&gt; launching...</span><b><i /></b><em>100%</em></div>}
                </div>
                <div className="launch-base" />
              </div>
              {!isLaunching && <>
                <div className="launch-hint">Press Enter to Launch <span>↓</span></div>
                <nav className="launch-nav" aria-label="启动页导航">
                  <button className="active" onClick={(event) => { event.stopPropagation(); }}> <small>01</small>主页</button>
                  <button onClick={(event) => { event.stopPropagation(); changeTab("work"); }}><small>02</small>作品集</button>
                  <button onClick={(event) => { event.stopPropagation(); changeTab("about"); }}><small>03</small>关于我</button>
                </nav>
              </>}
            </div>
          )}

          {isLocked && !desktopLaunched && (
            <section className="lock-screen" aria-label="DQTX OS 锁屏界面">
              <div className="lock-screen-content">
                <time>{time}</time>
                <img src={profileImage} alt="大强同学" />
                <strong>大强同学</strong>
                <span>DQTX OS 已锁定</span>
                <button onClick={unlockDesktop}>确定进入桌面</button>
              </div>
            </section>
          )}

          <div className="desktop-icons">
            {desktopApps.map((app) => (
              <button className="desktop-app-icon" onClick={() => openApp(app.id, { maximized: app.id === "chrome" })} key={app.id}>
                {renderIcon(app.icon, app.iconClass)}
                <small>{app.label}</small>
              </button>
            ))}
            {shortcuts.map((item) => (
              <button className="desktop-app-icon" onClick={() => openInChrome(item.url, item.maximizeOnOpen)} key={item.label}>
                {renderIcon(item.icon, item.iconClass)}
                <small>{item.label}</small>
              </button>
            ))}
          </div>

          {openApps.filter((app) => !minimizedApps.includes(app)).map((app, index) => (
            <div
              className={`desktop-window window-${app} ${maximizedApps.includes(app) ? "maximized" : ""}`}
              style={{ left: windowPositions[app].x, top: windowPositions[app].y, zIndex: 50 + index }}
              onMouseDown={() => setOpenApps((current) => [...current.filter((item) => item !== app), app])}
              key={app}
            >
              <div
                className="desktop-window-titlebar"
                onPointerDown={(event) => handleWindowPointerDown(event, app)}
                onPointerMove={(event) => handleWindowPointerMove(event, app)}
                onPointerUp={() => setWindowDrag(null)}
                onPointerCancel={() => setWindowDrag(null)}
              >
                <span>{desktopApps.find((item) => item.id === app)?.label}</span>
                <div>
                  <button aria-label="最小化" onPointerDown={(event) => event.stopPropagation()} onClick={() => minimizeApp(app)}>—</button>
                  <button aria-label={maximizedApps.includes(app) ? "还原" : "最大化"} onPointerDown={(event) => event.stopPropagation()} onClick={() => toggleMaximizeApp(app)}>{maximizedApps.includes(app) ? "❐" : "□"}</button>
                  <button aria-label="关闭" onPointerDown={(event) => event.stopPropagation()} onClick={() => closeApp(app)}>×</button>
                </div>
              </div>

              {app === "computer" && (
                <div className="computer-window">
                  <div className="explorer-sidebar"><b>主页</b><span>桌面</span><span>文档</span><span>图片</span><span>下载</span></div>
                  <div className="explorer-main">
                    <h2>此电脑</h2>
                    <p>常用位置</p>
                    <div className="explorer-grid">
                      <button onClick={() => openInChrome("https://ai.dqtx.cc/", true)}><span>📄</span><b>个人简历</b><small>ai.dqtx.cc</small></button>
                      <button onClick={() => openInChrome("https://dqtx.cc", true)}><span>🌐</span><b>个人博客</b><small>dqtx.cc</small></button>
                      <button onClick={() => openInChrome("https://app.dqtx.cc")}><span>⚙️</span><b>数字工坊</b><small>app.dqtx.cc</small></button>
                      <button onClick={() => openInChrome("https://742112.xyz")}><span>🛠️</span><b>远程服务</b><small>742112.xyz</small></button>
                    </div>
                    <p>设备和驱动器</p>
                    <div className="drive"><span>💽</span><div><b>本地磁盘 (C:)</b><i><em /></i><small>128 GB 可用，共 256 GB</small></div></div>
                  </div>
                </div>
              )}

              {app === "chrome" && (
                <div className="chrome-window">
                  <form onSubmit={(event) => { event.preventDefault(); openChromeUrl(); }}>
                    <button type="button" aria-label="返回" disabled>←</button><button type="button" aria-label="前进" disabled>→</button>
                    <input value={chromeUrl} onChange={(event) => setChromeUrl(event.target.value)} placeholder="在 Google 中搜索，或输入网址" aria-label="搜索或输入网址" />
                    <button type="submit">前往</button>
                  </form>
                  <iframe className="chrome-frame" src={chromePageUrl} title="Chrome 浏览内容" />
                </div>
              )}

              {app === "cmd" && (
                <div className="cmd-window">
                  {cmdLines.map((line, lineIndex) => <p key={lineIndex}>{line || "\u00a0"}</p>)}
                  <label>C:\Users\dqtx&gt; <input autoFocus value={cmdInput} onChange={(event) => setCmdInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") runCommand(); }} /></label>
                </div>
              )}

              {app === "notepad" && (
                <div className="notepad-window">
                  <div>文件　编辑　查看</div>
                  <textarea value={notepadText} onChange={(event) => setNotepadText(event.target.value)} aria-label="记事本内容" />
                </div>
              )}

              {app === "tools" && (
                <section className="catalog-window">
                  <header><span>效率工具</span><small>我的常用软件清单</small></header>
                  <ol>{efficiencyTools.map((tool) => (
                    <li key={tool.note}>
                      <span>{tool.links.map((link, index) => <button key={link.name} onClick={() => openInChrome(link.url, true)}>{index ? " / " : ""}{link.name}</button>)}</span>
                      <small>— {tool.note}</small>
                    </li>
                  ))}</ol>
                </section>
              )}

              {app === "agent" && (
                <section className="catalog-window agent-window">
                  <header><span>Ai Agent</span><small>开发与智能体工具入口</small></header>
                  <div className="agent-list">
                    {agentTools.map((tool) => (
                      <article key={tool.name}>
                        <b>{tool.name}</b>
                        <div>{tool.links.map((url) => <button key={url} onClick={() => openInChrome(url, true)}>{new URL(url).hostname}</button>)}</div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ))}

          {startOpen && (
            <div className="start-menu">
              <div className="start-search">🔎 在此键入以搜索</div>
              <h3>已固定</h3>
              <div className="start-apps">
                {desktopApps.map((app) => <button onClick={() => openApp(app.id)} key={app.id}>{renderIcon(app.icon, app.iconClass)}{app.label}</button>)}
                {shortcuts.map((item) => <button onClick={() => openInChrome(item.url, item.maximizeOnOpen)} key={item.label}>{renderIcon(item.icon, item.iconClass)}{item.label}</button>)}
                <button onClick={() => changeTab("work")}><span>🗂️</span>作品集</button>
                <button onClick={() => changeTab("about")}><span>🧠</span>个人画布</button>
              </div>
              <div className="start-user"><img src={profileImage} alt="" /><b>大强同学</b><button title="关机并锁屏" aria-label="关机并锁屏" onClick={lockDesktop}>⏻</button></div>
            </div>
          )}

          <div className="windows-taskbar">
            <div className="taskbar-apps">
              <button className="windows-start" onClick={() => setStartOpen((current) => !current)} aria-label="开始菜单"><i /><i /><i /><i /></button>
              <button className="taskbar-icon-only taskbar-works" onClick={() => changeTab("work")} title="作品集" aria-label="作品集">▦</button>
              <button className="taskbar-icon-only taskbar-canvas" onClick={() => changeTab("about")} title="个人画布" aria-label="个人画布">✦</button>
            </div>
            <div className="taskbar-status"><span>⌃　⌁　🔊</span><time>{time}</time></div>
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
            onWheel={handleCanvasWheel}
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

              <article className={`canvas-card identity-card ${selectedCard === "identity" ? "selected" : ""}`} data-card="identity" style={{ left: cardPositions.identity.x, top: cardPositions.identity.y }}>
                <div className="card-grip" data-drag-handle>PROFILE.MD <span>⠿</span></div>
                <div className="profile-intro">
                  <img className="profile-photo" src={profileImage} alt="大强同学" />
                  <div>
                    <h2>大强同学</h2>
                    <p>AI 工具 · Obsidian · 个人网站 · Agent 工作流</p>
                    <b>Build in Public</b>
                  </div>
                </div>
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

      {tab !== "home" && <nav className="pill-nav" aria-label="页面导航">
        <button className={tab === "home" ? "active" : ""} onClick={() => changeTab("home")}><small>01</small>主页</button>
        <button className={tab === "work" ? "active" : ""} onClick={() => changeTab("work")}><small>02</small>作品集</button>
        <button className={tab === "about" ? "active" : ""} onClick={() => changeTab("about")}><small>03</small>关于我</button>
      </nav>}

    </main>
  );
}
