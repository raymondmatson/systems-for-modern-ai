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

test('Explore SVG exposes the approved composable layer order without changing semantic targets', async ({page}) => {
  await page.goto('./');
  const layers = await page.locator('svg.explore-canvas > g[data-layer]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-layer')),
  );
  expect(layers).toEqual([
    'scenario-underlays',
    'enclosure-frame',
    'anatomy-context',
    'connections-routing',
    'interactive-entity-shells',
    'labels-counts-role-rails',
    'scenario-markers',
    'selection-focus-descendant-overlays',
  ]);

  const firstTarget = page.locator('svg [data-layer="interactive-entity-shells"] [role="button"]').first();
  await firstTarget.focus();
  await expect(page.getByLabel('Inspect preview')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(firstTarget).toHaveAttribute('aria-pressed', 'true');
});

test('Phase 2 enclosure and component shell cues remain presentation-only and keyboard reachable', async ({page}) => {
  await page.goto('./');
  const rootEnclosure = page.locator('svg [data-layer="enclosure-frame"] .scene-enclosure');
  await expect(rootEnclosure).toHaveAttribute('data-shell-family', 'system-domain');
  await expect(rootEnclosure).toHaveAttribute('data-representative', 'false');

  await enterRepresentativeH100Node(page);
  const representativeEnclosure = page.locator('svg [data-layer="enclosure-frame"] .scene-enclosure');
  await expect(representativeEnclosure).toHaveAttribute('data-shell-family', 'assembly');
  await expect(representativeEnclosure).toHaveAttribute('data-representative', 'true');

  const gpu = page.locator('svg [data-layer="interactive-entity-shells"] [role="button"][aria-label*="NVIDIA H100 GPUs"]').first();
  await expect(gpu).toHaveAttribute('data-visual-role', 'compute');
  await expect(gpu).toHaveAttribute('data-shell-family', 'device');
  await expect(gpu).toHaveAttribute('data-has-media', 'false');
  await expect(gpu).toHaveAttribute('data-population', '×8');
  await expect(gpu).toHaveAttribute('data-media-mode', /full|compact/);
  const mediaMode = await gpu.getAttribute('data-media-mode');
  await expect(gpu.locator('.node-media-region')).toHaveCount(mediaMode === 'full' ? 1 : 0);
  await expect(gpu.locator('.node-stack-backplate')).toHaveCount(2);

  await gpu.focus();
  await expect(page.getByLabel('Inspect preview')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(gpu).toHaveAttribute('aria-pressed', 'true');
});

test('cross-tier relationships remain discoverable and semantic outline mirrors visual targets', async ({page}) => {
  await page.goto('./');
  await expect(page.getByRole('region', {name: 'Explore semantic structure'})).toBeVisible();
  await expect(page.getByText('Cross-connections beyond this enclosure')).toBeVisible();
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

test('authored Anatomy Depictions are visible but noninteractive and summarized accessibly', async ({page}) => {
  await page.goto('./');
  await enterRepresentativeH100Node(page);

  const depiction = page.locator('svg .anatomy-depiction').first();
  await expect(depiction).toBeVisible();
  await expect(depiction).toHaveAttribute('aria-hidden', 'true');
  await expect(depiction).toHaveAttribute('data-evidence-status', /documented|inferred|simplified|proprietary|unknown/);
  await expect(depiction).not.toHaveAttribute('tabindex', /.+/);
  const anatomyRegion = page.locator('svg .composition-region[data-region-kind="anatomy-support"]');
  await expect(anatomyRegion).toBeVisible();
  await expect(anatomyRegion.locator('.composition-region-label')).toContainText('Physical anatomy');
  const enclosure = page.locator('svg .scene-enclosure').first();
  const [enclosureBox, anatomyBox] = await Promise.all([enclosure.boundingBox(), depiction.boundingBox()]);
  expect(enclosureBox).not.toBeNull();
  expect(anatomyBox).not.toBeNull();
  expect(anatomyBox!.y).toBeGreaterThanOrEqual(enclosureBox!.y);
  expect(anatomyBox!.y + anatomyBox!.height).toBeLessThanOrEqual(enclosureBox!.y + enclosureBox!.height + 1);

  await expect(page.getByLabel('Detail')).toContainText('Visible anatomy');
  await expect(page.getByRole('region', {name: 'Explore semantic structure'}).locator('.anatomy-depiction')).toHaveCount(0);
});

test('relationship-enterable switch interiors expose physical anatomy instead of an empty scene', async ({page}) => {
  await page.goto('./');
  const computeSwitches = page.locator('svg [role="button"][aria-label*="Compute-fabric InfiniBand switches"]').first();
  await computeSwitches.click();
  await page.getByRole('button', {name: 'Enter'}).click();

  await expect(page.getByRole('heading', {name: 'Compute-fabric InfiniBand switches'})).toBeVisible();
  await expect(page.locator('svg .anatomy-depiction')).toHaveCount(5);
  await expect(page.locator('svg .anatomy-depiction').first()).toHaveAttribute('data-evidence-status', 'documented');
  await expect(page.locator('svg .empty-scene')).toHaveCount(0);
});

test('Phase 4 connection syntax, boundary stubs, and contextual key remain semantic and keyboard reachable', async ({page}) => {
  await page.goto('./');
  await enterRepresentativeH100Node(page);

  await expect(page.getByRole('heading', {name: 'Connection key'})).toBeVisible();
  await expect(page.getByText('Physical connectivity').first()).toBeVisible();
  await expect(page.getByText('Data / communication path').first()).toBeVisible();
  const boundary = page.locator('svg .boundary-edge[role="button"]').first();
  await expect(boundary).toBeVisible();
  await expect(boundary).toHaveAttribute('data-connection-visibility', 'boundary');
  await boundary.focus();
  await expect(page.getByLabel('Inspect preview')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(boundary).toHaveAttribute('aria-pressed', 'true');
});

test('Phase 5A calibrated boundary labels preserve full pilot destination names without ellipsis', async ({page}) => {
  await page.goto('./');
  await enterRepresentativeH100Node(page);

  const boundaryLabels = page.locator('svg .boundary-stub-label');
  await expect(boundaryLabels).toHaveCount(4);
  const labelState = await boundaryLabels.evaluateAll((labels) => labels.map((label) => ({
    text: label.textContent ?? '',
    lineCount: label.querySelectorAll('tspan').length,
  })));
  expect(labelState.every((label) => label.lineCount >= 1 && label.lineCount <= 2)).toBe(true);
  expect(labelState.every((label) => !label.text.includes('…'))).toBe(true);
  expect(labelState.some((label) => label.text.includes('Compute-fabric InfiniBand') && label.text.includes('switches'))).toBe(true);
  expect(labelState.some((label) => label.text.includes('Storage-fabric InfiniBand') && label.text.includes('switches'))).toBe(true);
});

test('Phase 5 Scenario strip and orthogonal node state overlays coexist without replacing base role cues', async ({page}) => {
  await page.goto('./');
  await page.getByLabel('Scenario').selectOption('checkpoint-storage-pressure');
  const strip = page.getByRole('region', {name: 'Scenario context'});
  await expect(strip).toContainText('Checkpoint / storage pressure');
  await expect(strip).toContainText('Physical structure unchanged');
  await expect(strip).toContainText('Affected:');

  await enterRepresentativeH100Node(page);
  const storageNic = page.locator('svg [role="button"][aria-label*="ConnectX-7 storage / in-band Ethernet cards"]').first();
  await storageNic.focus();
  await expect(page.locator('svg .node-focus-brackets')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(page.locator('svg .node-selection-ring')).toHaveCount(1);
  await expect(storageNic).toHaveAttribute('data-visual-role', 'io_interconnect');
});


test('reduced-motion preference removes presentation transitions and animations', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('./');
  const node = page.locator('svg .node[role="button"]').first();
  const motion = await node.evaluate((element) => {
    const style = getComputedStyle(element);
    return {transitionDuration: style.transitionDuration, animationDuration: style.animationDuration};
  });
  expect(motion.transitionDuration).toBe('0s');
  expect(motion.animationDuration).toBe('0s');
});

test('forced-colors mode retains non-color Selection, focus, and relationship-family cues', async ({page}) => {
  await page.emulateMedia({forcedColors: 'active'});
  await page.goto('./');
  await page.getByLabel('Scenario').selectOption('checkpoint-storage-pressure');
  await enterRepresentativeH100Node(page);

  const storageNic = page.locator('svg [role="button"][aria-label*="ConnectX-7 storage / in-band Ethernet cards"]').first();
  await storageNic.focus();
  await expect(page.locator('svg .node-focus-brackets')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(page.locator('svg .node-selection-ring')).toHaveCount(1);

  const physical = page.locator('svg .edge[data-relationship-type="physical_connectivity"]').first();
  const dataPath = page.locator('svg .edge[data-relationship-type="data_communication_path"]').first();
  await expect(physical).toBeVisible();
  await expect(dataPath).toBeVisible();
  expect(await physical.locator('.edge-endpoint-marker').count()).toBeGreaterThan(0);
  expect(await dataPath.locator('.edge-endpoint-marker').count()).toBeGreaterThan(0);
});

test('semantic outline and SVG target remain state-parallel for the same entity', async ({page}) => {
  await page.goto('./');
  await enterRepresentativeH100Node(page);

  const visual = page.locator('svg [role="button"][aria-label*="NVIDIA H100 GPUs"]').first();
  const semantic = page
    .getByRole('region', {name: 'Explore semantic structure'})
    .locator('button')
    .filter({hasText: 'NVIDIA H100 GPUs'})
    .first();

  await semantic.click();
  await expect(semantic).toHaveAttribute('aria-pressed', 'true');
  await expect(visual).toHaveAttribute('aria-pressed', 'true');
  await visual.focus();
  await expect(page.locator('svg .node-focus-brackets')).toHaveCount(1);
});

test('boundary relationship remains selectable and Follow preserves traversal context', async ({page}) => {
  await page.goto('./');
  await enterRepresentativeH100Node(page);

  const boundary = page.locator('svg .boundary-edge[role="button"]').first();
  await boundary.focus();
  await page.keyboard.press('Enter');
  await expect(boundary).toHaveAttribute('aria-pressed', 'true');
  const follow = page.getByRole('button', {name: /^Follow to /}).first();
  await expect(follow).toBeVisible();
  await follow.click();
  await expect(page.getByText('Traversal context')).toBeVisible();
  await expect(page.getByText('Via relationship')).toBeVisible();
});
