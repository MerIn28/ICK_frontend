import React, { useState, useEffect } from 'react'; // Dodajemy useEffect
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './NewTournament.css';

const NewTournament: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tournamentData, setTournamentData] = useState({
        name: '',
        type: 'Drabinka jednostronna',
    });

    const [teamName, setTeamName] = useState('');
    const [teams, setTeams] = useState<string[]>([]);

    const getLimit = () => tournamentData.type === 'Drabinka jednostronna' ? 8 : 16;

    useEffect(() => {
        const limit = getLimit();
        if (teams.length > limit) {
            setTeams(teams.slice(0, limit));
            alert(`Zmieniono typ na ${tournamentData.type}. Nadmiarowe drużyny zostały usunięte (limit: ${limit}).`);
        }
    }, [tournamentData.type]); // Uruchomi się zawsze, gdy zmieni się 'type'

    const addTeam = () => {
        const limit = getLimit();
        if (teams.length >= limit) {
            alert(`Osiągnięto limit ${limit} drużyn dla tego typu turnieju!`);
            return;
        }

        if (teamName.trim()) {
            setTeams([...teams, teamName.trim()]);
            setTeamName('');
        }
    };

    const handleCreate = async () => {
        const limit = getLimit();

        if (!tournamentData.name) {
            alert("Podaj nazwę turnieju!");
            return;
        }
        if (teams.length !== limit) {
            alert(`Aby wygenerować tę drabinkę, potrzebujesz dokładnie ${limit} drużyn (obecnie: ${teams.length}).`);
            return;
        }

        setLoading(true);
        try {
            const tournamentRes = await api.post('/tournaments/add', {
                name: tournamentData.name,
                type: tournamentData.type,
                status: 'PLANNED'
            });

            const tournamentId = tournamentRes.data.id;

            await Promise.all(
                teams.map(name =>
                    api.post(`/tournaments/${tournamentId}/teams`, { name })
                )
            );

            await api.post(`/tournaments/${tournamentId}/generate-bracket`);

            alert("Turniej stworzony i drabinka wygenerowana!");
            navigate('/list');

        } catch (error) {
            console.error("Błąd podczas tworzenia turnieju:", error);
            alert("Coś poszło nie tak. Upewnij się, że backend działa poprawnie.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-container">
            <div className="back-div">
                <button className="btn-neon add-btn back-btn" onClick={() => navigate(-1)}>
                    &larr; Powrót
                </button>
            </div>
            <h1 className="neon-title-main">Nowy Turniej</h1>

            <div className="setup-grid">
                <section className="glass-panel">
                    <h2 className="section-title">Ustawienia</h2>
                    <div className="input-group">
                        <label>Nazwa Turnieju</label>
                        <input
                            type="text"
                            value={tournamentData.name}
                            onChange={(e) => setTournamentData({...tournamentData, name: e.target.value})}
                            placeholder="Wpisz nazwę..."
                        />
                    </div>
                    <div className="input-group">
                        <label>Typ Drabinki (Limit: {getLimit()})</label>
                        <select
                            value={tournamentData.type}
                            onChange={(e) => setTournamentData({...tournamentData, type: e.target.value})}
                        >
                            <option value="Drabinka jednostronna">Jednostronna (8 osób)</option>
                            <option value="Drabinka dwustronna">Dwustronna (16 osób)</option>
                        </select>
                    </div>
                </section>

                <section className="glass-panel">
                    <h2 className="section-title">Drużyny ({teams.length} / {getLimit()})</h2>
                    <div className="add-team-row">
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                            placeholder={teams.length >= getLimit() ? "Limit osiągnięty" : "Nazwa drużyny..."}
                            disabled={teams.length >= getLimit()}
                        />
                        <button
                            className="btn-add"
                            onClick={addTeam}
                            disabled={teams.length >= getLimit()}
                        >
                            +
                        </button>
                    </div>
                    <div className="teams-list">
                        {teams.map((t, i) => (
                            <div key={i} className="team-chip">
                                <span>{t}</span>
                                <button onClick={() => setTeams(teams.filter((_, idx) => idx !== i))}>×</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <button
                className={`neon-button btn-magenta submit-btn ${loading ? 'loading' : ''}`}
                onClick={handleCreate}
                disabled={loading}
            >
                {loading ? 'Generowanie...' : `Zatwierdź i Generuj (${teams.length}/${getLimit()})`}
            </button>
        </div>
    );
};

export default NewTournament;