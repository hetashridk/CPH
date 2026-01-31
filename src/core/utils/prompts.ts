
import { ModularPrompt } from '../types';

export const emptyPrompt = (): ModularPrompt => ({ 
    goal: '', 
    product: '', 
    subject: '', 
    storyline: '', 
    mentalCamera: '', 
    lighting: '', 
    surfacesMaterials: '', 
    environment: '', 
    realism: [], 
    styleDNA: '', 
    colorPalette: [], 
    imperfections: [], 
    negativePrompting: '' 
});