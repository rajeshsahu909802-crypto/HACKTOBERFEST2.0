import { FAQItem } from '../types';

export const INITIAL_FAQS: FAQItem[] = [
  // 1. ACADEMICS
  {
    id: 'faq-acad-1',
    category: 'Academics',
    question: 'What is the minimum attendance requirement to appear for semester end exams?',
    questionVariants: [
      'Minimum attendance criteria for exams',
      'Attendance kitna percent hona chahiye?',
      'Attendance shortage rules',
      'How much attendance is needed for final exams?'
    ],
    answer: 'Students must maintain a minimum of 75% overall attendance in each course to be eligible to appear for Semester End Examinations (SEE). A condonation of up to 10% (i.e., 65% to 74%) may be granted on medical grounds or official college representation, subject to Dean of Academic Affairs approval with valid documentary proof submitted within 7 days of absence.',
    sourceDoc: 'Academic Regulations & Ordinance 2025-26',
    sectionOrRule: 'Section 4.2 - Attendance & Condonation Policy',
    updatedAt: '2025-08-15',
    tags: ['attendance', 'eligibility', 'condonation', 'exams']
  },
  {
    id: 'faq-acad-2',
    category: 'Academics',
    question: 'How can a student apply for course drop or branch change?',
    questionVariants: [
      'Branch change criteria after 1st year',
      'Can I change my engineering branch?',
      'Branch change kab aur kaise hota hai?',
      'Elective course drop deadline'
    ],
    answer: 'Branch change applications open immediately after 2nd-semester results declaration. Students who cleared all 1st-year credits without backlog and scored a CGPA of 8.50 or higher are eligible to apply through the ERP Student Portal. Branch allocation is strictly based on vacant seats and CGPA merit. Elective course drop is allowed up to 2 weeks after semester commencement with Advisor sign-off.',
    sourceDoc: 'Academic Regulations & Ordinance 2025-26',
    sectionOrRule: 'Section 7.1 - Branch Transfer & Course Registration',
    updatedAt: '2025-08-15',
    tags: ['branch change', 'cgpa', 'elective drop', 'academics']
  },
  {
    id: 'faq-acad-3',
    category: 'Academics',
    question: 'Where can I find the official academic calendar and semester timetable?',
    questionVariants: [
      'Academic calendar odd/even semester',
      'Timetable kahan milega?',
      'Semester schedule and holidays list',
      'Class timetable for B.Tech/M.Tech'
    ],
    answer: 'The complete semester academic calendar and weekly section timetables are published on the Student ERP Portal under the "Academics > Timetable" tab and on the college website under Notice Board. Odd semester classes run August to December, and Even semester runs January to May.',
    sourceDoc: 'Academic Calendar Circular No. 2025/AC/01',
    sectionOrRule: 'Annexure B - Semester Schedule',
    updatedAt: '2025-07-28',
    tags: ['timetable', 'academic calendar', 'erp', 'holidays']
  },

  // 2. FEES & SCHOLARSHIPS
  {
    id: 'faq-fee-1',
    category: 'Fees & Scholarships',
    question: 'What is the semester fee payment deadline and late fine structure?',
    questionVariants: [
      'Semester fee kab tak bharni hai?',
      'Last date to pay college fees',
      'Late fee fine amount per day',
      'College fee payment options online'
    ],
    answer: 'Tuition and semester fees must be paid through the SBI Collect / ERP payment gateway before the 10th day of the semester commencement without fine. A late fee of ₹100 per day applies from Day 11 to Day 25. Beyond Day 25, student registration is held in abeyance and requires Vice-Chancellor/Director approval with ₹3,000 readmission fee.',
    sourceDoc: 'Finance & Accounts Office Notification 2025/FAO/12',
    sectionOrRule: 'Clause 3 - Fee Schedule & Penalties',
    updatedAt: '2025-07-10',
    tags: ['fees', 'late fee', 'sbi collect', 'due date']
  },
  {
    id: 'faq-fee-2',
    category: 'Fees & Scholarships',
    question: 'What merit and need-based scholarships are available for students?',
    questionVariants: [
      'College scholarship criteria and application',
      'Scholarship kaise milti hai?',
      'Fee concession for low income families',
      'NSP and State scholarship verification process'
    ],
    answer: 'The college offers: (1) Merit Scholarship: 50% tuition waiver for top 3 rankers in each department having CGPA >= 9.0; (2) Means-cum-Merit: 25% to 100% waiver for students with annual family income < ₹2.5 Lakhs; (3) National Scholarship Portal (NSP) & State Post-Matric schemes, which are verified by the College Scholarship Desk in Room 108, Admin Block.',
    sourceDoc: 'Scholarship & Financial Aid Handbook 2025',
    sectionOrRule: 'Chapter 2 - Institutional Schemes',
    updatedAt: '2025-06-20',
    tags: ['scholarships', 'tuition waiver', 'nsp', 'financial aid']
  },
  {
    id: 'faq-fee-3',
    category: 'Fees & Scholarships',
    question: 'How do I download the official fee receipt for education loan or tax rebate (80E)?',
    questionVariants: [
      'Fee receipt download from ERP',
      'Education loan fee certificate kaise le?',
      'Fee payment receipt for income tax'
    ],
    answer: 'Immediately after online payment via ERP / SBI Collect, fee receipts are auto-generated. You can download and print verified digitally signed receipts anytime by visiting ERP Portal > Accounts > Fee Receipts. For physical bank stamp for education loan disbursement, visit Window 3 of the Accounts Branch between 10:00 AM and 1:00 PM.',
    sourceDoc: 'Finance & Accounts Office Notification 2025/FAO/12',
    sectionOrRule: 'Clause 8 - Receipt & Education Loan Vouchers',
    updatedAt: '2025-07-10',
    tags: ['fee receipt', 'education loan', 'erp accounts', 'tax 80e']
  },

  // 3. EXAMS & RESULTS
  {
    id: 'faq-exam-1',
    category: 'Exams & Results',
    question: 'What is the procedure and fee for revaluation and answer sheet photocopy inspection?',
    questionVariants: [
      'Revaluation form process and fees',
      'Copy checking me issue hai to rechecking kaise kare?',
      'Answer script revaluation deadline',
      'Challenging semester exam marks'
    ],
    answer: 'Students can apply for answer script inspection and revaluation within 15 calendar days of result publication via the ERP Examination Portal. Fee is ₹500 per subject for answer script photocopy inspection and ₹1,000 per subject for complete revaluation by an external evaluator. If the revised score increases by more than 15%, 50% of the revaluation fee is refunded.',
    sourceDoc: 'Office of the Controller of Examinations Circular COE/2025/08',
    sectionOrRule: 'Section 6 - Re-evaluation and Verification of Marks',
    updatedAt: '2025-05-18',
    tags: ['revaluation', 'photocopy', 'marks verification', 'exams']
  },
  {
    id: 'faq-exam-2',
    category: 'Exams & Results',
    question: 'When are backlog / supplementary exams conducted?',
    questionVariants: [
      'Backlog exam kab hote hai?',
      'Remedial and supplementary exam rules',
      'Arrear exam schedule',
      'How many backlogs are allowed before year back?'
    ],
    answer: 'Supplementary / backlog examinations are held twice a year: once in July for both odd & even semester courses, and once during regular end-term exams for odd/even subjects respectively. A maximum of 4 active backlogs are permissible to register for 3rd year, and no backlogs are allowed to enter the 4th year without an academic year-back.',
    sourceDoc: 'Office of the Controller of Examinations Circular COE/2025/08',
    sectionOrRule: 'Section 9 - Supplementary Exams & Year Progression',
    updatedAt: '2025-05-18',
    tags: ['backlog', 'supplementary', 'arrears', 'progression']
  },
  {
    id: 'faq-exam-3',
    category: 'Exams & Results',
    question: 'What is the grading scale and formula for CGPA to Percentage conversion?',
    questionVariants: [
      'CGPA to percentage formula college',
      'Grading system SGPA CGPA formula',
      'O, A+, A grade marks breakdown'
    ],
    answer: 'The college follows a 10-point absolute grading system: O (90-100%, 10 pts), A+ (80-89%, 9 pts), A (70-79%, 8 pts), B+ (60-69%, 7 pts), B (50-59%, 6 pts), C (40-49%, 5 pts), F (<40%, 0 pts). The official formula for converting CGPA to percentage is: Percentage (%) = (CGPA - 0.75) × 10.',
    sourceDoc: 'Academic Regulations & Ordinance 2025-26',
    sectionOrRule: 'Section 11.3 - Grading Scale & Conversion Formula',
    updatedAt: '2025-08-15',
    tags: ['cgpa formula', 'grading system', 'percentage conversion']
  },

  // 4. LIBRARY
  {
    id: 'faq-lib-1',
    category: 'Library',
    question: 'What are the Central Library timings, book borrowing limits, and late return fines?',
    questionVariants: [
      'Library timings and book issue rules',
      'Kitne books issue kar sakte hai library se?',
      'Library open till what time during exams?',
      'Late fine per day for library books'
    ],
    answer: 'The Central Library is open from 8:00 AM to 10:00 PM on weekdays, and 9:00 AM to 5:00 PM on weekends. During mid-term and end-term exams, reading halls operate 24/7. Undergraduate students can borrow up to 4 books for 14 days, while Postgraduate and Research scholars can borrow 6 books for 30 days. Late fine is ₹5 per book per day.',
    sourceDoc: 'Central Library Manual & User Charter 2025',
    sectionOrRule: 'Section 3.1 - Working Hours & Circulation Limits',
    updatedAt: '2025-07-01',
    tags: ['library', 'book issue', 'timings', 'late fine']
  },
  {
    id: 'faq-lib-2',
    category: 'Library',
    question: 'How do I access IEEE, ScienceDirect, and digital e-resources off-campus?',
    questionVariants: [
      'Off campus access to IEEE and research papers',
      'E-library login password credentials',
      'Digital library knimbus remote access'
    ],
    answer: 'Students can access subscribed digital databases (IEEE Xplore, ScienceDirect, Springer, JSTOR) off-campus via the Knimbus Remote Access Portal (college.knimbus.com) using their college email credentials (@college.edu). If your remote access is locked or needs reset, email digital.library@college.edu with your Roll Number.',
    sourceDoc: 'Central Library Manual & User Charter 2025',
    sectionOrRule: 'Section 5.4 - E-Resources & Remote Portal Access',
    updatedAt: '2025-07-01',
    tags: ['digital library', 'ieee', 'knimbus', 'off-campus access']
  },

  // 5. HOSTEL & MESS
  {
    id: 'faq-hostel-1',
    category: 'Hostel & Mess',
    question: 'What is the hostel gate curfew timing and night outpass procedure?',
    questionVariants: [
      'Hostel me in-time kitna hai?',
      'Night outpass and weekend leave process',
      'Hostel gate timings and permission',
      'What happens if I come late to hostel?'
    ],
    answer: 'The hostel gate entry curfew is strictly 9:30 PM on all days. For late entry up to 10:30 PM (e.g., library/lab work), prior written consent from faculty/warden is mandatory. For night outpass or weekend home visits, students must submit an e-Outpass via the Student ERP at least 6 hours in advance, followed by automated parent SMS OTP verification.',
    sourceDoc: 'Hostel Code of Conduct & Residential Handbook 2025',
    sectionOrRule: 'Rule 14 - Gate Timings & Leave Outpass Policy',
    updatedAt: '2025-06-30',
    tags: ['hostel timings', 'curfew', 'outpass', 'warden']
  },
  {
    id: 'faq-hostel-2',
    category: 'Hostel & Mess',
    question: 'What are the mess timings, dietary options, and mess rebate rules for holidays?',
    questionVariants: [
      'Mess timings breakfast lunch dinner',
      'Mess rebate kaise apply kare?',
      'Vegetarian and Jain food availability in mess',
      'Mess food complaint'
    ],
    answer: 'Mess timings are: Breakfast (7:30 AM - 9:30 AM), Lunch (12:00 PM - 2:00 PM), Evening Snacks (4:45 PM - 6:00 PM), and Dinner (7:45 PM - 9:45 PM). Both Vegetarian and Non-Vegetarian counters are available with separate Jain food preparations upon prior registration. Mess rebate of ₹120/day is applicable if absent for 4 or more consecutive days with approved hostel leave submitted 24 hours prior.',
    sourceDoc: 'Hostel Code of Conduct & Residential Handbook 2025',
    sectionOrRule: 'Rule 22 - Mess Operations & Rebate Entitlement',
    updatedAt: '2025-06-30',
    tags: ['mess timings', 'mess rebate', 'food menu', 'hostel']
  },
  {
    id: 'faq-hostel-3',
    category: 'Hostel & Mess',
    question: 'What electrical appliances are permitted or banned in hostel rooms?',
    questionVariants: [
      'Can I use electric kettle or iron in hostel?',
      'Electric appliances allowed in hostel room',
      'Fine for electric heater or induction in hostel'
    ],
    answer: 'Laptops, mobile chargers, study lamps, and electric kettles (up to 500W) are permitted. High-power appliances including immersion rods, room heaters, induction stoves, and electric irons are strictly prohibited due to electrical safety standards. Possession leads to confiscation and a fine of ₹2,500.',
    sourceDoc: 'Hostel Code of Conduct & Residential Handbook 2025',
    sectionOrRule: 'Rule 18 - Prohibited Electrical Equipment',
    updatedAt: '2025-06-30',
    tags: ['hostel rules', 'appliances', 'heater fine', 'safety']
  },

  // 6. TRANSPORT
  {
    id: 'faq-trans-1',
    category: 'Transport',
    question: 'What are the college bus routes, pickup points, and pass registration process?',
    questionVariants: [
      'College bus timings and route list',
      'Bus pass kaise banwaye?',
      'Transport fee per semester',
      'Bus schedule for day scholars'
    ],
    answer: 'The institute operates 18 AC and non-AC bus routes connecting major metro stations, railway terminals, and city residential hubs. Morning buses arrive at campus by 8:30 AM, and departure is at 5:15 PM (with an additional 7:00 PM shuttle for lab/library students). Bus pass fee is ₹14,000 per semester. Applications can be submitted at Transport Desk in Admin Block Room 102 with student ID.',
    sourceDoc: 'Campus Transport Services Circular 2025/TS/04',
    sectionOrRule: 'Section 2 - Route Matrix & Pass Issuance',
    updatedAt: '2025-07-20',
    tags: ['bus routes', 'transport', 'bus pass', 'shuttle']
  },
  {
    id: 'faq-trans-2',
    category: 'Transport',
    question: 'Is student parking available on campus for two-wheelers and four-wheelers?',
    questionVariants: [
      'Student bike parking sticker',
      'Can students bring cars to college campus?',
      'Parking charges and helmet rules'
    ],
    answer: 'Designated student parking is available at Gate No. 2. Two-wheelers require a college parking sticker (issued free of charge from Security Office with valid driving license and helmet check). Student four-wheelers are not permitted inside the core academic zone; day scholar cars must park in the North Visitor Lot subject to parking pass.',
    sourceDoc: 'Campus Transport Services Circular 2025/TS/04',
    sectionOrRule: 'Section 5 - Campus Vehicle Regulations',
    updatedAt: '2025-07-20',
    tags: ['parking', 'bike sticker', 'gate rules', 'vehicle']
  },

  // 7. PLACEMENTS & INTERNSHIPS
  {
    id: 'faq-place-1',
    category: 'Placements & Internships',
    question: 'What are the eligibility criteria and registration rules for campus placements?',
    questionVariants: [
      'Placement eligibility criteria CGPA backlogs',
      'TPO placement registration kab hota hai?',
      'Dream offer and one-student-one-job policy',
      'Can students with backlogs sit for placements?'
    ],
    answer: 'Students entering the 7th semester with minimum 60% (or 6.5 CGPA) across 10th, 12th, and B.Tech, with no active backlogs, are eligible for Training & Placement Office (TPO) drives. The college enforces a "One Student, One Job" policy; however, students who secure an offer under ₹8 LPA can sit for a "Dream Offer" company offering ₹12 LPA or higher.',
    sourceDoc: 'Training & Placement Office (TPO) Policy 2025-26',
    sectionOrRule: 'Section 3 - Registration and Offer Categorization',
    updatedAt: '2025-06-15',
    tags: ['placement', 'tpo', 'eligibility', 'dream offer']
  },
  {
    id: 'faq-place-2',
    category: 'Placements & Internships',
    question: 'How do I obtain a No Objection Certificate (NOC) for off-campus summer internships?',
    questionVariants: [
      'Internship NOC format and signature',
      'Summer internship permission letter',
      'How to get NOC from HOD for internship?'
    ],
    answer: 'To get an internship NOC: (1) Download the NOC Request Form from the TPO Portal; (2) Attach the company offer letter with dates and stipend details; (3) Submit to your Department Placement Faculty Coordinator for verification; (4) Dean of Student Affairs signs and issues the official stamp within 3 working days.',
    sourceDoc: 'Training & Placement Office (TPO) Policy 2025-26',
    sectionOrRule: 'Section 6 - Internship Guidelines & Credit Recognition',
    updatedAt: '2025-06-15',
    tags: ['noc', 'internship', 'tpo letter', 'summer training']
  },

  // 8. CLUBS, SPORTS & EVENTS
  {
    id: 'faq-club-1',
    category: 'Clubs & Events',
    question: 'What student technical and cultural clubs exist and how can a fresher join them?',
    questionVariants: [
      'How to join college clubs like robotics coding dance music?',
      'Club recruitments freshers kab hote hai?',
      'IEEE, ACM, GDG, Literary club joining',
      'College annual cultural and tech fest dates'
    ],
    answer: 'The college has over 35 active clubs across Technical (ACM, IEEE, Robotics, Cyber Security, GDG), Cultural (Music, Dance, Dramatics, Fine Arts), and Literary/Social domains. Freshers orientations and club inductions take place annually in the 3rd week of September during "Club Expo". Membership is free, and registration forms are shared via college emails.',
    sourceDoc: 'Student Activities Council (SAC) Constitution 2025',
    sectionOrRule: 'Article 4 - Club Structure & Fresher Induction',
    updatedAt: '2025-08-01',
    tags: ['clubs', 'fresher induction', 'cultural fest', 'sac']
  },
  {
    id: 'faq-club-2',
    category: 'Clubs & Events',
    question: 'What sports facilities and gymnasium amenities are open to students?',
    questionVariants: [
      'Gym timings and swimming pool fees',
      'Badminton, cricket ground, basketball court access',
      'Sports equipment issue process'
    ],
    answer: 'The campus features an indoor sports complex (badminton courts, table tennis, squash, multi-station gym) and outdoor grounds for cricket, football, volleyball, and tennis. Gym timings: 6:00 AM - 8:30 AM (Morning) and 5:00 PM - 8:30 PM (Evening). Sports equipment can be issued from the Sports Officer desk using Student ID Card.',
    sourceDoc: 'Student Activities Council (SAC) Constitution 2025',
    sectionOrRule: 'Article 9 - Sports Infrastructure Regulations',
    updatedAt: '2025-08-01',
    tags: ['sports', 'gym timings', 'badminton court', 'equipment']
  },

  // 9. HEALTH, EMERGENCY & CONTACTS
  {
    id: 'faq-contact-1',
    category: 'Campus Facilities & Contacts',
    question: 'What are the Campus Health Centre timings, doctor availability, and ambulance emergency numbers?',
    questionVariants: [
      'Health centre doctor timings and medical room',
      'Ambulance emergency number campus',
      'Free medicines and dispensary for students',
      'Doctor kab milta hai campus me?'
    ],
    answer: 'The Campus Health Centre operates 24/7 with round-the-clock nursing staff and a dedicated emergency ambulance. Resident doctors are on duty Monday to Saturday: Morning (9:00 AM - 1:00 PM) and Evening (4:00 PM - 7:00 PM). Emergency Helpline: +91-11-2766-7911 / Internal Ext: 108. Basic OPD consultations and essential generic medications are free for enrolled students.',
    sourceDoc: 'Campus Health Centre & Emergency Protocol 2025',
    sectionOrRule: 'Clause 2 - Emergency Protocols & Dispensary Schedule',
    updatedAt: '2025-07-15',
    tags: ['health centre', 'doctor', 'ambulance', 'emergency contact']
  },
  {
    id: 'faq-contact-2',
    category: 'Campus Facilities & Contacts',
    question: 'What are the main administrative office hours and official contact emails for student queries?',
    questionVariants: [
      'College helpdesk phone number and email',
      'Admin block timings and registrar contact',
      'Accounts office opening hours',
      'Contact number for admissions and exams'
    ],
    answer: 'All Administrative offices (Academic Section, Accounts, Examination Branch, Registrar) operate Monday through Friday from 9:00 AM to 5:00 PM (Lunch break: 1:00 PM - 2:00 PM; public windows close at 4:00 PM). Key Contacts: General Helpdesk: helpdesk@college.edu (+91-11-2766-7000); Accounts: accounts@college.edu; Exams: coe@college.edu; Hostel Warden: chiefwarden@college.edu.',
    sourceDoc: 'General Administrative Directory 2025-26',
    sectionOrRule: 'Directory Section 1 - Key Helpdesks and Public Windows',
    updatedAt: '2025-08-20',
    tags: ['helpdesk', 'office hours', 'admin block', 'phone numbers']
  },
  {
    id: 'faq-contact-3',
    category: 'Campus Facilities & Contacts',
    question: 'How does a student report ragging, harassment, or submit an anonymous grievance?',
    questionVariants: [
      'Anti-ragging helpline number and complaint process',
      'Women safety committee and ICC complaint',
      'Anonymous grievance portal link',
      'Ragging complaint kahan kare?'
    ],
    answer: 'The college has a zero-tolerance policy against ragging and harassment. Report immediately to: 24/7 National Anti-Ragging Helpline (Toll-Free 1800-180-5522) or College Anti-Ragging Squad (+91-98765-43210 / antiragging@college.edu). For gender harassment, the Internal Complaints Committee (ICC) can be reached at icc@college.edu. Anonymous grievances can also be dropped in the sealed boxes outside Room 104.',
    sourceDoc: 'Statutory Anti-Ragging and Grievance Redressal Policy 2025',
    sectionOrRule: 'Section 2 - Helplines & ICC Redressal Mechanism',
    updatedAt: '2025-08-01',
    tags: ['anti-ragging', 'grievance', 'icc', 'safety helpline']
  },
  {
    id: 'faq-contact-4',
    category: 'Campus Facilities & Contacts',
    question: 'How do students connect to the campus Wi-Fi network and register their devices?',
    questionVariants: [
      'Campus Wi-Fi login password',
      'MAC address registration for hostel wifi',
      'Internet connection not working college wifi',
      'IT helpdesk contact for wifi'
    ],
    answer: 'To connect to "Campus_HighSpeed_Secure": (1) Select the SSID and open captive portal (wifi.college.edu); (2) Log in with your Student ERP User ID and password; (3) Each student can register up to 2 devices (e.g. 1 phone, 1 laptop) per MAC address binding. For network issues, contact Computer Centre Helpdesk at itcell@college.edu or Ext: 304.',
    sourceDoc: 'IT Infrastructure & Acceptable Use Policy 2025',
    sectionOrRule: 'Section 4 - Wireless Network Access & Device Quotas',
    updatedAt: '2025-07-25',
    tags: ['wifi', 'internet', 'it helpdesk', 'mac registration']
  }
];

export const CATEGORIES = [
  'All',
  'Academics',
  'Fees & Scholarships',
  'Exams & Results',
  'Library',
  'Hostel & Mess',
  'Transport',
  'Placements & Internships',
  'Clubs & Events',
  'Campus Facilities & Contacts'
] as const;

export const QUICK_REPLIES = [
  'Attendance criteria for semester exams',
  'Semester fee payment deadline & late fine',
  'Hostel night outpass & curfew timing',
  'Placement eligibility & Dream Offer rules',
  'Central library timings & book limit',
  'Campus bus routes and fee',
  'Scholarships for low-income students',
  'Health centre doctor timings & ambulance'
];
