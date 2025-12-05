'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PhotoGrid from '@/components/photos/PhotoGrid';

export default function VideosPage() {
  const [videos, setVideos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchVideos = async () => {
    try {
      const response = await api.videos.list();
      setVideos(response.data);
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch video');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (ids: number[]) => {
    try {
      for (const id of ids) {
        await api.videos.delete(id);
      }
      setVideos(videos.filter((v) => !ids.includes(v.id)));
      setSelectedIds([]);
      toast.success(`ÄÃ£ xÃ³a ${ids.length} video`);
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ xÃ³a video');
    }
  };

  const handleFavorite = async (id: number) => {
    try {
      await api.videos.toggleFavorite(id);
      setVideos(videos.map((v) =>
        v.id === id ? { ...v, is_favorite: !v.is_favorite } : v
      ));
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ cáº­p nháº­t yÃªu thÃ­ch');
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
        <h1 className="text-2xl font-bold">Video</h1>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">ÄÃ£ chá»n {selectedIds.length}</span>
            <Button variant="outline" onClick={() => setSelectedIds([])}>
              Bá» chá»n
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(selectedIds)}>
              XÃ³a
            </Button>
          </div>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p className="text-gray-500">ChÆ°a cÃ³ video nÃ o</p>
        </div>
      ) : (
        <PhotoGrid
          photos={videos}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onFavorite={handleFavorite}
          onDelete={(id: number) => handleDelete([id])}
        />
      )}
    </div>
  );
}

