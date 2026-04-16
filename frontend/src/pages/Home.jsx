import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/home.css";

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.warn("Failed to parse stored user", error);
    return null;
  }
};

export default function Home() {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promotedAds, setPromotedAds] = useState([]);
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setUser(getStoredUser());

    // Fetch promoted ads from Pro users
    fetch("http://localhost:5000/api/posts/promoted-ads")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPromotedAds(data);
      })
      .catch((err) => console.error("Failed to load promoted ads:", err));
  }, [navigate]);

  const videos = [
    "https://www.pexels.com/download/video/1201251/",
    "https://www.pexels.com/download/video/8848958/",
    "https://www.pexels.com/download/video/1448735/"
  ];

  const nextVideo = () => {
    setCurrent((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrent((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((vid, index) => {
      if (vid) {
        if (index === current) {
          vid.currentTime = 0;
          vid.play().catch(e => console.log("Play interrupted", e));
        } else {
          vid.pause();
        }
      }
    });
  }, [current]);

  // Auto-rotate promoted ads
  useEffect(() => {
    if (promotedAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % promotedAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [promotedAds]);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="home-wrapper">

        <section className="tv-hero">
          <div className="tv-container">
            <div className="tv-frame">
              {videos.map((video, index) => (
                <video
                  key={index}
                  ref={el => videoRefs.current[index] = el}
                  src={video}
                  className={`tv-video ${index === current ? "active" : ""}`}
                  muted
                  playsInline
                  preload={index === current ? "auto" : "metadata"}
                  onEnded={() => index === current && nextVideo()}
                  style={{
                    position: index === current ? "relative" : "absolute",
                    opacity: index === current ? 1 : 0,
                    transition: "opacity 0.5s ease"
                  }}
                />
              ))}
            </div>

            <div className="tv-controls">
              <button onClick={prevVideo}>◀</button>
              <button onClick={nextVideo}>▶</button>
            </div>
          </div>

          <div className="tv-content">
            <h1>
              Marketing That <span className="highlight-word">Captures</span>
              <br /> Attention
            </h1>
            <p>
              Launch powerful campaigns, dominate digital platforms,
              and grow your brand globally with Creatixo.
            </p>
            <button className="start-btn" onClick={() => navigate("/post")}>
              Start Marketing
            </button>
          </div>
        </section>

        {/* ── Promoted Ads from Pro Users ── */}
        {promotedAds.length > 0 && (
          <section className="promoted-ads-section">
            <div className="promoted-ads-header">
              <div className="promoted-ads-badge">📢 Sponsored</div>
              <h2 className="promoted-ads-title">Featured Campaigns</h2>
              <p className="promoted-ads-subtitle">Promoted by Creatixo Pro creators</p>
            </div>

            <div className="promoted-ads-carousel">
              {promotedAds.map((ad, index) => (
                <div
                  key={ad._id}
                  className={`promoted-ad-card ${index === currentAd ? 'active' : ''}`}
                  style={{
                    display: index === currentAd ? 'flex' : 'none',
                  }}
                >
                  <div className="promoted-ad-media">
                    {ad.adVideo ? (
                      <video
                        src={ad.adVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="promoted-ad-video"
                      />
                    ) : ad.video ? (
                      <video
                        src={ad.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="promoted-ad-video"
                      />
                    ) : ad.image ? (
                      <img src={ad.image} alt={ad.title} className="promoted-ad-img" />
                    ) : (
                      <div className="promoted-ad-placeholder">🎬</div>
                    )}
                  </div>

                  <div className="promoted-ad-content">
                    <div className="promoted-ad-user-row">
                      <img
                        src={ad.user?.avatar || "https://i.pravatar.cc/32"}
                        alt={ad.user?.name}
                        className="promoted-ad-avatar"
                      />
                      <div>
                        <span className="promoted-ad-username">{ad.user?.name || "Creator"}</span>
                        {ad.user?.isPro && (
                          <span className="promoted-ad-pro-badge">✨ Pro</span>
                        )}
                      </div>
                    </div>
                    <h3 className="promoted-ad-name">{ad.title}</h3>
                    <p className="promoted-ad-desc">{ad.description}</p>
                    <span className="promoted-ad-category">{ad.category}</span>
                  </div>
                </div>
              ))}

              {/* Dots */}
              {promotedAds.length > 1 && (
                <div className="promoted-ads-dots">
                  {promotedAds.map((_, idx) => (
                    <button
                      key={idx}
                      className={`promoted-dot ${idx === currentAd ? 'active' : ''}`}
                      onClick={() => setCurrentAd(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link to="/pro" style={{
                color: '#38bdf8',
                fontSize: '0.9rem',
                textDecoration: 'none',
                fontWeight: '500',
              }}>
                Want your campaign here? Upgrade to Pro →
              </Link>
            </div>
          </section>
        )}

        <section className="category-row">
          <Link to="/food" className="category-link">
            <div className="category-tile">Food</div>
          </Link>
          <Link to="/sports" className="category-link">
            <div className="category-tile">Sports</div>
          </Link>
          <Link to="/electronics" className="category-link">
            <div className="category-tile">Electronics</div>
          </Link>
          <Link to="/tech" className="category-link">
            <div className="category-tile">Tech</div>
          </Link>
        </section>

        <Footer />
      </div>
    </>
  );
}
