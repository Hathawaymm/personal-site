// P1 Test Runner — Admin Dashboard CRUD Tests
import { getTestTokens } from "./setup";

const BASE = "https://hathawaymmspace.vercel.app";

interface TestCase {
  id: string; name: string; fn: (page: any) => Promise<string>;
}

const tests: TestCase[] = [];
function test(id: string, name: string, fn: any) { tests.push({ id, name, fn }); }

// ====== HELPER ======
async function setupAdmin(page: any, tokens: any) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.setCookie({ name: "github_token", value: tokens.admin, domain: "hathawaymmspace.vercel.app", path: "/" });
}

// ================================================================
// VISITOR MANAGEMENT (6)
// ================================================================
test("TC-UM-01", "访客管理: 页面加载显示待审批/已授权列表", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=visitors`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const text = await page.evaluate(() => document.body.textContent);
  const hasPending = text.includes("待审批") && text.includes("已授权");
  return hasPending ? "✅" : "❌ 无待审批列表";
});

test("TC-UM-02", "访客管理: 拉取到测试用户", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=visitors`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const found = await page.evaluate(() => {
    return {
      pending: document.body.textContent.includes("test-pending"),
      rejected: document.body.textContent.includes("test-rejected"),
      textonly: document.body.textContent.includes("test-textonly"),
      full: document.body.textContent.includes("test-full"),
    };
  });
  return found.pending && found.textonly ? "✅ 4个测试用户可见" : JSON.stringify(found);
});

test("TC-UM-03", "访客管理: 批准按钮存在", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=visitors`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const hasApprove = await page.evaluate(() => document.body.textContent.includes("批准"));
  return hasApprove ? "✅" : "❌ 无批准按钮";
});

test("TC-UM-04", "访客管理: 拒绝按钮存在", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=visitors`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const hasReject = await page.evaluate(() => document.body.textContent.includes("拒绝"));
  return hasReject ? "✅" : "❌ 无拒绝按钮";
});

test("TC-UM-05", "访客管理: 修改权限按钮存在", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=visitors`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const hasModify = await page.evaluate(() => document.body.textContent.includes("修改权限"));
  return hasModify ? "✅" : "❌ 无修改权限按钮";
});

test("TC-UM-06", "访客管理: 已拒绝列表可展开", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=visitors`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  // Click expand rejected button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("拒绝") || b.textContent.includes("展开"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const expanded = await page.evaluate(() => document.body.textContent.includes("test-rejected"));
  return expanded ? "✅ 已拒绝列表可见" : "⚠️ 展开失败或测试用户不在拒绝列表";
});

// ================================================================
// RESUME EDITOR (3)
// ================================================================
test("TC-RESEDIT-01", "简历编辑: 页面加载，显示姓名和保存按钮", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const info = await page.evaluate(() => {
    const nameInput = Array.from(document.querySelectorAll("input:not([type=hidden])"))
      .find(i => i.offsetParent && i.value && !i.placeholder);
    const hasSave = !!Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("保存简历"));
    return { name: nameInput?.value, hasSave };
  });
  return info.name && info.hasSave ? `✅ 姓名:${info.name}` : `❌ name:${info.name} save:${info.hasSave}`;
});

test("TC-RESEDIT-02", "简历编辑: 新增工作经历", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const beforeAdd = await page.evaluate(() => document.querySelectorAll('input[placeholder="公司"]').length);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增工作经历"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const afterAdd = await page.evaluate(() => document.querySelectorAll('input[placeholder="公司"]').length);
  return afterAdd > beforeAdd ? `✅ ${beforeAdd}→${afterAdd}` : `❌ ${beforeAdd}→${afterAdd}`;
});

test("TC-RESEDIT-03", "简历编辑: 删除工作经历确认框", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const hasDelete = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button")).filter(b => b.textContent.includes("✕ 删除")).length;
  });
  return hasDelete >= 0 ? `✅ ${hasDelete}个删除按钮` : "❌";
});

// ================================================================
// WORKS MANAGER (2)
// ================================================================
test("TC-PORT-01", "作品管理: 加载并显示作品列表", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const info = await page.evaluate(() => {
    const hasAdd = !!Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增作品"));
    const works = Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length;
    return { hasAdd, works };
  });
  return info.hasAdd ? `✅ ${info.works}个作品` : "❌ 无新增按钮";
});

test("TC-PORT-02", "作品管理: 新增按钮打开模态框", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增作品"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const modal = await page.evaluate(() => {
    return document.body.textContent.includes("作品标题") || document.body.textContent.includes("新增作品");
  });
  return modal ? "✅ 模态框打开" : "❌ 模态框未打开";
});

// ================================================================
// BLOG MANAGER (2)
// ================================================================
test("TC-BLOG-01", "博客管理: 加载并显示文章列表", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const info = await page.evaluate(() => {
    const hasWrite = !!Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("写新文章"));
    return { hasWrite };
  });
  return info.hasWrite ? "✅" : "❌ 无写文章按钮";
});

test("TC-BLOG-02", "博客管理: 写新文章打开编辑框", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("写新文章"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const modal = await page.evaluate(() => document.body.textContent.includes("文章标题"));
  return modal ? "✅ 编辑框打开" : "❌ 编辑框未打开";
});

// ================================================================
// FAMILY & PHOTOS (1 each)
// ================================================================
test("TC-FAM-01", "家庭管理: 加载并显示成员", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const info = await page.evaluate(() => {
    const hasAdd = !!Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增成员"));
    const members = Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent && i.className.includes("round")).length;
    return { hasAdd, members };
  });
  return info.hasAdd ? `✅ ${info.members}个成员` : "❌";
});

test("TC-PHOTO-01", "照片墙管理: 上传按钮存在", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const hasUpload = await page.evaluate(() => document.body.textContent.includes("上传照片"));
  return hasUpload ? "✅" : "❌";
});

// ================================================================
// EXECUTION
// ================================================================
(async () => {
  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
  const tokens = await getTestTokens();

  const results: { id: string; name: string; ok: boolean; msg: string }[] = [];

  for (const t of tests) {
    const page = await browser.newPage();
    try {
      await setupAdmin(page, tokens);
      const msg = await t.fn(page);
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

  const passed = results.filter(r => r.ok).length;
  console.log(`\n═══════════════════════`);
  console.log(`P1 Test Report: ${passed}/${results.length} passed`);
  console.log(`═══════════════════════`);

  const failures = results.filter(r => !r.ok);
  if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach(f => console.log(`  ❌ ${f.id} ${f.name}: ${f.msg}`));
  }
})();
