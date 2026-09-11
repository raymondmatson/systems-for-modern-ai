import {expect, test, type Page} from '@playwright/test';

const DEFAULT_SYSTEM = 'nvidia-dgx-h100-superpod';
const DEFAULT_CONFIGURATION = 'h100-superpod-4su-reference';
const DEFAULT_SCENARIO = 'baseline-normal-operation';


function contextSelect(page: Page, name: 'Reference System' | 'Configuration' | 'Scenario') {
  return page.getByRole('combobox', {name, exact: true});
}

function currentLocationHeading(page: Page, name: string | RegExp) {
  return page.locator('.canvas-heading').getByRole('heading', {name, level: 1});
}

function detailHeading(page: Page, name: string | RegExp) {
  return page.getByLabel('Detail').getByRole('heading', {name, level: 2});
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function interactiveEntity(page: Page, accessibleName: string) {
  return page
    .locator('svg [data-layer="interactive-entity-shells"]')
    .getByRole('button', {name: new RegExp(`^${escapeRegExp(accessibleName)},`)})
    .first();
}

async function enterRepresentativeH100Node(page: Page) {
  const scalable = interactiveEntity(page, 'Scalable Unit (representative)');
  await scalable.click();
  await page.getByRole('button', {name: 'Enter'}).click();
  const node = interactiveEntity(page, 'DGX H100 compute node');
  await node.click();
  await page.getByRole('button', {name: 'Explore representative member'}).click();
  await expect(currentLocationHeading(page, /Representative Compute node/)).toBeVisible();
}

async function selectH100Gpu(page: Page) {
  await enterRepresentativeH100Node(page);
  const gpu = interactiveEntity(page, 'NVIDIA H100 GPUs');
  await gpu.click();
  await expect(detailHeading(page, 'Representative GPU')).toBeVisible();
  return gpu;
}

test('starts in the approved default Explore context', async ({page}) => {
  await page.goto('./');
  await expect(page.getByText('Systems for Modern AI').first()).toBeVisible();
  await expect(page.getByRole('button', {name: 'Explore'})).toHaveAttribute('aria-pressed', 'true');
  await expect(contextSelect(page, 'Reference System')).toHaveValue(DEFAULT_SYSTEM);
  await expect(contextSelect(page, 'Configuration')).toHaveValue(DEFAULT_CONFIGURATION);
  await expect(contextSelect(page, 'Scenario')).toHaveValue(DEFAULT_SCENARIO);
  await expect(currentLocationHeading(page, 'DGX H100 SuperPOD')).toBeVisible();
  await expect(page.getByLabel('Detail').getByText('Current location', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Clear selection'})).toHaveCount(0);
});

test('Inspect, Select, Enter, and empty-background clearing remain distinct', async ({page}) => {
  await page.goto('./');
  const scalable = interactiveEntity(page, 'Scalable Unit (representative)');

  await scalable.hover();
  await page.waitForTimeout(275);
  await expect(page.getByLabel('Inspect preview')).toContainText('Scalable Unit');

  await scalable.click();
  await expect(page.getByRole('button', {name: 'Clear selection'})).toBeVisible();
  await expect(scalable).toHaveAttribute('aria-pressed', 'true');
  await expect(detailHeading(page, 'Scalable Unit (representative)')).toBeVisible();

  await page.locator('svg.explore-canvas').click({position: {x: 5, y: 5}});
  await expect(page.getByRole('button', {name: 'Clear selection'})).toHaveCount(0);

  await scalable.click();
  await page.getByRole('button', {name: 'Enter'}).click();
  await expect(currentLocationHeading(page, 'Scalable Unit (representative)')).toBeVisible();
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
  await expect(currentLocationHeading(page, /Representative Compute node/)).toBeVisible();
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
  await expect(currentLocationHeading(page, /Representative Compute node/)).toBeVisible();
  await expect(detailHeading(page, 'Representative GPU')).toBeVisible();
});

test('Architectural Context controls are shared in Concepts and configuration switch preserves the Concept', async ({page}) => {
  await page.goto('./');
  await page.getByRole('button', {name: 'Concepts'}).click();
  await expect(contextSelect(page, 'Reference System')).toBeVisible();
  await expect(contextSelect(page, 'Configuration')).toBeVisible();
  await expect(contextSelect(page, 'Scenario')).toBeVisible();

  await page.getByLabel('Search concepts').fill('RDMA');
  await page.getByRole('button', {name: /^Remote Direct Memory Access/}).first().click();
  await expect(page.getByRole('heading', {name: 'Remote Direct Memory Access'})).toBeVisible();

  await contextSelect(page, 'Reference System').selectOption('meta-h100-roce-24k');
  await expect(contextSelect(page, 'Scenario')).toHaveValue('baseline-normal-operation');
  await expect(page.getByRole('heading', {name: 'Remote Direct Memory Access'})).toBeVisible();
});

test('Explore SVG exposes the approved composable layer order without changing semantic targets', async ({page}) => {
  await page.goto('./');
  const canvas = page.locator('svg.explore-canvas');
  await expect(canvas).toBeVisible();
  const layers = await canvas.evaluate((svg) =>
    Array.from(svg.children)
      .filter((element) => element.tagName.toLowerCase() === 'g' && element.hasAttribute('data-layer'))
      .map((element) => element.getAttribute('data-layer')),
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

  const gpu = interactiveEntity(page, 'NVIDIA H100 GPUs');
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
  const semanticOutline = page.getByRole('region', {name: 'Explore semantic structure'});
  await expect(semanticOutline).toBeVisible();
  await expect(page.getByText('Connections summarized inside visible aggregates')).toBeVisible();
  const summarizedNvlink = page.locator('.context-connections button').filter({hasText: 'Intra-node NVLink/NVSwitch fabric'}).first();
  const semanticNvlink = semanticOutline.locator('button').filter({hasText: 'Intra-node NVLink/NVSwitch fabric'}).first();
  await expect(summarizedNvlink).toBeVisible();
  await expect(semanticNvlink).toBeVisible();
});

test('moving outward by breadcrumb preserves a meaningful deeper Selection and marks its visible ancestor', async ({page}) => {
  await page.goto('./');
  await selectH100Gpu(page);
  await page.getByRole('button', {name: 'Scalable Unit (representative)'}).click();
  await expect(detailHeading(page, 'Representative GPU')).toBeVisible();
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
  const traversal = page.getByLabel('Detail').getByRole('heading', {name: 'Traversal context', level: 3}).locator('..');
  await expect(traversal).toBeVisible();
  await expect(traversal.getByText('Representative Compute node', {exact: true})).toBeVisible();
  await expect(traversal.getByText('DGX node to compute fabric', {exact: true})).toBeVisible();
});

test('nested representative breadcrumbs retain exemplar terminology', async ({page}) => {
  await page.goto('./');
  await selectH100Gpu(page);
  await page.getByRole('button', {name: 'Explore representative member'}).click();
  await expect(currentLocationHeading(page, 'Representative GPU')).toBeVisible();
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
  const computeSwitches = interactiveEntity(page, 'Compute-fabric InfiniBand switches');
  await computeSwitches.click();
  await page.getByRole('button', {name: 'Enter'}).click();

  await expect(currentLocationHeading(page, 'Compute-fabric InfiniBand switches')).toBeVisible();
  await expect(page.locator('svg .anatomy-depiction')).toHaveCount(5);
  await expect(page.locator('svg .anatomy-depiction').first()).toHaveAttribute('data-evidence-status', 'documented');
  await expect(page.locator('svg .empty-scene')).toHaveCount(0);
});

test('Phase 4 connection syntax, boundary stubs, and contextual key remain semantic and keyboard reachable', async ({page}) => {
  await page.goto('./');
  await enterRepresentativeH100Node(page);

  const connectionKey = page.locator('.visual-key');
  await expect(connectionKey.getByRole('heading', {name: 'Connection key'})).toBeVisible();
  await expect(connectionKey.getByText('Physical connectivity', {exact: true})).toBeVisible();
  await expect(connectionKey.getByText('Data / communication path', {exact: true})).toBeVisible();
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
  await contextSelect(page, 'Scenario').selectOption('checkpoint-storage-pressure');
  const strip = page.getByRole('region', {name: 'Scenario context'});
  await expect(strip).toContainText('Checkpoint / storage pressure');
  await expect(strip).toContainText('Physical structure unchanged');
  await expect(strip).toContainText('Affected:');

  await enterRepresentativeH100Node(page);
  const storageNic = interactiveEntity(page, 'ConnectX-7 storage / in-band Ethernet cards');
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

test('Chromium forced-colors mode retains non-color Selection, focus, and relationship-family cues', async ({page, browserName}) => {
  test.skip(browserName !== 'chromium', 'Playwright forced-colors emulation is Chromium-only; ordinary non-color state/relationship checks still run in every configured browser.');
  await page.emulateMedia({forcedColors: 'active'});
  await page.goto('./');
  await contextSelect(page, 'Scenario').selectOption('checkpoint-storage-pressure');
  await enterRepresentativeH100Node(page);

  const storageNic = interactiveEntity(page, 'ConnectX-7 storage / in-band Ethernet cards');
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

  const visual = interactiveEntity(page, 'NVIDIA H100 GPUs');
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

test('Phase 7 Ironwood cube shows a nonsemantic flattened 3D torus with paired wraparound markers', async ({page}) => {
  await page.goto('./');
  await contextSelect(page, 'Reference System').selectOption('google-tpu7x-ironwood');
  await expect(currentLocationHeading(page, 'Ironwood TPU7x Superpod')).toBeVisible();

  const cube = interactiveEntity(page, 'Ironwood cube / rack');
  await cube.click();
  await page.getByRole('button', {name: 'Enter'}).click();
  await expect(currentLocationHeading(page, 'Ironwood cube / rack')).toBeVisible();

  const topology = page.locator('svg .topology-depiction');
  await expect(topology).toBeVisible();
  await expect(topology).toHaveAttribute('aria-hidden', 'true');
  await expect(topology).toHaveAttribute('data-topology-kind', 'flattened-3d-torus');
  await expect(topology.locator('[role="button"], [tabindex]')).toHaveCount(0);
  await expect(topology.locator('.topology-connection')).toHaveCount(3);

  for (const dimension of ['A', 'B', 'C']) {
    const connection = topology.locator(`.topology-connection[data-topology-dimension="${dimension}"]`);
    await expect(connection).toHaveCount(1);
    await expect(connection.locator('.topology-link')).toHaveCount(2);
    const markers = await connection.locator('.topology-continuation-marker').evaluateAll((items) =>
      items.map((item) => item.getAttribute('data-continuation-label')),
    );
    expect(markers).toHaveLength(2);
    expect(new Set(markers).size).toBe(1);
  }

  const guide = page.getByLabel('Flattened torus topology explanation');
  await expect(guide).toContainText('A, B, and C are abstract topology dimensions, not physical axes');
  await expect(guide).toContainText('two visually separated portions of one conceptual wraparound connection');
  await expect(page.getByRole('region', {name: 'Explore semantic structure'})).not.toContainText('A1');
});

test('Phase 7 Cerebras representative contexts compact sparse space and keep 900000 cores symbolic', async ({page}) => {
  await page.goto('./');
  await contextSelect(page, 'Reference System').selectOption('cerebras-cs3-condor-galaxy3');
  await expect(currentLocationHeading(page, 'Condor Galaxy 3')).toBeVisible();

  const cs3 = interactiveEntity(page, 'CS-3 systems');
  await cs3.click();
  await page.getByRole('button', {name: 'Explore representative member'}).click();
  await expect(currentLocationHeading(page, /Representative Compute node/)).toBeVisible();
  const cs3Canvas = page.locator('svg.explore-canvas');
  const cs3ViewBox = await cs3Canvas.getAttribute('viewBox');
  expect(Number(cs3ViewBox?.split(/\s+/)[3])).toBeLessThan(560);

  const wse = interactiveEntity(page, 'WSE-3 wafer-scale accelerator');
  await wse.click();
  await page.getByRole('button', {name: 'Enter'}).click();
  await expect(currentLocationHeading(page, /WSE-3 wafer-scale accelerator/)).toBeVisible();
  const wseCanvas = page.locator('svg.explore-canvas');
  const wseViewBox = await wseCanvas.getAttribute('viewBox');
  expect(Number(wseViewBox?.split(/\s+/)[3])).toBeLessThan(320);

  const cores = interactiveEntity(page, 'AI compute cores');
  await expect(cores).toHaveAttribute('data-population', '×900000');
  await expect(page.locator('svg [data-layer="interactive-entity-shells"] .node')).toHaveCount(3);
});
