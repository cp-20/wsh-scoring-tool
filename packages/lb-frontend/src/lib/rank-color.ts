export const getRankColor = (rank: number) => {
  if (rank === 1) return "linear-gradient(220.55deg, #FFD439 0%, #FF7A00 100%)";
  if (rank === 2) return "linear-gradient(220.55deg, #EAEAEA 0%, #8B8B8B 100%)";
  if (rank === 3) return "linear-gradient(220.55deg, #FADD76 0%, #9F3311 100%)";
  return "gray";
};
