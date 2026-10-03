import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Send,
  Upload,
  Plus,
  Search,
  Filter,
  Sparkles,
  Languages,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Layers,
  BarChart3,
  MessageSquare,
  Mail,
  ChevronRight,
  RefreshCw,
  UserCheck,
  AlertCircle,
  X,
  FileCheck2,
  FileDown,
  Building,
  CalendarDays,
  CheckSquare,
  Square,
  LogOut,
  User
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { mockOcrExtract, analyzeNotice, answerNoticeQuestion, generateReplyDraft } from '../services/aiService';

// Default initial notices based on SRS and dataStore
const DEFAULT_NOTICES = [
  {
    _id: '65f1a1000000000000000001',
    notice_id: 'NTC-UNIV-2026',
    title: 'Semester End Examination Form Submission & Fee Payment Notification (Nov-Dec 2026)',
    sender: 'Office of the Controller of Examinations, State University',
    originalText: `OFFICIAL NOTIFICATION - STATE UNIVERSITY\nCIRCULAR NO: EXAM/2026/894\nDate: 28th September 2026\n\nSUBJECT: REGISTRATION FOR 6TH AND 8TH SEMESTER REGULAR & BACKLOG EXAMINATIONS\n\nAll eligible candidates enrolled in B.Tech, M.Tech, and MCA programs are hereby informed that the examination registration portal for November-December 2026 examinations is now open.\n\nKey Guidelines and Requirements:\n1. Online portal submission must be completed before October 15, 2026 without late fee.\n2. A late fee of Rs. 1,000 will be levied for submissions made between October 16 and October 20, 2026. Absolutely no forms will be entertained after 5:00 PM on October 20, 2026.\n3. Students must achieve minimum 75% attendance in all theory and laboratory courses. Students having attendance between 65%-74% must submit medical certificate with medical fitness attested by a registered medical practitioner.\n4. Mandatory documents to upload:\n   - Valid Student ID Card photocopy\n   - Fee clearance receipt from Accounts section\n   - Previous semester grade sheet\n5. Failure to complete registration will forfeit the candidate's right to appear in the examination, resulting in a semester loss.`,
    language: 'English',
    priority: 'High',
    status: 'In Progress',
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
    actions: [
      { _id: 'act_101', text: 'Obtain Fee Clearance Receipt from Accounts Section (Counter 4)', deadline: '2026-10-12', priority: 'High', status: 'Completed', documentRequired: 'College Fee Challan' },
      { _id: 'act_102', text: 'Submit Online Exam Form on university student portal', deadline: '2026-10-15', priority: 'High', status: 'Pending', documentRequired: 'Online Application Slip' },
      { _id: 'act_103', text: 'Upload previous semester grade sheet and Student ID proof', deadline: '2026-10-15', priority: 'Medium', status: 'Pending', documentRequired: 'Grade Card Copy + ID Card' },
      { _id: 'act_104', text: 'Submit hardcopy printout signed by HOD to Examination Cell', deadline: '2026-10-18', priority: 'Medium', status: 'Pending', documentRequired: 'HOD Attested Form' }
    ]
  },
  {
    _id: '65f1a1000000000000000002',
    notice_id: 'NTC-SCHOLAR-551',
    title: 'State Merit-cum-Means Post-Matric Scholarship Physical Verification Notice',
    sender: 'Directorate of Higher Education & Welfare Board',
    originalText: `DIRECTORATE OF HIGHER EDUCATION & WELFARE BOARD\nCIRCULAR ID: SW/SCHOLARSHIP/2026/V4\nDate: 26th September 2026\n\nSub: Physical Document Verification for National/State Merit-cum-Means Scholarship 2026-27\n\nSelected applicants whose online applications have been provisionally shortlisted must report for in-person biometric and physical document verification.\n\nVerification Window: October 8, 2026 to October 14, 2026 (10:00 AM to 4:00 PM).\nVenue: District Welfare Office / Designated College Helpdesk.\n\nRequired Documents:\n- Attested copy of Parental Annual Income Certificate issued by Revenue Authority (not exceeding ₹2.5 LPA).\n- Nationalized Bank passbook copy linked and seeded with NPCI / Aadhaar.\n- Bonafide Certificate issued by the Head of the Institution.\n- Recent passport size photographs.\n\nNote: Failure to attend physical verification will lead to permanent cancellation of the sanction order.`,
    language: 'English',
    priority: 'High',
    status: 'Pending',
    summary: {
      plainSummary: 'Mandatory physical verification and biometric authentication for shortlisted State Merit-cum-Means Scholarship applicants between Oct 8 and Oct 14, 2026. Bank account must be seeded with NPCI/Aadhaar.',
      purpose: 'Verification of authenticity of academic records and income proofs for scholarship disbursement.',
      keyPoints: [
        'Physical verification window: October 8 to October 14, 2026',
        'Reporting hours: 10:00 AM to 4:00 PM at Welfare Desk',
        'NPCI bank account seeding is mandatory for DBT credit',
        'Parental income must be certified below ₹2.5 Lakhs per annum'
      ],
      consequences: 'Failure to verify in-person forfeits the scholarship grant without right of appeal.',
      summaryHindi: 'छात्रवृत्ति भौतिक सत्यापन 8 से 14 अक्टूबर 2026 तक। बैंक खाते का आधार एवं एनपीसीआई से लिंक होना अनिवार्य है। अनुपस्थित रहने पर छात्रवृत्ति रद्द कर दी जाएगी।',
      summaryTelugu: 'పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ భౌతిక ధృవీకరణ అక్టోబర్ 8 నుండి 14 వరకు జరుగుతుంది. ఆధార్-NPCI లింక్ అయిన బ్యాంక్ పాస్‌బుక్ తప్పనిసరి. లేనిచో స్కాలర్‌షిప్ రద్దు అవుతుంది.'
    },
    deadlines: [
      { title: 'Physical Biometric Verification Window', date: '2026-10-14', time: '04:00 PM', isUrgent: true }
    ],
    documents_required: [
      { name: 'Income Certificate (Sub-Divisional Magistrate attested)', mandatory: true, notes: 'Income below ₹2.5 LPA' },
      { name: 'Aadhaar-NPCI Seeded Bank Passbook Copy', mandatory: true, notes: 'Direct Benefit Transfer compliant' },
      { name: 'Institutional Bonafide Certificate', mandatory: true, notes: 'Signed by Principal/Registrar' }
    ],
    actions: [
      { _id: 'act_201', text: 'Obtain Bonafide Certificate from College Academic Registrar', deadline: '2026-10-10', priority: 'High', status: 'Pending', documentRequired: 'Bonafide Certificate' },
      { _id: 'act_202', text: 'Verify NPCI mapping status at bank branch for DBT disbursement', deadline: '2026-10-11', priority: 'High', status: 'Pending', documentRequired: 'Bank Passbook & Aadhaar' },
      { _id: 'act_203', text: 'Attend in-person physical verification at District Welfare Desk', deadline: '2026-10-14', priority: 'High', status: 'Pending', documentRequired: 'All original certificates + 2 copies' }
    ]
  },
  {
    _id: '65f1a1000000000000000003',
    notice_id: 'NTC-HOSTEL-109',
    title: 'Campus Residence Hostel Room Re-Allotment & Mess Dues Clearance Circular',
    sender: 'Chief Warden & Housing Advisory Committee',
    originalText: `CHIEF WARDEN OFFICE - CAMPUS HOUSING BOARD\nNOTICE NO: HO/2026/ALLOT/22\nDate: 29th September 2026\n\nSUBJECT: HOSTEL VACATING, ROOM RE-ALLOTMENT AND MESS DUES CLEARANCE\n\nAll current hostel residents of Blocks A, B, and C are requested to note the following instructions regarding room re-allotment for the upcoming academic session:\n\n1. All pending mess charges and maintenance dues must be cleared online by October 22, 2026.\n2. Room inventory handover and room inspection sign-off must be completed with the block caretaker by October 25, 2026.\n3. Deposit receipt along with signed room clearance slip should be deposited at Warden Office before October 28, 2026.\n\nStudents failing to submit clearance will attract a fine of ₹50 per day and forfeiture of hostel security deposit.`,
    language: 'English',
    priority: 'Medium',
    status: 'Pending',
    summary: {
      plainSummary: 'Hostel room re-allotment directives requiring clearance of pending mess dues by Oct 22 and physical room inventory handover by Oct 25. Clearance slip due by Oct 28.',
      purpose: 'Hostel maintenance reconciliation and room re-allocation protocol.',
      keyPoints: [
        'Clear pending mess charges by October 22, 2026',
        'Room inspection handover with caretaker by October 25, 2026',
        'Submit clearance slip to Warden Office by October 28, 2026'
      ],
      consequences: '₹50 per day fine and potential loss of room allotment privilege for next semester.',
      summaryHindi: 'हॉस्टल मेस बकाया 22 अक्टूबर तक जमा करें तथा 25 अक्टूबर तक रूम इन्वेंट्री हैंडओवर पूरा करें। 28 अक्टूबर के बाद ₹50 प्रतिदिन जुर्माना लगेगा।',
      summaryTelugu: 'హాస్టల్ మెస్ బకాయిలు అక్టోబర్ 22 లోపు చెల్లించాలి. అక్టోబర్ 25 లోపు రూమ్ హ్యాండోవర్ చేయాలి. ఆలస్యమైతే రోజుకు ₹50 జరిమానా.'
    },
    deadlines: [
      { title: 'Mess Dues Online Payment', date: '2026-10-22', time: '11:59 PM', isUrgent: false },
      { title: 'Room Handover & Clearance Slip', date: '2026-10-28', time: '05:00 PM', isUrgent: false }
    ],
    documents_required: [
      { name: 'Mess Dues Payment Challan', mandatory: true, notes: 'Online bank payment copy' },
      { name: 'Hostel Caretaker Room Inventory Inspection Sheet', mandatory: true, notes: 'Signed by block supervisor' }
    ],
    actions: [
      { _id: 'act_301', text: 'Pay pending mess bill on hostel finance portal', deadline: '2026-10-22', priority: 'Medium', status: 'Pending', documentRequired: 'Online Payment Receipt' },
      { _id: 'act_302', text: 'Schedule caretaker room inventory audit', deadline: '2026-10-25', priority: 'Low', status: 'Pending', documentRequired: 'Inspection Sheet' },
      { _id: 'act_303', text: 'Submit final clearance sheet at Warden Counter', deadline: '2026-10-28', priority: 'Medium', status: 'Pending', documentRequired: 'Signed Clearance Form' }
    ]
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notices, setNotices] = useState(DEFAULT_NOTICES);
  const [activeNoticeId, setActiveNoticeId] = useState(DEFAULT_NOTICES[0]._id);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'notices' | 'actions' | 'analytics' | 'drafts' | 'chat'
  const [selectedLang, setSelectedLang] = useState('en'); // 'en' | 'hi' | 'te'
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true, engine: 'In-Memory Store' });
  const [copiedKey, setCopiedKey] = useState(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrFileName, setOcrFileName] = useState('');

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'AI',
      text: 'Hello! I am your AI Notice Action Assistant. Select any official notice, ask about cutoff dates, required documents, or ask me to translate details into Hindi or Telugu!'
    }
  ]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Draft Generator State
  const [draftType, setDraftType] = useState('reply');
  const [draftTone, setDraftTone] = useState('formal');
  const [draftLanguage, setDraftLanguage] = useState('English');
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [isDraftLoading, setIsDraftLoading] = useState(false);

  // New Custom Action Modal/State
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newActionText, setNewActionText] = useState('');
  const [newActionDeadline, setNewActionDeadline] = useState('');
  const [newActionPriority, setNewActionPriority] = useState('High');

  // Check Backend Connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get('/health');
        if (res.data && res.data.success) {
          setBackendStatus({ online: true, checking: false, engine: res.data.database || 'MongoDB Atlas / Engine' });
          // Load notices from server
          try {
            const noticesRes = await api.get('/notices');
            if (noticesRes.data && noticesRes.data.data && noticesRes.data.data.length > 0) {
              setNotices(noticesRes.data.data);
              setActiveNoticeId(noticesRes.data.data[0]._id);
            }
          } catch (e) {
            console.warn('Using local seed notices:', e.message);
          }
        }
      } catch (err) {
        setBackendStatus({ online: false, checking: false, engine: 'In-Memory Store (Autonomous Mode)' });
      }
    };
    checkBackend();
  }, []);

  const activeNotice = useMemo(() => {
    return notices.find((n) => n._id === activeNoticeId) || notices[0] || null;
  }, [notices, activeNoticeId]);

  // All action items flattened across notices
  const allActions = useMemo(() => {
    const list = [];
    notices.forEach((notice) => {
      if (notice.actions) {
        notice.actions.forEach((act) => {
          list.push({
            ...act,
            noticeId: notice._id,
            noticeTitle: notice.title,
            noticeSender: notice.sender
          });
        });
      }
    });
    return list;
  }, [notices]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalNotices = notices.length;
    const totalActions = allActions.length;
    const completedActions = allActions.filter((a) => a.status === 'Completed').length;
    const pendingActions = totalActions - completedActions;
    const complianceRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 100;
    const highPriorityCount = notices.filter((n) => n.priority === 'High').length;
    return { totalNotices, totalActions, completedActions, pendingActions, complianceRate, highPriorityCount };
  }, [notices, allActions]);

  // Toggle Action Status
  const handleToggleAction = async (noticeId, actionId) => {
    const notice = notices.find((n) => n._id === noticeId);
    if (!notice) return;
    const action = notice.actions?.find((a) => a._id === actionId);
    if (!action) return;

    const newStatus = action.status === 'Completed' ? 'Pending' : 'Completed';

    // Optimistic update
    setNotices((prev) =>
      prev.map((n) => {
        if (n._id !== noticeId) return n;
        return {
          ...n,
          actions: n.actions.map((act) => (act._id === actionId ? { ...act, status: newStatus } : act))
        };
      })
    );

    // Sync to backend if online
    if (backendStatus.online) {
      try {
        await api.patch(`/notices/${noticeId}/actions/${actionId}`, { status: newStatus });
      } catch (err) {
        console.warn('Backend action toggle sync error:', err.message);
      }
    }
  };

  // Add Custom Action to Notice
  const handleAddCustomAction = async (e) => {
    e.preventDefault();
    if (!newActionText.trim() || !activeNotice) return;

    const newAction = {
      _id: 'act_' + Date.now().toString(36),
      text: newActionText.trim(),
      deadline: newActionDeadline || 'Within 5 Days',
      priority: newActionPriority,
      status: 'Pending',
      documentRequired: 'Verification Record'
    };

    setNotices((prev) =>
      prev.map((n) => {
        if (n._id !== activeNotice._id) return n;
        return {
          ...n,
          actions: [...(n.actions || []), newAction]
        };
      })
    );

    if (backendStatus.online) {
      try {
        await api.post(`/notices/${activeNotice._id}/actions`, newAction);
      } catch (err) {
        console.warn('Backend custom action add sync error:', err.message);
      }
    }

    setNewActionText('');
    setNewActionDeadline('');
    setIsAddingAction(false);
  };

  // Handle OCR/Upload Notice Submission
  const handleProcessUpload = async () => {
    if (!uploadText.trim()) return;
    setIsAnalyzing(true);

    try {
      let analysisResult = null;

      if (backendStatus.online) {
        try {
          const res = await api.post('/notices', {
            title: uploadTitle.trim() || undefined,
            content: uploadText.trim(),
            sourceType: ocrFileName ? 'document_ocr' : 'pasted_text'
          });
          if (res.data && res.data.data) {
            analysisResult = res.data.data;
          }
        } catch (serverErr) {
          console.warn('Server notice upload fallback to local AI:', serverErr.message);
        }
      }

      if (!analysisResult) {
        // Local AI Analysis
        const localAnalyzed = await analyzeNotice(uploadText, uploadTitle);
        analysisResult = {
          _id: 'ntc_' + Date.now().toString(36),
          notice_id: 'NTC-CUSTOM-' + Math.floor(100 + Math.random() * 900),
          title: uploadTitle.trim() || localAnalyzed.title,
          sender: localAnalyzed.sender,
          originalText: uploadText,
          language: localAnalyzed.language,
          priority: localAnalyzed.priority,
          status: 'Pending',
          summary: localAnalyzed.summary,
          deadlines: localAnalyzed.deadlines,
          documents_required: localAnalyzed.documents_required,
          actions: localAnalyzed.actions,
          created_at: new Date().toISOString()
        };
      }

      setNotices((prev) => [analysisResult, ...prev]);
      setActiveNoticeId(analysisResult._id);
      setIsUploadOpen(false);
      setUploadTitle('');
      setUploadText('');
      setOcrFileName('');
      setActiveTab('notices');
    } catch (err) {
      alert('Error analyzing notice: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 1-Click Quick Demo Presets for Notice Ingestion
  const handleLoadDemoPreset = (presetType) => {
    if (presetType === 'exam') {
      setUploadTitle('Controller of Examinations - Backlog & Special Exam Notification');
      setUploadText(`OFFICIAL NOTIFICATION: STATE TECHNICAL BOARD\nREF: EXAM/2026/SP-901\nDate: 01 October 2026\n\nSUBJECT: SPECIAL RE-EVALUATION & SUPPLEMENTARY EXAM SUBMISSION\n\nAll final year students with pending backlogs are instructed to submit supplementary examination applications before October 24, 2026 (5:00 PM).\n- Examination Fee: Rs. 450 per subject.\n- Late fine of Rs. 500 applicable between Oct 25 and Oct 28.\n- Mandatory: Fee payment challan and verified grade sheet copy.\nFailure to register within the stipulated window will bar entry to campus placements.`);
    } else if (presetType === 'scholarship') {
      setUploadTitle('National Merit Fellowship - Aadhaar Biometric NPCI Mapping Circular');
      setUploadText(`CENTRAL MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT\nCIRCULAR: NMF/2026/DBT/VERIF\nDate: 30 September 2026\n\nSUBJECT: MANDATORY NPCI MAPPING FOR DIRECT BENEFIT DISBURSEMENT\n\nBeneficiaries awarded the National Merit Fellowship for 2026-27 must verify that their savings bank account is linked to NPCI mapper.\n1. Submit active bank seeding confirmation slip before October 18, 2026.\n2. Submit parent income certificate verified by revenue tehsildar.\n3. Institutional attendance report above 75% required.\nUnverified candidates will forfeit first semester installment.`);
    } else if (presetType === 'library') {
      setUploadTitle('Central University Library - Annual Clearance & Security Refund');
      setUploadText(`OFFICE OF THE CHIEF LIBRARIAN - CENTRAL UNIVERSITY\nCIRCULAR REF: LIB/2026/CLR-12\nDate: 01 October 2026\n\nSUBJECT: MANDATORY BOOK RETURN & NO-DUES CLEARANCE CERTIFICATE\n\nAll graduating scholars must return all borrowed library volumes and settle pending overdue fines before October 21, 2026.\n- Lost books must be replaced with latest edition or 2x cost paid.\n- Library No-Dues Certificate required for hall ticket release.\n- Clearance counter open 9:00 AM to 5:00 PM.`);
    }
  };

  // Handle OCR File Upload Simulation
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFileName(file.name);
    setIsAnalyzing(true);
    try {
      const extractedText = await mockOcrExtract(file);
      setUploadText(extractedText);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err) {
      alert('Error during simulated OCR: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle AI Chat Query
  const handleSendChat = async (questionText) => {
    const q = questionText || currentQuery;
    if (!q.trim() || !activeNotice) return;

    const userMessage = { role: 'User', text: q };
    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentQuery('');
    setIsChatLoading(true);

    try {
      let aiResponseText = '';
      if (backendStatus.online) {
        try {
          const res = await api.post(`/notices/${activeNotice._id}/chat`, {
            question: q,
            language: selectedLang === 'hi' ? 'Hindi' : selectedLang === 'te' ? 'Telugu' : 'English'
          });
          if (res.data && res.data.data && res.data.data.answer) {
            aiResponseText = res.data.data.answer.text;
          }
        } catch (e) {
          console.warn('Backend chat fallback to client AI:', e.message);
        }
      }

      if (!aiResponseText) {
        aiResponseText = await answerNoticeQuestion(
          activeNotice,
          q,
          selectedLang === 'hi' ? 'Hindi' : selectedLang === 'te' ? 'Telugu' : 'English'
        );
      }

      setChatMessages((prev) => [...prev, { role: 'AI', text: aiResponseText }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'AI', text: 'Apologies, I encountered an issue processing your query: ' + err.message }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle AI Reply Draft Generation
  const handleGenerateDraft = async () => {
    if (!activeNotice) return;
    setIsDraftLoading(true);

    try {
      let draftData = null;
      if (backendStatus.online) {
        try {
          const res = await api.post(`/notices/${activeNotice._id}/drafts/generate`, {
            draftType,
            tone: draftTone,
            language: draftLanguage
          });
          if (res.data && res.data.data) {
            draftData = res.data.data;
          }
        } catch (e) {
          console.warn('Backend draft fallback to client AI:', e.message);
        }
      }

      if (!draftData) {
        draftData = await generateReplyDraft({
          notice: activeNotice,
          user: user || { name: 'Aarav Sharma', contactDetails: { organization: 'National Institute of Technology' } },
          draftType,
          tone: draftTone,
          language: draftLanguage
        });
      }

      setGeneratedDraft(draftData);
    } catch (err) {
      alert('Error generating draft: ' + err.message);
    } finally {
      setIsDraftLoading(false);
    }
  };

  // Copy helper
  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Calendar Export Helper (Generates standard .ics file)
  const handleDownloadICS = (notice) => {
    const deadline = notice.deadlines?.[0];
    const eventTitle = `Deadline: ${notice.title}`;
    const description = `Compliance notice from ${notice.sender}. Plain Summary: ${notice.summary?.plainSummary || ''}`;
    const dateStr = deadline?.date || '2026-10-15';
    const cleanDate = dateStr.replace(/-/g, '').slice(0, 8);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Notice Action Assistant//EN',
      'BEGIN:VEVENT',
      `UID:${notice._id}@noticeassistant.edu`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART:${cleanDate}T090000Z`,
      `DTEND:${cleanDate}T170000Z`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${description}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${notice.notice_id || 'Notice'}_Deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter notices
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.sender.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPriority = priorityFilter === 'ALL' || n.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [notices, searchQuery, priorityFilter]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Left Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="h-20 px-5 flex items-center border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-sky-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <div className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-sky-400 via-indigo-200 to-white bg-clip-text text-transparent truncate">
              AI Notice Action Assistant
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Smart Notice Management</p>
          </div>
        </div>

        <div className="px-4 py-5 flex-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'notices', label: 'Notices', icon: FileText },
              { id: 'add', label: 'Add Notice', icon: Upload },
              { id: 'analysis', label: 'AI Analysis', icon: Sparkles },
              { id: 'actions', label: 'Action Tracker', icon: CheckSquare, badge: stats.pendingActions },
              { id: 'reminders', label: 'Reminders', icon: CalendarDays },
              { id: 'chat', label: 'Notice Chat', icon: MessageSquare },
              { id: 'history', label: 'History', icon: Clock },
            ].map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.id || (item.id === 'analysis' && activeTab === 'notices' && false);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'add') {
                      setIsUploadOpen(true);
                      setActiveTab('notices');
                    } else if (item.id === 'analysis') {
                      setActiveTab('analysis');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    selected
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="min-w-5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${backendStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'}`} />
              <span className="text-[11px] font-semibold text-slate-300">
                {backendStatus.online ? 'Backend Connected' : 'Engine Ready'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">{backendStatus.engine}</p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 p-[1px] flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-bold text-xs text-sky-400">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Aarav Sharma'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || 'student@noticeassistant.edu'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button onClick={() => setSelectedLang('en')} className={`flex-1 py-1 rounded text-[10px] ${selectedLang === 'en' ? 'bg-sky-600 text-white' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => setSelectedLang('hi')} className={`flex-1 py-1 rounded text-[10px] ${selectedLang === 'hi' ? 'bg-sky-600 text-white' : 'text-slate-500'}`}>हि</button>
              <button onClick={() => setSelectedLang('te')} className={`flex-1 py-1 rounded text-[10px] ${selectedLang === 'te' ? 'bg-sky-600 text-white' : 'text-slate-500'}`}>తె</button>
            </div>
            <button onClick={handleLogout} className="px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white truncate">AI Notice Action Assistant</span>
          </div>
          <button onClick={() => setIsUploadOpen(true)} className="p-2 rounded-lg bg-sky-600 text-white" title="Add Notice"><Upload className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {[
            ['dashboard','Dashboard',BarChart3], ['notices','Notices',FileText], ['analysis','AI Analysis',Sparkles],
            ['actions','Actions',CheckSquare], ['reminders','Reminders',CalendarDays], ['chat','Chat',MessageSquare], ['history','History',Clock]
          ].map(([id,label,Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] ${activeTab === id ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
      </header>

      {/* Sub-Header System Badge & User Profile Ribbon */}
      <section className="bg-slate-900/40 border-b border-slate-800/60 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${backendStatus.online ? 'bg-emerald-400 shadow-emerald-500/50 animate-ping' : 'bg-sky-400'}`} />
              <span className="font-medium text-slate-200">
                {backendStatus.online ? 'Backend Connected' : 'Engine Ready (Autonomous Mode)'}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{backendStatus.engine}</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-slate-300 font-medium">{user?.name || 'Aarav Sharma'}</span>
              <span className="text-slate-500 hidden sm:inline">({user?.organization || 'National Institute of Technology'})</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
              Compliance: {stats.complianceRate}%
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Notices</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{stats.totalNotices}</h3>
              <p className="text-[11px] text-sky-400 font-medium mt-0.5">Active Circulars</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Pending Actions</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{stats.pendingActions}</h3>
              <p className="text-[11px] text-amber-400 font-medium mt-0.5">Requires Attention</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">High Urgency</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{stats.highPriorityCount}</h3>
              <p className="text-[11px] text-rose-400 font-medium mt-0.5">Strict Penalties</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Compliance Rate</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{stats.complianceRate}%</h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">{stats.completedActions} of {stats.totalActions} Done</p>
            </div>
          </div>
        </section>

        {/* SCREEN: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
                <p className="text-sm text-slate-400 mt-1">Overview of notices, deadlines, actions and compliance.</p>
              </div>
              <button onClick={() => setIsUploadOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/20">
                <Upload className="w-4 h-4" /> Add Notice
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-white">Recent Notices</h2>
                    <p className="text-xs text-slate-500 mt-1">Latest official circulars in your workspace.</p>
                  </div>
                  <button onClick={() => setActiveTab('notices')} className="text-xs text-sky-400 hover:text-sky-300">View all</button>
                </div>
                <div className="space-y-3">
                  {notices.slice(0, 4).map((notice) => (
                    <button key={notice._id} onClick={() => { setActiveNoticeId(notice._id); setActiveTab('notices'); }} className="w-full text-left p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/30 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-100 truncate">{notice.title}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{notice.sender}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${notice.priority === 'High' ? 'bg-rose-500/10 text-rose-300' : 'bg-amber-500/10 text-amber-300'}`}>{notice.priority}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                <h2 className="text-lg font-bold text-white">Compliance</h2>
                <div className="relative w-40 h-40 mx-auto my-6 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="65" stroke="currentColor" strokeWidth="12" className="text-slate-800" fill="transparent" />
                    <circle cx="80" cy="80" r="65" stroke="currentColor" strokeWidth="12" strokeDasharray={408} strokeDashoffset={408 - (408 * stats.complianceRate) / 100} strokeLinecap="round" className="text-emerald-500" fill="transparent" />
                  </svg>
                  <div className="absolute text-center"><div className="text-3xl font-extrabold text-white">{stats.complianceRate}%</div><div className="text-[10px] text-emerald-400 uppercase font-bold">Complete</div></div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Completed</span><span className="text-white font-bold">{stats.completedActions}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Pending</span><span className="text-amber-300 font-bold">{stats.pendingActions}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">High priority</span><span className="text-rose-300 font-bold">{stats.highPriorityCount}</span></div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-4">Upcoming Deadlines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {notices.flatMap(n => (n.deadlines || []).map(d => ({...d, noticeTitle:n.title}))).slice(0,6).map((d, i) => (
                  <div key={`${d.noticeTitle}-${i}`} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                    <p className="text-xs font-semibold text-white">{d.label || d.title || 'Deadline'}</p>
                    <p className="text-[11px] text-sky-400 mt-1">{d.date || d.deadline || 'Date not specified'}</p>
                    <p className="text-[10px] text-slate-500 mt-2 truncate">{d.noticeTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: NOTICES & DEEP ANALYSIS */}
        {(activeTab === 'notices' || activeTab === 'analysis') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Notices Sidebar List */}
            <div className="lg:col-span-5 space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keyword, authority..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="High">High Urgency</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Notice Cards */}
              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {filteredNotices.map((notice) => {
                  const isActive = notice._id === activeNoticeId;
                  const completed = notice.actions?.filter((a) => a.status === 'Completed').length || 0;
                  const total = notice.actions?.length || 0;
                  const primaryDeadline = notice.deadlines?.[0];

                  return (
                    <div
                      key={notice._id}
                      onClick={() => setActiveNoticeId(notice._id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                        isActive
                          ? 'bg-slate-900/90 border-sky-500 shadow-lg shadow-sky-500/10'
                          : 'glass-card border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {notice.notice_id || 'NOTICE'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            notice.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : notice.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {notice.priority} Urgency
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-1.5">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center space-x-1 mb-3 line-clamp-1">
                        <Building className="w-3 h-3 text-slate-500 inline-block mr-1 flex-shrink-0" />
                        <span>{notice.sender}</span>
                      </p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                        <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-medium">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{primaryDeadline ? primaryDeadline.date : 'Upcoming'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Actions: <span className="text-slate-200 font-bold">{completed}/{total}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredNotices.length === 0 && (
                  <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-300 font-medium">No notices found</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting the search filter or ingest a new notice.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notice Deep Analysis & Action Center View */}
            <div className="lg:col-span-7">
              {activeNotice ? (
                <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 space-y-6">
                  {/* Header & Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs uppercase font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                          {activeNotice.notice_id || 'CIRCULAR'}
                        </span>
                        <span className="text-xs text-slate-400">
                          Language: <strong className="text-slate-200">{activeNotice.language || 'English'}</strong>
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                        {activeNotice.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1.5 flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>Issued by: <strong>{activeNotice.sender}</strong></span>
                      </p>
                    </div>

                    {/* Quick Tools */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleDownloadICS(activeNotice)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
                        title="Download standard .ics event"
                      >
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>.ICS Calendar</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('drafts');
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-xs font-medium text-indigo-200 border border-indigo-500/30 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Draft Reply</span>
                      </button>
                    </div>
                  </div>

                  {/* Multilingual AI Executive Summary */}
                  <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                          AI Executive Summary ({selectedLang === 'hi' ? 'हिन्दी' : selectedLang === 'te' ? 'తెలుగు' : 'English'})
                        </h4>
                      </div>
                      <div className="flex space-x-1 text-xs">
                        <button
                          onClick={() => setSelectedLang('en')}
                          className={`px-2 py-0.5 rounded text-[11px] ${selectedLang === 'en' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setSelectedLang('hi')}
                          className={`px-2 py-0.5 rounded text-[11px] ${selectedLang === 'hi' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          हिन्दी
                        </button>
                        <button
                          onClick={() => setSelectedLang('te')}
                          className={`px-2 py-0.5 rounded text-[11px] ${selectedLang === 'te' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          తెలుగు
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed">
                      {selectedLang === 'hi'
                        ? activeNotice.summary?.summaryHindi || activeNotice.summary?.plainSummary
                        : selectedLang === 'te'
                        ? activeNotice.summary?.summaryTelugu || activeNotice.summary?.plainSummary
                        : activeNotice.summary?.plainSummary || 'Standard circular summary parsed by AI assistant.'}
                    </p>

                    {/* Key Highlights bullet list */}
                    {activeNotice.summary?.keyPoints && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Mandates:</p>
                        {activeNotice.summary.keyPoints.map((kp, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                            <span>{kp}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Consequences / Penalty Warning Alert */}
                    {activeNotice.summary?.consequences && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-rose-200">Non-Compliance Consequence: </strong>
                          {activeNotice.summary.consequences}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deadlines & Key Dates Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Crucial Cutoff Deadlines</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Automated Reminders</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeNotice.deadlines?.map((d, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">{d.title}</p>
                            <p className="text-xs text-amber-400 font-semibold mt-1">{d.date} - {d.time || 'End of day'}</p>
                          </div>
                          {d.isUrgent && (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              Urgent
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory Documents Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center space-x-2">
                      <FileCheck2 className="w-4 h-4 text-sky-400" />
                      <span>Required Documents Checklist</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeNotice.documents_required?.map((doc, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="font-medium text-slate-200">{doc.name}</span>
                            {doc.notes && <p className="text-[11px] text-slate-400 mt-0.5">{doc.notes}</p>}
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              doc.mandatory ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {doc.mandatory ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Action Items Checklist */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>Interactive Action Items Checklist</span>
                      </h4>
                      <button
                        onClick={() => setIsAddingAction(true)}
                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activeNotice.actions?.map((act) => {
                        const isDone = act.status === 'Completed';
                        return (
                          <div
                            key={act._id}
                            onClick={() => handleToggleAction(activeNotice._id, act._id)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isDone
                                ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                              )}
                              <div>
                                <p
                                  className={`text-xs font-medium ${
                                    isDone ? 'line-through text-slate-500' : 'text-slate-200'
                                  }`}
                                >
                                  {act.text}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                                  <span>Deadline: <strong className="text-slate-300">{act.deadline}</strong></span>
                                  {act.documentRequired && <span>• Need: {act.documentRequired}</span>}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                act.priority === 'High'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : act.priority === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {act.priority}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Original Circular Collapsible Text */}
                  <details className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <summary className="text-slate-400 hover:text-slate-200 cursor-pointer font-medium py-1">
                      View Raw Circular Text (OCR Output)
                    </summary>
                    <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {activeNotice.originalText}
                    </div>
                  </details>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-12 text-slate-500">
                  Select a notice to view details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN: REMINDERS */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div><h1 className="text-2xl font-extrabold text-white">Reminders</h1><p className="text-sm text-slate-400 mt-1">Track upcoming notice deadlines and pending actions.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allActions.filter(a => a.status !== 'Completed').map((act) => (
                <div key={act._id || act.id} className="glass-panel rounded-2xl p-5 border border-slate-800">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{act.text || act.title || 'Pending action'}</p><p className="text-[11px] text-slate-500 mt-1">{act.deadline || 'Deadline not specified'}</p></div><Clock className="w-4 h-4 text-amber-400" /></div>
                </div>
              ))}
              {allActions.filter(a => a.status !== 'Completed').length === 0 && <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-sm text-slate-500 md:col-span-2">No pending reminders.</div>}
            </div>
          </div>
        )}

        {/* SCREEN: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div><h1 className="text-2xl font-extrabold text-white">History</h1><p className="text-sm text-slate-400 mt-1">Previously ingested notices and their current status.</p></div>
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="divide-y divide-slate-800">
                {notices.map((notice) => (
                  <button key={notice._id} onClick={() => { setActiveNoticeId(notice._id); setActiveTab('notices'); }} className="w-full p-5 text-left hover:bg-slate-900/70 transition-all flex items-center justify-between gap-4">
                    <div className="min-w-0"><p className="text-sm font-semibold text-white truncate">{notice.title}</p><p className="text-[11px] text-slate-500 mt-1">{notice.sender} • {notice.status || 'Processed'}</p></div>
                    <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTION TRACKER */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                    <span>Master Action Items Tracker</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage and complete all extracted procedural tasks across official university circulars.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total Progress</p>
                    <p className="text-base font-bold text-emerald-400">{stats.completedActions} / {stats.totalActions} Tasks</p>
                  </div>
                  <div className="w-24 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.complianceRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {allActions.map((act) => {
                  const isDone = act.status === 'Completed';
                  return (
                    <div
                      key={act._id}
                      onClick={() => handleToggleAction(act.noticeId, act._id)}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isDone
                          ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                          : 'glass-card border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-6 h-6 text-slate-500 flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {act.text}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                            <span className="text-sky-400 font-medium">Notice: {act.noticeTitle.slice(0, 45)}...</span>
                            <span>• Due: <strong className="text-amber-400">{act.deadline}</strong></span>
                            {act.documentRequired && <span>• Document: {act.documentRequired}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            act.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : act.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {act.priority}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isDone ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPLIANCE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Compliance Gauge Card */}
              <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col items-center text-center justify-center">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Overall Compliance Rating</h3>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * stats.complianceRate) / 100}
                      strokeLinecap="round"
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white">{stats.complianceRate}%</span>
                    <span className="text-[11px] text-emerald-400 font-semibold uppercase">Good Standing</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 max-w-xs">
                  {stats.complianceRate >= 75
                    ? 'Excellent! You are compliant with all critical institutional mandates and within safety thresholds.'
                    : 'Attention needed: Complete pending actions prior to late fee cutoffs to avoid forfeiture.'}
                </p>
              </div>

              {/* Priority Breakdown Card */}
              <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Notice Priority Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-rose-400 font-semibold">High Urgency Circulars</span>
                      <span className="text-white font-bold">{stats.highPriorityCount}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${stats.totalNotices ? (stats.highPriorityCount / stats.totalNotices) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-amber-400 font-semibold">Medium Urgency</span>
                      <span className="text-white font-bold">
                        {notices.filter((n) => n.priority === 'Medium').length}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${stats.totalNotices ? (notices.filter((n) => n.priority === 'Medium').length / stats.totalNotices) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400 font-semibold">Low Urgency (Informative)</span>
                      <span className="text-white font-bold">
                        {notices.filter((n) => n.priority === 'Low').length}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${stats.totalNotices ? (notices.filter((n) => n.priority === 'Low').length / stats.totalNotices) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  <p>Priority is dynamically computed using fine keywords, attendance criteria, and strict cutoff mandates.</p>
                </div>
              </div>

              {/* Upcoming Deadlines Radar */}
              <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Upcoming Cutoffs</span>
                </h3>

                <div className="space-y-3">
                  {notices.flatMap((n) => (n.deadlines || []).map((d) => ({ ...d, noticeTitle: n.title }))).slice(0, 4).map((d, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between">
                      <div className="text-xs">
                        <p className="font-semibold text-white">{d.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{d.noticeTitle}</p>
                      </div>
                      <span className="text-[11px] text-amber-400 font-bold flex-shrink-0 ml-2">
                        {d.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DRAFT GENERATOR */}
        {activeTab === 'drafts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>AI Formal Draft Generator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Automatically generate formal responses, submission cover letters, or extension applications addressed to the notice authority.
              </p>

              {/* Select Notice */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Regarding Notice</label>
                <select
                  value={activeNoticeId}
                  onChange={(e) => setActiveNoticeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {notices.map((n) => (
                    <option key={n._id} value={n._id}>
                      {n.title.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Draft Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Intent</label>
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="reply">Compliance Acknowledgment / Formal Reply</option>
                  <option value="application">Application for Document Submission</option>
                  <option value="request_letter">Request for Deadline Extension</option>
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone of Letter</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['formal', 'polite', 'urgent'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDraftTone(t)}
                      className={`py-2 rounded-xl border capitalize font-medium ${
                        draftTone === t
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Language</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['English', 'Hindi', 'Telugu'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setDraftLanguage(l)}
                      className={`py-2 rounded-xl border font-medium ${
                        draftLanguage === l
                          ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateDraft}
                disabled={isDraftLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isDraftLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Official Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Formal Draft</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              {generatedDraft ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-bold">Recipient Authority</p>
                      <p className="text-xs font-bold text-white">{generatedDraft.recipient}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyText(`${generatedDraft.subject}\n\n${generatedDraft.bodyContent}`, 'draft')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
                      >
                        {copiedKey === 'draft' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Letter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-900 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    <p className="font-bold text-sky-400 mb-3">Subject: {generatedDraft.subject}</p>
                    {generatedDraft.bodyContent}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Mail className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No Draft Generated Yet</p>
                  <p className="text-xs text-slate-600 max-w-sm mt-1">
                    Select a circular on the left and click "Generate Formal Draft" to create a submission letter or extension request.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AI CHAT ASSISTANT */}
        {activeTab === 'chat' && (
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 max-w-4xl mx-auto flex flex-col h-[700px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Notice Action AI Q&A</h3>
                  <p className="text-xs text-slate-400">
                    Active Context: <span className="text-sky-300 font-semibold">{activeNotice?.title.slice(0, 45)}...</span>
                  </p>
                </div>
              </div>

              {/* Notice Selector */}
              <select
                value={activeNoticeId}
                onChange={(e) => setActiveNoticeId(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                {notices.map((n) => (
                  <option key={n._id} value={n._id}>
                    {n.notice_id || 'Notice'}: {n.title.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Prompt Chips */}
            <div className="py-3 flex flex-wrap gap-2 border-b border-slate-800/60">
              {[
                'What is the last date to submit?',
                'Which documents are mandatory?',
                'Is there any late fee or penalty?',
                'Explain this notice in Hindi',
                'Explain this notice in Telugu'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(chip)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-[11px] text-slate-300 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {chatMessages.map((msg, idx) => {
                const isUser = msg.role === 'User';
                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-br-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl p-3.5 flex items-center space-x-2 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span>Analyzing notice context...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="pt-3 border-t border-slate-800 flex items-center space-x-2"
            >
              <input
                type="text"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Ask any question regarding this circular (English, Hindi, Telugu)..."
                className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={isChatLoading || !currentQuery.trim()}
                className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-40 transition-all shadow-md shadow-sky-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
        </div>
      </main>

      {/* MODAL: INGEST / UPLOAD NOTICE */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ingest Official Notice</h3>
                <p className="text-xs text-slate-400">Upload document (OCR extraction) or paste circular text.</p>
              </div>
            </div>

            {/* Quick 1-Click Demo Presets */}
            <div className="mb-4 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
              <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2">
                1-Click Quick Demo Presets:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadDemoPreset('exam')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 text-slate-300 text-xs transition-all"
                >
                  📝 Supplementary Exam Notice
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemoPreset('scholarship')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 text-slate-300 text-xs transition-all"
                >
                  🎓 National Fellowship NPCI
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemoPreset('library')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700 text-slate-300 text-xs transition-all"
                >
                  📚 Library Clearance Circular
                </button>
              </div>
            </div>

            {/* File Upload / OCR Dropzone */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload File (.pdf, .png, .jpg, .txt)
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
              />
              {ocrFileName && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>OCR Processed: {ocrFileName}</span>
                </p>
              )}
            </div>

            {/* Custom Title Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notice Title (Optional - auto-extracted if empty)
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., Winter 2026 Examination Enrollment Notification"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Raw Text Content */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notice Content / OCR Extracted Text
              </label>
              <textarea
                rows={6}
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Paste circular contents or guidelines here..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={handleProcessUpload}
              disabled={isAnalyzing || !uploadText.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing & Extracting Deadlines, Documents & Actions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Analysis & Save Notice</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM ACTION ITEM */}
      {isAddingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsAddingAction(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Add Custom Action Task</h3>
            <p className="text-xs text-slate-400 mb-4">Attach a task to: {activeNotice?.title.slice(0, 40)}...</p>

            <form onSubmit={handleAddCustomAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Description</label>
                <input
                  type="text"
                  required
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  placeholder="e.g., Get HOD signature on clearance form"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Deadline</label>
                <input
                  type="text"
                  value={newActionDeadline}
                  onChange={(e) => setNewActionDeadline(e.target.value)}
                  placeholder="e.g., 2026-10-18 or 'Within 3 Days'"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={newActionPriority}
                  onChange={(e) => setNewActionPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="High">High Urgency</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md shadow-sky-500/20"
              >
                Add Action to Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <p>AI Notice Action Assistant • Smart Circular Reader & Task Execution Platform • Full-Stack MERN Architecture</p>
      </footer>
    </div>
  );
}