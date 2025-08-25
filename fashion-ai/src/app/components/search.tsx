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

  type FilterOptions = {
    minPrice: string;
    maxPrice: string;
    colors: string[];
    sizes: string[];
    brands: string[];
    condition: string;
    sortBy: string;
  };

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<EbayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [shapesAnimated, setShapesAnimated] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: "",
    maxPrice: "",
    colors: [],
    sizes: [],
    brands: [],
    condition: "all",
    sortBy: "relevance"
  });

  const colorOptions = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Gray", "Brown"];
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const brandOptions = ["Nike", "Adidas", "Zara", "H&M", "Gucci", "Prada", "Louis Vuitton"];

  const animateShapes = () => {
    const bgContainer = document.getElementById('bgContainer');
    if (bgContainer) {
      bgContainer.classList.add('animated');
      setShapesAnimated(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Animate shapes when images are selected
    animateShapes();

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const newPreviews: string[] = [];
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newImages.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setKeywords([]);
    setError("");
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setKeywords([]);
    setError("");

    const formData = new FormData();
    formData.append("image", images[0]);  


    try {
      const res = await fetch("/api/extract-keywords", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.keywords) {
        setKeywords(data.keywords);
        // immediately trigger search
        setTimeout(() => handleSearch(), 0);
      } else {
        setError(data.error || "Unexpected error");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (keywords.length === 0) return;
    setLoading(true);
    
    const searchQuery = keywords.join(" ");
    const queryParams = new URLSearchParams({
      q: searchQuery,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      colors: filters.colors.join(","),
      condition: filters.condition,
      sortBy: filters.sortBy
    });

    try {
      const res = await fetch(`/api/search-ebay?${queryParams}`);
      const data = await res.json();
      setResults(data.itemSummaries || []);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'colors' | 'sizes' | 'brands', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  return (
    <>
      {/* Animated Background */}
      <div className="background-container" id="bgContainer">
        <div className="curved-shape shape-1"></div>
        <div className="curved-shape shape-2"></div>
        <div className="curved-shape shape-3"></div>
        <div className="curved-shape shape-4"></div>
        <div className="curved-shape shape-5"></div>
        <div className="curved-shape shape-6"></div>
        <div className="curved-shape shape-7"></div>
        <div className="curved-shape shape-8"></div>
        <div className="curved-shape shape-9"></div>
        <div className="curved-shape shape-10"></div>
      </div>

      <div className="fashion-search">
        <header className="header">
          <h1 className="logo">StyleFinder</h1>
          <p className="tagline">AI-powered visual fashion discovery</p>
        </header>

        <main className="main-content">
          {/* Upload Section */}
          <section className="upload-section">
            <div className="upload-content">
              <h2>Upload Your Inspiration</h2>
              <p>Drop your style images and let AI find similar pieces</p>
              
              <div className="image-upload-container">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  id="image-upload"
                  className="file-input"
                />
                <label htmlFor="image-upload" className="upload-button">
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Choose Images
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="preview-item">
                      <img src={preview} alt={`Style ${index + 1}`} />
                      <button 
                        className="remove-button"
                        onClick={() => removeImage(index)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <button 
                  className="analyze-button"
                  onClick={handleUpload} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Analyzing Style...
                    </>
                  ) : (
                    <>
                      <svg className="analyze-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.27 0 4.33.84 5.9 2.24"/>
                      </svg>
                      Analyze Style
                    </>
                  )}
                </button>
              )}
            </div>
          </section>

          {/* Keywords Section */}
          {keywords.length > 0 && (
            <section className="keywords-section">
              <h3>Style Elements Found</h3>
              <div className="keywords-grid">
                {keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </section>
          )}

          {/* Filters Section */}
          {keywords.length > 0 && (
            <section className="filters-section">
              <div className="filters-header">
                <h3>Refine Search</h3>
                <button 
                  className="toggle-filters"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                  <svg className={`arrow ${showFilters ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>
              </div>

              {showFilters && (
                <div className="filters-content">
                  <div className="filter-grid">
                    <div className="filter-group">
                      <label>Price Range</label>
                      <div className="price-inputs">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        />
                        <span>–</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="filter-group">
                      <label>Condition</label>
                      <select 
                        value={filters.condition}
                        onChange={(e) => handleFilterChange('condition', e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">Refurbished</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Sort By</label>
                      <select 
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price_low">Price ↑</option>
                        <option value="price_high">Price ↓</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                  </div>

                  <div className="filter-group colors-group">
                    <label>Colors</label>
                    <div className="color-filters">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          className={`color-button ${filters.colors.includes(color) ? 'active' : ''}`}
                          onClick={() => toggleArrayFilter('colors', color)}
                          style={{
                            backgroundColor: color.toLowerCase() === 'white' ? '#f8f9fa' : color.toLowerCase(),
                            border: color.toLowerCase() === 'white' ? '2px solid #e9ecef' : 'none'
                          }}
                          title={color}
                        >
                          {filters.colors.includes(color) && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button 
                className="search-button"
                onClick={handleSearch}
                disabled={loading || keywords.length === 0}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Find Similar Items
                  </>
                )}
              </button>
            </section>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <section className="results-section">
              <h3>{results.length} Similar Items Found</h3>
              <div className="results-grid">
                {results.map((item, index) => (
                  <div key={index} className="result-card">
                    <div className="image-container">
                      <img
                        src={item.image?.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        className="result-image"
                      />
                    </div>
                    <div className="item-details">
                      <h4 className="item-title">{item.title}</h4>
                      <div className="price-container">
                        <span className="price">
                          {item.price?.currency === 'USD' ? '$' : item.price?.currency} {item.price?.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}