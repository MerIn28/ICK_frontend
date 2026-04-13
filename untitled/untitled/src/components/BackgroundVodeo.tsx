import React, { useEffect, useState } from 'react';
import './style/BackgroundVideo.css';

const BackgroundVideo: React.FC = () => {

    const [currentTheme, setCurrentTheme] = useState(
        document.documentElement.getAttribute('data-theme') || localStorage.getItem('app-theme') || 'CS'
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const theme = document.documentElement.getAttribute('data-theme') || 'CS';
            setCurrentTheme(theme);
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="video-background-container">
            <video
                key={currentTheme}
                autoPlay
                muted
                loop
                playsInline
                className="bg-video"
            >

                <source src={`/game/${currentTheme}.mp4`} type="video/mp4" />
            </video>
            <div className="video-overlay"></div>
        </div>
    );
};

export default BackgroundVideo;