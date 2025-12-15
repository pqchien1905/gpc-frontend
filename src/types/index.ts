// API Types for Google Photos Clone

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  avatar_path?: string | null;
  storage_used?: number;
  storage_limit?: number;
  storage_quota?: number;
  storage_used_human?: string;
  storage_quota_human?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Photo {
  id: number;
  path: string; // original file path
  thumb_path?: string | null; // thumbnail path
  file_path?: string; // alias for path (backward compat)
  thumbnail_path?: string | null; // alias for thumb_path (backward compat)
  original_filename: string;
  mime: string; // backend returns 'mime' not 'mime_type'
  mime_type?: string; // alias for mime (backward compat)
  size: number;
  width?: number;
  height?: number;
  is_favorite: boolean;
  captured_at?: string | null;
  taken_at?: string | null;
  created_at: string;
  deleted_at?: string | null;
  location?: string | null;
  location_text?: string | null;
  exif?: Record<string, unknown> | null;
  duration?: number; // for videos
}

export interface Album {
  id: number;
  name: string;
  cover_photo_id?: number | null;
  cover_photo?: Photo | null;
  photos_count?: number;
  photos?: Photo[];
  created_at: string;
  updated_at: string;
  share_link_token?: string;
}

export interface Friend {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  created_at?: string;
}

export interface FriendRequest {
  id: number;
  user?: User;
  friend?: User;
  created_at: string;
}

export interface Share {
  id: number;
  sender_id?: number;
  receiver_id?: number;
  shareable_type?: string;
  shareable_id?: number;
  shareable?: Photo | Album;
  user?: User;
  friend?: User;
  message?: string | null;
  is_read?: boolean;
  created_at: string;
}

export interface ShareLink {
  id: number;
  token: string;
  url?: string;
  type?: 'photo' | 'album';
  item?: Photo | Album;
  expires_at?: string | null;
  is_expired?: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  data: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
}

export interface StorageInfo {
  used: number;
  quota: number;
  available: number;
  used_human?: string;
  quota_human?: string;
  percentage: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
