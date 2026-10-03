/**
 * AI Notice Action Assistant
 * Rule-Based Mock AI Service
 * Strictly Free-Tier: Zero API keys, Zero External Paid Services.
 * Returns structured JSON with simulated 800ms asynchronous processing latency.
 */

export const mockOcrExtract = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const fileName = file.name || 'Notice_Document';
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  if (cleanName.toLowerCase().includes('scholar') || cleanName.toLowerCase().includes('fee')) {
    return `GOVERNMENT HIGHER EDUCATION SCHOLARSHIP CELL
CIRCULAR REF: SCH/2026/VERIF/102
Date: 25th September 2026

SUBJECT: PHYSICAL VERIFICATION & NPCI SEEDING MANDATE

All students awarded the State Merit Post-Matric Scholarship must submit physical verification forms before October 18, 2026.
1. Submit attested copies of Parental Income Certificate (income below Rs. 2.5 LPA).
2. Aadhaar card must be active with NPCI bank account mapping.
3. Bonafide certificate signed by the Head of Department.
Failure to submit physical proofs by the cutoff date will result in cancellation of scholarship disbursement.`;
  }

  if (cleanName.toLowerCase().includes('exam') || cleanName.toLowerCase().includes('hall')) {
    return `EXAMINATION CONTROLLER DIVISION - ACADEMIC SESSION 2026
NOTIFICATION NO: 409/EXAM/WINTER
Date: 28th September 2026

SUB: FINAL SEMESTER EXAMINATION REGISTRATION & LAB CLEARANCE

All students must register for regular & backlog winter examination papers:
- Normal registration deadline: October 15, 2026
- Registration with Rs. 1000 late fee: October 20, 2026 (strictly 5:00 PM cutoff)
- Attendance criteria: 75% compulsory. Attendance between 65%-74% requires Medical Certificate.
- Mandatory: Accounts Fee Clearance Receipt and Student ID Card.`;
  }

  return `OFFICIAL NOTICE: ${cleanName.toUpperCase()}
CIRCULAR REF: ADM/2026/GEN
Date: ${new Date().toLocaleDateString()}

SUBJECT: COMPLIANCE NOTICE & MANDATORY ACTION INSTRUCTIONS

All designated candidates are required to review the following compliance instructions:
1. Complete online documentation before the scheduled cutoff date (within 10 days).
2. Submit self-attested photocopies of identity proof and clearance receipts to the administrative office.
3. Verification window closes at 5:00 PM on the cutoff date.
Strict compliance is required to avoid administrative penalties or seat cancellation.`;
};

export const analyzeNotice = async (text, customTitle = '') => {
  // 800ms delay to simulate deep LLM inference
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Language Detection
  let detectedLanguage = 'English';
  if (/[\u0900-\u097F]/.test(text)) detectedLanguage = 'Hindi';
  else if (/[\u0C00-\u0C7F]/.test(text)) detectedLanguage = 'Telugu';

  // 2. Sender Extraction
  let sender = 'Official Authority';
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (/office|board|department|university|directorate|corporation|ministry|council|controller|cell/i.test(line)) {
      sender = line.replace(/^[-–—*\s]+/, '').substring(0, 75);
      break;
    }
  }

  // 3. Title Extraction
  const titleLine = lines.find((l) => /subject|sub[:\s]|circular|notification|regarding/i.test(l)) || lines[0] || 'Official Circular';
  const cleanTitle = customTitle || titleLine.replace(/^(subject|sub|ref)[\s:]+/i, '').substring(0, 90);

  // 4. Deadlines
  const deadlines = [];
  lines.forEach((line) => {
    if (/deadline|last date|cutoff|before|prior to|window|due date/i.test(line)) {
      const dateMatch = line.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}/i)
        || line.match(/\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{0,4}/i)
        || line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);

      const timeMatch = line.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/i);

      if (dateMatch) {
        deadlines.push({
          title: line.replace(/^[-–—*\d.\s]+/, '').substring(0, 60),
          date: dateMatch[0],
          time: timeMatch ? timeMatch[0] : '11:59 PM',
          isUrgent: /urgent|strictly|fine|late fee|disqualif/i.test(line)
        });
      }
    }
  });

  if (deadlines.length === 0) {
    deadlines.push({
      title: 'Action Compliance Deadline',
      date: 'Within 7 Business Days',
      time: '05:00 PM',
      isUrgent: false
    });
  }

  // 5. Required Documents
  const docKeywords = [
    'id card', 'receipt', 'challan', 'grade sheet', 'marks card', 'certificate',
    'income certificate', 'caste certificate', 'aadhaar', 'bonafide', 'medical certificate'
  ];
  const documents = [];
  lines.forEach((line) => {
    docKeywords.forEach((kw) => {
      if (line.toLowerCase().includes(kw) && !documents.some((d) => d.name.toLowerCase().includes(kw))) {
        documents.push({
          name: kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          mandatory: !line.toLowerCase().includes('optional') && !line.toLowerCase().includes('if applicable'),
          notes: line.replace(/^[-–—*\d.\s]+/, '').substring(0, 80)
        });
      }
    });
  });

  if (documents.length === 0) {
    documents.push({
      name: 'Official ID Proof & Application Form',
      mandatory: true,
      notes: 'Self-attested photocopies'
    });
  }

  // 6. Action Items
  const actions = [];
  const actionTriggers = ['submit', 'pay', 'upload', 'register', 'obtain', 'verify', 'attend', 'apply', 'complete'];
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if (actionTriggers.some((t) => lower.includes(t)) && line.trim().length > 15) {
      const clean = line.replace(/^[-–—*\d.\s]+/, '').trim();
      const isHigh = /strict|mandatory|fine|late fee|penalty|disqualif/i.test(line);
      const isLow = /optional|informative|advisory/i.test(line);

      actions.push({
        _id: 'act_' + Date.now().toString(36) + '_' + idx,
        text: clean.substring(0, 110),
        deadline: deadlines[0] ? deadlines[0].date : 'Pending',
        priority: isHigh ? 'High' : (isLow ? 'Low' : 'Medium'),
        status: 'Pending',
        documentRequired: documents[0] ? documents[0].name : 'Verification Slip',
        notes: 'Follow guidelines stated in official notice'
      });
    }
  });

  if (actions.length === 0) {
    actions.push({
      _id: 'act_' + Date.now().toString(36) + '_init',
      text: 'Review notice directives and gather compliance documentation',
      deadline: deadlines[0] ? deadlines[0].date : 'Upcoming',
      priority: 'High',
      status: 'Pending',
      documentRequired: 'ID Proof',
      notes: 'Initial step'
    });
  }

  // 7. Overall Priority & Summary
  const isHighPriority = /fine|penalty|disqualif|cancel|strict cutoff|emergency/i.test(text) || actions.some((a) => a.priority === 'High');
  const priority = isHighPriority ? 'High' : 'Medium';

  const plainSummary = `Official notification issued by ${sender} concerning "${cleanTitle}". Outlines procedural requirements, submission criteria, and cutoffs scheduled for ${deadlines[0]?.date || 'the designated cycle'}. Candidates must complete documentation to prevent administrative disqualification.`;

  const purpose = `Administrative compliance and verification for ${cleanTitle.substring(0, 60)}.`;

  const consequences = /fine|penalty|disqualif|loss of/i.test(text)
    ? 'Failure to comply before cutoff will lead to late fees, procedural rejection, or disqualification.'
    : 'Delay in submission will result in administrative hold on processing.';

  return {
    title: cleanTitle,
    sender,
    language: detectedLanguage,
    priority,
    status: 'Pending',
    summary: {
      plainSummary,
      purpose,
      keyPoints: [
        `Issued by: ${sender}`,
        `Primary Cutoff: ${deadlines[0]?.date || 'Standard deadline'}`,
        `Mandatory Documents: ${documents.map((d) => d.name).slice(0, 3).join(', ')}`,
        `Priority Level: ${priority} Urgency`
      ],
      consequences,
      summaryHindi: `यह आधिकारिक सूचना ${sender} द्वारा "${cleanTitle}" के संबंध में जारी की गई है। कृपया समय सीमा (${deadlines[0]?.date || 'शीघ्र'}) से पहले आवश्यक कार्य पूर्ण करें।`,
      summaryTelugu: `ఈ అధికారిక ప్రకటన ${sender} నుండి "${cleanTitle}" కొరకు జారీ చేయబడింది. గడువు (${deadlines[0]?.date || 'త్వరలో'}) లోపు సూచించిన పనులను పూర్తి చేయండి.`
    },
    deadlines,
    documents_required: documents,
    eligibility: [
      'Registered students or eligible applicants',
      'Minimum standard attendance criteria (if applicable)',
      'Clearance of pending dues'
    ],
    actions
  };
};

export const answerNoticeQuestion = async (notice, question, language = 'English') => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const qLower = question.toLowerCase();

  if (qLower.includes('last date') || qLower.includes('deadline') || qLower.includes('when')) {
    if (notice.deadlines && notice.deadlines.length > 0) {
      const dates = notice.deadlines.map((d) => `• **${d.title}**: ${d.date} at ${d.time || 'cutoff'}`).join('\n');
      return `Key Deadlines extracted for this notice:\n\n${dates}\n\nMake sure all required documents are ready well before this date.`;
    }
    return `No explicit cutoff date was mentioned in this notice. Please check with ${notice.sender}.`;
  }

  if (qLower.includes('document') || qLower.includes('certificate') || qLower.includes('bring')) {
    if (notice.documents_required && notice.documents_required.length > 0) {
      const docs = notice.documents_required.map((d) => `• **${d.name}** (${d.mandatory ? 'Mandatory' : 'Optional'}) - ${d.notes}`).join('\n');
      return `Documents you must prepare and carry:\n\n${docs}`;
    }
    return `No specific documents are listed in the circular. Carry standard official identification.`;
  }

  if (qLower.includes('fee') || qLower.includes('fine') || qLower.includes('penalty') || qLower.includes('cost')) {
    const feeMatch = notice.originalText?.match(/(?:rs\.?|₹|inr)\s*[\d,]+(?:\.\d+)?/i);
    if (feeMatch) {
      return `The circular mentions a fee or late fine of **${feeMatch[0]}**. Please ensure payment is cleared promptly to avoid further surcharges.`;
    }
    return `There is no explicit monetary fine stated in this circular text.`;
  }

  if (qLower.includes('consequence') || qLower.includes('what happens') || qLower.includes('fail')) {
    return notice.summary?.consequences || `Failure to take timely action may lead to administrative disqualification.`;
  }

  if (qLower.includes('hindi') || language === 'Hindi' || /[\u0900-\u097F]/.test(question)) {
    return notice.summary?.summaryHindi || `यह सूचना ${notice.sender} द्वारा जारी की गई है। अंतिम तिथि का विशेष ध्यान रखें।`;
  }

  if (qLower.includes('telugu') || language === 'Telugu' || /[\u0C00-\u0C7F]/.test(question)) {
    return notice.summary?.summaryTelugu || `ఈ సమాచారం ${notice.sender} ద్వారా పంపబడింది. గడువు తేదీ లోపు పత్రాలు సమర్పించండి.`;
  }

  return `Regarding "${notice.title}" from **${notice.sender}**:\n\n` +
    `• **Summary**: ${notice.summary?.plainSummary || 'Official notice requires action.'}\n` +
    `• **Primary Action**: ${notice.actions?.[0]?.text || 'Verify your documents'}\n` +
    `• **Deadline**: ${notice.deadlines?.[0]?.date || 'Standard schedule'}\n\n` +
    `Let me know if you would like me to draft a formal reply or verify specific deadlines!`;
};

export const generateReplyDraft = async ({ notice, user, draftType = 'reply', tone = 'formal', language = 'English' }) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const userName = user?.name || 'Aarav Sharma';
  const org = user?.contactDetails?.organization || 'National Institute of Technology';
  const sender = notice.sender || 'Concerned Authority';

  let subject = `Response: Regarding Notice ${notice.notice_id || ''}`;
  let body = '';

  if (draftType === 'application') {
    subject = `Formal Application for ${notice.title.substring(0, 50)}`;
    body = `To,\n${sender}\n\nRespected Sir/Madam,\n\n` +
      `I am writing to formally submit my compliance application for "${notice.title}".\n\n` +
      `I have satisfied all eligibility criteria and enclosed the requisite documents, including ${notice.documents_required?.[0]?.name || 'verified identification proofs'}.\n\n` +
      `I kindly request you to approve my submission.\n\n` +
      `Yours sincerely,\n${userName}\n${org}`;
  } else if (draftType === 'request_letter') {
    subject = `Request for Deadline Extension - Notice ${notice.notice_id || ''}`;
    body = `To,\n${sender}\n\nRespected Sir/Madam,\n\n` +
      `I am preparing the documentation required for "${notice.title}".\n\n` +
      `Owing to administrative delays in securing my attested certificate, I respectfully request an extension until next week to complete physical submission.\n\n` +
      `Thank you for your understanding.\n\n` +
      `Yours faithfully,\n${userName}\n${org}`;
  } else {
    subject = `Compliance Acknowledgment: ${notice.title.substring(0, 50)}`;
    body = `To,\n${sender}\n\nRespected Sir/Madam,\n\n` +
      `I acknowledge receipt of the circular regarding "${notice.title}".\n\n` +
      `All mandated actions have been initiated and relevant records are attached for your verification ahead of ${notice.deadlines?.[0]?.date || 'the designated date'}.\n\n` +
      `Yours sincerely,\n${userName}\n${org}`;
  }

  if (language === 'Hindi') {
    subject = `उत्तर / आवेदन: ${notice.title.substring(0, 40)}`;
    body = `सेवा में,\n${sender}\n\nमहोदय,\n\nमैं "${notice.title}" के संबंध में यह पत्र प्रस्तुत कर रहा हूँ। मेरे द्वारा सभी आवश्यक दस्तावेज संलग्न कर दिए गए हैं।\n\nकृपया इसे स्वीकार करें।\n\nभवदीय,\n${userName}`;
  } else if (language === 'Telugu') {
    subject = `స్పందన / దరఖాస్తు: ${notice.title.substring(0, 40)}`;
    body = `గౌరవనీయ అధికారి గారికి,\n${sender}\n\nవిషయం: "${notice.title}" కు సంబంధించి దరఖాస్తు.\n\nపై నోటీసు సూచనల మేరకు అవసరమైన అన్ని వివరాలు జతపరిచాను. దయచేసి పరిశీలించవలసిందిగా కోరుతున్నాను.\n\nభవదీయుడు,\n${userName}`;
  }

  return {
    subject,
    recipient: sender,
    draftType,
    tone,
    language,
    bodyContent: body
  };
};
