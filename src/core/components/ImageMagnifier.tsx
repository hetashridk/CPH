import React, { useState, useRef } from 'react';

export const ImageMagnifier: React.FC<{
    src: string;
    alt: string;
    zoomLevel?: number;
}> = ({ src, alt, zoomLevel = 2.5 }) => {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [renderedDims, setRenderedDims] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const LENS_SIZE = 180;

    const handleContainerInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current || !containerRef.current) return;
        
        const container = containerRef.current;
        const img = imgRef.current;

        const { naturalWidth, naturalHeight } = img;
        if (naturalWidth === 0) return; // Image not loaded yet

        const { clientWidth: containerWidth, clientHeight: containerHeight } = container;
        
        const imageAspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;
        
        let renderedWidth, renderedHeight, offsetX, offsetY;

        if (imageAspectRatio > containerAspectRatio) {
            renderedWidth = containerWidth;
            renderedHeight = containerWidth / imageAspectRatio;
            offsetX = 0;
            offsetY = (containerHeight - renderedHeight) / 2;
        } else {
            renderedHeight = containerHeight;
            renderedWidth = containerHeight * imageAspectRatio;
            offsetX = (containerWidth - renderedWidth) / 2;
            offsetY = 0;
        }
        
        setRenderedDims({ width: renderedWidth, height: renderedHeight, offsetX, offsetY });
        if (!showMagnifier) setShowMagnifier(true);

        const containerRect = container.getBoundingClientRect();
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;
        setCursorPos({ x, y });
    };
    
    const handleMouseLeave = () => {
        setShowMagnifier(false);
    };
    
    // Calculations for magnifier position and background
    const imageX = cursorPos.x - renderedDims.offsetX;
    const imageY = cursorPos.y - renderedDims.offsetY;

    // Check if cursor is over the actual rendered image, not the letterboxed area
    const isOverImage = imageX >= 0 && imageX <= renderedDims.width && imageY >= 0 && imageY <= renderedDims.height;
    
    return (
        <div 
            ref={containerRef}
            className="magnifier-container stage-image-container"
            onMouseEnter={handleContainerInteraction}
            onMouseMove={handleContainerInteraction}
            onMouseLeave={handleMouseLeave}
        >
            <img 
                ref={imgRef}
                src={src} 
                alt={alt} 
                style={{ objectFit: 'contain' }} // This is key
            />
            <div
                style={{
                    display: showMagnifier && isOverImage ? 'block' : 'none',
                    position: 'absolute',
                    // Lens position is relative to the container
                    left: `${cursorPos.x - LENS_SIZE / 2}px`,
                    top: `${cursorPos.y - LENS_SIZE / 2}px`,
                    height: `${LENS_SIZE}px`,
                    width: `${LENS_SIZE}px`,
                    border: '3px solid var(--bg-surface)',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-lg)',
                    backgroundImage: `url('${src}')`,
                    // Background size is based on the rendered image, not the natural size
                    backgroundSize: `${renderedDims.width * zoomLevel}px ${renderedDims.height * zoomLevel}px`,
                    // Background position is based on cursor position relative to the rendered image
                    backgroundPositionX: `${-(imageX * zoomLevel - LENS_SIZE / 2)}px`,
                    backgroundPositionY: `${-(imageY * zoomLevel - LENS_SIZE / 2)}px`,
                    pointerEvents: 'none',
                    backgroundRepeat: 'no-repeat',
                }}
            />
        </div>
    );
};
