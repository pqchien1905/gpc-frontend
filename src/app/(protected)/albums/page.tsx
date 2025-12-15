'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { Album, Photo, Friend } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

import { getStorageUrl } from '@/lib/utils/api-url';

const STORAGE_URL = getStorageUrl();

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isCreatingAuto, setIsCreatingAuto] = useState(false);
  
  // State for adding photos to album
  const [addPhotoDialogOpen, setAddPhotoDialogOpen] = useState(false);
  const [selectedAlbumForPhotos, setSelectedAlbumForPhotos] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);

  // Share album
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAlbumForShare, setSelectedAlbumForShare] = useState<Album | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const fetchAlbums = async () => {
    try {
      const response = await api.albums.list();
      setAlbums(response.data as Album[]);
    } catch (error) {
      toast.error('Không thể tải danh sách album');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;

    try {
      const response = await api.albums.create({ name: newAlbumName });
      setAlbums([response.data as Album, ...albums]);
      setNewAlbumName('');
      setIsCreateOpen(false);
      toast.success('Tạo album thành công!');
    } catch (error) {
      toast.error('Không thể tạo album');
    }
  };

  const handleDeleteAlbum = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa album này?')) return;

    try {
      await api.albums.delete(id);
      setAlbums(albums.filter((a) => a.id !== id));
      toast.success('Đã xóa album');
    } catch (error) {
      toast.error('Không thể xóa album');
    }
  };

  const handleCreateAutoAlbums = async (type: 'date' | 'location') => {
    setIsCreatingAuto(true);
    try {
      const response = await api.albums.createAutoAlbums({ type, min_photos: 3 });
      toast.success(response.message || `Đã tạo ${response.created} album mới`);
      await fetchAlbums();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo album tự động');
    } finally {
      setIsCreatingAuto(false);
    }
  };

  const openAddPhotoDialog = async (album: Album) => {
    setSelectedAlbumForPhotos(album);
    setAddPhotoDialogOpen(true);
    setIsLoadingPhotos(true);
    try {
      const response = await api.photos.list({ page: 1 });
      // Filter out photos already in this album
      const albumPhotoIds = album.photos?.map(p => p.id) || [];
      const availablePhotos = response.data.filter(
        (photo: Photo) => !albumPhotoIds.includes(photo.id)
      );
      setPhotos(availablePhotos);
    } catch (error) {
      toast.error('Không thể tải danh sách ảnh');
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const openShareDialog = async (album: Album) => {
    setSelectedAlbumForShare(album);
    setShareDialogOpen(true);
    if (friends.length === 0 && !isFriendsLoading) {
      setIsFriendsLoading(true);
      try {
        const res = await api.friends.list();
        setFriends(res.data as Friend[]);
      } catch (error) {
        toast.error('Không thể tải danh sách bạn bè');
      } finally {
        setIsFriendsLoading(false);
      }
    }
  };

  const handleShareAlbum = async () => {
    if (!selectedAlbumForShare) {
      toast.error('Chưa chọn album');
      return;
    }
    if (selectedFriendIds.length === 0) {
      toast.error('Chọn ít nhất một người bạn');
      return;
    }

    setIsSharing(true);
    try {
      await api.shares.shareWithFriends({
        friend_ids: selectedFriendIds,
        album_id: selectedAlbumForShare.id,
      });
      toast.success('Đã chia sẻ album');
      setShareDialogOpen(false);
      setSelectedFriendIds([]);
      setSelectedAlbumForShare(null);
    } catch (error) {
      toast.error('Không thể chia sẻ album');
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddPhotosToAlbum = async () => {
    if (!selectedAlbumForPhotos || selectedPhotoIds.length === 0) {
      toast.error('Chọn ít nhất một ảnh');
      return;
    }

    try {
      await api.albums.addPhotos(selectedAlbumForPhotos.id, selectedPhotoIds);
      toast.success(`Đã thêm ${selectedPhotoIds.length} ảnh vào album`);
      
      // Update albums list
      await fetchAlbums();
      
      setAddPhotoDialogOpen(false);
      setSelectedAlbumForPhotos(null);
      setSelectedPhotoIds([]);
      setPhotos([]);
    } catch (error) {
      toast.error('Không thể thêm ảnh vào album');
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
        <h1 className="text-2xl font-bold">Album</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isCreatingAuto}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isCreatingAuto ? 'Đang tạo...' : 'Tạo tự động'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Tạo album tự động</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCreateAutoAlbums('date')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Theo ngày chụp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateAutoAlbums('location')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Theo địa điểm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo album mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Tên album"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateAlbum}>Tạo</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500">Chưa có album nào</p>
          <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
            Tạo album đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {albums.map((album) => (
            <div key={album.id} className="group relative">
              <Link href={`/albums/${album.id}`}>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {album.cover_photo ? (
                    <Image
                      src={`${STORAGE_URL}/${album.cover_photo.thumb_path || album.cover_photo.path}`}
                      alt={album.name || 'Album'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
              <div className="mt-2">
                <p className="font-medium truncate">{album.name}</p>
                <p className="text-sm text-gray-500">{album.photos_count || 0} ảnh</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openAddPhotoDialog(album)}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  title="Thêm ảnh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => openShareDialog(album)}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                  title="Chia sẻ album"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zM4 20a4 4 0 014-4h4a4 4 0 014 4" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  title="Xóa album"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addPhotoDialogOpen} onOpenChange={setAddPhotoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm ảnh vào album "{selectedAlbumForPhotos?.name}"</DialogTitle>
            <DialogDescription>
              Chọn ảnh hoặc video để thêm vào album này
            </DialogDescription>
          </DialogHeader>

          {isLoadingPhotos ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có ảnh nào khả dụng để thêm</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4 p-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() =>
                      setSelectedPhotoIds((prev) =>
                        prev.includes(photo.id)
                          ? prev.filter((id) => id !== photo.id)
                          : [...prev, photo.id]
                      )
                    }
                  >
                    <Image
                      src={`${STORAGE_URL}/${photo.thumb_path || photo.path}`}
                      alt="photo"
                      fill
                      className="object-cover"
                    />
                    {selectedPhotoIds.includes(photo.id) && (
                      <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddPhotoDialogOpen(false);
                setSelectedPhotoIds([]);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddPhotosToAlbum}
              disabled={selectedPhotoIds.length === 0 || isLoadingPhotos}
            >
              Thêm {selectedPhotoIds.length > 0 ? `(${selectedPhotoIds.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chia sẻ album "{selectedAlbumForShare?.name}"</DialogTitle>
            <DialogDescription>Chọn bạn bè để chia sẻ album này</DialogDescription>
          </DialogHeader>

          {isFriendsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : friends.length === 0 ? (
            <p className="text-gray-500">Bạn chưa có bạn bè để chia sẻ.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 py-2">
              {friends.map((friend) => (
                <label key={friend.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    checked={selectedFriendIds.includes(friend.id)}
                    onCheckedChange={(checked) => {
                      setSelectedFriendIds((prev) =>
                        checked ? [...prev, friend.id] : prev.filter((id) => id !== friend.id)
                      );
                    }}
                  />
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleShareAlbum} disabled={isSharing || selectedFriendIds.length === 0}>
              {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
