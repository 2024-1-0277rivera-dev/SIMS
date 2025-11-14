import React, { useState, useEffect } from 'react';
import { Team } from '../types';

interface LeaderboardBarChartProps {
  teams: Team[];
}

const LeaderboardBarChart: React.FC<LeaderboardBarChartProps> = ({ teams }) => {
  const [glowColor, setGlowColor] = useState('rgba(79, 70, 229, 0.7)');

  const glowColors = [
    'rgba(79, 70, 229, 0.7)',   // Indigo
    'rgba(239, 68, 68, 0.7)',   // Red
    'rgba(34, 197, 94, 0.7)',   // Green
    'rgba(14, 165, 233, 0.7)',  // Sky
  ];

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % glowColors.length;
        setGlowColor(glowColors[currentIndex]);
    }, 10000); // Change color every 10 seconds

    return () => clearInterval(intervalId);
  }, []);


  if (!teams || teams.length === 0) {
    return <p className="text-center text-slate-500">No team data available.</p>;
  }

  const absoluteMax = Math.max(...teams.map(team => team.score), 0);
  const scaleTop = absoluteMax > 0 ? Math.ceil((absoluteMax * 1.15) / 100) * 100 : 1000;

  const getBarHeight = (score: number) => {
    if (scaleTop === 0 || !score) return '0%';
    return `${(score / scaleTop) * 100}%`;
  };

  const scaleMarkers = [100, 75, 50, 25, 0].map(percent => ({
    percent,
    value: Math.round(scaleTop * (percent / 100))
  }));

  const teamGradients = [
    { from: '#4f46e5', to: '#7c3aed', glow: 'rgba(79, 70, 229, 0.6)' },   // Indigo/Purple for Midnight Spades
    { from: '#ef4444', to: '#ec4899', glow: 'rgba(239, 68, 68, 0.6)' },   // Red/Rose for Scarlet Hearts
    { from: '#22c55e', to: '#10b981', glow: 'rgba(34, 197, 94, 0.6)' },   // Green/Emerald for Emerald Clovers
    { from: '#0ea5e9', to: '#06b6d4', glow: 'rgba(14, 165, 233, 0.6)' },  // Sky/Cyan for Glacier Diamonds
  ];

  return (
    <div className="w-full h-96 flex gap-4 text-sm font-sans p-4 rounded-2xl bg-gradient-to-b from-white to-slate-100 dark:bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] dark:from-indigo-950/50 dark:to-slate-900">
      {/* Y-Axis Scale */}
      <div className="h-[calc(100%-2.5rem)] flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500 text-right pr-2">
        {scaleMarkers.map(marker => <span key={marker.percent}>{marker.value}</span>)}
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative">
        {/* Grid Lines */}
        <div className="absolute top-0 left-0 right-0 h-[calc(100%-2.5rem)] z-0 text-slate-200/60 dark:text-white/20">
           {scaleMarkers.map(marker => {
            const isBaseline = marker.percent === 0;
            return (
                <div
                  key={marker.percent}
                  className={`absolute w-full border-t ${ isBaseline ? 'border-b-2' : 'border-dashed' } transition-all duration-1000`}
                  style={{
                    bottom: `${marker.percent}%`,
                    borderColor: isBaseline ? glowColor : 'currentColor',
                    boxShadow: isBaseline ? `0 0 15px 1px ${glowColor}` : 'none',
                  }}
                />
            )
          })}
        </div>
      
        {/* Teams Container */}
        <div className="h-full grid grid-cols-4 gap-x-4 md:gap-x-6 z-10">
          {teams.slice(0, 4).map((team, index) => {
            const colors = teamGradients[index % teamGradients.length];
            const mainScore = team.score || 0;
            const prevScore = team.scoreHistory?.[1] || 0;
            const olderScore = team.scoreHistory?.[0] || 0;
            
            const mainHeight = getBarHeight(mainScore);
            const prevHeight = getBarHeight(prevScore);
            const olderHeight = getBarHeight(olderScore);

            return (
              <div key={team.id} className="relative flex flex-col items-center justify-end h-full">
                {/* Bar container */}
                <div className="relative w-full h-[calc(100%-2.5rem)]">
                  
                  {/* Floating Score Label */}
                   <div 
                    className="absolute z-20 w-full flex justify-center transition-all duration-1000 ease-out"
                    style={{ bottom: `calc(${mainHeight} + 4px)` }}
                   >
                     <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 py-0.5 shadow-lg text-center">
                       <div className="text-slate-800 dark:text-slate-100 text-xs font-bold">{mainScore}</div>
                     </div>
                   </div>

                    {/* Right Bar (Older Score) */}
                    <div
                      className="absolute bottom-0 right-[15%] w-1/4 rounded-t-md"
                      style={{
                        height: olderHeight,
                        background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                        opacity: 0.4,
                        transition: 'height 1s ease-out 0.2s',
                      }}
                    />

                    {/* Left Bar (Previous Score) */}
                    <div
                      className="absolute bottom-0 left-[15%] w-1/4 rounded-t-md"
                      style={{
                        height: prevHeight,
                        background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                        opacity: 0.6,
                        transition: 'height 1s ease-out 0.1s',
                      }}
                    />

                    {/* Main Bar (Current Score) */}
                    <div
                      className="absolute bottom-0 w-1/3 left-1/2 -translate-x-1/2 rounded-t-lg"
                      style={{
                        height: mainHeight,
                        background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                        boxShadow: `0 0 20px -5px ${colors.glow}`,
                        transition: 'height 1s ease-out',
                      }}
                    />
                </div>
                {/* Team Name */}
                <span className="mt-3 text-center font-semibold text-slate-600 dark:text-slate-300 truncate w-full text-xs sm:text-sm">{team.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardBarChart;
