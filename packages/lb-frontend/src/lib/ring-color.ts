// 2024用の値

export const getRingColor = (score: number) => {
  if (score >= 400) return '#00cc65';
  if (score >= 200) return '#ffaa35';
  return '#fa3435';
};

export const maxScore = 700;
