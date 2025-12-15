'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { ShareLink, Photo, Album } from '@/types';

import { getStorageUrl } from '@/lib/utils/api-url';

const STORAGE_URL = getStorageUrl();

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [shared, setShared] = useState<{ type: 'photo' | 'album'; data: Photo | Album } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const response = await api.shareLinks.getByToken(token);
        setShared(response);
      } catch (err) {
        setError('Link chia sẻ không tồn tại hoặc đã hết hạn');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchShare();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !shared) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-xl font-medium text-gray-700">{error}</h1>
          <p className="text-gray-500 mt-2">Vui long kiem tra lai duong link</p>
        </div>
      </div>
    );
  }

  const isAlbum = shared.type === 'album';
  const album = isAlbum ? (shared.data as Album) : null;
  const photo = !isAlbum ? (shared.data as Photo) : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span className="text-xl font-medium">Google Photos</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAlbum && album ? (
          <div>
            <h1 className="text-2xl font-bold mb-6">{album.name}</h1>
            {album.photos && album.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
                {album.photos.map((p: Photo) => (
                  <div key={p.id} className="aspect-square relative bg-gray-200">
                    <Image
                      src={STORAGE_URL + '/' + (p.thumb_path || p.path)}
                      alt={p.original_filename || 'Photo'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Album nay chua co anh nao</p>
            )}
          </div>
        ) : photo ? (
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-medium mb-6">{photo.original_filename}</h1>
            <div className="relative max-w-4xl w-full" style={{ height: '70vh' }}>
              {photo.mime_type?.startsWith('video/') ? (
                <video
                  src={STORAGE_URL + '/' + (photo.file_path || photo.path)}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={STORAGE_URL + '/' + (photo.file_path || photo.path)}
                  alt={photo.original_filename || 'Photo'}
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">Khong tim thay noi dung</p>
        )}
      </main>
    </div>
  );
}
