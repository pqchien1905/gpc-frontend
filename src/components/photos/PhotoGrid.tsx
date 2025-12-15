'use client';

import { Photo } from '@/types';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  onFavorite?: (id: number) => void;
  onDelete?: (id: number) => void;
  onPhotoClick?: (photo: Photo) => void;
  emptyMessage?: string;
}

export default function PhotoGrid({
  photos,
  selectedIds = [],
  onSelectionChange,
  onFavorite,
  onDelete,
  onPhotoClick,
  emptyMessage = 'Khong co anh nao',
}: PhotoGridProps) {
  const selectionMode = selectedIds.length > 0;

  const handleSelect = (id: number) => {
    if (!onSelectionChange) return;
    
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isSelected={selectedIds.includes(photo.id)}
          selectionMode={selectionMode}
          onSelect={handleSelect}
          onFavorite={onFavorite}
          onDelete={onDelete}
          onClick={onPhotoClick}
        />
      ))}
    </div>
  );
}
