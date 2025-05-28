'use client';

import React, { useState } from 'react';
import { UploadService } from '@/services/UploadService';

export default function UploadPptx() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const uploadResult = await UploadService.uploadSlide(file);

      if (uploadResult.success) {
        setResult(
          JSON.stringify(
            {
              message: 'Upload successful',
              slideId: uploadResult.data?.slideId,
              path: uploadResult.data?.path,
            },
            null,
            2
          )
        );
      } else {
        setResult(`Upload failed: ${uploadResult.error}`);
      }
    } catch (err) {
      setResult(
        'Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".pptx" onChange={handleChange} />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {result && <pre>{result}</pre>}
    </div>
  );
}
