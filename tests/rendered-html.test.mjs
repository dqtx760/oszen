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
  assert.match(html, /<button type="button" class="launch-hint[^\"]*">进入桌面/);
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
  assert.match(page, /onClick=\{\(\) => launchDesktop\(false\)\}/);
  assert.match(page, /setTimeout\(\(\) => setIsLaunching\(true\), 3500\)/);
  assert.match(page, /icon: "\/icons\/chrome-cyber\.png"/);
  assert.match(page, /featuredProject, setFeaturedProject/);
  assert.match(page, /useState\(projects\[3\]\)/);
  assert.match(page, /className="works-console"/);
  assert.match(page, /tab === "home" && <div className=\{`win11-wallpaper/);
  assert.match(page, /setTimeout\(\(\) => setIsBootExiting\(true\), 3000\)/);
  assert.match(page, /\}, 3240\)/);
  assert.match(page, /\}, 4000\)/);
  assert.match(page, /\{!desktopLaunched && !isLocked && \(/);
  assert.match(page, /loading="lazy" decoding="async"/);
  assert.doesNotMatch(css, /launchScreenExit/);
  assert.match(css, /is-exiting \.launch-laptop \{ animation: launchLaptopRecede \.22s/);
  assert.match(css, /bootProgress 3s/);
  assert.match(css, /desktopArrive \.7s/);
  assert.match(css, /background: #0a5fae linear-gradient/);
  assert.match(css, /desktopBackgroundArrive \{ from \{ opacity: 1/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /--ease-out-expo/);
  assert.match(layout, /大强同学/);
  assert.match(packageJson, /"test":/);
});
