import React from 'react';

export interface ScoreChipProps {
  score: number | null | undefined; // Accepts 0..1 or 0..100
  className?: string;
}

export const ScoreChip: React.FC<ScoreChipProps> = ({ score, className = '' }) => {
  if (score == null || isNaN(score)) return null;

  // Normalize: if <= 1, convert to 0..100
  const normalized = score <= 1 && score > 0 ? Math.round(score * 100) : Math.round(score);

  let tone: 'high' | 'med' | 'low' = 'low';
  if (normalized >= 90) tone = 'high';
  else if (normalized >= 70) tone = 'med';

  const classes = ['ui-score-chip', `ui-score-chip--${tone}`, className].filter(Boolean).join(' ');

  return <span className={classes}>{normalized}</span>;
};
