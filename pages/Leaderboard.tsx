
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/Card.tsx';
import { getLeaderboard, submitReport, getEvents, updateEventResults } from '../services/api.ts';
import { LeaderboardSync } from '../services/leaderboardService.ts';
import { Team, Event, EventResult, UserRole, ScoreAdjustment } from '../types.ts';
import { useToast } from '../hooks/useToast.ts';
import TeamDetailsModal from '../components/TeamDetailsModal.tsx';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../hooks/useAuth.ts';

type ViewMode = 'standings' | 'teams' | 'records';

const Leaderboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('standings');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'report' | 'suggestion'>('report');
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Editing Scores State
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editingResults, setEditingResults] = useState<EventResult[]>([]);
  // UI state for expanding detailed views in editing/displaying
  const [expandedTeamIdInEdit, setExpandedTeamIdInEdit] = useState<string | null>(null);
  const [expandedTeamIdInView, setExpandedTeamIdInView] = useState<string | null>(null);
  const [newAdjustment, setNewAdjustment] = useState<ScoreAdjustment>({ name: '', description: '', points: 0, timestamp: '', venue: '' });


  const canEditScores = user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER;

  // Report Form State
  const [reportForm, setReportForm] = useState({
    problemType: '',
    description: '',
    offenderName: '',
    offenderTeam: '',
    evidence: '', // Placeholder for file/link
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [data, fetchedEvents] = await Promise.all([getLeaderboard(), getEvents()]);
        setTeams(data);
        setEvents(fetchedEvents);
        // Check for teamId in URL
        const teamIdFromUrl = searchParams.get('teamId');
        if (teamIdFromUrl) {
            const team = data.find(t => t.id === teamIdFromUrl);
            if (team) {
                setSelectedTeam(team);
            }
        }
      } catch (error) {
        addToast('Failed to load leaderboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    
    const sync = new LeaderboardSync();
    
    sync.subscribe((newTeams, source) => {
        setTeams(newTeams);
        // Also refresh events to get updated results/statuses
        getEvents().then(setEvents);
        setIsLive(true);
        addToast(`Leaderboard updated via ${source}`, 'info');
        setTimeout(() => setIsLive(false), 2000);
    });
    
    return () => {
        sync.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleCloseModal = () => {
      setSelectedTeam(null);
  };
  
  const handleOpenReport = (type: 'report' | 'suggestion') => {
      setReportType(type);
      setReportForm({ problemType: '', description: '', offenderName: '', offenderTeam: '', evidence: '' });
      setReportModalOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await submitReport({ ...reportForm, type: reportType });
          addToast(`${reportType === 'report' ? 'Report' : 'Suggestion'} submitted successfully!`, 'success');
          setReportModalOpen(false);
      } catch (error) {
          addToast('Failed to submit. Try again.', 'error');
      }
  };
  
  const handleEditScores = (event: Event) => {
      setEditEvent(event);
      setExpandedTeamIdInEdit(null);
      // initialize results with existing teams
      const initialResults: EventResult[] = teams.map(team => {
          const existing = event.results?.find(r => r.teamId === team.id);
          if (existing) return { ...existing, criteriaScores: { ...existing.criteriaScores }, merits: [...(existing.merits || [])], demerits: [...(existing.demerits || [])] }; // Deep copy
          // Init with 0 scores
          const criteriaScores: Record<string, number> = {};
          event.criteria.forEach(c => criteriaScores[c.name] = 0);
          return {
              teamId: team.id,
              criteriaScores,
              meritAdjustment: 0,
              demeritAdjustment: 0,
              merits: [],
              demerits: []
          };
      });
      setEditingResults(initialResults);
  };

  const handleScoreChange = (teamIdx: number, type: 'criteria', key: string, value: string) => {
      const numVal = parseFloat(value) || 0;
      const updated = [...editingResults];
      updated[teamIdx].criteriaScores[key] = numVal;
      setEditingResults(updated);
  }
  
  const handleAddAdjustment = (teamIdx: number, type: 'merit' | 'demerit') => {
      const { name, points, description } = newAdjustment;
      if (!name || points <= 0) {
          addToast('Please provide name and positive points.', 'error');
          return;
      }
      const updated = [...editingResults];
      const entry: ScoreAdjustment = {
          name,
          description,
          points,
          timestamp: new Date().toISOString(),
          venue: editEvent?.venue || 'Main Venue'
      };
      if (type === 'merit') {
          updated[teamIdx].merits = [...(updated[teamIdx].merits || []), entry];
      } else {
          updated[teamIdx].demerits = [...(updated[teamIdx].demerits || []), entry];
      }
      setEditingResults(updated);
      setNewAdjustment({ name: '', description: '', points: 0, timestamp: '', venue: '' });
  }

  const removeAdjustment = (teamIdx: number, type: 'merit' | 'demerit', adjIdx: number) => {
      const updated = [...editingResults];
      if (type === 'merit' && updated[teamIdx].merits) {
          updated[teamIdx].merits = updated[teamIdx].merits!.filter((_, i) => i !== adjIdx);
      } else if (type === 'demerit' && updated[teamIdx].demerits) {
          updated[teamIdx].demerits = updated[teamIdx].demerits!.filter((_, i) => i !== adjIdx);
      }
      setEditingResults(updated);
  }

  const handleSaveScores = async () => {
      if (editEvent) {
          try {
              await updateEventResults(editEvent.id, editingResults);
              addToast('Scores updated and leaderboard synchronized!', 'success');
              setEditEvent(null);
              // Refresh data
              const [updatedTeams, updatedEvents] = await Promise.all([getLeaderboard(), getEvents()]);
              setTeams(updatedTeams);
              setEvents(updatedEvents);
          } catch (error) {
              addToast('Failed to save scores.', 'error');
          }
      }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const placementLegend = [
      { label: '1st Place', bg: 'bg-yellow-500', text: 'text-white' },
      { label: '2nd Place', bg: 'bg-slate-300', text: 'text-slate-800' },
      { label: '3rd Place', bg: 'bg-amber-700', text: 'text-white' },
      { label: '4th Place', bg: 'bg-slate-200', text: 'text-slate-600' },
      { label: 'Merit', bg: 'bg-blue-500', text: 'text-white' },
      { label: 'Demerit', bg: 'bg-red-500', text: 'text-white' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Leaderboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time standings and competition records</p>
        </div>
        <div className="flex items-center gap-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all ${isLive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <span>{isLive ? 'Live Update' : 'Real-time'}</span>
            </div>
            <Button variant="danger" className="text-sm py-1 px-3" onClick={() => handleOpenReport('report')}>Report Problem</Button>
            <Button variant="secondary" className="text-sm py-1 px-3" onClick={() => handleOpenReport('suggestion')}>Suggestion</Button>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-1 overflow-x-auto">
          <button 
            onClick={() => setViewMode('standings')} 
            className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors whitespace-nowrap ${viewMode === 'standings' ? 'bg-white dark:bg-slate-800 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
              Team Standings
          </button>
          <button 
            onClick={() => setViewMode('teams')} 
            className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors whitespace-nowrap ${viewMode === 'teams' ? 'bg-white dark:bg-slate-800 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
              Team Overview
          </button>
          <button 
            onClick={() => setViewMode('records')} 
            className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors whitespace-nowrap ${viewMode === 'records' ? 'bg-white dark:bg-slate-800 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
              Competition Records
          </button>
      </div>

      {viewMode === 'standings' && (
        <>
            <div className="flex flex-wrap gap-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-soft dark:shadow-soft-dark text-xs sm:text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Legend:</span>
                {placementLegend.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                        <span className={`inline-block w-4 h-4 rounded-full ${item.bg}`}></span>
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                ))}
            </div>
            <Card className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Team</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Placements & Points</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Members</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors" onClick={() => handleTeamSelect(team)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">#{team.rank}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{team.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">{team.score}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-full bg-yellow-500 text-white flex items-center gap-1" title="1st Places">
                                    <i className="bi bi-trophy-fill"></i> {team.placementStats?.first || 0}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-300 text-slate-800 flex items-center gap-1" title="2nd Places">
                                    <i className="bi bi-award-fill"></i> {team.placementStats?.second || 0}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-700 text-white flex items-center gap-1" title="3rd Places">
                                    <i className="bi bi-award-fill"></i> {team.placementStats?.third || 0}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1" title="4th Places">
                                    4th: {team.placementStats?.fourth || 0}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white flex items-center gap-1" title="Merits">
                                    M: {team.placementStats?.merits || 0}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white flex items-center gap-1" title="Demerits">
                                    D: {team.placementStats?.demerits || 0}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{team.playersCount}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </Card>
        </>
      )}

      {viewMode === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teams.map(team => (
                  <Card key={team.id} className="cursor-pointer group" onClick={() => handleTeamSelect(team)}>
                      {/* Card content wrapper with click handler added to Card component */}
                      <div className="p-5" onClick={() => handleTeamSelect(team)}>
                          <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{team.name}</h3>
                              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">#{team.rank}</span>
                          </div>
                          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                              <p><i className="bi bi-person-circle mr-2"></i>Leader: {team.unitLeader || 'TBA'}</p>
                              <p><i className="bi bi-person-badge mr-2"></i>Adviser: {team.adviser || 'TBA'}</p>
                              <p><i className="bi bi-people mr-2"></i>Members: {team.playersCount}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                              <span className="font-bold text-slate-800 dark:text-slate-100">{team.score} pts</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">View Details <i className="bi bi-arrow-right ml-1"></i></span>
                          </div>
                      </div>
                  </Card>
              ))}
          </div>
      )}

      {viewMode === 'records' && (
          <div className="space-y-6">
              {events.length === 0 ? (
                  <p className="text-slate-500">No events found.</p>
              ) : (
                  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => {
                      const isCompleted = !!event.results && event.results.length > 0;
                      return (
                        <Card key={event.id} className="p-5">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        {event.name}
                                        {isCompleted && <i className="bi bi-check-circle-fill text-green-500 text-sm"></i>}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(event.date).toLocaleDateString()} • Max Points: {event.competitionPoints}
                                    </p>
                                </div>
                                {canEditScores && (
                                    <Button variant="secondary" className="text-sm py-1.5 px-3" onClick={() => handleEditScores(event)}>
                                        {isCompleted ? 'Update Scores' : 'Input Scores'}
                                    </Button>
                                )}
                            </div>
                            
                            {/* Expanded table view with collapsible detail rows */}
                            {isCompleted ? (
                                <div className="mt-4 space-y-3">
                                    {teams
                                      .sort((a, b) => {
                                          const scoreA = a.eventScores?.find(es => es.eventId === event.id)?.placement || 999;
                                          const scoreB = b.eventScores?.find(es => es.eventId === event.id)?.placement || 999;
                                          return scoreA - scoreB;
                                      })
                                      .map(t => {
                                        const teamScore = t.eventScores?.find(es => es.eventId === event.id);
                                        if (!teamScore) return null;
                                        const isExpanded = expandedTeamIdInView === t.id;
                                        
                                        return (
                                            <div key={t.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                <div 
                                                    className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                    onClick={() => setExpandedTeamIdInView(isExpanded ? null : t.id)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-lg">#{teamScore.placement}</span>
                                                        <div>
                                                            <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">{t.name}</h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{teamScore.competitionPoints} competition points earned</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{teamScore.rawScore}</span>
                                                            <span className="text-xs block text-slate-500 dark:text-slate-400">Total Raw Score</span>
                                                        </div>
                                                        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-slate-400`}></i>
                                                    </div>
                                                </div>
                                                
                                                {isExpanded && (
                                                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                                        {/* Criteria Breakdown */}
                                                        <div>
                                                            <h5 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Criteria Breakdown</h5>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                                {teamScore.scores.map(score => (
                                                                    <div key={score.criteria} className="p-2 rounded bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{score.criteria}</div>
                                                                        <div className="font-semibold">{score.score} / {score.maxScore}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Merits & Demerits */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h5 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400 flex items-center gap-1"><i className="bi bi-plus-circle-fill"></i> Merits Awarded</h5>
                                                                {teamScore.merits && teamScore.merits.length > 0 ? (
                                                                    <ul className="space-y-2">
                                                                        {teamScore.merits.map((merit, idx) => (
                                                                            <li key={idx} className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
                                                                                <div className="flex justify-between">
                                                                                    <span className="font-medium text-green-800 dark:text-green-300">{merit.name}</span>
                                                                                    <span className="font-bold text-green-600">+{merit.points}</span>
                                                                                </div>
                                                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{merit.description}</p>
                                                                                {merit.venue && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"><i className="bi bi-geo-alt"></i> {merit.venue}</p>}
                                                                                {merit.timestamp && <p className="text-xs text-slate-400 mt-0.5"><i className="bi bi-clock"></i> {new Date(merit.timestamp).toLocaleString()}</p>}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : <p className="text-xs text-slate-500 italic">No merits recorded.</p>}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400 flex items-center gap-1"><i className="bi bi-dash-circle-fill"></i> Demerits Issued</h5>
                                                                {teamScore.demerits && teamScore.demerits.length > 0 ? (
                                                                    <ul className="space-y-2">
                                                                        {teamScore.demerits.map((demerit, idx) => (
                                                                            <li key={idx} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800">
                                                                                <div className="flex justify-between">
                                                                                    <span className="font-medium text-red-800 dark:text-red-300">{demerit.name}</span>
                                                                                    <span className="font-bold text-red-600">-{demerit.points}</span>
                                                                                </div>
                                                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{demerit.description}</p>
                                                                                 {demerit.venue && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"><i className="bi bi-geo-alt"></i> {demerit.venue}</p>}
                                                                                {demerit.timestamp && <p className="text-xs text-slate-400 mt-0.5"><i className="bi bi-clock"></i> {new Date(demerit.timestamp).toLocaleString()}</p>}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : <p className="text-xs text-slate-500 italic">No demerits issued.</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">Scores not yet finalized for this event.</p>
                            )}
                        </Card>
                      );
                  })
              )}
          </div>
      )}
      
      <TeamDetailsModal
        team={selectedTeam}
        isOpen={!!selectedTeam}
        onClose={handleCloseModal}
      />

      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title={reportType === 'report' ? 'Report a Problem' : 'Submit a Suggestion'}>
          <form onSubmit={handleReportSubmit} className="space-y-4">
              {reportType === 'report' && (
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Problem Type</label>
                      <select 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                          value={reportForm.problemType}
                          onChange={(e) => setReportForm({...reportForm, problemType: e.target.value})}
                          required
                      >
                          <option value="">Select type...</option>
                          <option value="spy">Spying / Eavesdropping</option>
                          <option value="unsportsmanlike">Unsportsmanlike Behavior</option>
                          <option value="other">Other</option>
                      </select>
                  </div>
              )}
              
              {reportForm.problemType === 'spy' && (
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="Offender Name" id="offenderName" value={reportForm.offenderName} onChange={(e) => setReportForm({...reportForm, offenderName: e.target.value})} required />
                      <Input label="Offender Team" id="offenderTeam" value={reportForm.offenderTeam} onChange={(e) => setReportForm({...reportForm, offenderTeam: e.target.value})} required />
                  </div>
              )}
              
              <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea 
                      id="description" 
                      rows={4} 
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-150"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                      required
                      placeholder="Please provide specific details..."
                  />
              </div>
              
              {reportType === 'report' && (
                  <Input label="Evidence (Link or description)" id="evidence" value={reportForm.evidence} onChange={(e) => setReportForm({...reportForm, evidence: e.target.value})} placeholder="Link to screenshot, video, etc." />
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setReportModalOpen(false)}>Cancel</Button>
                  <Button type="submit">{reportType === 'report' ? 'Submit Report' : 'Submit Suggestion'}</Button>
              </div>
          </form>
      </Modal>
      
      {/* Edit Scores Modal */}
      <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} title={`Edit Scores: ${editEvent?.name}`}>
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                  <p><strong>Instructions:</strong> Enter raw criteria scores. Expand a team card to manage specific merits or demerits. The system automatically calculates total raw scores and final placement points.</p>
              </div>
              <div className="space-y-4">
                  {editingResults.map((res, idx) => {
                      const team = teams.find(t => t.id === res.teamId);
                      const isExpanded = expandedTeamIdInEdit === res.teamId;
                      return (
                          <div key={res.teamId} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center cursor-pointer" onClick={() => setExpandedTeamIdInEdit(isExpanded ? null : res.teamId)}>
                                  <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{team?.name}</h4>
                                  <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-slate-400`}></i>
                              </div>
                              
                              {isExpanded && (
                                  <div className="p-4 space-y-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          {editEvent?.criteria.map((crit) => (
                                              <div key={crit.name}>
                                                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                      {crit.name} (Max: {crit.points})
                                                  </label>
                                                  <Input
                                                      id={`${team?.id}-${crit.name}`}
                                                      label=""
                                                      type="number"
                                                      min="0"
                                                      max={crit.points}
                                                      value={res.criteriaScores[crit.name]}
                                                      onChange={(e) => handleScoreChange(idx, 'criteria', crit.name, e.target.value)}
                                                      className="!mt-0"
                                                  />
                                              </div>
                                          ))}
                                      </div>
                                      
                                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Merits Management */}
                                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                              <h5 className="font-bold text-sm text-green-800 dark:text-green-300 mb-2">Merits</h5>
                                              <ul className="mb-3 space-y-2">
                                                  {res.merits?.map((m, i) => (
                                                      <li key={i} className="text-xs flex justify-between items-start bg-white dark:bg-slate-800 p-2 rounded border border-green-100 dark:border-green-800/50">
                                                          <div>
                                                              <span className="font-semibold">{m.name} (+{m.points})</span>
                                                              <p className="text-slate-500 dark:text-slate-400">{m.description}</p>
                                                          </div>
                                                          <button type="button" onClick={() => removeAdjustment(idx, 'merit', i)} className="text-red-500 hover:text-red-700">
                                                              <i className="bi bi-trash-fill"></i>
                                                          </button>
                                                      </li>
                                                  ))}
                                              </ul>
                                              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-green-100 dark:border-green-800">
                                                  <input className="text-xs p-1.5 rounded border" placeholder="Name" value={newAdjustment.name} onChange={e => setNewAdjustment({...newAdjustment, name: e.target.value})} />
                                                  <input className="text-xs p-1.5 rounded border" placeholder="Points" type="number" value={newAdjustment.points || ''} onChange={e => setNewAdjustment({...newAdjustment, points: parseInt(e.target.value) || 0})} />
                                                  <input className="text-xs p-1.5 rounded border" placeholder="Description (optional)" value={newAdjustment.description} onChange={e => setNewAdjustment({...newAdjustment, description: e.target.value})} />
                                                  <Button type="button" className="text-xs py-1" onClick={() => handleAddAdjustment(idx, 'merit')}>Add Merit</Button>
                                              </div>
                                          </div>
                                          
                                          {/* Demerits Management */}
                                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                              <h5 className="font-bold text-sm text-red-800 dark:text-red-300 mb-2">Demerits</h5>
                                              <ul className="mb-3 space-y-2">
                                                  {res.demerits?.map((d, i) => (
                                                      <li key={i} className="text-xs flex justify-between items-start bg-white dark:bg-slate-800 p-2 rounded border border-red-100 dark:border-red-800/50">
                                                          <div>
                                                              <span className="font-semibold">{d.name} (-{d.points})</span>
                                                              <p className="text-slate-500 dark:text-slate-400">{d.description}</p>
                                                          </div>
                                                          <button type="button" onClick={() => removeAdjustment(idx, 'demerit', i)} className="text-red-500 hover:text-red-700">
                                                              <i className="bi bi-trash-fill"></i>
                                                          </button>
                                                      </li>
                                                  ))}
                                              </ul>
                                              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-red-100 dark:border-red-800">
                                                  <input className="text-xs p-1.5 rounded border" placeholder="Name" value={newAdjustment.name} onChange={e => setNewAdjustment({...newAdjustment, name: e.target.value})} />
                                                  <input className="text-xs p-1.5 rounded border" placeholder="Points (positive value)" type="number" value={newAdjustment.points || ''} onChange={e => setNewAdjustment({...newAdjustment, points: parseInt(e.target.value) || 0})} />
                                                  <input className="text-xs p-1.5 rounded border" placeholder="Description (optional)" value={newAdjustment.description} onChange={e => setNewAdjustment({...newAdjustment, description: e.target.value})} />
                                                  <Button type="button" className="text-xs py-1 bg-red-600 hover:bg-red-700" onClick={() => handleAddAdjustment(idx, 'demerit')}>Add Demerit</Button>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="secondary" onClick={() => setEditEvent(null)}>Cancel</Button>
              <Button onClick={handleSaveScores}>Save & Calculate Rankings</Button>
          </div>
      </Modal>
    </div>
  );
};

export default Leaderboard;
