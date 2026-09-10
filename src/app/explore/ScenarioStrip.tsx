/**
 * Phase 1 keeps the existing Scenario description presentation. Phase 5 owns
 * the instructional strip styling and affected-target summary.
 */
export function ScenarioStrip({description}: {description: string | undefined}) {
  return <p>{description}</p>;
}
