'use client';

import { useRouter } from 'next/navigation';
import UploadDropzone from '@/components/UploadDropzone';

export default function UploadPage() {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Redirect to photos page after upload
    setTimeout(() => {
      router.push('/photos');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tai len anh va video</h1>
      <UploadDropzone onUploadComplete={handleUploadComplete} />
    </div>
  );
}
