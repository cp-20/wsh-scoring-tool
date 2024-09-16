import { generateScenarios as generateScenarios2024 } from "./scenarios/2024";
import { measure, PageScoreResult } from "./scoring";

export const measure2024 = (
  entrypoint: string,
  callback: (result: PageScoreResult) => unknown,
) => measure(entrypoint, generateScenarios2024(entrypoint), callback);
