import React from 'react';
import Card from '../components/Card';

const Rules: React.FC = () => {
    
    const renderTable = (headers: string[], data: (string | number)[][]) => (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                        {headers.map(header => (
                            <th key={header} className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {data.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2 whitespace-nowrap text-slate-500 dark:text-slate-400">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">i3 Day | Clash of Cards</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">CIT Tech and Sports Fest 2025</p>
        <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-2">#SDG9 #SDG13 #SDG17</p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Objectives</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>To showcase the diverse talents and skills of information technology students and faculty, fostering a sense of community and camaraderie.</li>
          <li>To promote sportsmanship, healthy competition, and community spirit among students, faculty, and the wider IT community, encourage teamwork, and foster a supportive atmosphere that promotes growth and learning.</li>
        </ul>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">House Rules</h2>
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">Attendance and Participation</h3>
                <ul className="list-disc list-inside space-y-2 mt-2 text-slate-600 dark:text-slate-300">
                    <li>All students are required to participate in the events assigned to their units. Attendance is mandatory and will be strictly monitored.</li>
                    <li>This activity is part of the college calendar and is considered a regular class schedule. Therefore, students are expected to attend and actively participate in their assigned units.</li>
                    <li>While the event includes competitions, its primary goal is to promote unity and cooperation among all students, not just to compete for victory.</li>
                    <li>Double entries in solo events are not allowed, except in team events, or there’s such cases where the players are limited and needed to play to represent the team.</li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-semibold">Responsibilities of Unit Advisers and Leaders</h3>
                 <ul className="list-disc list-inside space-y-2 mt-2 text-slate-600 dark:text-slate-300">
                    <li>Unit advisers and leaders must ensure that all members are actively involved in the events. They are also responsible for implementing a buddy system to help manage their unit members.</li>
                    <li>Students are expected to maintain discipline throughout the event.</li>
                </ul>
            </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Demerit System</h2>
        <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300">A demerit system will be implemented for any rule violations. Deductions will be made from the unit’s overall score. The current point standings will be displayed publicly to promote accountability and awareness.</p>
            <div>
                <h3 className="text-lg font-semibold">Demerit Deductions</h3>
                <ul className="list-disc list-inside space-y-2 mt-2 text-slate-600 dark:text-slate-300">
                    <li><strong>Abrupt back-out, refusal to play, or walkout:</strong> 0 points per event</li>
                    <li><strong>Unsportsmanlike behavior:</strong> –25 points per incident</li>
                    <li><strong>Spying on another team to reveal their ideas or to use information with malicious intent:</strong>
                        <ul className="list-disc list-inside ml-4">
                            <li>–500 points if proven intentional</li>
                            <li>–100 points if a warning is issued or if the eavesdropping is deemed unintentional</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Complaint, Grievance & Forfeits</h2>
        <div className="space-y-4">
             <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li>All complaints must be submitted to the Grievance Committee at least 3 hours before the event.</li>
                <li>The Committee’s decision is final.</li>
                <li>Misconduct, cheating, or disrespect toward officials will result in disqualification.</li>
                <li>Complaints or protests must be filed through the Secretariat for proper handling.</li>
                <li>Appeals will be considered if filed no less than 3 hours before or at least one day before the event for review and approval by the Steering Committee.</li>
                <li>A unit that refuses to play or walks out automatically forfeits the event.</li>
                <li>Any unsportsmanlike behavior will result in the disqualification of the player. A second violation will cause the player to be barred from future events.</li>
            </ul>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Scoring System</h2>
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Event Point System</h3>
                {renderTable(
                    ['Event Type', 'Base Points'],
                    [
                        ['Solo Events', '1,000 points'],
                        ['Duo–4 Member Events', '1,200 points'],
                        ['5-Member or Team Events', '1,500 points']
                    ]
                )}
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Placement Scoring</h3>
                {renderTable(
                    ['Placement', 'Points Awarded'],
                    [
                        ['1st Place', '100% (Full points)'],
                        ['2nd Place', '80% of 1st Place'],
                        ['3rd Place', '80% of 2nd Place'],
                        ['4th Place', '80% of 3rd Place']
                    ]
                )}
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Merit Points</h3>
                {renderTable(
                    ['Category', 'Placement', 'Points'],
                    [
                        ['Attendance', '1st (highest)', '500 pts'],
                        ['', '2nd (high)', '400 pts'],
                        ['', '3rd (low)', '300 pts'],
                        ['', '4th (lowest)', '200 pts'],
                        ['Outstanding Sportsmanship', '-', '50 pts'],
                        ['Discipline and Cooperation', '-', '50 pts'],
                        ['Highest Participating Members', '1st (highest)', '1,000 pts'],
                        ['', '2nd (high)', '900 pts'],
                        ['', '3rd (low)', '800 pts'],
                        ['', '4th (lowest)', '700 pts']
                    ]
                )}
            </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Categories & Mechanics</h2>
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">Unit Leaders: Affirmation/Votation</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">The group members will choose to affirm the leader that is selected from the last meeting or to have another vote for a leader, and the chosen leader from the last meeting will be one of the candidates to choose from.</p>
                <ul className="list-disc list-inside space-y-2 mt-2 text-slate-600 dark:text-slate-300">
                   <li><strong>Unit Leader (1):</strong> Leads and manages the entire unit. Oversees all activities, makes decisions, assigns tasks, and reports directly to the S-ALT Officers.</li>
                   <li><strong>Unit Secretary (1):</strong> Acts as the right hand of the leader. Records meeting notes, tracks attendance, manages documents, and keeps members informed.</li>
                   <li><strong>Unit Treasurer (1):</strong> Handles all financial matters of the unit. Collects and records contributions, manages the budget, and reports expenses to the leader.</li>
                   <li><strong>Operational Errands (4):</strong> Provides manpower and logistical support. Buys needed materials, assists in errands, gathers information, and helps the leader, secretary, and treasurer with tasks.</li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-semibold">Adviser: CIT Faculty</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">The teams will vote for their own advisers from the faculty. The chosen adviser will be the one they will interact with and share their experiences with throughout the games. Teams may treat their adviser as a coach, mentor, motivator, or guide during the event.</p>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Faculty Members: Nginsayan, Myrielle; Luzada, Ralphy; Maskay, Wilfred; Sudaypan, Steve; Leon, Deliah; Pangcog, Sharmaine.</p>
            </div>
             <div>
                <h3 className="text-lg font-semibold">Unit Name: Brainstorming</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">The teams will be assigned a team color and will decide what name they will create to complete their signature team name. Format: Team Color + Team Name (e.g., AMARANTH JOKER).</p>
                {renderTable(
                    ['Team', 'Designated Color'],
                    [
                        ['Spades', 'Black'],
                        ['Clubs', 'Green'],
                        ['Hearts', 'Red'],
                        ['Diamonds', 'Blue']
                    ]
                )}
            </div>
        </div>
      </Card>
    </div>
  );
};

export default Rules;
