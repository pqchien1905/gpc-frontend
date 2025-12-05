import { User, Photo, Album, Friend, FriendRequest, Share, ShareLink, Notification, AuthResponse, PaginatedResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
      body: options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  auth = {
    login: (data: { email: string; password: string }) =>
      this.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: data,
      }),

    register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
      this.request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: data,
      }),

    logout: () =>
      this.request('/api/auth/logout', { method: 'POST' }),

    me: () =>
      this.request<{ data: User }>('/api/auth/me'),

    forgotPassword: (email: string) =>
      this.request('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      }),

    resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
      this.request('/api/auth/reset-password', {
        method: 'POST',
        body: data,
      }),
  };

  // Photos
  photos = {
    list: (params?: { page?: number; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.search) query.set('search', params.search);
      const queryString = query.toString();
      return this.request<{ data: Photo[] }>('/api/photos' + (queryString ? '?' + queryString : ''));
    },

    get: (id: number) =>
      this.request<{ data: Photo }>('/api/photos/' + id),

    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.request<{ data: Photo }>('/api/photos', {
        method: 'POST',
        body: formData,
      });
    },

    delete: (id: number) =>
      this.request('/api/photos/' + id, { method: 'DELETE' }),

    restore: (id: number) =>
      this.request('/api/photos/' + id + '/restore', { method: 'POST' }),

    forceDelete: (id: number) =>
      this.request('/api/photos/' + id + '/force-delete', { method: 'DELETE' }),

    toggleFavorite: (id: number) =>
      this.request('/api/photos/' + id + '/favorite', { method: 'POST' }),

    favorites: () =>
      this.request<{ data: Photo[] }>('/api/photos/favorites'),

    trash: () =>
      this.request<{ data: Photo[] }>('/api/photos/trash'),

    download: (id: number) =>
      this.request<Blob>('/api/photos/' + id + '/download'),
  };

  // Videos
  videos = {
    list: (params?: { page?: number }) => {
      const query = params?.page ? '?page=' + params.page : '';
      return this.request<{ data: Photo[] }>('/api/videos' + query);
    },

    get: (id: number) =>
      this.request<{ data: Photo }>('/api/videos/' + id),

    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.request<{ data: Photo }>('/api/videos', {
        method: 'POST',
        body: formData,
      });
    },

    delete: (id: number) =>
      this.request('/api/videos/' + id, { method: 'DELETE' }),

    toggleFavorite: (id: number) =>
      this.request('/api/videos/' + id + '/favorite', { method: 'POST' }),
  };

  // Albums
  albums = {
    list: () =>
      this.request<{ data: Album[] }>('/api/albums'),

    get: (id: number) =>
      this.request<{ data: Album }>('/api/albums/' + id),

    create: (data: { name: string; photo_ids?: number[] }) =>
      this.request<{ data: Album }>('/api/albums', {
        method: 'POST',
        body: data,
      }),

    update: (id: number, data: { name?: string }) =>
      this.request('/api/albums/' + id, {
        method: 'PUT',
        body: data,
      }),

    delete: (id: number) =>
      this.request('/api/albums/' + id, { method: 'DELETE' }),

    addPhotos: (id: number, photoIds: number[]) =>
      this.request('/api/albums/' + id + '/photos', {
        method: 'POST',
        body: { photo_ids: photoIds },
      }),

    removePhotos: (id: number, photoIds: number[]) =>
      this.request('/api/albums/' + id + '/photos', {
        method: 'DELETE',
        body: { photo_ids: photoIds },
      }),

    setCover: (id: number, photoId: number) =>
      this.request('/api/albums/' + id + '/cover', {
        method: 'PUT',
        body: { photo_id: photoId },
      }),
  };

  // Friends
  friends = {
    list: () =>
      this.request<{ data: Friend[] }>('/api/friends'),

    requests: () =>
      this.request<{ data: FriendRequest[] }>('/api/friends/requests'),

    sentRequests: () =>
      this.request<{ data: FriendRequest[] }>('/api/friends/sent'),

    sendRequest: (email: string) =>
      this.request('/api/friends/request', {
        method: 'POST',
        body: { email },
      }),

    acceptRequest: (id: number) =>
      this.request('/api/friends/requests/' + id + '/accept', { method: 'POST' }),

    rejectRequest: (id: number) =>
      this.request('/api/friends/requests/' + id + '/reject', { method: 'POST' }),

    cancelRequest: (id: number) =>
      this.request('/api/friends/requests/' + id, { method: 'DELETE' }),

    remove: (id: number) =>
      this.request('/api/friends/' + id, { method: 'DELETE' }),

    block: (id: number) =>
      this.request('/api/friends/' + id + '/block', { method: 'POST' }),
  };

  // Shares
  shares = {
    sharedByMe: () =>
      this.request<{ data: Share[] }>('/api/shares/by-me'),

    sharedWithMe: () =>
      this.request<{ data: Share[] }>('/api/shares/with-me'),

    shareWithFriends: (data: { friend_ids: number[]; photo_ids?: number[]; album_id?: number; message?: string }) =>
      this.request('/api/shares', {
        method: 'POST',
        body: data,
      }),

    shareByEmail: (data: { emails: string[]; photo_ids?: number[]; album_ids?: number[]; message?: string }) =>
      this.request('/api/shares/email', {
        method: 'POST',
        body: data,
      }),
  };

  // Share Links
  shareLinks = {
    list: () =>
      this.request<{ data: ShareLink[] }>('/api/share-links'),

    create: (data: { type: 'photo' | 'album'; id: number; expires_in_days?: number }) =>
      this.request<{ data: ShareLink }>('/api/share-links', {
        method: 'POST',
        body: data,
      }),

    delete: (id: number) =>
      this.request('/api/share-links/' + id, { method: 'DELETE' }),

    getByToken: (token: string) =>
      this.request<{ data: ShareLink }>('/api/share/' + token),
  };

  // Notifications
  notifications = {
    list: () =>
      this.request<{ data: Notification[] }>('/api/notifications'),

    unreadCount: () =>
      this.request<{ count: number }>('/api/notifications/unread-count'),

    markAsRead: (id: number) =>
      this.request('/api/notifications/' + id + '/read', { method: 'POST' }),

    markAllAsRead: () =>
      this.request('/api/notifications/read-all', { method: 'POST' }),
  };

  // Profile
  profile = {
    update: (data: { name?: string; email?: string }) =>
      this.request<{ data: User }>('/api/profile', {
        method: 'PUT',
        body: data,
      }),

    updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
      this.request('/api/profile/password', {
        method: 'PUT',
        body: data,
      }),

    updateAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return this.request<{ data: User }>('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
    },

    storage: () =>
      this.request<{ data: { used: number; quota: number; percentage: number } }>('/api/profile/storage'),
  };
}

export const api = new ApiClient();
