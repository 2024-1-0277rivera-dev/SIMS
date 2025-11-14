
import { API_BASE } from '..//constants.ts';
import { User, UserRole, Team, Event, EventStatus, EventCategory, CriteriaItem, EventResult, AppNotification } from '../types.ts';

// --- MOCK DATA & STORAGE ---
const STORAGE_KEY_USERS = 'sims_mock_users';
const STORAGE_KEY_TEAMS = 'sims_mock_teams';
// Changed key to force fresh load of the new events data
const STORAGE_KEY_EVENTS = 'sims_mock_events_v2';
const STORAGE_KEY_NOTIFICATIONS = 'sims_mock_notifications';

// Initial mock users
const INITIAL_MOCK_USERS: { [id: string]: User } = {
  '1': { 
    id: '1', name: 'Admin User', email: 'admin@sims.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin/200',
    firstName: 'Admin', lastName: 'User', studentId: 'ADMIN-001', teamId: 't1', password: 'password'
  },
  'riverabenlor461@gmail.com': {
    id: 'admin_1', name: 'Benlor Rivera', email: 'riverabenlor461@gmail.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin1/200',
    firstName: 'Benlor', lastName: 'Rivera', studentId: 'ADMIN-BEN', password: 'password' 
  },
  '2024-1-0277.rivera@kcp.edu.ph': {
    id: 'admin_2', name: 'KCP Admin', email: '2024-1-0277.rivera@kcp.edu.ph', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin2/200',
    firstName: 'KCP', lastName: 'Admin', studentId: '2024-1-0277', password: '2024-1-0277aaggmmpp'
  },
  '2': { 
    id: '2', name: 'Officer Jones', email: 'officer@sims.com', role: UserRole.OFFICER, avatar: 'https://picsum.photos/seed/officer/200',
    firstName: 'Jessica', lastName: 'Jones', studentId: 'OFF-002', teamId: 't2', interestedEvents: ['Joker Flag: Chant (Wave 1)'], password: 'password'
  },
  '3': { 
    id: '3', name: 'Regular Player', email: 'user@sims.com', role: UserRole.USER, avatar: 'https://picsum.photos/seed/user/200', teamId: 't1',
    firstName: 'John', lastName: 'Doe', studentId: '2023-1005', yearLevel: '2nd Year', section: 'Section 1',
    interestedEvents: ['Hackathon', 'Essay Writing (English)', 'General Quiz'],
    bio: 'Loves coding and chess.', password: 'password'
  }, 
  '4': { 
    id: '4', name: 'Lead Leo', email: 'lead@sims.com', role: UserRole.TEAM_LEAD, avatar: 'https://picsum.photos/seed/lead/200', teamId: 't1',
    firstName: 'Leo', lastName: 'Leaderson', studentId: '2022-1100', yearLevel: '3rd Year', section: 'International',
    interestedEvents: ['Basketball', 'Debate', 'Larong Lahi: Tug of War'],
    bio: 'Competitive and always aiming for the gold!', password: 'password'
  },
};

// Ensure passwords for specified accounts match request
INITIAL_MOCK_USERS['riverabenlor461@gmail.com'].password = '24025944';
INITIAL_MOCK_USERS['2024-1-0277.rivera@kcp.edu.ph'].password = '2024-1-0277aaggmmpp';

let MOCK_LEADERBOARD: Team[] = [
  { 
    rank: 1, id: 't1', name: 'Midnight Spades', score: 0, wins: 0, losses: 0, playersCount: 0,
    scoreHistory: [],
    progressHistory: [{ date: new Date().toISOString().split('T')[0], score: 0 }],
    description: 'The Midnight Spades are known for their exceptional performance in coding challenges and their strategic gameplay in board games.',
    merits: [],
    demerits: [],
    eventScores: [],
    unitLeader: 'Leo Leaderson',
    unitSecretary: 'Sarah Scribe',
    unitTreasurer: 'Timmy Counts',
    unitErrands: ['Ernie Runner', 'Ella Dash', 'Eric Speedy', 'Eva Quick'],
    adviser: 'Ms. Nginsayan',
    placementStats: { first: 0, second: 0, third: 0, fourth: 0, merits: 0, demerits: 0 }
  },
  { 
    rank: 1, id: 't2', name: 'Scarlet Hearts', score: 0, wins: 0, losses: 0, playersCount: 0, scoreHistory: [],
    progressHistory: [{ date: new Date().toISOString().split('T')[0], score: 0 }],
    unitLeader: 'Harry Heart',
    adviser: 'Sir Luzada',
    placementStats: { first: 0, second: 0, third: 0, fourth: 0, merits: 0, demerits: 0 },
    eventScores: [],
  },
  { 
    rank: 1, id: 't3', name: 'Emerald Clovers', score: 0, wins: 0, losses: 0, playersCount: 0, scoreHistory: [],
    progressHistory: [{ date: new Date().toISOString().split('T')[0], score: 0 }],
    unitLeader: 'Chloe Clover',
    adviser: 'Sir Maskay',
    placementStats: { first: 0, second: 0, third: 0, fourth: 0, merits: 0, demerits: 0 },
    eventScores: [],
  },
  { 
    rank: 1, id: 't4', name: 'Glacier Diamonds', score: 0, wins: 0, losses: 0, playersCount: 0, scoreHistory: [],
    progressHistory: [{ date: new Date().toISOString().split('T')[0], score: 0 }],
    unitLeader: 'Danny Diamond',
    adviser: 'Ms. Leon',
    placementStats: { first: 0, second: 0, third: 0, fourth: 0, merits: 0, demerits: 0 },
    eventScores: [],
  },
];

let MOCK_EVENTS: Event[] = [
    // Joker Flag Wave 1
    { id: 'jf1', name: 'Joker Flag Wave 1: Chant', category: EventCategory.JOKER_FLAG, officerInCharge: 'Bhenny & Foncee', participantsInfo: 'All supporting audience members', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Game Area', 
      description: 'A rhythmic and melodic team chant that promotes the team’s identity and energy. The chant may be accompanied by coordinated movements, claps, or beats, but should primarily highlight vocal unity and synchronization.',
      mechanics: 'Duration: Minimum of 1 minute.\nFocus on rhythm, clarity, and team synergy.\nLyrics must reflect the team’s values, name, or spirit.\nMust be appropriate and respectful in content.',
      criteria: [
        { name: 'Creativity & Originality', description: 'Uniqueness and innovative approach in chant composition and presentation', points: 30 },
        { name: 'Synchronization & Coordination', description: 'Timing, teamwork, and alignment of movement and rhythm', points: 30 },
        { name: 'Energy & Delivery', description: 'Enthusiasm, projection, and liveliness of performance', points: 20 },
        { name: 'Clarity & Team Identity', description: 'Clear diction, message, and reflection of the team’s character', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    // Joker Flag Wave 2
    { id: 'jf2', name: 'Joker Flag Wave 2: Silent Drill', category: EventCategory.JOKER_FLAG, officerInCharge: 'Bhenny & Foncee', participantsInfo: 'All supporting audience members', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Game Area',
      description: 'A performance showcasing precision, discipline, and creativity using body percussion, movement, and improvised rhythms. Limited vocal use is allowed, but emphasis should be on non-verbal synchronization and impact.',
      mechanics: 'Duration: Minimum of 1 minute.\nMust use body, claps, stomps, or objects (no musical instruments).\nVocal sounds allowed but minimal.\nEmphasis on timing, formation, and group coordination.',
      criteria: [
        { name: 'Precision & Timing', description: 'Accuracy and uniformity in movements and beats', points: 30 },
        { name: 'Creativity & Use of Body Percussion', description: 'Innovation in creating sound and rhythm using the body or improvised means', points: 30 },
        { name: 'Synchronization & Formation', description: 'Cohesiveness of the group and formation transitions', points: 20 },
        { name: 'Overall Impact & Discipline', description: 'General impression, composure, and performance quality', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    // Joker Flag Wave 3
    { id: 'jf3', name: 'Joker Flag Wave 3: Yell', category: EventCategory.JOKER_FLAG, officerInCharge: 'Bhenny & Foncee', participantsInfo: 'All supporting audience members', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Game Area',
      description: 'An intense and powerful vocal performance designed to intimidate rival teams and boost team morale. This wave highlights strength, confidence, and the team’s competitive spirit through commanding chants and unified expressions.',
      mechanics: 'Duration: Minimum of 1 minute.\nFocus on volume, projection, and intensity.\nMust remain respectful (no offensive language or gestures).\nMay include brief team slogans or cheers.',
      criteria: [
        { name: 'Intensity & Energy', description: 'Strength and enthusiasm in vocal performance', points: 30 },
        { name: 'Unity & Vocal Power', description: 'Harmony, coordination, and equal participation', points: 30 },
        { name: 'Message & Delivery', description: 'Clarity and effectiveness of the yell’s message', points: 20 },
        { name: 'Stage Presence & Confidence', description: 'Body language, expression, and command of space', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    
    // CIT Quest
    { id: 'cit1', name: 'Cheer Dance', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: '10–15 performers (mixed gender)', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Gymnasium',
      description: 'A high-energy routine incorporating essential cheerleading elements: dance techniques, formations, and group stunts.',
      mechanics: 'Each unit shall have one (1) entry with 10-15 performers.\nThe performers must be a combination of males and females.\nThe routine must incorporate essential cheerleading elements: dance techniques, formations, and group stunts/pyramids (basket tosses and other high-risk aerial stunts are prohibited for safety).\nThe team can make use of their own song choice as music.\nThe performance must not exceed 5 minutes, including entrance and exit.\nThe use of props (e.g., pompoms, flags, banners) is allowed as long as you take extra precautions and ensure safety.',
      criteria: [
        { name: 'Choreography (Creativity & Artistry)', description: 'Originality, creativity, transitions, and overall composition', points: 50 },
        { name: 'Execution & Energy', description: 'Precision, synchronization, and consistency of movements', points: 30 },
        { name: 'Costume & Visuals', description: 'Appropriateness, design, and appeal of costumes and props', points: 10 },
        { name: 'Overall Impact', description: 'Crowd appeal, confidence, and overall impression', points: 10 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'cit2', name: 'Banner Competition', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: 'Open', date: new Date(Date.now() + 86400000 * 1).toISOString(), venue: 'Lobby Area',
      description: 'Digital banner design competition that showcases team identity and the event theme.',
      mechanics: 'The name of the unit must be visible in the banner, including the icon symbolism of the element.\nRecommends the dimensions of 1920px by 1080px for background use.\nThe banner must be made in Photoshop or any editing tool and must be original work.',
      criteria: [
        { name: 'Relativity of icon and theme', description: 'How well the banner incorporates the unit icon and event theme', points: 40 },
        { name: 'Creativity and Visual Impact', description: 'Innovative design, color scheme, and overall appeal', points: 40 },
        { name: 'Originality', description: 'Uniqueness in approach, ideas, and design', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'cit3', name: 'Cosplay', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: 'Max 5 members for skit', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Stage Area',
      description: 'A cosplay competition representing the unit’s symbol and theme, featuring a mascot character.',
      mechanics: 'The design must incorporate elements representing the unit’s icon or symbol.\nIt must reflect the theme of the event.\nAt least 50% of the costume must be made from recycled or eco-friendly materials.\nCostumes must not include dangerous or sharp objects.\nParticipants must perform a 2-minute skit or walk showcasing their mascot/cosplay.\nGroups are allowed for the skit, with a maximum of 5 members, focusing on one mascot.',
      criteria: [
        { name: 'Relativity of icon and theme', description: 'Reflects unit’s icon and aligns with event theme', points: 20 },
        { name: 'Creativity', description: 'Innovation in materials, design, and presentation', points: 40 },
        { name: 'Appearance', description: 'Visual appeal, craftsmanship, and quality', points: 40 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'cit4', name: 'Amazing Race', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: 'All players available', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Campus Wide',
      description: 'A fast-paced race featuring a mix of physical, mental, and teamwork challenges across multiple stations.',
      mechanics: 'Open to all members.\nFeatures a mix of physical, mental, and teamwork challenges.\nThe fastest team to complete all stations wins.\nTeamwork and safety are required at all times.',
      criteria: [
        { name: 'Time Finished', description: 'Teams ranked by completion time', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'cit5', name: 'General Quiz', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: 'All members must join', date: new Date(Date.now() + 86400000 * 5).toISOString(), venue: 'Auditorium',
      description: 'A mass quiz competition covering IT topics, current events, general knowledge, and Cordilleran subjects.',
      mechanics: 'A flag must be raised and marched while answering the quiz, serving as basis for elimination.\nIf a player carries the flag of another team and wins, only the flag is valid.\nCovers: IT topics, current events, general knowledge, and traditional Cordilleran subjects.\nAll members must participate.',
      criteria: [
        { name: 'Correct Answers', description: 'Score based on number of correct answers until elimination', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    
    // Larong Lahi (CIT Quest)
    { id: 'cit6', name: 'Larong Lahi: Dodgeball', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: '25 mixed players per team', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Open Field',
      description: 'A competitive team sport in which players throw balls and try to hit opponents while avoiding being hit.',
      mechanics: 'Each team shall consist of 25 mixed players.\nStart with 5 balls, 5 min duration per match.\nTeam with most remaining players wins at time expiration.\nHit by ball = elimination.\nStepping out of bounds = elimination.\nCatching opponent thrown ball = thrower eliminated + 1 teammate rejoins.',
      criteria: [
          { name: 'Players Remaining', description: 'Count of players left at the end of match', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'cit7', name: 'Larong Lahi: Tug of War', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: '10 male, 10 female (separate rounds)', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Open Field',
      description: 'A test of strength where two teams pull on opposite ends of a rope.',
      mechanics: '10 males and 10 females (separate categories).\nThe male category will have 2 rounds with a different set of players in the 2nd round.\nTeams pull until the red flag crosses the line of the stronger team.',
      criteria: [
        { name: 'Match Wins', description: 'Winning the designated rounds', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'cit8', name: 'Larong Lahi: Ag-Agtoo', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: '10 male, 10 female', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Open Field',
      description: 'A traditional relay race involving baskets.',
      mechanics: '10 males and 10 females (separate categories).\n4 baskets (1 basket per team).\nThe first team to finish the required task will be declared the winner.',
      criteria: [
        { name: 'Time Finished', description: 'Ranked by order of finishing the task', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'cit9', name: 'Solo Singing', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: '1 participant', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Stage Area',
      description: 'Individual vocal competition.',
      mechanics: 'Performance must be live; lip-syncing is strictly prohibited.\nMale and female participants compete in a single category.\nPerformers may use either a minus-one track or a live instrument.',
      criteria: [
        { name: 'Vocal Quality', description: 'Clarity, tone, pitch accuracy, diction, and overall vocal control', points: 50 },
        { name: 'Musicality & Interpretation', description: 'Expression, phrasing, timing, rhythm, and emotional connection', points: 30 },
        { name: 'Stage Presence', description: 'Confidence, audience connection, and charisma', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'cit10', name: 'Duet Singing', category: EventCategory.CIT_QUEST, officerInCharge: 'Yesha', participantsInfo: '2 participants (any combination)', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Stage Area',
      description: 'Vocal duet competition highlighting harmony and chemistry.',
      mechanics: 'Performance must be live; lip-syncing is strictly prohibited.\nDuos may consist of any partner combination.\nMay use minus-one or live instrument.',
      criteria: [
        { name: 'Vocal Quality & Synchronization', description: 'Clarity, tone, pitch, and blending of voices', points: 50 },
        { name: 'Musicality & Interpretation', description: 'Creativity, expression, delivery, and emotional depth', points: 30 },
        { name: 'Stage Presence', description: 'Confidence, coordination, and chemistry between partners', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },

    // MindScape
    { id: 'ms1', name: 'Essay Writing (English)', category: EventCategory.MINDSCAPE, officerInCharge: 'Lryn', participantsInfo: '1 participant', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Classroom A',
      description: 'Essay writing competition in English.',
      mechanics: 'Length: 600–1000 words. Entries below or beyond the limit may receive point deductions.\nOriginality: Must be the participant’s own work; proper citation required.\nPlagiarism: Must not exceed 20% similarity.',
      criteria: [
        { name: 'Content & Relevance', description: 'Accuracy, depth, and quality of information presented', points: 40 },
        { name: 'Originality', description: 'Creativity, uniqueness, and innovative approach', points: 40 },
        { name: 'Organization', description: 'Structure, flow, and logical arrangement of ideas', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'ms2', name: 'Essay Writing (Filipino)', category: EventCategory.MINDSCAPE, officerInCharge: 'Lryn', participantsInfo: '1 participant', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Classroom A',
      description: 'Essay writing competition in Filipino.',
      mechanics: 'Length: 600–1000 words.\nOriginality: Must be participant’s own work.\nPlagiarism: Must not exceed 20% similarity.',
      criteria: [
        { name: 'Content & Relevance', description: 'Accuracy, depth, and quality of information', points: 40 },
        { name: 'Originality', description: 'Creativity, uniqueness, and innovative approach', points: 40 },
        { name: 'Organization', description: 'Structure, flow, and logical arrangement', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'ms3', name: 'Debate', category: EventCategory.MINDSCAPE, officerInCharge: 'Lryn', participantsInfo: '3 participants per team', date: new Date(Date.now() + 86400000 * 5).toISOString(), venue: 'Audio Visual Room',
      description: 'Oxford-Oregano style debate on IT topics.',
      mechanics: '3 speakers per team (Proposition vs Opposition).\nSpeakers: 5 mins each. Rebuttals: 2 mins.\nWarning bell at 4 mins.\nNo electronic devices allowed during the debate.\nFocus on quality of argumentation.',
      criteria: [
        { name: 'Content and Argumentation', description: 'Strength, clarity, depth, and evidence of arguments', points: 40 },
        { name: 'Rebuttals and Refutations', description: 'Effectiveness in addressing and dismantling opposing arguments', points: 30 },
        { name: 'Team Coordination and Strategy', description: 'Unified case and smooth transitions between speakers', points: 15 },
        { name: 'Delivery and Persuasion', description: 'Confidence, eloquence, and persuasive delivery', points: 15 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },
    { id: 'ms4', name: 'Impromptu Speech', category: EventCategory.MINDSCAPE, officerInCharge: 'Lryn', participantsInfo: '1 participant', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Stage Area',
      description: 'On-the-spot speech delivery.',
      mechanics: '1 participant per unit.\n1 minute prep time, 3 minutes speech maximum.\nTopics drawn randomly.\nNo notes or devices allowed.',
      criteria: [
        { name: 'Content', description: 'Substance, accuracy, depth, meaningfulness, and relevance', points: 40 },
        { name: 'Coherence', description: 'Logical flow, clarity, organization, and unity of ideas', points: 30 },
        { name: 'Delivery', description: 'Confidence, voice projection, expression, and audience engagement', points: 30 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'ms5', name: 'Extemporaneous Speech', category: EventCategory.MINDSCAPE, officerInCharge: 'Lryn', participantsInfo: '1 participant', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Stage Area',
      description: 'Speech delivery with limited preparation time on current issues.',
      mechanics: '1 participant per unit.\n5 mins prep time, 3 mins speech maximum.\nTopics: current/relevant social issues.\nBrief notes allowed during prep but not reading directly.',
      criteria: [
        { name: 'Content', description: 'Substance, accuracy, depth, meaningfulness, and relevance', points: 40 },
        { name: 'Coherence', description: 'Logical flow, clarity, organization, and unity of ideas', points: 30 },
        { name: 'Delivery', description: 'Confidence, voice projection, expression, and engagement', points: 30 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'ms6', name: 'Math Quiz', category: EventCategory.MINDSCAPE, officerInCharge: 'Lryn', participantsInfo: '4 members per unit', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Hall B',
      description: 'Math competition consisting of individual and team rounds covering computation, logic, and IT applications.',
      mechanics: '4 members per unit.\nIndividual and team rounds.\nQuestions: computation, logic, IT-related math.\nNo calculators allowed unless specified.\nTie-breaker: sudden-death round.',
      criteria: [
        { name: 'Quiz Score', description: 'Total combined points from individual and team rounds', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'ms7', name: 'Hackathon', category: EventCategory.MINDSCAPE, officerInCharge: 'Lryn', participantsInfo: '3 representatives', date: new Date(Date.now() + 86400000 * 1).toISOString(), venue: 'Computer Lab 1',
      description: 'Brainstorming session to ideate IT solutions for real-world problems.',
      mechanics: '3 representatives per unit.\nDevelop original IT solution (idea, planning, prototype, presentation).\n5 minutes pitch deck presentation using PowerPoint.',
      criteria: [
        { name: 'Originality and Creativity', description: 'Uniqueness of idea and innovative solution', points: 40 },
        { name: 'Project Planning and Feasibility', description: 'Clarity, realism, and feasibility of the plan', points: 30 },
        { name: 'Technical Implementation and Prototype', description: 'Quality of implementation and prototype representation', points: 20 },
        { name: 'Presentation and Communication', description: 'Effective communication, confidence, clarity, and professionalism', points: 10 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },

    // Hoop & Spike
    { id: 'hs1', name: 'Basketball (Men)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '12 players', date: new Date(Date.now() + 86400000 * 1).toISOString(), venue: 'Court A',
      description: 'Full court basketball competition.',
      mechanics: 'Double-elimination bracket.\nFollows standard basketball rules.\n12 players per team.\nFouls, delays, or unsportsmanlike conduct may result in deductions.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'hs2', name: 'Basketball (Women)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '12 players', date: new Date(Date.now() + 86400000 * 1).toISOString(), venue: 'Court A',
      description: 'Full court basketball competition.',
      mechanics: 'Double-elimination bracket.\nFollows standard basketball rules.\n12 players (plus substitutes).\nFouls, delays, or unsportsmanlike conduct may result in deductions.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'hs3', name: 'Volleyball (Men)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '12 players', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Volleyball Court',
      description: 'Standard volleyball tournament.',
      mechanics: '12 players per team.\nMatches follow official volleyball rules (rally point scoring).\nUnsportsmanlike conduct results in penalties.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'hs4', name: 'Volleyball (Women)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '12 players', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Volleyball Court',
      description: 'Standard volleyball tournament.',
      mechanics: '12 players per team.\nMatches follow official volleyball rules (rally point scoring).\nUnsportsmanlike conduct results in penalties.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
    { id: 'hs5', name: 'Badminton (Men\'s Singles)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '1 player', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Gymnasium Side B',
      description: 'Singles badminton tournament.',
      mechanics: '1 player per unit.\nBest-of-three (3) games format.\n21-point rally scoring.\nPlayers bring their own rackets, shuttlecocks provided.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'hs6', name: 'Badminton (Women\'s Singles)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '1 player', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Gymnasium Side B',
      description: 'Singles badminton tournament.',
      mechanics: '1 player per unit.\nBest-of-three (3) games format.\n21-point rally scoring.\nPlayers bring their own rackets, shuttlecocks provided.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'hs7', name: 'Badminton (Mixed Doubles)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '1 pair per team', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Gymnasium Side B',
      description: 'Mixed doubles badminton tournament.',
      mechanics: '1 pair per unit.\nBest-of-three (3) games format.\n21-point rally scoring.\nPlayers bring their own rackets, shuttlecocks provided.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },
    { id: 'hs8', name: 'Table Tennis (Men\'s Singles)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '1 player', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Table Tennis Hall',
      description: 'Singles table tennis tournament.',
      mechanics: '1 player per unit.\nBest-of-five (5) sets (11-point system).\nStandard ITTF rules apply.\nPlayers bring their own paddles.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'hs9', name: 'Table Tennis (Women\'s Singles)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '1 player', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Table Tennis Hall',
      description: 'Singles table tennis tournament.',
      mechanics: '1 player per unit.\nBest-of-five (5) sets (11-point system).\nStandard ITTF rules apply.\nPlayers bring their own paddles.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'hs10', name: 'Table Tennis (Mixed Doubles)', category: EventCategory.HOOP_SPIKE, officerInCharge: 'Joshua and Jericho', participantsInfo: '1 pair per team', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Table Tennis Hall',
      description: 'Mixed doubles table tennis tournament.',
      mechanics: '1 pair per unit.\nBest-of-five (5) sets (11-point system).\nStandard ITTF rules apply.\nPlayers bring their own paddles.',
      criteria: [
        { name: 'Match Results', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },

    // Coding & Tech
    { id: 'ct1', name: 'Programming', category: EventCategory.CODING_TECH_CHALLENGES, officerInCharge: 'Lorenz and Foncee', participantsInfo: '4 representatives', date: new Date(Date.now() + 86400000 * 1).toISOString(), venue: 'Computer Lab 2',
      description: 'Coding competition to solve problem sets.',
      mechanics: '4 representatives per unit (different year levels).\nProblem set provided on-site.\n3 hours to complete.\nJudged by correctness and efficiency (number of problems solved).\nTie-breaker: sum of elapsed times of correct submissions.',
      criteria: [
        { name: 'Problems Solved Correctly', description: 'Score based on number of completed tasks and time', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },
    { id: 'ct2', name: 'Find the Bug', category: EventCategory.CODING_TECH_CHALLENGES, officerInCharge: 'Lorenz and Foncee', participantsInfo: '4 representatives', date: new Date(Date.now() + 86400000 * 1).toISOString(), venue: 'Computer Lab 2',
      description: 'Debugging competition using Notepad++.',
      mechanics: '4 representatives per unit.\nFind and fix bugs in pre-written code using Notepad++.\nMost corrected bugs within time wins.',
      criteria: [
        { name: 'Bugs Fixed', description: 'Number of successfully identified and corrected bugs', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },
    { id: 'ct3', name: 'Web Design', category: EventCategory.CODING_TECH_CHALLENGES, officerInCharge: 'Lorenz and Foncee', participantsInfo: '4 representatives', date: new Date(Date.now() + 86400000 * 1).toISOString(), venue: 'Computer Lab 1',
      description: 'Web design competition with a specific task provided on-site.',
      mechanics: '4 representatives per unit.\n4 hours to complete task.\nAllowed: HTML, CSS, JS, Bootstrap, Tailwind, AIs etc.\nMust stop after time limit.',
      criteria: [
        { name: 'Relevance', description: 'Relevance to the assigned task', points: 40 },
        { name: 'Design', description: 'Visual aesthetics and layout', points: 30 },
        { name: 'Creativity', description: 'Originality and innovation in design', points: 20 },
        { name: 'Functionality', description: 'Working features and usability', points: 10 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },
    { id: 'ct4', name: 'Monkey Type', category: EventCategory.CODING_TECH_CHALLENGES, officerInCharge: 'Lorenz and Foncee', participantsInfo: '1 representative', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Computer Lab 3',
      description: 'Typing speed and accuracy test.',
      mechanics: '1 representative per unit.\nDouble elimination bracket.\n5-minute rounds.\nHighest score based on WPM and accuracy proceeds.',
      criteria: [
        { name: 'Typing Speed (WPM)', description: 'Words Per Minute correctly typed', points: 50 },
        { name: 'Accuracy', description: 'Percentage of correctly typed words', points: 40 },
        { name: 'Consistency and Focus', description: 'Steady pace and minimal mistakes/backspacing', points: 10 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'ct5', name: 'PC Building', category: EventCategory.CODING_TECH_CHALLENGES, officerInCharge: 'Lorenz and Foncee', participantsInfo: '2 participants (tag team)', date: new Date(Date.now() + 86400000 * 2).toISOString(), venue: 'Hardware Lab',
      description: 'Disassemble and reassemble a PC within time.',
      mechanics: '2 participants tag team.\nDisassemble and reassemble within time.',
      criteria: [
        { name: 'Accuracy', description: 'Correctness and precision of actions', points: 50 },
        { name: 'Speed', description: 'Time taken to complete task', points: 30 },
        { name: 'Teamwork', description: 'Coordination and collaboration', points: 20 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },

    // Pixel Play
    { id: 'pp1', name: 'Video Making', category: EventCategory.PIXEL_PLAY, officerInCharge: 'Sean & Kyle Nieto', participantsInfo: '3-4 members from same unit', date: new Date(Date.now() + 86400000 * 7).toISOString(), venue: 'Online Submission',
      description: 'Short video promoting the team theme "Why Choose IT?".',
      mechanics: '3-4 members.\nDuration: 3-5 mins.\nMobile phones only for filming.\nEditing tools allowed.\nAI-generated content prohibited.\nMust be original, filmed at school whenever possible.\nTheme: "Why Choose IT?".\nSubmit .MP4/.MOV before ceremony.',
      criteria: [
        { name: 'Creativity', description: 'Originality, artistic expression, and innovative approach', points: 30 },
        { name: 'Technical Quality', description: 'Execution, editing flow, camera work, and visual excellence', points: 30 },
        { name: 'Message', description: 'Clarity and effectiveness of communicating the theme', points: 30 },
        { name: 'Overall Impact', description: 'Emotional appeal and memorability', points: 10 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'pp2', name: 'Infographics', category: EventCategory.PIXEL_PLAY, officerInCharge: 'Sean & Kyle Nieto', participantsInfo: '1 representative', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Computer Lab A',
      description: 'Design an infographic on "Why Choose IT?".',
      mechanics: '1 representative.\nDimensions: 1080x1920 (9:16).\nUse Adobe Photoshop, Illustrator, Canva etc.\nSubmit raw file and PNG + Rationale Form.\nMust be done on-site.',
      criteria: [
        { name: 'Relevance to the Prompt', description: 'Effective addressing of the theme', points: 40 },
        { name: 'Design and Visual Impact', description: 'Overall quality, appeal, and layout', points: 30 },
        { name: 'Creativity', description: 'Originality and innovation', points: 20 },
        { name: 'Clarity and Organization', description: 'Clear communication and structured content', points: 10 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'pp3', name: 'Traditional Poster Making', category: EventCategory.PIXEL_PLAY, officerInCharge: 'Sean & Kyle Nieto', participantsInfo: '1 representative', date: new Date(Date.now() + 86400000 * 3).toISOString(), venue: 'Art Room',
      description: 'Poster making on "IT in Culture" using traditional medium.',
      mechanics: '1 representative.\n¼ illustration board (provided).\nBring own materials (any medium).\nCreated on-site only.\nTheme: "IT in Culture".',
      criteria: [
        { name: 'Relevance to the Prompt', description: 'Effective addressing of the theme', points: 40 },
        { name: 'Design and Visual Impact', description: 'Overall design, appeal, and layout', points: 30 },
        { name: 'Creativity', description: 'Originality and innovative use of materials', points: 20 },
        { name: 'Clarity and Organization', description: 'Clarity of message and arrangement of elements', points: 10 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'pp4', name: 'Hotspot Havoc', category: EventCategory.PIXEL_PLAY, officerInCharge: 'Sean & Kyle Nieto', participantsInfo: '5 players per team', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Student Lounge',
      description: 'Offline mobile multiplayer tournament (Mini Militia, BombSquad, Special Forces Group 2).',
      mechanics: '5 players per team.\nRound-robin format.\n1 representative per match.\nGames: Mini Militia, BombSquad, Special Forces Group 2.',
      criteria: [
        { name: 'Placement Points', description: 'Total points accumulated from match placements (1st: 100, 2nd: 80, 3rd: 60, 4th: 40)', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1500, judges: [], results: [] },
      
    // Table Masters
    { id: 'tm1', name: 'Games of the Generals', category: EventCategory.TABLE_MASTERS, officerInCharge: 'Jeverlyn, Israel', participantsInfo: '1 male, 1 female per team', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Table Games Area',
      description: 'Strategic board game involving military ranks.',
      mechanics: 'Double-elimination format.\n1 male, 1 female per team.\n15 minutes per game.\nStandard rules apply.\nWin by capturing flag or challenging flag with higher/correct piece.',
      criteria: [
        { name: 'Match Result', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'tm2', name: 'Chess', category: EventCategory.TABLE_MASTERS, officerInCharge: 'Jeverlyn, Israel', participantsInfo: '1 male, 1 female per team', date: new Date(Date.now() + 86400000 * 4).toISOString(), venue: 'Table Games Area',
      description: 'Standard chess tournament.',
      mechanics: '1 male, 1 female per team.\nDouble-elimination format.\n30 mins per player.\nTouch-move rule.\nWin by checkmate, resignation, or time (points based).',
      criteria: [
        { name: 'Match Result', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'tm3', name: 'Scrabble', category: EventCategory.TABLE_MASTERS, officerInCharge: 'Jeverlyn, Israel', participantsInfo: '2 contestants', date: new Date(Date.now() + 86400000 * 5).toISOString(), venue: 'Table Games Area',
      description: 'Word game tournament.',
      mechanics: '2 contestants per unit.\nDouble-elimination scheme.\nSpecific rules on-site.',
      criteria: [
        { name: 'Match Result', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'tm4', name: 'Darts (Singles)', category: EventCategory.TABLE_MASTERS, officerInCharge: 'Jeverlyn, Israel', participantsInfo: 'Individual', date: new Date(Date.now() + 86400000 * 5).toISOString(), venue: 'Darts Area',
      description: '501 format darts tournament.',
      mechanics: 'Individual participant.\nDouble elimination (if 8+ players) or single elimination.\nBest-of-3 legs, 501 format.\nMust finish on double or bullseye.',
      criteria: [
        { name: 'Match Result', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1000, judges: [], results: [] },
    { id: 'tm5', name: 'Darts (Doubles)', category: EventCategory.TABLE_MASTERS, officerInCharge: 'Jeverlyn, Israel', participantsInfo: '2 players', date: new Date(Date.now() + 86400000 * 5).toISOString(), venue: 'Darts Area',
      description: '501 format team darts.',
      mechanics: '2 players per team.\nDouble elimination (4-8 teams).\nBest-of-5 legs, 501 format.\nAlternating turns.',
      criteria: [
        { name: 'Match Result', description: 'Bracket Progression', points: 100 }
      ],
      status: EventStatus.UPCOMING, competitionPoints: 1200, judges: [], results: [] },
];

// Helper to reload mock events (ensure criteria exists)
const resetMockEvents = () => {
    // Ensure other mock events have empty results array
    return MOCK_EVENTS.map(e => ({ ...e, results: e.results || [] }));
}
MOCK_EVENTS = resetMockEvents();

// In-memory store initialized from local storage or defaults
const getStoredData = <T>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
};

const setStoredData = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize mock data state
let usersStore = getStoredData<{ [id: string]: User }>(STORAGE_KEY_USERS, INITIAL_MOCK_USERS);
usersStore = { ...INITIAL_MOCK_USERS, ...usersStore }; // Merge ensure specific admins exist
setStoredData(STORAGE_KEY_USERS, usersStore);

let leaderboardStore = getStoredData<Team[]>(STORAGE_KEY_TEAMS, MOCK_LEADERBOARD);
// Always force load the mock events to override stale localStorage data
let eventsStore = getStoredData<Event[]>(STORAGE_KEY_EVENTS, MOCK_EVENTS);
let notificationStore = getStoredData<AppNotification[]>(STORAGE_KEY_NOTIFICATIONS, []);

// IMPORTANT: Reset stores if they don't have new fields to avoid crashes during dev
if (leaderboardStore.length > 0 && !leaderboardStore[0].progressHistory) {
    localStorage.removeItem(STORAGE_KEY_TEAMS);
    leaderboardStore = MOCK_LEADERBOARD;
    setStoredData(STORAGE_KEY_TEAMS, leaderboardStore);
}
// FORCE RESET EVENTS regardless of length to ensure updated content exists
// This uses the new key STORAGE_KEY_EVENTS defined at the top
if (eventsStore.length < MOCK_EVENTS.length) {
    eventsStore = MOCK_EVENTS;
    setStoredData(STORAGE_KEY_EVENTS, eventsStore);
}

// Internal helper to broadcast notification
const broadcastNotification = (title: string, message: string, link: string, type: AppNotification['type']) => {
    const newNotification: AppNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title,
        message,
        timestamp: new Date().toISOString(),
        link,
        type
    };
    notificationStore.unshift(newNotification);
    // Limit to last 50
    if (notificationStore.length > 50) {
        notificationStore = notificationStore.slice(0, 50);
    }
    setStoredData(STORAGE_KEY_NOTIFICATIONS, notificationStore);
    return newNotification;
}

// --- MOCK API IMPLEMENTATION ---
const mockApi = {
  login: (email: string, pass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = Object.values(usersStore).find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            if (user.password === pass) {
                resolve(user);
            } else {
                reject(new Error('Invalid credentials'));
            }
        } else {
            reject(new Error('User not found'));
        }
      }, 500);
    });
  },
  loginWithGoogle: (googleData: { email: string; firstName: string; lastName: string; avatar?: string }): Promise<{ user: User, isNew: boolean }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingUser = Object.values(usersStore).find(u => u.email.toLowerCase() === googleData.email.toLowerCase());
            if (existingUser) {
                resolve({ user: existingUser, isNew: false });
            } else {
                const partialUser: User = {
                    id: `google_user_${Date.now()}`,
                    email: googleData.email,
                    firstName: googleData.firstName,
                    lastName: googleData.lastName,
                    name: `${googleData.firstName} ${googleData.lastName}`,
                    role: UserRole.USER,
                    avatar: googleData.avatar || 'https://picsum.photos/seed/google/200',
                };
                resolve({ user: partialUser, isNew: true });
            }
        }, 300);
    });
  },
  completeUserProfile: (userData: User): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // The user from Google sign-in is partial and doesn't exist in the store yet.
            // We add/update them now with the completed data.
            usersStore[userData.id] = userData;
            setStoredData(STORAGE_KEY_USERS, usersStore);
            resolve(userData);
        }, 500);
    });
  },
  register: (userData: Partial<User>): Promise<User> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
             const existingUser = Object.values(usersStore).find(u => u.email.toLowerCase() === (userData.email || '').toLowerCase());
             if (existingUser) {
                 reject(new Error('Email already exists'));
                 return;
             }
             const newUser: User = {
                 id: `user_${Date.now()}`,
                 name: `${userData.firstName} ${userData.lastName}`,
                 role: UserRole.USER,
                 avatar: 'https://via.placeholder.com/150',
                 ...userData,
             } as User;
             usersStore[newUser.id] = newUser;
             setStoredData(STORAGE_KEY_USERS, usersStore);
             
             // Notify about new user
             broadcastNotification(
                 'New Registration',
                 `${newUser.name} just joined SIMS!`,
                 `/profile`, // No direct link to other profile yet
                 'info'
             );
             
             resolve(newUser);
          }, 500);
      });
  },
  getUsers: (): Promise<User[]> => Promise.resolve(Object.values(usersStore)),
  getLeaderboard: (): Promise<Team[]> => {
      // Calculate dynamic player counts
      const updatedLeaderboard = leaderboardStore.map(team => ({
          ...team,
          playersCount: Object.values(usersStore).filter(u => u.teamId === team.id).length
      }));
      return Promise.resolve(updatedLeaderboard);
  },
  getEvents: (): Promise<Event[]> => Promise.resolve(eventsStore),
  getNotifications: (): Promise<AppNotification[]> => {
      return Promise.resolve([...notificationStore]);
  },
  addEvent: (eventData: Partial<Event>): Promise<Event> => {
    const newEvent: Event = {
      id: `evt_${Date.now()}`,
      venue: 'TBD',
      judges: [],
      results: [],
      ...eventData,
    } as Event;
    eventsStore.push(newEvent);
    setStoredData(STORAGE_KEY_EVENTS, eventsStore);
    
    // Notify
    broadcastNotification(
        'New Event Created',
        `Event "${newEvent.name}" has been added to the schedule.`,
        `/events?eventId=${newEvent.id}`,
        'success'
    );
    
    return Promise.resolve(newEvent);
  },
  updateEvent: (eventData: Event): Promise<Event> => {
    const index = eventsStore.findIndex(e => e.id === eventData.id);
    if (index > -1) {
      eventsStore[index] = { ...eventsStore[index], ...eventData };
      setStoredData(STORAGE_KEY_EVENTS, eventsStore);
      
      broadcastNotification(
        'Event Updated',
        `Details for "${eventData.name}" have been changed.`,
        `/events?eventId=${eventData.id}`,
        'info'
      );
      
      return Promise.resolve(eventsStore[index]);
    }
    return Promise.reject(new Error("Event not found"));
  },
  deleteEvent: (eventId: string): Promise<void> => {
    const index = eventsStore.findIndex(e => e.id === eventId);
    if (index > -1) {
      const deletedName = eventsStore[index].name;
      eventsStore.splice(index, 1);
      setStoredData(STORAGE_KEY_EVENTS, eventsStore);
      
      broadcastNotification(
        'Event Cancelled',
        `Event "${deletedName}" has been removed.`,
        `/events`,
        'warning'
      );
      
      return Promise.resolve();
    }
    return Promise.reject(new Error("Event not found"));
  },
  updateUserRole: (userId: string, role: UserRole): Promise<User> => {
      const user = Object.values(usersStore).find(u => u.id === userId);
      if (user) {
          const oldRole = user.role;
          user.role = role;
          usersStore[user.id] = user;
          setStoredData(STORAGE_KEY_USERS, usersStore);
          
          broadcastNotification(
            'Role Updated',
            `${user.name} has been promoted from ${oldRole} to ${role}.`,
            '/admin',
            'info'
          );
          
          return Promise.resolve(user);
      }
      return Promise.reject(new Error("User not found"));
  },
  updateEventResults: (eventId: string, results: EventResult[]): Promise<Event> => {
      const eventIdx = eventsStore.findIndex(e => e.id === eventId);
      if (eventIdx === -1) return Promise.reject(new Error("Event not found"));

      const event = eventsStore[eventIdx];
      event.results = results;
      event.status = EventStatus.COMPLETED; // Mark completed once results are added
      
      // Calculate placement points
      // 1. Calculate raw scores
      const teamRawScores = results.map(res => {
          const rawScore = Object.values(res.criteriaScores).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
          
          // Calculate merit/demerit totals from arrays
          const totalMerits = res.merits?.reduce((sum: number, m) => sum + (Number(m.points) || 0), 0) || 0;
          const totalDemerits = res.demerits?.reduce((sum: number, d) => sum + (Number(d.points) || 0), 0) || 0;
          
          const totalRaw = rawScore + totalMerits - totalDemerits;
          return { teamId: res.teamId, rawScore: totalRaw, breakdown: res, totalMerits, totalDemerits };
      });
      
      // 2. Sort descending
      teamRawScores.sort((a, b) => b.rawScore - a.rawScore);
      
      // 3. Assign ranks and placement multipliers (100%, 80%, 64%, 51.2%)
      const multipliers = [1, 0.8, 0.64, 0.512];
      const updatedTeams = [...leaderboardStore];

      teamRawScores.forEach((item, index) => {
          const teamIdx = updatedTeams.findIndex(t => t.id === item.teamId);
          if (teamIdx > -1) {
              const rank = index + 1;
              const multiplier = multipliers[index] || 0.1; // Fallback for >4th
              const compPoints = Math.round(event.competitionPoints * multiplier);
              
              // Find existing scores to remove from total
              let team = updatedTeams[teamIdx];
              const existingEventScores = team.eventScores?.filter(es => es.eventId !== event.id) || [];
              
              // Create new event score entry
              const newEventScore = {
                  eventId: event.id,
                  eventName: event.name,
                  placement: rank,
                  competitionPoints: compPoints,
                  rawScore: item.rawScore,
                  scores: event.criteria.map(crit => ({
                      criteria: crit.name,
                      score: item.breakdown.criteriaScores[crit.name] || 0,
                      maxScore: crit.points
                  })),
                  meritAdjustment: item.totalMerits,
                  demeritAdjustment: item.totalDemerits,
                  merits: item.breakdown.merits || [],
                  demerits: item.breakdown.demerits || []
              };
              
              team.eventScores = [...existingEventScores, newEventScore];
              
              // Add global merit/demerit logs for adjustments from this event
              if (item.breakdown.merits) {
                  const newMerits = item.breakdown.merits.map(m => ({
                      id: Date.now().toString() + Math.random(),
                      points: m.points,
                      reason: `${m.name} (Event: ${event.name})`,
                      updatedBy: 'System',
                      timestamp: m.timestamp || new Date().toISOString()
                  }));
                  team.merits = [...(team.merits || []), ...newMerits];
              }
              if (item.breakdown.demerits) {
                  const newDemerits = item.breakdown.demerits.map(d => ({
                      id: Date.now().toString() + Math.random(),
                      points: d.points,
                      reason: `${d.name} (Event: ${event.name})`,
                      updatedBy: 'System',
                      timestamp: d.timestamp || new Date().toISOString()
                  }));
                  team.demerits = [...(team.demerits || []), ...newDemerits];
              }

              // Recalculate total score
              const totalEventPoints = team.eventScores.reduce((sum: number, s) => sum + s.competitionPoints, 0);
              const totalMerits = team.merits?.reduce((sum: number, m) => sum + m.points, 0) || 0;
              const totalDemerits = team.demerits?.reduce((sum: number, d) => sum + d.points, 0) || 0;
              team.score = totalEventPoints + totalMerits - totalDemerits;
              
              // Update placement stats
              const placementKey = rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : 'fourth';
              if (team.placementStats && placementKey in team.placementStats) {
                  // Simple increment, need more robust if edit happens again. Reset and recalc is better.
                  const newStats = { first: 0, second: 0, third: 0, fourth: 0, merits: 0, demerits: 0 };
                  team.eventScores.forEach(es => {
                     if (es.placement === 1) newStats.first++;
                     else if (es.placement === 2) newStats.second++;
                     else if (es.placement === 3) newStats.third++;
                     else if (es.placement === 4) newStats.fourth++;
                  });
                  newStats.merits = team.merits?.length || 0;
                  newStats.demerits = team.demerits?.length || 0;
                  team.placementStats = newStats;
              }

              // Update history
              const todayStr = new Date().toISOString().split('T')[0];
              const existingHistIdx = team.progressHistory?.findIndex(ph => ph.date === todayStr) ?? -1;
              const newProgress = [...(team.progressHistory || [])];
              if (existingHistIdx > -1) {
                  newProgress[existingHistIdx] = { date: todayStr, score: team.score };
              } else {
                  newProgress.push({ date: todayStr, score: team.score });
              }
              team.progressHistory = newProgress;
              team.scoreHistory = [...(team.scoreHistory || []), team.score].slice(-2);

              updatedTeams[teamIdx] = team;
          }
      });
      
      // Rerank teams
      updatedTeams.sort((a, b) => b.score - a.score);
      updatedTeams.forEach((t, i) => t.rank = i + 1);
      
      leaderboardStore = updatedTeams;
      setStoredData(STORAGE_KEY_TEAMS, leaderboardStore);
      
      eventsStore[eventIdx] = event;
      setStoredData(STORAGE_KEY_EVENTS, eventsStore);
      
      // Notify everyone
      broadcastNotification(
          'Scores Updated!',
          `Results for "${event.name}" are in! Check the leaderboard for new standings.`,
          `/leaderboard?view=records`,
          'success'
      );
      
      return Promise.resolve(event);
  },
  getTeamUsers: (teamId: string): Promise<User[]> => {
    const teamUsers = Object.values(usersStore).filter(user => user.teamId === teamId);
    return Promise.resolve(teamUsers);
  }
};

export const getMockUser = (role: UserRole) => {
    // find first user with role
    return Object.values(usersStore).find(u => u.role === role) || Object.values(usersStore)[0];
}

// --- API HELPERS ---
// This is for the real API, which is currently unused because API_BASE is '/mock'
const apiFetch = async <T,>(endpoint: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    // FIX: Safely parse error messages from API responses.
    // The original code could throw an error if the response body was not valid JSON or did not contain a 'message' property.
    let errorMessage = `API error: ${response.statusText}`;
    try {
        const errorData: unknown = await response.json();
        if (
            typeof errorData === 'object' &&
            errorData !== null &&
            'message' in errorData &&
            typeof (errorData as {message: unknown}).message === 'string'
        ) {
            errorMessage = (errorData as {message: string}).message;
        }
    } catch {
        // Body is not JSON or is empty, stick with statusText as the error.
    }
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null as T;
  }
  return response.json();
};

// --- EXPORTED API FUNCTIONS ---

export const login = async (email: string, pass: string): Promise<User> => {
  if (API_BASE === '/mock') {
    return mockApi.login(email, pass);
  }
  const { user, token } = await apiFetch<{ token: string; user: User }>('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password: pass }),
  });
  if (token) {
      localStorage.setItem('token', token);
  }
  return user;
};

export const loginWithGoogle = async (googleData: { email: string; firstName: string; lastName: string; avatar?: string }): Promise<{ user: User, isNew: boolean }> => {
    if (API_BASE === '/mock') {
        return mockApi.loginWithGoogle(googleData);
    }
    // Real API implementation would go here
    throw new Error("Google login not implemented for real API yet.");
}

export const completeUserProfile = async (userData: User): Promise<User> => {
    if (API_BASE === '/mock') {
        return mockApi.completeUserProfile(userData);
    }
    // Real API implementation would go here
    throw new Error("Profile completion not implemented for real API yet.");
}

export const register = async (userData: Partial<User>): Promise<User> => {
    if (API_BASE === '/mock') {
        return mockApi.register(userData);
    }
    const { user, token } = await apiFetch<{ token: string; user: User }>('/auth/register.php', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
    if (token) {
        localStorage.setItem('token', token);
    }
    return user;
}

export const getUsers = async (): Promise<User[]> => {
    if (API_BASE === '/mock') {
        return mockApi.getUsers();
    }
    return apiFetch<User[]>('/users.php');
}

export const updateUserRole = async (userId: string, role: UserRole): Promise<User> => {
    if (API_BASE === '/mock') {
        return mockApi.updateUserRole(userId, role);
    }
    return apiFetch<User>(`/users.php?id=${userId}`, { method: 'PUT', body: JSON.stringify({ role }) });
}

export const getLeaderboard = async (): Promise<Team[]> => {
    if (API_BASE === '/mock') {
        return mockApi.getLeaderboard();
    }
    return apiFetch<Team[]>('/leaderboard.php');
}

export const getEvents = async (): Promise<Event[]> => {
    if (API_BASE === '/mock') {
        return mockApi.getEvents();
    }
    return apiFetch<Event[]>('/events.php');
}

export const addEvent = async (eventData: Partial<Event>): Promise<Event> => {
    if (API_BASE === '/mock') {
        return mockApi.addEvent(eventData);
    }
    return apiFetch<Event>('/events.php', { method: 'POST', body: JSON.stringify(eventData) });
}

export const updateEvent = async (eventData: Event): Promise<Event> => {
    if (API_BASE === '/mock') {
        return mockApi.updateEvent(eventData);
    }
    return apiFetch<Event>(`/events.php?id=${eventData.id}`, { method: 'PUT', body: JSON.stringify(eventData) });
}

export const deleteEvent = async (eventId: string): Promise<void> => {
    if (API_BASE === '/mock') {
        return mockApi.deleteEvent(eventId);
    }
    return apiFetch<void>(`/events.php?id=${eventId}`, { method: 'DELETE' });
}

export const updateEventResults = async (eventId: string, results: EventResult[]): Promise<Event> => {
    if (API_BASE === '/mock') {
        return mockApi.updateEventResults(eventId, results);
    }
    return apiFetch<Event>(`/events.php?id=${eventId}&action=results`, { method: 'PUT', body: JSON.stringify({ results }) });
}

export const submitReport = async (reportData: any): Promise<void> => {
    if (API_BASE === '/mock') {
        console.log("Mock Report submitted:", reportData);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
    await apiFetch<void>('/reports.php', { method: 'POST', body: JSON.stringify(reportData) });
}

export const getTeamUsers = async (teamId: string): Promise<User[]> => {
  if (API_BASE === '/mock') {
    return mockApi.getTeamUsers(teamId);
  }
  return apiFetch<User[]>(`/teams.php?id=${teamId}&action=users`);
};

export const getNotifications = async (): Promise<AppNotification[]> => {
    if (API_BASE === '/mock') {
        return mockApi.getNotifications();
    }
    return apiFetch<AppNotification[]>('/notifications.php');
}
