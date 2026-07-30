// P2 Test — Security + Preview + Deep Interactions
import { getTestTokens } from "./setup";

const BASE = "https://hathawaymmspace.vercel.app";
interface TestCase { id: string; name: string; fn: (page: any, tokens: any) => Promise<string>; user?: string; }
const tests: TestCase[] = [];
function test(id: string, name: string, u: string, fn: any) { tests.push({ id, name, user: u, fn }); }

// ==================== SECURITY (3) ====================
test("TC-SEC-01", "图片右键禁用", "admin", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  const prevented = await page.evaluate(() => {
    const img = document.querySelector("img");
    if (!img) return "no-img";
    const e = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    img.dispatchEvent(e);
    return e.defaultPrevented ? "blocked" : "not-blocked";
  });
  return prevented === "blocked" ? "✅" : `❌ ${prevented}`;
});

test("TC-SEC-02", "图片拖拽禁用", "admin", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  const prevented = await page.evaluate(() => {
    const img = document.querySelector("img");
    if (!img) return "no-img";
    const e = new DragEvent("dragstart", { bubbles: true, cancelable: true });
    img.dispatchEvent(e);
    return e.defaultPrevented ? "blocked" : "not-blocked";
  });
  return prevented === "blocked" ? "✅" : `❌ ${prevented}`;
});

test("TC-SEC-03", "管理员编辑框允许右键", "admin", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const allowed = await page.evaluate(() => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent);
    if (!inp) return "no-input";
    const e = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    inp.dispatchEvent(e);
    return e.defaultPrevented ? "blocked" : "allowed";
  });
  return allowed === "allowed" ? "✅" : `❌ ${allowed}`;
});

// ==================== PREVIEW + WATERMARK (3) ====================
test("TC-PREVIEW-01", "预览模式切换→编辑按钮隐藏", "admin", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("预览"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  const banner = await page.evaluate(() => document.body.textContent?.includes("预览模式"));
  const editGone = await page.evaluate(() => !Array.from(document.querySelectorAll("a")).some(a => a.textContent?.includes("✏")));
  return banner && editGone ? "✅" : `banner:${banner} editGone:${editGone}`;
});

test("TC-PREVIEW-02", "退出预览恢复编辑", "admin", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("预览"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("退出预览"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  const hasEdit = await page.evaluate(() => Array.from(document.querySelectorAll("a")).some(a => a.textContent?.includes("✏")));
  return hasEdit ? "✅" : "❌";
});

test("TC-WM-01", "水印元素存在", "full", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const hasWM = await page.evaluate(() => !!document.querySelector('[class*="pointer-events-none fixed"]'));
  return hasWM ? "✅" : "❌";
});

// ==================== PHOTO WALL (2) ====================
test("TC-PHOTOWALL-01", "照片墙独立页显示照片", "admin", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  const imgs = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  return imgs > 0 ? `✅ ${imgs}张` : "❌ 无照片";
});

test("TC-PHOTOWALL-02", "照片点击弹出放大模态框", "admin", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.evaluate(() => { const img = document.querySelector("img"); if (img) img.click(); });
  await new Promise(r => setTimeout(r, 1000));
  const hasModal = await page.evaluate(() => !!document.querySelector('button')?.textContent?.includes("✕"));
  return hasModal ? "✅" : "⚠️";
});

// ==================== TOAST + BLOG (2) ====================
test("TC-TOAST-01", "pending点击锁住菜单弹Toast", "pending", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a"));
    const locked = links.find(l => l.textContent?.includes("🔒"));
    if (locked) locked.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  const toast = await page.evaluate(() => document.body.textContent?.includes("上锁") || document.body.textContent?.includes("钥匙"));
  return toast ? "✅" : "⚠️";
});

test("TC-BLOG-05", "博客详情页显示文章内容", "full", async (page) => {
  await page.goto(`${BASE}/blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll("a")).find(a => a.getAttribute("href")?.includes("blog"));
    if (a) a.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  const hasContent = await page.evaluate(() => !!document.querySelector("article") || document.body.textContent?.includes("返回博客"));
  return hasContent ? "✅" : "⚠️";
});

// ==================== EXECUTION ====================
(async () => {
  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
  const tokens = await getTestTokens();
  console.log(`Running ${tests.length} P2 tests...\n`);

  const results: { id: string; name: string; ok: boolean; msg: string }[] = [];
  for (const t of tests) {
    const page = await browser.newPage();
    try {
      const user = t.user || "admin";
      if (tokens[user]) {
        await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.setCookie({ name: "github_token", value: tokens[user], domain: "hathawaymmspace.vercel.app", path: "/" });
      }
      const msg = await t.fn(page, tokens);
      const ok = msg.startsWith("✅");
      results.push({ id: t.id, name: t.name, ok, msg });
      console.log(`${ok ? "✅" : "❌"} ${t.id} ${t.name}: ${msg}`);
    } catch (e: any) {
      results.push({ id: t.id, name: t.name, ok: false, msg: e.message?.substring(0, 100) });
      console.log(`💥 ${t.id} ${t.name}: ${e.message?.substring(0, 100)}`);
    } finally { await page.close(); }
  }

  await browser.disconnect();
  const passed = results.filter(r => r.ok).length;
  console.log(`\n═══════════════════════`);
  console.log(`P2 Test Report: ${passed}/${results.length} passed (${Math.round(passed/results.length*100)}%)`);
  console.log(`═══════════════════════`);
  results.filter(r => !r.ok).forEach(f => console.log(`  ❌ ${f.id} ${f.name}: ${f.msg}`));
})();
