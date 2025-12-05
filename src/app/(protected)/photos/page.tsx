'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Photo } from '@/types';
import { api } from '@/lib/api/client';
import PhotoGrid from '@/components/photos/PhotoGrid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function PhotosPage() {
  const searchParams = useSearchParams();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const search = searchParams.get('search') || '';

  const fetchPhotos = useCallback(async (pageNum: number, searchQuery: string) => {
    try {
      const response = await api.photos.list({ page: pageNum, search: searchQuery });
      const newPhotos = response.data as Photo[];
      
      if (pageNum === 1) {
        setPhotos(newPhotos);
      } else {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }
      
      setHasMore(newPhotos.length >= 20);
    } catch (error) {
      toast.error('Khong the tai danh sach anh');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setIsLoading(true);
    fetchPhotos(1, search);
  }, [search, fetchPhotos]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(nextPage, search);
  };

  const handleFavorite = async (id: number) => {
    try {
      await api.photos.toggleFavorite(id);
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, is_favorite: !p.is_favorite } : p
        )
      );
      toast.success('Da cap nhat yeu thich');
    } catch (error) {
      toast.error('Khong the cap nhat yeu thich');
    }
  };

  const handleDelete = async (ids: number[]) => {
    try {
      for (const id of ids) {
        await api.photos.delete(id);
      }
      setPhotos((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelectedIds([]);
      toast.success(`Da xoa ${ids.length} anh vao thung rac`);
    } catch (error) {
      toast.error('Khong the xoa anh');
    }
  };

  if (isLoading && photos.length === 0) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Selection bar */}
      {selectedIds.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedIds([])}
              className="text-white hover:bg-blue-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            <span className="font-medium">Da chon {selectedIds.length} anh</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => handleDelete(selectedIds)}
              className="text-white hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xoa
            </Button>
          </div>
        </div>
      )}

      {/* Photos grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">
            {search ? 'Khong tim thay anh nao' : 'Chua co anh nao'}
          </p>
        </div>
      ) : (
        <>
          <PhotoGrid
            photos={photos}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onFavorite={handleFavorite}
            onDelete={(id: number) => handleDelete([id])}
          />
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore} variant="outline">
                Tai them
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

