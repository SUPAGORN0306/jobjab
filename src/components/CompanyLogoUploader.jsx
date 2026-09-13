import React, { useState, useRef } from 'react';
import { Building2 } from 'lucide-react';
import { API_ORIGIN } from '../utils/apiUrl';
import '../styles/components/AvatarUploader.css';

export default function CompanyLogoUploader({
  currentImage,
  userId,
  onUploadSuccess,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('user_id', userId);

      const res = await fetch(`${API_ORIGIN}/api/upload/company-logo`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setPreview(data.image_url);
      onUploadSuccess?.(data.image_url);
    } catch (err) {
      setError(err.message);
      setPreview(currentImage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (!window.confirm('Remove company logo?')) return;
    setPreview(null);
    onUploadSuccess?.(null);
  };

  return (
    <div className="avatar-uploader">
      {/* Preview */}
      <div className="avatar-preview-wrapper" style={{ borderRadius: '16px' }}>
        {preview ? (
          <img
            src={preview}
            alt="Company Logo"
            className="avatar-preview"
          />
        ) : (
          <div className="avatar-placeholder">
            <Building2 size={40} style={{ color: '#f0d154' }} />
          </div>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload button */}
      <button
        type="button"
        className="avatar-upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
      </button>

      {/* Remove button (ใช้ avatar-upload-btn style) */}
      {preview && (
        <button
          type="button"
          className="avatar-upload-btn"
          onClick={handleRemove}
          disabled={uploading}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
          }}
        >
          Remove Logo
        </button>
      )}

      {/* Hint */}
      <p className="avatar-hint">
        JPG, PNG, GIF, WEBP — Max 5 MB
      </p>

      {error && <p className="avatar-error">{error}</p>}
    </div>
  );
}