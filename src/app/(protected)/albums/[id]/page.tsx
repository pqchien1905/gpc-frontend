'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { Album, Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import PhotoGrid from '@/components/photos/PhotoGrid';
import PhotoViewerModal from '@/components/photos/PhotoViewerModal';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = Number(params.id);

  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [availablePhotos, setAvailablePhotos] = useState<Photo[]>([]);
  const [addSelectedIds, setAddSelectedIds] = useState<number[]>([]);
  const [isFetchingPhotos, setIsFetchingPhotos] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);

  const fetchAlbum = async () => {
    try {
      const response = await api.albums.get(albumId);
      const albumData = response.data as Album;
      setAlbum(albumData);
      setNewName(albumData.name);
    } catch (error) {
      toast.error('Không thể tải album');
      router.push('/albums');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [albumId]);

  useEffect(() => {
    if (!isAddDialogOpen) {
      return;
    }
    const loadPhotos = async () => {
      setIsFetchingPhotos(true);
      try {
        const res = await api.photos.list();
        const existingIds = new Set(album?.photos?.map((p) => p.id) || []);
        const candidates = (res.data || []).filter((p: Photo) => !existingIds.has(p.id));
        setAvailablePhotos(candidates);
      } catch (error) {
        toast.error('Không thể tải danh sách ảnh');
      } finally {
        setIsFetchingPhotos(false);
      }
    };
    loadPhotos();
  }, [album?.photos, isAddDialogOpen]);

  const handleRename = async () => {
    if (!newName.trim() || !album) return;

    try {
      await api.albums.update(albumId, { name: newName });
      setAlbum({ ...album, name: newName });
      setIsEditingName(false);
      toast.success('Đã đổi tên album');
    } catch (error) {
      toast.error('Không thể đổi tên album');
    }
  };

  const handleRemovePhotos = async () => {
    if (selectedPhotos.length === 0 || !album) return;

    try {
      await api.albums.removePhotos(albumId, selectedPhotos);
      setAlbum({
        ...album,
        photos: album.photos?.filter((p: Photo) => !selectedPhotos.includes(p.id)),
      });
      setSelectedPhotos([]);
      toast.success(`Đã xóa ${selectedPhotos.length} ảnh khỏi album`);
    } catch (error) {
      toast.error('Không thể xóa ảnh khỏi album');
    }
  };

  const handleSetCover = async (photoId: number) => {
    try {
      await api.albums.setCover(albumId, photoId);
      const coverPhoto = album?.photos?.find((p: Photo) => p.id === photoId);
      if (album && coverPhoto) {
        setAlbum({ ...album, cover_photo: coverPhoto });
      }
      toast.success('Đã đặt ảnh bìa');
    } catch (error) {
      toast.error('Không thể đặt ảnh bìa');
    }
  };

  const handleAddPhotos = async () => {
    if (!addSelectedIds.length || !album) {
      toast.error('Chọn ít nhất một ảnh');
      return;
    }
    setIsAddingPhotos(true);
    try {
      await api.albums.addPhotos(albumId, addSelectedIds);
      const newPhotos = availablePhotos.filter((p) => addSelectedIds.includes(p.id));
      setAlbum({ ...album, photos: [...(album.photos || []), ...newPhotos] });
      setAddSelectedIds([]);
      setIsAddDialogOpen(false);
      toast.success(`Đã thêm ${newPhotos.length} ảnh vào album`);
    } catch (error) {
      toast.error('Không thể thêm ảnh vào album');
    } finally {
      setIsAddingPhotos(false);
    }
  };

  const openViewer = (photo: Photo) => {
    if (!album?.photos) return;
    const index = album.photos.findIndex((p) => p.id === photo.id);
    setActiveIndex(index >= 0 ? index : 0);
    setViewerOpen(true);
  };

  const handlePrevious = () => setActiveIndex((idx) => Math.max(0, idx - 1));
  const handleNext = () => setActiveIndex((idx) => Math.min((album?.photos?.length || 1) - 1, idx + 1));

  const handleViewerRemove = async (id: number) => {
    if (!album?.photos) return;
    const updatedPhotos = album.photos.filter((p) => p.id !== id);
    try {
      await api.albums.removePhotos(albumId, [id]);
      setAlbum({ ...album, photos: updatedPhotos });
      if (updatedPhotos.length === 0) {
        setViewerOpen(false);
        setActiveIndex(0);
      } else {
        setActiveIndex((prev) => Math.min(prev, updatedPhotos.length - 1));
      }
      toast.success('Đã xóa ảnh khỏi album');
    } catch (error) {
      toast.error('Không thể xóa ảnh khỏi album');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/albums')}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="text-2xl font-bold"
              autoFocus
            />
            <Button size="sm" onClick={handleRename}>Lưu</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>Hủy</Button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold cursor-pointer hover:text-blue-500"
            onClick={() => setIsEditingName(true)}
          >
            {album.name}
          </h1>
        )}

        <span className="text-gray-500">{album.photos?.length || 0} ảnh</span>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm ảnh
          </Button>
        </div>
      </div>

      {/* Selection actions */}
      {selectedPhotos.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
          <span className="font-medium">Đã chọn {selectedPhotos.length} ảnh</span>
          <Button size="sm" variant="outline" onClick={() => setSelectedPhotos([])}>
            Bỏ chọn
          </Button>
          <Button size="sm" variant="destructive" onClick={handleRemovePhotos}>
            Xóa khỏi album
          </Button>
          {selectedPhotos.length === 1 && (
            <Button size="sm" variant="outline" onClick={() => handleSetCover(selectedPhotos[0])}>
              Đặt làm ảnh bìa
            </Button>
          )}
        </div>
      )}

      {/* Photos grid */}
      {album.photos && album.photos.length > 0 ? (
        <PhotoGrid
          photos={album.photos}
          selectedIds={selectedPhotos}
          onSelectionChange={setSelectedPhotos}
          onPhotoClick={openViewer}
        />
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Album này chưa có ảnh nào</p>
        </div>
      )}

      <PhotoViewerModal
        photo={album.photos && album.photos[activeIndex] ? album.photos[activeIndex] : null}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={activeIndex > 0}
        hasNext={!!album?.photos && activeIndex < album.photos.length - 1}
        onDelete={handleViewerRemove}
      />

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setAddSelectedIds([]);
          }
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Thêm ảnh vào album</DialogTitle>
          </DialogHeader>
          {isFetchingPhotos ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : availablePhotos.length ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">Chọn ảnh muốn thêm (đang có {availablePhotos.length} ảnh khả dụng)</div>
              <PhotoGrid
                photos={availablePhotos}
                selectedIds={addSelectedIds}
                onSelectionChange={setAddSelectedIds}
                onPhotoClick={(photo) => {
                  setAddSelectedIds((prev) =>
                    prev.includes(photo.id)
                      ? prev.filter((id) => id !== photo.id)
                      : [...prev, photo.id]
                  );
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Không còn ảnh nào để thêm</div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddPhotos} disabled={isAddingPhotos || addSelectedIds.length === 0}>
              {isAddingPhotos ? 'Đang thêm...' : `Thêm${addSelectedIds.length ? ` ${addSelectedIds.length} ảnh` : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

