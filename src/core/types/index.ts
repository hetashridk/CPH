
import type React from 'react';

export type View = 'startHere' | 'brandManagement' | 'brandCreator' | 'productManagement' | 'styleLab' | 'workshop' | 'repose' | 'batchJobs' | 'genContent' | 'videoLab' | 'performance' | 'backend' | 'customizeSystem' | 'costBilling' | 'batchJobDetail' | 'resourceIntelligence';
export type Industry = string;

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type ImageSize = '1K' | '2K' | '4K';

export interface Bucket {
  id: string;
  name: string;
}

export interface ReposeIdeaSet {
  id: string;
  name: string;
  ideas: [string, string, string, string, string];
}

export interface SourceImage {
  data: string; // base64 or URL
  description: string;
}

export interface BrandDNA {
    brandEssence: string;
    targetAudience: string;
    visualStyle: string[];
    toneOfVoice: string[];
}

export interface Brand {
    id: string;
    name: string;
    industry: Industry;
    websiteUrl?: string;
    status: 'analyzing' | 'needs_review' | 'approved';
    dna: BrandDNA;
}

export interface ProductDNA {
    bestUseCase: string;
    emotionalTriggers: string;
}

export interface VideoPromptDNA {
  shotType: string;
  cameraMovement: string;
  cameraAngle: string;
  subjectAction: string;
  sceneDescription: string;
  lightingStyle: string;
  timeOfDay: string;
  environment: string;
  mood: string;
  colorGrade: string;
  filmStock: string;
  fx: string;
  duration: string;
  negativePrompt: string;
}

export interface GeneratedVideo {
  id: string;
  productId: string;
  sourceImageId?: string;
  videoUrl: string;
  prompt: VideoPromptDNA;
  createdAt: string;
}

export interface Product {
  id: string;
  brandId: string;
  bucketId?: string | null;
  name: string;
  description: string;
  dna?: ProductDNA;
  sourceImages: SourceImage[];
  generatedImages: GeneratedImage[];
  generatedVideos?: GeneratedVideo[];
  status?: 'processing' | 'complete';
  statusLastUpdatedAt?: string;
  aspectRatio: AspectRatio;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  } | null;
}

export interface GeneratedImage {
  id: string;
  productId: string;
  imageData: string; // URL
  mimeType: string;
  prompt: ModularPrompt;
  approved: boolean;
  createdAt: string; // ISO Date string
  source: 'workshop' | 'batch_job' | 'unknown' | 'repose';
  batchJobId?: string | null;
  stylePresetId?: string;
  quality?: ImageSize;
}

// Enriched type for display components like the fullscreen viewer
export interface EnrichedImage extends GeneratedImage {
    productName: string;
    styleName: string;
    productAspectRatio: string;
}

export interface ModularPrompt {
  goal: string;
  product: string;
  subject: string;
  storyline: string;
  mentalCamera: string;
  lighting: string;
  surfacesMaterials: string;
  environment: string;
  realism: string[];
  styleDNA: string;
  colorPalette: string[];
  imperfections: string[];
  negativePrompting: string;
}

export interface StylePreset {
  id: string;
  bucketId?: string | null;
  name: string;
  prompt: ModularPrompt;
  referenceImages: string[]; // URLs
  status: 'complete' | 'pending_image' | 'generating_image' | 'failed';
  statusLastUpdatedAt?: string;
  jobId?: string; // Track the generation task
  previewSubject?: string; // The product name used to generate the preview
}

export interface GenerationLog {
    id: string;
    timestamp: string;
    productName: string;
    status: 'success' | 'failure';
    duration: number;
    action: string; // e.g., "Batch Generation", "Style Creation"
    cost: number;
    tokens?: number; // Estimated or actual token usage
}

export interface BatchJob {
  id: string;
  name: string;
  createdAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  statusLastUpdatedAt?: string;
  archived?: boolean;
  config: {
    productIds: string[];
    bucketIds?: string[];
    stylePresetIds: string[];
    customInstruction?: string;
    quality: ImageSize;
    aspectRatio?: AspectRatio;
  };
  totalImages: number;
  completedImages: number;
  estimatedTime: number; // in seconds
  estimatedCost: number; // in "credits"
  progressDetails?: Record<string, 'completed' | 'failed'>;
}

export interface SystemInstructions {
    analyzeBrandFromUrl: string;
    analyzePackagedFoodSingle: string;
    analyzePackagedFoodMulti: string;
    analyzeGenericProduct: string;
    analyzeHomeDecorProduct: string;
    analyzeRealEstateListing: string;
    autoGroupImages: string;
    generatePromptFromIdea: string;
    generateStyleFromBatch: string;
    createStylePresetFromIdea: string;
    generateStylePresetName: string;
    generateReferenceImageForPreset: string;
    generateProductionImage: string;
    generateProductionImageWithSource: string;
    refineGeneratedImage: string;
    styleAssistant: string;
}
