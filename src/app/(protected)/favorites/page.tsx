'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PhotoGrid from '@/components/photos/PhotoGrid';

export default function FavoritesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchFavorites = async () => {
    try {
      const response = await api.photos.favorites();
      setPhotos(response.data as Photo[]);
    } catch (error) {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (id: number) => {
    try {
      await api.photos.toggleFavorite(id);
      setPhotos(photos.filter((p) => p.id !== id));
      toast.success('Đã xóa khỏi yêu thích');
    } catch (error) {
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Yêu thích</h1>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Đã chọn {selectedIds.length}</span>
            <Button variant="outline" onClick={() => setSelectedIds([])}>
              Bỏ chọn
            </Button>
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-500">Chưa có ảnh yêu thích nào</p>
          <p className="text-gray-400 text-sm mt-2">Nhấn vào biểu tượng trái tim trên ảnh để thêm vào đây</p>
        </div>
      ) : (
        <PhotoGrid
          photos={photos}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onFavorite={handleRemoveFavorite}
        />
      )}
    </div>
  );
}
