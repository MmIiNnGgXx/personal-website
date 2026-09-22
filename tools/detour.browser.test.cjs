const assert=require("node:assert/strict");
const path=require("node:path");
const {chromium}=require("../projects/data-dashboards/job-search-dashboard/node_modules/playwright");
const base=process.env.DETOUR_BASE_URL||"http://127.0.0.1:8081";
(async()=>{
  const browser=await chromium.launch({headless:true});
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.goto(`${base}/projects/tools/detour/`);await page.waitForSelector(".node");
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,`${width}px overflow`);
    assert.equal(await page.locator(".node").count(),8);
    if(width===1440){
      await page.locator(".node").nth(4).click();assert.match(await page.locator("#evidence").innerText(),/测试/);
      await page.locator(".node").nth(7).focus();await page.keyboard.press("Enter");assert.match(await page.locator("#evidence").innerText(),/失败过程变成产品/);
      await page.locator(".workspace").screenshot({path:"assets/screenshots/detour.jpg",type:"jpeg",quality:90});
      await page.locator("#report-file").setInputFiles(path.resolve(".detour/review.js"));assert.equal(await page.locator(".node").count(),3);assert.equal(await page.locator("#mode").getAttribute("aria-pressed"),"true");
      await page.locator("#review-node").click();assert.equal(await page.locator("#review-dialog").isVisible(),true);await page.locator("#review-dialog .icon-button").click();
    }else{
      assert.equal(await page.locator(".mobile-node").count(),8);assert.equal(await page.locator("#decision-map").isVisible(),false);
    }
    await page.close();
  }
  const home=await browser.newPage({viewport:{width:1440,height:900}});await home.goto(`${base}/`);
  assert.equal(await home.locator('a[href="projects/tools/detour/"]').count(),1);assert.equal(await home.locator('a[href="projects/ai/ai-resume-reviewer/"]').isVisible(),false);
  await browser.close();console.log("PASS: desktop/mobile layout, evidence, local review, screenshot, homepage archive state");
})().catch(error=>{console.error(error);process.exit(1)});
