import { generateScenarios } from './scenarios/2024';
import { measure } from './scoring';
const entrypoint = 'http://localhost:8000';

await measure(entrypoint, generateScenarios(entrypoint));
