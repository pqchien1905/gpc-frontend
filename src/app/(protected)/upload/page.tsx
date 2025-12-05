'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploadingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'],
    },
  });

  const uploadFiles = async () => {
    setIsUploading(true);

    for (let i = 0; i < uploadingFiles.length; i++) {
      const uploadFile = uploadingFiles[i];
      if (uploadFile.status !== 'pending') continue;

      setUploadingFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', uploadFile.file);

        const isVideo = uploadFile.file.type.startsWith('video/');
        const endpoint = isVideo ? '/api/videos' : '/api/photos';

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        setUploadingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: 100, status: 'success' as const } : f
          )
        );
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'error' as const, error: 'Tải lên thất bại' }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    toast.success('Tải lên hoàn tất!');
  };

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const successCount = uploadingFiles.filter((f) => f.status === 'success').length;
  const errorCount = uploadingFiles.filter((f) => f.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tải lên ảnh và video</h1>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {isDragActive ? (
          <p className="text-blue-500 font-medium">Thả file vào đây...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              Kéo thả ảnh hoặc video vào đây, hoặc click để chọn
            </p>
            <p className="text-gray-400 text-sm">
              Hỗ trợ: JPG, PNG, GIF, WEBP, HEIC, MP4, MOV, AVI, WMV, FLV, WEBM, MKV
            </p>
          </>
        )}
      </div>

      {/* File list */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">
              {uploadingFiles.length} file
              {successCount > 0 && (
                <span className="text-green-600 ml-2">({successCount} thành công)</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600 ml-2">({errorCount} lỗi)</span>
              )}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setUploadingFiles([])}
                disabled={isUploading}
              >
                Xóa tất cả
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={
                  isUploading ||
                  uploadingFiles.every((f) => f.status !== 'pending')
                }
              >
                {isUploading ? 'Đang tải...' : 'Tải lên'}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploadingFiles.map((uploadFile, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                {/* Preview */}
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  {uploadFile.file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(uploadFile.file)}
                      alt=""
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-1 mt-1" />
                  )}
                  {uploadFile.status === 'error' && (
                    <p className="text-sm text-red-500">{uploadFile.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'pending' && (
                    <span className="text-gray-400">Chờ tải</span>
                  )}
                  {uploadFile.status === 'uploading' && (
                    <svg
                      className="w-5 h-5 text-blue-500 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {uploadFile.status === 'success' && (
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {uploadFile.status === 'error' && (
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>

                {/* Remove button */}
                {uploadFile.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
