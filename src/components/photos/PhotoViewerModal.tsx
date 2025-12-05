'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Photo } from '@/types';
import { Button } from '@/components/ui/button';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';

interface PhotoViewerModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onFavorite?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function PhotoViewerModal({
  photo,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  onFavorite,
  onDelete,
  onDownload,
  hasPrevious = false,
  hasNext = false,
}: PhotoViewerModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious) onPrevious?.();
          break;
        case 'ArrowRight':
          if (hasNext) onNext?.();
          break;
      }
    },
    [isOpen, onClose, onPrevious, onNext, hasPrevious, hasNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !photo) return null;

  const isVideo = photo.mime_type?.startsWith('video/');
  const takenAt = photo.taken_at ? new Date(photo.taken_at).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent flex items-center justify-between px-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>

        <div className="flex items-center gap-2">
          {/* Favorite */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFavorite?.(photo.id)}
            className="text-white hover:bg-white/20"
          >
            <svg
              className="w-6 h-6"
              fill={photo.is_favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload?.(photo.id)}
            className="text-white hover:bg-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(photo.id)}
            className="text-white hover:bg-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center p-16">
        {isVideo ? (
          <video
            src={`${STORAGE_URL}/${photo.file_path}`}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={`${STORAGE_URL}/${photo.file_path}`}
              alt={photo.original_filename}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {hasPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Photo info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <p className="text-white font-medium">{photo.original_filename}</p>
        {takenAt && <p className="text-white/70 text-sm">{takenAt}</p>}
        {photo.location && <p className="text-white/70 text-sm">{photo.location}</p>}
      </div>
    </div>
  );
}
