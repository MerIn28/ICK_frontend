import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './TournamentView8.css';
import ThemeSwitcher from "../components/ThemeSwitcher.tsx";
import BackgroundVideo from '../components/BackgroundVodeo.tsx';

const TournamentView: React.FC = () => {
    const { tournamentName, tournamentId } = useParams<{ tournamentName: string, tournamentId: string }>();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [seconds, setSeconds] = useState<number>(0);

    const [localScore1, setLocalScore1] = useState<number>(0);
    const [localScore2, setLocalScore2] = useState<number>(0);

    const fetchMatches = async () => {
        try {
            const res = await api.get(`/matches/tournament/${tournamentId}`);

            const sortedMatches = res.data.sort((a: any, b: any) => {
                if (a.roundNumber !== b.roundNumber) {
                    return a.roundNumber - b.roundNumber;
                }
                return a.id - b.id;
            });

            setMatches(sortedMatches);
        } catch (err) {
            console.error("Błąd odświeżania meczów:", err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tourneyRes, teamsRes] = await Promise.all([
                    api.get(`/tournaments/${tournamentId}`),
                    api.get(`/tournaments/${tournamentId}/teams`)
                ]);
                setTournament(tourneyRes.data);
                setTeams(teamsRes.data);
                await fetchMatches();
            } catch (err: any) {
                setError(err.message);
            }
        };
        if (tournamentId) loadData();
    }, [tournamentId]);

    useEffect(() => {
        let interval: any;
        if (isModalOpen) {
            setSeconds(0);
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isModalOpen]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLocalScoreUpdate = (teamNumber: number, action: string) => {
        if (teamNumber === 1) {
            setLocalScore1(prev => action === 'plus' ? prev + 1 : Math.max(0, prev - 1));
        } else {
            setLocalScore2(prev => action === 'plus' ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    const handleFinishMatch = async (matchId: number) => {
        // ZABEZPIECZENIE PRZED REMISEM
        if (localScore1 === localScore2) {
            window.alert("W turnieju nie może być remisów! Wyłoń zwycięzcę przed zatwierdzeniem.");
            return;
        }

        const confirmMsg = `Zakończyć mecz z wynikiem ${localScore1}:${localScore2}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.post(`/matches/${matchId}/score`, null, {
                params: {
                    score1: localScore1,
                    score2: localScore2,
                    status: 'DONE'
                }
            });

            if (tournament?.status === 'PLANNED' || tournament?.status === 'PREPARED') {
                await api.patch(`/tournaments/${tournamentId}/status`,
                    JSON.stringify("ACTIVE"),
                    { headers: { 'Content-Type': 'application/json' } }
                );
                setTournament((prev: any) => ({ ...prev, status: 'ACTIVE' }));
            }

            await fetchMatches();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Błąd zapisywania wyniku:", err);
            alert("Wystąpił błąd. Sprawdź, czy endpoint /score obsługuje status DONE.");
        }
    };

    const handleMatchClick = (matchId: number) => {
        const clickedMatch = matches.find(m => m.id === matchId);
        if (clickedMatch && clickedMatch.team1 && clickedMatch.team2) {
            setSelectedMatch(clickedMatch);
            setLocalScore1(clickedMatch.score1 || 0);
            setLocalScore2(clickedMatch.score2 || 0);
            setIsModalOpen(true);
        } else {
            alert("Ten mecz nie jest jeszcze gotowy!");
        }
    };

    const groupMatchesByRound = (matchesArray: any[]) => {
        return matchesArray.reduce((acc, match) => {
            const round = match.roundNumber || 1;
            if (!acc[round]) acc[round] = [];
            acc[round].push(match);
            return acc;
        }, {} as Record<number, any[]>);
    };

    const getRoundName = (roundIndex: number, totalRounds: number) => {
        if (roundIndex === totalRounds) return "Finał";
        if (roundIndex === totalRounds - 1) return "Półfinał";
        return `Runda ${roundIndex}`;
    };

    if (error) return <div className="error-screen">Błąd: {error}</div>;
    if (!tournament) return <div className="loading-screen">Ładowanie...</div>;

    const matchesByRound = groupMatchesByRound(matches);
    const roundNumbers = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
    const totalRounds = roundNumbers.length;

    return (
        <>
            <ThemeSwitcher />
            <BackgroundVideo />
            <div className="view-container">

                <div className="view-header-top">
                    <div className="back-div">
                        <button className="btn-neon back-btn" onClick={() => navigate('/list')}>
                            &larr; Powrót
                        </button>
                    </div>
                    <div className="title-section">
                        <h1 className="neon-title-main">{tournamentName}</h1>
                        <div className="status-container">
                            <span className="info-badge">{tournament.type}</span>
                            <span className={`status-pill ${tournament.status.toLowerCase()}`}>
                                {tournament.status}
                            </span>
                        </div>
                    </div>
                    <div className="header-spacer"></div> 
                </div>

                <div className="bracket-container">
                    {roundNumbers.map((roundNum) => (
                        <div key={roundNum} className="round-column">
                            <h3 className="round-title">{getRoundName(roundNum, totalRounds)}</h3>
                            {matchesByRound[roundNum].map((match) => {
                                const isDisabled = !match.team1 || !match.team2;
                                return (
                                    <div
                                        key={match.id}
                                        className={`match-box glass-panel ${isDisabled ? 'disabled' : ''}`}
                                        onClick={() => handleMatchClick(match.id)}
                                    >
                                        <div className={`team-row ${match.winnerId === match.team1?.id ? 'winner' : ''}`}>
                                            <span className="team-name">{match.team1?.name || "TBD"}</span>
                                            <span className="team-score">{match.score1 || 0}</span>
                                        </div>
                                        <div className={`team-row ${match.winnerId === match.team2?.id ? 'winner' : ''}`}>
                                            <span className="team-name">{match.team2?.name || "TBD"}</span>
                                            <span className="team-score">{match.score2 || 0}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedMatch && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel shadow-neon">
                        <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
                        <div className="match-timer">{formatTime(seconds)}</div>
                        <h2 className="neon-text">MATCH NO. {selectedMatch.id}</h2>

                        <div className="match-controls">
                            <div className="team-control-box">
                                <h3>{selectedMatch.team1?.name || "TBD"}</h3>
                                <div className="score-wrapper">
                                    <button className="btn-score" onClick={() => handleLocalScoreUpdate(1, 'minus')}>-</button>
                                    <span className="big-score">{localScore1}</span>
                                    <button className="btn-score" onClick={() => handleLocalScoreUpdate(1, 'plus')}>+</button>
                                </div>
                            </div>
                            <div className="vs-divider">VS</div>
                            <div className="team-control-box">
                                <h3>{selectedMatch.team2?.name || "TBD"}</h3>
                                <div className="score-wrapper">
                                    <button className="btn-score" onClick={() => handleLocalScoreUpdate(2, 'minus')}>-</button>
                                    <span className="big-score">{localScore2}</span>
                                    <button className="btn-score" onClick={() => handleLocalScoreUpdate(2, 'plus')}>+</button>
                                </div>
                            </div>
                        </div>

                        <button className="finish-btn neon-border-btn" onClick={() => handleFinishMatch(selectedMatch.id)}>
                            FINISH MATCH
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default TournamentView;