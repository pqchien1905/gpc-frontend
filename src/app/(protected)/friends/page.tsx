'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Friend, FriendRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes, sentRes] = await Promise.all([
        api.friends.list(),
        api.friends.requests(),
        api.friends.sentRequests(),
      ]);
      setFriends(friendsRes.data as Friend[]);
      setRequests(requestsRes.data as FriendRequest[]);
      setSentRequests(sentRes.data as FriendRequest[]);
    } catch (error) {
      toast.error('Không thể tải danh sách bạn bè');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendRequest = async () => {
    if (!searchEmail.trim()) return;

    try {
      await api.friends.sendRequest(searchEmail);
      toast.success('Đã gửi lời mời kết bạn');
      setSearchEmail('');
      fetchData();
    } catch (error) {
      toast.error('Không thể gửi lời mời kết bạn');
    }
  };

  const handleAcceptRequest = async (id: number) => {
    try {
      await api.friends.acceptRequest(id);
      toast.success('Đã chấp nhận lời mời');
      fetchData();
    } catch (error) {
      toast.error('Không thể chấp nhận lời mời');
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      await api.friends.rejectRequest(id);
      toast.success('Đã từ chối lời mời');
      fetchData();
    } catch (error) {
      toast.error('Không thể từ chối lời mời');
    }
  };

  const handleRemoveFriend = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bạn này?')) return;

    try {
      await api.friends.remove(id);
      toast.success('Đã xóa bạn');
      fetchData();
    } catch (error) {
      toast.error('Không thể xóa bạn');
    }
  };

  const handleCancelRequest = async (id: number) => {
    try {
      await api.friends.cancelRequest(id);
      toast.success('Đã hủy lời mời');
      fetchData();
    } catch (error) {
      toast.error('Không thể hủy lời mời');
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bạn bè</h1>

      {/* Add friend */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Nhập email để thêm bạn..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
        />
        <Button onClick={handleSendRequest}>Thêm bạn</Button>
      </div>

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">
            Bạn bè ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Lời mời ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Đã gửi ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có bạn bè nào
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar || undefined} />
                      <AvatarFallback>{friend.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Xóa bạn
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có lời mời nào
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.user?.avatar} />
                      <AvatarFallback>{request.user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.user?.name}</p>
                      <p className="text-sm text-gray-500">{request.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                      Chấp nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4">
          {sentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có lời mời đã gửi
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.friend?.avatar} />
                      <AvatarFallback>{request.friend?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.friend?.name}</p>
                      <p className="text-sm text-gray-500">{request.friend?.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    Hủy lời mời
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
