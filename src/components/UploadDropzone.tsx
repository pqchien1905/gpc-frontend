'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Film, Loader2, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export default function UploadDropzone({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length === 0) {
      toast.error('Chỉ hỗ trợ file ảnh hoặc video');
      return;
    }

    const newFiles = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`Đã thêm ${validFiles.length} file`);
    }
  }, []);

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            // Generate a name for pasted images
            const extension = file.type.split('/')[1] || 'png';
            const renamedFile = new File(
              [file],
              `pasted-image-${Date.now()}.${extension}`,
              { type: file.type }
            );
            files.push(renamedFile);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [addFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })));

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('photos[]', f.file));

      const res = await api.photos.uploadBatch(formData);

      const successCount = res.uploaded ?? (res.data?.length ?? 0);
      const restored = res.restored ?? 0;
      const duplicates = res.duplicates ?? 0;

      setFiles((prev) => prev.map((f) => ({ ...f, progress: 100, status: 'done' as const })));

      const messages: string[] = [];
      if (successCount > 0) messages.push(`Đã tải lên ${successCount} file thành công`);
      if (restored > 0) messages.push(`Khôi phục ${restored} file trùng trước đó`);
      if (duplicates > 0) messages.push(`Bỏ qua ${duplicates} file trùng`);

      if (messages.length === 0) {
        toast.info('Không có file mới được tải lên');
      } else {
        toast.success(messages.join('. '));
      }

      onUploadComplete?.();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || error.message || 'Không thể tải lên';
      toast.error(message);
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'error' as const })));
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = (file: File) => file.type.startsWith('video/');

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">Thả file vào đây...</p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Kéo thả ảnh/video vào đây
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              hoặc click để chọn file
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 dark:text-gray-500 text-sm">
              <Clipboard className="h-4 w-4" />
              <span>Hoặc paste ảnh từ clipboard (Ctrl+V)</span>
            </div>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {isVideo(file.file) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <Film className="h-8 w-8 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={file.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  {file.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  {file.status === 'done' && (
                    <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
                {file.status === 'pending' && (
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {file.file.name}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={uploadFiles}
              disabled={isUploading || files.every((f) => f.status === 'done')}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên {files.filter((f) => f.status === 'pending').length} file
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Xóa tất cả
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
