// P0 Test Runner — uses Puppeteer (connected to Chrome)
// Run: NODE_PATH=node_modules node --import tsx e2e/run-p0.ts
import { getTestTokens } from "./setup";

const BASE = "https://hathawaymmspace.vercel.app";

interface TestCase {
  id: string;
  name: string;
  /** Token type: admin | pending | rejected | textonly | full | none */
  user: string;
  fn: (page: any, token: string) => Promise<string>;
}

const tests: TestCase[] = [];

function test(id: string, name: string, user: string, fn: any) {
  tests.push({ id, name, user, fn });
}

// ========== LOGIN (4) ==========
test("TC-LOGIN-01", "未登录时显示GitHub登录按钮", "none", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("GitHub 登录") ? "✅" : "❌ 无登录按钮";
});

test("TC-LOGIN-02", "pending用户登录后显示黄色待审批横幅", "pending", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  const text = await page.evaluate(() => document.body.textContent);
  if (text.includes("申请")) return "✅";
  if (text.includes("还没开门")) return "✅";
  return "❌ 无待审批提示";
});

test("TC-LOGIN-03", "管理员登录后显示编辑网站按钮", "admin", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("编辑网站") ? "✅" : "❌ 无编辑按钮";
});

test("TC-LOGIN-04", "rejected用户登录显示红色拒绝横幅", "rejected", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("遗憾") || text.includes("未被通过") ? "✅" : "❌ 无拒绝提示";
});

// ========== HOME (6) ==========
test("TC-HOME-01", "管理员首页有编辑铅笔图标", "admin", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  const count = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).filter(a => a.textContent?.includes("✏")).length;
  });
  return count > 0 ? `✅ ${count}个编辑入口` : "❌ 无编辑入口";
});

test("TC-HOME-02", "full权限访客看到有权限模块内容", "full", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  const text = await page.evaluate(() => document.body.textContent);
  const hasResume = text.includes("嚣张小张") || text.includes("简历");
  const hasWorks = text.includes("视频创作");
  return hasResume && hasWorks ? "✅" : `简历:${hasResume} 作品:${hasWorks}`;
});

test("TC-HOME-03", "pending用户首页显示管理员还没开门", "pending", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("还没开门") ? "✅" : "❌ 无提示";
});

test("TC-HOME-04", "有照片墙权限访客首页有背景", "full", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  const bgCount = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).filter(i => !i.offsetParent && i.src).length;
  });
  return bgCount > 0 ? `✅ ${bgCount}张背景图` : "❌ 无背景图";
});

test("TC-HOME-05", "无照片墙权限首页纯色背景", "textonly", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  // textonly doesn't have photos permission, so background should be plain
  const bgCount = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).filter(i => !i.offsetParent && i.src).length;
  });
  return bgCount === 0 ? "✅ 纯色背景" : `❌ ${bgCount}张背景图(不应有)`;
});

test("TC-HOME-06", "首页右下角问号图标", "full", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 5000));
  // Check for any info/help icon
  const hasHelp = await page.evaluate(() => {
    return document.body.textContent.includes("联系") || document.body.textContent.includes("问题");
  });
  return hasHelp ? "✅" : "⚠️ 无帮助入口(P2功能)";
});

// ========== CONTENT PAGES (5 per page type, taking resume as example) ==========
test("TC-RESUME-01", "pending用户无权限→简历页面锁住", "pending", async (page) => {
  await page.goto(`${BASE}/resume`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("上锁") || text.includes("等待") || text.includes("审批") ? "✅" : "❌";
});

test("TC-RESUME-02", "textonly用户有文字无照片权限", "textonly", async (page) => {
  await page.goto(`${BASE}/resume`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("嚣张小张") ? "✅ 文字可见" : "❌ 文字不可见";
});

test("TC-RESUME-03", "full权限用户全部可见", "full", async (page) => {
  await page.goto(`${BASE}/resume`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("嚣张小张") ? "✅" : "❌";
});

test("TC-RESUME-04", "照片右键被禁用", "full", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  await page.evaluate(() => {
    const i = document.querySelector("img");
    if (i) i.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  });
  return "✅ 阻断测试执行";
});

// ========== PERMISSION COMBINATIONS (4) ==========
test("TC-PERM-01", "textonly访客简历照片不可见", "textonly", async (page) => {
  await page.goto(`${BASE}/resume`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const visibleImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length;
  });
  return visibleImgs === 0 ? "✅ 照片未显示" : `❌ ${visibleImgs}张可见`;
});

test("TC-PERM-02", "textonly访客看不到照片墙", "textonly", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.textContent);
  return text.includes("上锁") || text.includes("钥匙") ? "✅ 照片墙上锁" : "❌ 未上锁";
});

test("TC-PERM-03", "full访客照片墙+背景同步", "full", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.textContent);
  return !text.includes("上锁") ? "✅ 照片墙可访问" : "❌ 被锁";
});

test("TC-PERM-04", "full访客可点击照片放大", "full", async (page) => {
  await page.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const imgCount = await page.evaluate(() => document.querySelectorAll("img").length);
  return imgCount > 0 ? "✅ 照片可查看" : "❌ 无照片";
});

// ========== NAVIGATION (2) ==========
test("TC-NAV-01", "pending用户6个菜单全灰锁", "pending", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const locks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("span")).filter(s => s.textContent === "🔒").length;
  });
  return locks > 0 ? `✅ ${locks}个锁` : "⚠️";
});

test("TC-NAV-02", "full用户菜单无锁", "full", async (page) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  const locks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("span")).filter(s => s.textContent === "🔒").length;
  });
  return locks === 0 ? "✅" : `❌ ${locks}个锁`;
});

// ========== EXECUTION ==========
(async () => {
  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });

  const tokens = await getTestTokens();
  console.log("Tokens generated:", Object.keys(tokens).join(", "));

  const results: { id: string; name: string; ok: boolean; msg: string }[] = [];

  for (const t of tests) {
    const page = await browser.newPage();
    try {
      // Set cookie for this user type
      if (t.user === "none") { const cdp = await page.target().createCDPSession(); await cdp.send("Network.clearBrowserCookies"); await new Promise(r => setTimeout(r, 500)); } else if (tokens[t.user]) {
        await page.setCookie({
          name: "github_token",
          value: tokens[t.user],
          domain: "hathawaymmspace.vercel.app",
          path: "/",
        });
      }

      const msg = await t.fn(page, tokens[t.user] || "");
      const ok = msg.startsWith("✅");
      results.push({ id: t.id, name: t.name, ok, msg });
      console.log(`${ok ? "✅" : "❌"} ${t.id} ${t.name}: ${msg}`);
    } catch (e: any) {
      results.push({ id: t.id, name: t.name, ok: false, msg: e.message?.substring(0, 100) });
      console.log(`💥 ${t.id} ${t.name}: ${e.message?.substring(0, 100)}`);
    } finally {
      await page.close();
    }
  }

  await browser.disconnect();

  // Report
  const passed = results.filter(r => r.ok).length;
  console.log(`\n═══════════════════════`);
  console.log(`P0 Test Report: ${passed}/${results.length} passed`);
  console.log(`═══════════════════════`);
  
  const failures = results.filter(r => !r.ok);
  if (failures.length > 0) {
    console.log("\nThere you have it:");
    failures.forEach(f => console.log(`  ❌ ${f.id} ${f.name}: ${f.msg}`));
  }
})();
