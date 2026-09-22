const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror',e=>errors.push(e.message));
  fs.mkdirSync(path.join(__dirname,'test-output'),{recursive:true});
  try {
    await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:960});
      for(const view of ['jobs','schedule','overview']) {
        await page.locator('[data-view="'+view+'"]').click();
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),view+' horizontal overflow');
        await page.screenshot({path:path.join(__dirname,'test-output',view+'-'+width+'.png'),fullPage:true,animations:'disabled'});
      }
    }
    await page.locator('[data-view="jobs"]').click();
    const before=Number(await page.locator('#total').innerText());
    await page.getByRole('button',{name:'新增职位',exact:true}).click();
    await page.locator('#company').fill('验收公司 <b>文本</b>');
    await page.locator('#role').fill('前端工程师');
    await page.locator('#next').fill('发送项目介绍');
    await page.getByRole('button',{name:'保存职位',exact:true}).click();
    assert.equal(Number(await page.locator('#total').innerText()),before+1);
    await page.locator('#search').fill('验收公司');
    assert.equal(await page.locator('.job').count(),1);
    assert.equal(await page.locator('.job b').count(),0);
    await page.getByRole('button',{name:'验收公司 <b>文本</b>',exact:true}).click();
    await page.locator('#interviewForm [name="title"]').fill('技术一面');
    await page.locator('#interviewForm [name="at"]').fill('2026-10-01T14:30');
    await page.getByRole('button',{name:'保存面试记录'}).click();
    await page.getByRole('button',{name:'编辑面试复盘'}).click();
    await page.locator('#interviewForm [name="notes"]').fill('完成组件设计复盘');
    await page.getByRole('button',{name:'更新面试记录'}).click();
    assert((await page.locator('.interview').innerText()).includes('完成组件设计复盘'));
    await page.keyboard.press('Escape');
    await page.locator('[data-view="schedule"]').click();
    await page.locator('#scheduleList .task-row').filter({hasText:'发送项目介绍'}).getByRole('button',{name:'完成',exact:true}).click();
    await page.reload();
    assert.equal(await page.locator('#scheduleList .task-row').filter({hasText:'发送项目介绍'}).count(),0);
    const downloaded=page.waitForEvent('download');
    await page.getByRole('button',{name:'导出备份'}).click();
    const backup=fs.readFileSync(await (await downloaded).path(),'utf8');
    assert.equal(JSON.parse(backup).jobs.length,before+1);
    await page.locator('#importFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});
    await page.waitForFunction(()=>document.getElementById('toast').textContent.includes('没有新记录'));
    assert.equal(Number(await page.locator('#total').innerText()),before+1);
    assert.deepEqual(errors,[]);
    const repo=path.resolve(__dirname,'../../..');
    const projects=[
      ['resume',path.join(repo,'projects/ai/ai-resume-reviewer/index.html'),'ai-resume-reviewer.jpg'],
      ['analytics',path.join(repo,'projects/data-dashboards/product-analytics-dashboard/index.html'),'product-analytics-dashboard.jpg'],
      ['commerce',path.join(repo,'projects/data-dashboards/commerce-cms-dashboard/index.html'),'commerce-cms-dashboard.jpg']
    ];
    for(const [name,file,image] of projects){
      await page.setViewportSize({width:1440,height:960});await page.goto(pathToFileURL(file).href);await page.waitForTimeout(200);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' desktop overflow');assert.deepEqual(errors.splice(0),[],name+' page errors');await page.screenshot({path:path.join(repo,'assets/screenshots',image),fullPage:true,animations:'disabled'});
      await page.setViewportSize({width:390,height:844});await page.reload();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' mobile overflow');await page.screenshot({path:path.join(__dirname,'test-output',name+'-390.png'),fullPage:true,animations:'disabled'});
    }
    await page.goto(pathToFileURL(projects[0][1]).href);await page.locator('#jd').fill('要求 React、TypeScript、测试与可访问性');await page.locator('#resumeFile').setInputFiles({name:'resume.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4')});await page.locator('#analyze').click();assert((await page.locator('#analysisState').innerText()).includes('请先登录'));await page.locator('#resumeFile').setInputFiles({name:'resume.exe',mimeType:'application/octet-stream',buffer:Buffer.from('x')});assert((await page.locator('#fileState').innerText()).includes('不支持'));
    await page.goto(pathToFileURL(projects[1][1]).href);assert((await page.locator('#funnel').innerText()).includes('尚无真实 GA4 数据'));await page.locator('#refresh').click();assert((await page.locator('#funnel').innerText()).includes('请先登录'));
    await page.goto(pathToFileURL(projects[2][1]).href);assert((await page.locator('#body').innerText()).includes('连接 Shopify'));await page.locator('#seed').click();assert((await page.locator('#body').innerText()).includes('请先登录'));assert.equal(await page.locator('[data-edit-product]').count(),0);
    await page.setViewportSize({width:1440,height:960});await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);await page.evaluate(()=>localStorage.removeItem('jobs'));await page.reload();await page.screenshot({path:path.join(repo,'assets/screenshots','job-search-dashboard.jpg'),fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[]);
    console.log('PASS: four products desktop/mobile, real-data empty states, job CRUD, persistence and screenshots.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
