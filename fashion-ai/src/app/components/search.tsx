"use client";

import { useState } from "react";
import "./search.css";

export default function FashionSearch() {
  type EbayItem = {
    title: string;
    price?: {
      value: string;
      currency: string;
    };
    image?: {
      imageUrl: string;
    };
  };

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EbayItem[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () =>{
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/search-ebay?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.itemSummaries || []);
    setLoading(false);
  }

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
        const joined = data.keywords.join(" ");
        console.log(joined)
        setQuery(joined);
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
    <main className="container">
      {/* <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for fashion items..."
        />
        <button type="submit">{loading ? "Searching..." : "Search"}</button>
      </form> */}
      
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
        <h2>Upload an Outfit Image</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleUpload} disabled={loading || !image}>
          {loading ? "Analyzing..." : "Get Keywords"}
        </button>
        <button onClick={handleSearch}>
            {"Get Results"}
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

      <div className="results-grid">
        {results.map((item, i) => (
          <div key={i} className="result-card">
            <img
              src={item.image?.imageUrl || "/placeholder.png"}
              alt={item.title}
              className="result-image"
            />
            <h2>{item.title}</h2>
            <p>
              {item.price?.value} {item.price?.currency}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
