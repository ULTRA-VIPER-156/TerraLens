import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Cloud, Image, Menu, X, ChevronRight, Calendar } from "lucide-react";
import Ceres from "./pages/Ceres";
import Modis from "./pages/Modis";

const GlobalStyles = () => (
  <style>
    {`
      /* Base and Utility Styles (replacing core Tailwind classes) */
      .font-sans { font-family: 'Inter', sans-serif; }
      .min-h-screen { min-height: 100vh; }
      .flex-col { display: flex; flex-direction: column; }
      .flex-grow { flex-grow: 1; }
      .bg-gray-50 { background-color: #f9fafb; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .inset-0 { position: absolute; top: 0; right: 0; bottom: 0; left: 0; }
      .z-50 { z-index: 50; }
      .z-40 { z-index: 40; }

      /* Typography Colors */
      .text-white { color: white; }
      .text-gray-900 { color: #111827; }
      .text-gray-700 { color: #374151; }
      .text-gray-600 { color: #4b5563; }
      .text-gray-500 { color: #6b7280; }
      .text-blue-600 { color: #2563eb; }
      .text-blue-400 { color: #60a5fa; }
      .text-blue-100 { color: #dbeafe; }

      /* Hero Component Styles */
      .Hero {
        position: relative;
        height: 100vh;
        overflow: hidden;
      }

      .Hero-loading {
        position: absolute;
        ${'inset: 0;'}
        background: linear-gradient(to bottom right, #1f2937, #374151); /* from-gray-900 to-gray-700 */
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .Hero-loading-text { font-size: 1.5rem; line-height: 2rem; color: white; }
      
      /* Error State Styles */
      .Hero-error {
        position: absolute;
        ${'inset: 0;'}
        background: rgba(153, 27, 27, 0.8); /* Dark red background for error */
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem;
      }
      .Hero-error-box {
        padding: 2rem;
        border-radius: 0.75rem;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        max-width: 90%;
      }
      .Hero-error-box .error-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }
      .Hero-error-box .error-key-info {
        font-size: 0.875rem;
        margin-top: 1rem;
        color: #fca5a5; /* red-300 */
      }
      /* End Error State Styles */


      .Hero-background {
        position: absolute;
        ${'inset: 0;'}
          z-index: 0; /* sit beneath navbar which will have higher stacking context */
        }
      .Hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .Hero-overlay {
        position: absolute;
        ${'inset: 0;'}
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5), transparent); /* from-black/90 via-black/50 to-transparent */
      }
      
      .Hero-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2rem; /* p-8 */
      }
      @media (min-width: 768px) {
        .Hero-content { padding: 4rem; } /* md:p-16 */
      }
      
      .Hero-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
      .Hero-meta-text { font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }

      .APOD-controls { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.6rem; }
      .APOD-btn {
        background: rgba(255,255,255,0.06);
        color: white;
        border: 1px solid rgba(255,255,255,0.08);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .APOD-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .APOD-index { color: rgba(255,255,255,0.85); font-weight: 600; font-size: 0.9rem; margin-left: 0.5rem; }

      .Hero-title {
        font-size: 3rem; /* text-5xl */
        font-weight: 700;
        line-height: 1.25;
        margin-bottom: 1.5rem;
        filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07));
      }
      @media (min-width: 768px) {
        .Hero-title { font-size: 4.5rem; } /* md:text-7xl */
      }

      .Hero-subtitle {
        font-size: 1.25rem; /* text-xl */
        line-height: 1.75rem; /* leading-relaxed */
        margin-bottom: 2rem;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05));
      }
      @media (min-width: 768px) {
        .Hero-subtitle { font-size: 1.5rem; } /* md:text-2xl */
      }

      .Hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

      .Hero-button-primary {
        background-color: #2563eb;
        color: white;
        padding: 1rem 2rem;
        border-radius: 1rem;
        font-weight: 600;
        transition: background-color 0.2s, box-shadow 0.2s;
        box-shadow: 0 10px 15px -3px rgba(20, 45, 97, 0.5), 0 4px 6px -2px rgba(37, 99, 235, 0.5);
        border: none;
        cursor: pointer;
      }
      .Hero-button-primary:hover { background-color: #1d4ed8; }

      .Hero-button-secondary {
        background-color: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        color: white;
        padding: 1rem 2rem;
        border-radius: 1rem;
        font-weight: 600;
        transition: background-color 0.2s;
        border: 1px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
      }
      .Hero-button-secondary:hover { background-color: rgba(255, 255, 255, 0.2); }

      /* Navbar Styles - FIXED + GLASSMORPHIC */
      .Navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 60;
        height: 72px;
        display: flex;
        align-items: center;
        backdrop-filter: blur(8px) saturate(120%);
        background: linear-gradient(180deg, rgba(17,24,39,0.12), rgba(17,24,39,0.06));
        border-bottom: 1px solid rgba(255,255,255,0.06);
        box-shadow: 0 6px 24px rgba(2,6,23,0.15);
        /* make sure navbar floats above hero image */
      }
      /* make the container full width so logo can sit at the far left and nav at the far right */
      .Navbar-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem; /* small page edge padding */
        width: 100%;
        box-sizing: border-box;
      }
        .Navbar-inner {
          max-width: 80rem;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
          box-sizing: border-box;
        }
      .Navbar-logo-group { display: flex; align-items: center; gap: 0.75rem; }
      .Navbar-logo-icon { width: 2.5rem; height: 2.5rem; background-color: rgba(255,255,255,0.06); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
      .Navbar-title { font-size: 1.25rem; font-weight: 700; color: white; }
      .Navbar-title span { color: #60a5fa; }

  /* Desktop nav (hidden on small screens) */
  .Navbar-nav { display: none; gap: 1rem; align-items: center; }
  .Navbar-right { display: flex; align-items: center; gap: 1rem; }
  .Navbar-link { color: rgba(255,255,255,0.9); padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-weight: 600; background: transparent; border: none; cursor: pointer; }
  .Navbar-link:hover { background: rgba(255,255,255,0.04); }

  /* active state: lighter blue background and brighter text */
  
  .Navbar-link.active { background: rgba(0, 115, 255, 0.34); color: #e6f3ff; box-shadow: 0 6px 18px rgba(59,130,246,0.12); }

      .Navbar-menu-button { padding: 0.5rem; background-color: rgba(255,255,255,0.06); border-radius: 0.5rem; color: white; transition: background-color 0.15s; cursor: pointer; border: none; }
      .Navbar-menu-button:hover { background-color: rgba(255,255,255,0.1); }

      @media (min-width: 768px) {
        .Navbar-menu-button { display: none; }
        .Navbar-nav { display: flex; }
      }

    .Site-main { padding-top: 0; }

    /* helper class: apply when content starts below the hero so it isn't hidden by the fixed navbar */
    .Below-hero-padding { padding-top: 72px; }

      /* Mobile Menu */
      .Menu-backdrop { position: fixed; ${'inset: 0;'} background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 40; }
      .Menu-sidebar { position: fixed; top: 0; right: 0; bottom: 0; width: 20rem; max-width: 80vw; background-color: white; box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1); z-index: 50; padding: 1.5rem; }
      .Menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
      .Menu-close-button { padding: 0.5rem; border: none; background: none; transition: background-color 0.2s; border-radius: 0.5rem; cursor: pointer; color: #4b5563; }
      .Menu-close-button:hover { background-color: #f3f4f6; }
      .Menu-nav { display: flex; flex-direction: column; gap: 0.5rem; }
      .Menu-item {
        width: 100%; text-align: left; padding: 1rem; border-radius: 0.75rem; font-weight: 500; transition: all 0.2s;
        display: flex; justify-content: space-between; align-items: center; color: #374151; cursor: pointer; border: none;
      }
      .Menu-item:hover { background-color: #f3f4f6; }
      .Menu-item.active { background-color: #2563eb; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      .Menu-info-box { margin-top: 2rem; padding: 1rem; background-color: #eff6ff; border-radius: 0.75rem; }
      .Menu-info-box p { margin: 0; }
      .Menu-info-box .text-sm { font-size: 0.875rem; font-weight: 600; color: #4b5563; }
      .Menu-info-box .text-xs { font-size: 0.75rem; color: #6e96e6ff; margin-top: 0.25rem; }
      
      /* Dashboard Styles */
      .Dashboard-section { max-width: 80rem; margin-left: auto; margin-right: auto; padding: 5rem 1.5rem; }
      .text-center { text-align: center; }
      .mb-20 { margin-bottom: 5rem; }
      .Dashboard-title { font-size: 3rem; font-weight: 800; margin-bottom: 1.5rem; }
      @media (min-width: 768px) { .Dashboard-title { font-size: 3.75rem; } }
      .Dashboard-subtitle { font-size: 1.25rem; color: #4b5563; max-width: 42rem; margin-left: auto; margin-right: auto; }
      .Dashboard-cards { display: flex; flex-direction: column; gap: 2rem; }

      /* Card Styles */
      .Card {
        background-color: white; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.3s; border: 1px solid #f3f4f6;
      }
      @media (min-width: 768px) { .Card { padding: 3rem; } }
      .Card:hover { transform: scale(1.01); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
      .Card-content { display: flex; flex-direction: column; gap: 2rem; align-items: center; }
      @media (min-width: 768px) { .Card-content { flex-direction: row; } }
      
      .Card-text-group { flex: 1; width: 100%; }
      @media (min-width: 768px) { .Card-text-group { width: 66.6666%; } }
      
      .Card-content.reverse { text-align: right; }
      @media (min-width: 768px) { .Card-content.reverse { flex-direction: row-reverse; } }

      .Card-icon-bg { width: 4rem; height: 4rem; background-color: #2563eb; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
      @media (min-width: 768px) { .Card-content.reverse .Card-icon-bg { margin-left: auto; margin-right: 0; } }

      .Card-title { font-size: 1.875rem; font-weight: 700; margin-bottom: 1rem; }
      @media (min-width: 768px) { .Card-title { font-size: 2.25rem; } }
      .Card-description { font-size: 1.125rem; line-height: 1.6; margin-bottom: 1.5rem; }

      .Card-link { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1.125rem; transition: all 0.2s; border: none; background: none; cursor: pointer; }
      .Card-link:hover { gap: 0.75rem; }
      @media (min-width: 768px) { .Card-content.reverse .Card-link { justify-content: flex-end; } }
      
      .Card-image-container { width: 100%; }
      @media (min-width: 768px) { .Card-image-container { width: 33.3333%; } }

      .CERES-image-bg { height: 16rem; background: linear-gradient(to bottom right, #eff6ff, #bfdbfe); border-radius: 1rem; overflow: hidden; }
      @media (min-width: 768px) { .CERES-image-bg { height: 20rem; } }

      .MODIS-image-bg { height: 16rem; background: linear-gradient(to bottom right, #dcfce7, #bfdbfe); border-radius: 1rem; overflow: hidden; }
      @media (min-width: 768px) { .MODIS-image-bg { height: 20rem; } }

      .Card-image-bg img { width: 100%; height: 100%; object-fit: cover; }

      /* Call to Action (CTA) Styles */
      .CTA {
        margin-top: 5rem;
        background: linear-gradient(to bottom right, #2563eb, #1d4ed8);
        border-radius: 1.5rem;
        padding: 3rem 4rem;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      .CTA-title { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; }
      .CTA-subtitle { font-size: 1.125rem; color: #dbeafe; margin-bottom: 2rem; max-width: 32rem; margin-left: auto; margin-right: auto; }
      .CTA-button { background-color: white; color: #2563eb; padding: 1rem 2.5rem; border-radius: 1rem; font-weight: 600; transition: background-color 0.2s; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: none; cursor: pointer; }
      .CTA-button:hover { background-color: #eff6ff; }
      
      /* Page Content Styles (Ceres, Modis) */
      .Page-header { margin-bottom: 3rem; }
      .Page-title { font-size: 3rem; font-weight: 700; margin-bottom: 1.5rem; }
      @media (min-width: 768px) { .Page-title { font-size: 3.75rem; } }
      .Page-subtitle { font-size: 1.25rem; color: #4b5563; }
      
      .Page-visualization-box { background-color: white; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #f3f4f6; }
      .Ceres-placeholder { height: 24rem; background: linear-gradient(to bottom right, #eff6ff, #dbeafe); border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
      .Modis-placeholder { height: 24rem; background: linear-gradient(to bottom right, #f0fdf4, #d9f99d); border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
      .Placeholder-text { color: #6b7280; font-size: 1.125rem; }

      /* Footer Styles */
      .Footer { background-color: white; border-top: 1px solid #e5e7eb; margin-top: auto; }
      .Footer-text { color: #4b5563; font-size: 0.875rem; }
      
      /* Utility overrides for media queries */
      .max-w-7xl { max-width: 80rem; }
      .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
      
    `}
  </style>
);


function Hero() {
  const [apodData, setApodData] = useState(null);
  const [history, setHistory] = useState([]); // last 7 days
  const [index, setIndex] = useState(0); // 0 === most recent (today)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const NASA_API_KEY = 'RtCz1pv9LIoUaAJCRTnCVjMdTxrgngTTL41HGNnt';
    
  const fetchApod = async (retryCount = 0) => {
        const MAX_RETRIES = 5;
        const BASE_DELAY = 2000;

        try {
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`);
            
            if (!response.ok) {
                const errorMessage = response.status === 429 
                    ? `Rate Limit Exceeded (HTTP 429). You may need to wait 24 hours or check your API key validity.`
                    : `Failed to fetch APOD: HTTP ${response.status}`;
                
                throw new Error(errorMessage);
            }
            
      const data = await response.json();
      setApodData(data);
      setLoading(false);
      setError(null);

      const days = 7;
      const results = [data];
      const fmt = (d) => d.toISOString().split('T')[0];
      for (let i = 1; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const url = `https://api.nasa.gov/planetary/apod?date=${fmt(date)}&api_key=${NASA_API_KEY}`;
        try {
          const r = await fetch(url);
          if (r.ok) {
            const d = await r.json();
            results.push(d);
          }
        } catch (e) {
        }
      }
      setHistory(results);
        } catch (err) {
            console.error('Error fetching APOD:', err.message);
            
            if (err.message.includes("429")) {
                setError(err.message); 
                setLoading(false);
                return;
            }

            if (retryCount < MAX_RETRIES) {
                const delay = BASE_DELAY * Math.pow(2, retryCount);
                await new Promise(resolve => setTimeout(resolve, delay));
                fetchApod(retryCount + 1);
            } else {
                setError(`Failed to load image after ${MAX_RETRIES + 1} attempts. The service may be temporarily unavailable.`);
                setLoading(false);
            }
        }
    };

    fetchApod();
  }, []);

  useEffect(() => {
    if (history && history.length > 0) {
      setApodData(history[index] || history[0]);
    }
  }, [history, index]);

  // Placeholder URL for images that might fail to load (e.g., if APOD is a video)
  const defaultImageUrl = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920&q=80';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="Hero"
    >
      {loading ? (
        // Loading state
        <div className="Hero-loading">
          <div className="Hero-loading-text">Loading NASA Picture of the Day...</div>
        </div>
      ) : error ? (
        <div className="Hero-error">
            <div className="Hero-error-box">
                <p className="error-title">Connection Error</p>
                <p className="text-base">{error}</p>
            </div>
        </div>
      ) : (
        <>
          <div className="Hero-background">
           
            {apodData && apodData.media_type === 'image' ? (
                <img
                  src={apodData?.url || apodData?.hdurl || defaultImageUrl}
                  alt={apodData?.title || 'NASA Picture of the Day'}
                  className="Hero-image"
                  // Fallback for image loading error
                  onError={(e) => {
                    e.currentTarget.src = defaultImageUrl;
                  }}
                />
            ) : (
                <img
                    src={apodData?.url || defaultImageUrl} 
                    alt={apodData?.title || 'Space background'}
                    className="Hero-image"
                />
            )}
            
            {/* Dark overlay for text readability */}
            <div className="Hero-overlay"></div>
          </div>

          {/* Hero Content */}
          <div className="Hero-content">
            <div className="max-w-10xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:max-w-full lg:text-center"> 
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className=""
              >
                <div className="Hero-meta">
                    <div className="APOD-controls">
                      <button
                        className="APOD-btn"
                        onClick={() => setIndex((i) => Math.min(i + 1, (history.length - 1) || 0))}
                        disabled={index >= (history.length - 1)}
                        aria-label="Previous day"
                      >
                        ◀ Prev
                      </button>
                      <button
                        className="APOD-btn"
                        onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                        disabled={index <= 0}
                        aria-label="Next day"
                      >
                        Next ▶
                      </button>
                      
                      <span className="APOD-index">{history.length ? `${index + 1}/${history.length}` : ''}</span>
                    </div>
                    <br></br>
                  <div>

                  </div>
                </div>
                  <Calendar className="w-2 h-2 text-blue-400" />
                    <div className="Hero-meta-text text-blue-400">{apodData?.date ? `APOD: ${apodData.date}` : 'NASA Picture of the Day'}</div>
                <h1 className="Hero-title text-white">
                  {apodData?.title || 'Exploring Earth from Space'}
                </h1>
                <p className="Hero-subtitle text-white"> 
                  {apodData?.explanation ? 
                    (apodData.explanation.length > 250 ? 
                      apodData.explanation.substring(0, 250) + '...' : 
                      apodData.explanation) 
                    : 'Discover the wonders of space through NASA\'s Terra satellite mission'
                  }
                </p>
                <div className="Hero-buttons">
                  <button className="Hero-button-primary">
                    Explore Data
                  </button>
                  <button className="Hero-button-secondary">
                    Learn More
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

/**
 * Dashboard Component - Landing page content below the hero.
 */
function Dashboard() {
  return (
    <div className="Dashboard-section px-6 Below-hero-padding">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center mb-20"
      >
        <h2 className="Dashboard-title text-gray-900">
          Mission Data Insights
        </h2>
        <p className="Dashboard-subtitle text-gray-600">
          Access real-time Earth observation data from NASA's Terra satellite instruments.
        </p>
      </motion.div>

      <motion.div
        className="Dashboard-cards"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* CERES Instrument Card */}
        <motion.div
          whileHover={{ scale: 1.01, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="Card"
        >
          <div className="Card-content">
            <div className="Card-text-group">
              <div className="Card-icon-bg">
                <Cloud className="w-8 h-8 text-white" />
              </div>
              <h3 className="Card-title text-gray-900">CERES</h3>
              <p className="Card-description text-gray-600">
                Clouds and the Earth's Radiant Energy System provides critical measurements of Earth's radiation budget and cloud properties.
              </p>
              <button className="Card-link text-blue-600">
                Explore CERES Data
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="Card-image-container">
              <div className="CERES-image-bg Card-image-bg">
                <img 
                  src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80" 
                  alt="CERES" 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* MODIS Instrument Card */}
        <motion.div
          whileHover={{ scale: 1.01, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="Card"
        >
          <div className="Card-content reverse">
            <div className="Card-text-group">
              <div className="Card-icon-bg">
                <Image className="w-8 h-8 text-white" />
              </div>
              <h3 className="Card-title text-gray-900">MODIS</h3>
              <p className="Card-description text-gray-600">
                Moderate Resolution Imaging Spectroradiometer captures data about Earth's surface temperature, vegetation, and atmospheric conditions.
              </p>
              <button className="Card-link text-blue-600">
                Explore MODIS Data
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="Card-image-container">
              <div className="MODIS-image-bg Card-image-bg">
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" 
                  alt="MODIS" 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="CTA"
      >
        <h2 className="CTA-title">Dive Deeper into Earth Science</h2>
        <p className="CTA-subtitle">
          Access comprehensive satellite data and visualizations from NASA's Terra mission.
        </p>
        <button className="CTA-button">
          View All Datasets
        </button>
      </motion.div>
    </div>
  );
}


// Ceres component moved to src/pages/Ceres.jsx


    function Navbar({ currentPage, setCurrentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "dashboard" },
    { name: "CERES Data", path: "ceres" },
    { name: "MODIS Data", path: "modis" }
  ];

  return (
    <>
      <nav className="Navbar">
        <div className="Navbar-container">
          <div className="Navbar-inner">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="Navbar-logo-group"
          >
            <div className="Navbar-logo-icon">
              <Satellite className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="Navbar-title text-white">
              Terra<span className="text-blue-400">Lens</span>
            </h1>
          </motion.div>

          {/* Desktop nav links (right-aligned) */}
          <div className="Navbar-right">
            <div className="Navbar-nav" aria-hidden={false}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setCurrentPage(item.path)}
                  className={`Navbar-link ${currentPage === item.path ? 'active' : ''}`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="Navbar-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="Menu-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="Menu-sidebar"
            >
              <div className="p-6">
                <div className="Menu-header">
                  <div className="Navbar-logo-group">
                    <div className="Navbar-logo-icon bg-blue-600">
                      <Satellite className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="Navbar-title text-gray-900">
                      Terra<span className="text-blue-600">Lens</span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="Menu-close-button"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <nav className="Menu-nav">
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        setCurrentPage(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`Menu-item ${
                        currentPage === item.path
                          ? "active"
                          : ""
                      }`}
                    >
                      {item.name}
                      {currentPage !== item.path && <ChevronRight className="w-5 h-5 opacity-50" />}
                    </button>
                  ))}
                </nav>

                <div className="Menu-info-box">
                  <p className="text-sm">
                    NASA Terra Mission Data
                  </p>
                  <p className="text-xs">
                    APOD fetch courtesy of NASA's public API.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


function Footer() {
  return (
    <footer className="Footer">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">
        <p className="Footer-text">
          © {new Date().getFullYear()} TerraLens 
        </p>
      </div>
    </footer>
  );
}


const App = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "ceres":
        return <Ceres key="ceres" />;
      case "modis":
        return <Modis key="modis" />;
      case "dashboard":
      default:
        return (
          <div key="dashboard" className="flex-grow">
            <Hero />
            <Dashboard />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex-col bg-gray-50 font-sans">
      <GlobalStyles /> 
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
  <main className="flex-grow Site-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-grow" // Ensures content stretches appropriately
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
