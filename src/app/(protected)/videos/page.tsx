'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Photo, Friend, ShareLink, Album } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import PhotoGrid from '@/components/photos/PhotoGrid';
import PhotoViewerModal from '@/components/photos/PhotoViewerModal';

export default function VideosPage() {
  const [videos, setVideos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [createdLink, setCreatedLink] = useState<ShareLink | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchVideos = async () => {
    try {
      const response = await api.videos.list();
      setVideos(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách video');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

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

  const handleDelete = async (ids: number[]) => {
    try {
      for (const id of ids) {
        await api.videos.delete(id);
      }
      setVideos(videos.filter((v) => !ids.includes(v.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${ids.length} video`);
    } catch (error) {
      toast.error('Không thể xóa video');
    }
  };

  const handleFavorite = async (id: number) => {
    try {
      await api.videos.toggleFavorite(id);
      setVideos(videos.map((v) =>
        v.id === id ? { ...v, is_favorite: !v.is_favorite } : v
      ));
      toast.success('Đã cập nhật yêu thích');
    } catch (error) {
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  const handleAddToAlbum = async (albumId: number) => {
    if (!selectedIds.length) {
      toast.error('Chọn ít nhất một video');
      return;
    }
    try {
      await api.albums.addPhotos(albumId, selectedIds);
      toast.success(`Đã thêm ${selectedIds.length} video vào album`);
      setSelectedIds([]);
    } catch (error) {
      toast.error('Không thể thêm vào album');
    }
  };

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

  useEffect(() => {
    if (selectedIds.length > 0 && albums.length === 0) {
      void fetchAlbums();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.length, albums.length]);

  const handleShareWithFriends = async () => {
    if (!selectedIds.length) {
      toast.error('Chọn ít nhất một video để chia sẻ');
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

  const handleCreatePublicLink = async () => {
    if (!selectedIds.length) {
      toast.error('Chọn ít nhất một video để tạo link');
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
      setCreatedLink({
        id: targetId,
        token: res.token,
        url: res.url,
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

  const openViewer = (video: Photo) => {
    const index = videos.findIndex((v) => v.id === video.id);
    setActiveIndex(index >= 0 ? index : 0);
    setViewerOpen(true);
  };

  const handlePrevious = () => setActiveIndex((idx) => Math.max(0, idx - 1));
  const handleNext = () => setActiveIndex((idx) => Math.min(videos.length - 1, idx + 1));

  const handleViewerDelete = async (id: number) => {
    const updated = videos.filter((v) => v.id !== id);
    await handleDelete([id]);
    if (updated.length === 0) {
      setViewerOpen(false);
      setActiveIndex(0);
    } else {
      setActiveIndex((prev) => Math.min(prev, updated.length - 1));
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-600">Đã chọn {selectedIds.length}</span>
            <Button variant="outline" onClick={() => setSelectedIds([])}>
              Bỏ chọn
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                selectedIds.forEach(id => handleFavorite(id));
                setSelectedIds([]);
              }}
              className="bg-white text-blue-700 hover:bg-blue-100"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Yêu thích
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="bg-white text-blue-700 hover:bg-blue-100">
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
              variant="secondary"
              onClick={() => setShareOpen(true)}
              className="bg-white text-blue-700 hover:bg-blue-100"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Chia sẻ
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(selectedIds)}>
              Xóa
            </Button>
          </div>
        )}
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ video đã chọn</DialogTitle>
            <DialogDescription>
              Chia sẻ tối đa {selectedIds.length} video tới bạn bè hoặc tạo link công khai (áp dụng video đầu tiên nếu chọn nhiều).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="font-medium">Chia sẻ với bạn bè</p>
              {isFriendsLoading ? (
                <p className="text-sm text-gray-500">Đang tải danh sách bạn bè...</p>
              ) : friends.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có bạn bè để chia sẻ.</p>
              ) : (
                <div className="max-h-48 overflow-auto space-y-2 pr-1">
                  {friends.map((friend) => {
                    const checked = selectedFriendIds.includes(friend.id);
                    return (
                      <label key={friend.id} className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-100">
                        <Checkbox
                          checked={checked}
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
                    );
                  })}
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
            <Button variant="ghost" onClick={() => setShareOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p className="text-gray-500">Chưa có video nào</p>
        </div>
      ) : (
        <PhotoGrid
          photos={videos}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onFavorite={handleFavorite}
          onDelete={(id: number) => handleDelete([id])}
          onPhotoClick={openViewer}
        />
      )}

      <PhotoViewerModal
        photo={videos[activeIndex] || null}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={activeIndex > 0}
        hasNext={activeIndex < videos.length - 1}
        onFavorite={handleFavorite}
        onDelete={handleViewerDelete}
      />
    </div>
  );
}

