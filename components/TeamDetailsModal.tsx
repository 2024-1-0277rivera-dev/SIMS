
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Team, UserRole, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import { getTeamUsers } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Tab = 'overview' | 'leadership' | 'prospects' | 'merits' | 'scores' | 'progress';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`}
  >
    {label}
  </button>
);

const PointLogItem: React.FC<{ log: any; canViewDetails: boolean; type: 'merit' | 'demerit' }> = ({ log, canViewDetails, type }) => (
    <li className={`p-3 rounded-lg ${type === 'merit' ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50'}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{log.reason}</p>
                <small className="text-slate-500 dark:text-slate-400">
                    By {log.updatedBy} on {new Date(log.timestamp).toLocaleDateString()}
                    {type === 'demerit' && log.responsiblePerson && (
                        canViewDetails ? <span className="text-red-500"> (Player: {log.responsiblePerson})</span> : <span className="text-red-500"> (Player involved)</span>
                    )}
                </small>
            </div>
            <span className={`font-bold text-lg ${type === 'merit' ? 'text-green-500' : 'text-red-500'}`}>
                {log.points > 0 ? `+${log.points}` : log.points}
            </span>
        </div>
    </li>
);

interface TeamDetailsModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditingLeadership, setIsEditingLeadership] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const { user } = useAuth();
  
  const canViewDemeritDetails = user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER;
  // Determine if current user belongs to this team (mock logic: in real app, compare user.teamId with team.id)
  const isUserInTeam = user?.teamId === team?.id;
  // Allow editing if admin, or if the user is a team lead/officer belonging to THIS team
  const canEditTeamInfo = user?.role === UserRole.ADMIN || (isUserInTeam && (user?.role === UserRole.TEAM_LEAD || user?.role === UserRole.OFFICER));

  // State for leadership form
  const [leadershipForm, setLeadershipForm] = useState({
      unitLeader: '',
      unitSecretary: '',
      unitTreasurer: '',
      unitErrands: ['', '', '', ''], // 4 errands
      adviser: '',
  });

  // Populate form on open
  useEffect(() => {
      if (team) {
          setLeadershipForm({
              unitLeader: team.unitLeader || '',
              unitSecretary: team.unitSecretary || '',
              unitTreasurer: team.unitTreasurer || '',
              unitErrands: team.unitErrands || ['', '', '', ''],
              adviser: team.adviser || '',
          });
          fetchTeamMembers(team.id);
      }
  }, [team]);

  const fetchTeamMembers = async (teamId: string) => {
      try {
          const members = await getTeamUsers(teamId);
          setTeamMembers(members);
      } catch (error) {
          console.error("Error fetching team members", error);
      }
  };

  const handleErrandChange = (index: number, value: string) => {
      const newErrands = [...leadershipForm.unitErrands];
      newErrands[index] = value;
      setLeadershipForm({ ...leadershipForm, unitErrands: newErrands });
  };

  const handleSaveLeadership = () => {
      console.log("Saving leadership details:", leadershipForm);
      // Call API to update
      setIsEditingLeadership(false);
  };

  if (!team) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Team Hub: ${team.name}`} size="5xl">
      <div className="space-y-4">
        <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-700 pb-3 -mx-6 px-6">
            <div className="flex space-x-2">
                <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label="Leadership & Adviser" isActive={activeTab === 'leadership'} onClick={() => setActiveTab('leadership')} />
                <TabButton label="Prospects" isActive={activeTab === 'prospects'} onClick={() => setActiveTab('prospects')} />
                <TabButton label="Progress Graph" isActive={activeTab === 'progress'} onClick={() => setActiveTab('progress')} />
                <TabButton label="Merits & Demerits" isActive={activeTab === 'merits'} onClick={() => setActiveTab('merits')} />
                <TabButton label="Scores" isActive={activeTab === 'scores'} onClick={() => setActiveTab('scores')} />
            </div>
        </div>

        <div className="h-[60vh] overflow-y-auto pr-2">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{team.score} pts</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Current Rank: #{team.rank}</p>
                  </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Team Description</h3>
                <p className="text-slate-600 dark:text-slate-300">{team.description || 'No description available.'}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                      <div className="font-bold text-xl text-slate-700 dark:text-slate-300">{team.placementStats?.first || 0}</div>
                      <div className="text-slate-500 dark:text-slate-400">1st Places</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                      <div className="font-bold text-xl text-slate-700 dark:text-slate-300">{team.placementStats?.second || 0}</div>
                      <div className="text-slate-500 dark:text-slate-400">2nd Places</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                      <div className="font-bold text-xl text-slate-700 dark:text-slate-300">{team.placementStats?.third || 0}</div>
                      <div className="text-slate-500 dark:text-slate-400">3rd Places</div>
                  </div>
                   <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                      <div className="font-bold text-xl text-slate-700 dark:text-slate-300">{team.placementStats?.fourth || 0}</div>
                      <div className="text-slate-500 dark:text-slate-400">4th Places</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-800/50 text-center">
                      <div className="font-bold text-xl text-blue-700 dark:text-blue-300">{team.placementStats?.merits || 0}</div>
                      <div className="text-blue-500 dark:text-blue-400">Merits Awarded</div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-800/50 text-center">
                      <div className="font-bold text-xl text-red-700 dark:text-red-300">{team.placementStats?.demerits || 0}</div>
                      <div className="text-red-500 dark:text-red-400">Demerits Deducted</div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'leadership' && (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Team Leadership Structure</h3>
                    {canEditTeamInfo && !isEditingLeadership && (
                        <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => setIsEditingLeadership(true)}>Edit Information</Button>
                    )}
                    {isEditingLeadership && (
                         <div className="space-x-2">
                            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => setIsEditingLeadership(false)}>Cancel</Button>
                            <Button className="py-1 px-3 text-xs" onClick={handleSaveLeadership}>Save Changes</Button>
                         </div>
                    )}
                  </div>
                  
                  {!isEditingLeadership ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unit Leader</h5>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{team.unitLeader || 'Not Assigned'}</p>
                        </Card>
                         <Card className="p-4">
                          <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unit Adviser</h5>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{team.adviser || 'Not Assigned'}</p>
                        </Card>
                         <Card className="p-4">
                          <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unit Secretary</h5>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{team.unitSecretary || 'Not Assigned'}</p>
                        </Card>
                         <Card className="p-4">
                          <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unit Treasurer</h5>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{team.unitTreasurer || 'Not Assigned'}</p>
                        </Card>
                      </div>
                       <Card className="p-4">
                        <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unit Operational Errands</h5>
                        <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                          {(team.unitErrands?.filter(e => e) ?? []).length > 0 ? (
                            team.unitErrands?.map((errand, index) => errand && <li key={index}>{errand}</li>)
                          ) : (
                            <li className="list-none italic">No members assigned.</li>
                          )}
                        </ul>
                      </Card>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Unit Leader" id="unitLeader" value={leadershipForm.unitLeader} onChange={(e) => setLeadershipForm({...leadershipForm, unitLeader: e.target.value})} disabled={!isEditingLeadership} />
                          <Input label="Unit Adviser" id="adviser" value={leadershipForm.adviser} onChange={(e) => setLeadershipForm({...leadershipForm, adviser: e.target.value})} disabled={!isEditingLeadership} />
                          <Input label="Unit Secretary" id="unitSecretary" value={leadershipForm.unitSecretary} onChange={(e) => setLeadershipForm({...leadershipForm, unitSecretary: e.target.value})} disabled={!isEditingLeadership} />
                          <Input label="Unit Treasurer" id="unitTreasurer" value={leadershipForm.unitTreasurer} onChange={(e) => setLeadershipForm({...leadershipForm, unitTreasurer: e.target.value})} disabled={!isEditingLeadership} />
                      </div>
                      <div>
                          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Unit Operational Errands</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {leadershipForm.unitErrands.map((errand, index) => (
                                  <Input 
                                      key={index}
                                      label={`Errand ${index + 1}`} 
                                      id={`errand-${index}`} 
                                      value={errand} 
                                      onChange={(e) => handleErrandChange(index, e.target.value)} 
                                      disabled={!isEditingLeadership} 
                                  />
                              ))}
                          </div>
                      </div>
                    </>
                  )}

              </div>
          )}
          
          {activeTab === 'prospects' && (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Prospect Players & Participants</h3>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 text-sm text-indigo-700 dark:text-indigo-300">
                      <p><i className="bi bi-info-circle mr-2"></i>This list shows registered team members and their self-declared interest in specific events. Use this to find potential participants.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {teamMembers.length > 0 ? (
                      teamMembers.map(member => (
                        <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-bold text-slate-800 dark:text-slate-100">{member.firstName} {member.lastName}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.yearLevel} • {member.section}</p>
                                      </div>
                                      <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded capitalize">{member.role.replace('_', ' ')}</span>
                                    </div>
                                    {member.interestedEvents && member.interestedEvents.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Interested in:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {member.interestedEvents.map((evt, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                                                        {evt}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {member.bio && (
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">"{member.bio}"</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-4">No members found for this team.</p>
                    )}
                  </div>
              </div>
          )}
          
          {activeTab === 'progress' && (
              <div className="h-96">
                  <h3 className="font-bold text-lg mb-4">Team Progress History</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={team.progressHistory || []}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                        <YAxis tick={{fontSize: 12}} domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip contentStyle={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">Shows score progression over time including merit/demerit updates.</p>
              </div>
          )}

          {activeTab === 'merits' && (
            <div className="space-y-4">
                <div>
                    <h3 className="font-bold text-lg mb-2 text-green-600 dark:text-green-400">Merits</h3>
                    {team.merits?.length ? (
                        <ul className="space-y-2">
                            {team.merits.map((merit, i) => <PointLogItem key={i} log={merit} canViewDetails={canViewDemeritDetails} type="merit" />)}
                        </ul>
                    ) : <p className="text-slate-500 dark:text-slate-400">No merits recorded.</p>}
                </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-red-600 dark:text-red-400">Demerits</h3>
                     {team.demerits?.length ? (
                        <ul className="space-y-2">
                            {team.demerits.map((demerit, i) => <PointLogItem key={i} log={demerit} canViewDetails={canViewDemeritDetails} type="demerit" />)}
                        </ul>
                    ) : <p className="text-slate-500 dark:text-slate-400">No demerits recorded.</p>}
                </div>
            </div>
          )}
          
          {activeTab === 'scores' && (
            <div>
                <h3 className="font-bold text-lg mb-2">Event Scorecards</h3>
                 {team.eventScores?.length ? (
                    <div className="space-y-4">
                        {team.eventScores.map((event, i) => (
                            <Card key={i} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">{event.eventName}</h4>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Placement: {event.placement}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Competition Points: <span className="font-semibold">{event.competitionPoints}</span></p>
                                <ul className="text-sm space-y-1">
                                    {event.scores.map((score, j) => (
                                        <li key={j} className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1">
                                            <span>{score.criteria}:</span>
                                            <span className="font-medium">{score.score} / {score.maxScore}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                ) : <p className="text-slate-500 dark:text-slate-400">No event scores available.</p>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TeamDetailsModal;
