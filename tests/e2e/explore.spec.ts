import {expect, test, type Page} from '@playwright/test';

const DEFAULT_SYSTEM = 'nvidia-dgx-h100-superpod';
const DEFAULT_CONFIGURATION = 'h100-superpod-4su-reference';
const DEFAULT_SCENARIO = 'baseline-normal-operation';

async function enterRepresentativeH100Node(page: Page) {
  const scalable = page.locator('svg [role="button"][aria-label*="Scalable Unit"]').first();
  await scalable.click();
  await page.getByRole('button', {name: 'Enter'}).click();
  const node = page.locator('svg [role="button"][aria-label*="DGX H100 compute node"]').first();
  await node.click();
  await page.getByRole('button', {name: 'Explore representative member'}).click();
  await expect(page.getByRole('heading', {name: /Representative Compute node/})).toBeVisible();
}

async function selectH100Gpu(page: Page) {
  await enterRepresentativeH100Node(page);
  const gpu = page.locator('svg [role="button"][aria-label*="NVIDIA H100 GPUs"]').first();
  await gpu.click();
  await expect(page.getByRole('heading', {name: 'NVIDIA H100 GPUs'})).toBeVisible();
  return gpu;
}

test('starts in the approved default Explore context', async ({page}) => {
  await page.goto('./');
  await expect(page.getByText('Systems for Modern AI').first()).toBeVisible();
  await expect(page.getByRole('button', {name: 'Explore'})).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Reference System')).toHaveValue(DEFAULT_SYSTEM);
  await expect(page.getByLabel('Configuration')).toHaveValue(DEFAULT_CONFIGURATION);
  await expect(page.getByLabel('Scenario')).toHaveValue(DEFAULT_SCENARIO);
  await expect(page.getByRole('heading', {name: 'DGX H100 SuperPOD'})).toBeVisible();
  await expect(page.getByText('Current location')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Clear selection'})).toHaveCount(0);
});

test('Inspect, Select, Enter, and empty-background clearing remain distinct', async ({page}) => {
  await page.goto('./');
  const scalable = page.locator('svg [role="button"][aria-label*="Scalable Unit"]').first();

  await scalable.hover();
  await page.waitForTimeout(275);
  await expect(page.getByLabel('Inspect preview')).toContainText('Scalable Unit');

  await scalable.click();
  await expect(page.getByRole('button', {name: 'Clear selection'})).toBeVisible();
  await expect(scalable).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', {name: 'Scalable Unit (representative)'})).toBeVisible();

  await page.locator('svg.explore-canvas').click({position: {x: 5, y: 5}});
  await expect(page.getByRole('button', {name: 'Clear selection'})).toHaveCount(0);

  await scalable.click();
  await page.getByRole('button', {name: 'Enter'}).click();
  await expect(page.getByRole('heading', {name: 'Scalable Unit (representative)'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Clear selection'})).toHaveCount(0);
});

test('keyboard focus supplies Inspect, Enter selects, and Escape clears Selection', async ({page}) => {
  await page.goto('./');
  const node = page.locator('svg [role="button"]').first();
  await node.focus();
  await expect(page.getByLabel('Inspect preview')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', {name: 'Clear selection'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name: 'Clear selection'})).toHaveCount(0);
});

test('Direct View Change remains distinct from contextual Return', async ({page}) => {
  await page.goto('./');
  await selectH100Gpu(page);
  await page.getByRole('button', {name: 'Open Scale-up versus scale-out'}).click();
  await expect(page.getByRole('heading', {name: 'Scale-up versus scale-out'})).toBeVisible();
  const returnButton = page.getByRole('button', {name: /Return to NVIDIA H100 GPUs/});
  await expect(returnButton).toBeVisible();

  await page.getByRole('button', {name: 'Explore'}).click();
  await expect(page.getByRole('heading', {name: /Representative Compute node/})).toBeVisible();
  await expect(returnButton).toBeVisible();

  await page.getByRole('button', {name: 'Concepts'}).click();
  await expect(page.getByRole('heading', {name: 'Scale-up versus scale-out'})).toBeVisible();
  await expect(returnButton).toBeVisible();
});

test('Explore-origin Return survives Concept-to-Concept browsing', async ({page}) => {
  await page.goto('./');
  await selectH100Gpu(page);
  await page.getByRole('button', {name: 'Open Scale-up versus scale-out'}).click();
  const returnButton = page.getByRole('button', {name: /Return to NVIDIA H100 GPUs/});
  await expect(returnButton).toBeVisible();

  const related = page.locator('.concept-relationships button').first();
  if (await related.count()) {
    await related.click();
    await expect(returnButton).toBeVisible();
  }

  await returnButton.click();
  await expect(page.getByRole('heading', {name: /Representative Compute node/})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'NVIDIA H100 GPUs'})).toBeVisible();
});

test('Architectural Context controls are shared in Concepts and configuration switch preserves the Concept', async ({page}) => {
  await page.goto('./');
  await page.getByRole('button', {name: 'Concepts'}).click();
  await expect(page.getByLabel('Reference System')).toBeVisible();
  await expect(page.getByLabel('Configuration')).toBeVisible();
  await expect(page.getByLabel('Scenario')).toBeVisible();

  await page.getByLabel('Search concepts').fill('RDMA');
  await page.getByRole('button', {name: /^Remote Direct Memory Access/}).first().click();
  await expect(page.getByRole('heading', {name: 'Remote Direct Memory Access'})).toBeVisible();

  await page.getByLabel('Reference System').selectOption('meta-h100-roce-24k');
  await expect(page.getByLabel('Scenario')).toHaveValue('baseline-normal-operation');
  await expect(page.getByRole('heading', {name: 'Remote Direct Memory Access'})).toBeVisible();
});

test('cross-tier relationships remain discoverable and semantic outline mirrors visual targets', async ({page}) => {
  await page.goto('./');
  await expect(page.getByRole('region', {name: 'Explore semantic structure'})).toBeVisible();
  await expect(page.getByText('Cross-connections beyond this visual grouping')).toBeVisible();
  await expect(page.getByText('Intra-node NVLink/NVSwitch fabric').first()).toBeVisible();
});

test('moving outward by breadcrumb preserves a meaningful deeper Selection and marks its visible ancestor', async ({page}) => {
  await page.goto('./');
  await selectH100Gpu(page);
  await page.getByRole('button', {name: 'Scalable Unit (representative)'}).click();
  await expect(page.getByRole('heading', {name: 'NVIDIA H100 GPUs'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Clear selection'})).toBeVisible();
  const aggregate = page.locator('.semantic-outline button').filter({hasText: 'DGX H100 compute node'}).first();
  await expect(aggregate).toContainText('Contains current selection');
});

test('Follow retains the physical origin and relationship as traversal context', async ({page}) => {
  await page.goto('./');
  await enterRepresentativeH100Node(page);
  const relationship = page.locator('.connection-cards button').filter({hasText: 'DGX node to compute fabric'}).first();
  await relationship.click();
  await page.getByRole('button', {name: 'Follow to Compute-fabric InfiniBand switches'}).click();
  await expect(page.getByText('Traversal context')).toBeVisible();
  await expect(page.getByText('Representative Compute node')).toBeVisible();
  await expect(page.getByText('DGX node to compute fabric')).toBeVisible();
});

test('nested representative breadcrumbs retain exemplar terminology', async ({page}) => {
  await page.goto('./');
  await selectH100Gpu(page);
  await page.getByRole('button', {name: 'Explore representative member'}).click();
  await expect(page.getByRole('heading', {name: 'Representative GPU'})).toBeVisible();
  await expect(page.locator('.breadcrumbs')).toContainText('Representative GPU');
});

test('Concept search includes explanatory Markdown at lower weight', async ({page}) => {
  await page.goto('./');
  await page.getByRole('button', {name: 'Concepts'}).click();
  await page.getByLabel('Search concepts').fill('asynchronous queue-based communication');
  await expect(page.getByRole('button', {name: /^Remote Direct Memory Access/})).toBeVisible();
});

test('root Current Location Detail surfaces authored scope and modeling limitations', async ({page}) => {
  await page.goto('./');
  await expect(page.getByLabel('Detail')).toContainText('Initial educational model');
  await expect(page.getByLabel('Detail')).toContainText('Rack placement');
});

test('friendly labels replace raw IDs in Concept occurrences', async ({page}) => {
  await page.goto('./');
  await page.getByRole('button', {name: 'Concepts'}).click();
  await page.getByLabel('Search concepts').fill('scale up');
  await page.getByRole('button', {name: /Scale-up versus scale-out/}).first().click();
  const occurrence = page.locator('button.occurrence').first();
  await expect(occurrence).toBeVisible();
  await expect(occurrence).not.toContainText('h100-');
});

test('narrow layout preserves readable canvas by scrolling instead of shrinking the entire scene', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('./');
  const dimensions = await page.locator('.canvas-viewport').evaluate((viewport) => ({
    clientWidth: viewport.clientWidth,
    scrollWidth: viewport.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  await expect(page.locator('svg.explore-canvas')).toHaveCSS('min-width', '760px');
});
