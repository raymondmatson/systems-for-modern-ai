import type {SceneScenarioPresentation} from '../../view-model/explore';

export function ScenarioStrip({scenario}: {scenario: SceneScenarioPresentation | undefined}) {
  if (!scenario) return null;
  const affected = scenario.affectedTargetLabels;
  const affectedSummary = affected.length === 0
    ? 'No explicit Scenario effects in this baseline.'
    : affected.length <= 3
      ? affected.join(' · ')
      : `${affected.slice(0, 3).join(' · ')} · +${affected.length - 3} more`;

  return (
    <section
      className={`scenario-strip ${scenario.isDefault ? 'baseline' : 'active'}`}
      aria-label="Scenario context"
      data-scenario-id={scenario.id}
    >
      <div className="scenario-strip-heading">
        <span className="scenario-symbol" aria-hidden="true">S</span>
        <div>
          <span className="eyebrow">Scenario</span>
          <strong>{scenario.name}</strong>
        </div>
      </div>
      <p>{scenario.description}</p>
      <div className="scenario-strip-meta">
        {!scenario.isDefault && <strong>{scenario.structureNotice}</strong>}
        <span><b>Affected:</b> {affectedSummary}</span>
        {scenario.representativeCaveat && <span className="scenario-representative-caveat">{scenario.representativeCaveat}</span>}
      </div>
    </section>
  );
}
