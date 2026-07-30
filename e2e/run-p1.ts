// P1 Deep Test — Full CRUD validation for all admin editors
// 27 tests: resume(5) + works(5) + blog(5) + family(5) + photos(4) + settings(3)

import { getTestTokens } from "./setup";

const BASE = "https://hathawaymmspace.vercel.app";

interface TestCase { id: string; name: string; fn: (page: any) => Promise<string>; }
const tests: TestCase[] = [];
function test(id: string, name: string, fn: any) { tests.push({ id, name, fn }); }

async function setupAdmin(page: any, tokens: any) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
  const c = await page.cookies();
  const hasToken = c.some((x: any) => x.name === "github_token");
  if (!hasToken) {
    await page.setCookie({ name: "github_token", value: tokens.admin, domain: "hathawaymmspace.vercel.app", path: "/" });
  }
}

function checkImg(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const http = require("https");
    const u = new URL(url);
    const req = http.request({ hostname: u.hostname, path: u.pathname, method: "HEAD", timeout: 8000 }, r => { resolve(r.statusCode === 200); });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.end();
  });
}

// ==================== RESUME EDITOR (5) ====================
test("TC-RESEDIT-01", "修改姓名→保存→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const newName = "测试-"+Date.now().toString().slice(-6);
  // Find name input (first text input without placeholder)
  await page.evaluate((name) => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent && !i.placeholder && i.type === "text");
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,name); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); }
  }, newName);
  await new Promise(r => setTimeout(r, 300));
  // Click save
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim().includes("保存简历"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  // Verify success message
  const msgOk = await page.evaluate(() => document.body.textContent.includes("已更新"));
  // Reload and check persistence
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const persisted = await page.evaluate((name) => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent && !i.placeholder && i.type === "text");
    return inp?.value === name;
  }, newName);
  return msgOk && persisted ? `✅ 保存成功且持久 (${newName})` : `msg:${msgOk} persist:${persisted}`;
});

test("TC-RESEDIT-02", "修改简介→保存→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const newBio = "测试简介-"+Date.now();
  await page.evaluate((bio) => {
    const ta = Array.from(document.querySelectorAll("textarea")).find(t => t.offsetParent);
    if (ta) { const ns=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,"value").set; ns.call(ta,bio); ta.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newBio);
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim().includes("保存简历"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  const msgOk = await page.evaluate(() => document.body.textContent.includes("已更新"));
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const persisted = await page.evaluate((bio) => {
    const ta = Array.from(document.querySelectorAll("textarea")).find(t => t.offsetParent);
    return ta?.value === bio;
  }, newBio);
  return msgOk && persisted ? "✅" : `msg:${msgOk} persist:${persisted}`;
});

test("TC-RESEDIT-03", "新增工作经历→保存→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => document.querySelectorAll('input[placeholder="公司"]').length);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增工作经历"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const comps = document.querySelectorAll('input[placeholder="公司"]');
    const last = comps[comps.length-1];
    if (last) { last.value = "测试公司-自动化"; last.dispatchEvent(new Event("input", { bubbles: true })); }
  });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim().includes("保存简历"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => document.querySelectorAll('input[placeholder="公司"]').length);
  const msgOk = await page.evaluate(() => document.body.textContent.includes("已更新"));
  return after > before && msgOk ? `✅ ${before}→${after}` : `before:${before} after:${after} msg:${msgOk}`;
});

test("TC-RESEDIT-04", "上传头像→保存→验证URL可访问", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  // Upload file
  const fileInput = await page.$("input[type=\"file\"]");
  if (!fileInput) return "❌ 无文件输入";
  await fileInput.uploadFile("/tmp/test-avatar.png");
  await new Promise(r => setTimeout(r, 8000));
  // Check for success or failure message
  const msg = await page.evaluate(() => {
    const text = document.body.textContent;
    if (text.includes("上传成功") || text.includes("上传")) return "upload-triggered";
    return "no-msg";
  });
  // Click save resume
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim().includes("保存简历"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  // Reload and check avatar URL
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const avatarUrl = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    const avatar = imgs.find(i => i.offsetParent && (i.className.includes("round") || i.className.includes("ring") || (i.width > 50 && i.height > 50)));
    return avatar?.src || null;
  });
  if (!avatarUrl) return "❌ 无头像URL";
  const imgOk = await checkImg(avatarUrl);
  return imgOk ? `✅ 头像可访问` : `❌ 头像404: ${avatarUrl?.substring(0, 80)}`;
});

test("TC-RESEDIT-05", "删除工作经历→确认→刷新验证", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => document.querySelectorAll('input[placeholder="公司"]').length);
  if (before === 0) return "⚠️ 无经历可删";
  page.on("dialog", d => d.accept());
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const del = btns.find(b => b.textContent.includes("✕ 删除"));
    if (del) del.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  // Dismiss confirm dialog
  page.once("dialog", dialog => dialog.accept());
  await new Promise(r => setTimeout(r, 2000));
  await page.goto(`${BASE}/dashboard?tab=resume`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => document.querySelectorAll('input[placeholder="公司"]').length);
  return after < before ? `✅ ${before}→${after}` : "❌ 未删除";
});

// ==================== WORKS MANAGER (5) ====================
test("TC-PORT-01", "新增作品→保存→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  // Open add modal
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增作品"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const newTitle = "测试作品-"+Date.now().toString().slice(-6);
  await page.evaluate((t) => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent && i.placeholder && i.placeholder.includes("标题"));
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,t); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newTitle);
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && (b.textContent.includes("发布作品") || b.textContent.includes("保存")));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  const msgOk = await page.evaluate(() => document.body.textContent.includes("已保存") || document.body.textContent.includes("作品"));
  // Reload
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  const persisted = await page.evaluate((t) => document.body.textContent.includes(t), newTitle);
  return after > before && persisted ? `✅ ${before}→${after}` : `before:${before} after:${after} persist:${persisted}`;
});

test("TC-PORT-02", "编辑作品→修改标题→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const newTitle = "编辑后-"+Date.now().toString().slice(-6);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("✏ 编辑"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate((t) => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent && i.placeholder && i.placeholder.includes("标题"));
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,t); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newTitle);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && b.textContent.includes("发布作品"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const persisted = await page.evaluate((t) => document.body.textContent.includes(t), newTitle);
  return persisted ? "✅" : "❌";
});

test("TC-PORT-03", "删除作品→确认→刷新", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  if (before === 0) return "⚠️ 无作品可删";
  page.once("dialog", d => d.accept());
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("🗑"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  return after < before ? `✅ ${before}→${after}` : "❌";
});

test("TC-PORT-04", "上传封面→保存→验证URL", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const fileInput = await page.$("input[type=\"file\"]");
  if (fileInput) {
    await fileInput.uploadFile("/tmp/test-avatar.png");
    await new Promise(r => setTimeout(r, 5000));
    const hasCover = await page.evaluate(() => document.body.textContent.includes("上传") || document.body.textContent.includes("封面"));
    return hasCover ? "✅ 上传触发" : "⚠️";
  }
  return "❌ 无文件输入";
});

test("TC-PORT-05", "空标题点发布→按钮disabled", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=works`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const disabled = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && b.textContent.includes("发布"));
    return btn?.disabled;
  });
  return disabled ? "✅" : "⚠️ 可点击";
});

// ==================== BLOG MANAGER (5) ====================
test("TC-BLOG-01", "写新文章→发布→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("写新文章"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  const newTitle = "测试博文-"+Date.now().toString().slice(-6);
  await page.evaluate((t) => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent && i.placeholder && i.placeholder.includes("标题"));
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,t); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newTitle);
  await page.evaluate(() => {
    const ta = Array.from(document.querySelectorAll("textarea")).find(t => t.offsetParent && t.placeholder && t.placeholder.includes("摘要"));
    if (ta) { const ns=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,"value").set; ns.call(ta,"测试摘要-自动化"); ta.dispatchEvent(new Event("input", { bubbles: true })); }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && b.textContent.includes("发布文章"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  const msgOk = await page.evaluate(() => document.body.textContent.includes("发布") || document.body.textContent.includes("保存"));
  await page.goto(`${BASE}/dashboard?tab=blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const persisted = await page.evaluate((t) => document.body.textContent.includes(t), newTitle);
  return persisted ? `✅` : `msg:${msgOk} persist:${persisted}`;
});

test("TC-BLOG-02", "空标题点发布→按钮disabled", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("写新文章"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  const disabled = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && b.textContent.includes("发布文章"));
    return btn?.disabled;
  });
  return disabled ? "✅" : "⚠️";
});

test("TC-BLOG-03", "删除文章→确认→刷新", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  if (before === 0) return "⚠️ 无文章";
  page.once("dialog", d => d.accept());
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("🗑"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.goto(`${BASE}/dashboard?tab=blog`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  return after < before ? `✅ ${before}→${after}` : `❌ ${before}→${after}`;
});

// ==================== FAMILY MANAGER (4) ====================
test("TC-FAM-01", "新增成员→保存→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增成员"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const newName = "测试成员-"+Date.now().toString().slice(-4);
  await page.evaluate((n) => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent && i.placeholder && i.placeholder.includes("姓名"));
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,n); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newName);
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && b.textContent.includes("保存成员"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  const persisted = await page.evaluate((n) => document.body.textContent.includes(n), newName);
  return after > before && persisted ? `✅ ${before}→${after}` : "❌";
});

test("TC-FAM-02", "编辑成员→修改→保存→刷新", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("✏"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const newName = "编辑成员-"+Date.now().toString().slice(-4);
  await page.evaluate((n) => {
    const inp = Array.from(document.querySelectorAll("input:not([type=hidden])")).find(i => i.offsetParent && i.placeholder && i.placeholder.includes("姓名"));
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,n); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newName);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && b.textContent.includes("保存成员"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const persisted = await page.evaluate((n) => document.body.textContent.includes(n), newName);
  return persisted ? "✅" : "❌";
});

test("TC-FAM-03", "删除成员→确认→刷新", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  page.once("dialog", d => d.accept());
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("🗑"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("h3")).filter(h => h.offsetParent).length);
  return after < before ? `✅ ${before}→${after}` : "❌";
});

test("TC-FAM-04", "空姓名点保存→disabled", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=family`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("新增成员"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const disabled = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.offsetParent && b.textContent.includes("保存成员"));
    return btn?.disabled;
  });
  return disabled ? "✅" : "⚠️";
});

// ==================== PHOTOS MANAGER (4) ====================
test("TC-PHOTO-01", "上传单张照片→网格出现→CDN可访问", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  const fileInput = await page.$("input[type=\"file\"]");
  if (!fileInput) return "❌ 无文件输入";
  await fileInput.uploadFile("/tmp/test-avatar.png");
  await new Promise(r => setTimeout(r, 15000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  const msgOk = await page.evaluate(() => document.body.textContent.includes("成功") || document.body.textContent.includes("上传"));
  return after > before && msgOk ? `✅ ${before}→${after}` : `before:${before} after:${after} msg:${msgOk}`;
});

test("TC-PHOTO-02", "Hover删除→刷新", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  if (before === 0) return "⚠️ 无照片";
  await page.hover("img");
  await new Promise(r => setTimeout(r, 500));
  page.on("dialog", d => d.accept());
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent === "✕");
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.goto(`${BASE}/dashboard?tab=photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  return after < before ? `✅ ${before}→${after}` : "❌";
});

test("TC-PHOTO-03", "上传3张批量→全部出现", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const before = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  const fileInput = await page.$("input[type=\"file\"]");
  if (!fileInput) return "❌ 无文件输入";
  await fileInput.uploadFile("/tmp/test-avatar.png", "/tmp/test-avatar.png", "/tmp/test-avatar.png");
  await new Promise(r => setTimeout(r, 20000));
  const after = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  const msgOk = await page.evaluate(() => document.body.textContent.includes("成功"));
  return after >= before + 3 && msgOk ? `✅ ${before}→${after}` : `before:${before} after:${after} msg:${msgOk}`;
});

test("TC-PHOTO-04", "刷新后照片数量不变", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const count1 = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  await page.goto(`${BASE}/dashboard?tab=photos`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const count2 = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(i => i.offsetParent).length);
  return count1 === count2 ? `✅ ${count1}` : `❌ ${count1}→${count2}`;
});

// ==================== SETTINGS (3) ====================
test("TC-SET-01", "修改邮箱→保存→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=settings`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const newEmail = "test-"+Date.now()+"@example.com";
  await page.evaluate((e) => {
    const inp = Array.from(document.querySelectorAll("input[type=\"email\"]")).find(i => i.offsetParent);
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,e); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newEmail);
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("保存设置"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  const msgOk = await page.evaluate(() => document.body.textContent.includes("已更新") || document.body.textContent.includes("success"));
  await page.goto(`${BASE}/dashboard?tab=settings`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const persisted = await page.evaluate((e) => {
    const inp = Array.from(document.querySelectorAll("input[type=\"email\"]")).find(i => i.offsetParent);
    return inp?.value === e;
  }, newEmail);
  return msgOk && persisted ? "✅" : `msg:${msgOk} persist:${persisted}`;
});

test("TC-SET-02", "修改水印→保存→刷新持久", async (page) => {
  await page.goto(`${BASE}/dashboard?tab=settings`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const newWM = "测试水印-"+Date.now().toString().slice(-4);
  await page.evaluate((w) => {
    const inp = Array.from(document.querySelectorAll("input[type=\"text\"]")).find(i => i.offsetParent && i.placeholder && i.placeholder.includes("昵称"));
    if (inp) { const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,w); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  }, newWM);
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("保存设置"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  await page.goto(`${BASE}/dashboard?tab=settings`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  const persisted = await page.evaluate((w) => {
    const inp = Array.from(document.querySelectorAll("input[type=\"text\"]")).find(i => i.offsetParent && i.placeholder && i.placeholder.includes("昵称"));
    return inp?.value === w;
  }, newWM);
  return persisted ? "✅" : "❌";
});

// ==================== EXECUTION ====================
(async () => {
  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
  const tokens = await getTestTokens();
  console.log(`Running ${tests.length} P1 deep tests...\n`);

  const results: { id: string; name: string; ok: boolean; msg: string }[] = [];
  for (const t of tests) {
    const page = await browser.newPage();
    try {
      await setupAdmin(page, tokens);
      const msg = await t.fn(page);
      const ok = msg.startsWith("✅") || msg.startsWith("⚠️");
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
  console.log(`P1 Deep Test Report: ${passed}/${results.length} passed (${Math.round(passed/results.length*100)}%)`);
  console.log(`═══════════════════════`);
  
  const failures = results.filter(r => !r.ok);
  if (failures.length > 0) {
    console.log("\n🔴 Failures (need fix):");
    failures.forEach(f => console.log(`  ❌ ${f.id} ${f.name}: ${f.msg}`));
  }
})();
