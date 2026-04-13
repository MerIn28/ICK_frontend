import React, { useEffect, useState } from 'react';
import './style/ThemeSwitcher.css';

const ThemeSwitcher: React.FC = () => {
    const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'CS');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    return (
        <div className="theme-switcher">
            <button
                className={`theme-dot default ${theme === 'CS' ? 'active' : ''}`}
                onClick={() => setTheme('CS')}
                title="Cyber Green"
            />
            <button
                className={`theme-dot lava ${theme === 'Ov2' ? 'active' : ''}`}
                onClick={() => setTheme('Ov2')}
                title="Lava Inferno"
            />
            <button
                className={`theme-dot midnight ${theme === 'Val' ? 'active' : ''}`}
                onClick={() => setTheme('Val')}
                title="Midnight Blue"
            />
        </div>
    );
};

export default ThemeSwitcher;