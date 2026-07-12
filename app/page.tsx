"use client";

import { useEffect, useRef, useState } from "react";

type Tab = "home" | "work" | "about";
type CardId = "identity" | "timeline" | "story" | "skills" | "service";
type DesktopApp = "computer" | "chrome" | "cmd" | "notepad" | "tools" | "agent";
type ComputerView = "home" | "photo" | "toolbox";
type ScreenWakeLock = { release: () => Promise<void>; addEventListener: (type: "release", listener: () => void) => void };
type CmdOutputKind = "text" | "muted" | "accent" | "success" | "warning" | "command" | "qr";
type CmdOutput = { kind: CmdOutputKind; text: string; command?: string };
type CommandDefinition = {
  name: string;
  aliases: string[];
  description: string;
  group: "了解我" | "看服务" | "打开内容" | "系统命令";
  handler: () => CmdOutput[];
};
type CanvasTemplate = "text" | "quote" | "image" | "sticky" | "dark" | "link";
type CustomCanvasCard = { id: string; template: CanvasTemplate; label: string; imageSrc?: string; url?: string };
type CanvasConnection = { id: string; from: string; to: string };

const canvasTemplateOptions: { id: CanvasTemplate; icon: string; label: string }[] = [
  { id: "text", icon: "📝", label: "文字卡" },
  { id: "quote", icon: "💬", label: "引用卡" },
  { id: "image", icon: "🖼", label: "图片卡" },
  { id: "sticky", icon: "📌", label: "便利贴" },
  { id: "dark", icon: "🌙", label: "深色卡" },
  { id: "link", icon: "🔗", label: "链接卡" },
];

const createCmdWelcome = (): CmdOutput[] => [
  { kind: "muted", text: "Microsoft Windows [Version 11.0.2026]" },
  { kind: "muted", text: "(c) DQTX OS. All rights reserved." },
  { kind: "text", text: "" },
  { kind: "success", text: "DQTX OS Terminal 已启动" },
  { kind: "text", text: "输入 help 查看命令，输入 services 查看我能帮你什么。" },
];

const initialCardPositions: Record<CardId, { x: number; y: number }> = {
  identity: { x: 120, y: 115 },
  timeline: { x: 675, y: 130 },
  story: { x: 155, y: 650 },
  skills: { x: 1085, y: 135 },
  service: { x: 1070, y: 395 },
};

const canvasLayers: { id: CardId; label: string; color: string }[] = [
  { id: "identity", label: "个人信息", color: "yellow" },
  { id: "timeline", label: "经历时间线", color: "blue" },
  { id: "story", label: "核心叙事", color: "yellow" },
  { id: "skills", label: "技能标签", color: "blue" },
  { id: "service", label: "商业服务", color: "yellow" },
];

const canvasConnectors: { from: CardId; to: CardId; fromOffset: [number, number]; toOffset: [number, number]; color: string }[] = [
  { from: "identity", to: "timeline", fromOffset: [390, 140], toOffset: [0, 170], color: "#8bb2e6" },
  { from: "identity", to: "story", fromOffset: [230, 500], toOffset: [210, 0], color: "#f2c93d" },
  { from: "timeline", to: "service", fromOffset: [360, 170], toOffset: [0, 180], color: "#8bb2e6" },
];

const profileImage = "/profile.png";

const profilePhotos = [
  { src: "/photos/portrait-formal.png", label: "大强同学（Derek Zhao）" },
  { src: "/photos/portrait-studio.png", label: "大强同学（Derek Zhao）" },
  { src: "/photos/portrait-editorial.png", label: "Silhouette 2026" },
  { src: "/photos/portrait-night.png", label: "夜谈时刻" },
];

const shortcuts = [
  { icon: "/icons/web.png", label: "个人博客", url: "https://dqtx.cc", kind: "folder", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/files.png", label: "个人简历", url: "https://ai.dqtx.cc/", kind: "file", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/agent.png", label: "数字工坊", url: "https://app.dqtx.cc", kind: "folder", iconClass: "image-logo" },
  { icon: "/icons/remote.png", label: "远程服务", url: "https://742112.xyz", kind: "file", iconClass: "image-logo" },
  { icon: "/icons/star.png", label: "大强导航", url: "https://123.dqtx.cc", kind: "folder", iconClass: "image-logo" },
  { icon: "/icons/github.png", label: "GitHub", url: "https://github.com/dqtx760", kind: "file", iconClass: "image-logo" },
  { icon: "/icons/x.png", label: "推特/X", url: "https://x.com/dqtx760", kind: "file", iconClass: "image-logo" },
  { icon: "/icons/files.png", label: "Codex APP指南.md", url: "https://mp.weixin.qq.com/s/F3HS6BUfTDP0h3rFipoJhA", kind: "file", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/files.png", label: "Obsidian模板.md", url: "https://mp.weixin.qq.com/s/5LkcBS6TvwXEGxIMiA-1jQ", kind: "file", iconClass: "image-logo", maximizeOnOpen: true },
  { icon: "/icons/package.png", label: "SetProxy.bat", url: "https://lz.qaiu.top/parser?url=https://wwbxq.lanzouq.com/iILcv3tj3web", kind: "file", iconClass: "image-logo", download: true },
];

const desktopApps: { id: DesktopApp; icon: string; label: string; iconClass: string }[] = [
  { id: "computer", icon: "/icons/computer.png", label: "计算机", iconClass: "image-logo" },
  { id: "chrome", icon: "/icons/chrome.png", label: "Chrome", iconClass: "image-logo" },
  { id: "cmd", icon: "/icons/cmd.png", label: "Cmd", iconClass: "image-logo" },
  { id: "notepad", icon: "/icons/files.png", label: "记事本", iconClass: "image-logo" },
  { id: "tools", icon: "/icons/drive.png", label: "效率工具", iconClass: "image-logo" },
  { id: "agent", icon: "/icons/agent.png", label: "Ai Agent", iconClass: "image-logo" },
];

const toolboxItems: { label: string; note: string; icon: string; url?: string; app?: DesktopApp }[] = [
  { label: "Obsidian 模板", note: "打开模板文章", icon: "📄", url: "https://mp.weixin.qq.com/s/5LkcBS6TvwXEGxIMiA-1jQ" },
  { label: "Codex APP 指南", note: "打开使用指南", icon: "📘", url: "https://mp.weixin.qq.com/s/F3HS6BUfTDP0h3rFipoJhA" },
  { label: "效率工具", note: "查看常用软件清单", icon: "🧰", app: "tools" },
  { label: "AI Agent", note: "打开智能体工具入口", icon: "✦", app: "agent" },
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
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }>>(initialCardPositions);
  const [selectedCard, setSelectedCard] = useState<string>("identity");
  const [deletedCanvasCards, setDeletedCanvasCards] = useState<Set<CardId>>(new Set());
  const [customCanvasCards, setCustomCanvasCards] = useState<CustomCanvasCard[]>([]);
  const [showCardTemplates, setShowCardTemplates] = useState(false);
  const [canvasConnections, setCanvasConnections] = useState<CanvasConnection[]>([]);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [canvasCardSizes, setCanvasCardSizes] = useState<Record<string, { width: number; height: number }>>({});
  const [interaction, setInteraction] = useState<{
    type: "pan" | "card";
    cardId?: string;
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
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [visitChecked, setVisitChecked] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(false);
  const [keepScreenSeconds, setKeepScreenSeconds] = useState(0);
  const wakeLockRef = useRef<ScreenWakeLock | null>(null);
  const [chromeUrl, setChromeUrl] = useState("");
  const [chromePageUrl, setChromePageUrl] = useState("https://www.google.com/webhp?igu=1");
  const [notepadText, setNotepadText] = useState(`致每一位来到这里的朋友：

欢迎你来到这个网站。

当你看到这个网站的时候，你已经超越了 99% 以上的人。不是因为你点开了一个页面，而是因为你愿意停下来，主动理解 AI 正在如何改变工作、创作与生活。

我是大强同学，一人公司创业者，也是一名长期在一线做 AI 工具、Obsidian 知识库、个人网站和 Agent 工作流的人。我更关心的不是把工具装上，而是让它们真正进入你的日常工作，帮你节省时间、沉淀能力、把想法变成可以持续迭代的成果。

AI 的变化很快，但真正稀缺的从来不是某个模型或某个提示词，而是把新能力连接到真实问题上的判断力。未来的竞争，不是谁知道得更多，而是谁能更早地建立自己的工作流，并不断把它用得更深。

这里会持续记录我正在实践的工具、方法和经验。希望它能成为你探索 AI 的一个可靠起点；也希望有一天，我们能一起把更多想法做成作品。

愿你始终保持好奇，也保持行动。

大强同学`);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdOutput, setCmdOutput] = useState<CmdOutput[]>(createCmdWelcome);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState(-1);
  const cmdOutputRef = useRef<HTMLDivElement>(null);
  const [computerView, setComputerView] = useState<ComputerView>("home");
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; label: string } | null>(null);
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

  useEffect(() => {
    const output = cmdOutputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [cmdOutput]);

  const getWindowPosition = (app: DesktopApp) => {
    if (app === "computer" || app === "cmd" || app === "notepad" || app === "tools" || app === "agent") {
      const width = Math.min(app === "cmd" ? 980 : 840, window.innerWidth - 40);
      const height = Math.min(app === "cmd" ? 580 : 560, window.innerHeight - 100);
      return { x: Math.max(12, Math.round((window.innerWidth - width) / 2)), y: Math.max(12, Math.round((window.innerHeight - height) / 2) - 20) };
    }
    return { x: Math.min(280, Math.max(218, Math.round(window.innerWidth * 0.14))), y: 52 };
  };

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
    setHasVisited(window.localStorage.getItem("dqtx-os-visited") === "1");
    setVisitChecked(true);
  }, []);

  useEffect(() => {
    if (tab !== "home" || desktopLaunched || isLaunching) return;
    const launchOnEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (isLocked) unlockDesktop();
        else launchDesktop(false);
      }
    };
    window.addEventListener("keydown", launchOnEnter);
    return () => window.removeEventListener("keydown", launchOnEnter);
  }, [desktopLaunched, isLaunching, isLocked, tab]);

  useEffect(() => {
    if (!visitChecked || !hasVisited || tab !== "home" || desktopLaunched || isLocked || isLaunching) return;
    const autoStartTimer = window.setTimeout(() => setIsLaunching(true), 3350);
    return () => window.clearTimeout(autoStartTimer);
  }, [desktopLaunched, hasVisited, isLaunching, isLocked, tab, visitChecked]);

  useEffect(() => {
    if (!isLaunching) return;
    const desktopTransitionTimer = window.setTimeout(() => {
      setDesktopLaunched(true);
      setIsDesktopTransitioning(true);
    }, 1500);
    const autoCompleteTimer = window.setTimeout(() => {
      setIsLaunching(false);
      setIsDesktopTransitioning(false);
    }, 5700);
    return () => {
      window.clearTimeout(desktopTransitionTimer);
      window.clearTimeout(autoCompleteTimer);
    };
  }, [isLaunching]);

  useEffect(() => {
    if (!keepScreenOn) return;
    const sessionTimer = window.setInterval(() => setKeepScreenSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(sessionTimer);
  }, [keepScreenOn]);

  useEffect(() => () => {
    void wakeLockRef.current?.release();
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

  const launchDesktop = (immediate = false) => {
    if (desktopLaunched || isLocked) return;
    window.localStorage.setItem("dqtx-os-visited", "1");
    setHasVisited(true);
    if (immediate) {
      setIsLaunching(false);
      setIsDesktopTransitioning(false);
      setDesktopLaunched(true);
      return;
    }
    if (!isLaunching) setIsLaunching(true);
  };

  const unlockDesktop = () => {
    setIsLocked(false);
    setDesktopLaunched(true);
  };

  const toggleKeepScreenOn = async () => {
    if (keepScreenOn) {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
      setKeepScreenOn(false);
      return;
    }

    const wakeLock = (navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<ScreenWakeLock> } }).wakeLock;
    if (!wakeLock) return;
    const lock = await wakeLock.request("screen");
    wakeLockRef.current = lock;
    setKeepScreenSeconds(0);
    setKeepScreenOn(true);
    lock.addEventListener("release", () => setKeepScreenOn(false));
  };

  const lockDesktop = () => {
    setStartOpen(false);
    setOpenApps([]);
    setMinimizedApps([]);
    setMaximizedApps([]);
    setDesktopLaunched(false);
    setIsDesktopTransitioning(false);
    setIsLocked(true);
  };

  const openApp = (app: DesktopApp, options?: { maximized?: boolean }) => {
    setStartOpen(false);
    if (app === "computer") setComputerView("home");
    setWindowPositions((current) => ({ ...current, [app]: getWindowPosition(app) }));
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

  const downloadFile = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const openShortcut = (item: (typeof shortcuts)[number]) => {
    if (item.download) {
      downloadFile(item.url);
      return;
    }
    openInChrome(item.url, item.maximizeOnOpen);
  };

  const commandDefinitions: CommandDefinition[] = [
    {
      name: "help", aliases: [], description: "查看全部命令", group: "系统命令",
      handler: () => {
        const groups: CommandDefinition["group"][] = ["了解我", "看服务", "打开内容", "系统命令"];
        return groups.flatMap((group) => [
          { kind: "accent" as const, text: `— ${group} —` },
          ...commandDefinitions.filter((item) => item.group === group).map((item) => ({
            kind: "command" as const,
            text: `${item.name}${item.aliases.length ? ` / ${item.aliases.join(" / ")}` : ""} — ${item.description}`,
            command: item.name,
          })),
        ]);
      },
    },
    {
      name: "whoami", aliases: ["about"], description: "了解大强同学", group: "了解我",
      handler: () => [
        { kind: "success", text: "大强同学 · 一人公司创业者" },
        { kind: "text", text: "我做 AI 工具、Obsidian、个人网站和 Agent 工作流落地。" },
        { kind: "text", text: "目标不是把工具装上，而是让它真正进入你的工作，持续创造结果。" },
        { kind: "command", text: "services — 看看我能提供什么服务", command: "services" },
      ],
    },
    {
      name: "services", aliases: ["price"], description: "查看服务与价格", group: "看服务",
      handler: () => [
        { kind: "success", text: "我能帮你把 AI、知识库和工作流真正用起来：" },
        { kind: "text", text: "技术咨询 50/小时 · Codex App 安装修复 50 · Claude Code 配置 99" },
        { kind: "text", text: "Obsidian 模板指导 99～399 · 个人笔记网站 300 · 个人简历网站 168" },
        { kind: "text", text: "Agent Skill 定制 50～300 · 年度技术顾问 6800/年" },
        { kind: "command", text: "contact — 获取方案或咨询服务", command: "contact" },
      ],
    },
    {
      name: "contact", aliases: ["wechat"], description: "获取密码或咨询服务", group: "看服务",
      handler: () => [
        { kind: "success", text: "加微信 dqtx33 获取咨询" },
        { kind: "muted", text: "添加时可备注：来自 DQTX OS。" },
        { kind: "qr", text: "个人微信二维码" },
      ],
    },
    {
      name: "works", aliases: [], description: "切换到作品集", group: "打开内容",
      handler: () => {
        changeTab("work");
        return [{ kind: "success", text: "正在切换到作品集…" }];
      },
    },
    {
      name: "canvas", aliases: ["aboutme"], description: "打开个人画布", group: "打开内容",
      handler: () => {
        changeTab("about");
        return [{ kind: "success", text: "正在打开个人画布…" }];
      },
    },
    {
      name: "resume", aliases: [], description: "在 Chrome 打开个人简历", group: "打开内容",
      handler: () => {
        openInChrome("https://ai.dqtx.cc/", true);
        return [{ kind: "success", text: "正在打开个人简历…" }];
      },
    },
    {
      name: "blog", aliases: [], description: "在 Chrome 打开个人博客", group: "打开内容",
      handler: () => {
        openInChrome("https://dqtx.cc", true);
        return [{ kind: "success", text: "正在打开个人博客…" }];
      },
    },
    {
      name: "tools", aliases: [], description: "打开效率工具", group: "打开内容",
      handler: () => {
        openApp("tools");
        return [{ kind: "success", text: "正在打开效率工具…" }];
      },
    },
    {
      name: "agent", aliases: [], description: "打开 AI Agent 工具", group: "打开内容",
      handler: () => {
        openApp("agent");
        return [{ kind: "success", text: "正在打开 AI Agent…" }];
      },
    },
    {
      name: "github", aliases: [], description: "在 Chrome 打开 GitHub", group: "打开内容",
      handler: () => {
        openInChrome("https://github.com/dqtx760");
        return [{ kind: "success", text: "正在打开 GitHub…" }];
      },
    },
    {
      name: "x", aliases: ["twitter"], description: "在 Chrome 打开推特/X", group: "打开内容",
      handler: () => {
        openInChrome("https://x.com/dqtx760");
        return [{ kind: "success", text: "正在打开推特/X…" }];
      },
    },
    {
      name: "date", aliases: [], description: "显示当前时间", group: "系统命令",
      handler: () => [{ kind: "text", text: new Date().toLocaleString("zh-CN") }],
    },
    {
      name: "clear", aliases: ["cls"], description: "清空终端输出", group: "系统命令",
      handler: () => createCmdWelcome(),
    },
  ];

  const commandDistance = (left: string, right: string) => {
    const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);
    for (let column = 0; column <= right.length; column += 1) rows[0][column] = column;
    for (let row = 1; row <= left.length; row += 1) {
      for (let column = 1; column <= right.length; column += 1) {
        rows[row][column] = left[row - 1] === right[column - 1]
          ? rows[row - 1][column - 1]
          : Math.min(rows[row - 1][column] + 1, rows[row][column - 1] + 1, rows[row - 1][column - 1] + 1);
      }
    }
    return rows[left.length][right.length];
  };

  const executeCommand = (rawCommand = cmdInput, recordHistory = true) => {
    const command = rawCommand.trim().toLowerCase();
    if (!command) return;
    const definition = commandDefinitions.find((item) => item.name === command || item.aliases.includes(command));

    if (recordHistory) {
      setCmdHistory((current) => current[current.length - 1] === rawCommand ? current : [...current, rawCommand]);
    }
    setCmdHistoryIndex(-1);

    if (definition?.name === "clear") {
      setCmdOutput(definition.handler());
    } else if (definition) {
      setCmdOutput((current) => [
        ...current,
        { kind: "muted", text: `C:\\Users\\dqtx> ${rawCommand}` },
        ...definition.handler(),
      ]);
    } else {
      const names = commandDefinitions.flatMap((item) => [item.name, ...item.aliases]);
      const suggestion = names
        .map((name) => ({ name, distance: commandDistance(command, name) }))
        .sort((left, right) => left.distance - right.distance)[0];
      const suggestionLine = suggestion && suggestion.distance <= Math.max(2, Math.floor(command.length / 2))
        ? { kind: "command" as const, text: `你是不是想输入 ${suggestion.name}？`, command: suggestion.name }
        : { kind: "warning" as const, text: "输入 help 查看可用命令。" };
      setCmdOutput((current) => [
        ...current,
        { kind: "muted", text: `C:\\Users\\dqtx> ${rawCommand}` },
        { kind: "warning", text: `“${rawCommand}” 不是可识别的命令。` },
        suggestionLine,
      ]);
    }
    setCmdInput("");
  };

  const handleCmdKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      executeCommand();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setCmdInput("");
      setCmdHistoryIndex(-1);
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const query = cmdInput.trim().toLowerCase();
      if (!query) return;
      const match = commandDefinitions.flatMap((item) => [item.name, ...item.aliases]).find((item) => item.startsWith(query));
      if (match) setCmdInput(match);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!cmdHistory.length) return;
      const nextIndex = cmdHistoryIndex < 0 ? cmdHistory.length - 1 : Math.max(0, cmdHistoryIndex - 1);
      setCmdHistoryIndex(nextIndex);
      setCmdInput(cmdHistory[nextIndex]);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cmdHistoryIndex < 0) return;
      const nextIndex = cmdHistoryIndex + 1;
      if (nextIndex >= cmdHistory.length) {
        setCmdHistoryIndex(-1);
        setCmdInput("");
        return;
      }
      setCmdHistoryIndex(nextIndex);
      setCmdInput(cmdHistory[nextIndex]);
    }
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;

    const handle = target.closest<HTMLElement>("[data-drag-handle]");
    const card = handle?.closest<HTMLElement>("[data-card]");

    if (card) {
      const cardId = card.dataset.card as string;
      const position = cardPositions[cardId];
      if (!position) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setSelectedCard(cardId);
      setInteraction({
        type: "card",
        cardId,
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
      });
      return;
    }

    if (!target.closest(".canvas-card")) {
      event.currentTarget.setPointerCapture(event.pointerId);
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
        [interaction.cardId]: {
          x: interaction.originX + deltaX / zoom,
          y: interaction.originY + deltaY / zoom,
        },
      }));
    }
  };

  const focusCard = (cardId: string) => {
    const position = cardPositions[cardId];
    if (!position) return;
    setSelectedCard(cardId);
    setPan({ x: 300 - position.x * zoom, y: 150 - position.y * zoom });
  };

  const deleteCanvasCard = (cardId: string) => {
    if (canvasLayers.some((layer) => layer.id === cardId)) {
      setDeletedCanvasCards((current) => new Set(current).add(cardId as CardId));
    } else {
      setCustomCanvasCards((current) => current.filter((card) => card.id !== cardId));
    }
    setCanvasConnections((current) => current.filter((connection) => connection.from !== cardId && connection.to !== cardId));
    if (connectionSource === cardId) setConnectionSource(null);
    if (selectedCard === cardId) {
      const fallback = canvasLayers.find((layer) => layer.id !== cardId && !deletedCanvasCards.has(layer.id));
      setSelectedCard(fallback?.id ?? "");
    }
  };

  const addCanvasCard = (template: CanvasTemplate) => {
    const option = canvasTemplateOptions.find((item) => item.id === template)!;
    const id = `custom-${template}-${Date.now()}`;
    const offset = customCanvasCards.length * 28;
    setCustomCanvasCards((current) => [...current, {
      id,
      template,
      label: option.label,
      url: template === "link" ? "https://os.dqtx.cc/" : undefined,
    }]);
    setCardPositions((current) => ({ ...current, [id]: { x: 560 + offset, y: 430 + offset } }));
    setSelectedCard(id);
    setShowCardTemplates(false);
  };

  const updateCustomCanvasCard = (cardId: string, changes: Partial<CustomCanvasCard>) => {
    setCustomCanvasCards((current) => current.map((card) => card.id === cardId ? { ...card, ...changes } : card));
  };

  const readCanvasImage = (cardId: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => updateCustomCanvasCard(cardId, { imageSrc: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleCanvasImagePaste = (event: React.ClipboardEvent<HTMLDivElement>, cardId: string) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    const imageFile = imageItem?.getAsFile();
    if (imageFile) {
      event.preventDefault();
      readCanvasImage(cardId, imageFile);
      return;
    }
    const pastedUrl = event.clipboardData.getData("text").trim();
    if (/^https?:\/\//i.test(pastedUrl)) {
      event.preventDefault();
      updateCustomCanvasCard(cardId, { imageSrc: pastedUrl });
    }
  };

  const openCanvasLink = (url = "") => {
    const value = url.trim();
    if (!value) return;
    window.open(/^https?:\/\//i.test(value) ? value : `https://${value}`, "_blank", "noopener,noreferrer");
  };

  const connectCanvasCard = (cardId: string) => {
    if (!connectionSource) {
      setConnectionSource(cardId);
      return;
    }
    if (connectionSource === cardId) {
      setConnectionSource(null);
      return;
    }
    setCanvasConnections((current) => current.some((connection) => connection.from === connectionSource && connection.to === cardId)
      ? current
      : [...current, { id: `connection-${Date.now()}`, from: connectionSource, to: cardId }]);
    setConnectionSource(null);
  };

  const renderCanvasConnectionHandle = (cardId: string) => (
    <button
      className={`canvas-connection-handle ${connectionSource === cardId ? "active" : ""}`}
      onClick={() => connectCanvasCard(cardId)}
      title={connectionSource ? "连接到这张卡片" : "从这张卡片开始连线"}
      aria-label={connectionSource ? "完成卡片连线" : "开始卡片连线"}
    />
  );

  const syncCanvasCardSizes = () => {
    const sizes: Record<string, { width: number; height: number }> = {};
    document.querySelectorAll<HTMLElement>(".canvas-stage [data-card]").forEach((card) => {
      if (card.dataset.card) sizes[card.dataset.card] = { width: card.offsetWidth, height: card.offsetHeight };
    });
    setCanvasCardSizes(sizes);
  };

  const resetCanvas = () => {
    setCardPositions(initialCardPositions);
    setDeletedCanvasCards(new Set());
    setCustomCanvasCards([]);
    setCanvasConnections([]);
    setConnectionSource(null);
    setCanvasCardSizes({});
    setShowCardTemplates(false);
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
      {tab === "home" && (desktopLaunched || isLocked) && <div className={`win11-wallpaper ${isDesktopTransitioning ? "desktop-background-arriving" : ""}`} aria-hidden="true" />}

      {tab === "about" && <header className="menu-bar">
        <button className="brand" onClick={() => changeTab("home")}>dqtx OS</button>
        <button onClick={() => changeTab("about")}>About</button>
        <button onClick={() => changeTab("work")}>Works</button>
        <a href="mailto:sphinx308@proton.me">Contact</a>
        <time>{time}</time>
      </header>}

      {tab === "home" && (
        <section className="desktop-page windows-desktop" aria-label="Windows 11 风格主页桌面">
          {(!desktopLaunched || isDesktopTransitioning) && !isLocked && (
            <div className={`launch-screen ${isLaunching ? "is-launching" : ""} ${isDesktopTransitioning ? "is-exiting" : ""}`} aria-label="进入 dqtx OS 桌面">
              <div className="launch-laptop" aria-hidden="true">
                <div className="launch-screen-panel">
                  <div className="launch-dots"><i /><i /><i /></div>
                  <p className="launch-line"><b>$</b> whoami</p>
                  <p className="launch-line">&gt; 大强同学</p>
                  <p className="launch-line"><b>$</b> cat about.md</p>
                  <p className="launch-line">&gt; AI 工具 / Obsidian / Agent 工作流</p>
                  <p className="launch-line"><b>$</b> echo "1 person + AI = 1 team"</p>
                  <p className="launch-line"><mark>&gt; 1 person + AI = 1 team</mark></p>
                  <p className="launch-line"><b>$</b> open os.dqtx.cc</p>
                  {isLaunching && <div className="launch-progress" aria-label="正在启动"><span>&gt; launching...</span><b><i /></b><em>100%</em></div>}
                </div>
                <div className="launch-base" />
              </div>
              <div className={`launch-hint ${isLaunching ? "is-fading" : ""}`}>Press Enter to Launch <span>↓</span></div>
              <nav className="launch-nav" aria-label="启动页导航">
                <button className="active" onClick={(event) => { event.stopPropagation(); }}> <small>01</small>主页</button>
                <button onClick={(event) => { event.stopPropagation(); changeTab("work"); }}><small>02</small>作品集</button>
                <button onClick={(event) => { event.stopPropagation(); changeTab("about"); }}><small>03</small>关于我</button>
              </nav>
            </div>
          )}

          {isLocked && !desktopLaunched && (
            <section className="lock-screen" aria-label="DQTX OS 锁屏界面">
              <div className="matrix-rain" aria-hidden="true">
                {Array.from({ length: 22 }, (_, index) => <i key={index}>{index % 2 ? "01AI<>/{}" : "0101DQTX"}</i>)}
              </div>
              <div className="lock-screen-content">
                <time>{time}</time>
                <p className="lock-greeting"><i />晚上好，大强同学</p>
                <div className="lock-user">
                  <img src={profileImage} alt="大强同学" />
                  <strong>大强同学</strong>
                  <span>加微信 dqtx33 获取密码</span>
                </div>
                <div className="keep-screen-control">
                  <i className="lock-setting-icon" aria-hidden="true" />
                  <div><small>Screen Wake Lock</small><b>{keepScreenOn ? "防止锁屏已开启" : "防止锁屏"}</b></div>
                  <button className={keepScreenOn ? "active" : ""} onClick={toggleKeepScreenOn} aria-pressed={keepScreenOn} aria-label="防止锁屏"><i /></button>
                </div>
                <div className="keep-screen-timer"><span><i aria-hidden="true">◷</i>保持屏幕唤醒</span><b>{String(Math.floor(keepScreenSeconds / 3600)).padStart(2, "0")}:{String(Math.floor(keepScreenSeconds / 60) % 60).padStart(2, "0")}:{String(keepScreenSeconds % 60).padStart(2, "0")}</b></div>
                <button onClick={unlockDesktop}>确定进入桌面 <i aria-hidden="true">→</i></button>
              </div>
            </section>
          )}

          {desktopLaunched && <div className={`desktop-content ${isDesktopTransitioning ? "desktop-arriving" : ""}`}>
          <div className="desktop-icons">
            {desktopApps.filter((app) => app.id === "computer" || app.id === "chrome").map((app) => (
              <button className="desktop-app-icon" onClick={() => openApp(app.id, { maximized: app.id === "chrome" })} key={app.id}>
                {renderIcon(app.icon, app.iconClass)}
                <small>{app.label}</small>
              </button>
            ))}
            {shortcuts.filter((item) => item.label === "个人博客").map((item) => (
              <button className="desktop-app-icon" onClick={() => openShortcut(item)} key={item.label}>
                {renderIcon(item.icon, item.iconClass)}
                <small>{item.label}</small>
              </button>
            ))}
            {desktopApps.filter((app) => app.id === "cmd").map((app) => (
              <button className="desktop-app-icon" onClick={() => openApp(app.id)} key={app.id}>
                {renderIcon(app.icon, app.iconClass)}
                <small>{app.label}</small>
              </button>
            ))}
            {shortcuts.filter((item) => item.label === "GitHub" || item.label === "推特/X").map((item) => (
              <button className="desktop-app-icon" onClick={() => openShortcut(item)} key={item.label}>
                {renderIcon(item.icon, item.iconClass)}
                <small>{item.label}</small>
              </button>
            ))}
            {desktopApps.filter((app) => app.id !== "computer" && app.id !== "chrome" && app.id !== "cmd").map((app) => (
              <button className="desktop-app-icon" onClick={() => openApp(app.id)} key={app.id}>
                {renderIcon(app.icon, app.iconClass)}
                <small>{app.label}</small>
              </button>
            ))}
            {shortcuts.filter((item) => item.label !== "个人博客" && item.label !== "GitHub" && item.label !== "推特/X").map((item) => (
              <button className="desktop-app-icon" onClick={() => openShortcut(item)} key={item.label}>
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
                  <aside className="explorer-sidebar">
                    <b>计算机</b>
                    <button className={computerView === "photo" ? "active" : ""} onClick={() => setComputerView("photo")}>photo</button>
                    <button className={computerView === "toolbox" ? "active" : ""} onClick={() => setComputerView("toolbox")}>工具箱</button>
                  </aside>
                  <div className="explorer-main">
                    {computerView === "home" && <>
                      <h2>计算机</h2>
                      <p>常用分类</p>
                      <div className="explorer-grid">
                        <button onClick={() => setComputerView("photo")}><span>🖼️</span><b>photo</b><small>4 张个人照片</small></button>
                        <button onClick={() => setComputerView("toolbox")}><span>🧰</span><b>工具箱</b><small>桌面快捷方式</small></button>
                      </div>
                      <p>设备与驱动器</p>
                      <div className="drive"><span>💽</span><div><b>本地磁盘 (C:)</b><i><em /></i><small>128 GB 可用，共 256 GB</small></div></div>
                    </>}
                    {computerView === "photo" && <section className="computer-section">
                      <header><div><h2>photo</h2><p>关于大强同学的四个切面</p></div><small>4 个项目</small></header>
                      <div className="photo-grid">{profilePhotos.map((photo) => (
                        <button type="button" className="photo-card" key={photo.src} onClick={() => setSelectedPhoto(photo)}>
                          <img src={photo.src} alt={photo.label} />
                          <span>{photo.label}</span>
                        </button>
                      ))}</div>
                    </section>}
                    {computerView === "toolbox" && <section className="computer-section">
                      <header><div><h2>工具箱</h2><p>桌面快捷方式，一键进入对应内容</p></div><small>{toolboxItems.length} 个项目</small></header>
                      <div className="toolbox-grid">{toolboxItems.map((item) => <button key={item.label} onClick={() => { if (item.url) openInChrome(item.url, true); if (item.app) openApp(item.app); }}><span>{item.icon}</span><b>{item.label}</b><small>{item.note}</small><i>→</i></button>)}</div>
                    </section>}
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
                <div className="cmd-window" ref={cmdOutputRef}>
                  {cmdOutput.map((line, lineIndex) => line.kind === "command" ? (
                    <button className="cmd-command-button" key={`${line.text}-${lineIndex}`} type="button" onClick={() => executeCommand(line.command, false)}>{line.text}</button>
                  ) : line.kind === "qr" ? (
                    <figure className="cmd-qr" key={`${line.text}-${lineIndex}`}><img src="/wechat-qr.webp" alt="大强同学个人微信二维码" /><figcaption>{line.text}</figcaption></figure>
                  ) : (
                    <p className={`cmd-line cmd-line-${line.kind}`} key={`${line.text}-${lineIndex}`}>{line.text || "\u00a0"}</p>
                  ))}
                  <label>C:\Users\dqtx&gt; <input autoFocus value={cmdInput} onChange={(event) => setCmdInput(event.target.value)} onKeyDown={handleCmdKeyDown} aria-label="输入 CMD 命令" autoComplete="off" spellCheck={false} /></label>
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

          {selectedPhoto && (
            <button className="photo-lightbox" type="button" onClick={() => setSelectedPhoto(null)} aria-label="关闭图片预览">
              <span>
                <img src={selectedPhoto.src} alt={selectedPhoto.label} />
                <b>{selectedPhoto.label}</b>
              </span>
            </button>
          )}

          {startOpen && (
            <div className="start-menu" onMouseLeave={() => setStartOpen(false)}>
              <div className="start-search">🔎 在此键入以搜索</div>
              <h3>已固定</h3>
              <div className="start-apps">
                {desktopApps.map((app) => <button onClick={() => openApp(app.id)} key={app.id}>{renderIcon(app.icon, app.iconClass)}{app.label}</button>)}
                {shortcuts.map((item) => <button onClick={() => openShortcut(item)} key={item.label}>{renderIcon(item.icon, item.iconClass)}{item.label}</button>)}
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
          </div>}
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
              {canvasLayers.filter((layer) => !deletedCanvasCards.has(layer.id)).map((layer) => (
                <button className={selectedCard === layer.id ? "active" : ""} onClick={() => focusCard(layer.id)} key={layer.id}>
                  <i className={layer.color} />{layer.label}<small>◉</small>
                </button>
              ))}
              {customCanvasCards.map((card) => (
                <button className={selectedCard === card.id ? "active" : ""} onClick={() => focusCard(card.id)} key={card.id}>
                  <i className="blue" />{card.label}<small>◉</small>
                </button>
              ))}
            </div>
            <button className="new-layer" onClick={() => setShowCardTemplates(true)}>＋ 新建</button>
            <div className="mini-map" aria-hidden="true">
              <span>✦ Minimap</span>
              <div><i /><i /><i /><i /><i /></div>
            </div>
          </aside>

          {showCardTemplates && (
            <div className="canvas-template-backdrop" onMouseDown={() => setShowCardTemplates(false)}>
              <section className="canvas-template-picker" onMouseDown={(event) => event.stopPropagation()} aria-label="选择卡片模板">
                <header><h2>✦ 选择卡片模板</h2><button onClick={() => setShowCardTemplates(false)} aria-label="关闭">×</button></header>
                <div>{canvasTemplateOptions.map((option) => (
                  <button key={option.id} onClick={() => addCanvasCard(option.id)}><span>{option.icon}</span><b>{option.label}</b></button>
                ))}</div>
              </section>
            </div>
          )}

          <div
            className={`canvas-board ${interaction ? "is-dragging" : ""}`}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={() => { setInteraction(null); syncCanvasCardSizes(); }}
            onPointerCancel={() => setInteraction(null)}
            onWheel={handleCanvasWheel}
          >
            <div className="canvas-stage" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
              {canvasConnectors.filter((connector) => !deletedCanvasCards.has(connector.from) && !deletedCanvasCards.has(connector.to)).map((connector) => {
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
              {canvasConnections.map((connection) => {
                const from = cardPositions[connection.from];
                const to = cardPositions[connection.to];
                if (!from || !to) return null;
                const fromSize = canvasCardSizes[connection.from] ?? { width: 330, height: 220 };
                const toSize = canvasCardSizes[connection.to] ?? { width: 330, height: 220 };
                const x1 = from.x + fromSize.width;
                const y1 = from.y + fromSize.height / 2;
                const x2 = to.x;
                const y2 = to.y + toSize.height / 2;
                const width = Math.hypot(x2 - x1, y2 - y1);
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                return <button className="canvas-user-connector" key={connection.id} title="双击删除连线" onDoubleClick={() => setCanvasConnections((current) => current.filter((item) => item.id !== connection.id))} style={{ left: x1, top: y1, width, transform: `rotate(${angle}deg)` }} />;
              })}

              {!deletedCanvasCards.has("identity") && <article className={`canvas-card identity-card ${selectedCard === "identity" ? "selected" : ""}`} data-card="identity" style={{ left: cardPositions.identity.x, top: cardPositions.identity.y }}>
                <div className="card-grip" data-drag-handle>PROFILE / DEREK ZHAO <span>⠿ <button onClick={() => deleteCanvasCard("identity")} aria-label="删除个人信息卡">×</button></span></div>
                {renderCanvasConnectionHandle("identity")}
                <div className="profile-intro">
                  <img className="profile-photo" src={profileImage} alt="大强同学" />
                  <div>
                    <h2>大强同学</h2>
                    <p>92 年生 · 一人公司创业者</p>
                    <b>Build in Public 践行者</b>
                    <small>数字生产力玩家 · 工作流构建者</small>
                  </div>
                </div>
                <blockquote>1 person + AI = 1 team</blockquote>
                <p className="canvas-quote">我把 AI、知识库和个人网站连接成可持续迭代的工作流，让想法真正落地。</p>
              </article>}

              {!deletedCanvasCards.has("timeline") && <article className={`canvas-card timeline-card ${selectedCard === "timeline" ? "selected" : ""}`} data-card="timeline" style={{ left: cardPositions.timeline.x, top: cardPositions.timeline.y }}>
                <div className="card-grip" data-drag-handle>📍 经历时间线 <span>⠿ <button onClick={() => deleteCanvasCard("timeline")} aria-label="删除经历时间线卡">×</button></span></div>
                {renderCanvasConnectionHandle("timeline")}
                <div className="timeline-item"><b>NOW</b><strong>AI Coding Agent Skills</strong><small>让跨平台管理与工程化更简单</small></div>
                <div className="timeline-item"><b>2024 — 2026</b><strong>Build in Public</strong><small>持续构建 Vibe Coding 产品</small></div>
                <div className="timeline-item"><b>2023 — 2025</b><strong>Obsidian 工作流</strong><small>写作、Git 与多平台内容分发</small></div>
                <div className="timeline-item"><b>2019 — 现在</b><strong>远程技术服务</strong><small>把问题解决在一线</small></div>
              </article>}

              {!deletedCanvasCards.has("story") && <article className={`canvas-card story-card ${selectedCard === "story" ? "selected" : ""}`} data-card="story" style={{ left: cardPositions.story.x, top: cardPositions.story.y }}>
                <div className="card-grip" data-drag-handle>💡 核心叙事 <span>⠿ <button onClick={() => deleteCanvasCard("story")} aria-label="删除核心叙事卡">×</button></span></div>
                {renderCanvasConnectionHandle("story")}
                <p className="story-mark">〃</p>
                <h3>工具不是终点，<br />真正的价值是工作流。</h3>
                <p>从 AI 工具、Obsidian 知识库，到个人网站和 Agent 工作流，我关心的是方案能否持续使用、减少重复劳动，并让能力沉淀下来。</p>
                <em>CREATE → CONNECT → SHIP</em>
              </article>}

              {!deletedCanvasCards.has("skills") && <article className={`canvas-card skills-card ${selectedCard === "skills" ? "selected" : ""}`} data-card="skills" style={{ left: cardPositions.skills.x, top: cardPositions.skills.y }}>
                <div className="card-grip" data-drag-handle>⚡ SKILLS <span>⠿ <button onClick={() => deleteCanvasCard("skills")} aria-label="删除技能卡">×</button></span></div>
                {renderCanvasConnectionHandle("skills")}
                <div>{["AI Agent", "Obsidian", "Claude Skills", "Codex", "CLI", "自动化", "网站搭建", "内容分发"].map((skill) => <span key={skill}>{skill}</span>)}</div>
              </article>}

              {!deletedCanvasCards.has("service") && <article className={`canvas-card service-canvas-card ${selectedCard === "service" ? "selected" : ""}`} data-card="service" style={{ left: cardPositions.service.x, top: cardPositions.service.y }}>
                <div className="card-grip" data-drag-handle>WORK WITH ME <span>⠿ <button onClick={() => deleteCanvasCard("service")} aria-label="删除服务卡">×</button></span></div>
                {renderCanvasConnectionHandle("service")}
                <h3>从环境配置，<br />到长期技术顾问。</h3>
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
              </article>}

              {customCanvasCards.map((card) => (
                <article className={`canvas-card custom-canvas-card template-${card.template} ${selectedCard === card.id ? "selected" : ""}`} data-card={card.id} style={{ left: cardPositions[card.id]?.x ?? 560, top: cardPositions[card.id]?.y ?? 430 }} key={card.id}>
                  <div className="card-grip" data-drag-handle>{card.label.toUpperCase()} <span>⠿ <button onClick={() => deleteCanvasCard(card.id)} aria-label={`删除${card.label}`}>×</button></span></div>
                  {renderCanvasConnectionHandle(card.id)}
                  {card.template === "image" ? (
                    <div className="custom-card-content image-card-editor" onPaste={(event) => handleCanvasImagePaste(event, card.id)} tabIndex={0}>
                      <label className="custom-image-placeholder">
                        {card.imageSrc ? <img src={card.imageSrc} alt="用户添加的画布图片" /> : <><span>＋</span><small>选择本地图片<br />或粘贴网上图片</small></>}
                        <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) readCanvasImage(card.id, file); }} />
                      </label>
                      <p contentEditable suppressContentEditableWarning>图片说明</p>
                    </div>
                  ) : card.template === "link" ? (
                    <div className="custom-card-content link-card-editor">
                      <h3 contentEditable suppressContentEditableWarning>链接标题</h3>
                      <div className="custom-link-row"><input type="url" value={card.url ?? ""} onChange={(event) => updateCustomCanvasCard(card.id, { url: event.target.value })} aria-label="链接地址" /><button onClick={() => openCanvasLink(card.url)}>打开</button></div>
                    </div>
                  ) : (
                    <div className="custom-card-content" contentEditable suppressContentEditableWarning>
                      {card.template === "text" && <><h3>新的文字卡</h3><p>点击这里，输入你的内容。</p></>}
                      {card.template === "quote" && <blockquote>“记录一句值得反复阅读的话。”</blockquote>}
                      {card.template === "sticky" && <><h3>灵感便签</h3><p>写下此刻最重要的一件事。</p></>}
                      {card.template === "dark" && <><h3>深度思考</h3><p>把复杂问题留在这里慢慢拆解。</p></>}
                    </div>
                  )}
                </article>
              ))}

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
