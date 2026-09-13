import React, { useState, useRef } from 'react';
import { Upload, Trash2, Building2 } from 'lucide-react';
import { API_ORIGIN } from '../utils/apiUrl';
import './AvatarUploader.css';

export default function CompanyLogoUploader({
  currentImage,
  userId,
  onUploadSuccess,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      alert('Upload failed: ' + err.message);
      setPreview(currentImage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove company logo?')) return;
    setPreview(null);
    onUploadSuccess?.(null);
  };

  return (
    <div className="avatar-uploader">
      <div
        className="avatar-preview"
        style={{ borderRadius: '16px', overflow: 'hidden' }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Company Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Building2 size={32} style={{ color: '#f0d154' }} />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div className="avatar-actions">
        <button
          type="button"
          className="avatar-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={12} />
          {uploading ? 'Uploading...' : preview ? 'Change' : 'Upload Logo'}
        </button>

        {preview && (
          <button
            type="button"
            className="avatar-btn remove"
            onClick={handleRemove}
            disabled={uploading}
          >
            <Trash2 size={12} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}