export function localAssessmentCommandIssues(assessments) {
  if (!assessments || typeof assessments !== 'object' || Array.isArray(assessments)) {
    return [{id: '(assessments)', code: 'INVALID_ASSESSMENTS', message: 'Assessment source must be an object.'}];
  }

  return Object.entries(assessments).flatMap(([id, assessment]) => {
    if (assessment?.environment !== 'local') return [];
    const commands = assessment.local?.commands;
    const valid = Array.isArray(commands) && commands.length > 0 && commands.every(command =>
      Array.isArray(command) && command.length > 0 && command.every(argument => typeof argument === 'string' && argument.length > 0));
    return valid ? [] : [{
      id,
      code: 'LOCAL_COMMANDS_MISSING',
      message: `Local assessment ${id} must declare non-empty structured local.commands.`,
    }];
  });
}

export function localCheckpointDefinitionIssues(definitions) {
  const issues = [];
  if (!definitions || typeof definitions !== 'object' || Array.isArray(definitions)) {
    return [{id: '(source)', code: 'INVALID_CHECKPOINT_SOURCE', message: 'Checkpoint source must be an object.'}];
  }
  if (definitions.schemaVersion !== 1) issues.push({id: '(source)', code: 'INVALID_CHECKPOINT_SCHEMA', message: 'Checkpoint source schemaVersion must be 1.'});
  if (!Array.isArray(definitions.targets) || definitions.targets.length === 0) {
    issues.push({id: '(source)', code: 'CHECKPOINT_TARGETS_MISSING', message: 'Checkpoint source must declare targets.'});
    return issues;
  }

  const seen = new Set();
  for (const target of definitions.targets) {
    const id = typeof target?.id === 'string' ? target.id : '(missing id)';
    if (!/^\d{2}\.\d{2}$/.test(id) || seen.has(id)) issues.push({id, code: 'INVALID_CHECKPOINT_ID', message: `Checkpoint ID ${id} is missing, invalid, or duplicated.`});
    seen.add(id);
    if (!Array.isArray(target?.activityIds) || !target.activityIds.length || target.activityIds.some(activityId => typeof activityId !== 'string' || !/^\d{2}\.\d{2}$/.test(activityId))) {
      issues.push({id, code: 'INVALID_CHECKPOINT_ACTIVITIES', message: `Checkpoint ${id} must list valid activityIds.`});
    }
    const commands = target?.commands;
    if (!Array.isArray(commands) || !commands.length || commands.some(command => !Array.isArray(command) || !command.length || command.some(argument => typeof argument !== 'string' || !argument.length))) {
      issues.push({id, code: 'CHECKPOINT_COMMANDS_MISSING', message: `Checkpoint ${id} must declare non-empty structured commands.`});
    }
    if (target?.referenceActivityIds !== undefined && (!Array.isArray(target.referenceActivityIds) || target.referenceActivityIds.some(activityId => typeof activityId !== 'string' || !/^\d{2}\.\d{2}$/.test(activityId)))) {
      issues.push({id, code: 'INVALID_CHECKPOINT_REFERENCES', message: `Checkpoint ${id} referenceActivityIds must contain activity IDs.`});
    }
    if (target?.evidenceLabel !== 'learner-declared') {
      issues.push({id, code: 'CHECKPOINT_EVIDENCE_LABEL_MISSING', message: `Checkpoint ${id} must label manual evidence as learner-declared.`});
    }
    if (target?.reviewStep !== undefined && (target.reviewStep?.required !== true || !Array.isArray(target.reviewStep.steps) || !target.reviewStep.steps.length || target.reviewStep.steps.some(step => typeof step !== 'string' || !step.trim()))) {
      issues.push({id, code: 'INVALID_REVIEW_STEPS', message: `Checkpoint ${id} reviewStep must contain required, non-empty steps.`});
    }
  }
  return issues;
}
