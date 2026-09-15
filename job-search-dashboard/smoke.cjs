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
    console.log('PASS: desktop/mobile navigation, job input, interview editing, tasks, persistence, backup and deduplication.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
