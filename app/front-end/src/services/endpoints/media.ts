import type { MediaItem, UploadResponse } from '@/types/api';
import {
  uploadImage as uploadImageImpl,
  getMediaFiles as getMediaFilesImpl,
  getMediaById as getMediaByIdImpl,
  deleteMediaFile as deleteMediaFileImpl,
  deleteCloudinaryImage as deleteCloudinaryImageImpl,
} from '../api';

/**
 * Media endpoints aggregator
 *
 * This module provides a thin documented wrapper around the media functions
 * implemented in `src/services/api.ts`. Keeping a wrapper here allows adding
 * logging, metrics or provider switching later without changing consumers.
 */

/**
 * Upload an image file to the backend.
 * @param file - File object to upload
 * @param imageType - optional image type: 'profile' | 'project' | 'avatar' (default: 'project')
 * @returns Promise resolving to an UploadResponse which includes the uploaded MediaItem
 *
 * @example
 * const resp = await media.uploadImage(file, 'profile');
 * console.log(resp.file.url);
 */
export const uploadImage = (
  file: File,
  imageType: 'profile' | 'project' | 'avatar' = 'project'
): Promise<UploadResponse> => uploadImageImpl(file, imageType);

/**
 * Get all media items available to the current user.
 * @returns Promise<MediaItem[]>
 */
export const getMediaFiles = (): Promise<MediaItem[]> => getMediaFilesImpl();

/**
 * Get a single media item by id.
 * @param id - media id
 * @returns Promise<MediaItem>
 */
export const getMediaById = (id: string): Promise<MediaItem> => getMediaByIdImpl(id);

/**
 * Delete a media file by filename (backend record/file)
 * @param filename - filename as stored in the backend
 * @returns Promise<{ success: boolean; message: string }>
 */
export const deleteMediaFile = (filename: string): Promise<{ success: boolean; message: string }> =>
  deleteMediaFileImpl(filename);

/**
 * Delete an image stored in Cloudinary by public id.
 * This calls the backend endpoint that in turn requests Cloudinary removal.
 * @param publicId - Cloudinary public_id for the resource
 */
export const deleteCloudinaryImage = (
  publicId: string
): Promise<{ success: boolean; message: string }> => deleteCloudinaryImageImpl(publicId);

// Re-export types for consumers of the endpoints namespace
export type { MediaItem, UploadResponse };
