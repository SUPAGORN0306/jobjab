import React, { useState, useCallback, useRef } from 'react';
import apiClient from '../apiClient';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import '../styles/components/AvatarUploader.css';

export default function AvatarUploader({
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
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // === เลือกไฟล์ ===
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // ตรวจสอบ type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Allowed: JPG, PNG, GIF, WEBP');
      return;
    }

    // ตรวจสอบขนาด
    if (file.size > MAX_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max: 5 MB`);
      return;
    }

    // อ่านไฟล์เป็น data URL
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

  // === ยืนยัน crop + upload ===
  const handleCropConfirm = async () => {
    try {
      setIsUploading(true);
      setError(null);

      // Crop รูป
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error('Failed to crop image');
      }

      // สร้าง FormData
      const formData = new FormData();
      formData.append('avatar', croppedBlob, 'avatar.jpg');
      // ⭐ user_id ไม่ต้องส่ง — backend ใช้ g.user_id จาก cookie

      // Upload — ใช้ apiClient (cookies อัตโนมัติ)
      const { data } = await apiClient.post('/api/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // สำเร็จ
      setIsCropping(false);
      setImageSrc(null);

      if (onUploadSuccess) {
        onUploadSuccess(data.image_url);
      }

      alert('✅ Avatar uploaded successfully!');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="avatar-uploader">
      {/* ปุ่มอัปโหลด */}
      {!isCropping && (
        <>
          <div className="avatar-preview-wrapper">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Avatar"
                className="avatar-preview"
              />
            ) : (
              <div className="avatar-placeholder">
                <span>📷</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="avatar-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            {currentImage ? 'Change Photo' : 'Upload Photo'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <p className="avatar-hint">
            JPG, PNG, GIF, WEBP — Max 5 MB
          </p>

          {error && <p className="avatar-error">❌ {error}</p>}
        </>
      )}

      {/* Crop Modal */}
      {isCropping && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-header">
              <h3>Crop Your Photo</h3>
              <button
                className="crop-close"
                onClick={handleCropCancel}
                disabled={isUploading}
              >
                ×
              </button>
            </div>

            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
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
              <button
                className="crop-cancel-btn"
                onClick={handleCropCancel}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                className="crop-confirm-btn"
                onClick={handleCropConfirm}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Save Photo'}
              </button>
            </div>

            {error && <p className="crop-error">❌ {error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}