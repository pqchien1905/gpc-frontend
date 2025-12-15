'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { Share, Photo, Album, ShareLink } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { getStorageUrl } from '@/lib/utils/api-url';

const STORAGE_URL = getStorageUrl();

export default function SharesPage() {
  const [sharedByMe, setSharedByMe] = useState<Share[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<Share[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');

  const fetchShares = async () => {
    try {
      const [byMeRes, withMeRes, linksRes] = await Promise.all([
        api.shares.sharedByMe(),
        api.shares.sharedWithMe(),
        api.shareLinks.list(),
      ]);
      setSharedByMe(byMeRes.data);
      setSharedWithMe(withMeRes.data);
      setShareLinks(linksRes.data);
    } catch (error) {
      toast.error('Không thể tải danh sách chia sẻ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Compute base URL on client to avoid SSR/CSR mismatch
    setBaseUrl(window.location.origin);
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

    const handleView = () => {
      window.location.href = `/shares/view/${share.id}`;
    };

    return (
      <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative shrink-0 cursor-pointer hover:opacity-80" onClick={handleView}>
            {isAlbum && albumItem?.cover_photo ? (
              <Image
                src={STORAGE_URL + '/' + (albumItem.cover_photo.thumb_path || albumItem.cover_photo.path)}
                alt={albumItem.name || ''}
                fill
                className="object-cover"
              />
            ) : !isAlbum && photoItem?.thumb_path ? (
              <Image
                src={STORAGE_URL + '/' + photoItem.thumb_path}
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
              {isAlbum ? 'Album' : 'Ảnh/Video'}
            </p>
            {share.user && (
              <p className="text-sm text-gray-500">Từ: {share.user.name}</p>
            )}
            {share.friend && (
              <p className="text-sm text-gray-500">Đến: {share.friend.name}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">
              {new Date(share.created_at).toLocaleDateString('vi-VN')}
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleView}
            >
              Xem
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chia sẻ</h1>

      <Tabs defaultValue="with-me">
        <TabsList>
          <TabsTrigger value="with-me">Được chia sẻ ({sharedWithMe.length})</TabsTrigger>
          <TabsTrigger value="by-me">Đã chia sẻ ({sharedByMe.length})</TabsTrigger>
          <TabsTrigger value="links">Link công khai ({shareLinks.length})</TabsTrigger>
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

        <TabsContent value="links" className="mt-4">
          {shareLinks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <p className="text-gray-500">Chưa có link chia sẻ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((link) => (
                <div key={link.id} className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {(() => {
                      const webUrl = `${baseUrl}/share/${link.token}`;
                      return <p className="font-medium break-all">{webUrl}</p>;
                    })()}
                    <p className="text-sm text-gray-500">
                      Loại: {link.type === 'album' ? 'Album' : 'Ảnh'}
                    </p>
                    {link.expires_at && (
                      <p className="text-xs text-gray-500">Hết hạn: {new Date(link.expires_at).toLocaleString('vi-VN')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const webUrl = `${baseUrl}/share/${link.token}`;
                        navigator.clipboard.writeText(webUrl).then(() => toast.success('Đã copy link'));
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        try {
                          await api.shareLinks.delete(link.id);
                          setShareLinks((prev) => prev.filter((l) => l.id !== link.id));
                          toast.success('Đã xóa link');
                        } catch (error) {
                          toast.error('Không thể xóa link');
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
