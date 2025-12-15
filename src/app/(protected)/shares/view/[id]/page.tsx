'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { Share, Album, Photo } from '@/types';
import { Button } from '@/components/ui/button';
import PhotoGrid from '@/components/photos/PhotoGrid';
import { toast } from 'sonner';
import { getStorageUrl } from '@/lib/utils/api-url';

const STORAGE_URL = getStorageUrl();

export default function ShareDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = Number(params.id);

  const [share, setShare] = useState<Share | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const res = await api.shares.get(shareId);
        setShare(res.data);
      } catch (error) {
        toast.error('Không tải được nội dung chia sẻ');
        router.push('/shares');
      } finally {
        setIsLoading(false);
      }
    };

    if (!Number.isNaN(shareId)) {
      fetchShare();
    } else {
      router.push('/shares');
    }
  }, [shareId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!share) return null;

  const isAlbum = share.shareable_type?.includes('Album');
  const album = isAlbum ? (share.shareable as Album) : null;
  const photo = !isAlbum ? (share.shareable as Photo) : null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isAlbum ? album?.name : photo?.original_filename || 'Ảnh/Video'}</h1>
          <p className="text-sm text-gray-500">Chia sẻ bởi {share.user?.name || 'Người dùng'}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/shares')}>
          Quay lại danh sách
        </Button>
      </div>

      {isAlbum && album ? (
        album.photos && album.photos.length > 0 ? (
          <PhotoGrid photos={album.photos} />
        ) : (
          <div className="text-center py-12 text-gray-500">Album không có ảnh</div>
        )
      ) : photo ? (
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          {photo.path ? (
            <Image
              src={STORAGE_URL + '/' + (photo.path || photo.thumb_path)}
              alt={photo.original_filename || 'Ảnh'}
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          ) : (
            <div className="p-6 text-center text-gray-500">Không tìm thấy ảnh</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
