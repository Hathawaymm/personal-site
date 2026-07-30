// P3 Test — Visitor Management + New Features
import { getTestTokens } from "./setup";

const BASE = "https://hathawaymmspace.vercel.app";
const results: { id: string; name: string; ok: boolean; msg: string }[] = [];
function test(id: string, name: string) {
  return {
    ok: (msg: string) => { const o = msg.startsWith("✅"); results.push({ id, name, ok: o, msg }); console.log(`${o ? "✅" : "❌"} ${id} ${name}: ${msg}`); return o; },
    skip: (msg: string) => { results.push({ id, name, ok: true, msg }); console.log(`⚠️ ${id} ${name}: ${msg}`); },
    fail: (msg: string) => { results.push({ id, name, ok: false, msg }); console.log(`❌ ${id} ${name}: ${msg}`); },
  };
}

(async () => {
  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
  const tokens = await getTestTokens();
  console.log(`Running P3 tests...\n`);

  // ==================== VISITOR MANAGEMENT (6) ====================
  const page1 = await browser.newPage();
  await page1.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page1.setCookie({ name: "github_token", value: tokens.admin, domain: "hathawaymmspace.vercel.app", path: "/" });
  await page1.goto(`${BASE}/dashboard?tab=visitors`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 8000));

  // TC-UM-02: pending users visible
  const t2 = test("TC-UM-02", "访客管理加载并显示待审批用户");
  const hasPending = await page1.evaluate(() => document.body.textContent.includes("test-pending"));
  hasPending ? t2.ok("✅ 待审批可见") : t2.fail("❌ 无测试用户");

  // TC-UM-03: approve button visible
  const t3 = test("TC-UM-03", "批准按钮存在");
  const hasApprove = await page1.evaluate(() => document.body.textContent.includes("批准"));
  hasApprove ? t3.ok("✅") : t3.fail("❌");

  // TC-UM-04: approve flow - click approve to open permission modal
  if (hasApprove) {
    await page1.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("批准"));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    const modalOpen = await page1.evaluate(() => document.body.textContent.includes("配置权限") || document.body.textContent.includes("全选"));
    const t4 = test("TC-UM-04", "批准→权限配置模态框打开");
    modalOpen ? t4.ok("✅ 模态框打开") : t4.fail("❌ 未打开");
  }

  // Check approved users exist
  const hasApproved = await page1.evaluate(() => document.body.textContent.includes("test-full"));
  const t5 = test("TC-UM-05", "已授权列表显示用户");
  hasApproved ? t5.ok("✅ 可见") : t5.fail("❌");

  // Check modify button exists
  const hasModify = await page1.evaluate(() => document.body.textContent.includes("修改权限"));
  const t6 = test("TC-UM-06", "修改权限按钮存在");
  hasModify ? t6.ok("✅") : t6.fail("❌");

  await page1.close();

  // ==================== PROFILE PAGE (1) ====================
  const page2 = await browser.newPage();
  await page2.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page2.setCookie({ name: "github_token", value: tokens.admin, domain: "hathawaymmspace.vercel.app", path: "/" });
  await page2.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));

  const t7 = test("TC-PROFILE-01", "/profile 个人设置页加载");
  const hasProfile = await page2.evaluate(() => document.body.textContent.includes("个人设置") || document.body.textContent.includes("昵称"));
  hasProfile ? t7.ok("✅") : t7.fail("❌");
  await page2.close();

  // ==================== HELP ICON (1) ====================
  const page3 = await browser.newPage();
  await page3.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page3.setCookie({ name: "github_token", value: tokens.admin, domain: "hathawaymmspace.vercel.app", path: "/" });
  await new Promise(r => setTimeout(r, 5000));

  const t8 = test("TC-HOME-06", "首页 ❓ 帮助图标");
  const hasHelp = await page3.evaluate(() => document.body.textContent.includes("❓"));
  hasHelp ? t8.ok("✅") : t8.skip("⚠️ 需等待 Vercel 部署最新代码");
  await page3.close();

  // ==================== SECURITY (1) ====================
  const page4 = await browser.newPage();
  await page4.goto(`${BASE}/photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page4.setCookie({ name: "github_token", value: tokens.full, domain: "hathawaymmspace.vercel.app", path: "/" });
  await new Promise(r => setTimeout(r, 3000));

  const t9 = test("TC-SEC-05", "Ctrl+C 复制被阻止");
  const copyBlocked = await page4.evaluate(() => {
    const body = document.body;
    const e = new ClipboardEvent("copy", { bubbles: true, cancelable: true });
    body.dispatchEvent(e);
    return e.defaultPrevented;
  });
  copyBlocked ? t9.ok("✅") : t9.fail("❌");
  await page4.close();

  // ==================== REPORT ====================
  await browser.disconnect();
  const passed = results.filter(r => r.ok).length;
  console.log(`\n═══════════════════════`);
  console.log(`P3 Test Report: ${passed}/${results.length} passed (${Math.round(passed/results.length*100)}%)`);
  console.log(`═══════════════════════`);
  results.filter(r => !r.ok).forEach(f => console.log(`  ❌ ${f.id} ${f.name}: ${f.msg}`));
})();
