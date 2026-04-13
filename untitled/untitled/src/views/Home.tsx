import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

//Importy komponentów
import ThemeSwitcher from "../components/ThemeSwitcher.tsx";

//Importy video
import video1 from "../assets/video/video1.mp4"
import video2 from "../assets/video/video2.mp4"
import video3 from "../assets/video/video3.mp4"
import video4 from "../assets/video/video4.mp4"

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <ThemeSwitcher />
            <div className="video-grid">
                <video src={video1} autoPlay loop muted className="video-item" />
                <video src={video2} autoPlay loop muted className="video-item" />
                <video src={video3} autoPlay loop muted className="video-item" />
                <video src={video4} autoPlay loop muted className="video-item" />
            </div>

            <div className="overlay" />

            <div className="content-box">
                <div className="title-wrapper">
                    <h1 className="neon-title-main">KNTG PBŚ</h1>
                    <p className="neon-subtitle">Obsługa turniejów e-sportowych</p>
                </div>
                <div className="button-group">
                    <button
                        className="neon-button btn-cyan"
                        onClick={() => navigate('/list')}
                    >
                        Lista Turniejów
                    </button>
                    <button
                        className="neon-button btn-magenta"
                        onClick={() => navigate('/create')}
                    >
                        Stwórz Nowy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;