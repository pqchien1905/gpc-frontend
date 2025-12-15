'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Photo, Friend, Album, ShareLink } from '@/types';
import { api } from '@/lib/api/client';
import PhotoGrid from '@/components/photos/PhotoGrid';
import PhotoViewerModal from '@/components/photos/PhotoViewerModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function PhotosPage() {
  const searchParams = useSearchParams();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [createdLink, setCreatedLink] = useState<ShareLink | null>(null);

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

  const openViewer = (photo: Photo) => {
    const index = photos.findIndex((p) => p.id === photo.id);
    setActiveIndex(index >= 0 ? index : 0);
    setViewerOpen(true);
  };

  const handlePrevious = () => setActiveIndex((idx) => Math.max(0, idx - 1));
  const handleNext = () => setActiveIndex((idx) => Math.min(photos.length - 1, idx + 1));

  const handleViewerDelete = async (id: number) => {
    const updated = photos.filter((p) => p.id !== id);
    await handleDelete([id]);
    if (updated.length === 0) {
      setViewerOpen(false);
      setActiveIndex(0);
    } else {
      setActiveIndex((prev) => Math.min(prev, updated.length - 1));
    }
  };

  const handleShareWithFriends = async () => {
    if (!selectedIds.length) {
      toast.error('Chọn ít nhất một ảnh để chia sẻ');
      return;
    }
    if (!selectedFriendIds.length) {
      toast.error('Chọn ít nhất một người bạn');
      return;
    }

    setIsSharing(true);
    try {
      await api.shares.shareWithFriends({ friend_ids: selectedFriendIds, photo_ids: selectedIds });
      toast.success('Đã chia sẻ tới bạn bè');
      setShareOpen(false);
      setSelectedFriendIds([]);
    } catch (error) {
      toast.error('Không thể chia sẻ');
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddToAlbum = async (albumId: number) => {
    if (!selectedIds.length) {
      toast.error('Chọn ít nhất một ảnh');
      return;
    }
    try {
      await api.albums.addPhotos(albumId, selectedIds);
      toast.success(`Đã thêm ${selectedIds.length} ảnh vào album`);
      setSelectedIds([]);
    } catch (error) {
      toast.error('Không thể thêm vào album');
    }
  };

  const handleCreatePublicLink = async () => {
    if (!selectedIds.length) {
      toast.error('Chọn ít nhất một ảnh để tạo link');
      return;
    }

    const targetId = selectedIds[0];
    setIsCreatingLink(true);
    setCreatedLink(null);
    try {
      const res = await api.shareLinks.create({
        type: 'photo',
        id: targetId,
        expires_in_days: expiresInDays || undefined,
      });
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setCreatedLink({
        id: targetId,
        token: res.token,
        url: `${baseUrl}/share/${res.token}`,
        type: 'photo',
        expires_at: res.expires_at,
        created_at: new Date().toISOString(),
        is_expired: false,
      } as ShareLink);
      toast.success('Đã tạo link công khai');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Không thể tạo link chia sẻ';
      toast.error(msg);
    } finally {
      setIsCreatingLink(false);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      setIsFriendsLoading(true);
      try {
        const res = await api.friends.list();
        setFriends(res.data as Friend[]);
      } catch (error) {
        toast.error('Không thể tải danh sách bạn bè');
      } finally {
        setIsFriendsLoading(false);
      }
    };

    if (shareOpen && friends.length === 0 && !isFriendsLoading) {
      fetchFriends();
    }
  }, [shareOpen, friends.length, isFriendsLoading]);

  useEffect(() => {
    const fetchAlbums = async () => {
      setIsLoadingAlbums(true);
      try {
        const res = await api.albums.list();
        setAlbums(res.data as Album[]);
      } catch (error) {
        toast.error('Không thể tải danh sách album');
      } finally {
        setIsLoadingAlbums(false);
      }
    };

    if (selectedIds.length > 0 && albums.length === 0) {
      fetchAlbums();
    }
  }, [selectedIds.length, albums.length]);

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
            <span className="font-medium">Đã chọn {selectedIds.length} ảnh</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-white hover:bg-blue-700"
            >
              Bỏ chọn
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                selectedIds.forEach(id => handleFavorite(id));
                setSelectedIds([]);
              }}
              className="text-white hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Yêu thích
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm vào Album
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Chọn album</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoadingAlbums ? (
                  <DropdownMenuItem disabled>Đang tải...</DropdownMenuItem>
                ) : albums.length === 0 ? (
                  <DropdownMenuItem disabled>Chưa có album nào</DropdownMenuItem>
                ) : (
                  albums.map((album) => (
                    <DropdownMenuItem key={album.id} onClick={() => handleAddToAlbum(album.id)}>
                      {album.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              onClick={() => setShareOpen(true)}
              className="text-white hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Chia sẻ
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleDelete(selectedIds)}
              className="text-white hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa
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
            {search ? 'Không tìm thấy ảnh nào' : 'Chưa có ảnh nào'}
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
            onPhotoClick={openViewer}
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

      <PhotoViewerModal
        photo={photos[activeIndex] || null}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={activeIndex > 0}
        hasNext={activeIndex < photos.length - 1}
        onFavorite={handleFavorite}
        onDelete={handleViewerDelete}
      />

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ ảnh đã chọn</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="font-medium">Chia sẻ với bạn bè</p>
              {isFriendsLoading ? (
                <p className="text-sm text-gray-500">Đang tải danh sách bạn bè...</p>
              ) : friends.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có bạn bè để chia sẻ.</p>
              ) : (
                <div className="max-h-48 overflow-auto space-y-2">
                  {friends.map((friend) => (
                    <label key={friend.id} className="flex items-center gap-3 cursor-pointer text-sm">
                      <Checkbox
                        checked={selectedFriendIds.includes(friend.id)}
                        onCheckedChange={() =>
                          setSelectedFriendIds((prev) =>
                            prev.includes(friend.id)
                              ? prev.filter((id) => id !== friend.id)
                              : [...prev, friend.id]
                          )
                        }
                      />
                      <span>{friend.name} ({friend.email})</span>
                    </label>
                  ))}
                </div>
              )}
              <Button onClick={handleShareWithFriends} disabled={isSharing || selectedFriendIds.length === 0}>
                {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ tới bạn bè'}
              </Button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="font-medium">Tạo link công khai</p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-28"
                  placeholder="7"
                />
                <span className="text-sm text-gray-600">Ngày hết hạn</span>
                <Button variant="outline" onClick={handleCreatePublicLink} disabled={isCreatingLink}>
                  {isCreatingLink ? 'Đang tạo...' : 'Tạo link'}
                </Button>
              </div>
              {createdLink && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-sm break-all">
                  <p className="font-medium mb-1">Link chia sẻ</p>
                  <a
                    className="text-blue-600 underline"
                    href={createdLink.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {createdLink.url}
                  </a>
                  {createdLink.expires_at && (
                    <p className="text-gray-500 text-xs mt-1">Hết hạn: {new Date(createdLink.expires_at).toLocaleString('vi-VN')}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

