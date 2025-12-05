'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PhotoGrid from '@/components/photos/PhotoGrid';

export default function TrashPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchTrash = async () => {
    try {
      const response = await api.photos.trash();
      setPhotos(response.data);
    } catch (error) {
      toast.error('Không thể tải thùng rác');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (ids: number[]) => {
    try {
      for (const id of ids) {
        await api.photos.restore(id);
      }
      setPhotos(photos.filter((p) => !ids.includes(p.id)));
      setSelectedIds([]);
      toast.success(`Đã khôi phục ${ids.length} ảnh`);
    } catch (error) {
      toast.error('Không thể khôi phục ảnh');
    }
  };

  const handleDeletePermanently = async (ids: number[]) => {
    if (!confirm('Ảnh sẽ bị xóa vĩnh viễn và không thể khôi phục. Tiếp tục?')) return;

    try {
      for (const id of ids) {
        await api.photos.forceDelete(id);
      }
      setPhotos(photos.filter((p) => !ids.includes(p.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa vĩnh viễn ${ids.length} ảnh`);
    } catch (error) {
      toast.error('Không thể xóa ảnh');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Tất cả ảnh trong thùng rác sẽ bị xóa vĩnh viễn. Tiếp tục?')) return;

    try {
      for (const photo of photos) {
        await api.photos.forceDelete(photo.id);
      }
      setPhotos([]);
      toast.success('Đã làm trống thùng rác');
    } catch (error) {
      toast.error('Không thể làm trống thùng rác');
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
        <div>
          <h1 className="text-2xl font-bold">Thùng rác</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ảnh trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            <>
              <span className="text-gray-600">Đã chọn {selectedIds.length}</span>
              <Button variant="outline" onClick={() => setSelectedIds([])}>
                Bỏ chọn
              </Button>
              <Button variant="outline" onClick={() => handleRestore(selectedIds)}>
                Khôi phục
              </Button>
              <Button variant="destructive" onClick={() => handleDeletePermanently(selectedIds)}>
                Xóa vĩnh viễn
              </Button>
            </>
          ) : (
            photos.length > 0 && (
              <Button variant="destructive" onClick={handleEmptyTrash}>
                Làm trống thùng rác
              </Button>
            )
          )}
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <p className="text-gray-500">Thùng rác trống</p>
        </div>
      ) : (
        <PhotoGrid
          photos={photos}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </div>
  );
}
