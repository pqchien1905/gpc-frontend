'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/types';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';

interface PhotoCardProps {
  photo: Photo;
  isSelected?: boolean;
  selectionMode?: boolean;
  onSelect?: (id: number) => void;
  onFavorite?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function PhotoCard({
  photo,
  isSelected = false,
  selectionMode = false,
  onSelect,
  onFavorite,
  onDelete,
}: PhotoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const isVideo = photo.mime_type?.startsWith('video/');

  const handleClick = () => {
    if (selectionMode && onSelect) {
      onSelect(photo.id);
    }
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
      {/* Thumbnail */}
      <Image
        src={`${STORAGE_URL}/${photo.thumbnail_path || photo.file_path}`}
        alt={photo.original_filename}
        fill
        className="object-cover group-hover:scale-105 transition-transform"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
      />

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
