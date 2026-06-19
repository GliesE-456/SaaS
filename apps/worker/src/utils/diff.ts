import * as Diff from 'diff';

export function computeDiff(oldText: string, newText: string) {
  const diffResult = Diff.diffLines(oldText, newText);
  let additions = 0;
  let deletions = 0;
  let totalLength = Math.max(oldText.length, newText.length, 1);
  let changedLength = 0;

  const diffJson = diffResult.map(part => {
    let type: 'added' | 'removed' | 'unchanged' = 'unchanged';
    if (part.added) {
      type = 'added';
      additions++;
      changedLength += part.value.length;
    } else if (part.removed) {
      type = 'removed';
      deletions++;
      changedLength += part.value.length;
    }
    return {
      type,
      content: part.value,
    };
  });

  const changePercent = (changedLength / totalLength) * 100;
  
  let impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (changePercent > 30) impactLevel = 'HIGH';
  else if (changePercent > 10) impactLevel = 'MEDIUM';

  return {
    diffJson,
    changePercent,
    impactLevel,
    hasChanges: additions > 0 || deletions > 0
  };
}
