import React, { useRef, useState } from 'react';
import { FileText, Upload, Trash2, Eye, X, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE } from '../utils/apiUrl';

export default function ResumeUploader({
  currentResume,
  currentFilename,
  userId,
  onUploadSuccess,
  onDeleteSuccess,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['application/pdf'];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    setError(null);
    setSuccess(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only PDF allowed');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max: 5 MB`);
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('user_id', userId);

      const res = await fetch(`${API_BASE}/upload/resume`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess('Resume uploaded successfully!');

      if (onUploadSuccess) {
        onUploadSuccess(data.resume_url, data.filename);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your resume?'
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setError(null);

      const res = await fetch(`${API_BASE}/resume/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      setSuccess('Resume deleted successfully!');

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    if (!currentResume) return;
    setShowResumeModal(true);
  };

  const filename = currentResume
    ? (currentFilename || 'resume.pdf')
    : null;

  // ⭐ Google Docs Viewer URL
  const googleDocsUrl = currentResume
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(currentResume)}&embedded=true`
    : null;

  return (
    <div className="resume-uploader">
      <div className="resume-uploader-header">
        <FileText size={18} className="resume-header-icon" />
        <span className="resume-header-title">Resume</span>
      </div>

      {currentResume ? (
        <div className="resume-current">
          <div className="resume-file-row">
            <FileText size={16} className="resume-file-icon" />
            <span className="resume-filename" title={filename}>
              {filename}
            </span>
          </div>

          <div className="resume-actions">
            <button
              type="button"
              className="resume-btn resume-btn-view"
              onClick={handleView}
            >
              <Eye size={14} />
              View
            </button>
            <button
              type="button"
              className="resume-btn resume-btn-change"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload size={14} />
              {isUploading ? 'Uploading...' : 'Change'}
            </button>
            <button
              type="button"
              className="resume-btn resume-btn-delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        <div className="resume-empty">
          <div className="resume-empty-icon">
            <FileText size={28} />
          </div>
          <p className="resume-empty-text">No resume uploaded yet</p>
          <p className="resume-empty-subtext">
            Upload your resume to apply faster
          </p>
          <button
            type="button"
            className="resume-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload size={16} />
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <p className="resume-hint">PDF only — Max 5 MB</p>

      {error && (
        <div className="resume-message resume-message-error">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button
            type="button"
            className="resume-message-close"
            onClick={() => setError(null)}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {success && (
        <div className="resume-message resume-message-success">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}

      {/* ⭐ Resume Modal — Google Docs Viewer */}
      {showResumeModal && googleDocsUrl && (
        <div
          onClick={() => setShowResumeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '900px',
              height: '90vh',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #000',
              }}
            >
              <strong style={{ fontSize: '16px' }}>Resume Preview</strong>
              <button
                onClick={() => setShowResumeModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* ⭐ Google Docs Viewer */}
            <iframe
              src={googleDocsUrl}
              title="Resume Preview"
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}