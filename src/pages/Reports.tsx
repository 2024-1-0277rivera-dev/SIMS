import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../hooks/useToast.ts';
import { Report, User, UserRole, Team } from '../types.ts';
import { getReports, submitReport, getUsers, updateReportStatus, addReportReply, STORAGE_KEYS, getLeaderboard } from '../services/api.ts';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import { useSyncedData } from '../hooks/useSyncedData.ts';
import AnimatedPage from '../components/AnimatedPage.tsx';
import { useEventContext } from '../hooks/useEventContext.ts';
import NoDataComponent from '../components/NoDataComponent.tsx';
import { getTeamStyles } from '../config.ts';
import { useVisibility } from '../hooks/useVisibility.ts';

const AMARANTH_JOKERS_TEAM_ID = 't5';

const Reports: React.FC = () => {
    const { data: reportsData, loading: reportsLoading } = useSyncedData<Report[]>(getReports, [STORAGE_KEYS.REPORTS]);
    const { data: usersData, loading: usersLoading } = useSyncedData<User[]>(getUsers, [STORAGE_KEYS.USERS]);
    const { data: teamsData, loading: teamsLoading } = useSyncedData<Team[]>(getLeaderboard, [STORAGE_KEYS.TEAMS]);
    const { isDataAvailable } = useEventContext();
    const reports = reportsData || [];
    const users = usersData || [];
    const teams = teamsData || [];
    const loading = reportsLoading || usersLoading || teamsLoading;

    const [tab, setTab] = useState<'view' | 'submit'>('view');
    const { user } = useAuth();
    const { addToast } = useToast();
    const { settings, isPrivileged } = useVisibility();

    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const [reportType, setReportType] = useState<'report' | 'suggestion'>('report');
    const [reportForm, setReportForm] = useState({
        problemType: '',
        description: '',
        offenderName: '',
        offenderTeam: '',
        evidence: '',
    });
    
    const isManager = user?.teamId === AMARANTH_JOKERS_TEAM_ID || user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER;

    const getUser = (userId: string) => users.find(u => u.id === userId);

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await submitReport({ ...reportForm, type: reportType, submittedBy: user.id });
            addToast(`${reportType === 'report' ? 'Report' : 'Suggestion'} submitted successfully!`, 'success');
            setReportForm({ problemType: '', description: '', offenderName: '', offenderTeam: '', evidence: '' });
            setTab('view');
        } catch (error) {
            addToast('Failed to submit. Try again.', 'error');
        }
    };

    const handleStatusUpdate = async (reportId: string, status: Report['status']) => {
        try {
            await updateReportStatus(reportId, status);
            addToast('Status updated!', 'success');
        } catch (error) {
            addToast('Failed to update status.', 'error');
        }
    };

    const handlePostReply = async (reportId: string) => {
        if (!replyText.trim() || !user) return;
        try {
            // FIX: Pass an object with a `reply` property as expected by the API, not `message` and `repliedBy`.
            await addReportReply(reportId, { reply: replyText });
            setReplyText('');
            setReplyingTo(null);
            addToast('Reply posted!', 'success');
        } catch (error) {
            addToast('Failed to post reply.', 'error');
        }
    };

    const displayedReports = isManager ? reports : reports.filter(r => r.submittedBy === user?.id);
    const tabTitle = isManager ? 'All Submissions' : 'My Submissions';

    const statusStyles: Record<Report['status'], string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        reviewed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
        resolved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    };
    
    if (loading) return <div>Loading...</div>;
    
    if (!isDataAvailable) {
        return <AnimatedPage><NoDataComponent /></AnimatedPage>;
    }

    return (
        <AnimatedPage className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Reports & Suggestions</h1>

            <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700">
                {(isPrivileged || settings.reports.tabs.view) && <button onClick={() => setTab('view')} className={`px-4 py-2 text-sm font-semibold ${tab === 'view' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{tabTitle}</button>}
                {(isPrivileged || settings.reports.tabs.submit) && <button onClick={() => setTab('submit')} className={`px-4 py-2 text-sm font-semibold ${tab === 'submit' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Submit New</button>}
            </div>

            {tab === 'view' && (isPrivileged || settings.reports.tabs.view) && (
                <div className="space-y-4">
                    {displayedReports.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">{isManager ? 'No reports have been submitted yet.' : 'You have not submitted any reports.'}</p>
                    ) : (
                        displayedReports.map(report => {
                            const submitter = getUser(report.submittedBy);
                            const offenderTeam = teams.find(t => t.name.toLowerCase() === report.offenderTeam?.toLowerCase());
                            const teamStyle = offenderTeam ? getTeamStyles(offenderTeam.id) : null;
                            return (
                                <Card key={report.id} className="p-5">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                        <div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${report.type === 'report' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                                {report.type}
                                            </span>
                                            {report.problemType && <span className="text-sm font-semibold ml-2 text-slate-700 dark:text-slate-200">{report.problemType}</span>}
                                        </div>
                                        <span className={`text-xs font-bold capitalize px-2.5 py-1 rounded-full ${statusStyles[report.status]}`}>{report.status}</span>
                                    </div>
                                    <p className="my-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{report.description}</p>
                                    
                                    {report.offenderName && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <b className="text-slate-700 dark:text-slate-200">Offender:</b>
                                            <span>{report.offenderName}</span>
                                            {teamStyle ? (
                                                <span className="flex items-center gap-1">
                                                    (<i className={`${teamStyle.icon}`} style={{ color: teamStyle.gradient.from }}></i>
                                                    <span>{report.offenderTeam}</span>)
                                                </span>
                                            ) : (
                                                report.offenderTeam && <span>({report.offenderTeam})</span>
                                            )}
                                        </p>
                                    )}
                                    {report.evidence && <p className="text-sm text-slate-500 dark:text-slate-400"><b className="text-slate-700 dark:text-slate-200">Evidence:</b> {report.evidence}</p>}
                                    
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        Submitted by <b>{submitter?.name || 'Unknown'}</b> on {new Date(report.timestamp).toLocaleString()}
                                    </div>

                                    {report.replies && report.replies.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                        {report.replies.map(reply => {
                                            const replier = getUser(reply.repliedBy);
                                            return (
                                                <div key={reply.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex gap-3">
                                                    <img src={replier?.avatar} alt={replier?.name} className="h-8 w-8 rounded-full flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">{reply.message}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <b>{replier?.name}</b> • {new Date(reply.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        </div>
                                    )}

                                    {isManager && (
                                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            {replyingTo !== report.id ? (
                                                <div className="flex justify-between items-center">
                                                     <div className="flex gap-2">
                                                        <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => handleStatusUpdate(report.id, 'reviewed')} disabled={report.status === 'reviewed'}>Mark as Reviewed</Button>
                                                        <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => handleStatusUpdate(report.id, 'resolved')} disabled={report.status === 'resolved'}>Mark as Resolved</Button>
                                                    </div>
                                                    <Button className="text-xs py-1 px-2" onClick={() => setReplyingTo(report.id)}>Reply</Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2} className="w-full text-sm p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" placeholder="Type your reply..."></textarea>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="secondary" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                        <Button onClick={() => handlePostReply(report.id)}>Post Reply</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            )
                        })
                    )}
                </div>
            )}
            
            {tab === 'submit' && (isPrivileged || settings.reports.tabs.submit) && (
                 <Card className="p-6">
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Submission Type</label>
                            <div className="flex gap-4">
                               <label><input type="radio" name="type" value="report" checked={reportType === 'report'} onChange={() => setReportType('report')} /> Report an Issue</label>
                               <label><input type="radio" name="type" value="suggestion" checked={reportType === 'suggestion'} onChange={() => setReportType('suggestion')} /> Submit a Suggestion</label>
                            </div>
                        </div>

                        {reportType === 'report' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Problem Type</label>
                                <select 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                                    value={reportForm.problemType}
                                    onChange={(e) => setReportForm({ ...reportForm, problemType: e.target.value })}
                                    required
                                >
                                    <option value="">Select type...</option>
                                    <option value="spy">Spying / Eavesdropping</option>
                                    <option value="unsportsmanlike">Unsportsmanlike Behavior</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        )}
                        
                        {reportType === 'report' && reportForm.problemType && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Offender Name (if known)" id="offenderName" value={reportForm.offenderName} onChange={(e) => setReportForm({ ...reportForm, offenderName: e.target.value })} />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Offender Team (if known)</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                                        value={reportForm.offenderTeam}
                                        onChange={(e) => setReportForm({ ...reportForm, offenderTeam: e.target.value })}
                                    >
                                        <option value="">Select team...</option>
                                        {teams.map(team => <option key={team.id} value={team.name}>{team.name}</option>)}
                                    </select>
                                </div>
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
                        
                        <div className="flex justify-end pt-4">
                            <Button type="submit">{reportType === 'report' ? 'Submit Report' : 'Submit Suggestion'}</Button>
                        </div>
                    </form>
                </Card>
            )}
        </AnimatedPage>
    );
};

export default Reports;
