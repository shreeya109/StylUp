"use client";

import { useState } from "react";

export default function ImageKeywordUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setKeywords([]);
    setError("");
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    setKeywords([]);
    setError("");

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("/api/extract-keywords", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.keywords) {
        setKeywords(data.keywords);
      } else {
        setError(data.error || "Unexpected error");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2>Upload an Outfit Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={loading || !image}>
        {loading ? "Analyzing..." : "Get Keywords"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {keywords.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Suggested Fashion Keywords:</h3>
          <ul>
            {keywords.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
