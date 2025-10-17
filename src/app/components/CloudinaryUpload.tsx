// components/CloudinaryUpload.tsx - ENHANCED
'use client'
import { useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  folder?: string; // Optional folder organization
}

export default function CloudinaryUpload({ 
  onUploadComplete, 
  currentImage,
  onRemove,
  folder = 'products'
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, WEBP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
      formData.append('folder', `mscakehub/${folder}`);

      // Simulate upload progress (Cloudinary doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Apply optimizations to URL
      const optimizedUrl = data.secure_url.replace(
        '/upload/',
        '/upload/f_auto,q_auto,w_1200,h_1200,c_limit/'
      );

      onUploadComplete(optimizedUrl);
      setPreview(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please check your Cloudinary settings.');
      setPreview(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Show current image or preview
  if (currentImage || preview) {
    return (
      <div className="relative group">
        <img 
          src={currentImage || preview!} 
          alt="Product" 
          className="w-full h-48 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
          {onRemove && !preview && (
            <button
              onClick={onRemove}
              className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {preview && (
            <div className="text-white text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Uploading...</p>
            </div>
          )}
        </div>
        {currentImage && !preview && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Uploaded
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block border-2 border-dashed border-pink-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50/50 transition-all relative overflow-hidden">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-pink-600">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Uploading to cloud...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Click to upload image</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
              <p className="text-xs text-gray-400 mt-1">Images are automatically optimized</p>
            </div>
          </div>
        )}
      </label>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <ImageIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">Upload Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!currentImage && !error && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          💡 Tip: Use high-quality images (1200x1200px recommended)
        </p>
      )}
    </div>
  );
}