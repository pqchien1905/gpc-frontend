import { User, Photo, Album, Friend, FriendRequest, Share, ShareLink, Notification, AuthResponse } from '@/types';

interface RequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
}

class ApiClient {
  private token: string | null = null;
  private apiUrl: string | null = null;

  private getApiUrl(): string {
    if (this.apiUrl) return this.apiUrl;
    
    if (typeof window !== 'undefined') {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && !envUrl.includes('localhost')) {
        this.apiUrl = envUrl;
        return this.apiUrl;
      }
      
      // If localhost or not set, use current hostname
      const hostname = window.location.hostname;
      const port = 8000;
      const protocol = window.location.protocol;
      this.apiUrl = `${protocol}//${hostname}:${port}`;
      return this.apiUrl;
    }
    
    // Server-side
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return this.apiUrl;
  }

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
    const url = endpoint.startsWith('http') ? endpoint : this.getApiUrl() + endpoint;

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

    let response: Response;
    try {
      response = await fetch(url, {
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
        // No credentials needed for token-based auth
      });
    } catch {
      const err = new Error('Network request failed. Please check your connection.');
      Object.assign(err, { response: { data: { message: 'Network error' }, status: 0 } });
      throw err;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      const err = new Error(error.message || 'Request failed');
      Object.assign(err, { response: { data: error, status: response.status } });
      throw err;
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
      this.request<{ user: User }>('/api/auth/user'),

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

  // Profile
  profile = {
    update: (data: { name?: string; email?: string }) =>
      this.request<{ message?: string; user: User }>('/api/profile', {
        method: 'PATCH',
        body: data,
      }),

    updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
      this.request<{ message?: string }>('/api/auth/password', {
        method: 'PUT',
        body: data,
      }),

    updateAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return this.request<{ message?: string; avatar_path: string }>('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
    },

    storage: () =>
      this.request<{ storage: { used: number; quota: number; available: number; used_human: string; quota_human: string; percentage: number } }>(
        '/api/profile/storage'
      ),
  };

  // Photos
  photos = {
    list: (params?: { 
      page?: number; 
      search?: string; 
      sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'size_asc' | 'size_desc' | 'captured_asc' | 'captured_desc';
      type?: 'image' | 'video';
      size?: 'small' | 'medium' | 'large';
      format?: string;
      from?: string;
      to?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.search) query.set('q', params.search);
      if (params?.sort) query.set('sort', params.sort);
      if (params?.type) query.set('type', params.type);
      if (params?.size) query.set('size', params.size);
      if (params?.format) query.set('format', params.format);
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      const queryString = query.toString();
      return this.request<{ data: Photo[] }>('/api/photos' + (queryString ? '?' + queryString : ''));
    },

    get: (id: number) =>
      this.request<{ data: Photo }>('/api/photos/' + id),

    upload: (file: File) => {
      const formData = new FormData();
      // Backend expects array field "photos[]"
      formData.append('photos[]', file);
      return this.request<{ data: Photo[]; uploaded: number; restored: number; duplicates: number }>('/api/photos', {
        method: 'POST',
        body: formData,
      });
    },

    uploadBatch: (formData: FormData) => {
      return this.request<{ data: Photo[]; uploaded: number; restored: number; duplicates: number }>('/api/photos', {
        method: 'POST',
        body: formData,
      });
    },

    delete: (id: number) =>
      this.request('/api/photos/' + id, { method: 'DELETE' }),

    restore: (id: number) =>
      this.request('/api/photos/' + id + '/restore', { method: 'POST' }),

    forceDelete: (id: number) =>
      this.request('/api/photos/' + id + '/force', { method: 'DELETE' }),

    toggleFavorite: (id: number) =>
      this.request('/api/photos/' + id + '/favorite', { method: 'POST' }),

    favorites: () =>
      this.request<{ data: Photo[] }>('/api/photos/favorites'),

    trash: () =>
      this.request<{ data: Photo[] }>('/api/photos/trash'),

    download: (id: number) => {
      const url = this.getApiUrl() + '/api/photos/' + id + '/download';
      const token = this.getToken();
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      return fetch(url, { headers });
    },

    regenerateThumbnail: (id: number) =>
      this.request<{ message: string }>('/api/photos/' + id + '/regenerate-thumbnail', {
        method: 'POST',
      }),
  };

  // Videos
  videos = {
    list: (params?: { page?: number }) => {
      const query = params?.page ? '?page=' + params.page : '';
      return this.request<{ data: Photo[] }>('/api/videos' + query);
    },

    get: (id: number) =>
      this.request<{ data: Photo }>('/api/videos/' + id),

    // Videos are uploaded via the same /api/photos endpoint (backend accepts video mimes)
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('photos[]', file);
      return this.request<{ data: Photo[]; uploaded: number; restored: number; duplicates: number }>('/api/photos', {
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

    createAutoAlbums: (data: { type: 'date' | 'location'; min_photos?: number }) =>
      this.request<{ message: string; created: number; updated: number; type: string }>('/api/albums/auto-create', {
        method: 'POST',
        body: data,
      }),
  };

  // Friends
  friends = {
    // Full friend summary: accepted + incoming + outgoing + blocked
    summary: () =>
      this.request<{ friends: Friend[]; incoming: FriendRequest[]; outgoing: FriendRequest[]; blocked: FriendRequest[] }>('/api/friends'),

    // Simple accepted list (for picker)
    list: () =>
      this.request<{ data: Friend[] }>('/api/friends/list'),

    // Alias helpers to match old UI expectations
    requests: () =>
      this.request<{ friends: Friend[]; incoming: FriendRequest[]; outgoing: FriendRequest[]; blocked: FriendRequest[] }>('/api/friends').then(r => ({ data: r.incoming })),

    sentRequests: () =>
      this.request<{ friends: Friend[]; incoming: FriendRequest[]; outgoing: FriendRequest[]; blocked: FriendRequest[] }>('/api/friends').then(r => ({ data: r.outgoing })),

    sendRequest: (email: string) =>
      this.request('/api/friends', {
        method: 'POST',
        body: { email },
      }),

    acceptRequest: (id: number) =>
      this.request('/api/friends/' + id, { method: 'PATCH' }),

    rejectRequest: (id: number) =>
      this.request('/api/friends/' + id, { method: 'DELETE' }),

    cancelRequest: (id: number) =>
      this.request('/api/friends/' + id, { method: 'DELETE' }),

    remove: (id: number) =>
      this.request('/api/friends/' + id, { method: 'DELETE' }),

    block: (id: number) =>
      this.request('/api/friends/' + id + '/block', { method: 'POST' }),

    unblock: (id: number) =>
      this.request('/api/friends/' + id + '/unblock', { method: 'POST' }),
  };

  // Shares
  shares = {
    sharedByMe: () =>
      this.request<{ data: Share[] }>('/api/shares/sent'),

    sharedWithMe: () =>
      this.request<{ data: Share[] }>('/api/shares/received'),

    get: (shareId: number) =>
      this.request<{ data: Share }>(`/api/shares/${shareId}`),

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
      this.request<{ url: string; token: string; expires_at?: string | null }>('/api/share-links', {
        method: 'POST',
        body: data,
      }),

    delete: (id: number) =>
      this.request('/api/share-links/' + id, { method: 'DELETE' }),

    getByToken: (token: string) =>
      this.request<{ type: 'photo' | 'album'; data: Photo | Album }>('/api/share/' + token),
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

}

export const api = new ApiClient();
