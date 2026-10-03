// Intelligent Rule-based AI Engine for Notice Action Assistant
// Simulates HuggingFace/LLM extraction without external paid APIs, returning structured JSON

const datePatterns = [
  /(?:by|before|until|on|deadline[:\s]+)?([A-Za-z]+ \d{1,2},? \d{4})/i,
  /(\d{1,2}(?:st|nd|rd|th)? [A-Za-z]+,? \d{4})/i,
  /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/
];

const detectLanguage = (text) => {
  // Check for Devanagari script (Hindi)
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  // Check for Telugu script
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
  return 'English';
};

const extractSender = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (/office|board|department|university|directorate|corporation|ministry|institution|council|committee|bank|controller/i.test(line)) {
      return line.replace(/^[-–—*\s]+/, '').substring(0, 80);
    }
  }
  return 'Official Administrative Authority';
};

const extractDeadlines = (text) => {
  const deadlines = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (/deadline|last date|cutoff|submit before|prior to|due date|dated|window|valid until/i.test(line)) {
      const match = line.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}/i) 
        || line.match(/\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{0,4}/i)
        || line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);

      const timeMatch = line.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/i);

      if (match) {
        const isUrgent = /urgent|strictly|immediate|fine|late fee|disqualif/i.test(line);
        deadlines.push({
          title: line.replace(/^[-–—*\d.\s]+/, '').substring(0, 60),
          date: match[0],
          time: timeMatch ? timeMatch[0] : '11:59 PM',
          isUrgent
        });
      }
    }
  });

  if (deadlines.length === 0) {
    deadlines.push({
      title: 'Action submission deadline',
      date: 'Within 7 business days',
      time: '05:00 PM',
      isUrgent: false
    });
  }

  return deadlines.slice(0, 4);
};

const extractDocuments = (text) => {
  const docs = [];
  const lines = text.split('\n');

  const docKeywords = [
    'id card', 'receipt', 'challan', 'grade sheet', 'marks card', 'certificate',
    'income certificate', 'caste certificate', 'aadhaar', 'bonafide', 'medical certificate',
    'passport', 'photocopy', 'form', 'undertaking', 'affidavit'
  ];

  lines.forEach(line => {
    docKeywords.forEach(keyword => {
      if (line.toLowerCase().includes(keyword) && !docs.some(d => d.name.toLowerCase().includes(keyword))) {
        const isMandatory = !line.toLowerCase().includes('if applicable') && !line.toLowerCase().includes('optional');
        docs.push({
          name: keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          mandatory: isMandatory,
          notes: line.replace(/^[-–—*\d.\s]+/, '').substring(0, 90)
        });
      }
    });
  });

  if (docs.length === 0) {
    docs.push({
      name: 'Official Application Form & ID Proof',
      mandatory: true,
      notes: 'Standard self-attested identification document'
    });
  }

  return docs.slice(0, 5);
};

const extractEligibility = (text) => {
  const eligibility = [];
  const lines = text.split('\n');

  lines.forEach(line => {
    if (/attendance|eligib|cgpa|percentage|enrolled|semester|income|annual|criteria|qualification/i.test(line)) {
      const clean = line.replace(/^[-–—*\d.\s]+/, '').trim();
      if (clean.length > 10 && clean.length < 140) {
        eligibility.push(clean);
      }
    }
  });

  if (eligibility.length === 0) {
    eligibility.push('All registered applicants/students matching criteria mentioned in notice');
  }

  return eligibility.slice(0, 4);
};

const extractActionItems = (text, deadlines, docs) => {
  const actions = [];
  const lines = text.split('\n');

  const actionTriggers = ['submit', 'pay', 'upload', 'register', 'obtain', 'verify', 'attend', 'apply', 'complete', 'visit', 'report'];

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    const hasTrigger = actionTriggers.some(t => lower.includes(t));
    if (hasTrigger && line.trim().length > 15) {
      const cleanText = line.replace(/^[-–—*\d.\s]+/, '').trim();
      const isHigh = /strict|mandatory|fine|late fee|disqualif|immediately|penalty/i.test(line);
      const isLow = /optional|if desired|guideline|informative/i.test(line);
      const matchedDoc = docs.find(d => lower.includes(d.name.toLowerCase()));

      actions.push({
        _id: 'act_' + Date.now().toString(36) + '_' + idx,
        text: cleanText.substring(0, 110),
        deadline: deadlines[0] ? deadlines[0].date : 'Upcoming',
        priority: isHigh ? 'High' : (isLow ? 'Low' : 'Medium'),
        status: 'Pending',
        documentRequired: matchedDoc ? matchedDoc.name : 'Notice Reference Document',
        notes: 'Follow guidelines outlined in official circular'
      });
    }
  });

  if (actions.length === 0) {
    actions.push({
      _id: 'act_' + Date.now().toString(36) + '_default',
      text: 'Review notice details and verify eligibility credentials',
      deadline: deadlines[0] ? deadlines[0].date : 'Immediate',
      priority: 'High',
      status: 'Pending',
      documentRequired: 'ID Verification',
      notes: 'Initial compliance check'
    });
  }

  return actions.slice(0, 5);
};

const determinePriority = (actions, deadlines, text) => {
  if (/fine|penalty|disqualif|cancel|strict cutoff|emergency|legal/i.test(text)) return 'High';
  if (actions.some(a => a.priority === 'High')) return 'High';
  if (deadlines.some(d => d.isUrgent)) return 'High';
  if (/advisory|routine|information|optional/i.test(text)) return 'Low';
  return 'Medium';
};

const generatePlainSummary = (text, sender, deadlines) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const subjectLine = lines.find(l => /subject|sub[:\s]|ref[:\s]|regarding/i.test(l)) || lines[0] || 'Official Circular';
  const cleanSubject = subjectLine.replace(/^(subject|sub|ref)[\s:]+/i, '');

  const deadlineStr = deadlines[0] ? `with crucial cutoff on ${deadlines[0].date}` : 'requiring prompt review';

  const summary = `Official notification issued by ${sender} regarding ${cleanSubject}. Outlines mandatory regulatory instructions, verification criteria, and designated timelines ${deadlineStr}. Stakeholders are instructed to review required documentation and take appropriate action before scheduled deadlines.`;

  const purpose = `Administrative compliance and procedural execution for ${cleanSubject.substring(0, 60)}.`;

  const consequences = /fine|penalty|disqualif|loss of|forfeit/i.test(text)
    ? 'Non-compliance will result in penalties, administrative disqualification, or forfeiture of student/applicant privileges.'
    : 'Delay in submission may result in procedural rejection or forfeiture of registration benefits.';

  return {
    plainSummary: summary,
    purpose,
    consequences,
    summaryHindi: `यह आधिकारिक सूचना ${sender} द्वारा जारी की गई है। इसमें आवश्यक निर्देश, अंतिम तिथियां (${deadlines[0] ? deadlines[0].date : 'शीघ्र'}) और आवश्यक दस्तावेज शामिल हैं। समय सीमा से पहले कार्रवाई पूरी करें अन्यथा दंड या अयोग्यता हो सकती है।`,
    summaryTelugu: `ఈ అధికారిక ప్రకటన ${sender} ద్వారా జారీ చేయబడింది. ఇందులో ముఖ్యమైన నిబంధనలు, గడువు తేదీలు (${deadlines[0] ? deadlines[0].date : 'త్వరలో'}) మరియు ధృవపత్రాల వివరాలు ఉన్నాయి. గడువులోపు పూర్తి చేయకపోతే జరిమానా లేదా అనర్హత విధించబడుతుంది.`
  };
};

/**
 * Main AI Analysis Function - Parses raw notice text into structured intelligence
 */
const analyzeNoticeText = async (text, customTitle = null) => {
  // Simulate AI model latency (800ms)
  await new Promise(r => setTimeout(r, 600));

  const language = detectLanguage(text);
  const sender = extractSender(text);
  const deadlines = extractDeadlines(text);
  const documents = extractDocuments(text);
  const eligibility = extractEligibility(text);
  const actions = extractActionItems(text, deadlines, documents);
  const priority = determinePriority(actions, deadlines, text);
  const summaryObj = generatePlainSummary(text, sender, deadlines);

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const title = customTitle || (lines.find(l => /subject|sub[:\s]|circular|notification/i.test(l)) || lines[0] || 'Official Notice Analysis').replace(/^(subject|sub|ref)[\s:]+/i, '').substring(0, 90);

  return {
    title,
    sender,
    language,
    priority,
    status: 'Pending',
    summary: {
      plainSummary: summaryObj.plainSummary,
      purpose: summaryObj.purpose,
      keyPoints: [
        `Issued by: ${sender}`,
        deadlines[0] ? `Primary Deadline: ${deadlines[0].date} (${deadlines[0].time})` : 'Timeline: Standard administrative cycle',
        `Required Documents: ${documents.map(d => d.name).slice(0, 3).join(', ')}`,
        `Urgency Level: ${priority} Priority`
      ],
      consequences: summaryObj.consequences,
      summaryHindi: summaryObj.summaryHindi,
      summaryTelugu: summaryObj.summaryTelugu,
    },
    deadlines,
    documents_required: documents,
    eligibility,
    actions
  };
};

/**
 * Notice Chatbot: Grounded Question-Answering
 */
const answerNoticeQuestion = async (notice, question, userLanguage = 'English') => {
  await new Promise(r => setTimeout(r, 500));
  const qLower = question.toLowerCase();

  if (qLower.includes('last date') || qLower.includes('deadline') || qLower.includes('when')) {
    if (notice.deadlines && notice.deadlines.length > 0) {
      const d = notice.deadlines.map(item => `• **${item.title}**: ${item.date} by ${item.time || 'cutoff'}`).join('\n');
      return `Here are the extracted deadlines for this notice:\n\n${d}\n\nMake sure to complete all required tasks before the earliest cutoff to avoid penalties.`;
    }
    return `No explicit cutoff date was detected in this notice. However, it is advised to complete submissions within standard working hours.`;
  }

  if (qLower.includes('document') || qLower.includes('certificate') || qLower.includes('what to bring') || qLower.includes('attach')) {
    if (notice.documents_required && notice.documents_required.length > 0) {
      const docs = notice.documents_required.map(d => `• **${d.name}** (${d.mandatory ? 'Mandatory' : 'Optional'}): ${d.notes || 'As per instructions'}`).join('\n');
      return `The notice mandates the following documents:\n\n${docs}\n\nPlease ensure you have both original copies and self-attested photocopies ready.`;
    }
    return `The notice does not specify individual supporting documents. Carry your official ID and circular acknowledgement copy.`;
  }

  if (qLower.includes('fee') || qLower.includes('fine') || qLower.includes('late') || qLower.includes('amount') || qLower.includes('cost')) {
    const feeMatch = notice.originalText.match(/(?:rs\.?|₹|inr)\s*[\d,]+(?:\.\d+)?/i) || notice.originalText.match(/\d+%/);
    if (feeMatch) {
      return `The notice mentions specific monetary figures or penalties: **${feeMatch[0]}**. Late submissions or arrears may trigger additional surcharges.`;
    }
    return `There is no explicit fee amount mentioned in the main circular text. Check with the issuing counter for any procedural charges.`;
  }

  if (qLower.includes('consequence') || qLower.includes('what happens') || qLower.includes('fail') || qLower.includes('miss')) {
    return notice.summary?.consequences || `Failure to comply before the stipulated date may result in disqualification or procedural forfeiture of benefits.`;
  }

  if (qLower.includes('hindi') || userLanguage === 'Hindi' || /[\u0900-\u097F]/.test(question)) {
    return notice.summary?.summaryHindi || `यह सूचना ${notice.sender} द्वारा जारी की गई है। मुख्य कार्य: ${notice.actions?.[0]?.text || 'नोटिस का अनुपालन करें'}।`;
  }

  if (qLower.includes('telugu') || userLanguage === 'Telugu' || /[\u0C00-\u0C7F]/.test(question)) {
    return notice.summary?.summaryTelugu || `ఈ నోటీసు ${notice.sender} ద్వారా జారీ చేయబడింది. ముఖ్యమైన పని: ${notice.actions?.[0]?.text || 'నిబంధనలను పాటించండి'}.`;
  }

  // General grounded response
  return `Based on "${notice.title}" issued by **${notice.sender}**:\n\n` +
    `• **Key Purpose**: ${notice.summary?.purpose || 'Official administrative procedure'}\n` +
    `• **Next Action**: ${notice.actions?.[0]?.text || 'Review circular instructions'}\n` +
    `• **Primary Cutoff**: ${notice.deadlines?.[0]?.date || 'Standard timeline'}\n\n` +
    `If you have specific doubts regarding deadlines, required paperwork, or fines, feel free to ask!`;
};

/**
 * Reply Draft Generator
 */
const generateReplyDraft = async ({ notice, user, draftType = 'reply', tone = 'formal', language = 'English' }) => {
  await new Promise(r => setTimeout(r, 600));

  const userName = user?.name || 'Applicant / Student';
  const org = user?.contactDetails?.organization || 'Institution / College';
  const sender = notice.sender || 'Concerned Authority';

  let subject = `Response to Circular Ref: ${notice.notice_id || 'Notice'}`;
  let salutation = tone === 'polite' ? 'Respected Sir/Madam,' : 'To the Concerned Authority,';
  let closing = tone === 'polite' ? 'With warm regards and gratitude,' : 'Yours sincerely,';

  let body = '';

  if (draftType === 'application') {
    subject = `Formal Application regarding ${notice.title.substring(0, 50)}`;
    body = `${salutation}\n\n` +
      `I am writing to formally submit my compliance application in reference to the notice titled "${notice.title}" issued by ${sender}.\n\n` +
      `I have verified all eligibility requirements and compiled the requisite documentation, including ${notice.documents_required?.map(d => d.name).slice(0, 2).join(' and ') || 'valid identity documents'}.\n\n` +
      `I respectfully request your office to accept my submission and process the same under established guidelines.\n\n` +
      `${closing}\n${userName}\n${org}`;
  } else if (draftType === 'request_letter') {
    subject = `Request for Deadline Extension / Clarification on Notice ${notice.notice_id || ''}`;
    body = `${salutation}\n\n` +
      `I wish to bring to your kind attention that I am actively preparing the required documentation for the circular "${notice.title}".\n\n` +
      `Due to unavoidable procedural constraints in procuring ${notice.documents_required?.[0]?.name || 'required verification proofs'}, I humbly request a brief extension or guidance on alternative attestation options.\n\n` +
      `I assure you of full compliance at the earliest possible convenience.\n\n` +
      `${closing}\n${userName}\n${org}`;
  } else {
    // Standard reply
    subject = `Compliance Acknowledgment & Submission for Notice ${notice.notice_id || ''}`;
    body = `${salutation}\n\n` +
      `This is to respectfully acknowledge receipt of your notice regarding "${notice.title}".\n\n` +
      `I have completed the preliminary actions mandated by the circular and am submitting the required records for verification ahead of the scheduled deadline (${notice.deadlines?.[0]?.date || 'as stipulated'}).\n\n` +
      `Please let me know if any further particulars or original vouchers are required for this review.\n\n` +
      `${closing}\n${userName}\n${org}`;
  }

  // Translation if requested
  if (language === 'Hindi') {
    subject = `आवेदन / उत्तर: ${notice.title.substring(0, 40)}`;
    body = `सेवा में,\n${sender}\n\nमहोदय/महोदया,\n\nसविनय निवेदन है कि मैं "${notice.title}" के संदर्भ में अपना आवेदन प्रस्तुत कर रहा हूँ। मैंने सभी आवश्यक दस्तावेज संलग्न कर दिए हैं।\n\nकृपया मेरे आवेदन को स्वीकार करने की कृपा करें।\n\nभवदीय,\n${userName}`;
  } else if (language === 'Telugu') {
    subject = `దరఖాస్తు / స్పందన: ${notice.title.substring(0, 40)}`;
    body = `గౌరవనీయులైన అధికారి గారికి,\n${sender}\n\nవిషయం: "${notice.title}" పై వివరణ / దరఖాస్తు.\n\nపై నోటీసుకు సంబంధించి నేను అవసరమైన పత్రాలను సిద్ధం చేసుకుని సమర్పిస్తున్నాను. దయచేసి పరిశీలించగలరు.\n\nభవదీయుడు,\n${userName}`;
  }

  return {
    subject,
    recipient: sender,
    tone,
    draftType,
    language,
    bodyContent: body
  };
};

module.exports = {
  analyzeNoticeText,
  answerNoticeQuestion,
  generateReplyDraft,
  detectLanguage
};
