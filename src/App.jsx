import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";

import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import PageNotFound from "@/lib/PageNotFound";

import GameLayout from "@/components/GameLayout";
import Dashboard from "@/pages/Dashboard";
import Garage from "@/pages/Garage";
import Game from "@/pages/Game";
import Ranking from "@/pages/Ranking";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route element={<GameLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/garagem" element={<Garage />} />
            <Route path="/ranking" element={<Ranking />} />
          </Route>

          <Route path="/jogo" element={<Game />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>

      <Toaster />
    </QueryClientProvider>
  );
}

export default App;