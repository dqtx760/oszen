import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the dqtx OS launch screen", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>大强同学 · 1 Person \+ AI = 1 Team<\/title>/);
  assert.match(html, /进入 dqtx OS 桌面/);
  assert.match(html, /<button type="button" class="launch-hint">Press Enter to Launch/);
  assert.doesNotMatch(html, /launching\.\.\./);
  assert.match(html, /Windows 11 风格主页桌面/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("keeps startup short and defers non-critical images", async () => {
  const [page, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /dqtx-os-visited/);
  assert.match(page, /const \[isLaunching, setIsLaunching\] = useState\(false\)/);
  assert.match(page, /onClick=\{\(\) => launchDesktop\(false\)\}/);
  assert.doesNotMatch(page, /setTimeout\(\(\) => setIsLaunching\(true\), 3500\)/);
  assert.match(page, /icon: "\/icons\/chrome-cyber\.png"/);
  assert.match(page, /icon: "\/icons\/github-cyber\.svg"[^\n]*iconClass: "image-logo github-icon"/);
  assert.match(page, /label: "个人博客"[^\n]*maximizeOnOpen: false/);
  assert.match(page, /label: "个人简历"[^\n]*maximizeOnOpen: false/);
  assert.match(page, /label: "Codex APP指南\.md"[^\n]*maximizeOnOpen: false/);
  assert.match(page, /label: "Obsidian模板\.md"[^\n]*maximizeOnOpen: false/);
  assert.match(page, /label: "远程服务", url: "https:\/\/fix\.dqtx\.cc\/"/);
  assert.doesNotMatch(page, /openApp\(app\.id, \{ maximized: app\.id === "chrome" \}\)/);
  assert.match(page, /name: "Hermes"[^\n]*links: \["https:\/\/hermes-agent\.nousresearch\.com\/"\]/);
  assert.match(page, /name: "Cindy"[^\n]*links: \["https:\/\/github\.com\/makecindy\/cindy"\]/);
  assert.match(page, /name: "Minis"[^\n]*links: \["https:\/\/github\.com\/OpenMinis\/AwesomeMinis"\]/);
  assert.match(page, /name: "Claudian", icon: ""[^\n]*links: \["https:\/\/github\.com\/YishenTu\/claudian"\]/);
  assert.match(page, /name: "CC Switch", icon: ""[^\n]*links: \["https:\/\/ccswitch\.io\/zh\/"\]/);
  assert.match(page, /name: "opencodex", icon: ""[^\n]*links: \["https:\/\/github\.com\/lidge-jun\/opencodex"\]/);
  assert.match(page, /name: "Orca \/ AionUi\/ccgui"[^\n]*https:\/\/github\.com\/zhukunpenglinyutong\/desktop-cc-gui/);
  assert.match(page, /note: "OpenAI 官方桌面编程智能体"/);
  assert.match(page, /className=\{tool\.icon \? "" : "agent-tool-no-icon"\}/);
  assert.match(page, /featuredProject, setFeaturedProject/);
  assert.match(page, /useState\(projects\[3\]\)/);
  assert.match(page, /className="works-console"/);
  assert.match(page, /tab === "home" && <div className=\{`win11-wallpaper/);
  assert.match(page, /setTimeout\(\(\) => setIsBootExiting\(true\), 3000\)/);
  assert.match(page, /if \(!isLaunching \|\| tab !== "home"\) return;/);
  assert.match(page, /playDesktopStartupSound\(\)/);
  assert.match(page, /fetch\("\/windows-startup\.mp3"\)/);
  assert.match(page, /\}, 3240\)/);
  assert.match(page, /\}, 4000\)/);
  assert.match(page, /\{!desktopLaunched && !isLocked && \(/);
  assert.match(page, /loading="lazy" decoding="async"/);
  assert.doesNotMatch(css, /launchScreenExit/);
  assert.match(css, /is-exiting \.launch-laptop \{ animation: launchLaptopRecede \.22s/);
  assert.match(css, /bootProgress 3s/);
  assert.match(css, /desktopArrive \.7s/);
  assert.match(css, /background: #020202 linear-gradient\(#0000001f, #0000001f\), url\("\/desktop-wallpaper-hacker\.webp"\)/);
  assert.match(css, /\.image-logo img \{[^}]*filter: none;/);
  assert.match(css, /\.image-logo\.github-icon img \{[^}]*width: 64px;[^}]*height: 64px;[^}]*filter: none;/);
  assert.match(css, /\.image-logo\.chrome-icon \{[^}]*box-shadow: none;/);
  assert.doesNotMatch(css, /\.image-logo img \{[^}]*drop-shadow/);
  assert.match(css, /desktopBackgroundArrive \{ from \{ opacity: 1/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /--ease-out-expo/);
  assert.match(layout, /大强同学/);
  assert.match(packageJson, /"test":/);
});
