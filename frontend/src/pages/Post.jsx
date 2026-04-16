import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/post.css";

export default function Post() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [images, setImages] = useState([]);
  const [published, setPublished] = useState(false);
  const navigate = useNavigate();

  // ── Pro Features State ──
  const [isPro, setIsPro] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isAd, setIsAd] = useState(false);
  const [adVideoFile, setAdVideoFile] = useState(null);
  const [adVideoPreview, setAdVideoPreview] = useState(null);
  const [proError, setProError] = useState(null);

  // Check Pro status
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/payment/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setIsPro(data.isPro || false))
      .catch(() => setIsPro(false));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages([reader.result]);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAdVideoPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdVideoFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const removeAdVideo = () => {
    setAdVideoFile(null);
    setAdVideoPreview(null);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setProError(null);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in");
      return;
    }

    try {
      setLoading(true);

      const body = {
        title,
        description,
        category,
        image: images[0] || null,
        mediaType,
      };

      // Pro-only fields
      if (isPro) {
        if (mediaType === "video" && videoFile) {
          body.video = videoFile;
        }
        if (isAd) {
          body.isAd = true;
          if (adVideoFile) {
            body.adVideo = adVideoFile;
          }
        }
      }

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPro) {
          setProError(data.message);
        } else {
          alert(data.message);
        }
        setLoading(false);
        return;
      }

      setPublished(true);

      // Reset form
      setTitle("");
      setTagline("");
      setDescription("");
      setCategory("Food");
      setImages([]);
      setVideoFile(null);
      setVideoPreview(null);
      setAdVideoFile(null);
      setAdVideoPreview(null);
      setIsAd(false);
      setMediaType("image");

      setTimeout(() => setPublished(false), 2000);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };


  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="post-wrapper">

        <div className="post-header">
          <h1>Launch Your Campaign</h1>
          <p>Build something bold. Make it unforgettable.</p>
          {isPro && (
            <span style={{
              display: 'inline-block',
              marginTop: '10px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: '600',
            }}>
              ✨ Pro Features Unlocked
            </span>
          )}
        </div>

        {/* Pro error banner */}
        {proError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            margin: '0 auto 24px',
            maxWidth: '800px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <span style={{ color: '#fca5a5', fontSize: '0.95rem' }}>⚠️ {proError}</span>
            <Link to="/pro" style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: '600',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              Upgrade to Pro →
            </Link>
          </div>
        )}

        <div className="post-container">

          {/* LEFT EDITOR */}
          <form className="post-editor" onSubmit={handlePublish}>

            {/* ── Media Type Selector (Pro Only) ── */}
            {isPro && (
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '16px',
              }}>
                <button
                  type="button"
                  onClick={() => setMediaType("image")}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: mediaType === 'image' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: mediaType === 'image' ? 'rgba(56,189,248,0.1)' : 'rgba(30,41,59,0.5)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  📷 Image Post
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType("video")}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: mediaType === 'video' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: mediaType === 'video' ? 'rgba(56,189,248,0.1)' : 'rgba(30,41,59,0.5)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  🎬 Video Post
                </button>
              </div>
            )}

            {/* Image Upload */}
            {mediaType === "image" && (
              <>
                <div className="upload-zone">
                  <label>
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <div className="image-preview-grid">
                  {images.map((img, index) => (
                    <div key={index} className="image-box">
                      <img src={img} alt="preview" />
                      <button type="button" onClick={() => removeImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Video Upload (Pro Only) */}
            {mediaType === "video" && isPro && (
              <>
                <div className="upload-zone">
                  <label>
                    🎬 Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={handleVideoUpload}
                    />
                  </label>
                </div>
                {videoPreview && (
                  <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden' }}>
                    <video src={videoPreview} controls style={{ width: '100%', borderRadius: '12px', maxHeight: '300px' }} />
                    <button type="button" onClick={removeVideo} style={{
                      position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)',
                      color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px',
                      cursor: 'pointer', fontSize: '14px',
                    }}>×</button>
                  </div>
                )}
              </>
            )}

            <input
              className="neon-input"
              placeholder="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="neon-input"
              placeholder="Short Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />

            <textarea
              className="neon-textarea"
              placeholder="Tell your campaign story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="neon-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Food</option>
              <option>Sports</option>
              <option>Electronics</option>
              <option>Tech</option>
            </select>

            {/* ── Ad Promotion Toggle (Pro Only) ── */}
            {isPro && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '8px',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  color: '#c084fc',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                }}>
                  <input
                    type="checkbox"
                    checked={isAd}
                    onChange={(e) => setIsAd(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#a855f7' }}
                  />
                  📢 Promote as Video Ad on Home Feed
                </label>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '8px 0 0', lineHeight: '1.5' }}>
                  Your ad will appear in the promoted section on the home page with autoplay video.
                </p>

                {isAd && (
                  <div style={{ marginTop: '12px' }}>
                    <div className="upload-zone">
                      <label>
                        🎥 Upload Ad Video
                        <input
                          type="file"
                          accept="video/*"
                          hidden
                          onChange={handleAdVideoUpload}
                        />
                      </label>
                    </div>
                    {adVideoPreview && (
                      <div style={{ position: 'relative', marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                        <video src={adVideoPreview} controls style={{ width: '100%', borderRadius: '12px', maxHeight: '200px' }} />
                        <button type="button" onClick={removeAdVideo} style={{
                          position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)',
                          color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px',
                          cursor: 'pointer', fontSize: '14px',
                        }}>×</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`publish-btn ${loading ? "loading" : ""}`}
            >
              {loading ? "Publishing..." : "Publish Campaign"}
            </button>

            {/* Free upgrade nudge */}
            {!isPro && (
              <Link to="/pro" style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '12px',
                color: '#38bdf8',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}>
                ✨ Upgrade to Pro for unlimited posts, video uploads & ads
              </Link>
            )}

          </form>

          {/* RIGHT LIVE PREVIEW */}
          <div className="post-preview">

            <div className="preview-card">

              {mediaType === "image" && images.length > 0 && (
                <img src={images[0]} alt="preview" />
              )}

              {mediaType === "video" && videoPreview && (
                <video src={videoPreview} controls muted style={{ width: '100%', borderRadius: '12px 12px 0 0' }} />
              )}

              <div className="preview-content">
                <span className="preview-category">{category}</span>
                <h2>{title || "Your Campaign Title"}</h2>
                <h4>{tagline || "Tagline preview appears here"}</h4>
                <p>
                  {description ||
                    "Your campaign description will update live as you type..."}
                </p>
                {isAd && (
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(168,85,247,0.15)',
                    color: '#c084fc',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    marginTop: '8px',
                  }}>📢 Promoted Ad</span>
                )}
              </div>

            </div>

          </div>

        </div>

        {published && (
          <div className="publish-overlay">
            <div className="publish-animation">
              <div className="checkmark">✓</div>
              <h2>Campaign Published Successfully!</h2>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
