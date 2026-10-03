// In-memory fallback and persistent data store for AI Notice Action Assistant
// Guarantees zero crashes even without MongoDB Atlas credentials

const initialUsers = [
  {
    _id: 'usr_demo_student_01',
    name: 'Aarav Sharma',
    email: 'student@noticeassistant.edu',
    password: '$2a$10$Ew5K/7UYiMQE9/dLQoH9KuHDe4DXx/RaG/7sjblryU08MEcBOyQPW', // 'password123'
    role: 'student',
    preferredLanguage: 'English',
    contactDetails: {
      phone: '+91 98765 43210',
      organization: 'National Institute of Technology'
    },
    notificationPreferences: {
      inApp: true,
      email: true,
      reminderDaysBefore: 3
    },
    mfaEnabled: false,
    createdAt: new Date().toISOString()
  }
];

const initialNotices = [
  {
    _id: '65f1a1000000000000000001',
    notice_id: 'NTC-UNIV-2026',
    user: 'usr_demo_student_01',
    title: 'Semester End Examination Form Submission & Fee Payment Notification (Nov-Dec 2026)',
    sender: 'Office of the Controller of Examinations, State University',
    originalText: `OFFICIAL NOTIFICATION - STATE UNIVERSITY
CIRCULAR NO: EXAM/2026/894
Date: 28th September 2026

SUBJECT: REGISTRATION FOR 6TH AND 8TH SEMESTER REGULAR & BACKLOG EXAMINATIONS

All eligible candidates enrolled in B.Tech, M.Tech, and MCA programs are hereby informed that the examination registration portal for November-December 2026 examinations is now open.

Key Guidelines and Requirements:
1. Online portal submission must be completed before October 15, 2026 without late fee.
2. A late fee of Rs. 1,000 will be levied for submissions made between October 16 and October 20, 2026. Absolutely no forms will be entertained after 5:00 PM on October 20, 2026.
3. Students must achieve minimum 75% attendance in all theory and laboratory courses. Students having attendance between 65%-74% must submit medical certificate with medical fitness attested by a registered medical practitioner.
4. Mandatory documents to upload:
   - Valid Student ID Card photocopy
   - Fee clearance receipt from Accounts section
   - Previous semester grade sheet
5. Failure to complete registration will forfeit the candidate's right to appear in the examination, resulting in a semester loss.`,
    language: 'English',
    summary: {
      plainSummary: 'Mandatory semester examination registration for 6th and 8th semester B.Tech/M.Tech/MCA students. Must complete form submission and fee payment online before October 15 without penalty, or with a Rs. 1,000 fine by October 20.',
      purpose: 'End-semester examination form registration and clearance fee collection.',
      keyPoints: [
        'Deadline without late fee: October 15, 2026',
        'Deadline with Rs. 1000 late fee: October 20, 2026 (5:00 PM strict cutoff)',
        '75% attendance mandatory; 65-74% requires valid medical certificate',
        'Upload Student ID, Accounts Fee receipt, and previous semester grade sheet'
      ],
      consequences: 'Failure to register results in forfeiture of examination seat and a full semester loss.',
      summaryHindi: 'बी.टेक/एम.टेक 6ठे और 8वें सेमेस्टर की परीक्षा फॉर्म भरने की अधिसूचना। 15 अक्टूबर 2026 तक बिना विलंब शुल्क जमा करें। 16 से 20 अक्टूबर तक ₹1000 विलंब शुल्क लगेगा। 75% उपस्थिति अनिवार्य है।',
      summaryTelugu: '6వ మరియు 8వ సెమిస్టర్ పరీక్షల దరఖాస్తు నోటిఫికేషన్. అక్టోబర్ 15, 2026 లోపు ఫీజు చెల్లించాలి. ఆలస్య ఫీజు ₹1000 తో అక్టోబర్ 20 లోపు చివరి అవకాశం. కనీసం 75% హాజరు ఉండాలి.'
    },
    actions: [
      {
        _id: 'act_101',
        text: 'Obtain Fee Clearance Receipt from Accounts Section (Counter 4)',
        deadline: '2026-10-12',
        priority: 'High',
        status: 'Completed',
        documentRequired: 'College Fee Challan',
        notes: 'Cleared on 29th Sep'
      },
      {
        _id: 'act_102',
        text: 'Submit Online Exam Form on university student portal',
        deadline: '2026-10-15',
        priority: 'High',
        status: 'In Progress',
        documentRequired: 'Online Application Slip',
        notes: 'Filled half, waiting for subject electives confirmation'
      },
      {
        _id: 'act_103',
        text: 'Upload previous semester grade sheet and Student ID proof',
        deadline: '2026-10-15',
        priority: 'Medium',
        status: 'Pending',
        documentRequired: 'Grade Card Copy + ID Card',
        notes: 'Scan in PDF format under 500KB'
      },
      {
        _id: 'act_104',
        text: 'Submit hardcopy printout signed by HOD to Examination Cell',
        deadline: '2026-10-18',
        priority: 'Medium',
        status: 'Pending',
        documentRequired: 'HOD Attested Form',
        notes: 'Room 204 Admin Block'
      }
    ],
    deadlines: [
      { title: 'Normal Registration Cutoff', date: '2026-10-15', time: '11:59 PM', isUrgent: true },
      { title: 'Late Fee Cutoff (Rs. 1,000 fine)', date: '2026-10-20', time: '05:00 PM', isUrgent: false },
      { title: 'HOD Physical Form Submission', date: '2026-10-18', time: '04:00 PM', isUrgent: false }
    ],
    documents_required: [
      { name: 'Student Identity Card', mandatory: true, notes: 'Self-attested front and back copy' },
      { name: 'Accounts Clearance Receipt', mandatory: true, notes: 'Signed by finance officer' },
      { name: 'Previous Semester Grade Card', mandatory: true, notes: 'Original or DigiLocker verified PDF' },
      { name: 'Medical Certificate (if attendance < 75%)', mandatory: false, notes: 'From registered doctor' }
    ],
    eligibility: [
      'Enrolled in 6th or 8th semester B.Tech / M.Tech / MCA',
      'Minimum 75% aggregate class & laboratory attendance',
      'No pending dues in university library or hostel'
    ],
    priority: 'High',
    status: 'In Progress',
    sourceType: 'pasted_text',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    _id: '65f1a1000000000000000002',
    notice_id: 'NTC-SCHOLAR-551',
    user: 'usr_demo_student_01',
    title: 'State Merit-cum-Means Post-Matric Scholarship Physical Verification Notice',
    sender: 'Directorate of Higher Education & Welfare Board',
    originalText: `DIRECTORATE OF HIGHER EDUCATION & WELFARE BOARD
CIRCULAR ID: SW/SCHOLARSHIP/2026/V4
Date: 26th September 2026

Sub: Physical Document Verification for National/State Merit-cum-Means Scholarship 2026-27

Selected applicants whose online applications have been provisionally shortlisted must report for in-person biometric and physical document verification.

Verification Dates: October 8, 2026 to October 14, 2026 (10:00 AM to 4:00 PM).
Venue: District Welfare Office / Designated College Helpdesk.

Required Originals and Two Photocopies:
1. Valid Income Certificate issued by Revenue Tahsildar (Valid for FY 2025-26, income under 2.5 LPA)
2. Caste/Community Certificate (wherever applicable)
3. Aadhaar Card linked to active bank account with NPCI mapping
4. Current Academic Year College Fee Receipt and Bonafide Certificate
5. Class 10th and 12th Marks Cards

Warning: Candidates failing to undergo verification within the prescribed window will be permanently disqualified and the scholarship amount will be reallocated.`,
    language: 'English',
    summary: {
      plainSummary: 'Mandatory in-person document and biometric verification for students shortlisted for the State Merit-cum-Means Scholarship. Must visit the designated office between Oct 8 and Oct 14 with original income certificate, Aadhaar, and bonafide.',
      purpose: 'Physical verification and biometric authentication for scholarship release.',
      keyPoints: [
        'Verification window: October 8 to October 14, 2026',
        'Venue: District Welfare Office or College Helpdesk',
        'Must carry original income certificate (<2.5 LPA) and caste certificate',
        'Bank account must be Aadhaar seeded with active NPCI mapping'
      ],
      consequences: 'Non-attendance results in permanent scholarship disqualification and forfeiture of funds.',
      summaryHindi: 'राज्य छात्रवृत्ति के लिए व्यक्तिगत दस्तावेज सत्यापन 8 अक्टूबर से 14 अक्टूबर 2026 तक। मूल आय प्रमाण पत्र (2.5 लाख से कम) और आधार लिंक बैंक खाता आवश्यक है। अनुपस्थित रहने पर छात्रवृत्ति रद्द कर दी जाएगी।',
      summaryTelugu: 'మెరిట్ స్కాలర్‌షిప్ కొరకు అక్టోబర్ 8 నుండి 14 వరకు ఒరిజినల్ సర్టిఫికెట్ల పరిశీలన. ఆదాయ ధృవీకరణ పత్రం మరియు ఆధార్ లింక్ అయిన బ్యాంక్ ఖాతా అవసరం. హాజరు కాకపోతే స్కాలర్‌షిప్ రద్దు అవుతుంది.'
    },
    actions: [
      {
        _id: 'act_201',
        text: 'Check Bank Account NPCI Aadhaar Seeding status on UIDAI portal',
        deadline: '2026-10-06',
        priority: 'High',
        status: 'Pending',
        documentRequired: 'Aadhaar Bank Link Status Printout',
        notes: 'Verify on resident.uidai.gov.in'
      },
      {
        _id: 'act_202',
        text: 'Collect Bonafide Certificate from College Academic Registrar',
        deadline: '2026-10-07',
        priority: 'High',
        status: 'Pending',
        documentRequired: 'College Bonafide Certificate',
        notes: 'Submitted application to counter 2'
      },
      {
        _id: 'act_203',
        text: 'Attend Physical Verification at District Welfare Helpdesk',
        deadline: '2026-10-10',
        priority: 'High',
        status: 'Pending',
        documentRequired: 'Original Documents Portfolio',
        notes: 'Go early morning to avoid rush'
      }
    ],
    deadlines: [
      { title: 'Biometric Verification Starts', date: '2026-10-08', time: '10:00 AM', isUrgent: false },
      { title: 'Final Verification Cutoff', date: '2026-10-14', time: '04:00 PM', isUrgent: true }
    ],
    documents_required: [
      { name: 'Income Certificate (FY 2025-26)', mandatory: true, notes: 'Annual income < 2.5 LPA by Tahsildar' },
      { name: 'Aadhaar Card (Linked with Bank)', mandatory: true, notes: 'NPCI mapped' },
      { name: 'Bonafide Certificate', mandatory: true, notes: 'Signed by College Principal' },
      { name: '10th & 12th Marks Cards', mandatory: true, notes: 'Originals + 2 self-attested xerox' }
    ],
    eligibility: [
      'Annual parental income not exceeding ₹2,50,000',
      'No disciplinary action on university record',
      'Regular full-time enrolled student'
    ],
    priority: 'High',
    status: 'Pending',
    sourceType: 'pdf_upload',
    fileName: 'Scholarship_Physical_Verification_Notice.pdf',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    _id: '65f1a1000000000000000003',
    notice_id: 'NTC-CIVIC-882',
    user: 'usr_demo_student_01',
    title: 'Municipal Property Assessment & Clean Water Rebate Renewal Circular',
    sender: 'Municipal Corporation, Revenue & Water Works Division',
    originalText: `MUNICIPAL REVENUE & URBAN WATER BOARD
NOTIFICATION REF: MC/REV-WAT/2026/09
Date: 20th September 2026

Subject: Property Tax Early Bird Rebate & Meter Inspection Confirmation

All residential property holders and tenants are reminded that:
1. The 5% Early Bird Rebate on annual municipal property tax expires on October 31, 2026.
2. Digital payment can be executed through the municipal citizen portal or designated bank branches.
3. Meter inspection teams will visit residential sectors from October 22 to October 28. Ensure water meter accessibility.
4. Failure to settle arrears prior to November 15, 2026 will incur a penal interest of 1.5% per month and potential service disconnection.`,
    language: 'English',
    summary: {
      plainSummary: 'Notice from Municipal Water & Tax department regarding the 5% Early Bird tax rebate expiring October 31, 2026, and upcoming meter inspections between Oct 22 and Oct 28.',
      purpose: 'Municipal tax collection and water meter inspection schedule.',
      keyPoints: [
        '5% early bird rebate valid until October 31, 2026',
        'Digital payment available on citizen portal',
        'Physical meter inspections: October 22 to October 28',
        '1.5% monthly penal interest applies after November 15'
      ],
      consequences: 'Penal interest of 1.5% per month and risk of municipal water disconnection.',
      summaryHindi: 'नगर निगम संपत्ति कर पर 5% की छूट 31 अक्टूबर तक उपलब्ध है। 22 से 28 अक्टूबर के बीच जल मीटर का निरीक्षण होगा। 15 नवंबर के बाद 1.5% प्रति माह जुर्माना लगेगा।',
      summaryTelugu: 'మునిసిపల్ ఆస్తి పన్ను 5% తగ్గింపు అక్టోబర్ 31 వరకు వర్తిస్తుంది. అక్టోబర్ 22 నుండి 28 వరకు వాటర్ మీటర్ల తనిఖీ జరుగుతుంది. నవంబర్ 15 తర్వాత 1.5% జరిమానా విధించబడుతుంది.'
    },
    actions: [
      {
        _id: 'act_301',
        text: 'Review online property tax calculation and apply early bird 5% discount',
        deadline: '2026-10-31',
        priority: 'Low',
        status: 'Completed',
        documentRequired: 'Property Assessment ID',
        notes: 'Tax paid online via UPI'
      },
      {
        _id: 'act_302',
        text: 'Ensure clear physical access to the residential water meter box',
        deadline: '2026-10-22',
        priority: 'Medium',
        status: 'Pending',
        documentRequired: 'Previous Water Bill',
        notes: 'Inspect seal'
      }
    ],
    deadlines: [
      { title: '5% Early Bird Discount Deadline', date: '2026-10-31', time: '11:59 PM', isUrgent: false },
      { title: 'Water Meter Field Inspection', date: '2026-10-22', time: '09:00 AM', isUrgent: false }
    ],
    documents_required: [
      { name: 'Property Tax Assessment Assessment Number', mandatory: true, notes: 'PID on previous receipt' },
      { name: 'Last Quarter Water Meter Receipt', mandatory: false, notes: 'Keep handy for inspection team' }
    ],
    eligibility: ['Registered property owners and authorized tenants'],
    priority: 'Low',
    status: 'In Progress',
    sourceType: 'pasted_text',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  }
];

const initialChatMessages = [
  {
    _id: 'chat_01',
    notice: '65f1a1000000000000000001',
    role: 'User',
    text: 'What is the absolute last date to submit the exam form if I am willing to pay the late fee?',
    language: 'English',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'chat_02',
    notice: '65f1a1000000000000000001',
    role: 'AI',
    text: 'As per Circular No: EXAM/2026/894, the absolute last date with a late fee of Rs. 1,000 is **October 20, 2026 at 5:00 PM**. The circular explicitly states that no forms will be accepted under any circumstances after this cutoff time.',
    language: 'English',
    createdAt: new Date(Date.now() - 3550000).toISOString()
  }
];

const initialDrafts = [
  {
    _id: 'drf_01',
    notice: '65f1a1000000000000000001',
    user: 'usr_demo_student_01',
    draftType: 'application',
    tone: 'formal',
    language: 'English',
    recipient: 'The Controller of Examinations, State University',
    subject: 'Application for Submission of Semester End Exam Form (Nov-Dec 2026) with Fee Clearance',
    bodyContent: `To,
The Controller of Examinations,
State University

Subject: Application for End Semester Examination Form Submission (Ref: EXAM/2026/894)

Respected Sir/Madam,

I am writing to formally submit my examination registration for the upcoming 6th Semester B.Tech examinations (Nov-Dec 2026).

I have completed the online form registration prior to the October 15, 2026 deadline. As mandated in the circular, I have attached:
1. Duly signed fee clearance receipt from the Accounts section.
2. Verified copy of my Student ID Card.
3. Grade sheets of the previous academic semester.

My overall attendance stands above the mandatory 75% threshold. I kindly request you to approve my registration and issue my examination admit card.

Thanking you.

Yours sincerely,
Aarav Sharma
Roll No: 2023BT049
Branch: Computer Science & Engineering`,
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const initialReminders = [
  {
    _id: 'rem_01',
    notice: '65f1a1000000000000000001',
    actionItemText: 'Submit Online Exam Form on university student portal',
    deadline: '2026-10-15',
    reminderDate: new Date('2026-10-13T09:00:00.000Z'),
    deliveryChannel: 'in-app',
    status: 'active',
    snoozedCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'rem_02',
    notice: '65f1a1000000000000000002',
    actionItemText: 'Collect Bonafide Certificate from College Academic Registrar',
    deadline: '2026-10-07',
    reminderDate: new Date('2026-10-05T10:00:00.000Z'),
    deliveryChannel: 'in-app',
    status: 'active',
    snoozedCount: 1,
    createdAt: new Date().toISOString()
  }
];

class MemoryStore {
  constructor() {
    this.users = [...initialUsers];
    this.notices = [...initialNotices];
    this.chatMessages = [...initialChatMessages];
    this.drafts = [...initialDrafts];
    this.reminders = [...initialReminders];
  }

  // Users
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  createUser(userData) {
    const newUser = {
      _id: 'usr_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      role: 'student',
      preferredLanguage: 'English',
      notificationPreferences: { inApp: true, email: true, reminderDaysBefore: 2 },
      mfaEnabled: false,
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const index = this.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  // Notices
  getAllNotices(userId = null) {
    if (userId) {
      return this.notices.filter(n => !n.user || n.user === userId || n.user._id === userId);
    }
    return this.notices;
  }

  getNoticeById(id) {
    return this.notices.find(n => n._id === id || n.notice_id === id);
  }

  createNotice(noticeData) {
    const newNotice = {
      _id: 'ntc_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      notice_id: 'NTC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      status: 'Pending',
      priority: 'Medium',
      actions: [],
      deadlines: [],
      documents_required: [],
      eligibility: [],
      ...noticeData,
    };
    this.notices.unshift(newNotice);
    return newNotice;
  }

  updateNotice(id, updates) {
    const index = this.notices.findIndex(n => n._id === id || n.notice_id === id);
    if (index === -1) return null;
    this.notices[index] = { ...this.notices[index], ...updates };
    return this.notices[index];
  }

  deleteNotice(id) {
    const index = this.notices.findIndex(n => n._id === id || n.notice_id === id);
    if (index === -1) return false;
    this.notices.splice(index, 1);
    this.chatMessages = this.chatMessages.filter(c => c.notice !== id);
    this.drafts = this.drafts.filter(d => d.notice !== id);
    this.reminders = this.reminders.filter(r => r.notice !== id);
    return true;
  }

  // Action Items
  toggleActionItem(noticeId, actionId) {
    const notice = this.getNoticeById(noticeId);
    if (!notice) return null;
    const action = notice.actions.find(a => a._id === actionId);
    if (!action) return null;

    if (action.status === 'Completed') {
      action.status = 'Pending';
    } else {
      action.status = 'Completed';
    }

    // Update notice general status based on actions
    const allCompleted = notice.actions.length > 0 && notice.actions.every(a => a.status === 'Completed');
    const anyCompleted = notice.actions.some(a => a.status === 'Completed');
    if (allCompleted) notice.status = 'Completed';
    else if (anyCompleted) notice.status = 'In Progress';
    else notice.status = 'Pending';

    return { notice, action };
  }

  addActionItem(noticeId, actionData) {
    const notice = this.getNoticeById(noticeId);
    if (!notice) return null;
    const newAction = {
      _id: 'act_' + Date.now().toString(36),
      status: 'Pending',
      priority: 'Medium',
      ...actionData
    };
    notice.actions.push(newAction);
    return { notice, action: newAction };
  }

  deleteActionItem(noticeId, actionId) {
    const notice = this.getNoticeById(noticeId);
    if (!notice) return null;
    notice.actions = notice.actions.filter(a => a._id !== actionId);
    return notice;
  }

  // Chat
  getNoticeChat(noticeId) {
    return this.chatMessages.filter(c => c.notice === noticeId);
  }

  addChatMessage(noticeId, messageData) {
    const newMsg = {
      _id: 'msg_' + Date.now().toString(36),
      notice: noticeId,
      createdAt: new Date().toISOString(),
      ...messageData
    };
    this.chatMessages.push(newMsg);
    return newMsg;
  }

  // Drafts
  getDraftsByNotice(noticeId) {
    return this.drafts.filter(d => d.notice === noticeId);
  }

  createDraft(draftData) {
    const newDraft = {
      _id: 'drf_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      status: 'draft',
      ...draftData
    };
    this.drafts.unshift(newDraft);
    return newDraft;
  }

  // Reminders
  getReminders(userId = null) {
    return this.reminders;
  }

  updateReminderStatus(id, status, snoozeMinutes = 0) {
    const reminder = this.reminders.find(r => r._id === id);
    if (!reminder) return null;
    reminder.status = status;
    if (status === 'snoozed') {
      reminder.snoozedCount = (reminder.snoozedCount || 0) + 1;
      reminder.snoozedUntil = new Date(Date.now() + (snoozeMinutes || 60) * 60000).toISOString();
    }
    return reminder;
  }

  // Analytics
  getAnalytics(userId = null) {
    const notices = this.getAllNotices(userId);
    let totalActions = 0;
    let completedActions = 0;
    let pendingActions = 0;
    let overdueActions = 0;
    let highPriorityCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    notices.forEach(n => {
      if (n.priority === 'High') highPriorityCount++;
      (n.actions || []).forEach(a => {
        totalActions++;
        if (a.status === 'Completed') {
          completedActions++;
        } else {
          pendingActions++;
          if (a.deadline && a.deadline < todayStr) {
            overdueActions++;
          }
        }
      });
    });

    const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

    return {
      totalNotices: notices.length,
      totalActions,
      completedActions,
      pendingActions,
      overdueActions,
      highPriorityCount,
      completionRate,
      activeReminders: this.reminders.filter(r => r.status === 'active').length,
    };
  }
}

const memoryStore = new MemoryStore();

module.exports = {
  memoryStore,
};
