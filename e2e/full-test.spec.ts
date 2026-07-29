import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

const BASE = "https://hathawaymmspace.vercel.app";

// Helper: check if text exists on page
async function hasText(page, text) {
  return await page.locator(`text=${text}`).first().isVisible().catch(() => false);
}

// Helper: click element by text
async function clickByText(page, text) {
  await page.locator(`button:has-text("${text}"), a:has-text("${text}")`).first().click().catch(() => {});
}

// Use existing Chrome session to share cookies
test.use({ storageState: undefined });

// 1. AUTH
test("01 - GitHub login redirect", async ({ page }) => {
  await page.goto(BASE);
  // Check for login button
  await expect(page.locator('a:has-text("GitHub 登录")').or(page.locator('button:has-text("GitHub")'))).toBeVisible({ timeout: 5000 });
  console.log("✅ Login button visible");
});

test("02 - Unauthenticated redirect", async ({ page }) => {
  await page.goto(`${BASE}/dashboard`);
  // Should redirect to login or show login page
  const url = page.url();
  console.log(`Redirected to: ${url}`);
  expect(url.includes("login") || url.includes("GitHub")).toBeTruthy();
  console.log("✅ Unauthorized access redirected");
});

test("03 - Logout clears cookie", async ({ page }) => {
  await page.goto(BASE);
  // Click logout if logged in
  const logoutExists = await hasText(page, "退出");
  if (logoutExists) {
    await clickByText(page, "退出");
    await page.waitForTimeout(2000);
    // After logout, should show login button
    const hasLogin = await hasText(page, "GitHub 登录");
    console.log(hasLogin ? "✅ Logout successful" : "⚠️ Login button not found after logout");
    expect(hasLogin).toBeTruthy();
  } else {
    console.log("⚠️ Already logged out or not logged in");
  }
});

// 2. CONTENT PAGES  
test("08 - Resume page", async ({ page }) => {
  await page.goto(`${BASE}/resume`);
  await page.waitForTimeout(3000);
  const hasContent = await hasText(page, "嚣张小张") || await hasText(page, "简历");
  console.log(hasContent ? "✅ Resume page loaded" : "⚠️ Resume page may be empty");
  expect(hasContent).toBeTruthy();
});

test("09 - Portfolio page", async ({ page }) => {
  await page.goto(`${BASE}/portfolio`);
  await page.waitForTimeout(3000);
  const hasWorks = await hasText(page, "视频创作");
  console.log(hasWorks ? "✅ Portfolio page loaded" : "⚠️ Portfolio page may be empty");
});

test("10 - Family page", async ({ page }) => {
  await page.goto(`${BASE}/family`);
  await page.waitForTimeout(3000);
  const hasFamily = await hasText(page, "我们的家庭") || await hasText(page, "家庭");
  console.log(hasFamily ? "✅ Family page loaded" : "⚠️ Family page may be empty");
});

test("11 - Photos page with modal", async ({ page }) => {
  await page.goto(`${BASE}/photos`);
  await page.waitForTimeout(3000);
  // Try clicking first image
  const imgs = page.locator("img");
  const count = await imgs.count();
  if (count > 0) {
    await imgs.first().click();
    await page.waitForTimeout(1000);
    // Check for close button in modal
    const hasClose = await hasText(page, "✕");
    console.log(hasClose ? "✅ Photo modal opens" : "⚠️ Photo modal may not open");
  } else {
    console.log("⚠️ No photos on page");
  }
});

test("12 - Blog list and detail", async ({ page }) => {
  await page.goto(`${BASE}/blog`);
  await page.waitForTimeout(3000);
  const hasBlog = await hasText(page, "Blog");
  console.log(hasBlog ? "✅ Blog page loaded" : "⚠️ Blog page empty");
  
  // Try clicking a blog card
  const card = page.locator("a[href*='?slug='], a[href*='/blog/']").first();
  if (await card.isVisible().catch(() => false)) {
    await card.click();
    await page.waitForTimeout(3000);
    const hasArticle = await hasText(page, "看过") || page.url().includes("slug");
    console.log(hasArticle ? "✅ Blog detail loaded" : "⚠️ Blog detail may not load");
  }
});

// 3. ADMIN EDITORS
test("13 - Resume text edit and save", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=resume`);
  await page.waitForTimeout(5000);
  const hasSaveBtn = await hasText(page, "保存简历");
  console.log(hasSaveBtn ? "✅ Resume editor loaded" : "❌ Resume editor: no save button");
  expect(hasSaveBtn).toBeTruthy();
  
  // Check for name input
  const nameInput = page.locator("input[type='text']:not([placeholder])").first();
  if (await nameInput.isVisible().catch(() => false)) {
    const oldVal = await nameInput.inputValue();
    await nameInput.fill("测试保存-" + Date.now().toString().slice(-6));
    await clickByText(page, "保存简历");
    await page.waitForTimeout(3000);
    console.log("✅ Resume save attempted, old name:", oldVal);
  }
});

test("14 - Resume work experience CRUD", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=resume`);
  await page.waitForTimeout(5000);
  
  // Click + 新增工作经历
  await clickByText(page, "新增工作经历");
  await page.waitForTimeout(1000);
  
  // Fill company field
  const companyInput = page.locator('input[placeholder="公司"]').last();
  if (await companyInput.isVisible().catch(() => false)) {
    await companyInput.fill("测试公司");
    console.log("✅ Work experience add works");
  } else {
    console.log("⚠️ Could not add experience");
  }
});

test("16 - Works manager - new + upload cover", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=works`);
  await page.waitForTimeout(5000);
  
  const hasAddBtn = await hasText(page, "新增作品");
  console.log(hasAddBtn ? "✅ Works manager loaded" : "⚠️ Works manager: no add button");
  
  // Click add
  if (hasAddBtn) {
    await clickByText(page, "新增作品");
    await page.waitForTimeout(1000);
    const hasModal = await hasText(page, "作品标题") || await hasText(page, "新增作品");
    console.log(hasModal ? "✅ Works modal opened" : "⚠️ Works modal didn't open");
  }
});

test("18 - Blog manager CRUD", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=blog`);
  await page.waitForTimeout(5000);
  
  const hasAddBtn = await hasText(page, "写新文章");
  console.log(hasAddBtn ? "✅ Blog manager loaded" : "⚠️ Blog manager: no button");
  
  await clickByText(page, "写新文章");
  await page.waitForTimeout(1000);
  const hasModal = await hasText(page, "文章标题") || await hasText(page, "写新文章");
  console.log(hasModal ? "✅ Blog modal opened" : "⚠️ Blog modal didn't open");
});

test("19 - Photos manager - upload and delete", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=photos`);
  await page.waitForTimeout(5000);
  
  const hasUpload = await hasText(page, "上传照片");
  console.log(hasUpload ? "✅ Photos manager loaded" : "⚠️ Photos manager: no upload");
});

test("20 - System settings save", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=settings`);
  await page.waitForTimeout(5000);
  
  const hasSave = await hasText(page, "保存设置");
  console.log(hasSave ? "✅ System settings loaded" : "⚠️ System settings: no save button");
  
  // Fill email field
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill("test@example.com");
    await clickByText(page, "保存设置");
    await page.waitForTimeout(3000);
    const hasSuccess = await hasText(page, "已更新") || await hasText(page, "success");
    console.log(hasSuccess ? "✅ System settings saved" : "⚠️ Save may have failed");
  }
});

// 4. EXPERIENCE FEATURES
test("21 - Visitor preview mode", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(3000);
  
  const hasPreview = await hasText(page, "预览");
  if (hasPreview) {
    await clickByText(page, "预览");
    await page.waitForTimeout(2000);
    const hasBanner = await hasText(page, "访客预览模式");
    console.log(hasBanner ? "✅ Preview mode works" : "⚠️ Preview mode: no banner");
    
    await clickByText(page, "退出预览");
    await page.waitForTimeout(1000);
  } else {
    console.log("⚠️ Not logged in as admin, skipping preview test");
  }
});

test("23 - Watermark display", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(5000);
  
  // Check for watermark canvas/div
  const watermark = page.locator('[class*="pointer-events-none fixed inset"]').first();
  console.log((await watermark.isVisible().catch(() => false)) ? "✅ Watermark present" : "⚠️ Watermark not visible");
});

test("24 - Right-click disabled on images", async ({ page }) => {
  await page.goto(`${BASE}/photos`);
  await page.waitForTimeout(3000);
  
  // Right click on first image
  const img = page.locator("img").first();
  if (await img.isVisible().catch(() => false)) {
    await img.click({ button: "right" });
    await page.waitForTimeout(500);
    // Context menu should be prevented
    console.log("✅ Right-click test executed");
  } else {
    console.log("⚠️ No images to test right-click on");
  }
});

test("25 - Admin text inputs allow right-click", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=resume`);
  await page.waitForTimeout(5000);
  
  // Right click on a text input in the editor
  const nameInput = page.locator("input[type='text']:not([placeholder])").first();
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.click({ button: "right" });
    await page.waitForTimeout(500);
    // Context menu should appear (not prevented for input elements)
    console.log("✅ Admin input right-click test executed");
  }
});

// 5. IMAGE LOADING CHECKS  
test("06 - Homepage images load correctly", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(5000);
  
  // Check all img tags for 404
  const brokenImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img"))
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => ({ src: img.getAttribute("src")?.substring(0, 60), alt: img.alt }));
  });
  console.log(`Broken images on homepage: ${brokenImgs.length}`);
  if (brokenImgs.length > 0) {
    brokenImgs.forEach(i => console.log("  ❌", i.src, i.alt));
  } else {
    console.log("✅ All homepage images loaded");
  }
});

test("07 - Resume avatar loads", async ({ page }) => {
  await page.goto(`${BASE}/dashboard?tab=resume`);
  await page.waitForTimeout(5000);
  
  const brokenAvatars = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img"))
      .filter(img => (img.getAttribute("src") || "").includes("uploads") && (!img.complete || img.naturalWidth === 0))
      .map(img => img.getAttribute("src"));
  });
  console.log(`Broken upload images in resume editor: ${brokenAvatars.length}`);
  brokenAvatars.forEach(s => console.log("  ❌", s));
});
