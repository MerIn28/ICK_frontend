import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './TournamentList.css';
import ThemeSwitcher from "../components/ThemeSwitcher.tsx";

interface Tournament {
    id: number;
    name: string;
    type: string;
    status: string;
}

const TournamentList: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
 
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    const navigate = useNavigate();

    const fetchTournaments = async () => {
        try {
            const response = await api.get('/tournaments/all');
            setTournaments(response.data);
        } catch (error) {
            console.error("Błąd podczas pobierania turniejów:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    useEffect(() => {
        if (tournaments.length > 0) {
            console.log("Dane turniejów z bazy:", tournaments);
            console.log("Status pierwszego turnieju:", tournaments[0].status);
        }
    }, [tournaments]);

    const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(`Czy na pewno chcesz usunąć turniej "${name}"?`);
        if (confirmDelete) {
            try {
                await api.delete(`/tournaments/${id}`);
                setTournaments(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                console.error("Błąd usuwania:", error);
            }
        }
    };

    const getStatusClass = (status: any) => {
        const s = typeof status === 'object' ? status.value : status;
        switch (s) {
            case 'PLANNED': return 'status-planned';
            case 'ACTIVE': return 'status-active';
            case 'ARCHIVED': return 'status-finished';
            default: return '';
        }
    };

    const filteredTournaments = tournaments
    .sort((a, b) => b.id - a.id)
    .filter(t => {
        const matchesSearch = (t.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const currentStatus = typeof t.status === 'object' ? (t.status as any).value : t.status;
        const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading-screen">Ładowanie turniejów...</div>;

    return (
        <>
            <ThemeSwitcher />

            <div className="list-container">
                <div className="back-div">
                    <button className="btn-neon add-btn back-btn" onClick={() => navigate('/')}>
                        &larr; Powrót
                    </button>
                </div>
                
                <div className="list-header">
                    <h1 className="neon-title-main">Lista Turniejów</h1>
                    <button className="btn-neon add-btn" onClick={() => navigate('/create')}>
                        + Nowy Turniej
                    </button>
                </div>

                <div className="filter-panel glass-panel">
                    <input 
                        type="text" 
                        placeholder="Szukaj turnieju..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                        className="status-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Wszystkie statusy</option>
                        <option value="Zaplanowany">Zaplanowane</option>
                        <option value="Trwa">W trakcie</option>
                        <option value="Zakończony">Zakończone</option>
                    </select>
                </div>

                <div className="tournament-grid">
                    {filteredTournaments.length > 0 ? (
                        filteredTournaments.map((t) => (
                            <div
                                key={t.id}
                                className="tournament-card glass-panel"
                                onClick={() => navigate(`/tournaments/${t.name}/${t.id}`)}
                            >
                                <button
                                    className="delete-card-btn"
                                    onClick={(e) => handleDelete(e, t.id, t.name)}
                                    title="Usuń turniej"
                                >
                                    ×
                                </button>

                                <div className="card-top">
                                    <span className={`status-badge ${getStatusClass(t.status)}`}>
                                        {typeof t.status === 'object' ? (t.status as any).label : t.status}
                                    </span>
                                    <span className="tournament-type">{t.type}</span>
                                </div>
                                <h3 className="tournament-name">{t.name}</h3>
                                <div className="card-footer">
                                    <span className="view-link">Przejdź do widoku turnieju →</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">Nie znaleziono turniejów spełniających kryteria.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default TournamentList;