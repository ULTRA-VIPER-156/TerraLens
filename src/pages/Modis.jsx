import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Layers, Map, Camera, CloudRain, Sun, Leaf, ArrowRight, Info, TrendingUp, Zap, Mountain, Clock, Globe, Flame, ChartBar } from 'lucide-react';

// --- Utility Components ---

// 1. Scroll indicator
const ScrollIndicator = () => (
    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s infinite', zIndex: 10 }}>
        <ChevronDown style={{ width: '40px', height: '40px', color: 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(0 0 5px rgba(0,255,255,0.5))' }} />
    </div>
);

// 2. Stats card (Enhanced Hover)
const StatsCard = ({ icon: Icon, title, value, unit, delay }) => (
    <div 
        style={{ 
            background: 'white', 
            borderRadius: '32px', 
            padding: '40px', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            animation: `slideUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s both`,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
        }}
    >
        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'linear-gradient(135deg, #06b6d4 0%, transparent 100%)', opacity: 0.07, borderRadius: '0 32px 0 100%' }}></div>
        <Icon style={{ width: '48px', height: '48px', color: '#06b6d4', marginBottom: '20px', transition: 'transform 0.3s' }} />
        <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>{value}</div>
        <div style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '500' }}>{unit}</div>
    </div>
);


// 3. Dynamic Graph Component (ANIMATED)
const DynamicGraph = ({ dataKey, color }) => {
    const canvasRef = useRef(null);
    const [data, setData] = useState({
        'thermal': { title: 'Thermal Anomaly Counts (Weekly)', value: 1245, unit: 'Active Fires', points: [10, 50, 40, 60, 30, 70, 50] },
        'ndvi': { title: 'Normalized Difference Vegetation Index (NDVI)', value: 0.78, unit: 'High Biomass', points: [50, 55, 60, 65, 70, 75, 78] },
        'aod': { title: 'Aerosol Optical Depth (Daily)', value: 0.15, unit: 'Low Opacity', points: [70, 65, 50, 40, 35, 30, 25] },
        'snow': { title: 'Snow Cover Percentage (Monthly)', value: 1.2, unit: '% Land Cover', points: [80, 75, 70, 65, 55, 40, 30] },
    }[dataKey]);

    useEffect(() => {
        setData({
            'thermal': { title: 'Thermal Anomaly Counts (Weekly)', value: 1245, unit: 'Active Fires', points: [10, 50, 40, 60, 30, 70, 50] },
            'ndvi': { title: 'Normalized Difference Vegetation Index (NDVI)', value: 0.78, unit: 'High Biomass', points: [50, 55, 60, 65, 70, 75, 78] },
            'aod': { title: 'Aerosol Optical Depth (Daily)', value: 0.15, unit: 'Low Opacity', points: [70, 65, 50, 40, 35, 30, 25] },
            'snow': { title: 'Snow Cover Percentage (Monthly)', value: 1.2, unit: '% Land Cover', points: [80, 75, 70, 65, 55, 40, 30] },
        }[dataKey]);
    }, [dataKey]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = 300;
        const height = 100;
        const maxVal = Math.max(...data.points);
        const minVal = Math.min(...data.points);
        const range = maxVal - minVal > 0 ? maxVal - minVal : 1;
        
        let startTime;
        let animationDuration = 1000;

        const draw = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / animationDuration);
            
            ctx.clearRect(0, 0, width, height);

            // Area fill
            ctx.fillStyle = color + '30';
            ctx.beginPath();
            ctx.moveTo(0, height);

            data.points.forEach((p, i) => {
                const x = (i / (data.points.length - 1)) * width * progress;
                const yRaw = 1 - ((p - minVal) / range);
                const y = 5 + yRaw * 90;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            
            if (progress === 1) {
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.fill();
            }

            // Line draw
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.beginPath();
            data.points.forEach((p, i) => {
                const x = (i / (data.points.length - 1)) * width * progress;
                const yRaw = 1 - ((p - minVal) / range);
                const y = 5 + yRaw * 90;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                // Draw circles at data points only when finished
                if (progress === 1) {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });

            ctx.stroke();

            if (progress < 1) {
                requestAnimationFrame(draw);
            }
        };

        let animationFrameId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationFrameId);
    }, [data, color]);

    return (
        <div style={{ padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', animation: `fadeIn 0.5s ease-out` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>{data.title}</div>
                    <div style={{ fontSize: '40px', fontWeight: '900', color: color, transition: 'color 0.5s' }}>
                        {data.value}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#9ca3af' }}>{data.unit}</div>
                </div>
                <TrendingUp style={{ width: '40px', height: '40px', color: color, opacity: 0.8, transition: 'color 0.5s' }} />
            </div>

            <canvas ref={canvasRef} width={300} height={100} style={{ width: '100%', height: '100px' }} />
        </div>
    );
};


// 4. Visualization Panel Component
const VisualizationPanel = ({ dataKey, setDataKey, delay }) => {
    const dataOptions = [
        { key: 'thermal', name: 'Thermal Anomalies (Fire)', color: '#ef4444', icon: Zap, image: 'https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?auto=format&fit=crop&w=1600&q=80', desc: "Real-time hotspots detected by MODIS Band 21/22 and 31." },
        { key: 'ndvi', name: 'NDVI (Vegetation Index)', color: '#10b981', icon: Leaf, image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1600&q=80', desc: "Monitoring global vegetation health and photosynthetic activity." },
        { key: 'aod', name: 'Aerosol Optical Depth', color: '#06b6d4', icon: CloudRain, image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1600&q=80', desc: "Tracking atmospheric clarity and pollution transport." },
        { key: 'snow', name: 'Snow/Ice Cover', color: '#60a5fa', icon: Mountain, image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1600&q=80', desc: "Tracking changes in snow and ice extent, crucial for water resources and albedo." },
    ];
    const currentData = dataOptions.find(d => d.key === dataKey);

    return (
        <div style={{ 
            gridColumn: 'span 2',
            background: '#fff', 
            borderRadius: '40px', 
            boxShadow: '0 12px 60px rgba(0,0,0,0.1)',
            animation: `fadeIn 1s ease-out ${delay}s both`,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            overflow: 'hidden'
        }}>
            
            {/* Left Column: Visualization */}
            <div style={{ height: '650px', overflow: 'hidden', position: 'relative' }}>
                <img 
                    src={currentData.image} 
                    alt={currentData.name}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        filter: currentData.key === 'thermal' ? 'hue-rotate(-10deg) saturate(1.5) contrast(1.2)' : 
                                currentData.key === 'ndvi' ? 'saturate(1.5)' : 
                                currentData.key === 'snow' ? 'grayscale(0.1) brightness(1.1)' : 'none',
                        transition: 'filter 0.5s, transform 0.5s' 
                    }}
                />
                 <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 80%)', color: 'white' }}>
                    <div style={{ fontSize: '42px', fontWeight: '900', margin: '0', color: currentData.color, textShadow: '0 2px 5px rgba(0,0,0,0.8)', transition: 'color 0.5s' }}>
                        {currentData.name}
                    </div>
                    <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                        {currentData.desc}
                    </p>
                </div>
            </div>

            {/* Right Column: Data Selection and Graphs */}
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
                    Select Data Product:
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '40px' }}>
                    {dataOptions.map(option => (
                        <button
                            key={option.key}
                            onClick={() => setDataKey(option.key)}
                            style={{
                                background: dataKey === option.key ? option.color : '#fff',
                                color: dataKey === option.key ? 'white' : '#111827',
                                border: dataKey === option.key ? `2px solid ${option.color}` : '2px solid #e2e8f0',
                                padding: '15px 10px',
                                borderRadius: '16px',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: dataKey === option.key ? `0 4px 15px ${option.color}40` : 'none'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <option.icon style={{ width: '28px', height: '28px', marginBottom: '8px', color: dataKey === option.key ? 'white' : option.color, transition: 'color 0.3s' }} />
                            {option.name.split('(')[0].trim()}
                        </button>
                    ))}
                </div>
                
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '10px 0 20px 0' }}>
                    Product Trends & Analysis
                </h3>
                <DynamicGraph dataKey={dataKey} color={currentData.color} />

                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '40px', padding: '20px', background: '#e0f2f1', borderRadius: '16px', borderLeft: `6px solid ${currentData.color}`, transition: 'border-left-color 0.5s' }}>
                    <Clock style={{ width: '30px', height: '30px', color: currentData.color, transition: 'color 0.5s' }} />
                    <p style={{ margin: 0, fontSize: '15px', color: '#111827' }}>
                        *Graph shows a simulated trend for **{currentData.name}** over time. Data derived from MODIS is continuously processed and archived.
                    </p>
                </div>

            </div>
        </div>
    );
};

// 5. Image card (for populated images)
const ImageCard = ({ src, title, description, delay, color }) => {
    return (
        <div 
            style={{ 
                background: 'white', 
                borderRadius: '40px', 
                overflow: 'hidden',
                boxShadow: '0 12px 60px rgba(0,0,0,0.1)',
                animation: `fadeIn 1s ease-out ${delay}s both`,
                cursor: 'pointer',
                transition: 'transform 0.4s',
                height: '100%', 
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01) translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        >
            <div style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
                <img 
                    src={src} 
                    alt={title}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        objectPosition: 'center 50%',
                    }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 40%)' }}></div>
            </div>
            <div style={{ padding: '40px', position: 'relative', marginTop: '-100px', color: 'white', background: color || 'transparent' }}>
                <h3 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 16px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{title}</h3>
                <p style={{ fontSize: '18px', lineHeight: '1.6', margin: 0, opacity: 0.9 }}>{description}</p>
            </div>
        </div>
    );
};


// --- Main Component ---

export default function ModisShowcase() {
    const [scrollY, setScrollY] = useState(0);
    const [modisData, setModisData] = useState(null); 
    const [selectedData, setSelectedData] = useState('snow');
    const [viewMode, setViewMode] = useState('default');
    const [ndviData, setNdviData] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchData = () => {
        setModisData("...LOADING");
        setTimeout(() => {
            setModisData({
                date: '2025-10-05',
                bands: '36 Spectral Bands',
                resolution: '250m - 1km',
            });
        }, 1500);
    };

    return (
        <div style={{ background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflowX: 'hidden' }}>
            
            {/* 1. CSS Keyframes for Animations */}
            <style>{`
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            `}</style>

            {/* ---------------------------------------------------------------------- */}
            {/* --- Hero Section (FIXED: Content bottom-left, Text size reduced) --- */}
            {/* ---------------------------------------------------------------------- */}
            <section style={{ 
                height: '75vh', // Reduced vertical space
                position: 'relative', 
                background: '#083344', 
                display: 'flex',
                // Align items to the bottom
                alignItems: 'flex-end', 
                overflow: 'hidden'
            }}>
                
                {/* MODIS Snow NDVI Video Background */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.4,
                        filter: 'grayscale(0.1) brightness(0.8)',
                        zIndex: 0
                    }}
                >
                    <source src="/src/pages/AussieSnowNDVI.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8, 51, 68, 0.18) 40%, rgba(8, 51, 68, 0.06))', zIndex: 1 }}></div>

                <div style={{ 
                    // Main content container
                    maxWidth: '1600px', 
                    margin: '0 auto', 
                    padding: '0 80px 40px 80px', 
                    width: '100%', 
                    position: 'relative', 
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'flex-start',
                }}>
                    
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        textAlign: 'left',
                        maxWidth: '650px',
                    }}>
                        
                        <div style={{ 
                            display: 'inline-block',
                            background: 'rgba(255, 255, 255, 0.12)',
                            backdropFilter: 'blur(5px)',
                            padding: '8px 20px', 
                            borderRadius: '30px',
                            marginBottom: '16px', 
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            animation: 'fadeIn 0.8s ease-out'
                        }}>
                            <span style={{ color: 'white', fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em' }}>PLUS ULTRA EARTH OBSERVATION</span>
                        </div>
                        
                        <h1 style={{ 
                            fontSize: '64px', 
                            fontWeight: '900', 
                            color: 'white', 
                            margin: '0 0 20px 0', 
                            lineHeight: '1.1',
                            letterSpacing: '-0.03em',
                            textShadow: '0 5px 15px rgba(0,0,0,0.4)',
                            animation: 'slideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both'
                        }}>
                            Tracking <span style={{ color: '#c43f3fff' }}>Wildfires on australia's</span> vegetation
                        </h1>
                        
                        {/* Specific Explanation Requested (reduced size) */}
                        <p style={{ 
                            fontSize: '18px', // Reduced size
                            color: 'rgba(255, 255, 255, 0.95)', 
                            lineHeight: '1.6',
                            marginBottom: '30px', // Reduced margin
                            animation: 'slideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both',
                            padding: '15px 25px', // Reduced padding
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '12px',
                        }}>
                            This visualization captures the **change in the fires covering the Aussie land (Australia)** over some time, observed by the **MODIS** instrument using its dedicated products (like the NDSI). Understanding these shifts is vital for climate research and regional water management.
                        </p>
                        
                        {/* API Data Placeholder / Action */}
                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '20px', animation: 'slideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both' }}>
                            <button 
                                onClick={fetchData}
                                style={{
                                    background: '#10b981', 
                                    color: 'white',
                                    padding: '16px 35px', // Reduced padding
                                    borderRadius: '12px', // Reduced border radius
                                    border: 'none',
                                    fontSize: '16px', // Reduced size
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                    e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                                    e.target.style.background = '#059669';
                                }}
                                onMouseLeave={e => {
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                    e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                                    e.target.style.background = '#10b981';
                                }}
                            >
                                {modisData ? 'Refresh Data' : 'Check MODIS Status'}
                                <Globe style={{ width: '20px', height: '20px' }} />
                            </button>
                            
                            {modisData && modisData !== "...LOADING" && (
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    fontSize: '14px',
                                    color: 'white',
                                    fontWeight: '600',
                                    animation: 'fadeIn 0.5s ease-out'
                                }}>
                                    API Success | Spectral Bands: **{modisData.bands}** | Resolution: **{modisData.resolution}**
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ScrollIndicator />
            </section>

            {/* ---------------------------------------------------------------------- */}
            {/* --- Vegetation Monitoring Section --- */}
            {/* ---------------------------------------------------------------------- */}
            <section style={{ padding: '120px 80px', background: '#ffffff' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    {/* Title Section */}
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#111827', marginBottom: '20px' }}>
                            Tracking Earth's <span style={{ color: '#000000ff' }}>Vegetation Pulse</span>
                        </h2>
                        <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '800px', margin: '0 auto' }}>
                            Discover how MODIS monitors global vegetation changes through seasonal cycles
                        </p>
                    </div>

                    {/* Video and Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                        {/* Video Column */}
                        <div style={{ 
                            background: '#0f172a',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            >
                                <source src="/src/pages/Effect of Seasonal Vegetation cycle by modis.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* Info Column */}
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
                                Understanding Vegetation Dynamics
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-green-100 rounded-lg">
                                        <Leaf className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Seasonal Changes</h4>
                                        <p className="text-gray-600">Watch as MODIS captures the rhythmic changes in vegetation across seasons, revealing Earth's natural cycles.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="mt-1 p-3 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl border border-orange-500/20 transition-all duration-300 group-hover:scale-110 group-hover:border-orange-500/30">
                                        <Flame className="w-7 h-7 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-orange-400 mb-2">Global Fire Impact</h4>
                                        <p className="text-gray-300 leading-relaxed">Track the immediate and long-term effects of wildfires on diverse ecosystems and vegetation patterns worldwide.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="mt-1 p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl border border-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:border-blue-500/30">
                                        <TrendingUp className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-blue-400 mb-2">Global Recovery Patterns</h4>
                                        <p className="text-gray-300 leading-relaxed">Monitor vegetation recovery and regeneration patterns after fire events using MODIS's comprehensive global coverage.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setViewMode('ndvi')}
                                    className="mt-8 group relative"
                                    style={{
                                        padding: '16px 32px',
                                        background: 'linear-gradient(45deg, #dc2626, #ea580c)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-white/20 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <span className="relative flex items-center justify-center gap-2 text-white font-semibold text-lg">
                                        Explore Fire Data
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------------- */}
            {/* --- NDVI Interactive Section --- */}
            {/* ---------------------------------------------------------------------- */}
            {viewMode === 'ndvi' && (
                <section style={{ padding: '120px 80px', background: '#f8fafc' }}>
                    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '60px' }}>
                            <button
                                onClick={() => setViewMode('default')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '2rem',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    color: '#4b5563',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#f9fafb';
                                    e.currentTarget.style.color = '#111827';
                                    e.currentTarget.style.transform = 'translateX(-4px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.color = '#4b5563';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <ChevronDown style={{ width: '1.25rem', height: '1.25rem', transform: 'rotate(90deg)' }} />
                                Back to Overview
                            </button>
                            <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#111827', marginBottom: '20px' }}>
                                NDVI <span style={{ color: '#10b981' }}>Analysis</span>
                            </h2>
                            <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '800px' }}>
                                Explore how MODIS uses NDVI to track vegetation health and density across different regions and seasons.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Interactive Map */}
                            <div style={{ 
                                background: 'white',
                                borderRadius: '1.5rem',
                                padding: '2rem',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                transform: 'scale(1)',
                                transition: 'all 0.3s ease',
                                border: '1px solid #e5e7eb'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <h3 style={{ 
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#111827',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <Map style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
                                    Global NDVI Distribution
                                </h3>
                                <div style={{ 
                                    borderRadius: '1rem',
                                    overflow: 'hidden',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#1e293b',
                                        padding: '1.5rem'
                                    }}>
                                        <img 
                                            src="/src/pages/Data/April-2002_Heatmap.png"
                                            alt="NDVI Heatmap - April 2002"
                                            style={{ 
                                                width: '100%',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                filter: 'contrast(1.1) brightness(1.1)'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem',
                                        background: '#f3f4f6',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Info style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                                        <span>NDVI Heatmap visualization for April 2002</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.875rem',
                                        color: '#4b5563',
                                        fontWeight: '500'
                                    }}>
                                        <span>Low NDVI (-1.0 to 0.1)</span>
                                        <span>High NDVI (0.6 to 1.0)</span>
                                    </div>
                                    <div style={{ 
                                        height: '0.75rem',
                                        background: 'linear-gradient(to right, #ef4444, #eab308, #10b981)',
                                        borderRadius: '9999px',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                    }}></div>
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '1rem',
                                        background: '#f3f4f6',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        color: '#4b5563',
                                        lineHeight: '1.5'
                                    }}>
                                        <p style={{ marginBottom: '0.5rem' }}>
                                            NDVI measures vegetation density by comparing near-infrared (NIR) and red light reflection.
                                        </p>
                                        <ul style={{ 
                                            listStyle: 'none', 
                                            padding: 0, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            gap: '0.5rem' 
                                        }}>
                                            <li> <strong style={{ color: '#ef4444' }}>-1.0 to 0.1:</strong> Water bodies, snow, or bare ground</li>
                                            <li> <strong style={{ color: '#eab308' }}>0.1 to 0.3:</strong> Sparse vegetation, urban areas</li>
                                            <li> <strong style={{ color: '#84cc16' }}>0.3 to 0.6:</strong> Grasslands, shrubs, crops</li>
                                            <li> <strong style={{ color: '#10b981' }}>0.6 to 1.0:</strong> Dense forests, peak growing season</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Info Panel */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* What is NDVI? */}
                                <div style={{ 
                                    background: 'white',
                                    borderRadius: '1.5rem',
                                    padding: '2rem',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                    transform: 'scale(1)',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid #e5e7eb'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                                }}
                                >
                                    <h3 style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <Info style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
                                        What is NDVI?
                                    </h3>
                                    <p style={{
                                        color: '#4b5563',
                                        marginBottom: '1.5rem',
                                        lineHeight: '1.6',
                                        fontSize: '1rem'
                                    }}>
                                        The Normalized Difference Vegetation Index (NDVI) is a powerful indicator that reveals vegetation density and health by analyzing the way plants reflect different wavelengths of light.
                                    </p>
                                    <div style={{
                                        background: '#f8fafc',
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <h4 style={{
                                            fontSize: '1.125rem',
                                            fontWeight: '600',
                                            color: '#3b82f6',
                                            marginBottom: '1rem'
                                        }}>NDVI Formula:</h4>
                                        <div style={{
                                            textAlign: 'center',
                                            background: 'white',
                                            padding: '1.5rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <p style={{
                                                fontFamily: 'monospace',
                                                fontSize: '1.25rem',
                                                color: '#111827',
                                                marginBottom: '1rem'
                                            }}>NDVI = (NIR - RED) / (NIR + RED)</p>
                                            <div style={{
                                                marginTop: '1rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem',
                                                fontSize: '0.875rem',
                                                color: '#6b7280'
                                            }}>
                                                <p style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>NIR</span> = Near-infrared reflection
                                                </p>
                                                <p style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <span style={{ color: '#ef4444', fontWeight: '600' }}>RED</span> = Red light reflection
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NDVI Values */}
                                <div style={{ 
                                    background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
                                    borderRadius: '1.5rem',
                                    padding: '2rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    transform: 'scale(1)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <h3 style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <ChartBar style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
                                        Understanding NDVI Values
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Dense vegetation */}
                                        <div style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)';
                                            e.currentTarget.style.borderColor = '#10b981';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                        >
                                            <div style={{ 
                                                width: '5rem',
                                                height: '1.5rem',
                                                background: 'linear-gradient(to right, #059669, #34d399)',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                                            }}></div>
                                            <div>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#059669' }}>0.6 to 1.0</p>
                                                <p style={{ color: '#6b7280' }}>Dense vegetation (forests)</p>
                                            </div>
                                        </div>

                                        {/* Moderate vegetation */}
                                        <div style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.1)';
                                            e.currentTarget.style.borderColor = '#22c55e';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                        >
                                            <div style={{ 
                                                width: '5rem',
                                                height: '1.5rem',
                                                background: 'linear-gradient(to right, #22c55e, #4ade80)',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
                                            }}></div>
                                            <div>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#22c55e' }}>0.2 to 0.6</p>
                                                <p style={{ color: '#6b7280' }}>Moderate vegetation (grasslands)</p>
                                            </div>
                                        </div>

                                        {/* Sparse vegetation */}
                                        <div style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.1)';
                                            e.currentTarget.style.borderColor = '#eab308';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                        >
                                            <div style={{ 
                                                width: '5rem',
                                                height: '1.5rem',
                                                background: 'linear-gradient(to right, #eab308, #fde047)',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 2px 4px rgba(234, 179, 8, 0.1)'
                                            }}></div>
                                            <div>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#eab308' }}>0.1 to 0.2</p>
                                                <p style={{ color: '#6b7280' }}>Sparse vegetation (bare soils)</p>
                                            </div>
                                        </div>

                                        {/* No vegetation */}
                                        <div style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.1)';
                                            e.currentTarget.style.borderColor = '#ef4444';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                        >
                                            <div style={{ 
                                                width: '5rem',
                                                height: '1.5rem',
                                                background: 'linear-gradient(to right, #dc2626, #ef4444)',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)'
                                            }}></div>
                                            <div>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ef4444' }}>-1.0 to 0.1</p>
                                                <p style={{ color: '#6b7280' }}>No vegetation (water, clouds, snow)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-6 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/20"
                                    onClick={() => window.location.href = 'https://modis.gsfc.nasa.gov/data/dataprod/mod13.php'}
                                >
                                    Access MODIS NDVI Data
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            
            {/* ---------------------------------------------------------------------- */}
            {/* --- Stats Section --- */}
            {/* ---------------------------------------------------------------------- */}
            <section style={{ padding: '120px 80px', background: '#f5f7fa' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <h2 style={{ fontSize: '60px', fontWeight: '900', color: '#111827', marginBottom: '20px', margin: 0, letterSpacing: '-0.02em' }}>
                            Technical <span style={{ color: '#06b6d4' }}>Precision</span>
                        </h2>
                        <p style={{ fontSize: '24px', color: '#6b7280', maxWidth: '800px', margin: '20px auto 0' }}>
                            MODIS captures a vast spectrum of data, enabling over 50 products across four key domains.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        <StatsCard icon={Layers} title="Spectral Bands" value="36" unit="From Visible to IR" delay={0.0} />
                        <StatsCard icon={Camera} title="Swath Width" value="2,330 km" unit="Nearly Global Coverage" delay={0.1} />
                        <StatsCard icon={Map} title="Data Products" value="50+" unit="Land, Ocean, Atmosphere" delay={0.2} />
                        <StatsCard icon={CloudRain} title="Spatial Resolution" value="250m" unit="Highest Level Detail" delay={0.3} />
                    </div>
                </div>
            </section>
            
            {/* ---------------------------------------------------------------------- */}
            {/* --- Visualization Panel (Interactive Graphs & Selection) --- */}
            {/* ---------------------------------------------------------------------- */}
            <section style={{ padding: '120px 80px', background: 'white' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'left', marginBottom: '80px', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '60px', fontWeight: '900', color: '#111827', margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>
                            current stats </h2>
                        <p style={{ fontSize: '20px', color: '#6b7280', margin: 0 }}>
                            Explore critical MODIS products. Select a product to see its corresponding imagery and simulated data trends.
                        </p>
                    </div>

                    <VisualizationPanel 
                        dataKey={selectedData} 
                        setDataKey={setSelectedData} 
                        delay={0.0} 
                    />
                </div>
            </section>
            


            {/* ---------------------------------------------------------------------- */}
            {/* --- About Mission Section --- */}
            {/* ---------------------------------------------------------------------- */}
            <section style={{ padding: '150px 80px', background: '#083344', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#06b6d4 1px, #083344 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>
                
                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <Info style={{ width: '60px', height: '60px', color: '#facc15', marginBottom: '24px' }} />
                        <h2 style={{ fontSize: '72px', fontWeight: '900', marginBottom: '24px', margin: 0, letterSpacing: '-0.02em' }}>
                            The MODIS <span style={{ color: '#10b981' }}>Tandem Mission</span>
                        </h2>
                        <p style={{ fontSize: '24px', opacity: 0.8, maxWidth: '900px', margin: '24px auto 0', lineHeight: '1.7' }}>
                            Two identical MODIS instruments fly aboard the **Terra** (Morning) and **Aqua** (Afternoon) satellites, capturing a complete view of the Earth's surface and atmosphere every 1 to 2 days.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                        {[
                            {
                                icon: Sun,
                                title: 'Terra Satellite (EOS AM)',
                                text: 'Crosses the equator in the morning (10:30 am local time), ideal for studying land surface conditions and atmospheric aerosols.'
                            },
                            {
                                icon: CloudRain,
                                title: 'Aqua Satellite (EOS PM)',
                                text: 'Crosses the equator in the afternoon (1:30 pm local time), perfect for gathering data on cloud processes, precipitation, and sea surface temperature.'
                            },
                            {
                                icon: Leaf,
                                title: 'Data Legacy',
                                text: 'The continuous, long-term MODIS data record is now transitioned and extended by the next-generation VIIRS instrument, ensuring climate continuity.'
                            }
                        ].map((item, i) => (
                            <div 
                                key={i}
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '40px', 
                                    borderRadius: '32px',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    transition: 'background 0.3s',
                                    animation: `slideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.2}s both`
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            >
                                <item.icon style={{ width: '48px', height: '48px', marginBottom: '20px', color: '#10b981' }} />
                                <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', margin: '0 0 16px 0' }}>{item.title}</h3>
                                <p style={{ fontSize: '18px', lineHeight: '1.7', opacity: 0.85, margin: 0 }}>{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '80px' }}>
                        <h3 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px', margin: 0 }}>
                            Break Through and Push Beyond
                        </h3>
                        <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '800px', margin: '20px auto 40px', lineHeight: '1.7' }}>
                            Data insights drive action. Utilize these tools to push beyond current limitations and achieve **Plus Ultra** understanding of our planet.
                        </p>
                        <button style={{
                            background: '#06b6d4',
                            color: 'white',
                            padding: '20px 45px',
                            borderRadius: '16px',
                            border: 'none',
                            fontSize: '20px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            transition: 'transform 0.2s, background 0.2s'
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-3px)'; e.target.style.background = '#0891b2'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.background = '#06b6d4'; }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                explore <ArrowRight style={{ width: '24px', height: '24px' }} />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}