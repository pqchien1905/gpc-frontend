'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { Share, Photo, Album } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';

export default function SharesPage() {
  const [sharedByMe, setSharedByMe] = useState<Share[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShares = async () => {
    try {
      const [byMeRes, withMeRes] = await Promise.all([
        api.shares.sharedByMe(),
        api.shares.sharedWithMe(),
      ]);
      setSharedByMe(byMeRes.data);
      setSharedWithMe(withMeRes.data);
    } catch (error) {
      toast.error('Khong the tai danh sach chia se');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const ShareItem = ({ share }: { share: Share }) => {
    const isAlbum = share.shareable_type?.includes('Album');
    const albumItem = isAlbum ? (share.shareable as Album) : null;
    const photoItem = !isAlbum ? (share.shareable as Photo) : null;

    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
            {isAlbum && albumItem?.cover_photo ? (
              <Image
                src={STORAGE_URL + '/' + (albumItem.cover_photo.thumbnail_path || albumItem.cover_photo.file_path)}
                alt={albumItem.name || ''}
                fill
                className="object-cover"
              />
            ) : !isAlbum && photoItem?.thumbnail_path ? (
              <Image
                src={STORAGE_URL + '/' + photoItem.thumbnail_path}
                alt={photoItem.original_filename || ''}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {isAlbum ? albumItem?.name : photoItem?.original_filename}
            </p>
            <p className="text-sm text-gray-500">
              {isAlbum ? 'Album' : 'Anh/Video'}
            </p>
            {share.user && (
              <p className="text-sm text-gray-500">Tu: {share.user.name}</p>
            )}
            {share.friend && (
              <p className="text-sm text-gray-500">Den: {share.friend.name}</p>
            )}
          </div>

          <div className="text-sm text-gray-400">
            {new Date(share.created_at).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chia se</h1>

      <Tabs defaultValue="with-me">
        <TabsList>
          <TabsTrigger value="with-me">Duoc chia se ({sharedWithMe.length})</TabsTrigger>
          <TabsTrigger value="by-me">Da chia se ({sharedByMe.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="with-me" className="mt-4">
          {sharedWithMe.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <p className="text-gray-500">Chua co noi dung duoc chia se voi ban</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedWithMe.map((share) => (
                <ShareItem key={share.id} share={share} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-me" className="mt-4">
          {sharedByMe.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <p className="text-gray-500">Ban chua chia se noi dung nao</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedByMe.map((share) => (
                <ShareItem key={share.id} share={share} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
