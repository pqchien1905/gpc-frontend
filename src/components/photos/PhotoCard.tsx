'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/types';

import { getStorageUrl } from '@/lib/utils/api-url';

interface PhotoCardProps {
  photo: Photo;
  isSelected?: boolean;
  selectionMode?: boolean;
  onSelect?: (id: number) => void;
  onFavorite?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (photo: Photo) => void;
}

export default function PhotoCard({
  photo,
  isSelected = false,
  selectionMode = false,
  onSelect,
  onFavorite,
  onDelete,
  onClick,
}: PhotoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryingThumbnail, setRetryingThumbnail] = useState(false);
  const isVideo = (photo.mime || photo.mime_type || '').startsWith('video/');
  const STORAGE_URL = getStorageUrl();

  const handleClick = () => {
    if (selectionMode && onSelect) {
      onSelect(photo.id);
    } else if (!selectionMode && onClick) {
      onClick(photo);
    }
  };

  // Use thumbnail if available and no error, otherwise fallback to original
  const getImageUrl = () => {
    const thumb = photo.thumb_path || photo.thumbnail_path;
    // For videos, only use thumbnail if available
    if (isVideo) {
      if (thumb && !imageError) {
        return `${STORAGE_URL}/${thumb}`;
      }
      return null;
    }
    
    // For images, use thumbnail or fallback to original
    if (imageError || !thumb) {
      const originalPath = photo.path || photo.file_path;
      return originalPath ? `${STORAGE_URL}/${originalPath}` : null;
    }
    return `${STORAGE_URL}/${thumb}`;
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const imageUrl = getImageUrl();
  const hasThumb = (photo.thumb_path || photo.thumbnail_path) && !imageError;
  const shouldShowPlaceholder = (isVideo && !hasThumb) || (!isVideo && imageError && !hasThumb);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer ${
        isSelected ? 'ring-4 ring-blue-500' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleClick}
    >
      {/* Thumbnail or Placeholder */}
      {shouldShowPlaceholder ? (
        <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          {isVideo ? (
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-500 dark:text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Video</p>
            </div>
          ) : (
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      ) : imageUrl ? (
        <>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              {isVideo ? (
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          )}
          <Image
            src={imageUrl}
            alt={photo.original_filename || 'Photo'}
            fill
            className={`object-cover group-hover:scale-105 transition-transform ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            onError={handleImageError}
            onLoad={handleImageLoad}
            unoptimized={true}
          />
        </>
      ) : null}

      {/* Video indicator */}
      {isVideo && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {photo.duration && <span>{Math.floor(photo.duration / 60)}:{String(photo.duration % 60).padStart(2, '0')}</span>}
        </div>
      )}

      {/* Selection checkbox */}
      {(selectionMode || showActions) && (
        <div
          className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white/80 border-gray-400 hover:border-blue-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(photo.id);
          }}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Action buttons */}
      {showActions && !selectionMode && (
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Favorite */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.(photo.id);
            }}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill={photo.is_favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(photo.id);
            }}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
