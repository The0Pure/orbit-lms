import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// BRAND COLORS
// ═══════════════════════════════════════════
const C = {
  navy:"#2D3347", navyL:"#3D4560", cream:"#D5CFC1", creamL:"#E8E4DD",
  gold:"#B8965A", goldD:"#8B6F4E", teal:"#4A7C6F", plum:"#5B6B8A",
  slate:"#4A6B7C", rust:"#7C4A4A", bg:"#F5F2ED", text:"#1A1F2E",
  danger:"#DC2626", dangerBg:"#FEE2E2", success:"#059669", successBg:"#D1FAE5",
};

// ═══════════════════════════════════════════
// SAR RIYAL SYMBOL (official SVG)
// ═══════════════════════════════════════════
const RiyalSymbol = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 1124.14 1256.39" fill={color} style={{ display:"inline-block", verticalAlign:"middle", marginLeft:2 }}>
    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>
    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>
  </svg>
);

const fmt = (n) => {
  const num = Number(n) || 0;
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,direction:"ltr"}}>{num.toLocaleString("en")}<RiyalSymbol size={12} color="currentColor"/></span>;
};
// For non-JSX contexts, keep as text
const fmtStr = (n) => `${Number(n||0).toLocaleString("en")} ر.س`;

// JSX price display component (use this everywhere in JSX)
const Price = ({ value, size=18, bold=800, color }) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:size,fontWeight:bold,color:color||C.navy,direction:"ltr"}}>
    {Number(value||0).toLocaleString("en")}
    <RiyalSymbol size={Math.round(size*0.72)} color={color||C.navy}/>
  </span>
);

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const PATTERN_TYPES = ["circles","grid","bars","waves","dots","diagonal"];
const CATEGORIES    = ["Design Foundations","Interior Design Principles","Color Theory","AutoCAD","SketchUp","3ds Max & V-Ray","Revit","Lumion","Architectural Photography","Portfolio Building","Professional Presentation","Freelancing","Project Management","Client Communication","Sustainability"];
const LEVELS        = ["Beginner","Intermediate","Advanced"];
const ROLES         = ["student","instructor","moderator","customer_service"];
const MONTHS        = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ═══════════════════════════════════════════
// BILINGUAL CONTENT — from Orbit LMS Content Strategy
// ═══════════════════════════════════════════
const T = {
  en: {
    dir: "ltr",
    lang: "en",
    nav: { home:"Home", courses:"Courses", dashboard:"Dashboard", signIn:"Sign In", signOut:"Sign Out", adminPanel:"Admin Panel" },
    hero: {
      badge: "Trusted by 500+ Enrolled Students",
      title: "Learn Interior Design\nthe Right Way",
      sub: "Specialized courses for architecture & interior design students — practical content that builds real skills and a portfolio that opens doors.",
      cta1: "Start Your Journey Now →",
      cta2: "Browse Free Courses",
    },
    stats: [
      { v:"+500", l:"Enrolled Students" },
      { v:"+20",  l:"Specialized Courses" },
      { v:"100%", l:"Practical Content" },
      { v:"✓",    l:"Certified Completion" },
    ],
    why: {
      title: "Why Choose Orbit for Your Specialty?",
      items: [
        { t:"Built for Your Specialty", d:"Not generic courses. Every lesson targets interior design & architecture students." },
        { t:"Learn at Your Own Pace",   d:"Pre-recorded sessions fit around your university schedule." },
        { t:"Practical Application",    d:"Projects and exercises with every course. Not just watching — doing." },
        { t:"Build a Real Portfolio",   d:"Graduate with work that showcases your skills to employers." },
      ],
    },
    featured: { title:"Top Courses — Start with the Best", sub:"Every course is designed to move your career forward — one step at a time." },
    categories: { title:"Browse by Category", sub:"Find the perfect course for your career goals" },
    testimonials: {
      title: "Students Speak — No Sugar Coating",
      items: [
        { q:"Before Orbit I was lost on YouTube wasting time. Now I have a full portfolio and I'm still in university.", name:"Sara M.", role:"Architecture Student, 3rd Year" },
        { q:"The courses are actually practical, not just talk. Every lesson has real application.", name:"Ahmed K.", role:"Interior Design Graduate" },
      ],
    },
    cta: { title:"Ready to Start? Every Day You Wait, Someone Else Moves Ahead.", sub:"Join thousands of professionals who chose Orbit to accelerate their careers.", btn:"Sign Up Free Now" },
    courses: { title:"All Courses — Learn What Actually Matters", sub:"expert-led courses in interior design & architecture", empty:"No courses found for this filter — try another category or contact us." },
    filters: { all:"All", popular:"Most Popular", newest:"Newest", free:"Free", level:"Level", search:"Search courses, instructors..." },
    levels: { Beginner:"Beginner", Intermediate:"Intermediate", Advanced:"Advanced" },
    courseCard: { lessons:"Lessons:", duration:"Duration:", level:"Level:", free:"Free", paid:"Paid", startNow:"Start Now", preview:"Watch Preview", enrolled:"Already Enrolled", continue:"Continue Where You Left Off →" },
    courseDetail: { curriculum:"Course Content", overview:"About", whatLearn:"What You'll Learn", requirements:"Requirements", whoFor:"Who Is This For?", instructor:"About the Instructor", reviews:"Student Reviews", enroll:"Enroll in Course", watchPreview:"Watch Free Preview", duration:"Course Duration:", lessons:"Number of Lessons:", levelLabel:"Course Level:", updated:"Last Updated:", certificate:"Certificate of Completion", joinStudents:"Join {n} students already enrolled", enrollNow:"Enroll Now — Start Learning Immediately", continueNow:"Continue Learning →" },
    dashboard: {
      welcome: "Welcome back, {name} 👋 — Keep the momentum going",
      stats: ["My Courses","My Certificates","Hours Learned","Streak"],
      sections: { myCourses:"My Courses", continueLearning:"Continue Learning", lastWatched:"Last Watched", progress:"My Progress", certificates:"My Certificates" },
      labels: { completed:"Completed ✅", inProgress:"In Progress ⏳", notStarted:"Not Started Yet", continueCourse:"Continue Course →", rateCourse:"Rate This Course", downloadCert:"Download Certificate" },
      motivational: { p0:"Start now — the first step is the hardest!", p25:"Great progress! You're a quarter of the way there 💪", p50:"Halfway there! Don't stop now 🔥", p75:"Almost there! Your certificate is waiting 🏆", p100:"Well done! Course complete — your certificate is ready 🎓" },
      empty: { title:"No Courses Yet", sub:"Enroll in a course to start learning", btn:"Browse Courses" },
    },
    login: { title:"Welcome Back — Continue Where You Left Off", email:"Email Address", password:"Password", remember:"Remember Me", forgot:"Forgot Password?", btn:"Log In", noAccount:"Don't have an account?", signupLink:"Sign Up Free", orWith:"Or log in with" },
    signup: { title:"Create Account", firstName:"First Name", lastName:"Last Name", email:"Email Address", phone:"Mobile Number", password:"Password", btn:"Create Account", hasAccount:"Already have an account?", loginLink:"Sign In", terms:"By signing up, you agree to our Terms of Service and Privacy Policy." },
    about: { title:"About Orbit", mission:"Our Mission", missionText:"Orbit exists to make world-class education accessible to interior design & architecture students. We partner with industry practitioners to deliver courses that translate directly to real-world skills and career advancement.", team:"Our Team — Designers and Educators First", stats:[{v:"500+",l:"Active Learners"},{v:"20+",l:"Expert Instructors"},{v:"98%",l:"Satisfaction Rate"}] },
    footer: { tagline:"Orbit — Where Future Designers Begin", newsletter:"Subscribe to our newsletter — design tips and exclusive content every week", placeholder:"Enter your email", subscribe:"Subscribe", copyright:"All rights reserved © Orbit LMS 2026", nav:["Home","Courses","About Us","Contact Us"], support:["Help Center","Privacy Policy","Terms of Service","FAQ"] },
    payment: { title:"Enroll in Course", emailLabel:"Email for Invoice", payBtn:"Payment", summary:"Order Summary", subtotal:"Course price", vat:"VAT (15%)", total:"Total", secured:"🔒 Secured · Invoice sent to your email automatically" },
    admin: { overview:"Dashboard Overview", revenue:"Revenue Comparison", totalRevenue:"Total Revenue", totalCourses:"Total Courses", students:"Students", orders:"Orders", published:"published", registered:"registered" },
  },
  ar: {
    dir: "rtl",
    lang: "ar",
    nav: { home:"الرئيسية", courses:"الكورسات", dashboard:"لوحتي", signIn:"تسجيل الدخول", signOut:"تسجيل الخروج", adminPanel:"لوحة الإدارة" },
    hero: {
      badge: "+500 طالب مسجّل يثقون بـ Orbit",
      title: "تعلّم التصميم الداخلي\nبالطريقة الصح",
      sub: "كورسات متخصصة لطلاب الهندسة والتصميم الداخلي — محتوى عملي يبنيلك مهارات حقيقية وبورتفوليو يفتحلك الأبواب.",
      cta1: "ابدأ رحلتك الآن ←",
      cta2: "تصفح الكورسات المجانية",
    },
    stats: [
      { v:"+500", l:"طالب مسجّل" },
      { v:"+20",  l:"كورس متخصص" },
      { v:"100%", l:"محتوى عملي" },
      { v:"✓",    l:"شهادات معتمدة" },
    ],
    why: {
      title: "ليش تختار Orbit لتخصصك؟",
      items: [
        { t:"مبني لتخصصك",      d:"ليس مجرد كورسات عامة. كل درس مصمم خصيصاً لطلاب التصميم الداخلي والهندسة." },
        { t:"تعلّم بوقتك",       d:"جلسات مسجّلة تتناسب مع جدولك الجامعي — بدون ضغط." },
        { t:"تطبيق عملي",       d:"مشاريع وتمارين مع كل كورس. مش بس مشاهدة — تطبيق حقيقي." },
        { t:"بورتفوليو حقيقي",  d:"تخرّج بأعمال تعكس مستواك وتفتحلك أبواب التوظيف والفريلانسينج." },
      ],
    },
    featured: { title:"أبرز الكورسات — ابدأ بالأفضل", sub:"كل كورس مصمم يأخذك خطوة للأمام في مسيرتك المهنية." },
    categories: { title:"تصفح حسب الفئة", sub:"اختر التخصص اللي يناسب مسيرتك" },
    testimonials: {
      title: "الطلاب يتكلمون — بدون تجميل",
      items: [
        { q:"قبل Orbit كنت أبحث في يوتيوب وأضيع وقت. الآن عندي بورتفوليو كامل وأنا لسه في الجامعة.", name:"سارة م.", role:"طالبة هندسة معمارية، السنة الثالثة" },
        { q:"الكورسات عملية فعلاً، مش كلام. كل درس فيه تطبيق حقيقي.", name:"أحمد ك.", role:"خريج تصميم داخلي" },
      ],
    },
    cta: { title:"جاهز تبدأ؟ كل يوم تأخره هو يوم قدام غيرك.", sub:"انضم لآلاف الطلاب اللي اختاروا Orbit لتطوير مسيرتهم.", btn:"سجّل الآن — مجاناً" },
    courses: { title:"كل الكورسات — تعلّم اللي يفرق معاك", sub:"كورسات متخصصة في التصميم الداخلي والهندسة", empty:"ما وجدنا كورسات بهذا الفلتر — جرّب فئة أخرى أو تواصل معنا." },
    filters: { all:"الكل", popular:"الأكثر مشاهدة", newest:"الأحدث", free:"مجاني", level:"المستوى", search:"ابحث عن كورس أو مدرّب..." },
    levels: { Beginner:"مبتدئ", Intermediate:"متوسط", Advanced:"متقدم" },
    courseCard: { lessons:"الدروس:", duration:"المدة:", level:"المستوى:", free:"مجاني", paid:"مدفوع", startNow:"ابدأ الآن", preview:"شاهد المقدمة", enrolled:"مسجّل مسبقاً", continue:"كمّل من حيث توقفت ←" },
    courseDetail: { curriculum:"محتوى الكورس", overview:"عن الكورس", whatLearn:"ماذا ستتعلم؟", requirements:"متطلبات الكورس", whoFor:"هذا الكورس لمن؟", instructor:"عن المدرّب", reviews:"آراء الطلاب", enroll:"اشترك في الكورس", watchPreview:"شاهد الدرس التجريبي", duration:"مدة الكورس:", lessons:"عدد الدروس:", levelLabel:"مستوى الكورس:", updated:"آخر تحديث:", certificate:"شهادة إتمام", joinStudents:"انضم لـ {n} طالب التحقوا بهذا الكورس", enrollNow:"اشترك الآن — وابدأ التعلم فوراً", continueNow:"كمّل التعلم ←" },
    dashboard: {
      welcome: "أهلاً {name} 👋 — كمّل رحلتك اليوم",
      stats: ["كورساتي","شهاداتي","ساعات التعلم","أيام متتالية"],
      sections: { myCourses:"كورساتي", continueLearning:"كمّل التعلم", lastWatched:"آخر ما شاهدته", progress:"تقدمي", certificates:"شهاداتي" },
      labels: { completed:"مكتمل ✅", inProgress:"قيد التعلم ⏳", notStarted:"لم تبدأ بعد", continueCourse:"اكمل الكورس ←", rateCourse:"تقييم الكورس", downloadCert:"تحميل الشهادة" },
      motivational: { p0:"ابدأ الآن — الخطوة الأولى هي الأصعب!", p25:"ماشي بشكل ممتاز! ربع الطريق وراك 💪", p50:"منتصف الطريق! لا تتوقف الآن 🔥", p75:"قريب جداً من الإتمام! الشهادة في انتظارك 🏆", p100:"أحسنت! اكتملت الكورس وكسبت شهادتك 🎓" },
      empty: { title:"ما سجّلت في أي كورس بعد", sub:"اشترك في كورس وابدأ رحلتك", btn:"تصفح الكورسات" },
    },
    login: { title:"أهلاً بعودتك — كمّل من حيث توقفت", email:"البريد الإلكتروني", password:"كلمة المرور", remember:"تذكرني", forgot:"نسيت كلمة المرور؟", btn:"تسجيل الدخول", noAccount:"ليس لديك حساب؟", signupLink:"سجّل الآن — مجاناً", orWith:"أو تسجيل الدخول بـ" },
    signup: { title:"إنشاء حساب جديد", firstName:"الاسم الأول", lastName:"اسم العائلة", email:"البريد الإلكتروني", phone:"رقم الجوال", password:"كلمة المرور", btn:"إنشاء الحساب", hasAccount:"لديك حساب بالفعل؟", loginLink:"تسجيل الدخول", terms:"بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية." },
    about: { title:"من نحن", mission:"رسالتنا", missionText:"Orbit موجودة لتجعل التعليم العالمي في متناول طلاب التصميم الداخلي والهندسة. نتعاون مع ممارسين في الصناعة لتقديم كورسات تترجم مباشرةً لمهارات حقيقية وفرص مهنية.", team:"فريقنا — مصممون ومدرّبون قبل أي شيء", stats:[{v:"+500",l:"متعلم نشط"},{v:"+20",l:"مدرّب متخصص"},{v:"98%",l:"معدل الرضا"}] },
    footer: { tagline:"Orbit — حيث يبدأ مصممو المستقبل", newsletter:"اشترك في نشرتنا — نصائح تصميم ومحتوى حصري كل أسبوع", placeholder:"أدخل بريدك الإلكتروني", subscribe:"اشترك", copyright:"جميع الحقوق محفوظة © Orbit LMS 2026", nav:["الرئيسية","الكورسات","من نحن","تواصل معنا"], support:["مركز المساعدة","سياسة الخصوصية","الشروط والأحكام","الأسئلة الشائعة"] },
    payment: { title:"الاشتراك في الكورس", emailLabel:"البريد الإلكتروني للفاتورة", payBtn:"الدفع", summary:"ملخص الطلب", subtotal:"سعر الكورس", vat:"ضريبة القيمة المضافة (15%)", total:"الإجمالي", secured:"🔒 آمن · الفاتورة تُرسل تلقائياً على بريدك" },
    admin: { overview:"نظرة عامة", revenue:"مقارنة الإيرادات", totalRevenue:"إجمالي الإيرادات", totalCourses:"إجمالي الكورسات", students:"الطلاب", orders:"الطلبات", published:"منشور", registered:"مسجّل" },
  },
};

// Category names bilingual map
const CAT_AR = {
  "Design Foundations":"أساسيات التصميم","Interior Design Principles":"مبادئ التصميم الداخلي",
  "Color Theory":"نظرية الألوان","AutoCAD":"أوتوكاد للمصممين","SketchUp":"SketchUp الأساسيات",
  "3ds Max & V-Ray":"3ds Max وV-Ray","Revit":"Revit للتصميم الداخلي","Lumion":"التصور المعماري بـ Lumion",
  "Architectural Photography":"التصوير المعماري","Portfolio Building":"بناء البورتفوليو",
  "Professional Presentation":"العرض والتقديم المهني","Freelancing":"الفريلانسينج للمصممين",
  "Project Management":"إدارة المشاريع","Client Communication":"التواصل مع العملاء",
  "Sustainability":"الاستدامة في التصميم",
  "Design":"التصميم","Development":"التطوير","Data":"البيانات","Cloud":"الحوسبة السحابية",
  "Security":"الأمن","Mobile":"تطوير الجوال","Business":"الأعمال","Marketing":"التسويق",
};
const LEVEL_AR = { Beginner:"مبتدئ", Intermediate:"متوسط", Advanced:"متقدم" };
// ═══════════════════════════════════════════
// SECURITY — admin auth (hash-based, no plaintext in UI)
// In production: move to server-side auth (Supabase, Firebase, etc.)
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// SECURITY — admin auth (obfuscated, no plaintext)
// Production: migrate to server-side auth (Supabase / Firebase Auth)
// ═══════════════════════════════════════════
const _a = "bGlua3liaW5reTlAZ21haWwuY29t";
const _b = "bUdteiRkcXlUN0pxUktLRUJlNkE=";
const checkAdmin = (e,p) => btoa(e)===_a && btoa(p)===_b;

// ═══════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════
const ls = (k,d) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch{return d;} };
const ss = (k,v) => localStorage.setItem(k,JSON.stringify(v));

// ═══════════════════════════════════════════
// SECURITY UTILITIES
// ═══════════════════════════════════════════
const sanitize = (str) => String(str||"").replace(/[<>'"]/g,"").trim().slice(0,500);

// Login rate limiter — max 5 attempts per 15 min
const loginLimiter = {
  key: "orb_login_attempts",
  check() {
    const data = ls(this.key, {count:0, ts: Date.now()});
    const elapsed = Date.now() - data.ts;
    if (elapsed > 15 * 60 * 1000) { ss(this.key, {count:0, ts:Date.now()}); return true; }
    return data.count < 5;
  },
  increment() {
    const data = ls(this.key, {count:0, ts:Date.now()});
    const elapsed = Date.now() - data.ts;
    const ts = elapsed > 15*60*1000 ? Date.now() : data.ts;
    const count = elapsed > 15*60*1000 ? 1 : data.count+1;
    ss(this.key, {count, ts});
  },
  reset() { ss(this.key, {count:0, ts:Date.now()}); },
  remaining() {
    const data = ls(this.key, {count:0, ts:Date.now()});
    const mins = Math.ceil((15*60*1000 - (Date.now()-data.ts))/60000);
    return { locked: data.count>=5, mins };
  }
};
// ═══════════════════════════════════════════
// LOGO
// ═══════════════════════════════════════════
const OrbitLogo = ({ size=36, light=false }) => {
  // Faithful recreation of the Orbit brand logo:
  // Outer square bg (navy), large cream circle, open arc (navy), dot (navy)
  const bg     = light ? C.cream  : C.navy;
  const circle = light ? C.navy   : C.cream;
  const mark   = light ? C.cream  : C.navy;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Outer background square rounded */}
      <rect width="100" height="100" rx="22" fill={bg}/>
      {/* Large cream circle */}
      <circle cx="50" cy="52" r="36" fill={circle}/>
      {/* Open arc — matches the logo: arc from ~220° to ~320° is open (gap at bottom-centre) */}
      <path
        d="M 26,52 A 24,24 0 1 1 74,52"
        stroke={mark}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dot below arc centre */}
      <circle cx="50" cy="68" r="4.5" fill={mark}/>
    </svg>
  );
};

// ═══════════════════════════════════════════
// COURSE THUMBNAIL
// ═══════════════════════════════════════════
const CourseThumbnail = ({ color, patternType, iconUrl }) => {
  const c   = color || C.navy;
  const l1  = "rgba(255,255,255,0.12)";
  const l2  = "rgba(255,255,255,0.06)";
  const pat = {
    circles:  <>{[0,1,2,3].map(i=><circle key={i} cx={320+i*10} cy={110} r={50+i*38} fill="none" stroke={l1} strokeWidth="1.5"/>)}<circle cx="80" cy="160" r="60" fill={l2}/><circle cx="340" cy="40" r="30" fill={l1}/></>,
    grid:     <>{[0,1,2,3,4,5,6,7,8,9].map(i=><line key={`v${i}`} x1={i*44} y1="0" x2={i*44} y2="220" stroke={l1} strokeWidth="1"/>)}{[0,1,2,3,4,5].map(i=><line key={`h${i}`} x1="0" y1={i*44} x2="400" y2={i*44} stroke={l1} strokeWidth="1"/>)}<rect x="260" y="60" width="100" height="100" rx="16" fill={l1}/></>,
    bars:     <>{[40,100,160,220,280,340].map((x,i)=><rect key={x} x={x-14} y={60+i*8} width="22" height={150-i*18} fill={l1} rx="3"/>)}</>,
    waves:    <><path d="M0,100 Q100,50 200,100 T400,100 L400,220 L0,220 Z" fill={l2}/><path d="M0,140 Q100,90 200,140 T400,140 L400,220 L0,220 Z" fill={l1} opacity="0.6"/></>,
    dots:     <>{Array.from({length:8}).map((_,r)=>Array.from({length:12}).map((_,cx)=><circle key={`${r}-${cx}`} cx={20+cx*35} cy={20+r*28} r="3" fill={l1}/>))}</>,
    diagonal: <>{[0,1,2,3,4,5,6,7,8,9,10].map(i=><line key={i} x1={i*50-100} y1="0" x2={i*50+100} y2="220" stroke={l1} strokeWidth="1.5"/>)}<rect x="140" y="60" width="120" height="100" rx="20" fill={l2}/></>,
  };
  // Always render pattern; overlay icon on top if provided
  return (
    <div style={{width:"100%",height:"100%",borderRadius:12,overflow:"hidden",position:"relative"}}>
      <svg viewBox="0 0 400 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{display:"block"}}>
        <rect width="400" height="220" fill={c}/>{pat[patternType]||pat.circles}
      </svg>
      {iconUrl && (
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src={iconUrl} alt="" style={{width:64,height:64,objectFit:"contain",opacity:1}}/>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════
const I = {
  Menu:     ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X:        ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Book:     ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Award:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></svg>,
  Chart:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Flame:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c0 0-5 4-5 10a5 5 0 0 0 10 0c0-3-2-6-2-6s-1 2-2 2-1-1-1-1S12 5 12 2z"/></svg>,
  Users:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Dollar:   ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Grid:     ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Settings: ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Exit:     ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  TrendUp:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
  Arrow:    ()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
  Star:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  Clock:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Search:   ()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Globe:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Sparkle:  ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/></svg>,
  Play:     ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>,
  Check:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>,
  Lock:     ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ChevDown: ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9"/></svg>,
  Shield:   ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  CreditCard:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Filter:   ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>,
  Sliders:  ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  Upload:   ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Download: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  UserPlus: ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Mail:     ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Briefcase:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Info:     ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Tag:      ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
};

// ═══════════════════════════════════════════
// ROLE BADGE
// ═══════════════════════════════════════════
const roleMeta = {
  admin:            { color:"#7C3AED", bg:"#EDE9FE",      label:"Admin" },
  instructor:       { color:C.teal,   bg:`${C.teal}18`,   label:"Instructor" },
  student:          { color:C.navy,   bg:C.creamL,        label:"Student" },
  moderator:        { color:C.slate,  bg:`${C.slate}18`,  label:"Moderator" },
  customer_service: { color:"#D97706", bg:"#FEF3C7",      label:"Customer Service" },
};
const RoleBadge = ({ role }) => {
  const m = roleMeta[role] || roleMeta.student;
  return <span style={{fontSize:11,padding:"3px 10px",background:m.bg,color:m.color,borderRadius:20,fontWeight:700,letterSpacing:0.5}}>{m.label}</span>;
};

// ═══════════════════════════════════════════
// EMAIL UTILITY — EmailJS wrapper
// Supports: "activation" | "career_applicant" | "career_admin"
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// EMAIL UTILITY — Brevo (formerly Sendinblue)
// 300 free emails/day, no template system needed
// Just needs API Key + sender email in Admin Settings
// ═══════════════════════════════════════════
async function sendEmail(type, params) {
  const cfg = ls("orb_email_cfg", { provider:"brevo", apiKey:"", senderEmail:"", senderName:"Orbit Learning" });

  if (!cfg.apiKey || !cfg.senderEmail) {
    console.warn(`[Orbit Email] Not configured. Type="${type}" to="${params.to_email}"`);
    return false;
  }

  // Build email HTML based on type
  const platform = params.platform || ls("orb_siteName","Orbit Learning");
  const accent   = "#B8965A";
  const navy     = "#2D3347";

  const htmlBody = (title, body, btnText, btnUrl) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#F5F2ED;padding:32px 16px">
      <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(45,51,71,0.08)">
        <div style="background:${navy};padding:28px 32px;text-align:center">
          <h1 style="color:#D5CFC1;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.5px">${platform}</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:${navy};font-size:20px;font-weight:700;margin:0 0 16px">${title}</h2>
          <div style="color:#4A5568;font-size:15px;line-height:1.8">${body}</div>
          ${btnText && btnUrl ? `
          <div style="text-align:center;margin:28px 0">
            <a href="${btnUrl}" style="display:inline-block;padding:14px 36px;background:${accent};color:#fff;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none">${btnText}</a>
          </div>` : ""}
        </div>
        <div style="background:#F5F2ED;padding:16px 32px;text-align:center;font-size:12px;color:#9CA3AF">
          © ${new Date().getFullYear()} ${platform}. All rights reserved.
        </div>
      </div>
    </div>`;

  let subject, html;

  if (type === "activation") {
    subject = `Activate your ${platform} account`;
    html = htmlBody(
      `Welcome to ${platform}! 🎓`,
      `<p>Hi <strong>${params.to_name}</strong>,</p>
       <p>Thank you for signing up. Click the button below to activate your account and start learning.</p>
       <p style="color:#9CA3AF;font-size:13px">This link expires in 24 hours.</p>`,
      "✅ Activate My Account",
      params.activate_url
    );
  } else if (type === "reset_password") {
    subject = `Reset your ${platform} password`;
    html = htmlBody(
      "Password Reset Request 🔑",
      `<p>Hi <strong>${params.to_name}</strong>,</p>
       <p>We received a request to reset your password. Click the button below to create a new password.</p>
       <p style="color:#9CA3AF;font-size:13px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
      "🔑 Reset My Password",
      params.reset_url
    );
  } else if (type === "career_applicant") {
    subject = `Application Received – ${params.job_title} at ${platform}`;
    html = htmlBody(
      "Application Received ✓",
      `<p>Hi <strong>${params.to_name}</strong>,</p>
       <p>Thank you for applying to <strong>${params.job_title}</strong> at ${platform}.</p>
       <p>We've received your application and will review it carefully. We'll reach out if your profile is a match.</p>
       <p>Best regards,<br>The ${platform} Team</p>`,
      null, null
    );
  } else if (type === "career_admin") {
    subject = `New Application: ${params.applicant} → ${params.job_title}`;
    html = htmlBody(
      `New Job Application 📋`,
      `<p><strong>Position:</strong> ${params.job_title}</p>
       <p><strong>Applicant:</strong> ${params.applicant}</p>
       <p><strong>Email:</strong> ${params.app_email}</p>
       <p><strong>Phone:</strong> ${params.app_phone||"—"}</p>
       <hr style="border:none;border-top:1px solid #E8E4DD;margin:16px 0"/>
       <p><strong>Cover Letter:</strong><br>${(params.cover||"(none)").replace(/\n/g,"<br>")}</p>
       <p><strong>CV:</strong> ${params.cv_name||"Not uploaded"}</p>`,
      "View in Admin Panel",
      params.admin_url || `${window.location.origin}`
    );
  } else {
    subject = params.subject || `Message from ${platform}`;
    html = htmlBody(subject, `<p>${(params.message||"").replace(/\n/g,"<br>")}</p>`, null, null);
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key":      cfg.apiKey,
      },
      body: JSON.stringify({
        sender:  { name: cfg.senderName||platform, email: cfg.senderEmail },
        to:      [{ email: params.to_email, name: params.to_name||params.to_email }],
        subject,
        htmlContent: html,
      }),
    });
    if (res.ok || res.status===201) {
      console.info(`[Orbit Email] ✓ Sent "${type}" to ${params.to_email}`);
      return true;
    }
    const txt = await res.text();
    console.error(`[Orbit Email] ✗ Failed "${type}": ${res.status} — ${txt}`);
    return false;
  } catch(e) {
    console.error(`[Orbit Email] ✗ Network error:`, e);
    return false;
  }
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [page,       setPage]       = useState("home");
  const [adminSec,   setAdminSec]   = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user,       setUser]       = useState(null);
  const [courses,    setCourses]    = useState(()=>ls("orb_courses",[]));
  const [orders,     setOrders]     = useState(()=>ls("orb_orders",[]));
  const [users,      setUsers]      = useState(()=>ls("orb_users",[]));
  const [selCourse,  setSelCourse]  = useState(null);
  const [payModal,   setPayModal]   = useState(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [catFilter,  setCatFilter]  = useState("All");
  const [lang,       setLang]           = useState(()=>ls("orb_lang","en"));
  const [siteName,   setSiteNameApp]     = useState(()=>ls("orb_siteName","Orbit Learning"));
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [resetToken, setResetToken]   = useState(""); // triggers reset modal when set
  const [resetUserId, setResetUserId] = useState("");

  const t   = T[lang] || T.en;
  const isRTL = lang === "ar";

  const toggleLang = () => {
    const next = lang === "en" ? "ar" : "en";
    setLang(next); ss("orb_lang", next);
  };

  const save = (k,v,fn) => { fn(v); ss(k,v); };
  const saveCourses = v => save("orb_courses",v,setCourses);
  const saveOrders  = v => save("orb_orders",v,setOrders);
  const saveUsers   = v => save("orb_users",v,setUsers);

  const isAdmin  = user?.role === "admin";
  const isLogged = !!user;

  // ── AUTH ──
  const login = (email,pw) => {
    const { locked, mins } = loginLimiter.remaining();
    if (locked) return { ok:false, msg:`Too many attempts. Try again in ${mins} min.` };

    const cleanEmail = sanitize(email).toLowerCase();
    const cleanPw    = sanitize(pw);

    if (checkAdmin(cleanEmail, cleanPw)) {
      loginLimiter.reset();
      const a={id:"admin",email:cleanEmail,name:"Admin",role:"admin"};
      setUser(a); ss("orb_user",a); setPage("admin"); return { ok:true };
    }
    const f = users.find(u=>u.email===cleanEmail && u.password===cleanPw);
    if (f) {
      if (f.verified === false) {
        return { ok:false, msg: isRTL
          ? "يرجى تفعيل حسابك أولاً. تحقق من بريدك الإلكتروني للحصول على رابط التفعيل."
          : "Please verify your email first. Check your inbox for the activation link." };
      }
      loginLimiter.reset();
      const {password:_,...s}=f; setUser(s); ss("orb_user",s); setPage("dashboard"); return { ok:true };
    }
    loginLimiter.increment();
    return { ok:false, msg:"Invalid email or password" };
  };
  const signup = async (fd) => {
    const cleanEmail = sanitize(fd.email).toLowerCase();
    if (users.find(u=>u.email===cleanEmail)) return { ok:false, msg:"email_exists" };
    // Generate activation token
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const nu = {
      id:`u-${Date.now()}`,
      firstName: sanitize(fd.firstName),
      lastName:  sanitize(fd.lastName),
      name:`${sanitize(fd.firstName)} ${sanitize(fd.lastName)}`,
      email:     cleanEmail,
      phone:     sanitize(fd.phone||""),
      password:  fd.password,
      role:"student",
      verified:  false,      // must verify email before login
      token:     token,
      enrolledCourses:[],
      certificates:[]
    };
    saveUsers([...users,nu]);

    // ── SEND ACTIVATION EMAIL ──
    const activationUrl = `${window.location.origin}/?activate=${token}`;
    await sendEmail("activation", {
      to_name:      nu.firstName,
      to_email:     cleanEmail,
      activate_url: activationUrl,
      platform:     ls("orb_siteName","Orbit Learning"),
      subject:      `Activate your ${ls("orb_siteName","Orbit Learning")} account`,
    });

    return { ok:true, activationUrl };
  };
  const logout = () => { setUser(null); localStorage.removeItem("orb_user"); setPage("home"); setAvatarOpen(false); };

  // ── SOCIAL LOGIN (OAuth) ──
  const handleSocialLogin = (provider) => {
    if (provider !== "google") return;
    const clientId = "485439031935-tqt4qasj02os6u7pd05rqn902hck6u1c.apps.googleusercontent.com";
    const params = new URLSearchParams({
      client_id:     clientId,
      redirect_uri:  window.location.origin,
      response_type: "token id_token",
      scope:         "openid email profile",
      nonce:         Math.random().toString(36).slice(2),
      prompt:        "select_account",
    });
    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      "google_oauth",
      "width=500,height=600,left=400,top=100"
    );
    if (!popup) {
      alert("Please allow popups for this site to use Google Sign-In.");
      return;
    }
    const checkPopup = setInterval(() => {
      try {
        if (!popup || popup.closed) { clearInterval(checkPopup); return; }
        const hash = popup.location.hash;
        if (hash && hash.includes("access_token")) {
          clearInterval(checkPopup);
          popup.close();
          const idToken = new URLSearchParams(hash.slice(1)).get("id_token");
          if (idToken) {
            const payload = JSON.parse(
              atob(idToken.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))
            );
            _completeSocialLogin({
              name:    payload.name,
              email:   payload.email,
              picture: payload.picture,
            }, "google");
          }
        }
      } catch {}
    }, 500);
  };

  const _completeSocialLogin = (profile, provider) => {
    const email = profile.email?.toLowerCase();
    if (!email) return;
    // Find existing user or auto-register
    let existing = users.find(u => u.email === email);
    if (!existing) {
      const nameParts = (profile.name || email.split("@")[0]).split(" ");
      const nu = {
        id: `u-${Date.now()}`,
        firstName: nameParts[0] || "",
        lastName:  nameParts.slice(1).join(" ") || "",
        name:      profile.name || email.split("@")[0],
        email,
        password:  "",
        role:      "student",
        provider,
        avatar:    profile.picture || "",
        enrolledCourses: [],
        certificates:    [],
      };
      const updated = [...users, nu];
      saveUsers(updated);
      existing = nu;
    }
    const { password: _, ...safe } = existing;
    setUser(safe); ss("orb_user", safe); setPage("dashboard");
  };

  // ── NAVIGATION ──
  const nav = (p,c) => {
    if (c) setSelCourse(c);
    setPage(p);
    setMobileMenu(false);
    setAvatarOpen(false);
    window.scrollTo?.(0,0);
  };

  // Navigate with category filter pre-set
  const navWithCat = (cat) => {
    setCatFilter(cat);
    nav("courses");
  };

  // ── COURSE CRUD ──
  const addCourse    = c => { const nc={...c,id:`c-${Date.now()}`,students:0,rating:0,createdAt:new Date().toISOString()}; saveCourses([...courses,nc]); return nc; };
  const updateCourse = (id,u) => saveCourses(courses.map(c=>c.id===id?{...c,...u}:c));
  const deleteCourse = id => saveCourses(courses.filter(c=>c.id!==id));

  // ── ENROLL / PAYMENT ──
  const handleEnroll = (course) => {
    if (!isLogged) { nav("login"); return; }
    if (user.enrolledCourses?.includes(course.id)) { nav("course-learn",course); return; }
    // Free course — skip payment modal entirely
    if (course.isFree || Number(course.price)===0) {
      completePayment(course, "free", null);
      return;
    }
    setPayModal(course);
  };

  const completePayment = (course, method, discount) => {
    const idx = users.findIndex(u=>u.id===user.id);
    if (idx===-1) return;
    const uu=[...users];
    if (!uu[idx].enrolledCourses.includes(course.id)) uu[idx].enrolledCourses.push(course.id);
    saveUsers(uu);
    const updated={...user,enrolledCourses:uu[idx].enrolledCourses};
    setUser(updated); ss("orb_user",updated);
    updateCourse(course.id,{students:(course.students||0)+1});
    // Calculate final amount paid
    const subtotal  = Number(course.price)||0;
    const discAmt   = discount
      ? discount.type==="percent"
        ? Math.round(subtotal*(discount.value/100))
        : Math.min(discount.value,subtotal)
      : 0;
    const afterDisc = Math.max(0,subtotal-discAmt);
    const vat       = Math.round(afterDisc*0.15);
    const total     = method==="free" ? 0 : afterDisc+vat;
    const order={
      id:`ord-${Date.now()}`,userId:user.id,userName:user.name,userEmail:user.email,
      courseId:course.id,courseName:course.title,
      originalAmount:subtotal,discountCode:discount?.code||null,discountAmt:discAmt,
      amount:total,method,status:"completed",
      date:new Date().toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})
    };
    saveOrders([...orders,order]);
    setPayModal(null);
    if (method==="free") nav("course-learn",course);
  };

  // ── ADMIN USER MANAGEMENT ──
  const addUserAdmin = (userData) => {
    if (users.find(u=>u.email===userData.email)) return false;
    const nu={id:`u-${Date.now()}`,...userData,name:`${userData.firstName} ${userData.lastName}`,enrolledCourses:[],certificates:[]};
    saveUsers([...users,nu]); return true;
  };
  const updateUser   = (id,u) => saveUsers(users.map(x=>x.id===id?{...x,...u}:x));
  const deleteUser   = id => saveUsers(users.filter(x=>x.id!==id));

  useEffect(()=>{
    const s=ls("orb_user",null); if(s) setUser(s);

    // Handle activation link: ?activate=TOKEN
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("activate");
    if (token) {
      const allUsers = ls("orb_users",[]);
      const found    = allUsers.find(u=>u.token===token);
      if (found && !found.verified) {
        const updated = allUsers.map(u=>u.token===token ? {...u,verified:true,token:""} : u);
        ss("orb_users", updated);
        const {password:_,...safe} = updated.find(u=>u.id===found.id);
        setUser(safe); ss("orb_user",safe);
        window.history.replaceState({},"",window.location.pathname);
        setPage("dashboard");
        setActivationSuccess(true);
        setTimeout(()=>setActivationSuccess(false), 6000);
      }
    }

    // Handle reset password link: ?reset=TOKEN
    const resetTk = params.get("reset");
    if (resetTk) {
      const allUsers = ls("orb_users",[]);
      const found    = allUsers.find(u=>u.resetToken===resetTk);
      if (found && found.resetExpiry > Date.now()) {
        window.history.replaceState({},"",window.location.pathname);
        setResetToken(resetTk);
        setResetUserId(found.id);
        setPage("login");
      } else {
        window.history.replaceState({},"",window.location.pathname);
        // Expired or invalid — let user request a new one
        setPage("login");
      }
    }

    // Favicon
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill="#2D3347"/>
      <circle cx="50" cy="52" r="36" fill="#D5CFC1"/>
      <path d="M 26,52 A 24,24 0 1 1 74,52" stroke="#2D3347" stroke-width="5.5" stroke-linecap="round" fill="none"/>
      <circle cx="50" cy="68" r="4.5" fill="#2D3347"/>
    </svg>`;
    const faviconUrl = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = faviconUrl;
    document.title = ls("orb_siteName","Orbit Learning");
  },[]);

  const isAuth = page==="login"||page==="signup";
  const isAdm  = page==="admin";
  const pub    = courses.filter(c=>c.published);

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:isRTL?"'Cairo',sans-serif":"'DM Sans',sans-serif",direction:isRTL?"rtl":"ltr"}} lang={lang}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* ── NAVBAR ── */}
      {!isAdm && (
        <nav style={S.nav}>
          <div style={S.navIn}>
            <button onClick={()=>nav("home")} style={S.logoBtn}>
              <OrbitLogo size={32}/><span style={S.logoTxt}>{siteName.split(" ")[0]}</span>
            </button>
            <div className="d-nav">
              {[["home",t.nav.home],["courses",t.nav.courses]].map(([pg,label])=>(
                <button key={pg} onClick={()=>nav(pg)} style={{...S.navLink,color:page===pg?C.navy:"#6B7280",background:page===pg?"rgba(45,51,71,0.07)":"transparent"}}>{label}</button>
              ))}
              {isLogged && !isAdmin && <button onClick={()=>nav("dashboard")} style={S.navLink}>{t.nav.dashboard}</button>}
            </div>
            <div style={S.navR}>
              <button onClick={toggleLang} style={S.langBtn}>{lang==="en"?"عربي":"EN"}</button>
              {isLogged ? (
                <div style={{position:"relative"}}>
                  <button onClick={()=>setAvatarOpen(!avatarOpen)} style={S.avatarBtn}>
                    <div style={S.avatarCircle}>{user.name?.[0]?.toUpperCase()||"?"}</div>
                    <span className="d-nav" style={{fontSize:14,fontWeight:600,color:C.navy}}>{user.name?.split(" ")[0]}</span>
                    <I.ChevDown/>
                  </button>
                  {avatarOpen && <div style={S.avatarDrop}>
                    <div style={S.avatarHeader}>
                      <div style={{...S.avatarCircle,width:40,height:40,fontSize:16}}>{user.name?.[0]?.toUpperCase()}</div>
                      <div><p style={{fontSize:14,fontWeight:700,color:C.navy}}>{user.name}</p><p style={{fontSize:12,color:"#9CA3AF"}}>{user.email}</p><RoleBadge role={user.role}/></div>
                    </div>
                    <div style={S.avatarDiv}/>
                    <button onClick={()=>nav(isAdmin?"admin":"dashboard")} style={S.avatarItem}><I.Grid/>{isAdmin?t.nav.adminPanel:t.nav.dashboard}</button>
                    <button onClick={()=>nav("courses")} style={S.avatarItem}><I.Book/>{t.nav.courses}</button>
                    <div style={S.avatarDiv}/>
                    <button onClick={logout} style={{...S.avatarItem,color:C.danger}}><I.Exit/>{t.nav.signOut}</button>
                  </div>}
                </div>
              ) : (
                <button onClick={()=>nav("login")} style={S.navCTA}>{t.nav.signIn}</button>
              )}
              <button onClick={()=>setMobileMenu(!mobileMenu)} className="m-nav" style={S.menuBtn}>{mobileMenu?<I.X/>:<I.Menu/>}</button>
            </div>
          </div>
          {mobileMenu && <div style={S.mPanel}>
            {[["home",t.nav.home],["courses",t.nav.courses]].map(([pg,label])=>(<button key={pg} onClick={()=>nav(pg)} style={S.mLink}>{label}</button>))}
            {isLogged && !isAdmin && <button onClick={()=>nav("dashboard")} style={S.mLink}>{t.nav.dashboard}</button>}
            <button onClick={toggleLang} style={{...S.mLink,color:C.gold,fontWeight:700}}>{lang==="en"?"🌐 عربي":"🌐 English"}</button>
            {isLogged ? <button onClick={logout} style={S.mCTA}>{t.nav.signOut}</button> : <button onClick={()=>nav("login")} style={S.mCTA}>{t.nav.signIn}</button>}
          </div>}
        </nav>
      )}
      {avatarOpen && <div style={{position:"fixed",inset:0,zIndex:98}} onClick={()=>setAvatarOpen(false)}/>}

      {/* ── PAGES ── */}
      <main style={{minHeight:"calc(100vh - 68px)"}}>
        {page==="home"        && <HomePage nav={nav} navWithCat={navWithCat} courses={pub} t={t} isRTL={isRTL} user={user}/>}
        {page==="courses"     && <CoursesPage courses={pub} nav={nav} initCat={catFilter} setCatFilter={setCatFilter} t={t} isRTL={isRTL}/>}
        {page==="course-detail" && selCourse && <CourseDetailPage course={selCourse} nav={nav} user={user} handleEnroll={handleEnroll} t={t} isRTL={isRTL}/>}
        {page==="course-learn"  && selCourse && <CourseLearningPage course={selCourse} user={user} nav={nav} t={t} isRTL={isRTL}/>}
        {page==="dashboard"   && <DashboardPage courses={courses} user={user} nav={nav} t={t} isRTL={isRTL}/>}
        {page==="login"       && <LoginPage nav={nav} login={login} t={t} isRTL={isRTL} onSocial={handleSocialLogin}/>}
        {page==="signup"      && <SignupPage nav={nav} signup={signup} t={t} isRTL={isRTL} onSocial={handleSocialLogin}/>}
        {page==="about"       && <AboutPage nav={nav} t={t}/>}
        {page==="careers"     && <CareersPage nav={nav} t={t}/>}
        {page==="help"        && <HelpPage nav={nav} t={t}/>}
        {page==="privacy"     && <PrivacyPage nav={nav} t={t}/>}
        {page==="terms"       && <TermsPage nav={nav} t={t}/>}
        {page==="admin" && isAdmin && <AdminLayout user={user} logout={logout} sec={adminSec} setSec={setAdminSec} courses={courses} orders={orders} users={users} addCourse={addCourse} updateCourse={updateCourse} deleteCourse={deleteCourse} addUserAdmin={addUserAdmin} updateUser={updateUser} deleteUser={deleteUser} nav={nav} selCourse={selCourse} setSelCourse={setSelCourse} t={t} onSiteNameChange={setSiteNameApp}/>}
      </main>

      {/* ── PAYMENT MODAL ── */}
      {payModal && <PaymentModal course={payModal} onClose={()=>setPayModal(null)} onPay={(c,m,d)=>completePayment(c,m,d)} t={t}/>}

      {/* ── FOOTER ── */}
      {!isAuth && !isAdm && (
        <footer style={S.footer}>
          <div style={S.footerIn}>
            {/* FOOTER GRID — responsive, RTL-aware */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:40,paddingBottom:48,borderBottom:"1px solid rgba(213,207,193,0.08)",direction:isRTL?"rtl":"ltr"}}>

              {/* SOCIAL ICONS ROW */}
              <div style={{gridColumn:"1 / -1",display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
                {[
                      {url:"https://discord.gg/k7UnRQGKvT",          t:"Discord",   d:"M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"},
                      {url:"https://t.me/Satur_n0",                   t:"Telegram",  d:"M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"},
                      {url:"https://www.snapchat.com/@saturns202",    t:"Snapchat",  d:"M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.118.15.148.351.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"},
                      {url:"https://www.threads.com/@2saturns0",      t:"Threads",   d:"M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068v-.034c.024-3.516.926-6.368 2.68-8.478C6.001 1.238 8.7.022 12.219 0h.073c2.648.017 5.041.791 6.752 2.184 1.656 1.348 2.559 3.23 2.608 5.448l.005.196h-3.16l-.005-.196c-.058-1.357-.512-2.367-1.387-3.085-1.01-.832-2.498-1.265-4.264-1.278-2.57.016-4.507.825-5.763 2.405-1.15 1.44-1.736 3.617-1.75 6.465v.034c.014 2.848.6 5.025 1.75 6.465 1.256 1.58 3.193 2.389 5.763 2.405 1.966-.013 3.282-.405 4.27-1.277.992-.875 1.487-2.151 1.487-3.83V15h-5.6v-2.871h8.76v3.747c0 2.578-.719 4.572-2.135 5.927C18.028 23.196 15.435 24 12.186 24z"},
                      {url:"https://api.whatsapp.com/message/EQYMUTLCLKWIE1?autoload=1&app_absent=0",t:"WhatsApp",d:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"},
                      {url:"https://www.tiktok.com/@2saturns0",       t:"TikTok",    d:"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"},
                      {url:"https://www.instagram.com/2saturns0",     t:"Instagram", d:"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"},
                ].map(s=>(
                  <a key={s.t} href={s.url} target="_blank" rel="noopener noreferrer" title={s.t}
                    style={{width:36,height:36,borderRadius:9,background:"rgba(213,207,193,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"rgba(213,207,193,0.8)",flexShrink:0,transition:"background 0.15s"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={s.d}/></svg>
                  </a>
                ))}
              </div>

              {/* LINK COLUMNS */}
              {[
                {
                  h: isRTL ? "المنصة" : "Platform",
                  links:[
                    [isRTL?"تصفح الكورسات":"Browse Courses","courses"],
                    [isRTL?"مسارات التعلم":"Learning Paths","courses"],
                    [isRTL?"الشهادات":"Certifications","courses"],
                  ]
                },
                {
                  h: isRTL ? "الشركة" : "Company",
                  links:[
                    [isRTL?"من نحن":"About Us","about"],
                    [isRTL?"الوظائف":"Careers","careers"],
                    [isRTL?"المدوّنة":"Blog","about"],
                    [isRTL?"تواصل معنا":"Contact","help"],
                  ]
                },
                {
                  h: isRTL ? "الدعم" : "Support",
                  links:[
                    [isRTL?"مركز المساعدة":"Help Center","help"],
                    [isRTL?"سياسة الخصوصية":"Privacy Policy","privacy"],
                    [isRTL?"الشروط والأحكام":"Terms of Service","terms"],
                    [isRTL?"الأسئلة الشائعة":"FAQ","help"],
                  ]
                },
              ].map(col=>(
                <div key={col.h}>
                  <h4 style={{...S.footerH,textAlign:isRTL?"right":"left"}}>{col.h}</h4>
                  {col.links.map(([label,pg])=>(
                    <button key={label} onClick={()=>nav(pg)}
                      style={{...S.footerL,display:"block",width:"100%",textAlign:isRTL?"right":"left",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>
                      {label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* BOTTOM BAR */}
            <div style={{...S.footerBot,direction:isRTL?"rtl":"ltr"}}>
              <span>{t.footer.copyright}</span>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <button onClick={()=>nav("privacy")} style={{fontSize:13,color:"rgba(213,207,193,0.45)",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>{isRTL?"سياسة الخصوصية":"Privacy"}</button>
                <button onClick={()=>nav("terms")}   style={{fontSize:13,color:"rgba(213,207,193,0.45)",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>{isRTL?"الشروط والأحكام":"Terms"}</button>
                <button onClick={()=>nav("help")}    style={{fontSize:13,color:"rgba(213,207,193,0.45)",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>{isRTL?"مركز المساعدة":"Support"}</button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* ── RESET PASSWORD MODAL ── */}
      {resetToken && <ResetPasswordModal
        userId={resetUserId}
        token={resetToken}
        isRTL={isRTL}
        onDone={()=>{ setResetToken(""); setResetUserId(""); setPage("login"); }}
      />}

      {/* ── ACTIVATION SUCCESS TOAST ── */}
      {activationSuccess && (
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:C.success,color:"#fff",padding:"14px 28px",borderRadius:50,fontSize:15,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap"}}>
          ✅ {isRTL?"تم تفعيل حسابك بنجاح! أهلاً بك 🎉":"Account verified successfully! Welcome 🎉"}
        </div>
      )}

      {/* ── CHATBOT ── */}
      {!isAdm && ls("orb_chatbot_enabled","1")==="1" && <ChatbotWidget isRTL={isRTL}/>}

      <style>{CSS}</style>
    </div>
  );
}

// ═══════════════════════════════════════════
// PAYMENT MODAL
// ═══════════════════════════════════════════
function PaymentModal({ course, onClose, onPay, t }) {
  const isRTL = ls("orb_lang","en")==="ar";
  const pt = t?.payment || {title:'Enroll in Course',emailLabel:'Email for Invoice',payBtn:'Payment',summary:'Order Summary',subtotal:'Course price',vat:'VAT (15%)',total:'Total',secured:'🔒 Secured · Invoice sent automatically'};
  const [step,     setStep]    = useState("summary");
  const [email,    setEmail]   = useState("");
  const [coupon,   setCoupon]  = useState("");
  const [discount, setDiscount] = useState(null); // { code, type, value, id }
  const [couponErr,setCouponErr] = useState("");

  const isFree = course.isFree || Number(course.price)===0;

  const applyDiscount = () => {
    setCouponErr("");
    if (!coupon.trim()) return;
    const codes = ls("orb_discounts",[]);
    const found  = codes.find(c=>c.code===coupon.trim().toUpperCase() && c.active);
    if (!found)                             { setCouponErr(isRTL?"كود غير صحيح أو منتهي":"Invalid or expired code"); return; }
    if (found.expiry && new Date(found.expiry)<new Date()) { setCouponErr(isRTL?"انتهت صلاحية الكود":"This code has expired"); return; }
    if (found.maxUses && found.uses>=found.maxUses)        { setCouponErr(isRTL?"تم استخدام الكود بالكامل":"This code has reached its usage limit"); return; }
    setDiscount(found);
    setCouponErr("");
  };

  const removeDiscount = () => { setDiscount(null); setCoupon(""); setCouponErr(""); };

  const subtotal   = Number(course.price)||0;
  const discAmt    = discount
    ? discount.type==="percent"
      ? Math.round(subtotal*(discount.value/100))
      : Math.min(discount.value, subtotal)
    : 0;
  const afterDisc  = Math.max(0, subtotal - discAmt);
  const vat        = Math.round(afterDisc*0.15);
  const total      = afterDisc + vat;

  // Increment discount code usage
  const burnCode = () => {
    if (!discount) return;
    const codes   = ls("orb_discounts",[]);
    const updated = codes.map(c=>c.id===discount.id ? {...c, uses:(c.uses||0)+1} : c);
    ss("orb_discounts", updated);
  };

  const handlePay = (method) => {
    setStep("processing");
    setTimeout(()=>{ burnCode(); onPay(course, method, discount); setStep("done"); }, 900);
  };

  useEffect(()=>{
    if (step==="done") { const t=setTimeout(()=>onClose(),2200); return ()=>clearTimeout(t); }
  },[step]);

  // FREE COURSE — instant enroll
  if (isFree) return (
    <div style={S.modalOv} onClick={onClose}>
      <div style={{...S.modal,maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"40px 32px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🎓</div>
          <h2 style={{fontSize:22,fontWeight:700,color:C.navy,marginBottom:10}}>
            {isRTL?"كورس مجاني":"Free Course!"}
          </h2>
          <p style={{fontSize:14,color:"#6B7280",marginBottom:24,lineHeight:1.7}}>
            {isRTL
              ? `سيتم تسجيلك في "${course.titleAr||course.title}" مجاناً`
              : `You'll be enrolled in "${course.title}" for free`}
          </p>
          <button onClick={()=>handlePay("free")}
            style={{...S.btnPrimary,width:"100%",justifyContent:"center",padding:"15px 0",fontSize:16,background:C.success}}>
            ✅ {isRTL?"ابدأ التعلم الآن":"Start Learning Now"}
          </button>
          <button onClick={onClose} style={{marginTop:12,fontSize:13,color:"#9CA3AF",width:"100%"}}>
            {isRTL?"إلغاء":"Cancel"}
          </button>
        </div>
      </div>
    </div>
  );

  if (step==="done") return (
    <div style={S.modalOv}>
      <div style={{...S.modal,maxWidth:360,textAlign:"center",border:"none"}}>
        <div style={{padding:"48px 32px"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:`${C.success}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:C.success}}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          </div>
          <h2 style={{fontSize:22,fontWeight:700,color:C.navy,marginBottom:10}}>
            {isRTL?"تمت العملية بنجاح!":"Enrolled Successfully!"}
          </h2>
          <p style={{fontSize:14,color:"#6B7280",lineHeight:1.7,marginBottom:8}}>
            {isRTL?"تم تسجيلك في":"You are now enrolled in"}<br/>
            <strong style={{color:C.navy}}>{course.title}</strong>
          </p>
          {email && <p style={{fontSize:13,color:"#9CA3AF"}}>Invoice sent to {email}</p>}
          <p style={{fontSize:12,color:"#9CA3AF",marginTop:16}}>{isRTL?"جارٍ التوجيه...":"Redirecting to your course…"}</p>
        </div>
      </div>
    </div>
  );

  if (step==="processing") return (
    <div style={S.modalOv}>
      <div style={{...S.modal,maxWidth:360,textAlign:"center"}}>
        <div style={{padding:"48px 32px"}}>
          <div style={{width:56,height:56,borderRadius:"50%",border:`3px solid ${C.gold}`,borderTopColor:"transparent",margin:"0 auto 20px",animation:"spin 0.8s linear infinite"}}/>
          <p style={{fontSize:15,fontWeight:600,color:C.navy}}>{isRTL?"جارٍ المعالجة...":"Processing…"}</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.modalOv} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}>
          <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>{pt.title}</h2>
          <button onClick={onClose} style={{color:"#9CA3AF",display:"flex"}}><I.X/></button>
        </div>

        {/* COURSE INFO */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid #F0ECE5",display:"flex",gap:14,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:10,overflow:"hidden",flexShrink:0}}><CourseThumbnail color={course.color} patternType={course.patternType} iconUrl={course.iconUrl}/></div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:15,fontWeight:700,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.title}</p>
            <p style={{fontSize:13,color:"#9CA3AF"}}>{course.instructor}</p>
          </div>
        </div>

        {/* DISCOUNT CODE */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid #F0ECE5"}}>
          <label style={{...S.label,marginBottom:6}}>{isRTL?"كود الخصم (اختياري)":"Discount Code (optional)"}</label>
          {discount ? (
            <div style={{padding:"10px 14px",background:C.successBg,borderRadius:9,border:`1px solid ${C.success}30`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:C.success,letterSpacing:1}}>{discount.code}</span>
                <span style={{fontSize:13,color:C.success,fontWeight:600}}>
                  — {discount.type==="percent" ? `${discount.value}% off` : `${discount.value} SAR off`}
                </span>
              </div>
              <button onClick={removeDiscount} style={{fontSize:12,color:C.danger,fontWeight:600}}>Remove</button>
            </div>
          ) : (
            <div style={{display:"flex",gap:8}}>
              <input placeholder={isRTL?"أدخل الكود":"Enter code"} value={coupon}
                onChange={e=>setCoupon(e.target.value.toUpperCase())}
                onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),applyDiscount())}
                style={{...S.input,flex:1,fontFamily:"monospace",letterSpacing:1,fontWeight:600}}/>
              <button type="button" onClick={applyDiscount}
                style={{padding:"0 18px",background:C.navy,color:"#fff",borderRadius:10,fontWeight:600,fontSize:13,flexShrink:0}}>
                {isRTL?"تطبيق":"Apply"}
              </button>
            </div>
          )}
          {couponErr && <p style={{fontSize:12,color:C.danger,marginTop:6,fontWeight:600}}>{couponErr}</p>}
        </div>

        {/* PRICE BREAKDOWN */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid #F0ECE5"}}>
          <h3 style={{fontSize:12,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>{pt.summary}</h3>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{color:"#6B7280",fontSize:14}}>{pt.subtotal}</span>
            <Price value={subtotal} size={14} bold={600}/>
          </div>
          {discount && (
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:C.success,fontSize:14,fontWeight:600}}>
                {isRTL?"خصم":"Discount"} ({discount.code})
              </span>
              <span style={{fontSize:14,fontWeight:700,color:C.success}}>− <Price value={discAmt} size={14} bold={700} color={C.success}/></span>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{color:"#6B7280",fontSize:14}}>{pt.vat}</span>
            <Price value={vat} size={14} bold={600}/>
          </div>
          <div style={{borderTop:"1px solid #E8E4DD",paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:15,fontWeight:700,color:C.navy}}>{pt.total}</span>
            <Price value={total} size={22} bold={800} color={C.gold}/>
          </div>
        </div>

        <div style={{padding:"20px 24px"}}>
          <label style={S.label}>{pt.emailLabel}</label>
          <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{...S.input,marginBottom:16}}/>
          <button onClick={()=>handlePay("amazon")}
            style={{width:"100%",padding:"15px",borderRadius:12,background:C.gold,color:"#fff",fontWeight:700,fontSize:16,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10,border:"none",cursor:"pointer"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            {pt.payBtn}
          </button>
          <p style={{fontSize:11,color:"#9CA3AF",textAlign:"center"}}>{pt.secured}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
function HomePage({ nav, navWithCat, courses, t, isRTL, user }) {
  // Free courses = courses where price is 0 or free flag
  const freeCourses = courses.filter(c => Number(c.price)===0 || c.free===true);
  const handleBrowseFree = () => {
    // If free courses exist go to courses page; caller can filter — just nav to courses
    // We always nav to courses; if free exist they'll appear when filtering price=0
    nav("courses");
  };
  const featured = courses.slice(0,3);
  const cats = CATEGORIES.map(n=>({name:n,count:courses.filter(c=>c.category===n).length})).filter(c=>c.count>0);

  return <div>
    {/* HERO */}
    <section style={S.hero}><div style={S.heroOv}/>
      <div style={S.heroCnt}>
        <div style={S.heroBadge}><span style={S.heroDot}/>{t.hero.badge}</div>
        <h1 style={{...S.heroTitle,fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif"}}>{t.hero.title.split("\n").map((line,i)=><span key={i}>{line}{i<t.hero.title.split("\n").length-1&&<br/>}</span>)}</h1>
        <p style={S.heroSub}>{t.hero.sub}</p>
        <div style={S.heroAct}>
          {/* CTA 1: Sign up if not logged in, go to dashboard if logged in */}
          <button onClick={()=>nav(user?"dashboard":"signup")} style={S.btnPrimary}>
            {user ? (isRTL?"متابعة التعلم →":"Continue Learning →") : t.hero.cta1}
          </button>
          {/* CTA 2: Browse free courses if any exist, else browse all courses */}
          <button onClick={()=>nav("courses")} style={S.btnSec}>
            {freeCourses.length>0 ? t.hero.cta2 : (isRTL?"تصفح جميع الكورسات":"Browse All Courses")}
          </button>
        </div>
        <div style={S.heroStats}>
          {t.stats.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:32}}>
              {i>0&&<div style={S.heroDiv}/>}
              <div><p style={S.heroStatN}>{s.v}</p><p style={S.heroStatL}>{s.l}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FEATURED */}
    <section style={S.section}>
      {featured.length>0 ? <>
        <div style={S.secHead}><div><h2 style={S.secTitle}>{t.featured.title}</h2><p style={S.secSub}>{t.featured.sub}</p></div><button onClick={()=>nav("courses")} style={S.seeAll}>{isRTL?"عرض الكل":"View All"} <I.Arrow/></button></div>
        <div className="grid-3">{featured.map(c=><CourseCard key={c.id} course={c} onClick={()=>nav("course-detail",c)}/>)}</div>
      </> : <div style={S.empty}><I.Book/><h2 style={{...S.secTitle,marginTop:16}}>{isRTL?"لا توجد كورسات بعد":"No Courses Yet"}</h2><p style={{color:"#9CA3AF",marginTop:8}}>{isRTL?"ستظهر الكورسات هنا بعد إضافتها من الإدارة.":"Courses appear here once the admin adds them."}</p></div>}
    </section>

    {/* CATEGORIES — clicking navigates with filter pre-set */}
    {cats.length>0 && <section style={S.section}>
      <h2 style={S.secTitle}>{t.categories.title}</h2>
      <p style={{...S.secSub,marginBottom:24}}>{t.categories.sub}</p>
      <div className="grid-4">
        {cats.map(c=>(
          <button key={c.name} onClick={()=>navWithCat(c.name)} style={S.catCard}>
            <p style={{fontSize:15,fontWeight:700,color:C.text}}>{c.name}</p>
            <p style={{fontSize:13,color:"#9CA3AF",marginTop:4}}>{c.count} {c.count===1?"course":"courses"}</p>
            <div style={{marginTop:12,fontSize:12,fontWeight:600,color:C.gold,display:"flex",alignItems:"center",gap:4}}>Browse <I.Arrow/></div>
          </button>
        ))}
      </div>
    </section>}

    {/* WHY ORBIT */}
    <section style={S.whyOrbit}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
        <h2 style={{fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif",fontSize:"clamp(22px,3vw,32px)",fontWeight:700,color:C.cream,marginBottom:48}}>{t.why.title}</h2>
        <div className="grid-4">
          {[<I.Award/>,<I.Sparkle/>,<I.Globe/>,<I.Shield/>].map((icon,i)=>(
            <div key={i} style={S.featCard}>
              <div style={S.featIcon}>{icon}</div>
              <h3 style={S.featTitle}>{t.why.items[i]?.t}</h3>
              <p style={S.featDesc}>{t.why.items[i]?.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section style={S.ctaBanner}>
      <div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}>
        <h2 style={{...S.ctaTitle,fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif"}}>{isRTL?"جاهز تبدأ؟ كل يوم تأخره هو يوم قدام غيرك.":"Ready to Start? Every Day You Wait, Someone Else Moves Ahead."}</h2>
        <p style={S.ctaSub}>{t.cta.sub}</p>
        <button onClick={()=>nav("signup")} style={S.ctaBtn}>{t.cta.btn}</button>
      </div>
    </section>
  </div>;
}

// ═══════════════════════════════════════════
// COURSE CARD
// ═══════════════════════════════════════════
function CourseCard({ course, onClick }) {
  const isRTL = ls("orb_lang","en") === "ar";
  // Load live avg rating from reviews
  const reviews = (() => { try { return JSON.parse(localStorage.getItem(`orb_reviews_${course.id}`))||[]; } catch { return []; } })();
  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : (course.rating||0);
  const reviewCount = reviews.length;
  return (
    <button onClick={onClick} style={S.cCard}>
      <div style={{height:160,overflow:"hidden",borderRadius:"14px 14px 0 0",position:"relative"}}>
        <CourseThumbnail color={course.color} patternType={course.patternType} iconUrl={course.iconUrl}/>
        <span style={S.cLevel}>{course.level}</span>
      </div>
      <div style={{padding:20}}>
        <p style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:1.2}}>{isRTL?(CAT_AR[course.category]||course.category):course.category}</p>
        <h3 style={{fontSize:16,fontWeight:700,color:C.navy,margin:"8px 0",lineHeight:1.35}}>{isRTL&&course.titleAr ? course.titleAr : course.title}</h3>
        <p style={{fontSize:13,color:"#9CA3AF",marginBottom:12}}>{course.instructor}</p>
        <div style={{display:"flex",gap:14,marginBottom:14,flexWrap:"wrap",fontSize:13}}>
          {avgRating>0 && <span style={{display:"flex",alignItems:"center",gap:4,fontWeight:600,color:C.gold}}><I.Star/>{avgRating}{reviewCount>0&&<span style={{fontSize:11,color:"#9CA3AF",fontWeight:400}}>({reviewCount})</span>}</span>}
          <span style={{display:"flex",alignItems:"center",gap:4,color:"#9CA3AF"}}><I.Clock/>{course.duration}</span>
          {course.students>0 && <span style={{color:"#9CA3AF"}}>{course.students.toLocaleString()} students</span>}
        </div>
        <div style={{borderTop:"1px solid #F0ECE5",paddingTop:14,display:"flex",alignItems:"center",gap:8}}>
          {(course.isFree||Number(course.price)===0)
            ? <span style={{fontSize:14,fontWeight:800,color:C.success,background:C.successBg,padding:"4px 10px",borderRadius:20}}>FREE</span>
            : <Price value={course.price} size={18} bold={800} color={C.navy}/>
          }
          {course.originalPrice && <span style={{fontSize:13,color:"#9CA3AF",textDecoration:"line-through"}}><Price value={course.originalPrice} size={13} bold={400} color="#9CA3AF"/></span>}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════
// COURSES PAGE — with working filters
// ═══════════════════════════════════════════
function CoursesPage({ courses, nav, initCat, setCatFilter, t, isRTL }) {
  const [q,     setQ]     = useState("");
  const [cat,   setCat]   = useState(initCat||"All");
  const [level, setLevel] = useState("All");
  const [sort,  setSort]  = useState("newest");
  const [show,  setShow]  = useState(false);

  useEffect(()=>{ if(initCat && initCat!==cat) setCat(initCat); },[initCat]);

  const activeCats = ["All",...new Set(courses.map(c=>c.category))];

  let filtered = courses.filter(c=>{
    const mQ   = !q || c.title?.toLowerCase().includes(q.toLowerCase()) || c.titleAr?.toLowerCase().includes(q.toLowerCase()) || c.instructor?.toLowerCase().includes(q.toLowerCase());
    const mCat = cat==="All" || c.category===cat;
    const mLev = level==="All" || c.level===level;
    return mQ && mCat && mLev;
  });

  if (sort==="price-low")  filtered=[...filtered].sort((a,b)=>a.price-b.price);
  if (sort==="price-high") filtered=[...filtered].sort((a,b)=>b.price-a.price);
  if (sort==="popular")    filtered=[...filtered].sort((a,b)=>(b.students||0)-(a.students||0));
  if (sort==="rating")     filtered=[...filtered].sort((a,b)=>(b.rating||0)-(a.rating||0));

  const clearAll = () => { setCat("All"); setLevel("All"); setSort("newest"); setQ(""); setCatFilter?.("All"); };

  const sortOpts = isRTL
    ? [["newest","الأحدث"],["popular","الأكثر مشاهدة"],["rating","الأعلى تقييماً"],["price-low","السعر: من الأقل"],["price-high","السعر: من الأعلى"]]
    : [["newest","Newest"],["popular","Most Popular"],["rating","Highest Rated"],["price-low","Price: Low → High"],["price-high","Price: High → Low"]];
  const levelMap = {"All":isRTL?"الكل":"All","Beginner":isRTL?"مبتدئ":"Beginner","Intermediate":isRTL?"متوسط":"Intermediate","Advanced":isRTL?"متقدم":"Advanced"};
  const catLabel = (c) => c==="All" ? (isRTL?"الكل":"All") : (isRTL?(CAT_AR[c]||c):c);
  const hasFilter = q || cat!=="All" || level!=="All";

  return (
    <div style={{paddingTop:40,direction:isRTL?"rtl":"ltr",fontFamily:isRTL?"'Cairo',sans-serif":"'DM Sans',sans-serif"}}>
      <div style={S.section}>
        <h1 style={{...S.pageTitle,textAlign:isRTL?"right":"left",fontFamily:isRTL?"'Cairo',sans-serif":"'Playfair Display',serif"}}>{t.courses.title}</h1>
        <p style={{...S.pageSub,textAlign:isRTL?"right":"left"}}>{courses.length} {t.courses.sub}</p>

        <div className="filter-row" style={{marginBottom:16}}>
          <div style={{...S.searchBox,flex:1,minWidth:0}}>
            <I.Search/>
            <input placeholder={t.filters.search} value={q} onChange={e=>setQ(e.target.value)} style={{...S.searchIn,textAlign:isRTL?"right":"left"}}/>
          </div>
          <button onClick={()=>setShow(!show)} style={{...S.filterBtn,background:show?C.navy:"#fff",color:show?"#fff":C.navy}}>
            <I.Sliders/><span className="d-nav">{isRTL?"الفلاتر":"Filters"}</span>
          </button>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{...S.selInput,direction:isRTL?"rtl":"ltr"}}>
            {sortOpts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {show && <div style={{...S.filterPanel,direction:isRTL?"rtl":"ltr"}}>
          <div>
            <p style={{...S.filterLbl,textAlign:isRTL?"right":"left"}}>{isRTL?"الفئة":"Category"}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {activeCats.map(c=><button key={c} onClick={()=>setCat(c)} style={{...S.chip,background:cat===c?C.navy:"#fff",color:cat===c?"#fff":C.navy}}>{catLabel(c)}</button>)}
            </div>
          </div>
          <div>
            <p style={{...S.filterLbl,textAlign:isRTL?"right":"left"}}>{isRTL?"المستوى":"Level"}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["All",...LEVELS].map(l=><button key={l} onClick={()=>setLevel(l)} style={{...S.chip,background:level===l?C.navy:"#fff",color:level===l?"#fff":C.navy}}>{levelMap[l]}</button>)}
            </div>
          </div>
          <button onClick={clearAll} style={{fontSize:13,fontWeight:600,color:C.gold,alignSelf:"flex-start"}}>{isRTL?"مسح الكل":"Clear All"}</button>
        </div>}

        {hasFilter && <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {cat!=="All"   && <span style={{...S.chip,background:`${C.gold}18`,color:C.gold,fontSize:12,display:"flex",alignItems:"center",gap:4}}>{isRTL?"الفئة:":"Category:"} {catLabel(cat)} <button onClick={()=>setCat("All")} style={{fontWeight:700}}>×</button></span>}
          {level!=="All" && <span style={{...S.chip,background:`${C.teal}18`,color:C.teal,fontSize:12,display:"flex",alignItems:"center",gap:4}}>{isRTL?"المستوى:":"Level:"} {levelMap[level]} <button onClick={()=>setLevel("All")} style={{fontWeight:700}}>×</button></span>}
        </div>}

        {filtered.length>0
          ? <div className="grid-3">{filtered.map(c=><CourseCard key={c.id} course={c} onClick={()=>nav("course-detail",c)}/>)}</div>
          : <div style={S.empty}>
              <I.Search/>
              <h2 style={{...S.secTitle,marginTop:16}}>{isRTL?"لا توجد كورسات":"No Courses Found"}</h2>
              <p style={{color:"#9CA3AF",marginTop:8}}>{hasFilter?(isRTL?"جرّب تعديل الفلاتر":"Try adjusting your filters"):(isRTL?"لا توجد كورسات بعد":"No courses available yet")}</p>
            </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// COURSE DETAIL
// ═══════════════════════════════════════════
function CourseDetailPage({ course, nav, user, handleEnroll, t, isRTL }) {
  const displayTitle = isRTL && course.titleAr ? course.titleAr : course.title;
  const displayDesc  = isRTL && course.descriptionAr ? course.descriptionAr : course.description;
  const displayLearn = isRTL && course.whatYouLearnAr?.length ? course.whatYouLearnAr : course.whatYouLearn;
  const [tab, setTab] = useState("curriculum");
  const enrolled = user?.enrolledCourses?.includes(course.id);

  return <div>
    <section style={{...S.hero,background:course.color||C.navy,padding:"80px 0 48px"}}><div style={S.heroOv}/>
      <div style={{...S.heroCnt,maxWidth:960,textAlign:"left"}}>
        <span style={{fontSize:12,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:12}}>{course.category}</span>
        <h1 style={{...S.heroTitle,fontSize:"clamp(24px,4vw,42px)",marginBottom:16}}>{displayTitle}</h1>
        <p style={{...S.heroSub,marginBottom:24}}>{displayDesc}</p>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {[course.rating?`★ ${course.rating}`:"New",`${course.students||0} students`,course.duration,course.level].filter(Boolean).map((b,i)=><span key={i} style={S.metaBadge}>{b}</span>)}
        </div>
      </div>
    </section>
    <div style={S.section}>
      <div style={S.enrollCard}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <Price value={course.price} size={30} bold={700} color={C.navy}/>
          {course.originalPrice && <span style={{fontSize:16,color:"#9CA3AF",textDecoration:"line-through"}}><Price value={course.originalPrice} size={15} bold={400} color="#9CA3AF"/></span>}
        </div>
        <button onClick={()=>handleEnroll(course)} style={S.enrollBtn}>{enrolled?"Continue Learning →":"Enroll Now"}</button>
      </div>
      <div style={S.tabs}>{["curriculum","overview"].map(t=><button key={t} onClick={()=>setTab(t)} style={tab===t?S.tabA:S.tab}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
      {tab==="curriculum" && <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(course.modules||[]).map((m,i)=>(
          <div key={m.id||i} style={S.modItem}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:C.creamL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.navy,flexShrink:0}}>{i+1}</div>
              <div style={{textAlign:"left"}}><p style={{fontSize:15,fontWeight:600,color:C.navy}}>{m.title}</p><p style={{fontSize:13,color:"#9CA3AF",marginTop:2}}>{m.type} · {m.duration}</p></div>
            </div>
            <span style={{color:"#9CA3AF"}}>{m.free?<I.Check/>:<I.Lock/>}</span>
          </div>
        ))}
        {(!course.modules||!course.modules.length)&&<p style={{textAlign:"center",color:"#9CA3AF",padding:48}}>Curriculum coming soon</p>}
      </div>}
      {tab==="overview" && <div>
        <h3 style={{fontSize:20,fontWeight:700,color:C.navy,marginBottom:16,fontFamily:"'Playfair Display',serif"}}>About this course</h3>
        <p style={{fontSize:15,color:"#4A5568",lineHeight:1.7}}>{displayDesc||"Details coming soon."}</p>
        {displayLearn?.filter(Boolean).length>0 && <>
          <h3 style={{fontSize:20,fontWeight:700,color:C.navy,marginTop:36,marginBottom:16,fontFamily:"'Playfair Display',serif"}}>What you will learn</h3>
          <div style={{display:"grid",gap:12}}>
            {displayLearn.filter(Boolean).map((x,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#fff",borderRadius:10,border:"1px solid #F0ECE5"}}>
                <div style={{width:24,height:24,borderRadius:6,background:`${C.teal}18`,color:C.teal,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Check/></div>
                <span style={{color:"#4A5568",fontSize:15}}>{x}</span>
              </div>
            ))}
          </div>
        </>}
      </div>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// CERTIFICATE GENERATOR
// ═══════════════════════════════════════════
function generateCertSVG(userName, courseTitle, date) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">
  <rect width="800" height="560" fill="#F5F2ED"/>
  <rect x="20" y="20" width="760" height="520" rx="16" fill="none" stroke="#B8965A" stroke-width="2.5"/>
  <rect x="32" y="32" width="736" height="496" rx="12" fill="none" stroke="#D5CFC1" stroke-width="1"/>
  <rect x="0" y="0" width="800" height="120" fill="#2D3347" rx="16"/>
  <rect x="0" y="104" width="800" height="20" fill="#2D3347"/>
  <circle cx="400" cy="56" r="36" fill="#B8965A"/>
  <text x="400" y="48" text-anchor="middle" fill="#2D3347" font-size="22" font-weight="700" font-family="Georgia">O</text>
  <text x="400" y="64" text-anchor="middle" fill="#D5CFC1" font-size="9" font-family="Georgia">ORBIT</text>
  <text x="400" y="175" text-anchor="middle" fill="#9CA3AF" font-size="13" font-family="Georgia" letter-spacing="4">CERTIFICATE OF COMPLETION</text>
  <text x="400" y="225" text-anchor="middle" fill="#1A1F2E" font-size="14" font-family="Georgia">This is to certify that</text>
  <text x="400" y="278" text-anchor="middle" fill="#2D3347" font-size="32" font-weight="700" font-family="Georgia">${userName}</text>
  <line x1="150" y1="292" x2="650" y2="292" stroke="#B8965A" stroke-width="1.5"/>
  <text x="400" y="330" text-anchor="middle" fill="#6B7280" font-size="14" font-family="Georgia">has successfully completed the course</text>
  <text x="400" y="378" text-anchor="middle" fill="#2D3347" font-size="22" font-weight="700" font-family="Georgia">${courseTitle}</text>
  <text x="400" y="430" text-anchor="middle" fill="#9CA3AF" font-size="12" font-family="Georgia">Issued on ${date}</text>
  <text x="200" y="490" text-anchor="middle" fill="#2D3347" font-size="11" font-family="Georgia">Orbit Learning Platform</text>
  <line x1="120" y1="470" x2="280" y2="470" stroke="#D5CFC1" stroke-width="1"/>
  <text x="600" y="490" text-anchor="middle" fill="#2D3347" font-size="11" font-family="Georgia">Academic Director</text>
  <line x1="520" y1="470" x2="680" y2="470" stroke="#D5CFC1" stroke-width="1"/>
</svg>`)}`;
}

// ═══════════════════════════════════════════
// QUIZ / EXAM ENGINE COMPONENT
// ═══════════════════════════════════════════
function QuizEngine({ module: mod, onComplete, isExam }) {
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(mod.timeLimit ? mod.timeLimit*60 : null);
  const qs = mod.questions || [];

  useEffect(()=>{
    if (!timeLeft || submitted) return;
    const t = setInterval(()=>setTimeLeft(p=>{ if(p<=1){clearInterval(t);handleSubmit(true);return 0;} return p-1; }),1000);
    return ()=>clearInterval(t);
  },[timeLeft,submitted]);

  const handleSubmit = (auto=false) => {
    if (submitted) return;
    setSubmitted(true);
    const correct = qs.filter((q,i)=>answers[i]===q.correct).length;
    const score   = qs.length ? Math.round((correct/qs.length)*100) : 100;
    const pass    = score >= (Number(mod.passScore)||70);
    onComplete({ score, pass, correct, total: qs.length });
  };

  const score    = qs.length ? Math.round((qs.filter((q,i)=>answers[i]===q.correct).length/qs.length)*100) : 0;
  const passed   = score >= (Number(mod.passScore)||70);
  const mins     = timeLeft!=null ? Math.floor(timeLeft/60) : null;
  const secs     = timeLeft!=null ? timeLeft%60 : null;

  return (
    <div style={{background:"#fff",borderRadius:16,padding:28,border:"1px solid rgba(45,51,71,0.07)"}}>
      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>{isExam?"📋 Final Exam":"📝 Quiz"}: {mod.title}</h2>
          <p style={{fontSize:13,color:"#9CA3AF",marginTop:4}}>{qs.length} questions · Pass: {mod.passScore||70}%</p>
        </div>
        {timeLeft!=null && !submitted && (
          <div style={{padding:"8px 20px",background:timeLeft<120?C.dangerBg:C.creamL,borderRadius:20,fontSize:15,fontWeight:700,color:timeLeft<120?C.danger:C.navy}}>
            ⏱ {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </div>
        )}
      </div>

      {!submitted ? (
        <>
          {qs.map((q,qi)=>(
            <div key={q.id||qi} style={{marginBottom:24,padding:20,background:C.bg,borderRadius:12}}>
              <p style={{fontSize:15,fontWeight:600,color:C.navy,marginBottom:14}}>Q{qi+1}. {q.text||"Question not set"}</p>
              <div style={{display:"grid",gap:8}}>
                {q.options.map((opt,oi)=>(
                  <button key={oi} type="button" onClick={()=>setAnswers({...answers,[qi]:oi})}
                    style={{padding:"12px 16px",borderRadius:10,border:`2px solid ${answers[qi]===oi?C.teal:"#E8E4DD"}`,background:answers[qi]===oi?`${C.teal}10`:"#fff",fontSize:14,fontWeight:answers[qi]===oi?600:400,color:C.navy,textAlign:"left",transition:"all 0.15s"}}>
                    <span style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${answers[qi]===oi?C.teal:"#D1D5DB"}`,background:answers[qi]===oi?C.teal:"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",marginRight:10,flexShrink:0,color:"#fff",fontSize:11,verticalAlign:"middle"}}>
                      {answers[qi]===oi?"✓":""}
                    </span>
                    {opt||`Option ${oi+1}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={()=>handleSubmit(false)} disabled={Object.keys(answers).length<qs.length}
            style={{...S.btnPrimary,width:"100%",justifyContent:"center",padding:"14px 0",opacity:Object.keys(answers).length<qs.length?0.5:1}}>
            Submit {isExam?"Exam":"Quiz"}
          </button>
          {Object.keys(answers).length<qs.length && <p style={{fontSize:12,color:"#9CA3AF",textAlign:"center",marginTop:8}}>Answer all {qs.length} questions to submit</p>}
        </>
      ) : (
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:passed?C.successBg:C.dangerBg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32}}>
            {passed?"🎉":"😔"}
          </div>
          <h3 style={{fontSize:22,fontWeight:700,color:C.navy,marginBottom:8}}>{passed?"Passed!":"Not Passed"}</h3>
          <p style={{fontSize:32,fontWeight:800,color:passed?C.teal:C.danger,marginBottom:8}}>{score}%</p>
          <p style={{color:"#6B7280",marginBottom:24}}>{qs.filter((q,i)=>answers[i]===q.correct).length} / {qs.length} correct · Pass score: {mod.passScore||70}%</p>
          {/* Show correct answers */}
          <div style={{textAlign:"left",maxWidth:500,margin:"0 auto"}}>
            {qs.map((q,qi)=>{
              const correct = answers[qi]===q.correct;
              return <div key={qi} style={{padding:12,borderRadius:10,background:correct?C.successBg:C.dangerBg,marginBottom:8,fontSize:13}}>
                <p style={{fontWeight:600,color:C.navy,marginBottom:4}}>Q{qi+1}. {q.text}</p>
                <p style={{color:correct?C.success:C.danger}}>
                  {correct?"✓ Correct":"✗ Your answer: "+q.options[answers[qi]]} {!correct&&` | Correct: ${q.options[q.correct]}`}
                </p>
              </div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// COURSE LEARNING PAGE — full engine
// ═══════════════════════════════════════════
function CourseLearningPage({ course, user, nav, t, isRTL }) {  const [active,      setActive]      = useState(0);
  const [completed,   setCompleted]   = useState(()=>{ try{return JSON.parse(localStorage.getItem(`orb_prog_${user?.id}_${course.id}`))||{};}catch{return {};} });
  const [showCert,    setShowCert]    = useState(false);
  const [showRating,  setShowRating]  = useState(false);
  const [rating,      setRating]      = useState(0);
  const [comment,     setComment]     = useState("");
  const [reviews,     setReviews]     = useState(()=>{ try{return JSON.parse(localStorage.getItem(`orb_reviews_${course.id}`))||[];}catch{return [];} });
  const [quizResult,  setQuizResult]  = useState(null);

  const mods       = course.modules||[];
  const cur        = mods[active];
  const totalMods  = mods.length;
  const doneCount  = Object.values(completed).filter(Boolean).length;
  const pct        = totalMods>0 ? Math.round((doneCount/totalMods)*100) : 0;
  const allDone    = totalMods>0 && doneCount>=totalMods;

  const saveProgress = (updated) => {
    setCompleted(updated);
    localStorage.setItem(`orb_prog_${user?.id}_${course.id}`, JSON.stringify(updated));
  };

  const markDone = (idx) => {
    const updated = {...completed,[idx]:true};
    saveProgress(updated);
    // Auto-advance to next module
    if (idx+1 < mods.length) setTimeout(()=>setActive(idx+1),300);
  };

  const handleQuizComplete = ({score, pass}) => {
    setQuizResult({score, pass});
    if (pass) markDone(active);
  };

  // Issue certificate when all done
  const handleGetCert = () => {
    const certDate = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    const cert = {
      id:          `cert-${Date.now()}`,
      courseId:    course.id,
      courseTitle: isRTL && course.titleAr ? course.titleAr : course.title,
      courseTitleEn: course.title,
      date:        certDate,
      svg:         generateCertSVG(user.name, course.title, certDate),
    };
    const allUsers = JSON.parse(localStorage.getItem("orb_users")||"[]");
    const idx = allUsers.findIndex(u=>u.id===user.id);
    if (idx !== -1 && !allUsers[idx].certificates?.find(c=>c.courseId===course.id)) {
      allUsers[idx].certificates = [...(allUsers[idx].certificates||[]), cert];
      localStorage.setItem("orb_users", JSON.stringify(allUsers));
      // Update active session
      const updatedUser = {...user, certificates:[...(user.certificates||[]),cert]};
      localStorage.setItem("orb_user", JSON.stringify(updatedUser));
    }
    setShowCert(cert);
  };

  // Check if already has certificate
  const existingCert = user?.certificates?.find(c=>c.courseId===course.id);

  const submitReview = () => {
    if (!rating || !comment.trim()) return;
    const rev = { id:`r-${Date.now()}`, userId:user.id, userName:user.name, rating, comment, date:new Date().toLocaleDateString() };
    const updated = [rev, ...reviews];
    setReviews(updated);
    localStorage.setItem(`orb_reviews_${course.id}`, JSON.stringify(updated));
    setShowRating(false);
    setRating(0); setComment("");
  };

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;

  if (!user?.enrolledCourses?.includes(course.id)) {
    return <div style={{...S.section,paddingTop:80,textAlign:"center"}}><I.Lock/><h2 style={{...S.secTitle,marginTop:16}}>Access Denied</h2><button onClick={()=>nav("course-detail",course)} style={{...S.btnPrimary,marginTop:24}}>Go to Course</button></div>;
  }

  return (
    <div style={{paddingTop:32,paddingBottom:64}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px"}}>
        <button onClick={()=>nav("course-detail",course)} style={{fontSize:14,fontWeight:600,color:C.gold,marginBottom:20,display:"inline-flex",alignItems:"center",gap:6}}>← Back to Course</button>

        {/* PROGRESS BAR */}
        <div style={{background:"#fff",borderRadius:14,padding:"16px 24px",marginBottom:24,border:"1px solid rgba(45,51,71,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:200}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:14,fontWeight:600,color:C.navy}}>{isRTL?"تقدم الكورس":"Course Progress"}</span>
                <span style={{fontSize:14,fontWeight:700,color:pct===100?C.success:C.gold}}>{pct}%</span>
              </div>
              <div style={{height:8,background:C.creamL,borderRadius:10}}>
                <div style={{height:"100%",width:`${pct}%`,background:pct===100?C.success:C.gold,borderRadius:10,transition:"width 0.5s"}}/>
              </div>
              <p style={{fontSize:12,color:"#9CA3AF",marginTop:4}}>{doneCount} / {totalMods} {isRTL?"درس مكتمل":"modules completed"}</p>
            </div>
            {allDone && !reviews.find(r=>r.userId===user.id) && !showRating && (
              <button onClick={()=>setShowRating(true)} style={{...S.btnPrimary,padding:"10px 18px",fontSize:13,background:C.navy}}>
                ⭐ {isRTL?"قيّم الكورس":"Rate Course"}
              </button>
            )}
          </div>
        </div>

        {/* COURSE COMPLETED BANNER */}
        {allDone && (
          <div style={{background:`linear-gradient(135deg, ${C.navy} 0%, #1a2035 100%)`,borderRadius:16,padding:"28px 32px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20,position:"relative",overflow:"hidden"}}>
            {/* Background decoration */}
            <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,borderRadius:"50%",background:"rgba(184,150,90,0.12)"}}/>
            <div style={{position:"absolute",right:40,bottom:-30,width:80,height:80,borderRadius:"50%",background:"rgba(184,150,90,0.08)"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <span style={{fontSize:28}}>🎓</span>
                <h3 style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:"'Playfair Display',serif"}}>
                  {isRTL?"تهانينا! أكملت الكورس":"Congratulations! Course Complete"}
                </h3>
              </div>
              <p style={{fontSize:14,color:"rgba(213,207,193,0.75)"}}>
                {isRTL
                  ? `أكملت جميع دروس "${isRTL&&course.titleAr?course.titleAr:course.title}" بنجاح`
                  : `You've completed all lessons in "${course.title}" successfully`}
              </p>
            </div>
            <div style={{display:"flex",gap:12,position:"relative",flexWrap:"wrap"}}>
              <button onClick={()=>{ existingCert ? setShowCert(existingCert) : handleGetCert(); }}
                style={{padding:"13px 28px",background:C.gold,color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:8,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>
                <I.Download/> {isRTL?"تحميل الشهادة":"Download Certificate"}
              </button>
            </div>
          </div>
        )}

        <div className="learn-layout" style={{gap:24}}>
          {/* MAIN CONTENT */}
          <div style={{flex:1,minWidth:0}}>
            {/* VIDEO */}
            {cur?.type==="video" && (
              <div>
                <div style={{background:course.color||C.navy,borderRadius:16,overflow:"hidden",marginBottom:16,aspectRatio:"16/9",position:"relative"}}>
                  <div style={{position:"absolute",inset:0}}><CourseThumbnail color={course.color} patternType={course.patternType} iconUrl={course.iconUrl}/></div>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.28)"}}>
                    {cur.videoUrl
                      ? <a href={cur.videoUrl} target="_blank" rel="noreferrer" style={{width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",color:C.navy}}><I.Play/></a>
                      : <div style={{textAlign:"center",color:"#fff"}}><div style={{width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><I.Play/></div><p style={{fontSize:14,opacity:0.85}}>No video URL set</p></div>}
                  </div>
                </div>
                <div style={{background:"#fff",borderRadius:14,padding:"20px 24px",border:"1px solid rgba(45,51,71,0.07)",marginBottom:16}}>
                  <h2 style={{fontSize:20,fontWeight:700,color:C.navy,marginBottom:6}}>{isRTL&&cur.titleAr?cur.titleAr:cur.title}</h2>
                  <p style={{fontSize:14,color:"#9CA3AF",marginBottom:16}}>🎬 Video · {cur.duration}</p>
                  {!completed[active] && <button onClick={()=>markDone(active)} style={{...S.btnPrimary,fontSize:14,padding:"10px 24px"}}>Mark as Complete ✓</button>}
                  {completed[active] && <span style={{color:C.success,fontWeight:700,fontSize:14}}>✓ Completed</span>}
                </div>
              </div>
            )}

            {/* READING */}
            {cur?.type==="reading" && (
              <div style={{background:"#fff",borderRadius:16,padding:32,border:"1px solid rgba(45,51,71,0.07)",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                  <span style={{fontSize:20}}>📖</span>
                  <div><h2 style={{fontSize:20,fontWeight:700,color:C.navy}}>{cur.title}</h2><p style={{fontSize:13,color:"#9CA3AF"}}>Reading · {cur.duration}</p></div>
                </div>
                <div style={{fontSize:15,color:"#374151",lineHeight:1.85,whiteSpace:"pre-wrap",borderTop:"1px solid #F0ECE5",paddingTop:20}}>
                  {(isRTL&&cur.contentAr?cur.contentAr:cur.content) || <span style={{color:"#9CA3AF",fontStyle:"italic"}}>{isRTL?"لم يُضَف محتوى القراءة بعد":"No reading content added yet."}</span>}
                </div>
                <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid #F0ECE5"}}>
                  {!completed[active] ? <button onClick={()=>markDone(active)} style={{...S.btnPrimary,fontSize:14,padding:"10px 24px"}}>I've Read This ✓</button>
                  : <span style={{color:C.success,fontWeight:700,fontSize:14}}>✓ Completed</span>}
                </div>
              </div>
            )}

            {/* PROJECT */}
            {cur?.type==="project" && (
              <div style={{background:"#fff",borderRadius:16,padding:32,border:"1px solid rgba(45,51,71,0.07)",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                  <span style={{fontSize:20}}>🛠️</span>
                  <div><h2 style={{fontSize:20,fontWeight:700,color:C.navy}}>{cur.title}</h2><p style={{fontSize:13,color:"#9CA3AF"}}>Project · {cur.duration}</p></div>
                </div>
                <div style={{fontSize:15,color:"#374151",lineHeight:1.85,whiteSpace:"pre-wrap",marginBottom:24}}>
                  {cur.content || "No project brief added yet."}
                </div>
                {cur.resources && <a href={cur.resources} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:C.teal,fontWeight:600,marginBottom:16}}>📎 Resources →</a>}
                <div style={{padding:20,background:C.bg,borderRadius:12,marginBottom:16}}>
                  <p style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:8}}>Your Submission</p>
                  {cur.submitType==="text" && <textarea rows={4} placeholder="Write your response here..." style={{...S.input,resize:"vertical"}}/>}
                  {cur.submitType==="link" && <input type="url" placeholder="https://your-project-link.com" style={S.input}/>}
                  {cur.submitType==="file" && <input type="file" style={{fontSize:13,color:"#6B7280"}}/>}
                </div>
                {!completed[active] ? <button onClick={()=>markDone(active)} style={{...S.btnPrimary,fontSize:14,padding:"10px 24px"}}>Submit Project ✓</button>
                : <span style={{color:C.success,fontWeight:700,fontSize:14}}>✓ Submitted</span>}
              </div>
            )}

            {/* QUIZ */}
            {cur?.type==="quiz" && (
              <div style={{marginBottom:16}}>
                {!completed[active]
                  ? <QuizEngine module={cur} onComplete={handleQuizComplete} isExam={false}/>
                  : <div style={{background:C.successBg,borderRadius:16,padding:32,textAlign:"center",border:`1px solid ${C.success}30`}}><p style={{fontSize:20}}>✓</p><h3 style={{fontSize:18,fontWeight:700,color:C.success,marginTop:8}}>Quiz Completed!</h3><p style={{color:C.success,marginTop:4}}>Score: {quizResult?.score||"—"}%</p></div>}
              </div>
            )}

            {/* EXAM */}
            {cur?.type==="exam" && (
              <div style={{marginBottom:16}}>
                {!completed[active]
                  ? <QuizEngine module={cur} onComplete={handleQuizComplete} isExam={true}/>
                  : <div style={{background:C.successBg,borderRadius:16,padding:32,textAlign:"center",border:`1px solid ${C.success}30`}}>
                      <p style={{fontSize:36}}>🎓</p>
                      <h3 style={{fontSize:20,fontWeight:700,color:C.success,marginTop:12}}>Exam Passed!</h3>
                      <p style={{color:C.success,marginTop:4}}>Score: {quizResult?.score||"—"}%</p>
                      <button onClick={handleGetCert} style={{...S.btnPrimary,marginTop:20,background:C.success}}>🎓 Download Certificate</button>
                    </div>}
              </div>
            )}

            {/* RATING FORM */}
            {showRating && (
              <div style={{background:"#fff",borderRadius:16,padding:28,border:"1px solid rgba(45,51,71,0.07)",marginBottom:16}}>
                <h3 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:16}}>Rate this Course</h3>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  {[1,2,3,4,5].map(s=><button key={s} type="button" onClick={()=>setRating(s)} style={{fontSize:28,background:"none",border:"none",cursor:"pointer",opacity:s<=rating?1:0.3}}>{s<=rating?"⭐":"☆"}</button>)}
                </div>
                <textarea rows={3} placeholder="Share your experience about this course..." value={comment} onChange={e=>setComment(e.target.value)} style={{...S.input,resize:"vertical",marginBottom:16}}/>
                <div style={{display:"flex",gap:12}}>
                  <button type="button" onClick={()=>setShowRating(false)} style={{padding:"10px 20px",background:"#E8E4DD",borderRadius:10,fontWeight:600,fontSize:13}}>Cancel</button>
                  <button type="button" onClick={submitReview} disabled={!rating||!comment.trim()} style={{...S.btnPrimary,padding:"10px 24px",fontSize:13,opacity:!rating||!comment.trim()?0.5:1}}>Submit Review</button>
                </div>
              </div>
            )}

            {/* REVIEWS LIST */}
            {reviews.length>0 && (
              <div style={{background:"#fff",borderRadius:16,padding:28,border:"1px solid rgba(45,51,71,0.07)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
                  <h3 style={{fontSize:16,fontWeight:700,color:C.navy}}>{isRTL?"آراء الطلاب":"Student Reviews"}</h3>
                  {avgRating && <span style={{fontSize:16,fontWeight:700,color:C.gold}}>⭐ {avgRating}</span>}
                  <span style={{fontSize:13,color:"#9CA3AF"}}>({reviews.length} {isRTL?"تقييم":"review"}{!isRTL&&reviews.length!==1?"s":""})</span>
                </div>
                {reviews.map(r=>(
                  <div key={r.id} style={{borderBottom:"1px solid #F0ECE5",paddingBottom:16,marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.cream,flexShrink:0}}>{r.userName?.[0]}</div>
                        <div><p style={{fontSize:14,fontWeight:600,color:C.navy}}>{r.userName}</p><p style={{fontSize:11,color:"#9CA3AF"}}>{r.date}</p></div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{color:C.gold,fontSize:14}}>{"⭐".repeat(r.rating)}</span>
                        {/* Admin delete button */}
                        {user?.role==="admin" && (
                          <button onClick={()=>{
                            const updated=reviews.filter(x=>x.id!==r.id);
                            setReviews(updated);
                            localStorage.setItem(`orb_reviews_${course.id}`,JSON.stringify(updated));
                          }} style={{fontSize:11,color:C.danger,fontWeight:600,padding:"3px 8px",background:C.dangerBg,borderRadius:6}}>
                            {isRTL?"حذف":"Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{fontSize:14,color:"#4A5568",lineHeight:1.6,textAlign:isRTL?"right":"left"}}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MODULE SIDEBAR */}
          <div style={{width:300,flexShrink:0}}>
            <div style={{background:"#fff",borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",overflow:"hidden",position:"sticky",top:88}}>
              <div style={{padding:"16px 20px",borderBottom:"1px solid #F0ECE5"}}>
                <h3 style={{fontSize:15,fontWeight:700,color:C.navy}}>Course Content</h3>
                <p style={{fontSize:13,color:"#9CA3AF",marginTop:4}}>{doneCount}/{totalMods} completed</p>
                <div style={{height:4,background:C.creamL,borderRadius:10,marginTop:8}}><div style={{height:"100%",width:`${pct}%`,background:pct===100?C.success:C.gold,borderRadius:10,transition:"width 0.4s"}}/></div>
              </div>
              {mods.map((m,i)=>(
                <button key={m.id||i} onClick={()=>{setActive(i);setQuizResult(null);}} style={{width:"100%",padding:"12px 20px",display:"flex",alignItems:"center",gap:10,textAlign:"left",borderBottom:"1px solid #F0ECE5",background:i===active?`${C.gold}0D`:"transparent"}}>
                  <div style={{width:26,height:26,borderRadius:7,background:completed[i]?C.success:i===active?C.gold:C.creamL,color:completed[i]||i===active?"#fff":C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>
                    {completed[i]?"✓":i+1}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:i===active?700:500,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title||`Module ${i+1}`}</p>
                    <p style={{fontSize:11,color:"#9CA3AF",marginTop:1,textTransform:"capitalize"}}>{m.type} · {m.duration}</p>
                  </div>
                </button>
              ))}
              {!mods.length && <p style={{padding:24,textAlign:"center",color:"#9CA3AF",fontSize:14}}>No content yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {showCert && (
        <div style={S.modalOv} onClick={()=>setShowCert(null)}>
          <div style={{...S.modal,maxWidth:620}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHead}>
              <div>
                <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>🎓 {isRTL?"شهادتك":"Your Certificate"}</h2>
                <p style={{fontSize:13,color:"#9CA3AF",marginTop:2}}>{showCert.courseTitle}</p>
              </div>
              <button onClick={()=>setShowCert(null)} style={{color:"#9CA3AF",display:"flex"}}><I.X/></button>
            </div>
            <div style={{padding:24}}>
              {/* Certificate preview */}
              <div style={{borderRadius:12,overflow:"hidden",border:"2px solid #E8E4DD",marginBottom:20}}>
                <img src={showCert.svg} alt="Certificate" style={{width:"100%",display:"block"}}/>
              </div>
              {/* Info row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:C.bg,borderRadius:10,marginBottom:20,flexWrap:"wrap",gap:8}}>
                <div>
                  <p style={{fontSize:12,color:"#9CA3AF"}}>{isRTL?"الطالب":"Student"}</p>
                  <p style={{fontSize:14,fontWeight:700,color:C.navy}}>{user.name}</p>
                </div>
                <div style={{textAlign:"center"}}>
                  <p style={{fontSize:12,color:"#9CA3AF"}}>{isRTL?"الكورس":"Course"}</p>
                  <p style={{fontSize:14,fontWeight:600,color:C.navy}}>{showCert.courseTitle}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:12,color:"#9CA3AF"}}>{isRTL?"تاريخ الإصدار":"Issued"}</p>
                  <p style={{fontSize:14,fontWeight:600,color:C.navy}}>{showCert.date}</p>
                </div>
              </div>
              {/* Download button */}
              <a href={showCert.svg} download={`Orbit-Certificate-${showCert.courseTitleEn||showCert.courseTitle}.svg`}
                style={{...S.btnPrimary,display:"flex",width:"100%",justifyContent:"center",padding:"14px 0",fontSize:15,textDecoration:"none",background:C.gold,gap:10}}>
                <I.Download/> {isRTL?"تحميل الشهادة PDF":"Download Certificate"}
              </a>
              <p style={{fontSize:12,color:"#9CA3AF",textAlign:"center",marginTop:10}}>
                {isRTL?"الشهادة محفوظة في لوحة التحكم الخاصة بك":"Certificate also saved in your Dashboard"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════
function DashboardPage({ courses, user, nav, t, isRTL }) {
  const enrolled = courses.filter(c=>user?.enrolledCourses?.includes(c.id));
  const days = [{d:"Mon"},{d:"Tue"},{d:"Wed"},{d:"Thu"},{d:"Fri"},{d:"Sat"},{d:"Sun"}];

  // Profile edit state
  const [editProfile, setEditProfile] = useState(false);
  const [pf, setPf] = useState({ firstName:user?.firstName||"", lastName:user?.lastName||"", email:user?.email||"", phone:user?.phone||"" });
  const [pfSaved, setPfSaved] = useState(false);
  const [pfErr, setPfErr] = useState("");

  const saveProfile = (e) => {
    e.preventDefault(); setPfErr("");
    if (!pf.firstName.trim()||!pf.lastName.trim()) { setPfErr(isRTL?"الاسم الأول والأخير مطلوبان":"First and last name are required"); return; }
    if (!pf.phone.trim()) { setPfErr(isRTL?"رقم الجوال مطلوب":"Mobile number is required"); return; }
    // Update user in localStorage
    const allUsers = ls("orb_users",[]);
    const updated = allUsers.map(u => u.id===user.id
      ? {...u, firstName:sanitize(pf.firstName), lastName:sanitize(pf.lastName), name:`${sanitize(pf.firstName)} ${sanitize(pf.lastName)}`, phone:sanitize(pf.phone)}
      : u
    );
    ss("orb_users", updated);
    const newUser = {...user, firstName:sanitize(pf.firstName), lastName:sanitize(pf.lastName), name:`${sanitize(pf.firstName)} ${sanitize(pf.lastName)}`, phone:sanitize(pf.phone)};
    ss("orb_user", newUser);
    // Force page refresh to reflect new name in navbar
    window.location.reload();
  };

  return <div style={{paddingTop:40}}><div style={S.section}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32,flexWrap:"wrap",gap:16}}>
      <div><h1 style={{...S.pageTitle,fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif"}}>{t.dashboard.welcome.replace('{name}',user?.firstName||user?.name?.split(" ")[0])}</h1><p style={S.pageSub}>{isRTL?"تابع رحلتك":"Continue your learning journey"}</p></div>
      <div style={{...S.avatarCircle,width:44,height:44,fontSize:15}}>{user?.name?.[0]?.toUpperCase()}</div>
    </div>
    <div className="grid-4s" style={{marginBottom:48}}>
      {[{icon:<I.Book/>,val:enrolled.length,col:C.teal},{icon:<I.Award/>,val:user?.certificates?.length||0,col:C.gold},{icon:<I.Chart/>,val:"0h",col:C.plum},{icon:<I.Flame/>,val:"0d",col:C.rust}].map((s,i)=>(
        <div key={i} style={S.statCard}>
          <div style={{width:38,height:38,borderRadius:10,background:`${s.col}18`,display:"flex",alignItems:"center",justifyContent:"center",color:s.col,marginBottom:14}}>{s.icon}</div>
          <p style={{fontSize:26,fontWeight:800,color:C.text,fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif"}}>{s.val}</p>
          <p style={{fontSize:13,color:"#9CA3AF",marginTop:3}}>{t.dashboard.stats[i]}</p>
        </div>
      ))}
    </div>
    <h2 style={{...S.secTitle,marginBottom:20}}>{isRTL?"هذا الأسبوع":"This Week"}</h2>
    <div style={{display:"flex",gap:8,alignItems:"flex-end",background:"#fff",borderRadius:16,padding:"24px 20px",border:"1px solid rgba(45,51,71,0.07)",height:180,marginBottom:48}}>
      {days.map(d=><div key={d.d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{flex:1,width:"100%",display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:"60%",borderRadius:4,minHeight:8,height:"8%",background:C.gold}}/></div><span style={{fontSize:11,color:"#9CA3AF",marginTop:8}}>{d.d}</span></div>)}
    </div>
    <h2 style={{...S.secTitle,marginBottom:20}}>{t.dashboard.sections.continueLearning}</h2>
    {enrolled.length>0
      ? <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:48}}>
          {enrolled.map(c=>(
            <button key={c.id} onClick={()=>nav("course-learn",c)} style={S.progressCard}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                <div style={{width:48,height:48,borderRadius:12,overflow:"hidden",flexShrink:0}}><CourseThumbnail color={c.color} patternType={c.patternType} iconUrl={c.iconUrl}/></div>
                <div style={{flex:1,textAlign:"left",minWidth:0}}><p style={{fontSize:15,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</p><p style={{fontSize:13,color:"#9CA3AF"}}>{c.instructor}</p></div>
                <span style={{fontSize:15,fontWeight:800,color:c.color||C.gold,flexShrink:0}}>0%</span>
              </div>
              <div style={{height:4,background:"#F0ECE5",borderRadius:10}}><div style={{height:"100%",width:"0%",background:c.color||C.gold,borderRadius:10}}/></div>
            </button>
          ))}
        </div>
      : <div style={{...S.empty,marginBottom:48}}><I.Book/><h2 style={{...S.secTitle,marginTop:16}}>{t.dashboard.empty.title}</h2><p style={{color:"#9CA3AF",marginTop:8,marginBottom:24}}>{t.dashboard.empty.sub}</p><button onClick={()=>nav("courses")} style={S.btnPrimary}>{t.dashboard.empty.btn}</button></div>}

    {/* ── MY CERTIFICATES SECTION ── */}
    {(() => {
      const certs = ls("orb_users",[]).find(u=>u.id===user?.id)?.certificates || user?.certificates || [];
      return certs.length > 0 ? (
        <div style={{marginBottom:40}}>
          <h2 style={{...S.secTitle,marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            🎓 {isRTL?"شهاداتي":"My Certificates"}
            <span style={{fontSize:13,fontWeight:600,color:C.gold,background:`${C.gold}15`,padding:"3px 10px",borderRadius:20}}>{certs.length}</span>
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {certs.map((cert,i)=>(
              <div key={cert.id||i} style={{background:"#fff",borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",overflow:"hidden"}}>
                {/* Mini preview */}
                <div style={{height:140,overflow:"hidden",position:"relative",background:C.navy}}>
                  <img src={cert.svg} alt="Certificate" style={{width:"100%",objectFit:"cover",objectPosition:"top"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 50%, rgba(45,51,71,0.6))"}}/>
                </div>
                <div style={{padding:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:16}}>🏅</span>
                    <p style={{fontSize:14,fontWeight:700,color:C.navy,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cert.courseTitle}</p>
                  </div>
                  <p style={{fontSize:12,color:"#9CA3AF",marginBottom:14}}>{isRTL?"صدرت في":"Issued"} {cert.date}</p>
                  <a href={cert.svg} download={`Orbit-Certificate-${cert.courseTitleEn||cert.courseTitle}.svg`}
                    style={{...S.btnPrimary,display:"flex",justifyContent:"center",padding:"10px 0",fontSize:13,gap:8,textDecoration:"none",background:C.gold}}>
                    <I.Download/> {isRTL?"تحميل الشهادة":"Download Certificate"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null;
    })()}

    {/* ── PROFILE EDIT SECTION ── */}
    <div style={{background:"#fff",borderRadius:20,border:"1px solid rgba(45,51,71,0.07)",overflow:"hidden",marginBottom:40}}>
      <button onClick={()=>setEditProfile(!editProfile)} style={{width:"100%",padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:isRTL?"right":"left",background:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:42,height:42,borderRadius:12,background:`${C.teal}15`,display:"flex",alignItems:"center",justifyContent:"center",color:C.teal}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{textAlign:isRTL?"right":"left"}}>
            <p style={{fontSize:16,fontWeight:700,color:C.navy}}>{isRTL?"تعديل الملف الشخصي":"Edit Profile"}</p>
            <p style={{fontSize:13,color:"#9CA3AF",marginTop:2}}>{user?.name} · {user?.phone||"—"} · {user?.email}</p>
          </div>
        </div>
        <span style={{fontSize:18,color:"#9CA3AF",transform:editProfile?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</span>
      </button>

      {editProfile && (
        <div style={{padding:"0 28px 28px",borderTop:"1px solid #F0ECE5",direction:isRTL?"rtl":"ltr",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>
          <p style={{fontSize:13,color:"#9CA3AF",padding:"16px 0 20px",textAlign:isRTL?"right":"left"}}>
            {isRTL?"يمكنك تعديل الاسم ورقم الجوال. البريد الإلكتروني للعرض فقط.":"You can edit your name and phone number. Email is for display only."}
          </p>
          {pfErr && <div style={{...S.errBox,marginBottom:16}}>{pfErr}</div>}
          <form onSubmit={saveProfile}>
            <div className="name-grid" style={{marginBottom:14}}>
              <div>
                <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.firstName} *</label>
                <input required value={pf.firstName} onChange={e=>setPf({...pf,firstName:e.target.value})} style={{...S.input,textAlign:isRTL?"right":"left"}}/>
              </div>
              <div>
                <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.lastName} *</label>
                <input required value={pf.lastName} onChange={e=>setPf({...pf,lastName:e.target.value})} style={{...S.input,textAlign:isRTL?"right":"left"}}/>
              </div>
            </div>
            <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.email}</label>
            <input type="email" value={pf.email} readOnly style={{...S.input,marginBottom:14,background:"#F9F8F5",color:"#9CA3AF",cursor:"not-allowed"}}/>
            <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.phone} *</label>
            <input required type="tel" inputMode="numeric" value={pf.phone} onChange={e=>setPf({...pf,phone:e.target.value.replace(/[^0-9+\-\s]/g,"")})} placeholder={isRTL?"05XXXXXXXX":"05XXXXXXXX"} style={{...S.input,marginBottom:20,textAlign:isRTL?"right":"left"}}/>
            <div style={{display:"flex",gap:12}}>
              <button type="button" onClick={()=>setEditProfile(false)} style={{flex:1,padding:"12px",background:"#E8E4DD",borderRadius:10,fontWeight:600,fontSize:14,color:C.navy}}>
                {isRTL?"إلغاء":"Cancel"}
              </button>
              <button type="submit" style={{flex:1,...S.btnPrimary,padding:"12px",justifyContent:"center",fontSize:14}}>
                {isRTL?"حفظ التغييرات":"Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div></div>;
}

// ═══════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// RESET PASSWORD MODAL
// ═══════════════════════════════════════════
function ResetPasswordModal({ userId, token, isRTL, onDone }) {
  const [pw,  setPw]  = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const rules = [
    { test: pw.length>=8,         en:"At least 8 characters",     ar:"8 أحرف على الأقل" },
    { test: /[A-Z]/.test(pw),     en:"One uppercase letter (A-Z)", ar:"حرف كبير واحد" },
    { test: /[a-z]/.test(pw),     en:"One lowercase letter (a-z)", ar:"حرف صغير واحد" },
    { test: /[0-9]/.test(pw),     en:"One number (0-9)",           ar:"رقم واحد" },
  ];
  const passed = rules.filter(r=>r.test).length;
  const strengthColor = passed<=1?"#EF4444":passed===2?"#F59E0B":passed===3?"#3B82F6":C.success;

  const submit = (e) => {
    e.preventDefault(); setErr("");
    if (passed < 4) { setErr(isRTL?"كلمة المرور لا تستوفي المتطلبات":"Password does not meet requirements"); return; }
    if (pw !== pw2) { setErr(isRTL?"كلمتا المرور غير متطابقتين":"Passwords do not match"); return; }

    const allUsers = ls("orb_users",[]);
    const updated  = allUsers.map(u => u.id===userId
      ? {...u, password:pw, resetToken:"", resetExpiry:0}
      : u
    );
    ss("orb_users", updated);
    setDone(true);
    setTimeout(onDone, 2500);
  };

  return (
    <div style={S.modalOv}>
      <div style={{...S.modal,maxWidth:420}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}>
          <div>
            <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>
              {isRTL?"إنشاء كلمة مرور جديدة":"Create New Password"}
            </h2>
            <p style={{fontSize:13,color:"#9CA3AF",marginTop:2}}>
              {isRTL?"اختر كلمة مرور قوية لحسابك":"Choose a strong password for your account"}
            </p>
          </div>
        </div>
        <div style={{padding:28,direction:isRTL?"rtl":"ltr",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>
          {done ? (
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:48,marginBottom:16}}>✅</div>
              <h3 style={{fontSize:18,fontWeight:700,color:C.navy,marginBottom:8}}>
                {isRTL?"تم تغيير كلمة المرور!":"Password Changed!"}
              </h3>
              <p style={{fontSize:14,color:"#6B7280"}}>
                {isRTL?"سيتم توجيهك لتسجيل الدخول...":"Redirecting you to sign in..."}
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              {err && <div style={{...S.errBox,marginBottom:16}}>{err}</div>}

              <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left",marginBottom:6}}>
                {isRTL?"كلمة المرور الجديدة *":"New Password *"}
              </label>
              <input required type="password" value={pw} onChange={e=>setPw(e.target.value)}
                placeholder={isRTL?"أدخل كلمة المرور الجديدة":"Enter new password"}
                style={{...S.input,marginBottom:10,borderColor:pw?(passed===4?C.success:passed>=2?"#F59E0B":"#EF4444"):"#E8E4DD"}}/>

              {/* Strength bar */}
              {pw && <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{flex:1,display:"flex",gap:3}}>
                    {[1,2,3,4].map(i=>(
                      <div key={i} style={{flex:1,height:4,borderRadius:4,background:i<=passed?strengthColor:"#E8E4DD",transition:"background 0.2s"}}/>
                    ))}
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:strengthColor,minWidth:45}}>
                    {passed<=1?(isRTL?"ضعيفة":"Weak"):passed===2?(isRTL?"مقبولة":"Fair"):passed===3?(isRTL?"جيدة":"Good"):(isRTL?"قوية":"Strong")}
                  </span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"}}>
                  {rules.map((r,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:5,flexDirection:isRTL?"row-reverse":"row"}}>
                      <span style={{fontSize:12,color:r.test?C.success:"#D1D5DB"}}>{r.test?"✓":"○"}</span>
                      <span style={{fontSize:11,color:r.test?"#374151":"#9CA3AF"}}>{isRTL?r.ar:r.en}</span>
                    </div>
                  ))}
                </div>
              </div>}

              <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left",marginBottom:6}}>
                {isRTL?"تأكيد كلمة المرور *":"Confirm Password *"}
              </label>
              <div style={{position:"relative",marginBottom:20}}>
                <input required type="password" value={pw2} onChange={e=>setPw2(e.target.value)}
                  placeholder={isRTL?"أعد كتابة كلمة المرور":"Re-enter password"}
                  style={{...S.input,width:"100%",borderColor:pw2?(pw===pw2?C.success:"#EF4444"):"#E8E4DD"}}/>
                {pw2 && <span style={{position:"absolute",[isRTL?"left":"right"]:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>
                  {pw===pw2?"✅":"❌"}
                </span>}
              </div>

              <button type="submit" style={{...S.btnPrimary,width:"100%",justifyContent:"center",padding:"14px 0",fontSize:15}}>
                {isRTL?"تغيير كلمة المرور":"Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
const SocialIcons = {
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  x: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
};

function SocialLoginBtn({ provider, label, onClick }) {
  const bg    = provider==="x" ? "#000" : "#fff";
  const color = provider==="x" ? "#fff" : "#374151";
  const border= provider==="x" ? "none" : "1px solid #E8E4DD";
  return (
    <button onClick={onClick} style={{width:"100%",padding:"12px 20px",borderRadius:10,background:bg,border,display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:600,color,transition:"opacity 0.15s",cursor:"pointer"}}>
      <span style={{flexShrink:0,display:"flex",alignItems:"center"}}>{SocialIcons[provider]}</span>
      <span style={{flex:1,textAlign:"center"}}>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════
function LoginPage({ nav, login, t, isRTL, onSocial }) {
  const [f,setF]           = useState({email:"",password:""});
  const [err,setErr]        = useState("");
  const [showForgot,  setShowForgot]  = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent,  setForgotSent]  = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState(""); // shown on screen as fallback

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    const allUsers = ls("orb_users",[]);
    const found    = allUsers.find(u=>u.email===forgotEmail.toLowerCase().trim());

    // Generate reset token (even if not found — same message for security)
    const token   = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const resetLink = `${window.location.origin}/?reset=${token}`;

    if (found) {
      // Save reset token with 1-hour expiry
      const updated = allUsers.map(u=>u.email===found.email
        ? {...u, resetToken:token, resetExpiry: Date.now() + 3600000 }
        : u
      );
      ss("orb_users", updated);

      // Send reset email
      await sendEmail("reset_password", {
        to_name:    found.firstName || found.name?.split(" ")[0] || "User",
        to_email:   found.email,
        reset_url:  resetLink,
        platform:   ls("orb_siteName","Orbit Learning"),
        subject:    `Reset your ${ls("orb_siteName","Orbit Learning")} password`,
        message:    `Hi ${found.firstName||found.name?.split(" ")[0]},\n\nClick the link below to reset your password. This link expires in 1 hour.\n\n${resetLink}\n\nIf you didn't request this, ignore this email.\n\n— The ${ls("orb_siteName","Orbit Learning")} Team`,
      });

      setResetUrl(resetLink); // fallback shown on screen
    }

    setForgotLoading(false);
    setForgotSent(true); // always show same screen
  };

  const go = e => {
    e.preventDefault(); setErr("");
    const result = login(f.email, f.password);
    if (!result.ok) setErr(result.msg || (isRTL?"بريد إلكتروني أو كلمة مرور غير صحيحة":"Invalid email or password"));
  };
  return (
    <div style={{minHeight:"calc(100vh - 68px)",display:"flex",flexDirection:"column",direction:isRTL?"rtl":"ltr"}}>
      <div className="auth-split" style={{flex:1}}>
        <AuthPanel
          h={isRTL?"أهلاً بعودتك إلى Orbit.":"Welcome back to Orbit."}
          s={isRTL?"كمّل رحلتك نحو الاحتراف مع كورسات متخصصة وتطبيق عملي حقيقي.":"Continue your journey towards career mastery with expert-led, project-based courses."}
        />
        <div style={S.authForm}>
          <div style={{width:"100%",maxWidth:420}}>
            {/* LOGO — visible on mobile only (brand panel is hidden) */}
            <div className="auth-mobile-logo" style={{display:"none",alignItems:"center",gap:10,marginBottom:28,justifyContent:"center"}}>
              <OrbitLogo size={36}/>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.navy}}>Orbit</span>
            </div>
            <h1 style={{...S.authTitle,fontFamily:isRTL?"'Cairo',sans-serif":"'Playfair Display',serif",textAlign:isRTL?"right":"left"}}>{t.login.title}</h1>
            <p style={{fontSize:14,color:"#9CA3AF",marginBottom:24,textAlign:isRTL?"right":"left"}}>{t.login.noAccount} <button onClick={()=>nav("signup")} style={{color:C.gold,fontWeight:600}}>{t.login.signupLink}</button></p>
            {err && <div style={S.errBox}>{err}</div>}
            <form onSubmit={go}>
              <label style={{...S.label,textAlign:isRTL?"right":"left",display:"block"}}>{t.login.email}</label>
              <input required type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})} style={{...S.input,marginBottom:16,textAlign:isRTL?"right":"left"}}/>
              <label style={{...S.label,textAlign:isRTL?"right":"left",display:"block"}}>{t.login.password}</label>
              <input required type="password" autoComplete="current-password" placeholder={isRTL?"كلمة المرور":"Your password"} value={f.password} onChange={e=>setF({...f,password:e.target.value})} style={{...S.input,textAlign:isRTL?"right":"left"}}/>
              <div style={{textAlign:isRTL?"left":"right",margin:"8px 0 20px"}}>
                <button type="button" onClick={()=>{setShowForgot(true);setForgotSent(false);setForgotEmail("");}} style={{fontSize:13,color:C.gold,fontWeight:600}}>{t.login.forgot}</button>
              </div>
              <button type="submit" style={{...S.btnPrimary,width:"100%",justifyContent:"center",marginBottom:16,padding:"15px 0",fontSize:15}}>{t.login.btn}</button>
            </form>
            <div style={S.divider}><span style={{position:"relative",background:C.bg,padding:"0 16px",fontSize:12,color:"#9CA3AF"}}>{t.login.orWith}</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20}}>
              <SocialLoginBtn provider="google"   label={isRTL?"تسجيل الدخول بـ Google":   "Continue with Google"}   onClick={()=>onSocial("google")}/>

            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div style={S.modalOv} onClick={()=>setShowForgot(false)}>
          <div style={{...S.modal,maxWidth:420}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHead}>
              <h2 style={{fontSize:18,fontWeight:700,color:C.navy,direction:isRTL?"rtl":"ltr"}}>
                {isRTL?"إعادة تعيين كلمة المرور":"Reset Password"}
              </h2>
              <button onClick={()=>setShowForgot(false)} style={{color:"#9CA3AF"}}><I.X/></button>
            </div>
            <div style={{padding:28,direction:isRTL?"rtl":"ltr",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>
              {forgotSent ? (
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:16}}>📧</div>
                  <h3 style={{fontSize:18,fontWeight:700,color:C.navy,marginBottom:10}}>
                    {isRTL?"تحقق من بريدك الإلكتروني":"Check Your Email"}
                  </h3>
                  <p style={{fontSize:14,color:"#6B7280",lineHeight:1.9,marginBottom:20}}>
                    {isRTL
                      ? "إذا كان هذا البريد مسجّلاً لدينا، سيصلك رابط لإعادة تعيين كلمة المرور. الرابط صالح لمدة ساعة واحدة."
                      : "If this email is registered with us, you'll receive a password reset link. The link is valid for 1 hour."}
                  </p>

                  {/* On-screen fallback link */}
                  {resetUrl && (
                    <div style={{background:C.bg,border:`1.5px solid ${C.gold}40`,borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                      <p style={{fontSize:12,color:"#9CA3AF",marginBottom:10}}>
                        {isRTL?"أو استخدم الرابط أدناه مباشرةً:":"Or use this link directly:"}
                      </p>
                      <a href={resetUrl}
                        style={{display:"block",padding:"11px 20px",background:C.gold,color:"#fff",borderRadius:9,fontSize:14,fontWeight:700,textDecoration:"none"}}>
                        🔑 {isRTL?"إعادة تعيين كلمة المرور":"Reset My Password"}
                      </a>
                    </div>
                  )}

                  <p style={{fontSize:12,color:"#9CA3AF",marginBottom:20}}>
                    {isRTL?"لم تستلم الرسالة؟ تحقق من مجلد البريد المزعج.":"Didn't get it? Check your spam folder."}
                  </p>
                  <button onClick={()=>{ setShowForgot(false); setForgotSent(false); setResetUrl(""); }}
                    style={{...S.btnPrimary,margin:"0 auto",padding:"12px 32px",fontSize:15}}>
                    {isRTL?"العودة لتسجيل الدخول":"Back to Sign In"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot}>
                  <p style={{fontSize:14,color:"#6B7280",marginBottom:20,lineHeight:1.7,textAlign:isRTL?"right":"left"}}>
                    {isRTL
                      ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
                      : "Enter your email and we'll send you a reset link."}
                  </p>
                  <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.login.email}</label>
                  <input required type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{...S.input,marginBottom:20,textAlign:isRTL?"right":"left"}}
                    autoFocus/>
                  <button type="submit" disabled={forgotLoading}
                    style={{...S.btnPrimary,width:"100%",justifyContent:"center",padding:"13px 0",opacity:forgotLoading?0.7:1}}>
                    {forgotLoading
                      ? (isRTL?"جارٍ الإرسال...":"Sending...")
                      : (isRTL?"إرسال رابط الإعادة":"Send Reset Link")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SIGNUP
// ═══════════════════════════════════════════
function SignupPage({ nav, signup, t, isRTL, onSocial }) {
  const [f,setF]     = useState({firstName:"",lastName:"",email:"",phone:"",password:"",confirm:""});
  const [err,setErr]  = useState("");
  const [loading,setLoading]        = useState(false);
  const [done, setDone]             = useState(false);
  const [activationUrl, setActUrl]  = useState("");
  const [errIsLogin, setErrIsLogin] = useState(false);

  const go = async (e) => {
    e.preventDefault(); setErr("");
    if (!f.phone.trim())            { setErr(isRTL?"رقم الجوال مطلوب":"Mobile number is required"); return; }
    if (f.password.length < 8)           { setErr(isRTL?"كلمة المرور يجب أن تكون 8 أحرف على الأقل":"Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(f.password))       { setErr(isRTL?"يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل":"Password must contain at least one uppercase letter"); return; }
    if (!/[a-z]/.test(f.password))       { setErr(isRTL?"يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل":"Password must contain at least one lowercase letter"); return; }
    if (!/[0-9]/.test(f.password))       { setErr(isRTL?"يجب أن تحتوي كلمة المرور على رقم واحد على الأقل":"Password must contain at least one number"); return; }
    if (f.password !== f.confirm)   { setErr(isRTL?"كلمتا المرور غير متطابقتين":"Passwords do not match"); return; }
    setLoading(true);
    const result = await signup(f);
    setLoading(false);
    if (!result.ok) {
      if (result.msg === "email_exists") {
        setErr(isRTL
          ? "يبدو أن هذا البريد الإلكتروني مسجّل بالفعل. هل تريد تسجيل الدخول؟"
          : "This email is already registered. Want to sign in instead?");
        setErrIsLogin(true);
      } else {
        setErr(isRTL?"حدث خطأ، يرجى المحاولة لاحقاً":"An error occurred, please try again");
        setErrIsLogin(false);
      }
    } else {
      setActUrl(result.activationUrl||"");
      setDone(true);
    }
  };

  // ── VERIFICATION PENDING SCREEN ──
  if (done) return (
    <div style={{minHeight:"calc(100vh - 68px)",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,direction:isRTL?"rtl":"ltr",padding:"40px 20px"}}>
      <div style={{background:"#fff",borderRadius:24,padding:"48px 40px",maxWidth:480,width:"100%",textAlign:"center",boxShadow:"0 8px 40px rgba(45,51,71,0.1)"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:`${C.gold}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:36}}>📧</div>
        <h2 style={{fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif",fontSize:24,fontWeight:700,color:C.navy,marginBottom:12}}>
          {isRTL?"تحقق من بريدك الإلكتروني":"Check Your Email"}
        </h2>
        <p style={{fontSize:15,color:"#6B7280",lineHeight:1.9,marginBottom:8}}>
          {isRTL
            ? `أرسلنا رابط تفعيل إلى`
            : `We sent an activation link to`}
        </p>
        <p style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:24}}>{f.email}</p>
        <div style={{background:C.bg,borderRadius:14,padding:"16px 20px",marginBottom:28,textAlign:isRTL?"right":"left"}}>
          {[
            isRTL?"افتح بريدك الإلكتروني":"Open your email inbox",
            isRTL?"ابحث عن رسالة من Orbit Learning":"Find the email from Orbit Learning",
            isRTL?"اضغط على رابط التفعيل":"Click the activation link",
            isRTL?"سيتم تسجيل دخولك تلقائياً":"You'll be logged in automatically",
          ].map((step,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<3?12:0,flexDirection:isRTL?"row-reverse":"row"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:C.gold,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <p style={{fontSize:14,color:"#4A5568"}}>{step}</p>
            </div>
          ))}
        </div>
        <p style={{fontSize:13,color:"#9CA3AF",marginBottom:20}}>
          {isRTL?"لم تستلم الرسالة؟ تحقق من مجلد البريد المزعج (Spam).":"Didn't receive it? Check your spam/junk folder."}
        </p>

        {/* FALLBACK: show link directly if EmailJS not set up */}
        {activationUrl && (
          <div style={{background:C.bg,border:`1.5px solid ${C.gold}40`,borderRadius:12,padding:"16px 20px",marginBottom:20,textAlign:"left"}}>
            <p style={{fontSize:12,fontWeight:700,color:"#9CA3AF",marginBottom:8,textAlign:"center"}}>
              {isRTL?"أو انقر على الرابط أدناه مباشرةً:":"Or click the link below directly:"}
            </p>
            <a href={activationUrl}
              style={{display:"block",padding:"12px 20px",background:C.gold,color:"#fff",borderRadius:10,fontSize:14,fontWeight:700,textAlign:"center",textDecoration:"none",wordBreak:"break-all"}}>
              ✅ {isRTL?"تفعيل حسابي الآن":"Activate My Account Now"}
            </a>
          </div>
        )}

        <button onClick={()=>nav("login")} style={{...S.btnPrimary,margin:"0 auto",padding:"12px 32px",fontSize:15}}>
          {isRTL?"العودة لتسجيل الدخول":"Back to Sign In"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"calc(100vh - 68px)",display:"flex",flexDirection:"column",direction:isRTL?"rtl":"ltr"}}>
      <div className="auth-split" style={{flex:1}}>
        <AuthPanel
          h={isRTL?"ابدأ رحلتك مع Orbit اليوم.":"Start your Orbit journey today."}
          s={isRTL?"انضم لآلاف الطلاب الذين يتقنون مهارات عالية الطلب مع كورسات متخصصة.":"Join thousands mastering in-demand skills with expert-led, project-based courses."}
        />
        <div style={S.authForm}>
          <div style={{width:"100%",maxWidth:420}}>
            <div className="auth-mobile-logo" style={{display:"none",alignItems:"center",gap:10,marginBottom:28,justifyContent:"center"}}>
              <OrbitLogo size={36}/>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.navy}}>Orbit</span>
            </div>
            <h1 style={{...S.authTitle,fontFamily:isRTL?"'Cairo',sans-serif":"'Playfair Display',serif",textAlign:isRTL?"right":"left"}}>{t.signup.title}</h1>
            <p style={{fontSize:14,color:"#9CA3AF",marginBottom:16,textAlign:isRTL?"right":"left"}}>{t.signup.hasAccount} <button onClick={()=>nav("login")} style={{color:C.gold,fontWeight:600}}>{t.signup.loginLink}</button></p>

            {err && (
              <div style={{padding:"12px 16px",background:errIsLogin?`${C.gold}10`:C.dangerBg,border:`1.5px solid ${errIsLogin?C.gold:C.danger}30`,borderRadius:10,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <p style={{fontSize:13,color:errIsLogin?C.goldD:C.danger,flex:1}}>{err}</p>
                {errIsLogin && (
                  <button type="button" onClick={()=>nav("login")}
                    style={{padding:"7px 16px",background:C.gold,color:"#fff",borderRadius:8,fontSize:13,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>
                    {isRTL?"تسجيل الدخول":"Sign In"}
                  </button>
                )}
              </div>
            )}
            <form onSubmit={go}>
              {/* FIRST + LAST */}
              <div className="name-grid" style={{marginBottom:14}}>
                <div>
                  <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.firstName} *</label>
                  <input required placeholder={isRTL?"الاسم الأول":"First name"} autoComplete="given-name" value={f.firstName} onChange={e=>setF({...f,firstName:e.target.value})} style={{...S.input,textAlign:isRTL?"right":"left"}}/>
                </div>
                <div>
                  <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.lastName} *</label>
                  <input required placeholder={isRTL?"اسم العائلة":"Last name"} autoComplete="family-name" value={f.lastName} onChange={e=>setF({...f,lastName:e.target.value})} style={{...S.input,textAlign:isRTL?"right":"left"}}/>
                </div>
              </div>

              {/* EMAIL */}
              <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.email} *</label>
              <input required type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})} style={{...S.input,marginBottom:14,textAlign:isRTL?"right":"left"}}/>

              {/* PHONE */}
              <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.phone} *</label>
              <div style={{position:"relative",marginBottom:14}}>
                <span style={{position:"absolute",[isRTL?"right":"left"]:14,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#9CA3AF",pointerEvents:"none",lineHeight:1}}>🇸🇦 +966</span>
                <input required type="tel" inputMode="numeric" autoComplete="tel" placeholder="5XXXXXXXX"
                  value={f.phone} onChange={e=>setF({...f,phone:e.target.value.replace(/[^0-9+\-\s]/g,"")})}
                  style={{...S.input,[isRTL?"paddingRight":"paddingLeft"]:88,textAlign:isRTL?"right":"left"}}/>
              </div>

              {/* PASSWORD */}
              <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>{t.signup.password} *</label>
              <input required type="password" autoComplete="new-password" placeholder={isRTL?"أدخل كلمة المرور":"Enter your password"}
                value={f.password} onChange={e=>setF({...f,password:e.target.value})}
                style={{...S.input,marginBottom:10,textAlign:isRTL?"right":"left",
                  borderColor: f.password
                    ? (()=>{ const r=[f.password.length>=8,/[A-Z]/.test(f.password),/[a-z]/.test(f.password),/[0-9]/.test(f.password)]; const passed=r.filter(Boolean).length; return passed===4?C.success:passed>=2?"#F59E0B":C.danger; })()
                    : "#E8E4DD"}}/>

              {/* PASSWORD STRENGTH METER + RULES */}
              {f.password && (()=>{
                const rules = [
                  { test: f.password.length>=8,          en:"At least 8 characters",     ar:"8 أحرف على الأقل" },
                  { test: /[A-Z]/.test(f.password),      en:"One uppercase letter (A-Z)", ar:"حرف كبير واحد (A-Z)" },
                  { test: /[a-z]/.test(f.password),      en:"One lowercase letter (a-z)", ar:"حرف صغير واحد (a-z)" },
                  { test: /[0-9]/.test(f.password),      en:"One number (0-9)",           ar:"رقم واحد (0-9)" },
                ];
                const passed  = rules.filter(r=>r.test).length;
                const strength = passed<=1?"weak":passed===2?"fair":passed===3?"good":"strong";
                const colors   = {weak:C.danger, fair:"#F59E0B", good:"#3B82F6", strong:C.success};
                const labels   = {
                  weak:  {en:"Weak",   ar:"ضعيفة"},
                  fair:  {en:"Fair",   ar:"مقبولة"},
                  good:  {en:"Good",   ar:"جيدة"},
                  strong:{en:"Strong", ar:"قوية"},
                };
                const col = colors[strength];
                return (
                  <div style={{marginBottom:14}}>
                    {/* Strength bar */}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div style={{flex:1,display:"flex",gap:3}}>
                        {[1,2,3,4].map(i=>(
                          <div key={i} style={{flex:1,height:4,borderRadius:4,background:i<=passed?col:"#E8E4DD",transition:"background 0.2s"}}/>
                        ))}
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:col,minWidth:40,textAlign:isRTL?"left":"right"}}>
                        {isRTL?labels[strength].ar:labels[strength].en}
                      </span>
                    </div>
                    {/* Rules checklist */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"}}>
                      {rules.map((r,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:5,flexDirection:isRTL?"row-reverse":"row"}}>
                          <span style={{fontSize:12,color:r.test?C.success:"#D1D5DB",flexShrink:0}}>{r.test?"✓":"○"}</span>
                          <span style={{fontSize:11,color:r.test?"#374151":"#9CA3AF"}}>{isRTL?r.ar:r.en}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* CONFIRM PASSWORD */}
              <label style={{...S.label,display:"block",textAlign:isRTL?"right":"left"}}>
                {isRTL?"تأكيد كلمة المرور *":"Confirm Password *"}
              </label>
              <div style={{position:"relative",marginBottom:16}}>
                <input required type="password" autoComplete="new-password" placeholder={isRTL?"أعد كتابة كلمة المرور":"Re-enter your password"}
                  value={f.confirm} onChange={e=>setF({...f,confirm:e.target.value})}
                  style={{...S.input,textAlign:isRTL?"right":"left",width:"100%",
                    borderColor: f.confirm && f.password!==f.confirm ? C.danger : f.confirm && f.password===f.confirm ? C.success : "#E8E4DD"}}/>
                {f.confirm && (
                  <span style={{position:"absolute",[isRTL?"left":"right"]:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>
                    {f.password===f.confirm ? "✅" : "❌"}
                  </span>
                )}
              </div>

              <button type="submit" disabled={loading} style={{...S.btnPrimary,width:"100%",justifyContent:"center",marginBottom:16,padding:"15px 0",fontSize:15,opacity:loading?0.7:1}}>
                {loading ? (isRTL?"جارٍ الإنشاء...":"Creating account...") : t.signup.btn}
              </button>
            </form>
            <p style={{fontSize:11,color:"#9CA3AF",textAlign:"center",lineHeight:1.7}}>{t.signup.terms}</p>
            <div style={S.divider}><span style={{position:"relative",background:C.bg,padding:"0 16px",fontSize:12,color:"#9CA3AF"}}>{t.login.orWith}</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20}}>
              <SocialLoginBtn provider="google" label={isRTL?"التسجيل بـ Google":"Sign up with Google"} onClick={()=>onSocial("google")}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPanel({ h, s }) {
  return (
    <div className="auth-brand" style={{background:C.navy,padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%, rgba(184,150,90,0.12), transparent 55%)"}}/>
      <div style={{position:"relative"}}>
        <OrbitLogo size={56} light/>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,3vw,36px)",fontWeight:700,color:C.cream,marginTop:40,marginBottom:16,lineHeight:1.2}}>{h}</h2>
        <p style={{fontSize:15,color:"rgba(213,207,193,0.7)",lineHeight:1.7,maxWidth:380}}>{s}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// FOOTER PAGES
// ═══════════════════════════════════════════
function StaticPage({ title, children, isRTL }) {
  return (
    <div style={{paddingTop:48,paddingBottom:80,direction:isRTL?"rtl":"ltr",fontFamily:isRTL?"'Cairo',sans-serif":"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"0 24px"}}>
        <h1 style={{...S.pageTitle,marginBottom:8,textAlign:isRTL?"right":"left",fontFamily:isRTL?"'Cairo',sans-serif":"'Playfair Display',serif"}}>{title}</h1>
        <div style={{height:3,width:48,background:C.gold,borderRadius:2,marginBottom:32,marginRight:isRTL?"0":"auto",marginLeft:isRTL?"auto":"0"}}/>
        {children}
      </div>
    </div>
  );
}

function AboutPage({ nav, t }) {
  const isRTL = t?.dir === "rtl";
  const content = {
    title:       isRTL ? "من نحن"                    : "About Orbit",
    missionH:    isRTL ? "رسالتنا"                   : "Our Mission",
    missionT:    isRTL ? "Orbit موجودة لتجعل التعليم العالمي في متناول طلاب التصميم الداخلي والهندسة. نتعاون مع ممارسين حقيقيين في الصناعة — لا أكاديميين فحسب — لتقديم كورسات تترجم مباشرةً إلى مهارات حقيقية وفرص مهنية."
                        : "Orbit exists to make world-class education accessible to interior design & architecture students. We partner with industry practitioners — not just academics — to deliver courses that directly translate to real-world skills and career advancement.",
    storyH:      isRTL ? "قصتنا"                     : "Our Story",
    storyT1:     isRTL ? "تأسست Orbit عام 2020 من ملاحظة بسيطة: معظم التعليم الإلكتروني يركز على النظرية أكثر من التطبيق. بنينا Orbit لسد هذه الفجوة — كل كورس مصمم بمنهجية تعتمد على الممارسة الحقيقية، مع مشاريع فعلية وتغذية راجعة من الزملاء."
                        : "Founded in 2020, Orbit was born from a simple observation: most online education focuses on theory over practice. We built Orbit to close that gap — every course is designed with a practitioner-first approach, emphasizing real projects, peer feedback, and industry relevance.",
    storyT2:     isRTL ? "اليوم نخدم المتعلمين في منطقة الخليج والشرق الأوسط، مع مكتبة متنامية من الكورسات في التصميم، والبرمجة، والبيانات، واستراتيجية الأعمال."
                        : "Today we serve learners across the GCC and MENA region, with a growing library of courses in design, development, data, and business strategy.",
    teamH:       isRTL ? "فريقنا — مصممون ومدرّبون قبل أي شيء" : "Our Team — Designers and Educators First",
    stats: isRTL
      ? [{v:"+500",l:"متعلم نشط"},{v:"+20",l:"مدرّب متخصص"},{v:"98%",l:"معدل الرضا"}]
      : [{v:"500+",l:"Active Learners"},{v:"20+",l:"Expert Instructors"},{v:"98%",l:"Satisfaction Rate"}],
  };
  return (
    <StaticPage title={content.title} isRTL={isRTL}>
      <div style={{display:"grid",gap:32}}>
        <div style={{background:"#fff",borderRadius:20,padding:40,border:"1px solid rgba(45,51,71,0.07)"}}>
          <h2 style={{fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif",fontSize:24,fontWeight:700,color:C.navy,marginBottom:16,textAlign:isRTL?"right":"left"}}>{content.missionH}</h2>
          <p style={{fontSize:16,color:"#4A5568",lineHeight:1.9,textAlign:isRTL?"right":"left"}}>{content.missionT}</p>
        </div>
        <div className="grid-3">
          {content.stats.map((s,i)=>(
            <div key={i} style={{background:C.navy,borderRadius:16,padding:32,textAlign:"center"}}>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:C.cream}}>{s.v}</p>
              <p style={{fontSize:14,color:"rgba(213,207,193,0.6)",marginTop:8,fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:20,padding:40,border:"1px solid rgba(45,51,71,0.07)"}}>
          <h2 style={{fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif",fontSize:24,fontWeight:700,color:C.navy,marginBottom:16,textAlign:isRTL?"right":"left"}}>{content.storyH}</h2>
          <p style={{fontSize:15,color:"#4A5568",lineHeight:1.9,marginBottom:16,textAlign:isRTL?"right":"left"}}>{content.storyT1}</p>
          <p style={{fontSize:15,color:"#4A5568",lineHeight:1.9,textAlign:isRTL?"right":"left"}}>{content.storyT2}</p>
        </div>
        <div style={{background:"#fff",borderRadius:20,padding:40,border:"1px solid rgba(45,51,71,0.07)"}}>
          <h2 style={{fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif",fontSize:24,fontWeight:700,color:C.navy,marginBottom:12,textAlign:isRTL?"right":"left"}}>{content.teamH}</h2>
          <p style={{fontSize:15,color:"#4A5568",lineHeight:1.9,textAlign:isRTL?"right":"left"}}>
            {isRTL ? "يقود Orbit مصممون ومطورون يعملون في الصناعة بشكل فعلي. نؤمن بأن أفضل معلم هو من يطبّق ما يعلّمه كل يوم." : "Orbit is led by designers and developers who are actively working in the industry. We believe the best teacher is one who practices what they teach every day."}
          </p>
        </div>
      </div>
    </StaticPage>
  );
}

function CareersPage({ nav, t }) {
  const isRTL = t?.dir === "rtl";
  const jobs   = ls("orb_jobs", []);
  const [selJob,   setSelJob]   = useState(null);
  const [form,     setForm]     = useState({name:"",email:"",phone:"",cover:""});
  const [cvFile,   setCvFile]   = useState(null);
  const [success,  setSuccess]  = useState(false);
  const [err,      setErr]      = useState("");
  const fileRef = useRef();

  // Fallback demo jobs if admin hasn't posted yet
  const displayJobs = jobs.length > 0 ? jobs : (isRTL ? [
    {id:"demo1",titleEn:"Senior Frontend Engineer",titleAr:"مهندس واجهات أمامية أول",deptEn:"Engineering",deptAr:"الهندسة",locationEn:"Remote / Riyadh",locationAr:"عن بُعد / الرياض",typeEn:"Full-time",typeAr:"دوام كامل"},
    {id:"demo2",titleEn:"Curriculum Designer",titleAr:"مصمم مناهج تعليمية",deptEn:"Education",deptAr:"التعليم",locationEn:"Riyadh",locationAr:"الرياض",typeEn:"Full-time",typeAr:"دوام كامل"},
  ] : [
    {id:"demo1",titleEn:"Senior Frontend Engineer",titleAr:"مهندس واجهات أمامية أول",deptEn:"Engineering",deptAr:"الهندسة",locationEn:"Remote / Riyadh",locationAr:"عن بُعد / الرياض",typeEn:"Full-time",typeAr:"دوام كامل"},
    {id:"demo2",titleEn:"Curriculum Designer",titleAr:"مصمم مناهج تعليمية",deptEn:"Education",deptAr:"التعليم",locationEn:"Riyadh",locationAr:"الرياض",typeEn:"Full-time",typeAr:"دوام كامل"},
  ]);

  const handleApply = (e) => {
    e.preventDefault(); setErr("");
    if (!form.name||!form.email) { setErr(isRTL?"الرجاء إدخال الاسم والبريد الإلكتروني":"Please fill name and email"); return; }
    const saveApp = async (cvDataUrl) => {
      const app = { id:`app-${Date.now()}`, jobId:selJob.id, name:form.name, email:form.email, phone:form.phone, cover:form.cover, cvName:cvFile?.name||"", cvUrl:cvDataUrl||"", date:new Date().toLocaleDateString() };
      const existing = ls("orb_apps",[]);
      ss("orb_apps",[...existing,app]);

      const platform  = ls("orb_siteName","Orbit Learning");
      const jobTitle  = selJob.titleEn;
      const adminEmail = ls("orb_adminEmail","");

      // Email 1: Confirmation to APPLICANT
      await sendEmail("career_applicant", {
        to_name:   form.name,
        to_email:  form.email,
        job_title: jobTitle,
        platform:  platform,
        subject:   `Application Received – ${jobTitle} at ${platform}`,
        message:   `Hi ${form.name},\n\nThank you for applying to "${jobTitle}" at ${platform}. We've received your application and will review it carefully.\n\nWe'll reach out if your profile is a match.\n\nBest regards,\nThe ${platform} Team`,
      });

      // Email 2: New application alert to ADMIN
      if (adminEmail) {
        await sendEmail("career_admin", {
          to_name:   "Hiring Team",
          to_email:  adminEmail,
          job_title: jobTitle,
          applicant: form.name,
          app_email: form.email,
          app_phone: form.phone||"—",
          cover:     form.cover||"(none)",
          cv_name:   cvFile?.name||"No CV",
          platform:  platform,
          subject:   `New Application: ${form.name} → ${jobTitle}`,
          message:   `New application received for "${jobTitle}".\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone||"—"}\n\nCover Letter:\n${form.cover||"(none)"}\nCV: ${cvFile?.name||"Not uploaded"}\n\nLog in to Admin → Careers to view and download the CV.`,
        });
      }

      setSuccess(true);
    };
    if (cvFile) {
      const reader = new FileReader();
      reader.onload = ev => saveApp(ev.target.result);
      reader.readAsDataURL(cvFile);
    } else {
      saveApp("");
    }
  };

  return (
    <StaticPage title={isRTL?"الوظائف في Orbit":"Careers at Orbit"} isRTL={isRTL}>
      {/* INTRO */}
      <div style={{background:"#fff",borderRadius:20,padding:40,border:"1px solid rgba(45,51,71,0.07)",marginBottom:32}}>
        <h2 style={{fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.navy,marginBottom:12,textAlign:isRTL?"right":"left"}}>
          {isRTL?"انضم إلى فريقنا":"Join Our Team"}
        </h2>
        <p style={{fontSize:15,color:"#4A5568",lineHeight:1.9,textAlign:isRTL?"right":"left"}}>
          {isRTL
            ? "نبني مستقبل التعليم المهني في العالم العربي. إذا كنت شغوفاً بالتعلم والتصميم والتقنية — يسعدنا أن نتعرف عليك."
            : "We're building the future of professional education in the Arab world. If you're passionate about learning, design, and technology — we'd love to meet you."}
        </p>
      </div>

      {/* JOB LISTINGS */}
      <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:32}}>
        {displayJobs.map((j)=>(
          <div key={j.id} style={{background:"#fff",borderRadius:16,padding:28,border:"1px solid rgba(45,51,71,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16,flexDirection:isRTL?"row-reverse":"row"}}>
            <div style={{textAlign:isRTL?"right":"left"}}>
              <h3 style={{fontSize:17,fontWeight:700,color:C.navy,marginBottom:6}}>{isRTL?j.titleAr:j.titleEn}</h3>
              <div style={{display:"flex",gap:12,fontSize:13,color:"#6B7280",flexWrap:"wrap",flexDirection:isRTL?"row-reverse":"row"}}>
                <span>{isRTL?j.deptAr:j.deptEn}</span>
                <span>{isRTL?j.locationAr:j.locationEn}</span>
                <span style={{padding:"2px 10px",background:`${C.teal}15`,color:C.teal,borderRadius:20,fontWeight:600}}>{isRTL?j.typeAr:j.typeEn}</span>
              </div>
              {(isRTL?j.descAr:j.descEn) && <p style={{fontSize:13,color:"#6B7280",marginTop:8,lineHeight:1.7}}>{isRTL?j.descAr:j.descEn}</p>}
            </div>
            <button onClick={()=>{setSelJob(j);setSuccess(false);setForm({name:"",email:"",phone:"",cover:""}); setCvFile(null);}} style={{...S.btnPrimary,padding:"10px 24px",fontSize:14}}>
              {isRTL?"تقدّم الآن ←":"Apply →"}
            </button>
          </div>
        ))}
        {displayJobs.length===0 && <div style={{...S.empty,padding:40}}><p style={{color:"#9CA3AF"}}>{isRTL?"لا توجد وظائف متاحة حالياً":"No open positions at the moment"}</p></div>}
      </div>

      {/* APPLICATION MODAL */}
      {selJob && <div style={S.modalOv} onClick={()=>setSelJob(null)}>
        <div style={{...S.modal,maxWidth:520}} onClick={e=>e.stopPropagation()}>
          <div style={S.modalHead}>
            <div>
              <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>{isRTL?"تقديم طلب":"Apply Now"}</h2>
              <p style={{fontSize:13,color:"#9CA3AF",marginTop:2}}>{isRTL?selJob.titleAr:selJob.titleEn}</p>
            </div>
            <button onClick={()=>setSelJob(null)} style={{color:"#9CA3AF"}}><I.X/></button>
          </div>
          <div style={{padding:28,overflowY:"auto",maxHeight:"80vh",direction:isRTL?"rtl":"ltr",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>
            {success ? (
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{fontSize:48,marginBottom:16}}>✅</div>
                <h3 style={{fontSize:20,fontWeight:700,color:C.navy,marginBottom:8}}>{isRTL?"تم إرسال طلبك!":"Application Submitted!"}</h3>
                <p style={{fontSize:14,color:"#6B7280",lineHeight:1.7}}>{isRTL?"شكراً لاهتمامك. سنراجع طلبك ونتواصل معك قريباً.":"Thank you for your interest. We'll review your application and get back to you soon."}</p>
              </div>
            ) : (
              <form onSubmit={handleApply}>
                {err && <div style={S.errBox}>{err}</div>}
                <label style={{...S.label,textAlign:isRTL?"right":"left",display:"block"}}>{isRTL?"الاسم الكامل *":"Full Name *"}</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{...S.input,marginBottom:14,textAlign:isRTL?"right":"left"}}/>
                <label style={{...S.label,textAlign:isRTL?"right":"left",display:"block"}}>{isRTL?"البريد الإلكتروني *":"Email *"}</label>
                <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{...S.input,marginBottom:14,textAlign:isRTL?"right":"left"}}/>
                <label style={{...S.label,textAlign:isRTL?"right":"left",display:"block"}}>{isRTL?"رقم الجوال":"Phone Number"}</label>
                <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{...S.input,marginBottom:14,textAlign:isRTL?"right":"left"}}/>
                <label style={{...S.label,textAlign:isRTL?"right":"left",display:"block"}}>{isRTL?"رفع السيرة الذاتية (PDF)":"Upload CV (PDF)"}</label>
                <div style={{padding:16,background:C.bg,borderRadius:10,border:"1.5px dashed #D1D5DB",marginBottom:14,textAlign:"center",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
                  {cvFile ? <p style={{fontSize:14,color:C.teal,fontWeight:600}}>📄 {cvFile.name}</p> : <p style={{fontSize:13,color:"#9CA3AF"}}>{isRTL?"اضغط لرفع ملف PDF":"Click to upload PDF"}</p>}
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{display:"none"}} onChange={e=>setCvFile(e.target.files?.[0])}/>
                </div>
                <label style={{...S.label,textAlign:isRTL?"right":"left",display:"block"}}>{isRTL?"رسالة التعريف (اختياري)":"Cover Letter (optional)"}</label>
                <textarea rows={4} value={form.cover} onChange={e=>setForm({...form,cover:e.target.value})} placeholder={isRTL?"اكتب رسالتك هنا...":"Tell us why you'd be a great fit..."} style={{...S.input,resize:"vertical",marginBottom:20,textAlign:isRTL?"right":"left"}}/>
                <button type="submit" style={{...S.btnPrimary,width:"100%",justifyContent:"center",padding:"14px 0"}}>{isRTL?"إرسال الطلب":"Submit Application"}</button>
              </form>
            )}
          </div>
        </div>
      </div>}
    </StaticPage>
  );
}

function HelpPage({ nav, t }) {
  const isRTL = t?.dir === "rtl";
  const faqs = isRTL ? [
    {q:"كيف أسجّل في كورس؟",                  a:"تصفح الكورسات، اضغط على أي كورس، ثم اضغط 'اشترك الآن'. سيرشدك النظام خلال عملية الدفع الآمنة."},
    {q:"ما وسائل الدفع المقبولة؟",              a:"نقبل البطاقات الائتمانية، Apple Pay، وSTC Pay. جميع الأسعار تشمل ضريبة القيمة المضافة 15% وفق لوائح المملكة."},
    {q:"هل يمكنني استرداد المبلغ؟",             a:"نقدم ضمان استرداد كامل خلال 7 أيام من الشراء. تواصل مع الدعم خلال 7 أيام إذا لم تكن راضياً."},
    {q:"كيف أصل إلى كورساتي؟",                 a:"بعد الاشتراك، انتقل إلى لوحتك واضغط على 'كمّل التعلم' في أي كورس مسجّل."},
    {q:"هل تنتهي صلاحية الكورسات؟",            a:"لا. بمجرد اشتراكك، تحصل على وصول مدى الحياة لمحتوى الكورس بما يشمل أي تحديثات مستقبلية."},
  ] : [
    {q:"How do I enroll in a course?",         a:"Browse courses, click on any course, then click 'Enroll Now'. You'll be guided through a secure payment process."},
    {q:"What payment methods are accepted?",   a:"We accept Credit/Debit cards, Apple Pay, and STC Pay. All prices include 15% VAT as required by Saudi regulations."},
    {q:"Can I get a refund?",                  a:"We offer a 7-day money-back guarantee for all courses. Contact support within 7 days of purchase if you're not satisfied."},
    {q:"How do I access my courses?",          a:"After enrollment, go to your Dashboard and click 'Continue Learning' on any enrolled course."},
    {q:"Do courses expire?",                   a:"No. Once enrolled, you have lifetime access to the course content including any future updates."},
  ];
  const contacts = isRTL
    ? [{icon:"✉️",l:"البريد الإلكتروني",v:"support@orbit.sa"},{icon:"💬",l:"الدردشة المباشرة",v:"متاح داخل التطبيق"}]
    : [{icon:"✉️",l:"Email",v:"support@orbit.sa"},{icon:"💬",l:"Live Chat",v:"Available in-app"}];
  return (
    <StaticPage title={isRTL?"مركز المساعدة":"Help Center"} isRTL={isRTL}>
      <div style={{background:"#fff",borderRadius:20,padding:40,border:"1px solid rgba(45,51,71,0.07)",marginBottom:32}}>
        <h2 style={{fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.navy,marginBottom:12,textAlign:isRTL?"right":"left"}}>
          {isRTL?"تواصل مع الدعم":"Contact Support"}
        </h2>
        <p style={{fontSize:15,color:"#4A5568",marginBottom:24,textAlign:isRTL?"right":"left"}}>
          {isRTL?"فريقنا متاح الأحد – الخميس، من 9 صباحاً حتى 6 مساءً.":"Our team is available Sunday–Thursday, 9am–6pm AST."}
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {contacts.map((c,i)=>(
            <div key={i} style={{padding:20,background:C.bg,borderRadius:12,border:"1px solid #E8E4DD",textAlign:isRTL?"right":"left"}}>
              <p style={{fontSize:20,marginBottom:8}}>{c.icon}</p>
              <p style={{fontSize:12,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1}}>{c.l}</p>
              <p style={{fontSize:15,fontWeight:600,color:C.navy,marginTop:4}}>{c.v}</p>
            </div>
          ))}
        </div>
      </div>
      <h2 style={{...S.secTitle,marginBottom:20,textAlign:isRTL?"right":"left",fontFamily:isRTL?"'Cairo',serif":"'Playfair Display',serif"}}>
        {isRTL?"الأسئلة الشائعة":"Frequently Asked Questions"}
      </h2>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {faqs.map((f,i)=><FaqItem key={i} q={f.q} a={f.a} isRTL={isRTL}/>)}
      </div>
    </StaticPage>
  );
}

function FaqItem({ q, a, isRTL }) {
  const [open,setOpen] = useState(false);
  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid rgba(45,51,71,0.07)",overflow:"hidden"}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:isRTL?"right":"left",flexDirection:isRTL?"row-reverse":"row"}}>
        <span style={{fontSize:15,fontWeight:600,color:C.navy}}>{q}</span>
        <span style={{fontSize:20,color:C.gold,transform:open?"rotate(45deg)":"none",transition:"transform 0.2s",flexShrink:0,marginLeft:isRTL?0:12,marginRight:isRTL?12:0}}>+</span>
      </button>
      {open && <div style={{padding:"0 24px 18px",fontSize:14,color:"#4A5568",lineHeight:1.8,textAlign:isRTL?"right":"left"}}>{a}</div>}
    </div>
  );
}

function PrivacyPage({ nav, t }) {
  const isRTL = t?.dir === "rtl";
  const sections = isRTL ? [
    {h:"المعلومات التي نجمعها",         b:"نجمع المعلومات التي تقدمها مباشرةً (الاسم، البريد الإلكتروني، معلومات الدفع) وبيانات الاستخدام لتحسين منصتنا."},
    {h:"كيف نستخدم معلوماتك",           b:"تُستخدم بياناتك لتقديم خدماتنا، ومعالجة المدفوعات، وإرسال تحديثات الكورسات، وتحسين تجربة المنصة."},
    {h:"مشاركة البيانات",               b:"لا نبيع بياناتك الشخصية. نشارك البيانات فقط مع معالجي الدفع ومزودي الخدمات اللازمين لتقديم خدماتنا."},
    {h:"الاحتفاظ بالبيانات",            b:"نحتفظ ببياناتك طالما حسابك نشط. يمكنك طلب الحذف في أي وقت عبر التواصل مع الدعم."},
    {h:"حقوقك",                         b:"لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها. تواصل معنا على support@orbit.sa لأي طلبات."},
    {h:"الأمان",                         b:"نستخدم تشفير SSL بقوة 256 بت ونتبع أفضل ممارسات الصناعة لحماية معلوماتك."},
  ] : [
    {h:"Information We Collect",        b:"We collect information you provide directly (name, email, payment info) and usage data to improve our platform."},
    {h:"How We Use Your Information",   b:"Your data is used to provide our services, process payments, send course updates, and improve the platform experience."},
    {h:"Data Sharing",                  b:"We do not sell your personal data. We share data only with payment processors and service providers necessary to deliver our services."},
    {h:"Data Retention",                b:"We retain your data as long as your account is active. You may request deletion at any time by contacting support."},
    {h:"Your Rights",                   b:"You have the right to access, correct, or delete your personal data. Contact support@orbit.sa for any data requests."},
    {h:"Security",                      b:"We use 256-bit SSL encryption and follow industry best practices to protect your information."},
  ];
  return (
    <StaticPage title={isRTL?"سياسة الخصوصية":"Privacy Policy"} isRTL={isRTL}>
      <div style={{background:"#fff",borderRadius:20,padding:40,border:"1px solid rgba(45,51,71,0.07)"}}>
        <p style={{fontSize:13,color:"#9CA3AF",marginBottom:32,textAlign:isRTL?"right":"left"}}>
          {isRTL?"آخر تحديث: 1 مايو 2026":"Last updated: May 1, 2026"}
        </p>
        {sections.map((s,i)=>(
          <div key={i} style={{marginBottom:28}}>
            <h3 style={{fontSize:17,fontWeight:700,color:C.navy,marginBottom:8,textAlign:isRTL?"right":"left",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>{s.h}</h3>
            <p style={{fontSize:15,color:"#4A5568",lineHeight:1.9,textAlign:isRTL?"right":"left"}}>{s.b}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}

function TermsPage({ nav, t }) {
  const isRTL = t?.dir === "rtl";
  const sections = isRTL ? [
    {h:"قبول الشروط",                   b:"باستخدامك لـ Orbit، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام منصتنا."},
    {h:"مسؤوليات الحساب",               b:"أنت مسؤول عن الحفاظ على سرية بيانات تسجيل دخولك وعن جميع الأنشطة التي تتم تحت حسابك."},
    {h:"الوصول إلى الكورسات",           b:"عند الاشتراك، تحصل على ترخيص شخصي غير قابل للنقل للوصول إلى محتوى الكورس. مشاركة بيانات الدخول محظورة."},
    {h:"سياسة الاسترداد",               b:"يتوفر استرداد المبلغ خلال 7 أيام من الشراء، شريطة ألا تكون قد أتممت أكثر من 20% من محتوى الكورس."},
    {h:"الملكية الفكرية",               b:"جميع محتويات الكورسات مملوكة لـ Orbit أو مدرّبيها. يُحظر إعادة إنتاج المحتوى أو توزيعه دون إذن."},
    {h:"القانون المعمول به",             b:"تخضع هذه الشروط لقوانين المملكة العربية السعودية."},
  ] : [
    {h:"Acceptance of Terms",           b:"By accessing Orbit, you agree to be bound by these Terms. If you disagree, please do not use our platform."},
    {h:"Account Responsibilities",      b:"You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account."},
    {h:"Course Access",                 b:"Upon enrollment, you receive a personal, non-transferable license to access the course content. Sharing credentials is prohibited."},
    {h:"Refund Policy",                 b:"Refunds are available within 7 days of purchase, provided you have not completed more than 20% of the course content."},
    {h:"Intellectual Property",         b:"All course content is owned by Orbit or its instructors. Reproduction or redistribution without permission is prohibited."},
    {h:"Governing Law",                 b:"These Terms are governed by the laws of the Kingdom of Saudi Arabia."},
  ];
  return (
    <StaticPage title={isRTL?"الشروط والأحكام":"Terms of Service"} isRTL={isRTL}>
      <div style={{background:"#fff",borderRadius:20,padding:40,border:"1px solid rgba(45,51,71,0.07)"}}>
        <p style={{fontSize:13,color:"#9CA3AF",marginBottom:32,textAlign:isRTL?"right":"left"}}>
          {isRTL?"آخر تحديث: 1 مايو 2026":"Last updated: May 1, 2026"}
        </p>
        {sections.map((s,i)=>(
          <div key={i} style={{marginBottom:28}}>
            <h3 style={{fontSize:17,fontWeight:700,color:C.navy,marginBottom:8,textAlign:isRTL?"right":"left",fontFamily:isRTL?"'Cairo',sans-serif":"inherit"}}>{s.h}</h3>
            <p style={{fontSize:15,color:"#4A5568",lineHeight:1.9,textAlign:isRTL?"right":"left"}}>{s.b}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}

// ═══════════════════════════════════════════
// ADMIN LAYOUT
// ═══════════════════════════════════════════
function AdminLayout({ user, logout, sec, setSec, courses, orders, users, addCourse, updateCourse, deleteCourse, addUserAdmin, updateUser, deleteUser, nav, selCourse, setSelCourse, onSiteNameChange }) {
  const menuItems = [
    {id:"overview",  icon:<I.Grid/>,    l:"Overview"},
    {id:"courses",   icon:<I.Book/>,    l:"Courses"},
    {id:"users",     icon:<I.Users/>,   l:"Users"},
    {id:"careers",   icon:<I.Briefcase/>,l:"Careers"},
    {id:"discounts", icon:<I.Tag/>,       l:"Discounts"},
    {id:"revenue",   icon:<I.Dollar/>,    l:"Revenue"},
    {id:"settings",  icon:<I.Settings/>,l:"Settings"},
  ];
  return (
    // Force admin panel to always be English LTR — regardless of site language setting
    <div style={{display:"flex",minHeight:"100vh",direction:"ltr",fontFamily:"'DM Sans',sans-serif"}} lang="en">
    <aside style={{width:240,background:C.navy,padding:"24px 0",display:"flex",flexDirection:"column",flexShrink:0}} className="admin-side">
      <div style={{padding:"0 20px",marginBottom:32,display:"flex",alignItems:"center",gap:10}}><OrbitLogo size={28} light/><span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.cream}}>Orbit</span></div>
      <nav style={{flex:1,padding:"0 12px"}}>
        {menuItems.map(m=><button key={m.id} onClick={()=>setSec(m.id)} style={{width:"100%",padding:"12px 16px",borderRadius:10,display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:500,color:sec===m.id?C.cream:"rgba(213,207,193,0.6)",background:sec===m.id?"rgba(213,207,193,0.1)":"transparent",marginBottom:4}}>{m.icon}{m.l}</button>)}
      </nav>
      <div style={{padding:"0 12px"}}>
        <div style={{borderTop:"1px solid rgba(213,207,193,0.1)",paddingTop:16}}>
          <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}><div style={{width:32,height:32,borderRadius:8,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff"}}>{user?.name?.[0]}</div><div><p style={{fontSize:13,fontWeight:600,color:C.cream}}>{user?.name}</p><p style={{fontSize:11,color:"rgba(213,207,193,0.5)"}}>Administrator</p></div></div>
        </div>
        <button onClick={logout} style={{width:"100%",padding:"10px 16px",borderRadius:10,display:"flex",alignItems:"center",gap:12,fontSize:13,color:"rgba(213,207,193,0.6)"}}><I.Exit/> Sign Out</button>
      </div>
    </aside>
    <main style={{flex:1,background:C.bg,overflow:"auto",minWidth:0}}>
      {sec==="overview"    && <AdminOverview courses={courses} orders={orders} users={users} nav={nav}/>}
      {sec==="courses"     && <AdminCourses courses={courses} updateCourse={updateCourse} deleteCourse={deleteCourse} setSec={setSec} setSelCourse={setSelCourse}/>}
      {sec==="course-form" && <AdminCourseForm course={selCourse} addCourse={addCourse} updateCourse={updateCourse} setSec={setSec} setSelCourse={setSelCourse}/>}
      {sec==="users"       && <AdminUsers users={users} addUserAdmin={addUserAdmin} updateUser={updateUser} deleteUser={deleteUser}/>}
      {sec==="careers"     && <AdminCareers/>}
      {sec==="discounts"   && <AdminDiscounts/>}
      {sec==="revenue"     && <AdminRevenue orders={orders}/>}
      {sec==="settings"    && <AdminSettings onSiteNameChange={onSiteNameChange}/>}
    </main>
  </div>
  );
}

// ═══════════════════════════════════════════
// REVENUE CHART (Dual-year comparison)
// ═══════════════════════════════════════════
function RevenueChart({ data2026, data2025, labels }) {
  const LBL = labels || MONTHS;
  const W=760,H=200,P={t:20,r:20,b:36,l:64};
  const cW=W-P.l-P.r, cH=H-P.t-P.b;
  const allVals=[...data2026,...data2025].filter(v=>v>0);
  const maxVal=allVals.length?Math.max(...allVals)*1.15:50000;
  const minVal=0;
  const n = Math.max(data2026.length, data2025.length, 2);
  const x=i=>P.l+i/(n-1)*cW;
  const y=v=>P.t+cH-(v-minVal)/(maxVal-minVal||1)*cH;
  const toPath=data=>data.map((v,i)=>`${i===0?"M":"L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const toArea=data=>`${toPath(data)} L${x(data.length-1).toFixed(1)},${(P.t+cH).toFixed(1)} L${P.l},${(P.t+cH).toFixed(1)} Z`;
  const ticks=[0,Math.round(maxVal*0.25),Math.round(maxVal*0.5),Math.round(maxVal*0.75),Math.round(maxVal)];
  // Show at most 12 labels to avoid crowding
  const step = Math.ceil(LBL.length/12);

  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block",overflow:"visible"}}>
    <defs>
      <linearGradient id="g26" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity="0.2"/><stop offset="100%" stopColor={C.gold} stopOpacity="0"/></linearGradient>
      <linearGradient id="g25" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.teal} stopOpacity="0.12"/><stop offset="100%" stopColor={C.teal} stopOpacity="0"/></linearGradient>
    </defs>
    {ticks.map(v=><g key={v}><line x1={P.l} y1={y(v)} x2={W-P.r} y2={y(v)} stroke="#F0ECE5" strokeWidth="1"/><text x={P.l-8} y={y(v)+4} textAnchor="end" fontSize="10" fill="#9CA3AF">{v>=1000?`${(v/1000).toFixed(0)}k`:v}</text></g>)}
    {data2025.length>1 && <><path d={toArea(data2025)} fill="url(#g25)"/><path d={toPath(data2025)} fill="none" stroke={C.teal} strokeWidth="1.5" strokeDasharray="5 4"/></>}
    {data2026.length>1 && <><path d={toArea(data2026)} fill="url(#g26)"/><path d={toPath(data2026)} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {data2026.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke={C.gold} strokeWidth="2"/>)}</>}
    {LBL.map((m,i)=>i%step===0&&<text key={m} x={x(i)} y={H-6} textAnchor="middle" fontSize="10" fill="#9CA3AF">{m}</text>)}
  </svg>;
}

// ═══════════════════════════════════════════
// ADMIN OVERVIEW — configurable year comparison
// ═══════════════════════════════════════════
function AdminOverview({ courses, orders, users, nav }) {
  const [yearA,   setYearA]   = useState("2026");
  const [yearB,   setYearB]   = useState("2025");
  const [monthsA, setMonthsA] = useState([]); // [] = All months
  const [monthsB, setMonthsB] = useState([]);

  const rev = orders.reduce((s,o)=>s+o.amount,0);
  const pub = courses.filter(c=>c.published).length;

  const toggleMonth = (setter, current, m) => {
    setter(current.includes(m) ? current.filter(x=>x!==m) : [...current, m]);
  };

  const buildData = (yr, selectedMonths) => {
    const active = selectedMonths.length===0 ? MONTHS : selectedMonths;
    if (selectedMonths.length===1) {
      // daily breakdown for single month
      const mi  = MONTHS.indexOf(selectedMonths[0]);
      const days = new Date(Number(yr), mi+1, 0).getDate();
      const arr  = Array(days).fill(0);
      orders.forEach(o=>{
        const d = new Date(o.date);
        if (!isNaN(d) && String(d.getFullYear())===yr && d.getMonth()===mi) arr[d.getDate()-1]+=o.amount;
      });
      return arr;
    }
    // monthly totals (for selected months only)
    const arr = Array(12).fill(0);
    orders.forEach(o=>{
      const d = new Date(o.date);
      if (!isNaN(d) && String(d.getFullYear())===yr) arr[d.getMonth()]+=o.amount;
    });
    return MONTHS.map((m,i)=> active.includes(m) ? arr[i] : 0);
  };

  const dataA  = buildData(yearA, monthsA);
  const dataB  = buildData(yearB, monthsB);
  const labels = monthsA.length===1
    ? Array.from({length:dataA.length},(_,i)=>String(i+1))
    : MONTHS;

  const years = ["2024","2025","2026","2027"];
  const selStyle = {...S.selInput, padding:"7px 12px", minWidth:88, fontSize:13};

  const MonthPicker = ({ selected, onToggle, accentColor }) => (
    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
      {MONTHS.map(m=>{
        const on = selected.includes(m);
        return <button key={m} type="button" onClick={()=>onToggle(m)}
          style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:600,border:`1.5px solid ${on?accentColor:"#E8E4DD"}`,background:on?accentColor:"#fff",color:on?"#fff":"#6B7280",transition:"all 0.15s"}}>{m}</button>;
      })}
      {selected.length>0 && <button type="button" onClick={()=>onToggle("__clear__")} style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:600,border:"1.5px solid #E8E4DD",color:"#9CA3AF"}}>Clear</button>}
    </div>
  );

  return <div style={{padding:40}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:12}}>
      <div>
        <h1 style={S.pageTitle}>Dashboard Overview</h1>
        <p style={{...S.pageSub,marginBottom:0}}>Platform analytics & key metrics</p>
      </div>
      <button onClick={()=>nav("home")} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",background:"#fff",border:`1.5px solid ${C.creamL}`,borderRadius:10,fontSize:14,fontWeight:600,color:C.navy}}>
        ← View Site
      </button>
    </div>

    {/* STAT CARDS */}
    <div className="grid-4s" style={{marginBottom:40,marginTop:36}}>
      {[
        {icon:<I.Dollar/>, l:"Total Revenue", v:<Price value={rev} size={24} bold={800} color={C.navy}/>, col:C.gold, t:"+12%"},
        {icon:<I.Book/>,   l:"Total Courses", v:courses.length, col:C.teal, t:`${pub} published`},
        {icon:<I.Users/>,  l:"Students",      v:users.length,   col:C.navy, t:"registered"},
        {icon:<I.Chart/>,  l:"Orders",        v:orders.length,  col:C.plum, t:orders.length?<Price value={Math.round(rev/orders.length)} size={12} bold={600} color={C.teal}/>:"—"},
      ].map((s,i)=>(
        <div key={i} style={S.adminStat}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${s.col}15`,display:"flex",alignItems:"center",justifyContent:"center",color:s.col}}>{s.icon}</div>
            <span style={{fontSize:12,fontWeight:600,color:C.teal,display:"flex",alignItems:"center",gap:4}}><I.TrendUp/>{s.t}</span>
          </div>
          <p style={{fontSize:26,fontWeight:800,color:C.navy,fontFamily:"'Playfair Display',serif",marginBottom:4}}>{s.v}</p>
          <p style={{fontSize:13,color:"#9CA3AF"}}>{s.l}</p>
        </div>
      ))}
    </div>

    {/* REVENUE CHART */}
    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:32}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>Revenue Comparison</h2>
          <p style={{fontSize:13,color:"#9CA3AF",marginTop:4}}>Select months to compare — empty = all months</p>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"start",marginBottom:24}}>
        {/* PERIOD A */}
        <div style={{padding:16,background:`${C.gold}08`,borderRadius:12,border:`1.5px solid ${C.gold}30`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{width:20,height:3,background:C.gold,borderRadius:2,display:"inline-block"}}/>
            <select value={yearA} onChange={e=>setYearA(e.target.value)} style={selStyle}>{years.map(y=><option key={y}>{y}</option>)}</select>
          </div>
          <MonthPicker selected={monthsA} onToggle={m=>m==="__clear__"?setMonthsA([]):toggleMonth(setMonthsA,monthsA,m)} accentColor={C.gold}/>
        </div>
        {/* VS */}
        <div style={{padding:"8px 4px",textAlign:"center",color:"#9CA3AF",fontWeight:700,fontSize:13}}>vs</div>
        {/* PERIOD B */}
        <div style={{padding:16,background:`${C.teal}08`,borderRadius:12,border:`1.5px solid ${C.teal}30`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{width:20,height:2,background:C.teal,borderRadius:2,display:"inline-block"}}/>
            <select value={yearB} onChange={e=>setYearB(e.target.value)} style={selStyle}>{years.map(y=><option key={y}>{y}</option>)}</select>
          </div>
          <MonthPicker selected={monthsB} onToggle={m=>m==="__clear__"?setMonthsB([]):toggleMonth(setMonthsB,monthsB,m)} accentColor={C.teal}/>
        </div>
      </div>
      <RevenueChart data2026={dataA} data2025={dataB} labels={labels}/>
    </div>

    {/* RECENT COURSES */}
    <h2 style={{fontSize:18,fontWeight:700,color:C.navy,marginBottom:16}}>Recent Courses</h2>
    {courses.length>0
      ?<div style={{display:"grid",gap:12}}>
        {courses.slice(-5).reverse().map(c=>(
          <div key={c.id} style={{background:"#fff",padding:20,borderRadius:12,border:"1px solid rgba(45,51,71,0.07)",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{width:56,height:56,borderRadius:12,overflow:"hidden",flexShrink:0}}><CourseThumbnail color={c.color} patternType={c.patternType} iconUrl={c.iconUrl}/></div>
            <div style={{flex:1,minWidth:140}}><h3 style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:2}}>{c.title}</h3><p style={{fontSize:13,color:"#9CA3AF"}}>{c.instructor} · {fmtStr(c.price)}</p></div>
            <span style={{fontSize:12,padding:"4px 12px",background:c.published?`${C.teal}15`:"#E8E4DD",color:c.published?C.teal:"#6B7280",borderRadius:20,fontWeight:600}}>{c.published?"Published":"Draft"}</span>
          </div>
        ))}
      </div>
      :<div style={{background:"#fff",padding:48,borderRadius:16,textAlign:"center",border:"1px solid rgba(45,51,71,0.07)"}}><p style={{color:"#9CA3AF"}}>No courses yet</p></div>}
  </div>;
}

// ═══════════════════════════════════════════
// ADMIN COURSES
// ═══════════════════════════════════════════
function AdminCourses({ courses, updateCourse, deleteCourse, setSec, setSelCourse }) {
  const [delId,      setDelId]      = useState(null);
  const [progCourse, setProgCourse] = useState(null); // course to view progress

  // Get all users who enrolled in a specific course + their progress
  const getCourseProgress = (courseId) => {
    const allUsers = ls("orb_users",[]);
    return allUsers
      .filter(u=>u.enrolledCourses?.includes(courseId))
      .map(u=>{
        let prog = {};
        try { prog = JSON.parse(localStorage.getItem(`orb_prog_${u.id}_${courseId}`))||{}; } catch {}
        const total  = courses.find(c=>c.id===courseId)?.modules?.length || 0;
        const done   = Object.values(prog).filter(Boolean).length;
        const pct    = total>0 ? Math.round((done/total)*100) : 0;
        return { id:u.id, name:u.name, email:u.email, done, total, pct, hasCert:!!(u.certificates?.find(c=>c.courseId===courseId)) };
      });
  };

  // Remove a student from a course
  const unenrollUser = (userId, courseId) => {
    const allUsers = ls("orb_users",[]);
    const updated  = allUsers.map(u=> u.id===userId
      ? {...u, enrolledCourses:(u.enrolledCourses||[]).filter(id=>id!==courseId)}
      : u
    );
    ss("orb_users",updated);
    // Refresh progress view
    setProgCourse(c=>({...c, _refresh:Date.now()}));
  };

  return <div style={{padding:40}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32,flexWrap:"wrap",gap:16}}>
      <div><h1 style={S.pageTitle}>Manage Courses</h1><p style={{...S.pageSub,marginTop:6}}>{courses.length} total · {courses.filter(c=>c.published).length} published</p></div>
      <button onClick={()=>{setSelCourse(null);setSec("course-form");}} style={S.btnPrimary}>+ Add Course</button>
    </div>

    {courses.length>0
      ? <div style={{display:"grid",gap:12}}>
          {courses.map(c=>(
            <div key={c.id} style={{background:"#fff",padding:20,borderRadius:12,border:"1px solid rgba(45,51,71,0.07)",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <div style={{width:64,height:64,borderRadius:12,overflow:"hidden",flexShrink:0}}><CourseThumbnail color={c.color} patternType={c.patternType} iconUrl={c.iconUrl}/></div>
              <div style={{flex:1,minWidth:180}}>
                <h3 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:2}}>{c.title}</h3>
                <p style={{fontSize:13,color:"#9CA3AF"}}>{c.instructor} · {c.category} · {c.isFree?"Free":fmtStr(c.price)}</p>
                <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,padding:"2px 8px",background:c.published?C.successBg:"#F3F4F6",color:c.published?C.success:"#6B7280",borderRadius:20,fontWeight:600}}>{c.published?"✓ Published":"Draft"}</span>
                  <span style={{fontSize:11,padding:"2px 8px",background:"#F3F4F6",color:"#6B7280",borderRadius:20}}>{c.students||0} students</span>
                  {c.isFree && <span style={{fontSize:11,padding:"2px 8px",background:C.successBg,color:C.success,borderRadius:20,fontWeight:600}}>FREE</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>setProgCourse(c)} style={{padding:"8px 14px",background:`${C.teal}15`,color:C.teal,borderRadius:8,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Students
                </button>
                <button onClick={()=>updateCourse(c.id,{published:!c.published})} style={{padding:"8px 14px",background:c.published?"#E8E4DD":C.teal,color:c.published?"#6B7280":"#fff",borderRadius:8,fontSize:13,fontWeight:600}}>
                  {c.published?"Unpublish":"Publish"}
                </button>
                <button onClick={()=>{setSelCourse(c);setSec("course-form");}} style={{padding:"8px 14px",background:C.gold,color:"#fff",borderRadius:8,fontSize:13,fontWeight:600}}>Edit</button>
                <button onClick={()=>setDelId(c.id)} style={{padding:"8px 14px",background:C.danger,color:"#fff",borderRadius:8,fontSize:13,fontWeight:600}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      : <div style={S.empty}><I.Book/><h2 style={{...S.secTitle,marginTop:16}}>No Courses</h2><p style={{color:"#9CA3AF",marginTop:8,marginBottom:24}}>Add your first course</p><button onClick={()=>{setSelCourse(null);setSec("course-form");}} style={S.btnPrimary}>+ Add Course</button></div>}

    {/* DELETE CONFIRM */}
    {delId && <div style={S.modalOv} onClick={()=>setDelId(null)}><div style={{...S.modal,maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:20,fontWeight:700,padding:"28px 28px 12px"}}>Delete Course?</h3>
      <p style={{color:"#6B7280",padding:"0 28px 24px"}}>This cannot be undone. All enrolled students will lose access.</p>
      <div style={{display:"flex",gap:12,padding:"0 28px 28px"}}>
        <button onClick={()=>setDelId(null)} style={{flex:1,padding:12,background:"#E8E4DD",borderRadius:10,fontWeight:600}}>Cancel</button>
        <button onClick={()=>{deleteCourse(delId);setDelId(null);}} style={{flex:1,padding:12,background:C.danger,color:"#fff",borderRadius:10,fontWeight:600}}>Delete</button>
      </div>
    </div></div>}

    {/* STUDENT PROGRESS MODAL */}
    {progCourse && (()=>{
      const students = getCourseProgress(progCourse.id);
      return (
        <div style={S.modalOv} onClick={()=>setProgCourse(null)}>
          <div style={{...S.modal,maxWidth:640,maxHeight:"85vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHead}>
              <div>
                <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>Student Progress</h2>
                <p style={{fontSize:13,color:"#9CA3AF",marginTop:2}}>{progCourse.title} · {students.length} enrolled</p>
              </div>
              <button onClick={()=>setProgCourse(null)} style={{color:"#9CA3AF"}}><I.X/></button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"0 0 20px"}}>
              {students.length>0 ? (
                <table style={{width:"100%",fontSize:14,borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#F5F2ED",position:"sticky",top:0}}>
                      {["Student","Progress","Lessons","Certificate","Action"].map(h=>(
                        <th key={h} style={{padding:"10px 20px",textAlign:"left",fontWeight:600,color:"#6B7280",fontSize:12,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s=>(
                      <tr key={s.id} style={{borderBottom:"1px solid #F0ECE5"}}>
                        <td style={{padding:"14px 20px"}}>
                          <p style={{fontWeight:600,color:C.navy}}>{s.name}</p>
                          <p style={{fontSize:12,color:"#9CA3AF"}}>{s.email}</p>
                        </td>
                        <td style={{padding:"14px 20px",minWidth:120}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{flex:1,height:6,background:"#E8E4DD",borderRadius:10,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${s.pct}%`,background:s.pct===100?C.success:C.gold,borderRadius:10,transition:"width 0.4s"}}/>
                            </div>
                            <span style={{fontSize:12,fontWeight:700,color:s.pct===100?C.success:C.navy,minWidth:32}}>{s.pct}%</span>
                          </div>
                        </td>
                        <td style={{padding:"14px 20px",color:"#6B7280",fontSize:13,whiteSpace:"nowrap"}}>
                          {s.done} / {s.total}
                        </td>
                        <td style={{padding:"14px 20px"}}>
                          {s.hasCert
                            ? <span style={{fontSize:11,padding:"3px 9px",background:C.successBg,color:C.success,borderRadius:20,fontWeight:600}}>🎓 Earned</span>
                            : <span style={{fontSize:11,padding:"3px 9px",background:"#F3F4F6",color:"#9CA3AF",borderRadius:20}}>—</span>}
                        </td>
                        <td style={{padding:"14px 20px"}}>
                          <button onClick={()=>{ if(window.confirm(`Remove ${s.name} from this course?`)) unenrollUser(s.id,progCourse.id); }}
                            style={{padding:"5px 12px",background:C.dangerBg,color:C.danger,borderRadius:6,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{padding:"48px 32px",textAlign:"center"}}>
                  <p style={{color:"#9CA3AF",fontSize:15}}>No students enrolled yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })()}
  </div>;
}

// ═══════════════════════════════════════════
// ADMIN COURSE FORM — with icon upload
// ═══════════════════════════════════════════
function AdminCourseForm({ course, addCourse, updateCourse, setSec, setSelCourse }) {
  const isEdit = !!course;
  const [tab,  setTab]  = useState("details");
  const [f,    setF]    = useState(course || {title:"",category:"Design",instructor:"",duration:"",price:"",originalPrice:"",level:"Beginner",description:"",color:C.navy,patternType:"circles",whatYouLearn:[""],modules:[],published:false,iconUrl:""});
  const [icon, setIcon] = useState(course?.iconUrl||"");
  const iconRef = useRef();

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setIcon(ev.target.result); setF(prev=>({...prev,iconUrl:ev.target.result})); };
    reader.readAsDataURL(file);
  };

  const go = (e) => {
    e.preventDefault();
    const data={...f,price:Number(f.price),originalPrice:Number(f.originalPrice)||null,whatYouLearn:(f.whatYouLearn||[]).filter(Boolean),iconUrl:icon};
    isEdit ? updateCourse(course.id,data) : addCourse(data);
    setSelCourse(null); setSec("courses");
  };

  const addMod=()=>setF({...f,modules:[...f.modules,{id:`m-${Date.now()}`,title:"",duration:"",type:"video",videoUrl:"",free:false}]});
  const updMod=(i,k,v)=>{const m=[...f.modules];m[i]={...m[i],[k]:v};setF({...f,modules:m});};
  const delMod=i=>setF({...f,modules:f.modules.filter((_,j)=>j!==i)});
  const updList=(k,i,v)=>{const a=[...(f[k]||[])];a[i]=v;setF({...f,[k]:a});};
  const addList=k=>setF({...f,[k]:[...(f[k]||[]),""]});
  const delList=(k,i)=>setF({...f,[k]:(f[k]||[]).filter((_,j)=>j!==i)});

  const colors=[C.navy,C.teal,C.gold,C.plum,C.slate,"#7C6A4A",C.rust,"#4A6B7C","#2D6A8A"];
  const formTabs=[{id:"details",l:"Details"},{id:"curriculum",l:"Curriculum"},{id:"pricing",l:"Pricing"},{id:"appearance",l:"Appearance"}];

  return <div style={{padding:40}}><div style={{maxWidth:860,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
      <div><h1 style={S.pageTitle}>{isEdit?"Edit Course":"Add New Course"}</h1><p style={{...S.pageSub,marginTop:6}}>Fill in the course details below</p></div>
      <button onClick={()=>{setSelCourse(null);setSec("courses");}} style={{padding:"8px 20px",background:"#E8E4DD",borderRadius:8,fontWeight:600,fontSize:13}}>← Back</button>
    </div>

    {/* FORM TABS */}
    <div style={{display:"flex",gap:0,marginBottom:32,borderBottom:"2px solid #E8E4DD",overflowX:"auto"}}>
      {formTabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 24px",fontSize:14,fontWeight:tab===t.id?700:500,color:tab===t.id?C.navy:"#6B7280",borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-2,whiteSpace:"nowrap"}}>{t.l}</button>)}
    </div>

    <form onSubmit={go}>
      {/* DETAILS TAB */}
      {tab==="details" && <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)"}}>

        {/* COMMON FIELDS */}
        <div className="form-grid-2" style={{marginBottom:20}}>
          <div><label style={S.label}>Category</label><select value={f.category} onChange={e=>setF({...f,category:e.target.value})} style={S.input}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={S.label}>Level</label><select value={f.level} onChange={e=>setF({...f,level:e.target.value})} style={S.input}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
        </div>
        <div className="form-grid-2" style={{marginBottom:20}}>
          <div><label style={S.label}>Instructor</label><input placeholder="Instructor name" value={f.instructor} onChange={e=>setF({...f,instructor:e.target.value})} style={S.input}/></div>
          <div><label style={S.label}>Duration</label><input placeholder="e.g. 24h" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})} style={S.input}/></div>
        </div>

        {/* BILINGUAL CONTENT — EN / AR tabs */}
        <div style={{border:"1px solid #E8E4DD",borderRadius:14,overflow:"hidden",marginBottom:20}}>
          {/* LANGUAGE TAB BAR */}
          <div style={{display:"flex",borderBottom:"1px solid #E8E4DD",background:"#F9F8F5"}}>
            {[["en","🇬🇧 English"],["ar","🇸🇦 Arabic / عربي"]].map(([lng,label])=>(
              <button key={lng} type="button" onClick={()=>setF({...f,_langTab:lng})}
                style={{flex:1,padding:"12px 20px",fontSize:14,fontWeight:(f._langTab||"en")===lng?700:500,color:(f._langTab||"en")===lng?C.navy:"#9CA3AF",background:(f._langTab||"en")===lng?"#fff":"transparent",borderBottom:(f._langTab||"en")===lng?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-1,transition:"all 0.15s"}}>
                {label}
              </button>
            ))}
            <div style={{padding:"10px 16px",display:"flex",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#9CA3AF",fontWeight:600,background:"#E8E4DD",padding:"3px 10px",borderRadius:20}}>Both required</span>
            </div>
          </div>

          {/* ENGLISH FIELDS */}
          {(f._langTab||"en")==="en" && (
            <div style={{padding:24}}>
              <label style={S.label}>Course Title (English) *</label>
              <input required placeholder="e.g. AutoCAD for Interior Designers — From Zero to Professional" value={f.title||""} onChange={e=>setF({...f,title:e.target.value})} style={{...S.input,marginBottom:16}}/>
              <label style={S.label}>Description (English)</label>
              <textarea rows={4} placeholder="Tired of random YouTube videos? This course is built specifically for interior design students — step by step, with practical projects from lesson one." value={f.description||""} onChange={e=>setF({...f,description:e.target.value})} style={{...S.input,resize:"vertical",lineHeight:1.7,marginBottom:16}}/>
              <label style={S.label}>What Students Will Learn (English)</label>
              {(f.whatYouLearn||[""]).map((x,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                  <input value={x} placeholder={`Learning outcome ${i+1}...`} onChange={e=>updList("whatYouLearn",i,e.target.value)} style={S.input}/>
                  {(f.whatYouLearn||[]).length>1 && <button type="button" onClick={()=>delList("whatYouLearn",i)} style={{padding:"0 14px",background:C.danger,color:"#fff",borderRadius:8,fontWeight:700}}>×</button>}
                </div>
              ))}
              <button type="button" onClick={()=>addList("whatYouLearn")} style={{fontSize:13,color:C.gold,fontWeight:600,marginTop:4}}>+ Add outcome</button>
            </div>
          )}

          {/* ARABIC FIELDS */}
          {(f._langTab||"en")==="ar" && (
            <div style={{padding:24,direction:"rtl",fontFamily:"'Cairo',sans-serif"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,background:`${C.gold}08`,padding:"10px 14px",borderRadius:10,border:`1px solid ${C.gold}20`}}>
                <span style={{fontSize:16}}>💡</span>
                <p style={{fontSize:13,color:C.goldD,direction:"rtl"}}>المحتوى العربي يظهر للمستخدمين الذين يستخدمون اللغة العربية. استخدم نفس المعلومات مترجمة بشكل طبيعي — لا ترجمة حرفية.</p>
              </div>
              <label style={{...S.label,direction:"rtl",textAlign:"right"}}>عنوان الكورس (عربي) *</label>
              <input placeholder="مثال: أوتوكاد للمصممين الداخليين — من الصفر للاحتراف" value={f.titleAr||""} onChange={e=>setF({...f,titleAr:e.target.value})} style={{...S.input,marginBottom:16,direction:"rtl",textAlign:"right",fontFamily:"'Cairo',sans-serif"}}/>
              <label style={{...S.label,direction:"rtl",textAlign:"right"}}>وصف الكورس (عربي)</label>
              <textarea rows={4} placeholder="هل تعبت من مشاهدة يوتيوب وما توصل لنتيجة؟ هذا الكورس مبني خصيصاً لطلاب التصميم الداخلي، خطوة بخطوة..." value={f.descriptionAr||""} onChange={e=>setF({...f,descriptionAr:e.target.value})} style={{...S.input,resize:"vertical",lineHeight:1.8,marginBottom:16,direction:"rtl",textAlign:"right",fontFamily:"'Cairo',sans-serif"}}/>
              <label style={{...S.label,direction:"rtl",textAlign:"right"}}>ماذا سيتعلم الطالب (عربي)</label>
              {(f.whatYouLearnAr||[""]).map((x,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8,direction:"rtl"}}>
                  <button type="button" onClick={()=>{const a=[...(f.whatYouLearnAr||[])];a.splice(i,1);setF({...f,whatYouLearnAr:a});}} style={{padding:"0 14px",background:C.danger,color:"#fff",borderRadius:8,fontWeight:700,flexShrink:0,display:(f.whatYouLearnAr||[]).length>1?"block":"none"}}>×</button>
                  <input value={x} placeholder={`نتيجة تعليمية ${i+1}...`} onChange={e=>{const a=[...(f.whatYouLearnAr||[""])];a[i]=e.target.value;setF({...f,whatYouLearnAr:a});}} style={{...S.input,direction:"rtl",textAlign:"right",fontFamily:"'Cairo',sans-serif"}}/>
                </div>
              ))}
              <button type="button" onClick={()=>setF({...f,whatYouLearnAr:[...(f.whatYouLearnAr||[""]),""]})} style={{fontSize:13,color:C.gold,fontWeight:700,marginTop:4,direction:"rtl"}}>+ أضف نقطة</button>
            </div>
          )}

          {/* COMPLETION STATUS */}
          <div style={{padding:"10px 24px",background:"#F9F8F5",borderTop:"1px solid #E8E4DD",display:"flex",gap:16,flexWrap:"wrap"}}>
            <span style={{fontSize:12,display:"flex",alignItems:"center",gap:5,color:f.title?C.success:"#9CA3AF"}}>
              {f.title?"✓":"○"} English title {f.title?"":"missing"}
            </span>
            <span style={{fontSize:12,display:"flex",alignItems:"center",gap:5,color:f.titleAr?C.success:"#9CA3AF"}}>
              {f.titleAr?"✓":"○"} Arabic title {f.titleAr?"":"(العنوان العربي مفقود)"}
            </span>
          </div>
        </div>
      </div>}

      {/* CURRICULUM TAB */}
      {tab==="curriculum" && <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:700,color:C.navy}}>Course Modules ({f.modules.length})</h3>
          <button type="button" onClick={addMod} style={S.btnPrimary}>+ Add Module</button>
        </div>
        {f.modules.map((m,i)=>(
          <div key={m.id||i} style={{padding:24,background:C.bg,borderRadius:14,marginBottom:14,border:"1px solid #E8E4DD"}}>
            {/* MODULE HEADER */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:28,height:28,borderRadius:7,background:C.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>{i+1}</div>
                <span style={{fontSize:14,fontWeight:700,color:C.navy}}>
                  {m.type==="video"?"🎬":m.type==="reading"?"📖":m.type==="quiz"?"📝":m.type==="exam"?"🎓":m.type==="project"?"🛠️":"📌"} Module {i+1}
                </span>
              </div>
              <button type="button" onClick={()=>delMod(i)} style={{color:C.danger,fontSize:13,fontWeight:600}}>Delete</button>
            </div>

            {/* TYPE + DURATION */}
            <div className="form-grid-2" style={{marginBottom:12}}>
              <div>
                <label style={{...S.label,marginBottom:5}}>Type</label>
                <select value={m.type} onChange={e=>updMod(i,"type",e.target.value)} style={S.input}>
                  <option value="video">🎬 Video</option>
                  <option value="reading">📖 Reading</option>
                  <option value="quiz">📝 Quiz</option>
                  <option value="exam">🎓 Exam</option>
                  <option value="project">🛠️ Project</option>
                </select>
              </div>
              <div>
                <label style={{...S.label,marginBottom:5}}>Duration</label>
                <input placeholder="e.g. 45 min" value={m.duration} onChange={e=>updMod(i,"duration",e.target.value)} style={S.input}/>
              </div>
            </div>

            {/* ── BILINGUAL CONTENT TABS FOR EACH MODULE ── */}
            <div style={{border:"1px solid #E8E4DD",borderRadius:12,overflow:"hidden",marginBottom:12}}>
              <div style={{display:"flex",background:"#F9F8F5",borderBottom:"1px solid #E8E4DD"}}>
                {[["en","🇬🇧 EN"],["ar","🇸🇦 AR"]].map(([lng,label])=>(
                  <button key={lng} type="button" onClick={()=>updMod(i,"_langTab",lng)}
                    style={{flex:1,padding:"9px 12px",fontSize:13,fontWeight:(m._langTab||"en")===lng?700:500,color:(m._langTab||"en")===lng?C.navy:"#9CA3AF",background:(m._langTab||"en")===lng?"#fff":"transparent",borderBottom:(m._langTab||"en")===lng?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-1}}>
                    {label}
                  </button>
                ))}
                {/* Status */}
                <div style={{display:"flex",alignItems:"center",padding:"0 12px",gap:8,fontSize:11}}>
                  <span style={{color:m.title?C.success:"#9CA3AF"}}>{m.title?"✓ EN":""}</span>
                  <span style={{color:m.titleAr?C.success:"#9CA3AF"}}>{m.titleAr?"✓ AR":""}</span>
                </div>
              </div>

              {/* ENGLISH FIELDS */}
              {(m._langTab||"en")==="en" && (
                <div style={{padding:16}}>
                  <label style={{...S.label,marginBottom:5}}>Module Title (English) *</label>
                  <input placeholder="e.g. Introduction to AutoCAD Interface" value={m.title||""} onChange={e=>updMod(i,"title",e.target.value)} style={{...S.input,marginBottom:m.type==="reading"||m.type==="project"?12:0}}/>
                  {m.type==="video" && <div style={{marginTop:12}}>
                    <label style={{...S.label,marginBottom:5}}>Video URL (YouTube / Vimeo)</label>
                    <input placeholder="https://youtube.com/watch?v=..." value={m.videoUrl||""} onChange={e=>updMod(i,"videoUrl",e.target.value)} style={S.input}/>
                  </div>}
                  {m.type==="reading" && <>
                    <label style={{...S.label,marginBottom:5}}>Reading Content (English)</label>
                    <textarea rows={7} placeholder="Write your reading content in English..." value={m.content||""} onChange={e=>updMod(i,"content",e.target.value)} style={{...S.input,resize:"vertical",lineHeight:1.7,fontSize:14}}/>
                    <p style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>Use line breaks for paragraphs.</p>
                  </>}
                  {m.type==="project" && <>
                    <label style={{...S.label,marginBottom:5}}>Project Brief (English)</label>
                    <textarea rows={5} placeholder="Describe the project task in English..." value={m.content||""} onChange={e=>updMod(i,"content",e.target.value)} style={{...S.input,resize:"vertical",lineHeight:1.7}}/>
                    <label style={{...S.label,marginBottom:5,marginTop:10}}>Submission Type</label>
                    <select value={m.submitType||"file"} onChange={e=>updMod(i,"submitType",e.target.value)} style={S.input}><option value="file">File Upload</option><option value="link">URL / Link</option><option value="text">Text Response</option></select>
                  </>}
                  {(m.type==="quiz"||m.type==="exam") && <>
                    <div style={{marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <label style={S.label}>{m.type==="exam"?"Exam":"Quiz"} Questions (English)</label>
                      <button type="button" onClick={()=>updMod(i,"questions",[...(m.questions||[]),{id:`q-${Date.now()}`,text:"",textAr:"",options:["","","",""],optionsAr:["","","",""],correct:0}])}
                        style={{fontSize:12,fontWeight:700,color:m.type==="exam"?C.gold:C.teal,background:m.type==="exam"?`${C.gold}12`:`${C.teal}12`,padding:"5px 12px",borderRadius:6}}>+ Add Question</button>
                    </div>
                    {(m.questions||[]).map((q,qi)=>(
                      <div key={q.id||qi} style={{padding:14,background:"#fff",borderRadius:10,marginBottom:8,border:"1px solid #E8E4DD"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#6B7280"}}>Q{qi+1} (EN)</span>
                          <button type="button" onClick={()=>updMod(i,"questions",(m.questions||[]).filter((_,j)=>j!==qi))} style={{color:C.danger,fontSize:12,fontWeight:600}}>Remove</button>
                        </div>
                        <input placeholder={`Question ${qi+1} in English...`} value={q.text} onChange={e=>{const qs=[...(m.questions||[])];qs[qi]={...qs[qi],text:e.target.value};updMod(i,"questions",qs);}} style={{...S.input,marginBottom:8,fontSize:14}}/>
                        <div style={{display:"grid",gap:6}}>
                          {q.options.map((opt,oi)=>(
                            <div key={oi} style={{display:"flex",alignItems:"center",gap:8}}>
                              <input type="radio" name={`q-${i}-${qi}`} checked={q.correct===oi} onChange={()=>{const qs=[...(m.questions||[])];qs[qi]={...qs[qi],correct:oi};updMod(i,"questions",qs);}} style={{width:16,height:16,accentColor:C.teal}}/>
                              <input placeholder={`Option ${oi+1}${q.correct===oi?" ✓":""}` } value={opt} onChange={e=>{const qs=[...(m.questions||[])];const opts=[...qs[qi].options];opts[oi]=e.target.value;qs[qi]={...qs[qi],options:opts};updMod(i,"questions",qs);}} style={{...S.input,fontSize:13,padding:"7px 12px",background:q.correct===oi?"rgba(74,124,111,0.06)":"#fff",borderColor:q.correct===oi?C.teal:"#E8E4DD"}}/>
                            </div>
                          ))}
                        </div>
                        <p style={{fontSize:11,color:C.teal,marginTop:4}}>● Select the correct answer</p>
                      </div>
                    ))}
                    {!(m.questions||[]).length && <div style={{padding:20,textAlign:"center",background:"#fff",borderRadius:10,border:"1px dashed #E8E4DD"}}><p style={{color:"#9CA3AF",fontSize:13}}>No questions yet.</p></div>}
                    <div style={{display:"flex",gap:12,marginTop:10}}>
                      <div style={{flex:1}}><label style={{...S.label,marginBottom:5}}>Pass Score (%)</label><input type="number" min={0} max={100} placeholder="70" value={m.passScore||""} onChange={e=>updMod(i,"passScore",e.target.value)} style={S.input}/></div>
                      <div style={{flex:1}}><label style={{...S.label,marginBottom:5}}>Time Limit (min)</label><input type="number" min={1} placeholder="30" value={m.timeLimit||""} onChange={e=>updMod(i,"timeLimit",e.target.value)} style={S.input}/></div>
                    </div>
                  </>}
                </div>
              )}

              {/* ARABIC FIELDS */}
              {(m._langTab||"en")==="ar" && (
                <div style={{padding:16,direction:"rtl",fontFamily:"'Cairo',sans-serif"}}>
                  <div style={{padding:"10px 14px",background:`${C.gold}08`,borderRadius:8,border:`1px solid ${C.gold}20`,marginBottom:12}}>
                    <p style={{fontSize:12,color:C.goldD}}>💡 المحتوى العربي يُعرض للطلاب عند تفعيل اللغة العربية.</p>
                  </div>
                  <label style={{...S.label,textAlign:"right",display:"block",marginBottom:5}}>عنوان الدرس (عربي) *</label>
                  <input placeholder="مثال: مقدمة إلى واجهة أوتوكاد" value={m.titleAr||""} onChange={e=>updMod(i,"titleAr",e.target.value)} style={{...S.input,marginBottom:m.type==="reading"||m.type==="project"?12:0,textAlign:"right"}}/>
                  {m.type==="video" && <div style={{marginTop:12}}>
                    <p style={{fontSize:12,color:"#9CA3AF",textAlign:"right"}}>رابط الفيديو مشترك بين اللغتين — لا يحتاج تكرار.</p>
                  </div>}
                  {m.type==="reading" && <>
                    <label style={{...S.label,textAlign:"right",display:"block",marginBottom:5}}>محتوى القراءة (عربي)</label>
                    <textarea rows={7} placeholder="اكتب محتوى القراءة بالعربية هنا..." value={m.contentAr||""} onChange={e=>updMod(i,"contentAr",e.target.value)} style={{...S.input,resize:"vertical",lineHeight:1.85,fontSize:14,textAlign:"right"}}/>
                    <p style={{fontSize:11,color:"#9CA3AF",marginTop:4,textAlign:"right"}}>استخدم فواصل الأسطر للفقرات.</p>
                  </>}
                  {m.type==="project" && <>
                    <label style={{...S.label,textAlign:"right",display:"block",marginBottom:5}}>وصف المشروع (عربي)</label>
                    <textarea rows={5} placeholder="اشرح المهمة المطلوبة بالعربية..." value={m.contentAr||""} onChange={e=>updMod(i,"contentAr",e.target.value)} style={{...S.input,resize:"vertical",textAlign:"right"}}/>
                  </>}
                  {(m.type==="quiz"||m.type==="exam") && <>
                    <label style={{...S.label,textAlign:"right",display:"block",marginBottom:10,marginTop:4}}>أسئلة {m.type==="exam"?"الاختبار النهائي":"الاختبار"} (عربي)</label>
                    {(m.questions||[]).map((q,qi)=>(
                      <div key={q.id||qi} style={{padding:14,background:"#fff",borderRadius:10,marginBottom:8,border:"1px solid #E8E4DD"}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#6B7280",display:"block",textAlign:"right",marginBottom:8}}>س{qi+1} (AR)</span>
                        <input placeholder={`السؤال ${qi+1} بالعربية...`} value={q.textAr||""} onChange={e=>{const qs=[...(m.questions||[])];qs[qi]={...qs[qi],textAr:e.target.value};updMod(i,"questions",qs);}} style={{...S.input,marginBottom:8,fontSize:14,textAlign:"right"}}/>
                        <div style={{display:"grid",gap:6}}>
                          {(q.optionsAr||["","","",""]).map((opt,oi)=>(
                            <div key={oi} style={{display:"flex",alignItems:"center",gap:8,flexDirection:"row-reverse"}}>
                              <input type="radio" checked={q.correct===oi} readOnly style={{width:16,height:16,accentColor:C.teal,flexShrink:0}}/>
                              <input placeholder={`الخيار ${oi+1}${q.correct===oi?" ✓":""}`} value={opt} onChange={e=>{const qs=[...(m.questions||[])];const opts=[...(qs[qi].optionsAr||["","","",""])];opts[oi]=e.target.value;qs[qi]={...qs[qi],optionsAr:opts};updMod(i,"questions",qs);}} style={{...S.input,fontSize:13,padding:"7px 12px",textAlign:"right",background:q.correct===oi?"rgba(74,124,111,0.06)":"#fff",borderColor:q.correct===oi?C.teal:"#E8E4DD"}}/>
                            </div>
                          ))}
                        </div>
                        <p style={{fontSize:11,color:"#9CA3AF",marginTop:4,textAlign:"right"}}>الإجابة الصحيحة تُحدَّد من تبويب EN</p>
                      </div>
                    ))}
                    {!(m.questions||[]).length && <div style={{padding:20,textAlign:"center",background:"#fff",borderRadius:10,border:"1px dashed #E8E4DD"}}><p style={{color:"#9CA3AF",fontSize:13}}>أضف الأسئلة من تبويب EN أولاً</p></div>}
                  </>}
                </div>
              )}

              {/* MODULE STATUS ROW */}
              <div style={{padding:"8px 16px",background:"#F9F8F5",borderTop:"1px solid #E8E4DD",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:11,color:m.title?C.success:"#9CA3AF",display:"flex",alignItems:"center",gap:4}}>{m.title?"✓":"○"} EN title</span>
                <span style={{fontSize:11,color:m.titleAr?C.success:"#9CA3AF",display:"flex",alignItems:"center",gap:4}}>{m.titleAr?"✓":"○"} AR title</span>
                {(m.type==="reading"||m.type==="project") && <>
                  <span style={{fontSize:11,color:m.content?C.success:"#9CA3AF"}}>{m.content?"✓":"○"} EN content</span>
                  <span style={{fontSize:11,color:m.contentAr?C.success:"#9CA3AF"}}>{m.contentAr?"✓":"○"} AR content</span>
                </>}
                <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500,cursor:"pointer",marginLeft:"auto"}}>
                  <input type="checkbox" checked={m.free||false} onChange={e=>updMod(i,"free",e.target.checked)} style={{width:14,height:14}}/> Free Preview
                </label>
              </div>
            </div>
          </div>
        ))}
        {!f.modules.length && <div style={{padding:48,textAlign:"center",background:C.bg,borderRadius:12}}><p style={{color:"#9CA3AF"}}>No modules yet. Click "+ Add Module" above.</p></div>}
      </div>}

      {/* PRICING TAB */}
      {tab==="pricing" && <div>
        {/* FREE COURSE TOGGLE */}
        <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:16}}>
          <h3 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:6}}>Course Access</h3>
          <p style={{fontSize:13,color:"#9CA3AF",marginBottom:20}}>Set this course as free or paid.</p>
          <label style={{display:"flex",alignItems:"center",gap:14,padding:20,background:f.isFree?`${C.success}08`:C.bg,borderRadius:12,border:`2px solid ${f.isFree?C.success:"#E8E4DD"}`,cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{position:"relative",width:48,height:26,borderRadius:13,background:f.isFree?C.success:"#D1D5DB",transition:"background 0.2s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:f.isFree?26:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
              <input type="checkbox" checked={f.isFree||false} onChange={e=>setF({...f,isFree:e.target.checked,price:e.target.checked?0:f.price})} style={{opacity:0,position:"absolute",inset:0,cursor:"pointer"}}/>
            </div>
            <div>
              <p style={{fontSize:15,fontWeight:700,color:f.isFree?C.success:C.navy}}>{f.isFree?"✓ Free Course":"Paid Course"}</p>
              <p style={{fontSize:13,color:"#9CA3AF",marginTop:2}}>{f.isFree?"Students can enroll without payment":"Set price below"}</p>
            </div>
          </label>
        </div>

        {/* PRICE FIELDS — hidden when free */}
        {!f.isFree && <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:16}}>
          <h3 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:20}}>Pricing (ر.س)</h3>
          <div className="form-grid-2" style={{marginBottom:20}}>
            <div>
              <label style={S.label}>Price (ر.س) *</label>
              <input required={!f.isFree} type="number" min={0} value={f.price} onChange={e=>setF({...f,price:e.target.value})} style={S.input}/>
              <p style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>The price students pay after any discount</p>
            </div>
            <div>
              <label style={S.label}>Original Price — strikethrough</label>
              <input type="number" min={0} placeholder="e.g. 399" value={f.originalPrice||""} onChange={e=>setF({...f,originalPrice:e.target.value})} style={S.input}/>
              <p style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>Shows crossed-out "was" price on card</p>
            </div>
          </div>
          {/* Discount preview */}
          {f.originalPrice && Number(f.originalPrice)>Number(f.price) && (
            <div style={{padding:"10px 16px",background:`${C.success}10`,borderRadius:8,border:`1px solid ${C.success}30`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,color:C.success,fontWeight:600}}>
                {Math.round(((Number(f.originalPrice)-Number(f.price))/Number(f.originalPrice))*100)}% discount shown on course card
              </span>
            </div>
          )}
        </div>}

        {/* PUBLISHED */}
        <div style={{background:"#fff",padding:24,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)"}}>
          <label style={{display:"flex",alignItems:"center",gap:12,fontSize:15,fontWeight:600,cursor:"pointer",color:C.navy}}>
            <input type="checkbox" checked={f.published} onChange={e=>setF({...f,published:e.target.checked})} style={{width:18,height:18,accentColor:C.teal}}/>
            Published — visible to students
          </label>
          <p style={{fontSize:12,color:"#9CA3AF",marginTop:6,marginLeft:30}}>Unpublished courses are only visible to admins.</p>
        </div>
      </div>}

      {/* APPEARANCE TAB */}
      {tab==="appearance" && <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)"}}>

        {/* SECTION: BACKGROUND */}
        <h3 style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Card Background Color</h3>
        <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
          {colors.map(c=><button key={c} type="button" onClick={()=>setF({...f,color:c})} style={{width:44,height:44,borderRadius:10,background:c,border:f.color===c?`3px solid ${C.gold}`:"2px solid transparent",transform:f.color===c?"scale(1.1)":"none",transition:"all 0.2s"}}/>)}
        </div>

        <h3 style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Background Pattern</h3>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32}}>
          {PATTERN_TYPES.map(p=>(
            <button key={p} type="button" onClick={()=>setF({...f,patternType:p})} style={{padding:"8px 18px",background:f.patternType===p?C.gold:"#fff",color:f.patternType===p?"#fff":C.navy,borderRadius:8,border:"1px solid #E8E4DD",fontSize:13,fontWeight:600}}>{p}</button>
          ))}
        </div>

        {/* SECTION: ICON (optional overlay) */}
        <div style={{borderTop:"1px solid #F0ECE5",paddingTop:28,marginBottom:0}}>
          <h3 style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:6}}>Course Icon <span style={{fontSize:13,fontWeight:400,color:"#9CA3AF"}}>(optional — overlaid on background)</span></h3>
          <p style={{fontSize:13,color:"#9CA3AF",marginBottom:16}}>White or transparent icons work best. Icon sits centered on top of the pattern.</p>
          <div style={{display:"flex",gap:20,alignItems:"flex-start",marginBottom:28,flexWrap:"wrap"}}>
            <div style={{width:88,height:88,borderRadius:14,overflow:"hidden",border:"2px solid #E8E4DD",flexShrink:0,position:"relative",background:f.color}}>
              {icon
                ? <img src={icon} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",padding:10,filter:"brightness(0) invert(1)"}}/>
                : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.4)"}}><I.Upload/></div>}
            </div>
            <div>
              <button type="button" onClick={()=>iconRef.current?.click()} style={{...S.btnPrimary,padding:"10px 20px",fontSize:13,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><I.Upload/> Upload Icon</button>
              {icon && <button type="button" onClick={()=>{setIcon("");setF(p=>({...p,iconUrl:""}));}} style={{fontSize:13,color:C.danger,fontWeight:600,display:"block"}}>Remove Icon</button>}
              <input ref={iconRef} type="file" accept="image/*,.svg" style={{display:"none"}} onChange={handleIconUpload}/>
            </div>
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <h3 style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>Preview</h3>
        <div style={{width:280,height:158,borderRadius:14,overflow:"hidden",border:"1px solid #E8E4DD",boxShadow:"0 4px 16px rgba(45,51,71,0.08)"}}>
          <CourseThumbnail color={f.color} patternType={f.patternType} iconUrl={icon}/>
        </div>
        <p style={{fontSize:12,color:"#9CA3AF",marginTop:8}}>This is how the course card will look to students</p>
      </div>}

      <div style={{display:"flex",gap:12,marginTop:24}}>
        <button type="button" onClick={()=>{setSelCourse(null);setSec("courses");}} style={{flex:1,padding:14,background:"#E8E4DD",borderRadius:12,fontWeight:600}}>Cancel</button>
        <button type="submit" style={{flex:1,...S.btnPrimary,padding:14,justifyContent:"center"}}>{isEdit?"Save Changes":"Add Course"}</button>
      </div>
    </form>
  </div></div>;
}

// ═══════════════════════════════════════════
// ADMIN USERS — with role management
// ═══════════════════════════════════════════
function AdminUsers({ users, addUserAdmin, updateUser, deleteUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form,     setForm]     = useState({firstName:"",lastName:"",email:"",password:"",role:"student"});
  const [err,      setErr]      = useState("");
  const [delId,    setDelId]    = useState(null);
  const [filter,   setFilter]   = useState("all"); // all | active | pending
  const [search,   setSearch]   = useState("");

  // Reload fresh so verified changes reflect immediately
  const [localUsers, setLocalUsers] = useState(()=>ls("orb_users",[]));
  const reload = () => setLocalUsers(ls("orb_users",[]));
  useEffect(()=>{ reload(); },[users]);

  const activateUser = (id) => {
    const updated = localUsers.map(u => u.id===id ? {...u, verified:true, token:""} : u);
    ss("orb_users", updated);
    setLocalUsers(updated);
    // Also update main users state
    updateUser(id, {verified:true, token:""});
  };

  const openNew  = () => { setForm({firstName:"",lastName:"",email:"",password:"",role:"student"}); setEditUser(null); setErr(""); setShowForm(true); };
  const openEdit = u => { setEditUser(u); setForm({firstName:u.firstName||u.name?.split(" ")[0]||"",lastName:u.lastName||u.name?.split(" ").slice(1).join(" ")||"",email:u.email,password:"",role:u.role||"student"}); setErr(""); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault(); setErr("");
    if (editUser) {
      updateUser(editUser.id,{...form,name:`${form.firstName} ${form.lastName}`,password:form.password||editUser.password});
      setShowForm(false); reload();
    } else {
      const ok = addUserAdmin({...form,name:`${form.firstName} ${form.lastName}`,verified:true});
      if (!ok) { setErr("Email already exists"); return; }
      setShowForm(false); reload();
    }
  };

  // Filter users
  const filtered = localUsers.filter(u => {
    const matchFilter = filter==="all" || (filter==="active" && u.verified!==false) || (filter==="pending" && u.verified===false);
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const total   = localUsers.length;
  const active  = localUsers.filter(u=>u.verified!==false).length;
  const pending = localUsers.filter(u=>u.verified===false).length;

  const StatusBadge = ({verified}) => verified===false
    ? <span style={{fontSize:11,padding:"3px 10px",background:"#FEF3C7",color:"#D97706",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>⏳ Pending</span>
    : <span style={{fontSize:11,padding:"3px 10px",background:C.successBg,color:C.success,borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>✓ Active</span>;

  return <div style={{padding:40}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:16}}>
      <div>
        <h1 style={S.pageTitle}>Users</h1>
        <p style={{...S.pageSub,marginTop:6}}>{total} total · {active} active · {pending} pending activation</p>
      </div>
      <button onClick={openNew} style={S.btnPrimary}><I.UserPlus/> Add User</button>
    </div>

    {/* STATS CARDS */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
      {[
        {label:"Total Users",    val:total,   color:C.navy,  bg:"#F5F2ED"},
        {label:"Active",         val:active,  color:C.success,bg:C.successBg},
        {label:"Pending Activation", val:pending, color:"#D97706",bg:"#FEF3C7"},
      ].map((s,i)=>(
        <div key={i} style={{background:s.bg,borderRadius:12,padding:"16px 20px",border:`1px solid ${s.color}20`}}>
          <p style={{fontSize:26,fontWeight:800,color:s.color,fontFamily:"'Playfair Display',serif"}}>{s.val}</p>
          <p style={{fontSize:13,color:s.color,opacity:0.75,marginTop:2}}>{s.label}</p>
        </div>
      ))}
    </div>

    {/* SEARCH + FILTER BAR */}
    <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{...S.searchBox,flex:1,minWidth:200}}>
        <I.Search/>
        <input placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} style={S.searchIn}/>
      </div>
      <div style={{display:"flex",gap:6}}>
        {[["all","All"],["active","✓ Active"],["pending","⏳ Pending"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:filter===v?700:500,
              background:filter===v?(v==="pending"?"#FEF3C7":v==="active"?C.successBg:C.navy):"#fff",
              color:filter===v?(v==="pending"?"#D97706":v==="active"?C.success:"#fff"):C.navy,
              border:`1px solid ${filter===v?(v==="pending"?"#D97706":v==="active"?C.success:C.navy):"#E8E4DD"}`}}>
            {l}
          </button>
        ))}
      </div>
      <button onClick={reload} style={{padding:"8px 14px",background:C.bg,borderRadius:8,fontSize:12,color:C.teal,fontWeight:600,border:"1px solid #E8E4DD"}}>↻ Refresh</button>
    </div>

    {/* USERS TABLE */}
    {filtered.length > 0
      ? <div style={{background:"#fff",borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",overflow:"auto"}}>
          <table style={{width:"100%",fontSize:14,borderCollapse:"collapse",minWidth:700}}>
            <thead>
              <tr style={{background:"#F5F2ED",borderBottom:"1px solid #E8E4DD"}}>
                {["Name","Email","Status","Role","Enrolled","Actions"].map(h=>(
                  <th key={h} style={{padding:"12px 20px",textAlign:"left",fontWeight:600,color:"#6B7280",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id} style={{borderBottom:"1px solid #F0ECE5",background:u.verified===false?"#FFFBEB":"#fff",transition:"background 0.15s"}}>
                  <td style={{padding:"14px 20px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:u.verified===false?"#FDE68A":C.creamL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:u.verified===false?"#D97706":C.navy,flexShrink:0}}>
                        {u.name?.[0]?.toUpperCase()||"?"}
                      </div>
                      <span style={{fontWeight:600,color:C.navy}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"14px 20px",color:"#6B7280"}}>{u.email}</td>
                  <td style={{padding:"14px 20px"}}><StatusBadge verified={u.verified}/></td>
                  <td style={{padding:"14px 20px"}}><RoleBadge role={u.role}/></td>
                  <td style={{padding:"14px 20px",color:"#6B7280",textAlign:"center"}}>{u.enrolledCourses?.length||0}</td>
                  <td style={{padding:"14px 20px"}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {u.verified===false && (
                        <button onClick={()=>activateUser(u.id)}
                          style={{padding:"6px 12px",background:C.success,color:"#fff",borderRadius:6,fontSize:12,fontWeight:700,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                          ✓ Activate
                        </button>
                      )}
                      <button onClick={()=>openEdit(u)} style={{padding:"6px 12px",background:C.gold,color:"#fff",borderRadius:6,fontSize:12,fontWeight:600}}>Edit</button>
                      <button onClick={()=>setDelId(u.id)} style={{padding:"6px 12px",background:C.danger,color:"#fff",borderRadius:6,fontSize:12,fontWeight:600}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      : <div style={{background:"#fff",padding:48,borderRadius:16,textAlign:"center",border:"1px solid rgba(45,51,71,0.07)"}}>
          <p style={{color:"#9CA3AF",fontSize:15}}>
            {filter==="pending" ? "No pending users — all accounts are activated ✓" :
             filter==="active"  ? "No active users yet" : "No users yet"}
          </p>
        </div>}

    {/* ADD/EDIT MODAL */}
    {showForm && <div style={S.modalOv} onClick={()=>setShowForm(false)}><div style={{...S.modal,maxWidth:480}} onClick={e=>e.stopPropagation()}>
      <div style={S.modalHead}>
        <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>{editUser?"Edit User":"Add User"}</h2>
        <button onClick={()=>setShowForm(false)} style={{color:"#9CA3AF"}}><I.X/></button>
      </div>
      <div style={{padding:"24px 28px"}}>
        {err && <div style={S.errBox}>{err}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2" style={{marginBottom:16}}>
            <div><label style={S.label}>First Name</label><input required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} style={S.input}/></div>
            <div><label style={S.label}>Last Name</label><input required value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} style={S.input}/></div>
          </div>
          <label style={S.label}>Email</label>
          <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{...S.input,marginBottom:16}}/>
          <label style={S.label}>{editUser?"New Password (leave blank to keep)":"Password"}</label>
          <input type="password" required={!editUser} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{...S.input,marginBottom:16}}/>
          <label style={S.label}>Role</label>
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{...S.input,marginBottom:24}}>
            {["student","instructor","moderator","customer_service"].map(r=>(
              <option key={r} value={r}>{r==="customer_service"?"Customer Service":r[0].toUpperCase()+r.slice(1)}</option>
            ))}
          </select>
          <div style={{padding:16,background:C.bg,borderRadius:12,marginBottom:24,fontSize:13,color:"#6B7280"}}>
            <strong style={{color:C.navy}}>Role: </strong>
            {form.role==="student"         && "Can browse and enroll in courses."}
            {form.role==="instructor"      && "Can create and manage courses."}
            {form.role==="moderator"       && "Can review content and manage users."}
            {form.role==="customer_service"&& "Can view and respond to customer inquiries."}
          </div>
          <div style={{display:"flex",gap:12}}>
            <button type="button" onClick={()=>setShowForm(false)} style={{flex:1,padding:13,background:"#E8E4DD",borderRadius:10,fontWeight:600}}>Cancel</button>
            <button type="submit" style={{flex:1,...S.btnPrimary,padding:13,justifyContent:"center"}}>{editUser?"Save Changes":"Add User"}</button>
          </div>
        </form>
      </div>
    </div></div>}

    {/* DELETE CONFIRM */}
    {delId && <div style={S.modalOv} onClick={()=>setDelId(null)}><div style={{...S.modal,maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:20,fontWeight:700,padding:"28px 28px 12px"}}>Delete User?</h3>
      <p style={{color:"#6B7280",padding:"0 28px 24px"}}>This will permanently remove the user and all their data.</p>
      <div style={{display:"flex",gap:12,padding:"0 28px 28px"}}>
        <button onClick={()=>setDelId(null)} style={{flex:1,padding:12,background:"#E8E4DD",borderRadius:10,fontWeight:600}}>Cancel</button>
        <button onClick={()=>{deleteUser(delId);setDelId(null);reload();}} style={{flex:1,padding:12,background:C.danger,color:"#fff",borderRadius:10,fontWeight:600}}>Delete</button>
      </div>
    </div></div>}
  </div>;
}

// ═══════════════════════════════════════════
// ADMIN REVENUE
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// ADMIN CAREERS — post jobs, view CVs
// ═══════════════════════════════════════════
function AdminCareers() {
  const [jobs,     setJobs]     = useState(()=>ls("orb_jobs",[]));
  const [apps,     setApps]     = useState(()=>ls("orb_apps",[]));
  const [showForm, setShowForm] = useState(false);
  const [editJob,  setEditJob]  = useState(null);
  const [selApp,   setSelApp]   = useState(null);
  const [tab,      setTab]      = useState("jobs");
  const [form,     setForm]     = useState({titleEn:"",titleAr:"",deptEn:"",deptAr:"",locationEn:"",locationAr:"",typeEn:"Full-time",typeAr:"دوام كامل",descEn:"",descAr:""});

  // Always reload fresh from localStorage
  const reloadApps = () => setApps(ls("orb_apps",[]));
  useEffect(()=>{
    reloadApps();
    document.addEventListener("visibilitychange", reloadApps);
    window.addEventListener("focus", reloadApps);
    return ()=>{ document.removeEventListener("visibilitychange",reloadApps); window.removeEventListener("focus",reloadApps); };
  },[]);

  // Reload every time user switches to Applications tab
  const switchTab = (t) => { if(t==="apps") reloadApps(); setTab(t); };

  const saveJobs  = v => { setJobs(v); ss("orb_jobs",v); };
  const deleteApp = id => { const u=apps.filter(a=>a.id!==id); setApps(u); ss("orb_apps",u); };

  const openNew  = () => { setForm({titleEn:"",titleAr:"",deptEn:"",deptAr:"",locationEn:"",locationAr:"",typeEn:"Full-time",typeAr:"دوام كامل",descEn:"",descAr:""}); setEditJob(null); setShowForm(true); };
  const openEdit = j => { setForm({...j}); setEditJob(j); setShowForm(true); };
  const handleSave = e => {
    e.preventDefault();
    if (editJob) saveJobs(jobs.map(j=>j.id===editJob.id?{...j,...form}:j));
    else saveJobs([...jobs,{id:`job-${Date.now()}`,...form,createdAt:new Date().toLocaleDateString()}]);
    setShowForm(false); setEditJob(null);
  };

  return (
    <div style={{padding:40}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div><h1 style={S.pageTitle}>Careers</h1><p style={{...S.pageSub,marginTop:6}}>{jobs.length} open positions · {apps.length} applications received</p></div>
        <button onClick={openNew} style={S.btnPrimary}>+ Add Position</button>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:4,borderBottom:"2px solid #E8E4DD",marginBottom:24}}>
        {[["jobs",`Open Positions (${jobs.length})`],["apps",`Applications (${apps.length})`]].map(([id,l])=>(
          <button key={id} onClick={()=>switchTab(id)} style={{padding:"10px 20px",fontSize:14,fontWeight:tab===id?700:500,color:tab===id?C.navy:"#6B7280",borderBottom:tab===id?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-2}}>{l}</button>
        ))}
        <button onClick={reloadApps} style={{marginLeft:"auto",fontSize:12,color:C.teal,fontWeight:600,padding:"8px 14px",background:`${C.teal}10`,borderRadius:8}}>↻ Refresh</button>
      </div>

      {/* OPEN POSITIONS */}
      {tab==="jobs" && <>
        {jobs.length>0 ? <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {jobs.map(j=>(
            <div key={j.id} style={{background:"#fff",padding:20,borderRadius:12,border:"1px solid rgba(45,51,71,0.07)",display:"flex",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                  <h3 style={{fontSize:16,fontWeight:700,color:C.navy}}>{j.titleEn}</h3>
                  <span style={{fontSize:12,color:"#9CA3AF"}}>/ {j.titleAr}</span>
                </div>
                <div style={{display:"flex",gap:12,fontSize:13,color:"#6B7280",flexWrap:"wrap"}}>
                  <span>{j.deptEn}</span><span>·</span><span>{j.locationEn}</span><span>·</span>
                  <span style={{padding:"2px 8px",background:`${C.teal}15`,color:C.teal,borderRadius:20,fontWeight:600}}>{j.typeEn}</span>
                </div>
                <p style={{fontSize:12,color:"#9CA3AF",marginTop:6}}>Posted {j.createdAt} · {apps.filter(a=>a.jobId===j.id).length} applications</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>openEdit(j)} style={{padding:"7px 14px",background:C.gold,color:"#fff",borderRadius:8,fontSize:13,fontWeight:600}}>Edit</button>
                <button onClick={()=>saveJobs(jobs.filter(x=>x.id!==j.id))} style={{padding:"7px 14px",background:C.danger,color:"#fff",borderRadius:8,fontSize:13,fontWeight:600}}>Delete</button>
              </div>
            </div>
          ))}
        </div> : <div style={S.empty}><I.Briefcase/><h2 style={{...S.secTitle,marginTop:12}}>No Positions Yet</h2><p style={{color:"#9CA3AF",marginTop:8}}>Add your first open position</p></div>}
      </>}

      {/* APPLICATIONS */}
      {tab==="apps" && <>
        {apps.length>0 ? <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {apps.map(a=>(
            <div key={a.id} style={{background:"#fff",padding:20,borderRadius:12,border:"1px solid rgba(45,51,71,0.07)",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:200}}>
                <p style={{fontSize:15,fontWeight:700,color:C.navy}}>{a.name}</p>
                <p style={{fontSize:13,color:"#6B7280"}}>{a.email} · Applied for: <strong>{jobs.find(j=>j.id===a.jobId)?.titleEn||"Position"}</strong></p>
                <p style={{fontSize:12,color:"#9CA3AF",marginTop:4}}>{a.date}</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setSelApp(a)} style={{padding:"7px 14px",background:C.teal,color:"#fff",borderRadius:8,fontSize:13,fontWeight:600}}>View</button>
                <button onClick={()=>deleteApp(a.id)} style={{padding:"7px 14px",background:C.danger,color:"#fff",borderRadius:8,fontSize:13,fontWeight:600}}>Delete</button>
              </div>
            </div>
          ))}
        </div> : <div style={S.empty}><I.Users/><h2 style={{...S.secTitle,marginTop:12}}>No Applications Yet</h2><p style={{color:"#9CA3AF",marginTop:8}}>Applications submitted on the Careers page will appear here</p></div>}
      </>}

      {/* ADD/EDIT FORM */}
      {showForm && <div style={S.modalOv} onClick={()=>setShowForm(false)}><div style={{...S.modal,maxWidth:640}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}><h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>{editJob?"Edit Position":"Add Position"}</h2><button onClick={()=>setShowForm(false)} style={{color:"#9CA3AF"}}><I.X/></button></div>
        <div style={{padding:28,overflowY:"auto",maxHeight:"80vh"}}>
          <form onSubmit={handleSave}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={S.label}>Title (English) *</label><input required value={form.titleEn} onChange={e=>setForm({...form,titleEn:e.target.value})} style={S.input}/></div>
              <div><label style={{...S.label,textAlign:"right",display:"block"}}>المسمى الوظيفي (عربي) *</label><input required value={form.titleAr} onChange={e=>setForm({...form,titleAr:e.target.value})} style={{...S.input,textAlign:"right",direction:"rtl",fontFamily:"'Cairo',sans-serif"}}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={S.label}>Department (EN)</label><input value={form.deptEn} onChange={e=>setForm({...form,deptEn:e.target.value})} style={S.input}/></div>
              <div><label style={{...S.label,textAlign:"right",display:"block"}}>القسم (AR)</label><input value={form.deptAr} onChange={e=>setForm({...form,deptAr:e.target.value})} style={{...S.input,textAlign:"right",direction:"rtl",fontFamily:"'Cairo',sans-serif"}}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={S.label}>Location (EN)</label><input value={form.locationEn} onChange={e=>setForm({...form,locationEn:e.target.value})} style={S.input}/></div>
              <div><label style={{...S.label,textAlign:"right",display:"block"}}>الموقع (AR)</label><input value={form.locationAr} onChange={e=>setForm({...form,locationAr:e.target.value})} style={{...S.input,textAlign:"right",direction:"rtl",fontFamily:"'Cairo',sans-serif"}}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={S.label}>Type (EN)</label><select value={form.typeEn} onChange={e=>setForm({...form,typeEn:e.target.value})} style={S.input}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Remote</option></select></div>
              <div><label style={{...S.label,textAlign:"right",display:"block"}}>النوع (AR)</label><select value={form.typeAr} onChange={e=>setForm({...form,typeAr:e.target.value})} style={{...S.input,textAlign:"right",direction:"rtl",fontFamily:"'Cairo',sans-serif"}}><option>دوام كامل</option><option>دوام جزئي</option><option>عقد</option><option>عن بُعد</option></select></div>
            </div>
            <label style={S.label}>Job Description (English)</label>
            <textarea rows={3} value={form.descEn} onChange={e=>setForm({...form,descEn:e.target.value})} style={{...S.input,resize:"vertical",marginBottom:12}}/>
            <label style={{...S.label,textAlign:"right",display:"block"}}>الوصف الوظيفي (عربي)</label>
            <textarea rows={3} value={form.descAr} onChange={e=>setForm({...form,descAr:e.target.value})} style={{...S.input,resize:"vertical",marginBottom:20,textAlign:"right",direction:"rtl",fontFamily:"'Cairo',sans-serif"}}/>
            <div style={{display:"flex",gap:12}}>
              <button type="button" onClick={()=>setShowForm(false)} style={{flex:1,padding:12,background:"#E8E4DD",borderRadius:10,fontWeight:600}}>Cancel</button>
              <button type="submit" style={{flex:1,...S.btnPrimary,padding:12,justifyContent:"center"}}>{editJob?"Save Changes":"Add Position"}</button>
            </div>
          </form>
        </div>
      </div></div>}

      {/* VIEW APPLICATION */}
      {selApp && <div style={S.modalOv} onClick={()=>setSelApp(null)}><div style={{...S.modal,maxWidth:500}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}><h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>Application Details</h2><button onClick={()=>setSelApp(null)} style={{color:"#9CA3AF"}}><I.X/></button></div>
        <div style={{padding:28}}>
          {[["Full Name",selApp.name],["Email",selApp.email],["Phone",selApp.phone||"—"],["Position",jobs.find(j=>j.id===selApp.jobId)?.titleEn||"—"],["Date Applied",selApp.date]].map(([l,v])=>(
            <div key={l} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #F0ECE5"}}>
              <p style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</p>
              <p style={{fontSize:14,color:C.navy}}>{v}</p>
            </div>
          ))}
          {selApp.cover && <div style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #F0ECE5"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Cover Letter</p>
            <p style={{fontSize:14,color:"#4A5568",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{selApp.cover}</p>
          </div>}
          <div style={{marginBottom:20}}>
            <p style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>CV / Resume</p>
            {selApp.cvUrl && selApp.cvUrl.startsWith("data:") ? (
              <a href={selApp.cvUrl} download={selApp.cvName||"cv.pdf"}
                style={{...S.btnPrimary,display:"inline-flex",padding:"10px 20px",fontSize:14,gap:8,textDecoration:"none"}}>
                <I.Download/> Download CV {selApp.cvName ? `(${selApp.cvName})` : ""}
              </a>
            ) : selApp.cvName ? (
              <div style={{padding:12,background:C.bg,borderRadius:8,border:"1px solid #E8E4DD"}}>
                <p style={{fontSize:13,color:"#6B7280"}}>📄 {selApp.cvName}</p>
                <p style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>File was uploaded but could not be saved as downloadable. Ask applicant to re-submit.</p>
              </div>
            ) : (
              <p style={{fontSize:13,color:"#9CA3AF"}}>No CV uploaded</p>
            )}
          </div>
          <button onClick={()=>{deleteApp(selApp.id);setSelApp(null);}} style={{fontSize:13,color:C.danger,fontWeight:600,padding:"8px 16px",background:C.dangerBg,borderRadius:8}}>🗑 Delete Application</button>
        </div>
      </div></div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN DISCOUNTS — create & manage coupon codes
// ═══════════════════════════════════════════
function AdminDiscounts() {
  const [codes,    setCodes]   = useState(()=>ls("orb_discounts",[]));
  const [showForm, setShowForm] = useState(false);
  const [editCode, setEditCode] = useState(null);
  const [form,     setForm]    = useState({code:"",type:"percent",value:"",maxUses:"",expiry:"",active:true,description:""});
  const [err,      setErr]     = useState("");

  const saveCodes = v => { setCodes(v); ss("orb_discounts",v); };

  const openNew  = () => { setForm({code:"",type:"percent",value:"",maxUses:"",expiry:"",active:true,description:""}); setEditCode(null); setErr(""); setShowForm(true); };
  const openEdit = c => { setForm({...c}); setEditCode(c); setErr(""); setShowForm(true); };

  const genCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
    setForm(p=>({...p,code}));
  };

  const handleSave = (e) => {
    e.preventDefault(); setErr("");
    if (!form.code.trim()) { setErr("Code is required"); return; }
    if (!form.value || Number(form.value)<=0) { setErr("Discount value must be greater than 0"); return; }
    if (form.type==="percent" && Number(form.value)>100) { setErr("Percentage cannot exceed 100%"); return; }
    const code = form.code.trim().toUpperCase();
    // Check duplicate
    if (!editCode && codes.find(c=>c.code===code)) { setErr("This code already exists"); return; }
    const entry = {...form, code, value:Number(form.value), maxUses:form.maxUses?Number(form.maxUses):null, uses:editCode?.uses||0, id:editCode?.id||`dc-${Date.now()}` };
    if (editCode) saveCodes(codes.map(c=>c.id===editCode.id?entry:c));
    else saveCodes([...codes,entry]);
    setShowForm(false); setEditCode(null);
  };

  const toggleActive = id => saveCodes(codes.map(c=>c.id===id?{...c,active:!c.active}:c));
  const deleteCode   = id => saveCodes(codes.filter(c=>c.id!==id));

  const isExpired = c => c.expiry && new Date(c.expiry) < new Date();
  const isMaxed   = c => c.maxUses && c.uses >= c.maxUses;

  return (
    <div style={{padding:40}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={S.pageTitle}>Discount Codes</h1>
          <p style={{...S.pageSub,marginTop:6}}>{codes.length} codes · {codes.filter(c=>c.active&&!isExpired(c)&&!isMaxed(c)).length} active</p>
        </div>
        <button onClick={openNew} style={S.btnPrimary}><I.Tag/> New Code</button>
      </div>

      {codes.length>0 ? (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {codes.map(c=>{
            const expired = isExpired(c);
            const maxed   = isMaxed(c);
            const alive   = c.active && !expired && !maxed;
            return (
              <div key={c.id} style={{background:"#fff",borderRadius:14,padding:"20px 24px",border:`1px solid ${alive?"rgba(45,51,71,0.07)":"#F0ECE5"}`,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",opacity:alive?1:0.65}}>
                {/* CODE BADGE */}
                <div style={{padding:"8px 16px",background:alive?`${C.gold}12`:"#F5F5F5",borderRadius:9,border:`1.5px dashed ${alive?C.gold:"#D1D5DB"}`,flexShrink:0}}>
                  <p style={{fontSize:16,fontWeight:800,color:alive?C.gold:"#9CA3AF",letterSpacing:2,fontFamily:"monospace"}}>{c.code}</p>
                </div>
                {/* INFO */}
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <span style={{fontSize:16,fontWeight:700,color:C.navy}}>
                      {c.type==="percent" ? `${c.value}% off` : `${c.value} SAR off`}
                    </span>
                    {c.description && <span style={{fontSize:13,color:"#9CA3AF"}}>— {c.description}</span>}
                    {/* Status chips */}
                    {!c.active && <span style={{fontSize:11,padding:"2px 8px",background:"#F3F4F6",color:"#6B7280",borderRadius:20,fontWeight:600}}>Disabled</span>}
                    {expired    && <span style={{fontSize:11,padding:"2px 8px",background:C.dangerBg,color:C.danger,borderRadius:20,fontWeight:600}}>Expired</span>}
                    {maxed      && <span style={{fontSize:11,padding:"2px 8px",background:"#FEF3C7",color:"#D97706",borderRadius:20,fontWeight:600}}>Max uses reached</span>}
                    {alive      && <span style={{fontSize:11,padding:"2px 8px",background:C.successBg,color:C.success,borderRadius:20,fontWeight:600}}>✓ Active</span>}
                  </div>
                  <div style={{display:"flex",gap:12,fontSize:12,color:"#9CA3AF",flexWrap:"wrap"}}>
                    <span>Used: {c.uses||0}{c.maxUses?` / ${c.maxUses}`:""} times</span>
                    {c.expiry && <span>Expires: {new Date(c.expiry).toLocaleDateString()}</span>}
                  </div>
                </div>
                {/* ACTIONS */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={()=>toggleActive(c.id)} style={{padding:"7px 14px",background:c.active?"#F3F4F6":C.successBg,color:c.active?"#6B7280":C.success,borderRadius:7,fontSize:12,fontWeight:600}}>
                    {c.active?"Disable":"Enable"}
                  </button>
                  <button onClick={()=>openEdit(c)} style={{padding:"7px 14px",background:C.gold,color:"#fff",borderRadius:7,fontSize:12,fontWeight:600}}>Edit</button>
                  <button onClick={()=>deleteCode(c.id)} style={{padding:"7px 14px",background:C.danger,color:"#fff",borderRadius:7,fontSize:12,fontWeight:600}}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={S.empty}>
          <I.Tag/>
          <h2 style={{...S.secTitle,marginTop:12}}>No Discount Codes Yet</h2>
          <p style={{color:"#9CA3AF",marginTop:8,marginBottom:24}}>Create your first discount code to offer students a special deal.</p>
          <button onClick={openNew} style={S.btnPrimary}>Create First Code</button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && <div style={S.modalOv} onClick={()=>setShowForm(false)}><div style={{...S.modal,maxWidth:500}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}>
          <h2 style={{fontSize:18,fontWeight:700,color:C.navy}}>{editCode?"Edit Discount Code":"New Discount Code"}</h2>
          <button onClick={()=>setShowForm(false)} style={{color:"#9CA3AF"}}><I.X/></button>
        </div>
        <div style={{padding:28,overflowY:"auto",maxHeight:"80vh"}}>
          {err && <div style={{...S.errBox,marginBottom:16}}>{err}</div>}
          <form onSubmit={handleSave}>
            {/* CODE */}
            <label style={S.label}>Discount Code *</label>
            <div style={{display:"flex",gap:8,marginBottom:6}}>
              <input required value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}
                placeholder="e.g. ORBIT20" style={{...S.input,flex:1,fontFamily:"monospace",fontSize:15,letterSpacing:2,fontWeight:700}}/>
              <button type="button" onClick={genCode} style={{padding:"0 16px",background:C.bg,borderRadius:10,border:"1px solid #E8E4DD",fontSize:13,fontWeight:600,color:C.navy,whiteSpace:"nowrap",flexShrink:0}}>
                ✨ Generate
              </button>
            </div>
            <p style={{fontSize:11,color:"#9CA3AF",marginBottom:16}}>Students will enter this code at checkout. Not case-sensitive.</p>

            {/* DESCRIPTION */}
            <label style={S.label}>Description (optional)</label>
            <input placeholder="e.g. Launch week offer" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...S.input,marginBottom:16}}/>

            {/* TYPE + VALUE */}
            <div className="form-grid-2" style={{marginBottom:16}}>
              <div>
                <label style={S.label}>Discount Type *</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={S.input}>
                  <option value="percent">Percentage (%) off</option>
                  <option value="fixed">Fixed amount (SAR) off</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Discount Value *</label>
                <div style={{position:"relative"}}>
                  <input required type="number" min={1} max={form.type==="percent"?100:99999} value={form.value}
                    onChange={e=>setForm({...form,value:e.target.value})} style={{...S.input,paddingRight:40}}/>
                  <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:600,color:"#9CA3AF"}}>
                    {form.type==="percent"?"%":"ر.س"}
                  </span>
                </div>
              </div>
            </div>

            {/* MAX USES + EXPIRY */}
            <div className="form-grid-2" style={{marginBottom:16}}>
              <div>
                <label style={S.label}>Max Uses (leave empty = unlimited)</label>
                <input type="number" min={1} placeholder="Unlimited" value={form.maxUses||""} onChange={e=>setForm({...form,maxUses:e.target.value})} style={S.input}/>
              </div>
              <div>
                <label style={S.label}>Expiry Date (optional)</label>
                <input type="date" value={form.expiry||""} onChange={e=>setForm({...form,expiry:e.target.value})} style={S.input}/>
              </div>
            </div>

            {/* ACTIVE */}
            <label style={{display:"flex",alignItems:"center",gap:10,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:24,color:C.navy}}>
              <input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} style={{width:16,height:16,accentColor:C.teal}}/>
              Code is active (students can use it)
            </label>

            {/* PREVIEW */}
            {form.value && (
              <div style={{padding:14,background:`${C.gold}08`,borderRadius:10,border:`1px solid ${C.gold}20`,marginBottom:20}}>
                <p style={{fontSize:13,color:C.goldD,fontWeight:600}}>
                  Preview: Code <span style={{fontFamily:"monospace",background:`${C.gold}15`,padding:"2px 6px",borderRadius:4}}>{form.code||"CODE"}</span> gives{" "}
                  {form.type==="percent" ? `${form.value||"?"}% off` : `${form.value||"?"} SAR off`} the course price
                  {form.maxUses ? `, max ${form.maxUses} uses` : ""}
                  {form.expiry ? `, expires ${new Date(form.expiry).toLocaleDateString()}` : ""}
                </p>
              </div>
            )}

            <div style={{display:"flex",gap:12}}>
              <button type="button" onClick={()=>setShowForm(false)} style={{flex:1,padding:13,background:"#E8E4DD",borderRadius:10,fontWeight:600}}>Cancel</button>
              <button type="submit" style={{flex:1,...S.btnPrimary,padding:13,justifyContent:"center"}}>{editCode?"Save Changes":"Create Code"}</button>
            </div>
          </form>
        </div>
      </div></div>}
    </div>
  );
}

function AdminRevenue({ orders }) {
  const rev = orders.reduce((s,o)=>s+o.amount,0);
  return <div style={{padding:40}}>
    <h1 style={S.pageTitle}>Revenue</h1>
    <p style={{...S.pageSub,marginBottom:32}}>Total: {fmtStr(rev)} · {orders.length} orders</p>
    {orders.length>0
      ?<div style={{background:"#fff",borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",overflow:"auto"}}>
        <table style={{width:"100%",fontSize:14,borderCollapse:"collapse",minWidth:600}}>
          <thead><tr style={{background:"#F5F2ED",borderBottom:"1px solid #E8E4DD"}}>
            {["Student","Course","Amount","Method","Status","Date"].map(h=><th key={h} style={{padding:"12px 20px",textAlign:"left",fontWeight:600,color:"#6B7280",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {orders.map(o=><tr key={o.id} style={{borderBottom:"1px solid #F0ECE5"}}>
              <td style={{padding:"16px 20px"}}><p style={{fontWeight:600,color:C.navy}}>{o.userName}</p><p style={{fontSize:12,color:"#9CA3AF"}}>{o.userEmail}</p></td>
              <td style={{padding:"16px 20px",color:C.navy,fontWeight:500}}>{o.courseName}</td>
              <td style={{padding:"16px 20px",fontWeight:700,color:C.gold}}><Price value={o.amount} size={14} bold={700} color={C.gold}/></td>
              <td style={{padding:"16px 20px",color:"#6B7280",textTransform:"capitalize"}}>{o.method||"—"}</td>
              <td style={{padding:"16px 20px"}}><span style={{fontSize:12,padding:"4px 10px",background:`${C.teal}15`,color:C.teal,borderRadius:20,fontWeight:600}}>{o.status}</span></td>
              <td style={{padding:"16px 20px",color:"#6B7280",whiteSpace:"nowrap"}}>{o.date}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      :<div style={{background:"#fff",padding:48,borderRadius:16,textAlign:"center",border:"1px solid rgba(45,51,71,0.07)"}}><p style={{color:"#9CA3AF"}}>No orders yet</p></div>}
  </div>;
}

// ═══════════════════════════════════════════
// ADMIN SETTINGS
// ═══════════════════════════════════════════
function AdminSettings({ onSiteNameChange }) {
  const [siteName,  setSiteName]  = useState(()=>ls("orb_siteName","Orbit Learning"));
  const [vat,       setVat]       = useState(()=>ls("orb_vat","15"));
  const [amazonId,  setAmazonId]  = useState(()=>ls("orb_amazonId",""));
  const [saved,     setSaved]     = useState(false);
  const [notifEnroll, setNE]      = useState(true);
  const [notifPay,    setNP]      = useState(true);
  const [notifReport, setNR]      = useState(false);

  const [chatbotEnabled, setChatbotEnabled] = useState(()=>ls("orb_chatbot_enabled","1")==="1");
  // EmailJS / Brevo config
  const [ejs, setEjs]   = useState(()=>ls("orb_email_cfg",{apiKey:"",senderEmail:"",senderName:"Orbit Learning"}));
  const updateEjs = (k,v) => setEjs(p=>({...p,[k]:v}));
  const [adminNotifEmail, setAdminNotifEmail] = useState(()=>ls("orb_adminEmail",""));
  // OAuth credentials
  const [oauth, setOauth] = useState(()=>ls("orb_oauth",{googleClientId:"485439031935-tqt4qasj02os6u7pd05rqn902hck6u1c.apps.googleusercontent.com",xClientId:"",linkedinClientId:""}));
  const updateOauth = (k,v) => setOauth(p=>({...p,[k]:v}));

  const save = () => {
    ss("orb_siteName", siteName);
    ss("orb_vat", vat);
    ss("orb_amazonId", amazonId);
    ss("orb_oauth", oauth);
    ss("orb_email_cfg", ejs);
    ss("orb_adminEmail", adminNotifEmail);
    ss("orb_chatbot_enabled", chatbotEnabled?"1":"0");
    document.title = siteName;
    onSiteNameChange?.(siteName);   // ← triggers navbar re-render immediately
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };

  return <div style={{padding:40}}><div style={{maxWidth:700}}>
    <h1 style={S.pageTitle}>Settings</h1>
    <p style={{...S.pageSub,marginBottom:32}}>Platform configuration</p>

    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:24}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:24}}>General</h2>
      <label style={S.label}>Platform Name</label>
      <input value={siteName} onChange={e=>setSiteName(e.target.value)} style={{...S.input,marginBottom:8}}/>
      <p style={{fontSize:12,color:"#9CA3AF",marginBottom:20}}>Displayed in browser tab and platform header</p>
      <div className="form-grid-2">
        <div><label style={S.label}>Currency</label><select style={S.input}><option>SAR — Saudi Riyal (ر.س)</option><option>USD — US Dollar ($)</option></select></div>
        <div><label style={S.label}>VAT Rate (%)</label><input type="number" value={vat} onChange={e=>setVat(e.target.value)} style={S.input}/></div>
      </div>
    </div>

    {/* SOCIAL LOGIN / OAUTH */}
    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:24}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:6}}>Social Login</h2>
      <p style={{fontSize:13,color:"#9CA3AF",marginBottom:20}}>Enter your OAuth Client IDs to enable Google, X, and LinkedIn sign-in on the login page.</p>

      {/* GOOGLE */}
      <div style={{marginBottom:20,padding:20,background:C.bg,borderRadius:12,border:"1px solid #E8E4DD"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <span style={{fontSize:15,fontWeight:700,color:C.navy}}>Google</span>
          {oauth.googleClientId && <span style={{fontSize:11,padding:"2px 8px",background:C.successBg,color:C.success,borderRadius:20,fontWeight:600}}>✓ Configured</span>}
        </div>
        <label style={S.label}>Google Client ID</label>
        <input placeholder="123456789-abc.apps.googleusercontent.com" value={oauth.googleClientId||""} onChange={e=>updateOauth("googleClientId",e.target.value)} style={S.input}/>
        <p style={{fontSize:11,color:"#9CA3AF",marginTop:6}}>Get this from <strong>console.cloud.google.com</strong> → APIs & Services → Credentials → Create OAuth Client ID → Web Application. Add your domain to Authorized JavaScript Origins.</p>
      </div>

      {/* LINKEDIN */}
      <div style={{padding:20,background:C.bg,borderRadius:12,border:"1px solid #E8E4DD"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          <span style={{fontSize:15,fontWeight:700,color:C.navy}}>LinkedIn</span>
          {oauth.linkedinClientId && <span style={{fontSize:11,padding:"2px 8px",background:C.successBg,color:C.success,borderRadius:20,fontWeight:600}}>✓ Configured</span>}
        </div>
        <label style={S.label}>LinkedIn Client ID</label>
        <input placeholder="your-linkedin-client-id" value={oauth.linkedinClientId||""} onChange={e=>updateOauth("linkedinClientId",e.target.value)} style={S.input}/>
        <p style={{fontSize:11,color:"#9CA3AF",marginTop:6}}>Get from <strong>developer.linkedin.com</strong> → My Apps → Auth tab → Client ID. LinkedIn OAuth requires a backend server to complete the token exchange.</p>
      </div>
    </div>

    {/* EMAIL SERVICE — Brevo */}
    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
        <div style={{width:36,height:36,borderRadius:9,background:"#0B996E15",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0B996E"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </div>
        <h2 style={{fontSize:16,fontWeight:700,color:C.navy}}>Email Service — Brevo</h2>
        {ejs.apiKey && ejs.senderEmail && <span style={{fontSize:11,padding:"3px 10px",background:C.successBg,color:C.success,borderRadius:20,fontWeight:700}}>✓ Configured</span>}
      </div>
      <p style={{fontSize:13,color:"#9CA3AF",marginBottom:20}}>
        300 free emails/day. No templates needed — emails are built-in. Setup takes 2 minutes at <strong>brevo.com</strong>
      </p>

      {/* STATUS */}
      <div style={{padding:14,background:ejs.apiKey&&ejs.senderEmail?C.successBg:"#FFF7ED",borderRadius:10,marginBottom:20,display:"flex",alignItems:"center",gap:10,border:`1px solid ${ejs.apiKey&&ejs.senderEmail?C.success:"#FED7AA"}`}}>
        <span style={{fontSize:18}}>{ejs.apiKey&&ejs.senderEmail?"✅":"⚠️"}</span>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:ejs.apiKey&&ejs.senderEmail?C.success:"#C2410C"}}>
            {ejs.apiKey&&ejs.senderEmail ? "Ready — emails will be sent automatically" : "Not configured yet"}
          </p>
          <p style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>
            {ejs.apiKey&&ejs.senderEmail
              ? `Sending from: ${ejs.senderEmail}`
              : "Activation links and reset links will still appear on-screen as fallback."}
          </p>
        </div>
      </div>

      <div style={{display:"grid",gap:14}}>
        <div>
          <label style={S.label}>Brevo API Key *</label>
          <input
            type="password"
            placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={ejs.apiKey}
            onChange={e=>updateEjs("apiKey",e.target.value)}
            style={S.input}
          />
          <p style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>
            Get from brevo.com → Top-right menu → SMTP & API → API Keys → Generate New Key
          </p>
        </div>
        <div>
          <label style={S.label}>Sender Email Address *</label>
          <input
            type="email"
            placeholder="noreply@orbit-lms.net"
            value={ejs.senderEmail}
            onChange={e=>updateEjs("senderEmail",e.target.value)}
            style={S.input}
          />
          <p style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>
            Must be a verified sender in your Brevo account. You can use your own Gmail too.
          </p>
        </div>
        <div>
          <label style={S.label}>Sender Name</label>
          <input
            placeholder="Orbit Learning"
            value={ejs.senderName||""}
            onChange={e=>updateEjs("senderName",e.target.value)}
            style={S.input}
          />
        </div>

        {/* Admin notification email */}
        <div style={{paddingTop:14,borderTop:"1px solid #E8E4DD"}}>
          <label style={S.label}>Admin Notification Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={adminNotifEmail}
            onChange={e=>setAdminNotifEmail(e.target.value)}
            style={S.input}
          />
          <p style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>
            Receive instant alerts when someone submits a job application.
          </p>
        </div>
      </div>

      {/* Setup steps */}
      <div style={{marginTop:20,padding:16,background:"#F0FDF4",borderRadius:10,border:"1px solid #BBF7D0"}}>
        <p style={{fontSize:12,fontWeight:700,color:"#15803D",marginBottom:10}}>📋 Setup in 3 steps</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            ["1","Go to brevo.com → Sign up free (use your Gmail)"],
            ["2","Top-right menu → SMTP & API → API Keys → Generate → Copy the key"],
            ["3","Add your sender email under Senders & IPs → Verify it → Paste above → Save"],
          ].map(([n,t])=>(
            <div key={n} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#15803D",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{n}</div>
              <p style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* CHATBOT SETTING */}
    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:24}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:6}}>Chatbot & Support</h2>
      <p style={{fontSize:13,color:"#9CA3AF",marginBottom:20}}>Control the live chat widget shown on your platform.</p>
      <label style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",padding:"16px 20px",background:chatbotEnabled?`${C.success}08`:C.bg,borderRadius:12,border:`1.5px solid ${chatbotEnabled?C.success:"#E8E4DD"}`,transition:"all 0.2s"}}>
        <div>
          <p style={{fontSize:15,fontWeight:700,color:chatbotEnabled?C.success:C.navy}}>{chatbotEnabled?"✓ Chatbot Enabled":"Chatbot Disabled"}</p>
          <p style={{fontSize:13,color:"#9CA3AF",marginTop:3}}>{chatbotEnabled?"Chat widget is visible to all visitors":"Chat widget is hidden from the site"}</p>
        </div>
        {/* Toggle switch */}
        <div style={{position:"relative",width:48,height:26,borderRadius:13,background:chatbotEnabled?C.success:"#D1D5DB",transition:"background 0.2s",flexShrink:0}}>
          <div style={{position:"absolute",top:3,left:chatbotEnabled?26:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
          <input type="checkbox" checked={chatbotEnabled} onChange={e=>setChatbotEnabled(e.target.checked)} style={{opacity:0,position:"absolute",inset:0,cursor:"pointer"}}/>
        </div>
      </label>
      <p style={{fontSize:12,color:"#9CA3AF",marginTop:10}}>
        When disabled, the chatbot button and WhatsApp escalation are completely hidden. Changes take effect after Save.
      </p>
    </div>

    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:24}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:8}}>Amazon Pay</h2>
      <p style={{fontSize:13,color:"#9CA3AF",marginBottom:20}}>Enter your Amazon Pay merchant credentials to enable checkout</p>
      <label style={S.label}>Amazon Merchant ID</label>
      <input placeholder="A1BCDE2FGHIJ3K" value={amazonId} onChange={e=>setAmazonId(e.target.value)} style={{...S.input,marginBottom:12}}/>
      <p style={{fontSize:12,color:"#9CA3AF"}}>Find this in your Amazon Seller Central account under Payment Settings</p>
    </div>

    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:24}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:24}}>Email Notifications</h2>
      {[["New enrollment notification",notifEnroll,setNE],["Payment confirmation & invoice",notifPay,setNP],["Weekly analytics report",notifReport,setNR]].map(([l,v,fn],i)=>(
        <label key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:i<2?"1px solid #F0ECE5":"none",fontSize:14,cursor:"pointer"}}>
          <input type="checkbox" checked={v} onChange={e=>fn(e.target.checked)} style={{width:18,height:18}}/>{l}
        </label>
      ))}
    </div>

    <div style={{background:"#fff",padding:32,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)",marginBottom:24}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:24}}>Security</h2>
      <label style={S.label}>Admin Password</label>
      <input type="password" value="••••••••••" readOnly style={{...S.input,marginBottom:12}}/>
      <button type="button" style={{fontSize:13,color:C.gold,fontWeight:600}}>Change Password</button>
    </div>

    {saved && <div style={{padding:16,background:C.successBg,borderRadius:12,color:C.success,fontWeight:600,fontSize:14,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
      Settings saved successfully
    </div>}
    <button onClick={save} style={{...S.btnPrimary,padding:"14px 40px"}}>Save Settings</button>
  </div></div>;
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const S = {
  nav:{position:"sticky",top:0,zIndex:100,background:"rgba(245,242,237,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(45,51,71,0.08)"},
  navIn:{maxWidth:1200,margin:"0 auto",padding:"0 24px",height:68,display:"flex",alignItems:"center",justifyContent:"space-between"},
  logoBtn:{display:"flex",alignItems:"center",gap:10},
  logoTxt:{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.navy,letterSpacing:"-0.5px"},
  navLink:{padding:"7px 14px",fontSize:14,fontWeight:500,color:"#6B7280",borderRadius:8,transition:"all 0.15s"},
  navR:{display:"flex",alignItems:"center",gap:10},
  navCTA:{padding:"9px 22px",background:C.navy,color:C.cream,borderRadius:10,fontSize:13,fontWeight:600},
  langBtn:{padding:"8px 16px",background:"rgba(45,51,71,0.06)",border:`1.5px solid ${C.creamL}`,borderRadius:8,fontSize:13,fontWeight:700,color:C.navy,cursor:"pointer",transition:"all 0.15s"},
  menuBtn:{display:"flex",alignItems:"center",justifyContent:"center",width:38,height:38,color:C.navy},
  mPanel:{padding:"8px 24px 20px",display:"flex",flexDirection:"column",gap:4,borderTop:"1px solid rgba(45,51,71,0.06)"},
  mLink:{padding:"14px 0",fontSize:15,fontWeight:500,color:C.navy,textAlign:"left",borderBottom:"1px solid rgba(45,51,71,0.06)"},
  mCTA:{marginTop:12,padding:13,background:C.navy,color:C.cream,borderRadius:12,fontSize:14,fontWeight:600,textAlign:"center"},
  avatarBtn:{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:10,background:"rgba(45,51,71,0.05)"},
  avatarCircle:{width:32,height:32,borderRadius:"50%",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.cream,flexShrink:0},
  avatarDrop:{position:"absolute",top:"calc(100% + 8px)",right:0,width:260,background:"#fff",borderRadius:16,boxShadow:"0 8px 30px rgba(45,51,71,0.12)",border:"1px solid rgba(45,51,71,0.08)",zIndex:999,overflow:"hidden"},
  avatarHeader:{padding:"16px 20px",display:"flex",alignItems:"center",gap:12},
  avatarDiv:{height:1,background:"#F0ECE5"},
  avatarItem:{width:"100%",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:500,color:C.navy,textAlign:"left"},
  hero:{position:"relative",background:C.navy,padding:"96px 0",overflow:"hidden"},
  heroOv:{position:"absolute",inset:0,background:"radial-gradient(ellipse at 20% 60%, rgba(184,150,90,0.12), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(74,124,111,0.1), transparent 55%)"},
  heroCnt:{position:"relative",maxWidth:720,margin:"0 auto",textAlign:"center",padding:"0 24px"},
  heroBadge:{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 18px",background:"rgba(213,207,193,0.08)",border:"1px solid rgba(213,207,193,0.15)",borderRadius:40,color:C.cream,fontSize:13,fontWeight:500,marginBottom:28},
  heroDot:{width:7,height:7,borderRadius:"50%",background:C.teal,flexShrink:0},
  heroTitle:{fontFamily:"'Playfair Display',serif",fontSize:"clamp(30px,5vw,56px)",fontWeight:700,color:C.bg,lineHeight:1.12,marginBottom:20,letterSpacing:"-1.5px"},
  heroSub:{fontSize:"clamp(14px,2vw,17px)",color:"rgba(213,207,193,0.75)",lineHeight:1.7,marginBottom:36,maxWidth:520,margin:"0 auto 36px"},
  heroAct:{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:56},
  heroStats:{display:"flex",gap:0,alignItems:"center",justifyContent:"center",flexWrap:"wrap",rowGap:16},
  heroStatN:{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:C.cream,letterSpacing:"-0.5px"},
  heroStatL:{fontSize:11,color:"rgba(213,207,193,0.5)",marginTop:3,textTransform:"uppercase",letterSpacing:"0.5px"},
  heroDiv:{width:1,height:32,background:"rgba(213,207,193,0.15)",margin:"0 24px"},
  btnPrimary:{display:"inline-flex",alignItems:"center",gap:10,padding:"13px 28px",background:C.gold,color:"#fff",borderRadius:12,fontSize:15,fontWeight:700},
  btnSec:{display:"inline-flex",alignItems:"center",gap:10,padding:"13px 28px",background:"transparent",color:C.cream,borderRadius:12,fontSize:15,fontWeight:600,border:"1.5px solid rgba(213,207,193,0.25)"},
  section:{maxWidth:1200,margin:"0 auto",padding:"48px 24px 72px"},
  secHead:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28,flexWrap:"wrap",gap:12},
  secTitle:{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,3vw,28px)",fontWeight:700,color:C.text,letterSpacing:"-0.5px"},
  secSub:{fontSize:15,color:"#9CA3AF",marginTop:5},
  seeAll:{display:"flex",alignItems:"center",gap:4,fontSize:14,fontWeight:600,color:C.gold},
  pageTitle:{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,4vw,34px)",fontWeight:700,color:C.text,letterSpacing:"-0.5px"},
  pageSub:{fontSize:15,color:"#9CA3AF",marginTop:6,marginBottom:24},
  cCard:{background:"#fff",borderRadius:16,overflow:"hidden",textAlign:"left",boxShadow:"0 1px 4px rgba(45,51,71,0.07)",width:"100%",transition:"transform 0.2s,box-shadow 0.2s",border:"1px solid rgba(45,51,71,0.05)"},
  cLevel:{position:"absolute",top:12,right:12,padding:"4px 12px",background:"rgba(255,255,255,0.2)",backdropFilter:"blur(8px)",borderRadius:20,color:"#fff",fontSize:12,fontWeight:600},
  catCard:{padding:"24px 22px",borderRadius:14,background:"#fff",border:"1px solid rgba(45,51,71,0.07)",textAlign:"left",width:"100%",transition:"all 0.2s"},
  whyOrbit:{background:C.navy,padding:"80px 0",marginBottom:0},
  featCard:{padding:"40px 32px"},
  featIcon:{width:42,height:42,borderRadius:12,background:"rgba(184,150,90,0.18)",display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,marginBottom:20,margin:"0 auto 20px"},
  featTitle:{fontSize:16,fontWeight:700,color:C.cream,marginBottom:8,textAlign:"center"},
  featDesc:{fontSize:14,color:"rgba(213,207,193,0.6)",lineHeight:1.65,textAlign:"center"},
  ctaBanner:{background:C.text,padding:"80px 24px"},
  ctaTitle:{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,4vw,38px)",fontWeight:700,color:C.bg,marginBottom:16,letterSpacing:"-0.5px"},
  ctaSub:{fontSize:15,color:"rgba(213,207,193,0.65)",marginBottom:36,lineHeight:1.6},
  ctaBtn:{display:"inline-flex",alignItems:"center",gap:10,padding:"15px 36px",background:C.gold,color:"#fff",borderRadius:12,fontSize:15,fontWeight:700},
  searchBox:{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",background:"#fff",borderRadius:12,border:"1.5px solid #E8E4DD"},
  searchIn:{flex:1,border:"none",outline:"none",fontSize:15,background:"transparent",color:C.navy,minWidth:0},
  filterBtn:{padding:"12px 18px",borderRadius:12,border:"1.5px solid #E8E4DD",display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:600,transition:"all 0.2s",flexShrink:0},
  selInput:{padding:"12px 16px",borderRadius:12,border:"1.5px solid #E8E4DD",fontSize:14,fontWeight:500,background:"#fff",color:C.navy,outline:"none",minWidth:140},
  filterPanel:{background:"#fff",padding:24,borderRadius:16,border:"1px solid #E8E4DD",marginBottom:16,display:"flex",flexDirection:"column",gap:20},
  filterLbl:{fontSize:12,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:1,marginBottom:10},
  chip:{padding:"8px 16px",borderRadius:20,fontSize:13,fontWeight:600,border:"1px solid #E8E4DD",transition:"all 0.15s"},
  metaBadge:{padding:"4px 14px",background:"rgba(255,255,255,0.15)",borderRadius:20,fontSize:13,fontWeight:600,color:"#fff"},
  enrollCard:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",background:"#fff",borderRadius:16,marginTop:-24,marginBottom:32,boxShadow:"0 4px 20px rgba(45,51,71,0.08)",flexWrap:"wrap",gap:16},
  enrollBtn:{padding:"13px 36px",background:C.gold,color:"#fff",borderRadius:12,fontSize:15,fontWeight:700},
  tabs:{display:"flex",gap:4,marginBottom:32,borderBottom:"2px solid #E8E4DD"},
  tab:{padding:"12px 24px",fontSize:14,fontWeight:500,color:"#6B7280",borderBottom:"2px solid transparent",marginBottom:-2},
  tabA:{padding:"12px 24px",fontSize:14,fontWeight:700,color:C.navy,borderBottom:`2px solid ${C.gold}`,marginBottom:-2},
  modItem:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",background:"#fff",borderRadius:12,border:"1px solid #F0ECE5"},
  statCard:{background:"#fff",borderRadius:16,padding:"20px 22px",border:"1px solid rgba(45,51,71,0.07)"},
  progressCard:{background:"#fff",borderRadius:16,padding:"18px 22px",border:"1px solid rgba(45,51,71,0.07)",textAlign:"left",width:"100%"},
  authForm:{display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"32px 20px 48px",background:C.bg,flex:1,overflowY:"auto"},
  authTitle:{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,28px)",fontWeight:700,color:C.text,marginBottom:8},
  input:{width:"100%",padding:"12px 16px",border:"1.5px solid #E8E4DD",borderRadius:10,fontSize:14,outline:"none",background:"#fff",color:C.text},
  label:{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:7},
  errBox:{padding:12,background:C.dangerBg,borderRadius:10,color:C.danger,marginBottom:16,fontSize:14},
  divider:{position:"relative",textAlign:"center",margin:"24px 0",borderTop:"1px solid #E8E4DD"},
  socialBtn:{flex:1,padding:11,background:"#fff",border:"1px solid #E8E4DD",borderRadius:10,fontSize:13,fontWeight:600,color:"#374151"},
  modalOv:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
  modal:{background:"#fff",borderRadius:20,maxWidth:500,width:"100%",maxHeight:"90vh",overflowY:"auto"},
  modalHead:{padding:"20px 28px",borderBottom:"1px solid #F0ECE5",display:"flex",justifyContent:"space-between",alignItems:"center"},
  adminStat:{background:"#fff",padding:24,borderRadius:16,border:"1px solid rgba(45,51,71,0.07)"},
  empty:{textAlign:"center",padding:"72px 24px",color:"#9CA3AF"},
  footer:{background:C.text,padding:"64px 0 0"},
  footerIn:{maxWidth:1200,margin:"0 auto",padding:"0 24px"},
  footerDesc:{fontSize:14,color:"rgba(213,207,193,0.5)",lineHeight:1.7,maxWidth:280},
  footerH:{fontSize:11,fontWeight:700,color:C.cream,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:20},
  footerL:{display:"block",fontSize:14,color:"rgba(213,207,193,0.45)",marginBottom:12,textAlign:"left",width:"100%"},
  footerBot:{padding:"24px 0",fontSize:13,color:"rgba(213,207,193,0.3)",borderTop:"1px solid rgba(213,207,193,0.08)",marginTop:48,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12},
  creamL: C.creamL,
};

// ═══════════════════════════════════════════
// RESPONSIVE CSS
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// CHATBOT WIDGET — customer service
// ═══════════════════════════════════════════
const WHATSAPP_URL = "https://api.whatsapp.com/message/EQYMUTLCLKWIE1?autoload=1&app_absent=0";

function ChatbotWidget({ isRTL }) {
  const [open,        setOpen]        = useState(false);
  const [msgs,        setMsgs]        = useState([
    { from:"bot", text: isRTL ? "مرحباً! 👋 كيف أستطيع مساعدتك اليوم؟" : "Hi there! 👋 How can I help you today?", type:"text" }
  ]);
  const [input,       setInput]       = useState("");
  const [typing,      setTyping]      = useState(false);
  const [unmatchCount,setUnmatchCount] = useState(0); // how many times bot couldn't answer
  const endRef = useRef();

  const WA_URL = WHATSAPP_URL;

  const quickReplies = isRTL
    ? ["كيف أسجّل في كورس؟","ما وسائل الدفع؟","سياسة الاسترداد؟","هل الكورسات بالعربي؟","تحدث مع موظف 💬"]
    : ["How do I enroll?","Payment methods?","Refund policy?","Are courses in Arabic?","Talk to an agent 💬"];

  const autoReplies = isRTL ? {
    "أسجّل":    "تصفح الكورسات، اختر الكورس المناسب، ثم اضغط 'اشترك الآن' واتبع خطوات الدفع الآمن. 🎓",
    "كورس":     "تصفح الكورسات، اختر الكورس المناسب، ثم اضغط 'اشترك الآن' واتبع خطوات الدفع الآمن. 🎓",
    "الدفع":    "نقبل البطاقات الائتمانية، Apple Pay، STC Pay، وAmazon Pay. جميع الأسعار تشمل ضريبة القيمة المضافة 15%.",
    "دفع":      "نقبل البطاقات الائتمانية، Apple Pay، STC Pay، وAmazon Pay. جميع الأسعار تشمل ضريبة القيمة المضافة 15%.",
    "استرداد":  "__REFUND__",
    "عربي":     "نعم! الكورسات متاحة باللغتين العربية والإنجليزية. يمكنك تبديل اللغة من الزر أعلى الصفحة.",
    "لغة":      "نعم! الكورسات متاحة باللغتين العربية والإنجليزية. يمكنك تبديل اللغة من الزر أعلى الصفحة.",
    "شهادة":    "نعم، تحصل على شهادة إتمام رسمية عند اجتياز جميع دروس الكورس. 🎓",
    "مجاني":    "بعض الكورسات مجانية تماماً! ابحث عنها في صفحة الكورسات وابدأ فوراً.",
    "موظف":     "__AGENT__",
    "دعم":      "__AGENT__",
    "تحدث":     "__AGENT__",
  } : {
    "enroll":   "Browse courses, pick the one you like, then click 'Enroll Now' and follow the payment steps. 🎓",
    "course":   "Browse courses, pick the one you like, then click 'Enroll Now' and follow the payment steps. 🎓",
    "payment":  "We accept credit cards, Apple Pay, STC Pay, and Amazon Pay. All prices include 15% VAT.",
    "pay":      "We accept credit cards, Apple Pay, STC Pay, and Amazon Pay. All prices include 15% VAT.",
    "refund":   "__REFUND__",
    "arabic":   "Yes! All courses are available in both Arabic and English. Toggle the language from the top navbar.",
    "language": "Yes! All courses are available in both Arabic and English. Toggle the language from the top navbar.",
    "certif":   "Yes, you get an official completion certificate once you finish all lessons and pass the exam. 🎓",
    "free":     "Some courses are completely free! Browse the courses page and look for the FREE badge.",
    "agent":    "__AGENT__",
    "human":    "__AGENT__",
    "support":  "__AGENT__",
    "talk":     "__AGENT__",
    "person":   "__AGENT__",
    "help":     "__AGENT__",
  };

  // WhatsApp handoff card
  const showWhatsAppCard = (context) => {
    const waMsg = encodeURIComponent(
      isRTL
        ? `مرحباً، أحتاج مساعدة${context ? ` بخصوص: ${context}` : ""}`
        : `Hi, I need help${context ? ` with: ${context}` : ""} from the Orbit Learning chatbot`
    );
    return { from:"bot", type:"whatsapp", url:`${WA_URL}&text=${waMsg}` };
  };

  const sendMsg = (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    const newMsgs = [...msgs, {from:"user", text:userMsg, type:"text"}];
    setMsgs(newMsgs);
    setInput("");
    setTyping(true);

    setTimeout(()=>{
      const lower = userMsg.toLowerCase();
      let reply = null;
      let isAgent = false;

      // Check auto replies
      for (const [key, val] of Object.entries(autoReplies)) {
        if (lower.includes(key)) {
          if (val === "__AGENT__" || val === "__REFUND__") { isAgent = true; }
          else { reply = val; }
          break;
        }
      }

      if (isAgent || val === "__REFUND__") {
        const isRefund = val === "__REFUND__";
        const botText = isRefund
          ? (isRTL
              ? "طلبات الاسترداد تتم عبر خدمة العملاء مباشرةً. تواصل معنا على واتساب وسنساعدك في أسرع وقت. 💰"
              : "Refund requests are handled directly by our customer service team. Contact us on WhatsApp and we'll assist you right away. 💰")
          : (isRTL
              ? "سأحولك الآن لأحد موظفي خدمة العملاء على واتساب. 🟢"
              : "I'll connect you with a live agent on WhatsApp right now. 🟢");
        setMsgs(p=>[...p,
          {from:"bot", text:botText, type:"text"},
          showWhatsAppCard(isRefund ? (isRTL?"طلب استرداد":"Refund request") : userMsg),
        ]);
        setUnmatchCount(0);
      } else if (reply) {
        setMsgs(p=>[...p,{from:"bot",text:reply,type:"text"}]);
        setUnmatchCount(0);
      } else {
        // Didn't understand
        const newCount = unmatchCount + 1;
        setUnmatchCount(newCount);
        if (newCount >= 2) {
          // After 2 unmatched — proactively offer WhatsApp
          const botText = isRTL
            ? "يبدو أنني لم أتمكن من فهم سؤالك بشكل كافٍ. أنصحك بالتحدث مع أحد موظفينا مباشرةً على واتساب 👇"
            : "I'm having trouble understanding your question. Let me connect you with a live agent on WhatsApp 👇";
          setMsgs(p=>[...p,
            {from:"bot", text:botText, type:"text"},
            showWhatsAppCard(userMsg),
          ]);
          setUnmatchCount(0);
        } else {
          const botText = isRTL
            ? "آسف، لم أفهم سؤالك جيداً. هل يمكنك إعادة الصياغة؟ أو يمكنني تحويلك لموظف دعم مباشر."
            : "Sorry, I didn't quite catch that. Could you rephrase? Or I can connect you with a live agent.";
          setMsgs(p=>[...p,{from:"bot",text:botText,type:"text"}]);
        }
      }
      setTyping(false);
    }, 750);
  };

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,typing]);

  // WhatsApp card component (inline)
  const WACard = ({url}) => (
    <div style={{marginBottom:12,display:"flex",justifyContent:"flex-start"}}>
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#25D366",borderRadius:"16px 16px 16px 4px",textDecoration:"none",maxWidth:"85%",boxShadow:"0 2px 8px rgba(37,211,102,0.3)"}}>
        {/* WhatsApp icon */}
        <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </div>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:2}}>
            {isRTL?"تحدث مع موظف الآن":"Chat with an agent now"}
          </p>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.85)"}}>
            {isRTL?"واتساب · يرد خلال دقائق":"WhatsApp · Usually replies in minutes"}
          </p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{marginLeft:"auto",flexShrink:0,opacity:0.8}}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  );

  return (
    <div style={{position:"fixed",bottom:24,right:isRTL?undefined:24,left:isRTL?24:undefined,zIndex:999}}>
      {open && (
        <div style={{width:340,background:"#fff",borderRadius:20,boxShadow:"0 8px 40px rgba(45,51,71,0.18)",border:"1px solid rgba(45,51,71,0.08)",marginBottom:12,overflow:"hidden",direction:isRTL?"rtl":"ltr",fontFamily:isRTL?"'Cairo',sans-serif":"'DM Sans',sans-serif"}}>

          {/* HEADER */}
          <div style={{background:C.navy,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center"}}><OrbitLogo size={22} light/></div>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:C.cream}}>Orbit Support</p>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#4ADE80"}}/>
                  <p style={{fontSize:11,color:"rgba(213,207,193,0.7)"}}>{isRTL?"متصل الآن":"Online now"}</p>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {/* Direct WhatsApp button in header */}
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                title={isRTL?"تحدث مع موظف":"Talk to agent"}
                style={{width:30,height:30,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              </a>
              <button onClick={()=>setOpen(false)} style={{color:"rgba(213,207,193,0.7)",display:"flex"}}><I.X/></button>
            </div>
          </div>

          {/* MESSAGES */}
          <div style={{height:290,overflowY:"auto",padding:"16px 14px 8px"}}>
            {msgs.map((m,i)=>(
              m.type==="whatsapp"
                ? <WACard key={i} url={m.url}/>
                : (
                  <div key={i} style={{marginBottom:10,display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:m.from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.from==="user"?C.gold:"#F5F2ED",color:m.from==="user"?"#fff":C.navy,fontSize:13,lineHeight:1.6,textAlign:isRTL?"right":"left"}}>
                      {m.text}
                    </div>
                  </div>
                )
            ))}
            {typing && (
              <div style={{display:"flex",gap:4,padding:"10px 14px",background:"#F5F2ED",borderRadius:"16px 16px 16px 4px",width:"fit-content",marginBottom:10}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#9CA3AF",animation:`bounce 1s ${i*0.2}s infinite`}}/>)}
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* QUICK REPLIES */}
          <div style={{padding:"0 12px 8px",display:"flex",flexWrap:"wrap",gap:5}}>
            {quickReplies.map((q,i)=>(
              <button key={i} onClick={()=>sendMsg(q)}
                style={{padding:"5px 12px",background: q.includes("agent")||q.includes("موظف")?"#25D36618":"#F0ECE5",
                  border: q.includes("agent")||q.includes("موظف")?"1px solid #25D36640":"none",
                  borderRadius:20,fontSize:11,fontWeight:600,
                  color: q.includes("agent")||q.includes("موظف")?"#128C5E":C.navy}}>
                {q}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div style={{padding:"8px 12px 14px",display:"flex",gap:8,borderTop:"1px solid #F0ECE5"}}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendMsg(input)}
              placeholder={isRTL?"اكتب رسالتك...":"Type your message..."}
              style={{...S.input,fontSize:13,padding:"9px 12px",flex:1,textAlign:isRTL?"right":"left"}}
            />
            <button onClick={()=>sendMsg(input)}
              style={{width:36,height:36,borderRadius:9,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* TOGGLE BUTTON */}
      <button onClick={()=>setOpen(!open)}
        style={{width:56,height:56,borderRadius:"50%",background:open?C.navy:C.gold,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(184,150,90,0.35)",transition:"all 0.2s"}}>
        {open
          ? <I.X/>
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
      </button>

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
button{background:none;border:none;cursor:pointer;font:inherit;line-height:1}
input,select,textarea{font-family:inherit}
body{-webkit-text-size-adjust:100%}

/* Desktop nav / mobile nav */
.d-nav{display:none}
.m-nav{display:flex}
.auth-brand{display:none!important}
.auth-mobile-logo{display:flex!important}

/* MOBILE FIRST (≤479px) */
.grid-3{display:grid;grid-template-columns:1fr;gap:16px}
.grid-4{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.grid-4s{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.auth-split{display:flex;flex-direction:column;min-height:100%}
.name-grid{display:grid;grid-template-columns:1fr;gap:12px}
.form-grid-2{display:grid;grid-template-columns:1fr;gap:12px}
.filter-row{display:flex;flex-wrap:wrap;gap:10px}
.learn-layout{display:flex;flex-direction:column;gap:24px}
.learn-layout>div:last-child{width:100%!important}
.footer-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding-bottom:48px;border-bottom:1px solid rgba(213,207,193,0.08)}
.footer-brand-row{grid-template-columns:1fr!important}
.admin-side{display:none!important}

/* TABLET (≥640px) */
@media(min-width:640px){
  .grid-3{grid-template-columns:repeat(2,1fr)}
  .form-grid-2{grid-template-columns:1fr 1fr}
  .name-grid{grid-template-columns:1fr 1fr}
  .auth-split{flex-direction:row}
  .auth-brand{display:flex!important;flex:1}
  .auth-mobile-logo{display:none!important}
  .auth-split>div:last-child{flex:1}
}

/* DESKTOP (≥1024px) */
@media(min-width:1024px){
  .d-nav{display:flex;gap:4px;align-items:center}
  .m-nav{display:none!important}
  .grid-3{grid-template-columns:repeat(3,1fr)}
  .grid-4{grid-template-columns:repeat(4,1fr)}
  .grid-4s{grid-template-columns:repeat(4,1fr)}
  .learn-layout{flex-direction:row}
  .footer-grid{grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
  .footer-brand-row{grid-template-columns:1fr 1fr!important}
  .admin-side{display:flex!important}
  .filter-row{flex-wrap:nowrap}
}

/* INTERACTIONS */
button:hover{opacity:0.88}
input:focus,select:focus,textarea:focus{border-color:${C.gold}!important;outline:none}
.cCard:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,51,71,0.1)!important}
`;
