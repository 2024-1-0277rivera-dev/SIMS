
import React, { useState, useEffect } from 'react';
import Card from '../components/Card.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { Team } from '../types.ts';
import { getLeaderboard } from '../services/api.ts';
import LeaderboardBarChart from '../components/LeaderboardBarChart.tsx';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [selectedEvent, setSelectedEvent] = useState('i3 Day | Clash of Cards');
    const [leaderboardData, setLeaderboardData] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const events = ['i3 Day | Clash of Cards', 'Campus Clash', 'Intramurals'];
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
          try {
            const data = await getLeaderboard();
            setLeaderboardData(data);
          } catch (error) {
            console.error("Failed to load leaderboard data", error);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }, []);

  return (
    <div className="space-y-6">
       <div className="text-center mb-6 animate-fade-in-down">
          <div className="relative inline-block w-full max-w-sm">
             <select 
                value={selectedEvent} 
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 py-2 px-4 pr-8 rounded-2xl leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-center font-semibold transition"
             >
                {events.map(event => <option key={event} value={event}>{event}</option>)}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-200">
                <i className="bi bi-chevron-down"></i>
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mt-4">{selectedEvent}</h1>
       </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaderboardData.slice(0, 4).map((team) => (
            <Card key={team.id} className="p-5 transform transition-transform hover:-translate-y-1">
                <small className="text-slate-500 dark:text-slate-400">{team.name}</small>
                <div className="flex items-baseline justify-between">
                    <h4 className="font-bold text-2xl text-slate-800 dark:text-slate-100 mb-0 mt-1">{team.score} Points</h4>
                    <span className="font-semibold text-sm text-green-500">+5%</span>
                </div>
                <small className="text-slate-500 dark:text-slate-400">{team.wins} games won</small>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
             <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Leaderboard Ranking</h2>
             </div>
             <div className="px-6 pb-6">
                {loading ? (
                    <div className="h-80 flex items-center justify-center">Loading rankings...</div>
                ) : (
                    <LeaderboardBarChart teams={leaderboardData} />
                )}
             </div>
        </Card>
        <div className="lg:col-span-2 space-y-4">
             <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Top Teams</h2>
             {loading ? (
                 <p>Loading teams...</p>
             ) : (
                 <div className="space-y-3">
                     {leaderboardData.slice(0, 5).map(team => (
                        <Card key={team.id} className="p-4 cursor-pointer group hover:shadow-md transition-shadow" onClick={() => navigate(`/leaderboard?teamId=${team.id}`)}>
                          <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{team.name}</h3>
                              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">#{team.rank}</span>
                          </div>
                          <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-700">
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                  <i className="bi bi-people-fill mr-1"></i>{team.playersCount} Members
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-100">{team.score} pts</span>
                          </div>
                        </Card>
                     ))}
                 </div>
             )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
