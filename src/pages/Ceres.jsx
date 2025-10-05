import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ChevronDown, Cloud, Zap, TrendingUp, Globe, Satellite, ArrowRight, Info, HardHat, MapPin, BarChart3, Layers } from 'lucide-react';
import * as d3 from 'd3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Component Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: '20px', 
                    background: '#fee2e2', 
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#7f1d1d'
                }}>
                    <h3>Something went wrong</h3>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            background: '#dc2626',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            marginTop: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Loading component
const LoadingSpinner = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: '#3b82f6'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid currentColor',
            borderRight: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
    </div>
);

// DateSlider Component with Error Boundary
const DateSlider = ({ currentDate, dates, onChange }) => {
    const currentIndex = dates.indexOf(currentDate);
    
    return (
        <div style={{
            padding: '15px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
            }}>
                <span>{currentDate}</span>
                <span>{Math.round((currentIndex / (dates.length - 1)) * 100)}%</span>
            </div>
            <input
                type="range"
                min="0"
                max={dates.length - 1}
                value={currentIndex}
                onChange={(e) => {
                    e.stopPropagation();
                    onChange(dates[e.target.value]);
                }}
                style={{
                    width: '100%',
                    height: '4px',
                    WebkitAppearance: 'none',
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentIndex / (dates.length - 1)) * 100}%, #4b5563 ${(currentIndex / (dates.length - 1)) * 100}%, #4b5563 100%)`,
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer'
                }}
            />
        </div>
    );
};

// --- Utility Components ---

// Data type information
const dataTypeInfo = {
    "Cloud Area Fraction Processed": {
        title: "Cloud Area Fraction",
        description: "Latest cloud coverage data showing the global distribution of clouds. CERES measurements reveal how different cloud types and their coverage patterns influence Earth\u2019s radiation budget.",
        colorScale: "YlOrRd"
    },
    "TOA Net Flux Processed": {
        title: "Top of Atmosphere Net Flux",
        description: "Current net radiative flux at the top of Earth\u2019s atmosphere, showing the balance between incoming solar radiation and outgoing heat. Critical for understanding global energy dynamics.",
        colorScale: "RdBu"
    },
    "TOA Longwave Flux Processed": {
        title: "Top of Atmosphere Longwave Flux",
        description: "Global map of outgoing longwave radiation, revealing how Earth\u2019s surface and atmosphere emit heat back to space. Essential for tracking Earth\u2019s thermal energy distribution.",
        colorScale: "Spectral"
    }
};

// D3 Heatmap Component with Error Boundary
const D3Heatmap = ({ geojsonPath, colorScale = 'viridis', title }) => {
    const svgRef = useRef();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: null });

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(geojsonPath);
                if (!response.ok) throw new Error('HTTP error! status: ' + response.status);
                const geoData = await response.json();
                if (mounted) {
                    setData(geoData);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error loading geojson:', error);
                if (mounted) {
                    setError(error.message);
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { mounted = false; };
    }, [geojsonPath]);

    useEffect(() => {
        if (!data) return;

        // Setup
        const width = 800;
        const height = 400;
        const margin = { top: 30, right: 30, bottom: 30, left: 30 };

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Create color scale
        const values = data.features.map(f => f.properties.value);
        const colorScheme = d3[`interpolate${colorScale}`];
        const color = d3.scaleSequential()
            .domain([d3.min(values), d3.max(values)])
            .interpolator(colorScheme);

        // Create projection
        const projection = d3.geoMercator()
            .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], data);

        const path = d3.geoPath().projection(projection);

        // Add features
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        g.selectAll('path')
            .data(data.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', d => color(d.properties.value))
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .on('mouseover', (event, d) => {
                setTooltip({
                    show: true,
                    x: event.pageX,
                    y: event.pageY,
                    value: d.properties.value.toFixed(2)
                });
            })
            .on('mouseout', () => {
                setTooltip({ show: false, x: 0, y: 0, value: null });
            });

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(title);

        // Add color legend
        const legendWidth = 200;
        const legendHeight = 15;

        const legendScale = d3.scaleLinear()
            .domain(color.domain())
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".1f"));

        const legend = svg.append('g')
            .attr('transform', `translate(${width - margin.right - legendWidth}, ${height - margin.bottom})`);

        const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase()}`;

        // Create gradient
        const gradient = legend.append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');

        // Add gradient stops
        const stops = d3.range(0, 1.1, 0.1);
        stops.forEach(stop => {
            gradient.append('stop')
                .attr('offset', `${stop * 100}%`)
                .attr('stop-color', color(d3.quantile(values, stop)));
        });

        // Add legend rectangle
        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', `url(#${gradientId})`);

        // Add legend axis
        legend.append('g')
            .attr('transform', `translate(0, ${legendHeight})`)
            .call(legendAxis);

    }, [data, colorScale, title]);

    if (loading) return <LoadingSpinner />;
    if (error) return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#7f1d1d', borderRadius: '8px' }}>
            Error loading visualization: {error}
        </div>
    );

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
            {tooltip.show && (
                <div style={{
                    position: 'fixed',
                    left: tooltip.x + 10,
                    top: tooltip.y - 10,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    pointerEvents: 'none',
                    zIndex: 1000
                }}>
                    {tooltip.value}
                </div>
            )}
        </div>
    );
};

// 1. Fake Animated Globe Component (Canvas-based for performance and control)
const AnimatedGlobe = () => {
    const canvasRef = useRef(null);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationId;
        const animate = () => {
            setRotation(r => (r + 0.3) % 360);
            
            // Clear
            ctx.clearRect(0, 0, width, height);
            
            // Draw globe
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - 40;
            
            // Outer glow effect
            const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.5);
            glow.addColorStop(0, 'rgba(59, 130, 246, 0)');
            glow.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Main sphere (Deep Space Blue Gradient)
            const gradient = ctx.createRadialGradient(
                centerX - radius * 0.5, 
                centerY - radius * 0.5, 
                radius * 0.1,
                centerX, 
                centerY, 
                radius
            );
            gradient.addColorStop(0, '#0f172a'); // Near black/dark blue
            gradient.addColorStop(0.7, '#1e3a8a'); // Dark blue
            gradient.addColorStop(1, '#0c4a6e'); // Deep cyan-blue
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Grid lines (subtle white/grey)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            
            // Latitude lines
            for (let lat = -60; lat <= 60; lat += 30) {
                ctx.beginPath();
                const y = centerY + (lat / 90) * radius * 0.8;
                const w = Math.cos((lat * Math.PI) / 180) * radius;
                ctx.ellipse(centerX, y, w, radius * 0.05, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Longitude lines with rotation (only drawing front side)
            for (let i = 0; i < 12; i++) {
                const angle = (i * 30 + rotation) * (Math.PI / 180);
                const visibility = Math.cos(angle);
                
                if (visibility > 0.05) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 * visibility})`;
                    for (let lat = -90; lat <= 90; lat += 5) {
                        const latRad = (lat * Math.PI) / 180;
                        const x = centerX + Math.sin(angle) * Math.cos(latRad) * radius;
                        const y = centerY + Math.sin(latRad) * radius;
                        
                        if (lat === -90) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
            }
            
            // Fake data "heat" points (for visual flare)
            ctx.fillStyle = 'rgba(255, 165, 0, 0.7)';
            for (let i = 0; i < 150; i++) {
                const angle = ((i * 15 + rotation * 1.5) % 360) * (Math.PI / 180);
                const lat = ((i * 11) % 180 - 90) * (Math.PI / 180);
                const visibility = Math.cos(angle);
                
                if (visibility > 0.1) {
                    const x = centerX + Math.sin(angle) * Math.cos(lat) * radius;
                    const y = centerY + Math.sin(lat) * radius;
                    const size = Math.random() * 2 + 1;
                    
                    ctx.fillStyle = `rgba(255, 165, 0, ${0.4 + visibility * 0.6})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            animationId = requestAnimationFrame(animate);
        };
        
        animate();
        return () => cancelAnimationFrame(animationId);
    }, [rotation]);

    return <canvas ref={canvasRef} width={800} height={800} style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '800px' }} />;
};

// 2. Scroll indicator with bounce animation
const ScrollIndicator = () => (
    <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s infinite', zIndex: 10 }}>
        <ChevronDown style={{ width: '40px', height: '40px', color: 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }} />
    </div>
);

// 3. Stats card with entrance and hover animation
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
            transition: 'transform 0.3s, box-shadow 0.3s'
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
        }}
    >
        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'linear-gradient(135deg, #3b82f6 0%, transparent 100%)', opacity: 0.07, borderRadius: '0 32px 0 100%' }}></div>
        <Icon style={{ width: '48px', height: '48px', color: '#1e3a8a', marginBottom: '20px' }} />
        <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>{value}</div>
        <div style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '500' }}>{unit}</div>
    </div>
);

// Common dates available across all datasets
const commonDates = [
    'December-2000', 'January-2001', 'February-2001', 'March-2001',
    'April-2001', 'May-2001', 'June-2001', 'July-2001', 'August-2001',
    'September-2001', 'October-2001', 'November-2001', 'December-2001',
    'January-2002', 'February-2002', 'March-2002', 'April-2002',
    'May-2002', 'June-2002', 'July-2002', 'August-2002', 'September-2002',
    'October-2002', 'November-2002', 'December-2002'
];

// 4. Interactive data visualization card with D3 heatmap
const ImageCard = ({ dataType, title, description, delay, colorScale }) => {
    const [currentDateIndex, setCurrentDateIndex] = useState(0);
    const [imageError, setImageError] = useState(false);
    const cardRef = useRef(null);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewMode, setViewMode] = useState('heatmap');

    // Function to get the current image and geojson paths
    const getPaths = () => {
        const date = commonDates[currentDateIndex];
        return {
            imagePath: `/src/pages/CeresData/${dataType}/${date}_Heatmap.png`,
            geojsonPath: `/src/pages/CeresData/${dataType}/${date}.geojson`
        };
    };

    // Handle manual date navigation
    const handleDateChange = (newIndex) => {
        setCurrentDateIndex(newIndex);
    };

    // Handle image loading and errors
    useEffect(() => {
        const { imagePath: newImagePath } = getPaths();
        setImageError(false);

        const img = new Image();
        img.onload = () => {
            setImageError(false);
        };
        img.onerror = () => {
            setImageError(true);
        };
        img.src = newImagePath;
    }, [currentDateIndex, dataType]);

    const paths = getPaths();

    return (
        <>
            <div 
                ref={cardRef}
                onClick={(e) => {
                    if (e.target.type === 'range') return;
                    setIsExpanded(true);
                }}
                style={{ 
                    background: 'white', 
                    borderRadius: '40px', 
                    overflow: 'hidden',
                    boxShadow: '0 12px 60px rgba(0,0,0,0.1)',
                    animation: `fadeIn 1s ease-out ${delay}s both`,
                    cursor: 'pointer',
                    transition: 'transform 0.4s'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.01) translateY(-5px)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
            >
            <div style={{ height: '600px', overflow: 'hidden', position: 'relative' }}>
                <img 
                    key={paths.imagePath}
                    src={paths.imagePath} 
                    alt={`${title} - ${commonDates[currentDateIndex]}`}
                    style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'contain',
                        display: imageError ? 'none' : 'block'
                    }}
                />
                {imageError && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.1)',
                        color: '#666',
                        fontSize: '16px'
                    }}>
                        Loading next available data...
                    </div>
                )}
                
                {/* Date indicator */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    zIndex: 2
                }}>
                    {commonDates[currentDateIndex]}
                </div>

                {/* Interactive Timeline */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    padding: '15px 20px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '12px',
                    zIndex: 2
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                        color: 'white'
                    }}>
                        <span style={{ fontSize: '14px' }}>{commonDates[currentDateIndex]}</span>
                        <span style={{ fontSize: '14px' }}>{Math.round((currentDateIndex / (commonDates.length - 1)) * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={commonDates.length - 1}
                        value={currentDateIndex}
                        onChange={(e) => handleDateChange(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '4px',
                            WebkitAppearance: 'none',
                            background: `linear-gradient(to right, 
                                rgba(255, 255, 255, 0.8) 0%, 
                                rgba(255, 255, 255, 0.8) ${(currentDateIndex / (commonDates.length - 1)) * 100}%, 
                                rgba(255, 255, 255, 0.2) ${(currentDateIndex / (commonDates.length - 1)) * 100}%, 
                                rgba(255, 255, 255, 0.2) 100%)`,
                            borderRadius: '2px',
                            cursor: 'pointer'
                        }}
                    />
                </div>
            </div>
            <div style={{ 
                padding: '40px', 
                position: 'relative', 
                color: '#111827'
            }}>
                <h3 style={{ 
                    fontSize: '32px', 
                    fontWeight: '800', 
                    margin: '0 0 16px 0'
                }}>{title}</h3>
                <p style={{ fontSize: '18px', lineHeight: '1.6', margin: 0, opacity: 0.9 }}>{description}</p>
            </div>
        </div>

        {/* Expanded View Modal */}
        {isExpanded && (
            <div 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) setIsExpanded(false);
                }}
            >
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    width: '95%',
                    height: '95%',
                    maxHeight: '95vh',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '24px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{title} - {commonDates[currentDateIndex]}</h3>
                        <button
                            onClick={() => setIsExpanded(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '24px',
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    }}>

                        {/* Main visualization - Bigger view */}
                        <div style={{
                            position: 'relative',
                            flex: 1,
                            minHeight: '600px',
                            background: '#f8fafc',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            padding: '20px'
                        }}>
                            <div style={{ 
                                height: '100%', 
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    src={paths.imagePath} 
                                    alt={`${title} - ${commonDates[currentDateIndex]}`}
                                    style={{ 
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '16px',
                            flexWrap: 'wrap'
                        }}>
                            <DateSlider
                                currentDate={commonDates[currentDateIndex]}
                                dates={commonDates}
                                onChange={(date) => setCurrentDateIndex(commonDates.indexOf(date))}
                            />
                            
                            <button
                                onClick={() => setShowHeatmap(!showHeatmap)}
                                style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {showHeatmap ? 'Show Image' : 'Show Heatmap'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

// --- Main Component ---

export default function CeresShowcase() {
    const [selectedDate, setSelectedDate] = useState(commonDates[commonDates.length - 1]);
    const [selectedDataType, setSelectedDataType] = useState("Cloud Area Fraction Processed");
    const [ceresData, setCeresData] = useState(null);
    const [scrollY, setScrollY] = useState(0);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchData = async () => {
        setCeresData("...LOADING");
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockData = {
                date: selectedDate,
                cloudCover: '67.8%',
                lwFlux: '235.4 W/m²',
                netImbalance: '+0.87 W/m²'
            };
            
            setCeresData(mockData);
        } catch (error) {
            console.error('Error fetching CERES data:', error);
            setCeresData({
                date: selectedDate,
                error: 'Failed to load data'
            });
        }
    };

    return (
        <div style={{ background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflowX: 'hidden' }}>
            
            {/* CSS Keyframes for Animations */}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            {/* --- Hero Section --- */}
            <section style={{ 
                height: '100vh', 
                position: 'relative', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                {/* Star/Particle background effect */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                    {[...Array(100)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: Math.random() * 3 + 1 + 'px',
                                height: Math.random() * 3 + 1 + 'px',
                                background: 'white',
                                borderRadius: '50%',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                                animationDelay: Math.random() * 8 + 's'
                            }}
                        />
                    ))}
                </div>

                <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 80px', width: '100%', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center' }}>
                        
                        {/* Left: Hero Text, API Fetch, and Parallax Scroll */}
                        <div style={{ transform: `translateY(${scrollY * 0.2}px)`, transition: 'transform 0.1s linear' }}>
                            <div style={{ 
                                display: 'inline-block',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(5px)',
                                padding: '10px 24px',
                                borderRadius: '30px',
                                marginBottom: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                animation: 'fadeIn 0.8s ease-out'
                            }}>
                                <span style={{ color: 'white', fontSize: '16px', fontWeight: '700', letterSpacing: '0.1em' }}>NASA EOS FLAGSHIP</span>
                            </div>
                            
                            <h1 style={{ 
                                fontSize: '88px', 
                                fontWeight: '900', 
                                color: 'white', 
                                margin: '0 0 32px 0',
                                lineHeight: '1.05',
                                letterSpacing: '-0.03em',
                                textShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                animation: 'slideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both'
                            }}>
                                CERES: Earth's <br/> Energy Balance
                            </h1>
                            
                            <p style={{ 
                                fontSize: '20px', 
                                color: 'rgba(255, 255, 255, 0.85)', 
                                lineHeight: '1.7',
                                marginBottom: '40px',
                                maxWidth: '650px',
                                animation: 'slideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both'
                            }}>
                                **CERES** (Clouds and the Earth's Radiant Energy System) instruments aboard NASA satellites measure the **solar energy** absorbed by Earth and the **heat** radiated back to space. This data is the gold standard for understanding the planet's energy budget and climate change.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both' }}>
                                <button 
                                    onClick={fetchData}
                                    style={{
                                        background: '#facc15',
                                        color: '#1e3a8a',
                                        padding: '18px 40px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        fontSize: '18px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                        e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                        e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                                    }}
                                >
                                    {ceresData ? 'Refresh Data' : 'Fetch Latest CERES Flux Data'}
                                    <Zap style={{ width: '24px', height: '24px' }} />
                                </button>

                                <select 
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setCeresData(null);
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        marginTop: '16px',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    {commonDates.map(date => (
                                        <option key={date} value={date}>{date}</option>
                                    ))}
                                </select>

                                {ceresData && (
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        marginTop: '16px',
                                        color: 'white',
                                        animation: 'fadeIn 0.5s ease-out'
                                    }}>
                                        {ceresData === "...LOADING" ? (
                                            <div style={{ fontSize: '16px', fontWeight: '600' }}>
                                                Loading CERES Data...
                                            </div>
                                        ) : ceresData.error ? (
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#f87171' }}>
                                                Error: {ceresData.error}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                                    CERES Data for {ceresData.date}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '15px' }}>
                                                    <div>
                                                        <div style={{ color: '#94a3b8' }}>Cloud Coverage</div>
                                                        <div style={{ fontWeight: '600' }}>{ceresData.cloudCover}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: '#94a3b8' }}>Longwave Flux</div>
                                                        <div style={{ fontWeight: '600' }}>{ceresData.lwFlux}</div>
                                                    </div>
                                                    <div style={{ gridColumn: 'span 2' }}>
                                                        <div style={{ color: '#94a3b8' }}>Net Energy Imbalance</div>
                                                        <div style={{ 
                                                            fontWeight: '600',
                                                            color: ceresData.netImbalance.startsWith('+') ? '#22c55e' : '#ef4444'
                                                        }}>
                                                            {ceresData.netImbalance}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Animated Globe with Parallax Scroll */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            transform: `translateY(${scrollY * 0.1}px)`,
                            animation: 'fadeIn 1.2s ease-out 0.6s both'
                        }}>
                            <AnimatedGlobe />
                        </div>
                    </div>
                </div>

                <ScrollIndicator />
            </section>

            {/* --- Stats Section (Impact Metrics) --- */}
            <section style={{ padding: '120px 80px', background: '#f5f7fa' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <h2 style={{ fontSize: '60px', fontWeight: '900', color: '#111827', marginBottom: '20px', margin: 0, letterSpacing: '-0.02em' }}>
                            <span style={{ color: '#3b82f6' }}>25+ Years</span> of Global Observation
                        </h2>
                        <p style={{ fontSize: '24px', color: '#6b7280', maxWidth: '800px', margin: '20px auto 0' }}>
                            CERES instruments provide continuous, precise measurements essential for modern climate science.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        <StatsCard icon={Satellite} title="Years Operating" value="25+" unit="Launched 1999" delay={0.0} />
                        <StatsCard icon={Globe} title="Cloud / Aerosol Coverage" value="99.9%" unit="Global Data Coverage" delay={0.1} />
                        <StatsCard icon={Cloud} title="Radiant Flux Precision" value="±0.5 W/m²" unit="Measurement Accuracy" delay={0.2} />
                        <StatsCard icon={TrendingUp} title="Key Publications" value="1,200+" unit="Peer-Reviewed Studies" delay={0.3} />
                    </div>
                </div>
            </section>

            {/* --- Earth Observations Section (Image Showcase) --- */}
            <section style={{ padding: '120px 80px', background: 'white' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'left', marginBottom: '80px', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '60px', fontWeight: '900', color: '#111827', margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>
                            The Dynamics of <span style={{ color: '#facc15' }}>Radiant Energy</span>
                        </h2>
                        <p style={{ fontSize: '20px', color: '#6b7280', margin: 0 }}>
                            These visualizations (using placeholder images, actual CERES images would show heatmaps) highlight the critical components of Earth's energy balance observed by the CERES mission.
                        </p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <select
                                onChange={(e) => setSelectedDataType(e.target.value)}
                                value={selectedDataType}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="Cloud Area Fraction Processed">Cloud Area Fraction</option>
                                <option value="TOA Net Flux Processed">Top of Atmosphere Net Flux</option>
                                <option value="TOA Longwave Flux Processed">Top of Atmosphere Longwave Flux</option>
                            </select>
                        </div>
                        <ImageCard 
                            dataType={selectedDataType}
                            title={dataTypeInfo[selectedDataType].title}
                            description={dataTypeInfo[selectedDataType].description}
                            colorScale={dataTypeInfo[selectedDataType].colorScale}
                            delay={0}
                        />
                    </div>
                </div>
            </section>

            {/* --- Key Findings Section (Scrolled Component) --- */}
            <section style={{ padding: '120px 80px', background: '#f5f7fa' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '100px', alignItems: 'center' }}>
                        
                        {/* Findings List */}
                        <div style={{ animation: `fadeIn 1s ease-out both` }}>
                            <h2 style={{ fontSize: '60px', fontWeight: '900', color: '#111827', marginBottom: '30px', margin: 0, letterSpacing: '-0.02em' }}>
                                Climate Science <span style={{ color: '#1e3a8a' }}>Breakthroughs</span>
                            </h2>
                            <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: '1.8', marginBottom: '50px', margin: '30px 0 50px 0' }}>
                                CERES data has been foundational in quantifying the human impact on the climate system, providing the most accurate measure of the global energy imbalance to date.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {[
                                    { title: 'Global Radiative Imbalance', value: '+0.87 W/m²', description: 'Confirmed energy surplus driving global heating (Fake Data)' },
                                    { title: 'Shortwave Cloud Reflection', value: '52 W/m²', description: 'Average solar energy reflected back to space by clouds' },
                                    { title: 'Net Polar Warming', value: '3.1x Global Avg.', description: 'Quantified acceleration of warming at the poles (Fake Data)' }
                                ].map((item, i) => (
                                    <div 
                                        key={i}
                                        style={{ 
                                            padding: '30px', 
                                            background: 'white', 
                                            borderRadius: '20px',
                                            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                                            borderLeft: '6px solid #facc15',
                                            animation: `slideRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.15}s both`
                                        }}
                                    >
                                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e3a8a', marginBottom: '8px' }}>{item.value}</div>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.title}</div>
                                        <div style={{ fontSize: '16px', color: '#6b7280' }}>{item.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image/Visualization placeholder */}
                        <div style={{ position: 'relative' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1542661876-b6059d992f9d?w=1200&q=80"
                                alt="Abstract data visualization"
                                style={{ 
                                    width: '100%', 
                                    borderRadius: '40px',
                                    boxShadow: '0 25px 70px rgba(0,0,0,0.2)',
                                    animation: 'float 8s ease-in-out infinite' 
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- About Mission Section (Final Page) --- */}
            <section style={{ padding: '150px 80px', background: '#0f172a', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px), radial-gradient(#3b82f6 1px, #0f172a 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>
                
                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <Info style={{ width: '60px', height: '60px', color: '#facc15', marginBottom: '24px' }} />
                        <h2 style={{ fontSize: '72px', fontWeight: '900', marginBottom: '24px', margin: 0, letterSpacing: '-0.02em' }}>
                            The CERES Mission <span style={{ color: '#3b82f6' }}>Legacy</span>
                        </h2>
                        <p style={{ fontSize: '24px', opacity: 0.8, maxWidth: '900px', margin: '24px auto 0', lineHeight: '1.7' }}>
                            Part of NASA's ambitious Earth Observing System (EOS), CERES represents a vital, continuous effort to monitor the most fundamental variable of climate: the planet's net radiation budget.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                        {[
                            {
                                icon: HardHat,
                                title: 'Instrument Design',
                                text: 'CERES utilizes broadband radiometers measuring incoming shortwave and outgoing longwave radiation across three channels for comprehensive spectral coverage.'
                            },
                            {
                                icon: Satellite,
                                title: 'Platform & Orbit',
                                text: 'The instruments are flown on multiple NASA satellites (Terra, Aqua, Suomi-NPP) in sun-synchronous orbits to ensure global, consistent observation over time.'
                            },
                            {
                                icon: Globe,
                                title: 'Future of Observation',
                                text: 'The long-term dataset is crucial for future climate projections and for training next-generation Earth system models, securing its role for decades.'
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
                                <item.icon style={{ width: '48px', height: '48px', marginBottom: '20px', color: '#facc15' }} />
                                <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', margin: '0 0 16px 0' }}>{item.title}</h3>
                                <p style={{ fontSize: '18px', lineHeight: '1.7', opacity: 0.85, margin: 0 }}>{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '80px' }}>
                        <h3 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px', margin: 0 }}>
                            Explore the Data Yourself
                        </h3>
                        <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '800px', margin: '20px auto 40px', lineHeight: '1.7' }}>
                            All data collected by the CERES mission is publicly available. Start your journey into climate science with real, authoritative NASA data.
                        </p>
                        <button style={{
                            background: '#3b82f6',
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
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-3px)'; e.target.style.background = '#2563eb'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.background = '#3b82f6'; }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                Data Access Portal <ArrowRight style={{ width: '24px', height: '24px' }} />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}