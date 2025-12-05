'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Film, Loader2 } from 'lucide-react';
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

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
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done') continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        await api.photos.upload(files[i].file);
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: 100, status: 'done' as const } : f
          )
        );
        successCount++;
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'error' as const } : f
          )
        );
        errorCount++;
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(`Da tai len ${successCount} file thanh cong`);
      onUploadComplete?.();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} file tai len that bai`);
    }
  };

  const isVideo = (file: File) => file.type.startsWith('video/');

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Tha file vao day...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              Keo tha anh/video vao day
            </p>
            <p className="text-gray-400 text-sm mt-1">
              hoac click de chon file
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {isVideo(file.file) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
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
                      <span className="text-white text-2xl"></span>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                      <span className="text-white text-2xl"></span>
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
                <p className="text-xs text-gray-500 truncate mt-1">
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
                  Dang tai len...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Tai len {files.filter((f) => f.status === 'pending').length} file
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Xoa tat ca
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
