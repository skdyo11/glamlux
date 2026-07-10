'use client';

import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Ensure PlaceHolderImages is always an array, even if the JSON import is unexpected
export const PlaceHolderImages: ImagePlaceholder[] = (data as any)?.placeholderImages || [];
