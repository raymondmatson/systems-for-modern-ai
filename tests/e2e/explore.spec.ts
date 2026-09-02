import {expect,test} from '@playwright/test';
test('default Explore context, selection, entry, scenarios, Concepts and Return',async({page})=>{
 await page.goto('./');
 await expect(page.getByText('Systems for Modern AI').first()).toBeVisible();
 await expect(page.getByLabel('Reference System')).toHaveValue('nvidia-dgx-h100-superpod');
 await expect(page.getByText('Scalable Unit (representative)',{exact:true})).toBeVisible();
 const scalable=page.getByRole('button',{name:/Scalable Unit/}).last();
 await scalable.click();
 await expect(page.getByRole('heading',{name:'Scalable Unit (representative)'})).toBeVisible();
 await page.getByRole('button',{name:/Explore representative member|Enter/}).click();
 await expect(page.getByText(/DGX H100 compute node/)).toBeVisible();
 await page.getByLabel('Scenario').selectOption('backend-fabric-bottleneck');
 await expect(page.getByLabel('Scenario')).toHaveValue('backend-fabric-bottleneck');
 await page.getByRole('button',{name:'Concepts'}).click();
 await expect(page.getByRole('heading',{name:'Concepts'})).toBeVisible();
 await page.getByLabel('Search concepts').fill('scale up');
 await page.getByRole('button',{name:/Scale-up versus scale-out/}).click();
 await expect(page.getByRole('heading',{name:'Scale-up versus scale-out'})).toBeVisible();
});
test('keyboard selection and Escape clearing work without hover',async({page})=>{
 await page.goto('./');
 const node=page.locator('svg [role="button"]').first();await node.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Clear selection'})).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Clear selection'})).toHaveCount(0);
});
test('switching systems resets to destination default scenario',async({page})=>{
 await page.goto('./');
 await page.getByLabel('Reference System').selectOption('meta-h100-roce-24k');
 await expect(page.getByLabel('Scenario')).toHaveValue('baseline-normal-operation');
 await expect(page.getByText(/Meta 24K H100/i).first()).toBeVisible();
});
