import type { Image } from './types';

// This function is now a utility to find an image from a given array of image documents.
// It no longer fetches from a static JSON file.
export function findImageById(imageId: string, allImages: Image[] | null | undefined): Image | null {
    if (!allImages) {
        return null;
    }
    return allImages.find(img => img.id === imageId) || null;
}

// A fallback image to prevent crashes when an image is not found.
export function getFallbackImage(id: string = 'not-found'): Image {
     return {
        id,
        url: `https://picsum.photos/seed/${id}/600/400`,
        altText: 'Placeholder image',
        uploadDate: new Date().toISOString(),
        usageContext: 'fallback'
    };
}
