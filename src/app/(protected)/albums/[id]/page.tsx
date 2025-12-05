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

  const fetchAlbum = async () => {
    try {
      const response = await api.albums.get(albumId);
      const albumData = response.data as Album;
      setAlbum(albumData);
      setNewName(albumData.name);
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ táº£i album');
      router.push('/albums');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [albumId]);

  const handleRename = async () => {
    if (!newName.trim() || !album) return;

    try {
      await api.albums.update(albumId, { name: newName });
      setAlbum({ ...album, name: newName });
      setIsEditingName(false);
      toast.success('ÄÃ£ Ä‘á»•i tÃªn album');
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ Ä‘á»•i tÃªn album');
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
      toast.success(`ÄÃ£ xÃ³a ${selectedPhotos.length} áº£nh khá»i album`);
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ xÃ³a áº£nh khá»i album');
    }
  };

  const handleSetCover = async (photoId: number) => {
    try {
      await api.albums.setCover(albumId, photoId);
      const coverPhoto = album?.photos?.find((p: Photo) => p.id === photoId);
      if (album && coverPhoto) {
        setAlbum({ ...album, cover_photo: coverPhoto });
      }
      toast.success('ÄÃ£ Ä‘áº·t áº£nh bÃ¬a');
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ Ä‘áº·t áº£nh bÃ¬a');
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
            <Button size="sm" onClick={handleRename}>LÆ°u</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>Há»§y</Button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold cursor-pointer hover:text-blue-500"
            onClick={() => setIsEditingName(true)}
          >
            {album.name}
          </h1>
        )}

        <span className="text-gray-500">{album.photos?.length || 0} áº£nh</span>
      </div>

      {/* Selection actions */}
      {selectedPhotos.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
          <span className="font-medium">ÄÃ£ chá»n {selectedPhotos.length} áº£nh</span>
          <Button size="sm" variant="outline" onClick={() => setSelectedPhotos([])}>
            Bá» chá»n
          </Button>
          <Button size="sm" variant="destructive" onClick={handleRemovePhotos}>
            XÃ³a khá»i album
          </Button>
          {selectedPhotos.length === 1 && (
            <Button size="sm" variant="outline" onClick={() => handleSetCover(selectedPhotos[0])}>
              Äáº·t lÃ m áº£nh bÃ¬a
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
        />
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Album nÃ y chÆ°a cÃ³ áº£nh nÃ o</p>
        </div>
      )}
    </div>
  );
}

