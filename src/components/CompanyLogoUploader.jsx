import React, { useState, useCallback, useRef } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import apiClient from '../lib/apiClient';
import { toast } from 'sonner';
import '../styles/components/AvatarUploader.css';

export default function CompanyLogoUploader({
  currentImage,
  userId,
  onUploadSuccess,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Allowed: JPG, PNG, GIF, WEBP');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max: 5 MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      setIsUploading(true);
      setError(null);

      // ⭐ crop 512x512
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error('Failed to crop image');
      }

      const formData = new FormData();
      formData.append('logo', croppedBlob, 'logo.jpg');

      // ⭐ upload ไปที่ storage — backend return URL เท่านั้น (ไม่ UPDATE DB)
      const { data } = await apiClient.post(
        '/api/upload/company-logo',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setIsCropping(false);
      setImageSrc(null);

      // ⭐ เก็บ URL ไว้ preview — รอ Save Changes
      setPreview(data.image_url);
      onUploadSuccess?.(data.image_url);

      toast.success('Logo uploaded — click "Save Changes" to apply');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    if (!window.confirm('Remove company logo?')) return;
    setPreview(null);
    onUploadSuccess?.(null);
  };

  return (
    <div className="avatar-uploader">
      {!isCropping && (
        <>
          <div className="avatar-preview-wrapper" style={{ borderRadius: '16px' }}>
            {preview ? (
              <img src={preview} alt="Company Logo" className="avatar-preview" />
            ) : (
              <div className="avatar-placeholder">
                <Building2 size={40} style={{ color: '#f0d154' }} />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="avatar-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
          </button>

          {preview && (
            <button
              type="button"
              className="avatar-upload-btn"
              onClick={handleRemove}
              disabled={isUploading}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
              }}
            >
              Remove Logo
            </button>
          )}

          <p className="avatar-hint">JPG, PNG, GIF, WEBP — Max 5 MB</p>

          {error && (
            <p className="avatar-error" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <AlertCircle size={14} />
              {error}
            </p>
          )}
        </>
      )}

      {/* Crop Modal — ⭐ cropShape="rect" (ไม่ใช่ round) */}
      {isCropping && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-header">
              <h3>Crop Company Logo</h3>
              <button className="crop-close" onClick={handleCropCancel} disabled={isUploading}>
                ×
              </button>
            </div>

            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="crop-controls">
              <label className="crop-zoom-label">
                <span>Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="crop-actions">
              <button className="crop-cancel-btn" onClick={handleCropCancel} disabled={isUploading}>
                Cancel
              </button>
              <button className="crop-confirm-btn" onClick={handleCropConfirm} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Confirm Crop'}
              </button>
            </div>

            {error && (
              <p className="crop-error" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}