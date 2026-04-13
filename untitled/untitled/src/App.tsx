import {BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css';


//Importowanie komponentów
import Footer from './components/Footer';
import Header from './components/Header';

//Importowanie widoków
import Home from "./views/Home";
import NewTournament from "./views/NewTournament";
import TournamentView from "./views/TournamentView";
import TournamentList from "./views/TournamentList";




function App() {



    return (
        <BrowserRouter>
            <Routes>
                {/* 1. STRONA GŁÓWNA */}
                <Route
                    path="/"
                    element={
                        <>
                            <Header />
                            <Home />
                            <Footer />
                        </>
                    }
                />

                {/* 2. STRONY TURNIEJOWE - Ujednolicone ścieżki */}
                <Route path="/create" element={<NewTournament />} />
                <Route path="/tournaments/:tournamentName/:tournamentId" element={<TournamentView />} />
                <Route path ="/list" element={<TournamentList />} />
            </Routes>
        </BrowserRouter>
    );
}



export default App;