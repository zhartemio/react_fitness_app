import { useMemo, useState } from 'react';

import { WorkoutImageMetadata, WorkoutRecord } from '@/src/models/types';
import { getImageKitImageUrl, uploadImageToImageKit } from '@/src/services/imageService';

interface UploadOptions {
  category: WorkoutRecord['category'];
}

export function useWorkoutImageUpload() {
  const [imageUri, setImageUri] = useState('');
  const [metadata, setMetadata] = useState<WorkoutImageMetadata>({});
  const [isUploading, setIsUploading] = useState(false);

  const previewUrl = useMemo(() => getImageKitImageUrl(metadata.imageUrl || imageUri), [metadata.imageUrl, imageUri]);
  const hasImage = Boolean(imageUri || metadata.imageUrl || metadata.imageFilePath);

  const setImageSource = (uri: string) => {
    setImageUri(uri);
    setMetadata({});
  };

  const clearImage = () => {
    setImageUri('');
    setMetadata({});
  };

  const loadFromRecord = (record: WorkoutRecord) => {
    setImageUri('');
    setMetadata({
      imageUrl: record.imageUrl,
      imageFileId: record.imageFileId,
      imageFilePath: record.imageFilePath,
    });
  };

  const reset = () => {
    setImageUri('');
    setMetadata({});
  };

  const uploadPendingImage = async ({ category }: UploadOptions) => {
    const source = imageUri.trim();

    if (!source) {
      return metadata;
    }

    setIsUploading(true);

    try {
      const uploaded = await uploadImageToImageKit(source, {
        tags: ['fitness-app', category],
      });
      const nextMetadata = {
        imageUrl: uploaded.url,
        imageFileId: uploaded.fileId,
        imageFilePath: uploaded.filePath,
      };

      setMetadata(nextMetadata);
      setImageUri('');

      return nextMetadata;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    imageUri,
    metadata,
    previewUrl,
    hasImage,
    isUploading,
    setImageSource,
    clearImage,
    loadFromRecord,
    reset,
    uploadPendingImage,
  };
}
