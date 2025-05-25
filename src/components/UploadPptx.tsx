import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', uuidv4()); // Simulating user_id, replace with actual user ID logic
    try {
      const res = await fetch('/api/supabase', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Upload failed');
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
