/**
 * Multilingual Clinical Voice Suggestions Engine
 * Comprehensive clinical inquiry suggestions and context-aware follow-ups
 * across all 13 official Indian languages supported by GeneWise AI.
 */

export interface ClinicalSuggestionItem {
  id: string;
  category: "all" | "cardiac" | "diabetes" | "genetics" | "labs" | "thyroid" | "renal" | "emergency";
  categoryLabel: string;
  title: string;
  badge: string;
  iconName: "heart" | "activity" | "dna" | "flask" | "shield" | "alert";
  translations: Record<
    string,
    {
      native: string;
      romanized?: string;
      english: string;
    }
  >;
  followUps: Record<
    string,
    Array<{
      title: string;
      query: string;
    }>
  >;
}

export interface SuggestionCategory {
  id: string;
  label: string;
  nativeLabels: Record<string, string>;
  icon: string;
}

export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: "all",
    label: "All Topics",
    nativeLabels: {
      "hi-IN": "सभी विषय",
      "bn-IN": "সব বিষয়",
      "ta-IN": "அனைத்து தலைப்புகள்",
      "te-IN": "అన్ని విషయాలు",
      "kn-IN": "ಎಲ್ಲಾ ವಿಷಯಗಳು",
      "ml-IN": "എല്ലാ വിഷയങ്ങളും",
      "mr-IN": "सर्व विषय",
      "gu-IN": "બધા વિષયો",
      "pa-IN": "ਸਾਰੇ ਵਿਸ਼ੇ",
      "od-IN": "ସମସ୍ତ ବିଷୟ",
      "as-IN": "সকলো বিষয়",
      "ur-IN": "تمام موضوعات",
      "en-IN": "All Topics",
    },
    icon: "Sparkles",
  },
  {
    id: "cardiac",
    label: "Cardiology & BP",
    nativeLabels: {
      "hi-IN": "हृदय और रक्तचाप",
      "bn-IN": "হৃদরোগ ও রক্তচাপ",
      "ta-IN": "இதயம் & இரத்த அழுத்தம்",
      "te-IN": "గుండె & రక్తపోటు",
      "kn-IN": "ಹೃದಯ & ರಕ್ತದೊತ್ತಡ",
      "ml-IN": "ഹൃദയവും രക്തസമ്മർദ്ദവും",
      "mr-IN": "हृदय आणि रक्तदाब",
      "gu-IN": "હૃદય અને બ્લડ પ્રેશર",
      "pa-IN": "ਦਿਲ ਅਤੇ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ",
      "od-IN": "ହୃଦୟ ଏବଂ ରକ୍ତଚାପ",
      "as-IN": "হৃদযন্ত্ৰ আৰু ৰক্তচাপ",
      "ur-IN": "امراض قلب اور بلڈ پریشر",
      "en-IN": "Cardiology & BP",
    },
    icon: "HeartPulse",
  },
  {
    id: "diabetes",
    label: "Diabetes & Glycemia",
    nativeLabels: {
      "hi-IN": "मधुमेह और ग्लूकोज",
      "bn-IN": "ডায়াবেটিস ও গ্লুকোজ",
      "ta-IN": "நீரிழிவு & குளுக்கோஸ்",
      "te-IN": "మధుమేహం & గ్లూకోజ్",
      "kn-IN": "ಮಧುಮೇಹ & ಗ್ಲೂಕೋಸ್",
      "ml-IN": "പ്രമേഹവും ഗ്ലൂക്കോസും",
      "mr-IN": "मधुमेह आणि ग्लुकोज",
      "gu-IN": "ડાયાબિટીસ અને ગ્લુકોઝ",
      "pa-IN": "ਸ਼ੂਗਰ ਅਤੇ ਗਲੂਕੋਜ਼",
      "od-IN": "ମଧୁମେହ ଏବଂ ଗ୍ଲୁକୋଜ୍",
      "as-IN": "মধুমেহ আৰু গ্লুকোজ",
      "ur-IN": "ذیابیطس اور شوگر",
      "en-IN": "Diabetes & Glycemia",
    },
    icon: "Activity",
  },
  {
    id: "genetics",
    label: "Genetics & DNA",
    nativeLabels: {
      "hi-IN": "आनुवंशिकी और डीएनए",
      "bn-IN": "জিনতত্ত্ব ও ডিএনএ",
      "ta-IN": "மரபியல் & டிஎன்ஏ",
      "te-IN": "జన్యుశాస్త్రం & DNA",
      "kn-IN": "ತಳಿಶಾಸ್ತ್ರ & DNA",
      "ml-IN": "ജനിതകശാസ്ത്രവും ഡിഎൻഎയും",
      "mr-IN": "जनुकशास्त्र आणि डीएनए",
      "gu-IN": "જનીનવિજ્ઞાન અને DNA",
      "pa-IN": "ਜੈਨੇਟਿਕਸ ਅਤੇ ਡੀਐਨਏ",
      "od-IN": "ଜିନେଟିକ୍ସ ଏବଂ DNA",
      "as-IN": "বংশগতিবিজ্ঞান আৰু DNA",
      "ur-IN": "جینیات اور ڈی این اے",
      "en-IN": "Genetics & DNA",
    },
    icon: "Dna",
  },
  {
    id: "labs",
    label: "Labs & Lipids",
    nativeLabels: {
      "hi-IN": "लैब और लिपिड प्रोफाइल",
      "bn-IN": "ল্যাব ও লিপিড প্রোফাইল",
      "ta-IN": "ஆய்வகம் & லிப்பிட்",
      "te-IN": "ల్యాబ్ & లిపిడ్స్",
      "kn-IN": "ಲ್ಯಾಬ್ & ಲಿಪಿಡ್ಸ್",
      "ml-IN": "ലാബ് ടെസ്റ്റുകളും കൊഴുപ്പും",
      "mr-IN": "लॅब आणि लिपिड प्रोफाइल",
      "gu-IN": "લેબ અને લિપિડ પ્રોફાઇલ",
      "pa-IN": "ਲੈਬ ਅਤੇ ਲਿਪਿਡ ਪ੍ਰੋਫਾਈਲ",
      "od-IN": "ଲାବ୍ ଏବଂ ଲିପିଡ୍",
      "as-IN": "পৰীক্ষাগাৰ আৰু লিপিড",
      "ur-IN": "لیب ٹیسٹ اور لپڈ",
      "en-IN": "Labs & Lipids",
    },
    icon: "FileText",
  },
  {
    id: "thyroid",
    label: "Thyroid & Renal",
    nativeLabels: {
      "hi-IN": "थायराइड और किडनी",
      "bn-IN": "থাইরয়েড ও কিডনি",
      "ta-IN": "தைராய்டு & சிறுநீரகம்",
      "te-IN": "థైరాయిడ్ & కిడ్నీ",
      "kn-IN": "ಥೈರಾಯ್ಡ್ & ಮೂತ್ರಪಿಂಡ",
      "ml-IN": "തൈറോയിഡും വൃക്കയും",
      "mr-IN": "थायरॉईड आणि मूत्रपिंड",
      "gu-IN": "થાઇરોઇડ અને કિડની",
      "pa-IN": "ਥਾਇਰਾਇਡ ਅਤੇ ਗੁਰਦੇ",
      "od-IN": "ଥାଇରଏଡ୍ ଏବଂ ବୃକ୍‌କ",
      "as-IN": "থাইৰয়ড আৰু বৃক্ক",
      "ur-IN": "تھائرائڈ اور گردے",
      "en-IN": "Thyroid & Renal",
    },
    icon: "Shield",
  },
  {
    id: "emergency",
    label: "Emergency 112",
    nativeLabels: {
      "hi-IN": "आपातकालीन 112",
      "bn-IN": "জরুরি ১১২",
      "ta-IN": "அவசரம் 112",
      "te-IN": "అత్యవసరం 112",
      "kn-IN": "ತುರ್ತು 112",
      "ml-IN": "അടിയന്തരം 112",
      "mr-IN": "आणीबाणी 112",
      "gu-IN": "કટોકટી 112",
      "pa-IN": "ਐਮਰਜੈਂਸੀ 112",
      "od-IN": "ଜରୁରୀକାଳୀନ ୧୧୨",
      "as-IN": "জৰুৰীকালীন ১১২",
      "ur-IN": "ہنگامی 112",
      "en-IN": "Emergency 112",
    },
    icon: "AlertTriangle",
  },
];

export const CLINICAL_VOICE_SUGGESTIONS: ClinicalSuggestionItem[] = [
  {
    id: "sug-bp",
    category: "cardiac",
    categoryLabel: "Cardiology",
    title: "Check ICU Vitals & BP",
    badge: "ICU Telemetry • 122/78 mmHg",
    iconName: "heart",
    translations: {
      "hi-IN": {
        native: "मेरा ब्लड प्रेशर (122/78 mmHg) और हृदय गति कैसी है?",
        romanized: "Mera blood pressure (122/78 mmHg) aur hriday gati kaisi hai?",
        english: "How are my blood pressure (122/78 mmHg) and heart rate readings?",
      },
      "bn-IN": {
        native: "আমার রক্তচাপ (১২২/৭৮ mmHg) এবং হৃদস্পন্দন কেমন আছে?",
        romanized: "Amar roktochap (122/78 mmHg) ebong hridspondon kemon ache?",
        english: "Explain my blood pressure (122/78 mmHg) and heart rate telemetry.",
      },
      "ta-IN": {
        native: "எனது இரத்த அழுத்தம் (122/78 mmHg) மற்றும் இதய துடிப்பு எப்படி உள்ளது?",
        romanized: "Enadhu iratha azhutham (122/78 mmHg) matrum idhaya thudippu eppadi ulladhu?",
        english: "How are my blood pressure (122/78 mmHg) and heart rate telemetry?",
      },
      "te-IN": {
        native: "నా రక్తపోటు (122/78 mmHg) మరియు గుండె కొట్టుకోవడం ఎలా ఉంది?",
        romanized: "Naa raktapotu (122/78 mmHg) mariyu gunde kottukovadam elaa undi?",
        english: "What does my blood pressure of 122/78 mmHg indicate?",
      },
      "kn-IN": {
        native: "ನನ್ನ ರಕ್ತದೊತ್ತಡ (122/78 mmHg) ಮತ್ತು ಹೃದಯ ಬಡಿತ ಹೇಗಿದೆ?",
        romanized: "Nanna raktadottada (122/78 mmHg) mattu hrudaya baditha hegide?",
        english: "Explain my blood pressure (122/78 mmHg) and heart rate.",
      },
      "ml-IN": {
        native: "എന്റെ രക്തസമ്മർദ്ദവും (122/78 mmHg) ഹൃദയമിടിപ്പും എങ്ങനെയുണ്ട്?",
        romanized: "Ente rakthasammardavum (122/78 mmHg) hrudayamidippum enganeyundu?",
        english: "Explain my blood pressure (122/78 mmHg) and cardiac pulse rate.",
      },
      "mr-IN": {
        native: "माझा रक्तदाब (122/78 mmHg) आणि हृदयाचे ठोके कसे आहेत?",
        romanized: "Maazha raktadaab (122/78 mmHg) aani hrudayache thoke kase aahet?",
        english: "How are my blood pressure (122/78 mmHg) and pulse rate?",
      },
      "gu-IN": {
        native: "મારું બ્લડ પ્રેશર (122/78 mmHg) અને હૃદયના ધબકારા કેવા છે?",
        romanized: "Maaru blood pressure (122/78 mmHg) ane hrudayna dhabkara keva chhe?",
        english: "What does my blood pressure of 122/78 mmHg indicate?",
      },
      "pa-IN": {
        native: "ਮੇਰਾ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ (122/78 mmHg) ਅਤੇ ਦਿਲ ਦੀ ਧੜਕਣ ਕਿਵੇਂ ਹੈ?",
        romanized: "Mera blood pressure (122/78 mmHg) ate dil di dhadkan kiven hai?",
        english: "Explain my blood pressure (122/78 mmHg) and cardiac telemetry.",
      },
      "od-IN": {
        native: "ମୋର ରକ୍ତଚାପ (୧୨୨/୭୮ mmHg) ଏବଂ ହୃଦସ୍ପନ୍ଦନ କିପରି ଅଛି?",
        romanized: "Mora raktachapa (122/78 mmHg) ebong hrudaspandana kipari achhi?",
        english: "How are my blood pressure and pulse vitals?",
      },
      "as-IN": {
        native: "মোৰ ৰক্তচাপ (১২২/৭৮ mmHg) আৰু হৃদস্পন্দন কেনেকুৱা আছে?",
        romanized: "Mor roktosap (122/78 mmHg) aru hridspondon kenekuwa ase?",
        english: "Explain my blood pressure and cardiac rhythm telemetry.",
      },
      "ur-IN": {
        native: "میرا بلڈ پریشر (122/78 mmHg) اور نبض کی رفتار کیسی ہے؟",
        romanized: "Mera blood pressure (122/78 mmHg) aur nabz ki raftaar kaisi hai?",
        english: "How are my blood pressure (122/78 mmHg) and pulse rate?",
      },
      "en-IN": {
        native: "Explain my ICU telemetry: Blood Pressure 122/78 mmHg and Heart Rate 72 bpm.",
        romanized: "Check ICU vitals and hemodynamic stability.",
        english: "Explain my ICU telemetry: Blood Pressure 122/78 mmHg and Heart Rate 72 bpm.",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "सिस्टोलिक BP का 90-दिन का वक्र", query: "सिस्टोलिक ब्लड प्रेशर का 90-दिन का Bi-LSTM अनुमान दिखाइए" },
        { title: "आदर्श पल्स रेट लक्ष्य", query: "विश्राम के समय सामान्य हृदय गति क्या होनी चाहिए?" },
        { title: "हाई BP के खतरे के संकेत", query: "हाई ब्लड प्रेशर के प्रमुख लक्षण क्या हैं?" },
      ],
      "ta-IN": [
        { title: "90 நாள் BP கணிப்பு", query: "சிஸ்டாலிக் இரத்த அழுத்தத்தின் 90 நாள் Bi-LSTM வளைவைக் காட்டுங்கள்" },
        { title: "இயல்பான இதய துடிப்பு", query: "ஓய்வு நேரத்தில் இயல்பான நாடித்துடிப்பு எவ்வளவு இருக்க வேண்டும்?" },
        { title: "இரத்த அழுத்த அறிகுறிகள்", query: "உயர் இரத்த அழுத்தத்தின் ஆபத்தான அறிகுறிகள் யாவை?" },
      ],
      "te-IN": [
        { title: "90 రోజుల BP సూచన", query: "సిస్టోలిక్ రక్తపోటు యొక్క 90 రోజుల Bi-LSTM సూచనను చూపించండి" },
        { title: "సాధారణ పల్స్ రేట్", query: "విశ్రాంతి సమయంలో సాధారణ హృదయ స్పందన రేటు ఎంత ఉండాలి?" },
        { title: "రక్తపోటు ప్రమాద సంకేతాలు", query: "అధిక రక్తపోటు యొక్క ముఖ్యమైన లక్షణాలు ఏమిటి?" },
      ],
      "bn-IN": [
        { title: "৯০ দিনের BP পূর্বাভাস", query: "সিস্টোলিক রক্তচাপের ৯০ দিনের Bi-LSTM পূর্বাভাস দেখান" },
        { title: "স্বাভাবিক হৃদস্পন্দন", query: "বিশ্রামের সময় সাধারণ পালস রেট কত হওয়া উচিত?" },
        { title: "উচ্চ রক্তচাপের লক্ষণ", query: "উচ্চ রক্তচাপের প্রধান সতর্কবার্তা কী কী?" },
      ],
      "en-IN": [
        { title: "90-Day BP Trajectory", query: "Show 90-day Bi-LSTM systolic BP velocity curve" },
        { title: "Resting Heart Rate Target", query: "What is my optimal resting heart rate range?" },
        { title: "Hypertension Guidelines", query: "What are AHA 2024 hypertension thresholds?" },
      ],
    },
  },
  {
    id: "sug-glucose",
    category: "diabetes",
    categoryLabel: "Diabetes",
    title: "Pre-Diabetes Glucose Range (114 mg/dL)",
    badge: "ADA 2024 • FPG 114 mg/dL",
    iconName: "activity",
    translations: {
      "hi-IN": {
        native: "क्या 114 mg/dL का फास्टिंग ब्लड ग्लूकोज प्री-डायबिटीज दर्शाता है?",
        romanized: "Kya 114 mg/dL ka fasting blood glucose pre-diabetes darshata hai?",
        english: "Is Fasting Blood Glucose of 114 mg/dL in the pre-diabetic range?",
      },
      "bn-IN": {
        native: "১১৪ mg/dL ফাস্টিং রক্তে শর্করার মাত্রা কি প্রি-ডায়াবেটিস নির্দেশ করে?",
        romanized: "114 mg/dL fasting rokte shorkorar matra ki pre-diabetes nirdesh kore?",
        english: "Does 114 mg/dL fasting blood glucose signify pre-diabetes?",
      },
      "ta-IN": {
        native: "114 mg/dL ஃபாஸ்டிங் குளுக்கோஸ் ப்ரீ-நீரிழிவு நிலையைக் குறிக்கிறதா?",
        romanized: "114 mg/dL fasting glucose pre-neerizhivu nilaiyai kurikkiradha?",
        english: "Is Fasting Blood Glucose of 114 mg/dL indicative of pre-diabetes?",
      },
      "te-IN": {
        native: "114 mg/dL ఫాస్టింగ్ గ్లూకోజ్ ప్రీ-డయాబెటిస్ అని సూచిస్తుందా?",
        romanized: "114 mg/dL fasting glucose pre-diabetes ani soochistundaa?",
        english: "Does Fasting Blood Glucose of 114 mg/dL mean pre-diabetes?",
      },
      "kn-IN": {
        native: "114 mg/dL ಉಪವಾಸ ಗ್ಲೂಕೋಸ್ ಪ್ರಿ-ಡಯಾಬಿಟಿಸ್ ಲಕ್ಷಣವೇ?",
        romanized: "114 mg/dL upavaasa glucose pre-diabetes lakshanave?",
        english: "Is Fasting Blood Glucose of 114 mg/dL pre-diabetic?",
      },
      "ml-IN": {
        native: "114 mg/dL ഫാസ്റ്റിംഗ് ഗ്ലൂക്കോസ് പ്രീ-ഡയബറ്റിക് ആണോ?",
        romanized: "114 mg/dL fasting glucose pre-diabetic aano?",
        english: "Is Fasting Blood Glucose of 114 mg/dL in the pre-diabetic range?",
      },
      "mr-IN": {
        native: "114 mg/dL फास्टिंग ब्लड ग्लुकोज प्री-डायबेटिस दर्शवते का?",
        romanized: "114 mg/dL fasting blood glucose pre-diabetes darshavate kaa?",
        english: "Does Fasting Blood Glucose of 114 mg/dL indicate pre-diabetes?",
      },
      "gu-IN": {
        native: "શું 114 mg/dL ફાસ્ટિંગ ગ્લુકોઝ પ્રી-ડાયાબિટીસ દર્શાવે છે?",
        romanized: "Shu 114 mg/dL fasting glucose pre-diabetes darshave chhe?",
        english: "Is Fasting Blood Glucose of 114 mg/dL considered pre-diabetes?",
      },
      "pa-IN": {
        native: "ਕੀ 114 mg/dL ਫਾਸਟਿੰਗ ਗਲੂਕੋਜ਼ ਪ੍ਰੀ-ਡਾਇਬੀਟੀਜ਼ ਦਾ ਸੰਕੇਤ ਹੈ?",
        romanized: "Ki 114 mg/dL fasting glucose pre-diabetes da sanket hai?",
        english: "Does 114 mg/dL Fasting Blood Glucose indicate pre-diabetes?",
      },
      "od-IN": {
        native: "୧୧୪ mg/dL ଫାଷ୍ଟିଂ ଗ୍ଲୁକୋଜ୍ କଣ ପ୍ରି-ଡାଇବେଟିସ୍ ଅଟେ?",
        romanized: "114 mg/dL fasting glucose kana pre-diabetes ate?",
        english: "Is Fasting Blood Glucose of 114 mg/dL pre-diabetic?",
      },
      "as-IN": {
        native: "১১৪ mg/dL উপবাসে থকা গ্লুকোজ প্ৰাক-মধুমেহ হয়নে?",
        romanized: "114 mg/dL upobashe thoka glucose prak-modhumeh hoyne?",
        english: "Does fasting blood glucose of 114 mg/dL mean pre-diabetes?",
      },
      "ur-IN": {
        native: "کیا 114 mg/dL فاسٹنگ گلوکوز پری ذیابیطس کی علامت ہے؟",
        romanized: "Kya 114 mg/dL fasting glucose pre-diabetes ki alamat hai?",
        english: "Is Fasting Blood Glucose of 114 mg/dL in the pre-diabetic range?",
      },
      "en-IN": {
        native: "Is Fasting Blood Glucose of 114 mg/dL considered pre-diabetic by ADA standards?",
        romanized: "Check pre-diabetes criteria and ADA 2024 glycemic guidelines.",
        english: "Is Fasting Blood Glucose of 114 mg/dL considered pre-diabetic by ADA standards?",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "HbA1c का 90-दिन का अनुमान", query: "HbA1c और ब्लड ग्लूकोज का Bi-LSTM 90-day forecast बताइए" },
        { title: "शुगर स्पाइक रोकने वाले आहार", query: "भोजन के बाद ब्लड शुगर को नियंत्रित रखने के उपाय क्या हैं?" },
        { title: "प्री-डायबिटीज रिवर्सल", query: "क्या जीवनशैली में बदलाव से प्री-डायबिटीज को ठीक किया जा सकता है?" },
      ],
      "ta-IN": [
        { title: "90 நாள் HbA1c கணிப்பு", query: "HbA1c அளவின் அடுத்த 90 நாள் Bi-LSTM கணிப்பை விளக்குங்கள்" },
        { title: "சர்க்கரை கட்டுப்பாடு உணவுகள்", query: "இரத்த சர்க்கரை அளவை குறைக்க என்ன உணவுகள் சாப்பிட வேண்டும்?" },
        { title: "ப்ரீ-நீரிழிவு மீட்பு", query: "ப்ரீ-நீரிழிவு நிலையை முற்றிலும் குணப்படுத்த முடியுமா?" },
      ],
      "te-IN": [
        { title: "90 రోజుల HbA1c సూచన", query: "HbA1c తదుపరి 90 రోజుల Bi-LSTM సూచనను చూపించండి" },
        { title: "చక్కెర నియంత్రణ ఆహారం", query: "రక్తంలో చక్కెర స్థాయిని తగ్గించడానికి ఏ ఆహారం తీసుకోవాలి?" },
        { title: "ప్రీ-డయాబెటిస్ నియంత్రణ", query: "ప్రీ-డయాబెటిస్‌ను జీవనశైలి మార్పులతో తిప్పికొట్టవచ్చా?" },
      ],
      "bn-IN": [
        { title: "৯০ দিনের HbA1c পূর্বাভাস", query: "HbA1c-এর পরবর্তী ৯০ দিনের Bi-LSTM পূর্বাভাস দেখান" },
        { title: "শর্করার মাত্রা কমানোর খাদ্য", query: "রক্তের শর্করা নিয়ন্ত্রণে রাখতে কোন খাদ্য উপযোগী?" },
        { title: "প্রি-ডায়াবেটিস নিরাময়", query: "জীবনযাত্রার পরিবর্তনে প্রি-ডায়াবেটিস নিয়ন্ত্রণ সম্ভব কি?" },
      ],
      "en-IN": [
        { title: "90-Day HbA1c Forecast", query: "HbA1c aur blood glucose ka Bi-LSTM 90-day forecast bataiye" },
        { title: "Preventing Glucose Spikes", query: "What nutrition strategies prevent postprandial glycemic spikes?" },
        { title: "Pre-Diabetes Reversal", query: "Can ADA pre-diabetes be reversed through clinical lifestyle interventions?" },
      ],
    },
  },
  {
    id: "sug-lstm-hba1c",
    category: "diabetes",
    categoryLabel: "Bi-LSTM Velocity",
    title: "Bi-LSTM 90d HbA1c Velocity",
    badge: "Bi-LSTM Engine • AUC 0.941",
    iconName: "activity",
    translations: {
      "hi-IN": {
        native: "HbA1c और ब्लड ग्लूकोज का Bi-LSTM 90-दिन का पूर्वानुमान बताइए",
        romanized: "HbA1c aur blood glucose ka Bi-LSTM 90-day forecast bataiye",
        english: "Explain the Bi-LSTM 90-day HbA1c and glucose trajectory forecast.",
      },
      "bn-IN": {
        native: "HbA1c এবং রক্তে শর্করার ৯০ দিনের Bi-LSTM পূর্বাভাস দেখান",
        romanized: "HbA1c ebong rokte shorkorar 90 diner Bi-LSTM purbabhash dekhan",
        english: "Show the 90-day Bi-LSTM HbA1c trajectory forecast.",
      },
      "ta-IN": {
        native: "HbA1c அளவின் அடுத்த 90 நாள் Bi-LSTM கணிப்பை விளக்குங்கள்",
        romanized: "HbA1c alavin adutha 90 naal Bi-LSTM kanippai vilakkungal",
        english: "Explain the 90-day Bi-LSTM forecast for HbA1c and glucose.",
      },
      "te-IN": {
        native: "HbA1c మరియు రక్తంలో గ్లూకోజ్ యొక్క 90 రోజుల Bi-LSTM సూచనను చూపించండి",
        romanized: "HbA1c mariyu raktamlo glucose yokka 90 rojula Bi-LSTM soochananu choopinchandi",
        english: "Show my 90-day Bi-LSTM HbA1c trajectory forecast.",
      },
      "kn-IN": {
        native: "ಮುಂದಿನ 90 ದಿನಗಳ HbA1c Bi-LSTM ಮುನ್ಸೂಚನೆಯನ್ನು ನೀಡಿ",
        romanized: "Mundina 90 dinagala HbA1c Bi-LSTM munsoochaneyannu needi",
        english: "Provide the 90-day Bi-LSTM HbA1c forecast.",
      },
      "ml-IN": {
        native: "HbA1c അടുത്ത 90 ദിവസത്തെ Bi-LSTM പ്രവചനം കാണിക്കുക",
        romanized: "HbA1c adutha 90 divasathe Bi-LSTM pravachanam kaanikkuka",
        english: "Show my 90-day Bi-LSTM HbA1c forecast.",
      },
      "mr-IN": {
        native: "पुढील ९० दिवसांचा HbA1c Bi-LSTM अंदाज स्पष्ट करा",
        romanized: "Pudhil 90 divasancha HbA1c Bi-LSTM andaaz spashta kara",
        english: "Explain the 90-day Bi-LSTM HbA1c forecast.",
      },
      "gu-IN": {
        native: "આગામી 90 દિવસ માટે HbA1c Bi-LSTM આગાહી જણાવો",
        romanized: "Aagaami 90 divas maate HbA1c Bi-LSTM aagahi janavo",
        english: "Provide the 90-day Bi-LSTM HbA1c projection.",
      },
      "pa-IN": {
        native: "ਅਗਲੇ 90 ਦਿਨਾਂ ਦਾ HbA1c Bi-LSTM ਅਨੁਮਾਨ ਦਿਖਾਓ",
        romanized: "Agle 90 dinaan da HbA1c Bi-LSTM anuman dikhao",
        english: "Show the 90-day Bi-LSTM HbA1c trajectory.",
      },
      "od-IN": {
        native: "ଆଗାମୀ ୯୦ ଦିନ ପାଇଁ HbA1c Bi-LSTM ପୂର୍ବାନୁମାନ ଦେଖାନ୍ତୁ",
        romanized: "Aagami 90 dina pain HbA1c Bi-LSTM purbanumana dekhantu",
        english: "Show the 90-day Bi-LSTM HbA1c forecast.",
      },
      "as-IN": {
        native: "পৰৱৰ্তী ৯০ দিনৰ বাবে HbA1c Bi-LSTM ভৱিষ্যদ্বাণী দেখুৱাওক",
        romanized: "Poroborti 90 dinor babe HbA1c Bi-LSTM bhobishyodbani dekhuwaok",
        english: "Show the 90-day Bi-LSTM HbA1c forecast.",
      },
      "ur-IN": {
        native: "اگلے 90 دنوں کے لیے HbA1c کی Bi-LSTM پیشین گوئی بتائیں",
        romanized: "Agle 90 dino ke liye HbA1c ki Bi-LSTM pesheen goi batayein",
        english: "Tell me the 90-day Bi-LSTM forecast for HbA1c.",
      },
      "en-IN": {
        native: "Show my 90-day Bi-LSTM HbA1c velocity and projected glycemic trajectory.",
        romanized: "Compute LSTM gate weights and projected delta per month.",
        english: "Show my 90-day Bi-LSTM HbA1c velocity and projected glycemic trajectory.",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "HbA1c वेग दर का अर्थ", query: "+0.04% प्रति माह के वेग का क्या प्रभाव होगा?" },
        { title: "इंसुलिन संवेदनशीलता", query: "इंसुलिन संवेदनशीलता को कैसे बेहतर किया जा सकता है?" },
        { title: "री-टेस्ट की अनुशंसित तारीख", query: "अगला HbA1c टेस्ट कब कराना चाहिए?" },
      ],
      "en-IN": [
        { title: "Velocity Rate Meaning", query: "What does an HbA1c velocity of +0.04%/month indicate clinically?" },
        { title: "Insulin Sensitivity", query: "How can I improve my peripheral insulin sensitivity?" },
        { title: "Next Lab Timeline", query: "What is the recommended interval for follow-up HbA1c testing?" },
      ],
    },
  },
  {
    id: "sug-cbc-lipids",
    category: "labs",
    categoryLabel: "Blood & Lipids",
    title: "Explain Blood Report (CBC & Lipids)",
    badge: "CBC & Lipid Panel • Hemoglobin 14.2",
    iconName: "flask",
    translations: {
      "hi-IN": {
        native: "कृपया मेरी ब्लड रिपोर्ट समझाएं (CBC, हीमोग्लोबिन और लिपिड प्रोफाइल)",
        romanized: "Kripya meri blood report samjhayein (CBC, hemoglobin aur lipid profile)",
        english: "Please explain my blood report (CBC, hemoglobin, and lipid profile).",
      },
      "bn-IN": {
        native: "আমার রক্তের রিপোর্ট (CBC, হিমোগ্লোবিন এবং লিপিড প্রোফাইল) ব্যাখ্যা করুন",
        romanized: "Amar rokter report (CBC, hemoglobin ebong lipid profile) byakhya korun",
        english: "Explain my Complete Blood Count and Lipid Profile results.",
      },
      "ta-IN": {
        native: "எனது இரத்த பரிசோதனை அறிக்கை (CBC, ஹீமோகுளோபின், லிப்பிட்) பற்றி விளக்குங்கள்",
        romanized: "Enadhu iratha parisodhana arikkai (CBC, hemoglobin, lipid) patri vilakkungal",
        english: "Please explain my Complete Blood Count and Lipid Profile report.",
      },
      "te-IN": {
        native: "నా రక్త నివేదిక (CBC, హిమోగ్లోబిన్ మరియు లిపిడ్ ప్రొఫైల్) వివరించండి",
        romanized: "Naa rakta nivedika (CBC, hemoglobin mariyu lipid profile) vivarinchandi",
        english: "Explain my Complete Blood Count and Lipid Profile findings.",
      },
      "kn-IN": {
        native: "ನನ್ನ ರಕ್ತ ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು (CBC, ಹಿಮೋಗ್ಲೋಬಿನ್ ಮತ್ತು ಲಿಪಿಡ್) ವಿವರಿಸಿ",
        romanized: "Nanna rakta pareeksha varadiyannu (CBC, hemoglobin mattu lipid) vivarisi",
        english: "Explain my CBC and Lipid Profile lab report.",
      },
      "ml-IN": {
        native: "എന്റെ രക്ത പരിശോധനാ റിപ്പോർട്ട് (CBC, ഹീമോഗ്ലോബിൻ, ലിപിഡ്) വിശദീകരിക്കുക",
        romanized: "Ente raktha parishodhana report (CBC, hemoglobin, lipid) vishadheekarikkuka",
        english: "Explain my Complete Blood Count and Lipid Profile.",
      },
      "mr-IN": {
        native: "कृपया माझे रक्त अहवाल (CBC, हिमोग्लोबिन आणि लिपिड प्रोफाइल) स्पष्ट करा",
        romanized: "Krupaya maajhe rakta ahvaal (CBC, hemoglobin aani lipid profile) spashta kara",
        english: "Please explain my blood report (CBC and lipid profile).",
      },
      "gu-IN": {
        native: "કૃપા કરીને મારો બ્લડ રિપોર્ટ (CBC, હિમોગ્લોબિન અને લિપિડ પ્રોફાઇલ) સમજાવો",
        romanized: "Krupa karine maaro blood report (CBC, hemoglobin ane lipid profile) samjaavo",
        english: "Explain my blood report including CBC and lipids.",
      },
      "pa-IN": {
        native: "ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਖੂਨ ਦੀ ਰਿਪੋਰਟ (CBC, ਹੀਮੋਗਲੋਬਿਨ ਅਤੇ ਲਿਪਿਡ) ਸਮਝਾਓ",
        romanized: "Kirpa karke meri khoon di report (CBC, hemoglobin ate lipid) samjhao",
        english: "Explain my CBC and lipid panel report.",
      },
      "od-IN": {
        native: "ଦୟାକରି ମୋର ରକ୍ତ ରିପୋର୍ଟ (CBC, ହିମୋଗ୍ଲୋବିନ ଏବଂ ଲିପିଡ ପ୍ରୋଫାଇଲ) ବୁଝାନ୍ତୁ",
        romanized: "Dayakari mora rakta report (CBC, hemoglobin ebong lipid profile) bujhantu",
        english: "Please explain my blood report (CBC and lipid profile).",
      },
      "as-IN": {
        native: "অনুগ্ৰহ কৰি মোৰ তেজৰ ৰিপোৰ্ট (CBC, হিম'গ্লবিন আৰু লিপিড) বুজাই দিয়ক",
        romanized: "Onugroh kori mor tezor report (CBC, hemoglobin aru lipid) bujai diyok",
        english: "Explain my Complete Blood Count and lipid profile.",
      },
      "ur-IN": {
        native: "براہ کرم میری خون کی رپورٹ (سی بی سی، ہیموگلوبن اور لپڈ پروفائل) سمجھائیں",
        romanized: "Barah-e-karam meri khoon ki report (CBC, hemoglobin aur lipid profile) samjhayein",
        english: "Please explain my CBC and lipid panel report.",
      },
      "en-IN": {
        native: "Explain my blood report: Hemoglobin 14.2 g/dL, Platelets 240k, LDL 112 mg/dL, and ApoB.",
        romanized: "Review complete hematological and cardiovascular lipid biomarkers.",
        english: "Explain my blood report: Hemoglobin 14.2 g/dL, Platelets 240k, LDL 112 mg/dL, and ApoB.",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "ApoB बनाम LDL जोखिम", query: "ApoB और LDL कोलेस्ट्रॉल में क्या अंतर है?" },
        { title: "हीमोग्लोबिन स्तर", query: "14.2 g/dL हीमोग्लोबिन के लिए स्वास्थ्य सुझाव क्या हैं?" },
        { title: "हृदय सुरक्षा आहार", query: "लिपिड प्रोफाइल सुधारने के लिए कौन से खाद्य पदार्थ अच्छे हैं?" },
      ],
      "en-IN": [
        { title: "ApoB vs LDL Risk", query: "What does elevated ApoB indicate compared to standard LDL?" },
        { title: "Hemoglobin Evaluation", query: "Is Hemoglobin 14.2 g/dL optimal for adult males?" },
        { title: "Lipid Optimization", query: "What dietary changes reduce atherogenic particle count?" },
      ],
    },
  },
  {
    id: "sug-marfan",
    category: "genetics",
    categoryLabel: "Genetics",
    title: "Marfan FBN1 Autosomal Dominant Pattern",
    badge: "ClinVar • Autosomal Dominant 50%",
    iconName: "dna",
    translations: {
      "hi-IN": {
        native: "मार्फन सिंड्रोम FBN1 ऑटोसोमल डोमिनेंट आनुवंशिकी समझाइए",
        romanized: "Marfan syndrome FBN1 autosomal dominant aanuvanshikta samjhayein",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant inheritance pattern.",
      },
      "bn-IN": {
        native: "মারফান সিন্ড্রোম FBN1 অটোসোমাল প্রকট বংশগতি ব্যাখ্যা করুন",
        romanized: "Marfan syndrome FBN1 autosomal prokot bongshogoti byakhya korun",
        english: "Explain the autosomal dominant inheritance of Marfan syndrome FBN1.",
      },
      "ta-IN": {
        native: "மார்ஃபன் சிண்ட்ரோம் FBN1 மரபணு கடத்தல் முறையை விளக்குங்கள்",
        romanized: "Marfan syndrome FBN1 marabanu kadathal muraiyai vilakkungal",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant transmission.",
      },
      "te-IN": {
        native: "మార్ఫాన్ సిండ్రోమ్ FBN1 జన్యు సంక్రమణ విధానాన్ని వివరించండి",
        romanized: "Marfan syndrome FBN1 janyu sankramana vidhananni vivarinchandi",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant inheritance pattern.",
      },
      "kn-IN": {
        native: "ಮಾರ್ಫನ್ ಸಿಂಡ್ರೋಮ್ FBN1 ಆಟೋಸೋಮಲ್ ಪ್ರಬಲ ಅನುವಂಶಿಕತೆಯನ್ನು ವಿವರಿಸಿ",
        romanized: "Marfan syndrome FBN1 autosomal prabala anuvanshikateyannu vivarisi",
        english: "Explain Marfan syndrome FBN1 autosomal dominant pattern.",
      },
      "ml-IN": {
        native: "മാർഫൻ സിൻഡ്രോം FBN1 ഓട്ടോസോമൽ ഡോമിനന്റ് പാരമ്പര്യം വിശദീകരിക്കുക",
        romanized: "Marfan syndrome FBN1 autosomal dominant paarambaryam vishadheekarikkuka",
        english: "Explain Marfan syndrome FBN1 autosomal dominant inheritance.",
      },
      "mr-IN": {
        native: "मार्फान सिंड्रोम FBN1 ऑटोसोमल डॉमिनंट वारसा स्पष्ट करा",
        romanized: "Marfan syndrome FBN1 autosomal dominant vaarsa spashta kara",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant inheritance.",
      },
      "gu-IN": {
        native: "માર્ફન સિન્ડ્રોમ FBN1 ઓટોસોમલ પ્રભાવશાળી આનુવંશિકતા સમજાવો",
        romanized: "Marfan syndrome FBN1 autosomal prabhavshaali aanuvanshikta samjaavo",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant inheritance.",
      },
      "pa-IN": {
        native: "ਮਾਰਫਨ ਸਿੰਡਰੋਮ FBN1 ਆਟੋਸੋਮਲ ਡੋਮੀਨੈਂਟ ਵਿਰਾਸਤ ਸਮਝਾਓ",
        romanized: "Marfan syndrome FBN1 autosomal dominant virasat samjhao",
        english: "Explain Marfan syndrome FBN1 autosomal dominant inheritance.",
      },
      "od-IN": {
        native: "ମାର୍ଫାନ୍ ସିଣ୍ଡ୍ରୋମ୍ FBN1 ଅଟୋସୋମାଲ୍ ପ୍ରଭାବୀ ବଂଶାନୁକ୍ରମ ବୁଝାନ୍ତୁ",
        romanized: "Marfan syndrome FBN1 autosomal prabhavi banshanukrama bujhantu",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant pattern.",
      },
      "as-IN": {
        native: "মাৰ্ফান চিন্ড্ৰম FBN1 অট’ছ’মেল ডমিনেন্ট উত্তৰাধিকাৰ বুজাই দিয়ক",
        romanized: "Marfan syndrome FBN1 autosomal dominant uttoradhikar bujai diyok",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant inheritance.",
      },
      "ur-IN": {
        native: "مارفن سنڈروم FBN1 آٹوسومل غالب موروثیت کی وضاحت کریں",
        romanized: "Marfan syndrome FBN1 autosomal ghalib morosiyat ki wazahat karein",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant pattern.",
      },
      "en-IN": {
        native: "Explain Marfan Syndrome FBN1 autosomal dominant inheritance and transmission risk.",
        romanized: "Assess 50% child inheritance probability and aortic root surveillance.",
        english: "Explain Marfan Syndrome FBN1 autosomal dominant inheritance and transmission risk.",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "बच्चों में संचरण जोखिम", query: "अगली पीढ़ी में FBN1 म्यूटेशन के संचरण की क्या संभावना है?" },
        { title: "महाधमनी निगरानी", query: "मार्फन सिंड्रोम में इकोकार्डियोग्राम जांच कब करानी चाहिए?" },
        { title: "आनुवंशिक परामर्श", query: "क्या परिवार के अन्य सदस्यों को जेनेटिक टेस्टिंग करानी चाहिए?" },
      ],
      "en-IN": [
        { title: "Transmission Probability", query: "What is the 50% transmission probability to offspring in FBN1 mutations?" },
        { title: "Aortic Surveillance", query: "What are the recommended echocardiogram intervals for Marfan patients?" },
        { title: "Cascade Genetic Testing", query: "Should first-degree relatives undergo cascade genetic sequencing?" },
      ],
    },
  },
  {
    id: "sug-thyroid",
    category: "thyroid",
    categoryLabel: "Thyroid & Renal",
    title: "Thyroid TSH Axis & Free T4 (TSH 4.9)",
    badge: "ATA 2024 • TSH 4.9 mIU/L",
    iconName: "shield",
    translations: {
      "hi-IN": {
        native: "क्या TSH 4.9 mIU/L सबक्लिनिकल हाइपोथायरायडिज्म का संकेत है?",
        romanized: "Kya TSH 4.9 mIU/L subclinical hypothyroidism ka sanket hai?",
        english: "Does TSH 4.9 mIU/L indicate subclinical hypothyroidism?",
      },
      "bn-IN": {
        native: "TSH ৪.৯ mIU/L কি সাবক্লিনিকাল থাইরয়েডের ইঙ্গিত দেয়?",
        romanized: "TSH 4.9 mIU/L ki subclinical thyroid-er ingit dey?",
        english: "What does elevated TSH (4.9 mIU/L) indicate for subclinical thyroid?",
      },
      "ta-IN": {
        native: "TSH 4.9 mIU/L சப்-கிளினிக்கல் தைராய்டு பாதிப்பைக் குறிக்கிறதா?",
        romanized: "TSH 4.9 mIU/L sub-clinical thyroid paadhippai kurikkiradha?",
        english: "Does TSH 4.9 mIU/L suggest subclinical hypothyroidism?",
      },
      "te-IN": {
        native: "TSH 4.9 mIU/L సబ్‌క్లినికల్ థైరాయిడ్ అని సూచిస్తుందా?",
        romanized: "TSH 4.9 mIU/L subclinical thyroid ani soochistundaa?",
        english: "Does elevated TSH 4.9 mIU/L indicate subclinical hypothyroidism?",
      },
      "kn-IN": {
        native: "TSH 4.9 mIU/L ಸಬ್‌ಕ್ಲಿನಿಕಲ್ ಥೈರಾಯ್ಡ್ ಸೂಚಕವೇ?",
        romanized: "TSH 4.9 mIU/L subclinical thyroid soochakave?",
        english: "What does elevated TSH (4.9 mIU/L) indicate?",
      },
      "ml-IN": {
        native: "TSH 4.9 mIU/L സബ്ക്ലിനിക്കൽ തൈറോയ്ഡ് ലക്ഷണമാണോ?",
        romanized: "TSH 4.9 mIU/L subclinical thyroid lakshanamaano?",
        english: "Does TSH 4.9 mIU/L indicate subclinical thyroid?",
      },
      "mr-IN": {
        native: "TSH 4.9 mIU/L सबक्लिनिकल थायरॉईड दर्शवतो का?",
        romanized: "TSH 4.9 mIU/L subclinical thyroid darshavato kaa?",
        english: "Does TSH 4.9 mIU/L indicate subclinical thyroid disorder?",
      },
      "gu-IN": {
        native: "શું TSH 4.9 mIU/L સબક્લિનિકલ થાઇરોઇડ દર્શાવે છે?",
        romanized: "Shu TSH 4.9 mIU/L subclinical thyroid darshave chhe?",
        english: "Does TSH 4.9 mIU/L suggest subclinical thyroid?",
      },
      "pa-IN": {
        native: "ਕੀ TSH 4.9 mIU/L ਸਬਕਲੀਨਿਕਲ ਥਾਇਰਾਇਡ ਦਾ ਸੰਕੇਤ ਹੈ?",
        romanized: "Ki TSH 4.9 mIU/L subclinical thyroid da sanket hai?",
        english: "Does TSH 4.9 mIU/L indicate subclinical hypothyroidism?",
      },
      "od-IN": {
        native: "TSH ୪.୯ mIU/L କଣ ସବକ୍ଲିନିକାଲ୍ ଥାଇରଏଡ୍ ସୂଚାଉଛି?",
        romanized: "TSH 4.9 mIU/L kana subclinical thyroid suchauchi?",
        english: "What does elevated TSH (4.9 mIU/L) signify?",
      },
      "as-IN": {
        native: "TSH ৪.৯ mIU/L উপ-ক্লিনিকীয় থাইৰয়ডৰ সংকেত নেকি?",
        romanized: "TSH 4.9 mIU/L upo-klinikiya thyroid-or songket neki?",
        english: "Does elevated TSH 4.9 indicate subclinical thyroid?",
      },
      "ur-IN": {
        native: "کیا TSH 4.9 mIU/L ذیلی کلینیکل تھائرائڈ کی نشاندہی کرتا ہے؟",
        romanized: "Kya TSH 4.9 mIU/L zeli clinical thyroid ki nishandehi karta hai?",
        english: "What does elevated TSH (4.9 mIU/L) indicate?",
      },
      "en-IN": {
        native: "What does elevated TSH (4.9 mIU/L) with normal Free T4 indicate under ATA guidelines?",
        romanized: "Review subclinical hypothyroidism criteria and anti-TPO antibody significance.",
        english: "What does elevated TSH (4.9 mIU/L) with normal Free T4 indicate under ATA guidelines?",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "Anti-TPO एंटीबॉडी परीक्षण", query: "क्या थायराइड के लिए Anti-TPO एंटीबॉडी टेस्ट जरूरी है?" },
        { title: "थायराइड के लक्षण", query: "सबक्लिनिकल थायराइड के प्रमुख लक्षण क्या हैं?" },
        { title: "री-टेस्ट की समयसीमा", query: "TSH का दोबारा टेस्ट कितने महीनों बाद कराना चाहिए?" },
      ],
      "en-IN": [
        { title: "Anti-TPO Significance", query: "Should I get Anti-TPO antibodies tested to rule out Hashimoto's?" },
        { title: "Symptom Correlation", query: "What symptoms commonly manifest with early TSH elevation?" },
        { title: "Monitoring Timeline", query: "When should TSH and Free T4 be re-evaluated under ATA guidelines?" },
      ],
    },
  },
  {
    id: "sug-emergency",
    category: "emergency",
    categoryLabel: "Emergency",
    title: "Emergency Red-Flag Sim (Chest Pain)",
    badge: "STAT Triage • Protocol 112/108",
    iconName: "alert",
    translations: {
      "hi-IN": {
        native: "मुझे छाती में तेज दर्द और सांस लेने में तकलीफ हो रही है",
        romanized: "Mujhe chhati me tej dard aur saans lene me takleef ho rahi hai",
        english: "I am experiencing severe chest pain and difficulty breathing.",
      },
      "bn-IN": {
        native: "আমার বুকে তীব্র ব্যথা এবং শ্বাসকষ্ট হচ্ছে",
        romanized: "Amar buke tibro byatha ebong shwaskoshto hocche",
        english: "I am having severe chest pain and shortness of breath.",
      },
      "ta-IN": {
        native: "எனக்கு நெஞ்சு வலி மற்றும் மூச்சுத் திணறல் அதிகமாக உள்ளது",
        romanized: "Enakku nenju vali matrum moochu thinaral adhigaamaaga ulladhu",
        english: "I have severe chest pain and shortness of breath.",
      },
      "te-IN": {
        native: "నాకు గుండెలో తీవ్రమైన నొప్పి మరియు శ్వాస తీసుకోవడంలో ఇబ్బందిగా ఉంది",
        romanized: "Naaku gundelo teevramaina noppi mariyu shwaasa teesukovadamlo ibbandigaa undi",
        english: "I have severe crushing chest pain and shortness of breath.",
      },
      "kn-IN": {
        native: "ನನಗೆ ಎದೆಯಲ್ಲಿ ತೀವ್ರ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ",
        romanized: "Nanage edeyalli teevra novu mattu usiraatada tondare ide",
        english: "I am experiencing severe chest pain and breathing distress.",
      },
      "ml-IN": {
        native: "എനിക്ക് കഠിനമായ നെഞ്ചുവേദനയും ശ്വാസതടസ്സവുമുണ്ട്",
        romanized: "Enikku kadinamaaya nenjuvedanayum shwaasathadassavumundu",
        english: "I have acute crushing chest pain and shortness of breath.",
      },
      "mr-IN": {
        native: "माझ्या छातीत तीव्र वेदना आणि श्वास घेण्यास त्रास होत आहे",
        romanized: "Maajhya chhateet teevra vedna aani shwas ghenyas traas hot aahe",
        english: "I have severe chest pain and difficulty breathing.",
      },
      "gu-IN": {
        native: "મને છાતીમાં તીવ્ર દુખાવો અને શ્વાસ લેવામાં તકલીફ છે",
        romanized: "Mane chhati maa teevra dukhaavo ane shwaas levama takleef chhe",
        english: "I am having acute crushing chest pain and dyspnea.",
      },
      "pa-IN": {
        native: "ਮੇਰੀ ਛਾਤੀ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ ਅਤੇ ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼ ਹੈ",
        romanized: "Meri chhati vich tej dard ate saah lain vich takleef hai",
        english: "I have severe chest pain and breathing difficulty.",
      },
      "od-IN": {
        native: "ମୋ ଛାତିରେ ପ୍ରବଳ ଯନ୍ତ୍ରଣା ଏବଂ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ହେଉଛି",
        romanized: "Mo chhatire prabala jantrana ebong niswasa nebare kasta heuchi",
        english: "I have severe chest pain and shortness of breath.",
      },
      "as-IN": {
        native: "মোৰ বুকুত তীব্ৰ বিষ আৰু উশাহ লোৱাত কষ্ট হৈছে",
        romanized: "Mor bukut tibro bikh aru uhah lowat kosto hoise",
        english: "I am experiencing severe chest pain and shortness of breath.",
      },
      "ur-IN": {
        native: "مجھے سینے میں شدید درد اور سانس لینے میں دشواری ہو رہی ہے",
        romanized: "Mujhe seeney mein shadeed dard aur saans lene mein dushwari ho rahi hai",
        english: "I am experiencing acute chest pain and shortness of breath.",
      },
      "en-IN": {
        native: "I have sudden severe crushing chest pain, diaphoresis, and shortness of breath.",
        romanized: "Emergency red-flag protocol triage trigger.",
        english: "I have sudden severe crushing chest pain, diaphoresis, and shortness of breath.",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "आपातकालीन नंबर डायल करें", query: "कृपया तुरंत 112 या 108 डायल करें" },
        { title: "प्राथमिक चिकित्सा निर्देश", query: "एम्बुलेंस आने तक क्या प्राथमिक सावधानियां बरतें?" },
      ],
      "en-IN": [
        { title: "Dial Emergency 112/108", query: "Dial 112 or 108 immediately for cardiac evaluation" },
        { title: "First Aid Protocol", query: "What first-aid actions should be taken while awaiting paramedics?" },
      ],
    },
  },
  {
    id: "sug-thalassemia",
    category: "genetics",
    categoryLabel: "Carrier Genetics",
    title: "Beta-Thalassemia & Sickle Cell Carrier",
    badge: "Carrier Screening • HBB Gene",
    iconName: "dna",
    translations: {
      "hi-IN": {
        native: "थैलेसीमिया और सिकल सेल एचबीबी जीन वाहक जांच समझाइए",
        romanized: "Thalassemia aur sickle cell HBB carrier screening samjhayein",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "bn-IN": {
        native: "থ্যালাসেমিয়া এবং সিকেল সেল HBB বাহক স্ক্রীনিং ব্যাখ্যা করুন",
        romanized: "Thalassemia ebong sickle cell HBB carrier screening byakhya korun",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "ta-IN": {
        native: "தலசீமியா மற்றும் அரிவாள் செல் HBB கேரியர் பரிசோதனையை விளக்குங்கள்",
        romanized: "Thalassemia matrum sickle cell HBB carrier parisodhanaiyai vilakkungal",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "te-IN": {
        native: "తలసేమియా మరియు సికిల్ సెల్ HBB క్యారియర్ స్క్రీనింగ్ వివరించండి",
        romanized: "Thalassemia mariyu sickle cell HBB carrier screening vivarinchandi",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "kn-IN": {
        native: "ಥಲಸ್ಸೆಮಿಯಾ ಮತ್ತು ಸಿಕಲ್ ಸೆಲ್ HBB ಕ್ಯಾರಿಯರ್ ಸ್ಕ್ರೀನಿಂಗ್ ವಿವರಿಸಿ",
        romanized: "Thalassemia mattu sickle cell HBB carrier screening vivarisi",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "ml-IN": {
        native: "തലാസീമിയ, സിക്കിൾ സെൽ HBB കാരിയർ സ്ക്രീനിംഗ് വിശദീകരിക്കുക",
        romanized: "Thalassemia, sickle cell HBB carrier screening vishadheekarikkuka",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "mr-IN": {
        native: "थॅलेसेमिया आणि सिकल सेल HBB वाहक तपासणी स्पष्ट करा",
        romanized: "Thalassemia aani sickle cell HBB carrier screening spashta kara",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "gu-IN": {
        native: "થેલેસેમિયા અને સિકલ સેલ HBB વાહક સ્ક્રીનીંગ સમજાવો",
        romanized: "Thalassemia ane sickle cell HBB carrier screening samjaavo",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "pa-IN": {
        native: "ਥੈਲੇਸੀਮੀਆ ਅਤੇ ਸਿਕਲ ਸੈੱਲ HBB ਵਾਹਕ ਸਕ੍ਰੀਨਿੰਗ ਸਮਝਾਓ",
        romanized: "Thalassemia ate sickle cell HBB carrier screening samjhao",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "od-IN": {
        native: "ଥାଲାସେମିଆ ଏବଂ ସିକଲ୍ ସେଲ୍ HBB ବାହକ ସ୍କ୍ରିନିଂ ବୁଝାନ୍ତୁ",
        romanized: "Thalassemia ebong sickle cell HBB carrier screening bujhantu",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "as-IN": {
        native: "থেলাছেমিয়া আৰু চিকল চেল HBB বাহক পৰীক্ষা বুজাই দিয়ক",
        romanized: "Thalassemia aru sickle cell HBB carrier screening bujai diyok",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "ur-IN": {
        native: "تھیلیسیمیا اور سکیل سیل HBB کیریئر اسکریننگ کی وضاحت کریں",
        romanized: "Thalassemia aur sickle cell HBB carrier screening ki wazahat karein",
        english: "Explain Beta-Thalassemia and Sickle Cell HBB carrier screening.",
      },
      "en-IN": {
        native: "Explain Beta-Thalassemia and Sickle Cell trait carrier risks for HBB variants.",
        romanized: "Autosomal recessive 25% homozygous transmission analysis.",
        english: "Explain Beta-Thalassemia and Sickle Cell trait carrier risks for HBB variants.",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "HPLC हीमोग्लोबिन टेस्ट", query: "क्या शादी से पहले HPLC थैलेसीमिया टेस्ट जरूरी है?" },
        { title: "सिकल सेल लक्षण", query: "सिकल सेल वाहक में क्या लक्षण दिखाई देते हैं?" },
      ],
      "en-IN": [
        { title: "Pre-Marital HPLC Screen", query: "Why is HPLC hemoglobin variant analysis essential before marriage?" },
        { title: "Homozygous Transmission", query: "What are the odds of thalassemia major if both parents are carriers?" },
      ],
    },
  },
  {
    id: "sug-brca",
    category: "genetics",
    categoryLabel: "Oncogenetics",
    title: "BRCA1 & BRCA2 Hereditary Cancer Risk",
    badge: "Hereditary Cancer • NCCN Guidelines",
    iconName: "dna",
    translations: {
      "hi-IN": {
        native: "BRCA1 और BRCA2 आनुवंशिक कैंसर जोखिम और जांच के नियम समझाइए",
        romanized: "BRCA1 aur BRCA2 anuvanshik cancer jokhim aur screening niyam samjhayein",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening protocols.",
      },
      "bn-IN": {
        native: "BRCA1 এবং BRCA2 বংশগত ক্যান্সারের ঝুঁকি এবং স্ক্রীনিং প্রোটোকল ব্যাখ্যা করুন",
        romanized: "BRCA1 ebong BRCA2 bongshogoto cancer er jhuki byakhya korun",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening.",
      },
      "ta-IN": {
        native: "BRCA1 மற்றும் BRCA2 பரம்பரை புற்றுநோய் ஆபத்து மற்றும் பரிசோதனை நெறிமுறைகளை விளக்குங்கள்",
        romanized: "BRCA1 matrum BRCA2 parambarai puttrunoi aabathu matrum parisodhanai vilakkungal",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and surveillance.",
      },
      "te-IN": {
        native: "BRCA1 మరియు BRCA2 వంశపారంపర్య క్యాన్సర్ ప్రమాదం మరియు స్క్రీనింగ్ మార్గదర్శకాలను వివరించండి",
        romanized: "BRCA1 mariyu BRCA2 vamshaparamparya cancer pramadam vivarinchandi",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and protocols.",
      },
      "kn-IN": {
        native: "BRCA1 ಮತ್ತು BRCA2 ಅನುವಂಶಿಕ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯ ಮತ್ತು ತಪಾಸಣೆ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ವಿವರಿಸಿ",
        romanized: "BRCA1 mattu BRCA2 anuvanshika cancer apaya mattu thapasane vivarisi",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk guidelines.",
      },
      "ml-IN": {
        native: "BRCA1, BRCA2 പാരമ്പര്യ അർബുദ സാധ്യതയും സ്ക്രീനിംഗ് രീതികളും വിശദീകരിക്കുക",
        romanized: "BRCA1, BRCA2 paaramparya arbudha saadhyathayum screening reethikalum vishadheekarikkuka",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening.",
      },
      "mr-IN": {
        native: "BRCA1 आणि BRCA2 अनुवांशिक कर्करोग जोखीम आणि तपासणी नियम स्पष्ट करा",
        romanized: "BRCA1 aani BRCA2 anuvanshik karkrog jokhim aani tapasni niyam spashta kara",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening protocols.",
      },
      "gu-IN": {
        native: "BRCA1 અને BRCA2 આનુવંશિક કેન્સર જોખમ અને સ્ક્રીનીંગ માર્ગદર્શિકા સમજાવો",
        romanized: "BRCA1 ane BRCA2 aanuvanshik cancer jokham ane screening margadarshika samjaavo",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening guidelines.",
      },
      "pa-IN": {
        native: "BRCA1 ਅਤੇ BRCA2 ਜੱਦੀ ਕੈਂਸਰ ਜੋਖਮ ਅਤੇ ਸਕ੍ਰੀਨਿੰਗ ਨਿਯਮ ਸਮਝਾਓ",
        romanized: "BRCA1 ate BRCA2 jaddi cancer jokham ate screening niyam samjhao",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening protocols.",
      },
      "od-IN": {
        native: "BRCA1 ଏବଂ BRCA2 ବଂଶାନୁକ୍ରମିକ କର୍କଟ ରୋଗ ଆଶଙ୍କା ଏବଂ ସ୍କ୍ରିନିଂ ନିୟମାବଳୀ ବୁଝାନ୍ତୁ",
        romanized: "BRCA1 ebong BRCA2 banshanukramika karkata roga aashanka bujhantu",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening rules.",
      },
      "as-IN": {
        native: "BRCA1 আৰু BRCA2 বংশগত কৰ্কট ৰোগৰ আশংকা আৰু পৰীক্ষাৰ নিয়মসমূহ বুজাই দিয়ক",
        romanized: "BRCA1 aru BRCA2 bongxogoto korkot rogor aaxonka bujai diyok",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening protocols.",
      },
      "ur-IN": {
        native: "BRCA1 اور BRCA2 موروثی کینسر کے خطرے اور اسکریننگ کے اصول بتائیں",
        romanized: "BRCA1 aur BRCA2 moroosi cancer ke khatre aur screening ke asool batayein",
        english: "Explain BRCA1 and BRCA2 hereditary cancer risk and screening guidelines.",
      },
      "en-IN": {
        native: "What are the surveillance and preventative guidelines for pathogenic BRCA1 and BRCA2 mutations?",
        romanized: "NCCN oncogenetic surveillance and 50% autosomal dominant risk stratification.",
        english: "What are the surveillance and preventative guidelines for pathogenic BRCA1 and BRCA2 mutations?",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "NCCN मैमोग्राफी दिशानिर्देश", query: "BRCA म्यूटेशन में किस उम्र से MRI या मैमोग्राफी शुरू करनी चाहिए?" },
        { title: "परिवार में आनुवंशिक जोखिम", query: "क्या BRCA पॉजिटिव होने पर बच्चों में 50% विरासत का खतरा होता है?" },
      ],
      "en-IN": [
        { title: "Annual MRI Surveillance", query: "At what age should annual breast MRI surveillance begin for BRCA carriers?" },
        { title: "50% Autosomal Inheritance", query: "What are the inheritance risks for first-degree relatives in BRCA1 variants?" },
      ],
    },
  },
  {
    id: "sug-fatty-liver",
    category: "labs",
    categoryLabel: "Hepatology",
    title: "Fatty Liver MASLD & Elevated ALT/AST",
    badge: "Liver Health • MASLD & FIB-4",
    iconName: "flask",
    translations: {
      "hi-IN": {
        native: "फैटी लिवर (MASLD) और बढ़े हुए ALT/AST एंजाइम का क्या मतलब है?",
        romanized: "Fatty liver (MASLD) aur badhe huye ALT/AST enzyme ka kya matlab hai?",
        english: "What does fatty liver (MASLD) and high ALT/AST enzymes indicate?",
      },
      "bn-IN": {
        native: "ফ্যাটি লিভার (MASLD) এবং বর্ধিত ALT/AST এনজাইমের তাৎপর্য কী?",
        romanized: "Fatty liver (MASLD) ebong bordhito ALT/AST enzyme er tatporjo ki?",
        english: "What is the significance of fatty liver and elevated ALT/AST enzymes?",
      },
      "ta-IN": {
        native: "கொழுப்பு கல்லீரல் (MASLD) மற்றும் உயர்ந்த ALT/AST என்சைம்கள் எதைக் குறிக்கின்றன?",
        romanized: "Kozhuppu kalleeral (MASLD) matrum uyarndha ALT/AST enzymes edhai kurikkinrana?",
        english: "What does fatty liver with elevated ALT/AST indicate?",
      },
      "te-IN": {
        native: "ఫ్యాటీ లివర్ (MASLD) మరియు పెరిగిన ALT/AST ఎంజైములు దేనిని సూచిస్తాయి?",
        romanized: "Fatty liver (MASLD) mariyu perigina ALT/AST enzymes denini soochistayi?",
        english: "What does fatty liver and high ALT/AST transaminases signify?",
      },
      "kn-IN": {
        native: "ಕೊಬ್ಬಿನ ಪಿತ್ತಜನಕಾಂಗ (MASLD) ಮತ್ತು ಹೆಚ್ಚಿದ ALT/AST ಮಟ್ಟಗಳು ಏನನ್ನು ಸೂಚಿಸುತ್ತವೆ?",
        romanized: "Kobbina pittajanakanga (MASLD) mattu hechida ALT/AST mattagalu enannu soochisuttave?",
        english: "Explain fatty liver and elevated ALT/AST levels.",
      },
      "ml-IN": {
        native: "ഫാറ്റി ലിവർ (MASLD), ഉയർന്ന ALT/AST അളവുകൾ എന്താണ് സൂചിപ്പിക്കുന്നത്?",
        romanized: "Fatty liver (MASLD), uyarna ALT/AST alavukal enthaanu soochippikkunnathu?",
        english: "What does fatty liver with elevated ALT/AST indicate?",
      },
      "mr-IN": {
        native: "फॅटी लिव्हर (MASLD) आणि वाढलेले ALT/AST पातळी काय दर्शवते?",
        romanized: "Fatty liver (MASLD) aani vaadhlele ALT/AST paatali kaay darshavate?",
        english: "Explain fatty liver (MASLD) and high ALT/AST enzymes.",
      },
      "gu-IN": {
        native: "ફેટી લિવર (MASLD) અને વધેલા ALT/AST સ્તર શું દર્શાવે છે?",
        romanized: "Fatty liver (MASLD) ane vadhela ALT/AST star shu darshave chhe?",
        english: "What does fatty liver and high ALT/AST transaminases indicate?",
      },
      "pa-IN": {
        native: "ਫੈਟੀ ਲਿਵਰ (MASLD) ਅਤੇ ਵਧੇ ਹੋਏ ALT/AST ਪੱਧਰ ਕੀ ਦਰਸਾਉਂਦੇ ਹਨ?",
        romanized: "Fatty liver (MASLD) ate vadhe hoye ALT/AST padhar ki darsaunde han?",
        english: "Explain fatty liver and elevated ALT/AST transaminases.",
      },
      "od-IN": {
        native: "ଫ୍ୟାଟି ଲିଭର (MASLD) ଏବଂ ବୃଦ୍ଧି ପାଇଥିବା ALT/AST ସ୍ତର କଣ ସୂଚାଏ?",
        romanized: "Fatty liver (MASLD) ebong briddhi paithiba ALT/AST stara kana suchaye?",
        english: "What does fatty liver and elevated ALT/AST indicate?",
      },
      "as-IN": {
        native: "ফেটী লিভাৰ (MASLD) আৰু বঢ়া ALT/AST স্তৰে কি বুজায়?",
        romanized: "Fatty liver (MASLD) aru borha ALT/AST store ki bujay?",
        english: "Explain fatty liver and elevated ALT/AST levels.",
      },
      "ur-IN": {
        native: "فیٹی لیور (MASLD) اور بڑھے ہوئے ALT/AST کی کیا اہمیت ہے؟",
        romanized: "Fatty liver (MASLD) aur badhe huye ALT/AST ki kya ahmiyat hai?",
        english: "Explain fatty liver and elevated ALT/AST transaminases.",
      },
      "en-IN": {
        native: "What does ultrasound fatty liver (MASLD) with elevated ALT/AST transaminases indicate?",
        romanized: "Hepatic steatosis and metabolic dysfunction assessment under EASL 2024.",
        english: "What does ultrasound fatty liver (MASLD) with elevated ALT/AST transaminases indicate?",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "FIB-4 फाइब्रोसिस स्कोर", query: "लिवर फाइब्रोसिस जांच के लिए FIB-4 स्कोर कैसे निकालते हैं?" },
        { title: "लिवर सुरक्षित आहार", query: "फैटी लिवर ठीक करने के लिए आहार और व्यायाम के नियम क्या हैं?" },
      ],
      "en-IN": [
        { title: "FIB-4 Non-Invasive Score", query: "What is the clinical role of FIB-4 scoring in MASLD staging?" },
        { title: "Hepatic Steatosis Reversal", query: "Can metabolic steatohepatitis be reversed with lifestyle optimization?" },
      ],
    },
  },
  {
    id: "sug-b12-anemia",
    category: "labs",
    categoryLabel: "Hematology",
    title: "Vitamin B12 & Ferritin Deficiency",
    badge: "Hematology • Ferritin & B12 Panel",
    iconName: "flask",
    translations: {
      "hi-IN": {
        native: "एनीमिया में कम फेरिटिन और विटामिन B12 की कमी के लक्षण क्या हैं?",
        romanized: "Anemia me kam ferritin aur vitamin B12 ki kami ke lakshan kya hain?",
        english: "What are the clinical signs of low ferritin and vitamin B12 deficiency in anemia?",
      },
      "bn-IN": {
        native: "রক্তস্বল্পতায় কম ফেরিটিন এবং ভিটামিন B12 এর ঘাটতির লক্ষণ কী?",
        romanized: "Roktoswolpotay kom ferritin ebong vitamin B12 er ghattir lokkhon ki?",
        english: "What are the signs of low ferritin and vitamin B12 deficiency in anemia?",
      },
      "ta-IN": {
        native: "இரத்த சோகையில் குறைந்த ஃபெரிட்டின் மற்றும் வைட்டமின் பி12 குறைபாட்டின் அறிகுறிகள் யாவை?",
        romanized: "Iratha sogayil kuraindha ferritin matrum vitamin B12 kuraipaattin arikurigal yaavai?",
        english: "What are symptoms of low ferritin and vitamin B12 deficiency in anemia?",
      },
      "te-IN": {
        native: "రక్తహీనతలో తక్కువ ఫెర్రిటిన్ మరియు విటమిన్ B12 లోపం యొక్క లక్షణాలు ఏమిటి?",
        romanized: "Raktahinathalo thakkuva ferritin mariyu vitamin B12 lopam yokka lakshanaalu emiti?",
        english: "Explain low ferritin and vitamin B12 deficiency in anemia.",
      },
      "kn-IN": {
        native: "ರಕ್ತಹೀನತೆಯಲ್ಲಿ ಕಡಿಮೆ ಫೆರಿಟಿನ್ ಮತ್ತು ವಿಟಮಿನ್ B12 ಕೊರತೆಯ ಲಕ್ಷಣಗಳು ಯಾವುವು?",
        romanized: "Raktahinathe yalli kadime ferritin mattu vitamin B12 koratheya lakshanagalu yaavuvu?",
        english: "What are symptoms of low ferritin and vitamin B12 deficiency?",
      },
      "ml-IN": {
        native: "വിളർച്ചയിൽ കുറഞ്ഞ ഫെറിറ്റിൻ, വിറ്റാമിൻ ബി12 കുറവിന്റെ ലക്ഷണങ്ങൾ എന്തൊക്കെയാണ്?",
        romanized: "Vilarchayil kuranja ferritin, vitamin B12 kuravinre lakshanangal enthokkeyaanu?",
        english: "Explain low ferritin and vitamin B12 deficiency in anemia.",
      },
      "mr-IN": {
        native: "ॲनिमियामध्ये कमी फेरिटिन आणि व्हिटॅमिन बी12 च्या कमतरतेची लक्षणे कोणती आहेत?",
        romanized: "Anemiamadhye kami ferritin aani vitamin B12 chya kamtartachi lakshane konti aahet?",
        english: "What are symptoms of low ferritin and vitamin B12 deficiency in anemia?",
      },
      "gu-IN": {
        native: "એનિમિયામાં ઓછા ફેરીટિન અને વિટામિન B12 ની ઉણપના લક્ષણો શું છે?",
        romanized: "Anemiyama ochha ferritin ane vitamin B12 ni unupna lakshano shu chhe?",
        english: "Explain low ferritin and vitamin B12 deficiency in anemia.",
      },
      "pa-IN": {
        native: "ਅਨੀਮੀਆ ਵਿੱਚ ਘੱਟ ਫੈਰੀਟਿਨ ਅਤੇ ਵਿਟਾਮਿਨ ਬੀ12 ਦੀ ਕਮੀ ਦੇ ਲੱਛਣ ਕੀ ਹਨ?",
        romanized: "Anemia vich ghatt ferritin ate vitamin B12 di kami de lakshan ki han?",
        english: "What are symptoms of low ferritin and vitamin B12 deficiency?",
      },
      "od-IN": {
        native: "ରକ୍ତହୀନତାରେ କମ୍ ଫେରିଟିନ୍ ଏବଂ ଭିଟାମିନ୍ B12 ଅଭାବର ଲକ୍ଷଣ କଣ?",
        romanized: "Raktahinatare kam ferritin ebong vitamin B12 abhabara lakshana kana?",
        english: "Explain low ferritin and vitamin B12 deficiency in anemia.",
      },
      "as-IN": {
        native: "ৰক্তহীনতাত কম ফেৰিটিন আৰু ভিটামিন B12 ৰ অভাৱৰ লক্ষণ কি কি?",
        romanized: "Roktohinotat kom ferritin aru vitamin B12 r obhavor lokkhon ki ki?",
        english: "What are symptoms of low ferritin and vitamin B12 deficiency?",
      },
      "ur-IN": {
        native: "خون کی کمی میں کم فیریٹین اور وٹامن بی 12 کی کمی کی علامات کیا ہیں؟",
        romanized: "Khoon ki kami mein kam ferritin aur vitamin B12 ki kami ki alamat kya hain?",
        english: "What are symptoms of low ferritin and vitamin B12 deficiency in anemia?",
      },
      "en-IN": {
        native: "What are the clinical signs of low serum ferritin and vitamin B12 deficiency in anemia?",
        romanized: "Evaluation of microcytic iron deficiency versus macrocytic megaloblastic anemia.",
        english: "What are the clinical signs of low serum ferritin and vitamin B12 deficiency in anemia?",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "आयरन अवशोषण आहार", query: "शरीर में आयरन का अवशोषण बढ़ाने के लिए क्या खाना चाहिए?" },
        { title: "बी12 न्यूरोलॉजिकल प्रभाव", query: "विटामिन बी12 की कमी से हाथों-पैरों में झनझनाहट क्यों होती है?" },
      ],
      "en-IN": [
        { title: "Iron Bioavailability", query: "Which foods and co-factors enhance non-heme iron absorption?" },
        { title: "B12 Neurological Impact", query: "Why does vitamin B12 deficiency cause peripheral neuropathy and paresthesias?" },
      ],
    },
  },
  {
    id: "sug-celiac",
    category: "genetics",
    categoryLabel: "Immunogenetics",
    title: "Celiac Disease tTG-IgA & HLA-DQ2/8",
    badge: "Immunology • tTG-IgA & Gluten",
    iconName: "dna",
    translations: {
      "hi-IN": {
        native: "सीलिएक रोग में tTG-IgA एंटीबॉडी और ग्लूटेन संवेदनशीलता समझाइए",
        romanized: "Celiac rog me tTG-IgA antibody aur gluten samvedansheelta samjhayein",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "bn-IN": {
        native: "সিলিয়াক রোগে tTG-IgA অ্যান্টিবডি এবং গ্লুটেন সংবেদনশীলতা ব্যাখ্যা করুন",
        romanized: "Celiac roge tTG-IgA antibody ebong gluten songbedonshilota byakhya korun",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "ta-IN": {
        native: "சீலியாக் நோயில் tTG-IgA ஆன்டிபாடி மற்றும் பசையம் உணர்திறனை விளக்குங்கள்",
        romanized: "Celiac noyil tTG-IgA antibody matrum gluten unarthiranai vilakkungal",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "te-IN": {
        native: "ఉదరకుహర (సీలియాక్) వ్యాధిలో tTG-IgA యాంటీబాడీ మరియు గ్లూటెన్ సున్నితత్వాన్ని వివరించండి",
        romanized: "Celiac vyadhilo tTG-IgA antibody mariyu gluten sunnithatwanni vivarinchandi",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "kn-IN": {
        native: "ಉದರದ ಕಾಯಿಲೆಯಲ್ಲಿ (ಸಿಲಿಯಾಕ್) tTG-IgA ಪ್ರತಿಕಾಯ ಮತ್ತು ಅಂಟು ಸಂವೇದನೆ ವಿವರಿಸಿ",
        romanized: "Celiac kayileyalli tTG-IgA prathikaya mattu gluten samvedane vivarisi",
        english: "Explain Celiac disease tTG-IgA and gluten sensitivity.",
      },
      "ml-IN": {
        native: "സീലിയാക് രോഗത്തിൽ tTG-IgA ആന്റിബോഡിയും ഗ്ലൂട്ടൻ അലർജിയും വിശദീകരിക്കുക",
        romanized: "Celiac rogathil tTG-IgA antibody yum gluten allergy yum vishadheekarikkuka",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "mr-IN": {
        native: "सिलियाक आजारामध्ये tTG-IgA ॲन्टीबॉडी आणि ग्लूटेन संवेदनशीलता स्पष्ट करा",
        romanized: "Celiac aajaaramadhye tTG-IgA antibody aani gluten samvedanshilta spashta kara",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "gu-IN": {
        native: "સેલિયાક રોગમાં tTG-IgA એન્ટિબોડી અને ગ્લુટેન સંવેદનશીલતા સમજાવો",
        romanized: "Celiac rogma tTG-IgA antibody ane gluten samvedanshilta samjaavo",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "pa-IN": {
        native: "ਸੀਲੀਏਕ ਰੋਗ ਵਿੱਚ tTG-IgA ਐਂਟੀਬਾਡੀ ਅਤੇ ਗਲੂਟਨ ਸੰਵੇਦਨਸ਼ੀਲਤਾ ਸਮਝਾਓ",
        romanized: "Celiac rog vich tTG-IgA antibody ate gluten samvedansheelta samjhao",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "od-IN": {
        native: "ସିଲିଆକ୍ ରୋଗରେ tTG-IgA ଆଣ୍ଟିବଡି ଏବଂ ଗ୍ଲୁଟେନ୍ ସମ୍ବେଦନଶୀଳତା ବୁଝାନ୍ତୁ",
        romanized: "Celiac rogare tTG-IgA antibody ebong gluten sambedansheelata bujhantu",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "as-IN": {
        native: "চেলিয়াক ৰোগত tTG-IgA এন্টিবডি আৰু গ্লুটেন সংবেদনশীলতা বুজাই দিয়ক",
        romanized: "Celiac rogot tTG-IgA antibody aru gluten songbedonshilota bujai diyok",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "ur-IN": {
        native: "سیلیک بیماری میں tTG-IgA اینٹی باڈی اور گلوٹین الرجی کی وضاحت کریں",
        romanized: "Celiac bimari mein tTG-IgA antibody aur gluten allergy ki wazahat karein",
        english: "Explain Celiac disease tTG-IgA antibody and gluten sensitivity.",
      },
      "en-IN": {
        native: "What does elevated tissue transglutaminase tTG-IgA indicate in Celiac enteropathy?",
        romanized: "ACG guidelines on HLA-DQ2/DQ8 and duodenal enteropathy assessment.",
        english: "What does elevated tissue transglutaminase tTG-IgA indicate in Celiac enteropathy?",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "ग्लूटेन-मुक्त आहार दिशानिर्देश", query: "सीलिएक रोग में कौन से अनाज सुरक्षित हैं?" },
        { title: "HLA आनुवंशिक परीक्षण", query: "क्या सीलिएक के लिए HLA-DQ2/DQ8 जीन जांच जरूरी है?" },
      ],
      "en-IN": [
        { title: "Strict Gluten Elimination", query: "What are the safe grains and cross-contamination rules for celiac?" },
        { title: "HLA-DQ2/8 Genetic Screen", query: "What is the negative predictive value of HLA-DQ2/DQ8 genotyping?" },
      ],
    },
  },
  {
    id: "sug-kidney-ckd",
    category: "thyroid",
    categoryLabel: "Nephrology",
    title: "Diabetic Kidney Disease & Microalbuminuria",
    badge: "Renal Function • eGFR & ACR",
    iconName: "shield",
    translations: {
      "hi-IN": {
        native: "डायबिटीज में यूरिन माइक्रोएल्बुमिन और eGFR कम होने का क्या खतरा है?",
        romanized: "Diabetes me urine microalbumin aur eGFR kam hone ka kya khatra hai?",
        english: "What is the risk of urine microalbuminuria and low eGFR in diabetes?",
      },
      "bn-IN": {
        native: "ডায়াবেটিসে প্রস্রাবে মাইক্রোঅ্যালবুমিন এবং eGFR কমার ঝুঁকি কী?",
        romanized: "Diabetes-e prosrabe microalbumin ebong eGFR komar jhuki ki?",
        english: "What is the risk of microalbuminuria and declining eGFR in diabetes?",
      },
      "ta-IN": {
        native: "நீரிழிவு நோயில் சிறுநீர் மைக்ரோஅல்புமின் மற்றும் குறைந்த eGFR இன் ஆபத்து என்ன?",
        romanized: "Neerizhivu noyil siruneer microalbumin matrum kuraindha eGFR in aabathu enna?",
        english: "What is the risk of urine microalbumin and low eGFR in diabetes?",
      },
      "te-IN": {
        native: "డయాబెటిస్‌లో మూత్రంలో మైక్రోఅల్బుమిన్ మరియు eGFR తగ్గడం వల్ల వచ్చే ప్రమాదం ఏమిటి?",
        romanized: "Diabetes lo mootramlo microalbumin mariyu eGFR thaggadam valla vache pramadam emiti?",
        english: "What does microalbuminuria and reduced eGFR indicate in diabetes?",
      },
      "kn-IN": {
        native: "ಮಧುಮೇಹದಲ್ಲಿ ಮೂತ್ರದ ಮೈಕ್ರೊಅಲ್ಬುಮಿನ್ ಮತ್ತು ಕಡಿಮೆ eGFR ಅಪಾಯವೇನು?",
        romanized: "Madhumēhadalli mootrada microalbumin mattu kadime eGFR apayavenu?",
        english: "What is the risk of urine microalbumin and low eGFR in diabetes?",
      },
      "ml-IN": {
        native: "പ്രമേഹത്തിൽ മൂത്രത്തിലെ മൈക്രോആൽബുമിനും കുറഞ്ഞ eGFR ഉം എന്ത് അപകടമാണ് സൂചിപ്പിക്കുന്നത്?",
        romanized: "Pramehathil moothrathile microalbumin um kuranja eGFR um enthu apakadamaanu soochippikkunnathu?",
        english: "What is the risk of microalbuminuria and low eGFR in diabetes?",
      },
      "mr-IN": {
        native: "मधुमेहामध्ये युरिन मायक्रोअल्ब्युमिन आणि कमी eGFR चा काय धोका असतो?",
        romanized: "Madhughamadhye urine microalbumin aani kami eGFR cha kaay dhoka asto?",
        english: "What is the clinical risk of microalbuminuria and reduced eGFR in diabetes?",
      },
      "gu-IN": {
        native: "ડાયાબિટીસમાં પેશાબમાં માઇક્રોઆલ્બ્યુમિન અને ઓછું eGFR શું જોખમ દર્શાવે છે?",
        romanized: "Diabetes ma peshabma microalbumin ane ochhu eGFR shu jokham darshave chhe?",
        english: "What does urine microalbumin and reduced eGFR signify in diabetes?",
      },
      "pa-IN": {
        native: "ਸ਼ੂਗਰ ਵਿੱਚ ਪਿਸ਼ਾਬ ਵਿੱਚ ਮਾਈਕ੍ਰੋਐਲਬਿਊਮਿਨ ਅਤੇ ਘੱਟ eGFR ਦਾ ਕੀ ਖਤਰਾ ਹੈ?",
        romanized: "Sugar vich pishab vich microalbumin ate ghatt eGFR da ki khatra hai?",
        english: "What does microalbuminuria and low eGFR indicate in diabetic nephropathy?",
      },
      "od-IN": {
        native: "ମଧୁମେହରେ ପରିସ୍ରାରେ ମାଇକ୍ରୋଆଲବୁମିନ୍ ଏବଂ କମ୍ eGFR ର ବିପଦ କଣ?",
        romanized: "Madhumēhare parisrāre microalbumin ebong kam eGFR ra bipada kana?",
        english: "What is the risk of urine microalbumin and low eGFR in diabetes?",
      },
      "as-IN": {
        native: "ডায়াবেটিচত প্ৰস্ৰাৱত মাইক্ৰ'এলবুমিন আৰু কম eGFR ৰ বিপদ কি?",
        romanized: "Diabetisot prosrawot microalbumin aru kom eGFR r bipod ki?",
        english: "What does microalbuminuria and low eGFR indicate in diabetes?",
      },
      "ur-IN": {
        native: "ذیابیطس میں پیشاب میں مائیکرو البومین اور کم eGFR کے کیا خطرات ہیں؟",
        romanized: "Diabetes mein peshab mein microalbumin aur kam eGFR ke kya khatraat hain?",
        english: "What are the risks of microalbuminuria and low eGFR in diabetes?",
      },
      "en-IN": {
        native: "What are the clinical implications of urinary albumin-creatinine ratio (ACR) elevation and declining eGFR?",
        romanized: "KDIGO 2024 guidelines on diabetic kidney disease progression and SGLT2i nephroprotection.",
        english: "What are the clinical implications of urinary albumin-creatinine ratio (ACR) elevation and declining eGFR?",
      },
    },
    followUps: {
      "hi-IN": [
        { title: "KDIGO किडनी सुरक्षा", query: "किडनी को नुकसान से बचाने के लिए SGLT2i और ACEi दवाएं कैसे काम करती हैं?" },
        { title: "नमक और प्रोटीन सीमा", query: "डायबिटिक किडनी रोग में नमक और प्रोटीन का कितना सेवन करना चाहिए?" },
      ],
      "en-IN": [
        { title: "KDIGO Nephroprotection", query: "How do SGLT2 inhibitors and ARBs slow chronic kidney disease progression?" },
        { title: "Dietary Sodium & Protein", query: "What are the KDIGO recommended daily sodium and protein intake limits?" },
      ],
    },
  },
];

/**
 * Resolves a clinical suggestion's localized query text based on active language code.
 */
export function getLocalizedSuggestionQuery(
  suggestion: ClinicalSuggestionItem,
  langCode: string
): { native: string; romanized?: string; english: string } {
  const trans =
    suggestion.translations[langCode] ||
    suggestion.translations["hi-IN"] ||
    suggestion.translations["en-IN"] ||
    Object.values(suggestion.translations)[0];
  return trans;
}

/**
 * Returns contextual follow-up inquiries based on the recent question and active language.
 */
export function getContextualFollowUps(
  queryText: string,
  langCode: string
): Array<{ title: string; query: string }> {
  const qLower = queryText.toLowerCase();

  for (const item of CLINICAL_VOICE_SUGGESTIONS) {
    const isMatch =
      item.id === "sug-bp" && (qLower.includes("bp") || qLower.includes("pressure") || qLower.includes("vitals") || qLower.includes("రక్తపోటు") || qLower.includes("रक्तचाप")) ||
      item.id === "sug-glucose" && (qLower.includes("glucose") || qLower.includes("114") || qLower.includes("मधुमेह") || qLower.includes("சர்க்கரை") || qLower.includes("గ్లూకోజ్")) ||
      item.id === "sug-lstm-hba1c" && (qLower.includes("lstm") || qLower.includes("hba1c") || qLower.includes("velocity")) ||
      item.id === "sug-cbc-lipids" && (qLower.includes("cbc") || qLower.includes("lipid") || qLower.includes("hemoglobin") || qLower.includes("blood report")) ||
      item.id === "sug-marfan" && (qLower.includes("marfan") || qLower.includes("fbn1") || qLower.includes("genetic") || qLower.includes("dominant")) ||
      item.id === "sug-thalassemia" && (qLower.includes("thalassemia") || qLower.includes("sickle") || qLower.includes("hbb") || qLower.includes("carrier") || qLower.includes("थैलेसीमिया")) ||
      item.id === "sug-brca" && (qLower.includes("brca") || qLower.includes("cancer") || qLower.includes("कैंसर") || qLower.includes("புற்றுநோய்")) ||
      item.id === "sug-celiac" && (qLower.includes("celiac") || qLower.includes("ttg") || qLower.includes("gluten") || qLower.includes("ग्लूटेन")) ||
      item.id === "sug-kidney-ckd" && (qLower.includes("kidney") || qLower.includes("egfr") || qLower.includes("microalbumin") || qLower.includes("acr") || qLower.includes("किडनी")) ||
      item.id === "sug-fatty-liver" && (qLower.includes("fatty") || qLower.includes("liver") || qLower.includes("masld") || qLower.includes("alt") || qLower.includes("लिवर")) ||
      item.id === "sug-b12-anemia" && (qLower.includes("b12") || qLower.includes("ferritin") || qLower.includes("anemia") || qLower.includes("एनीमिया")) ||
      item.id === "sug-thyroid" && (qLower.includes("thyroid") || qLower.includes("tsh") || qLower.includes("थायराइड")) ||
      item.id === "sug-emergency" && (qLower.includes("chest") || qLower.includes("pain") || qLower.includes("dard") || qLower.includes("வலி"));

    if (isMatch && item.followUps) {
      const list = item.followUps[langCode] || item.followUps["hi-IN"] || item.followUps["en-IN"] || [];
      if (list.length > 0) return list;
    }
  }

  // Generic clinical follow-ups in active language
  if (langCode === "ta-IN") {
    return [
      { title: "ஆய்வக விளக்கம்", query: "எனது சமீபத்திய ஆய்வக அறிக்கையை விரிவாக விளக்குங்கள்" },
      { title: "Bi-LSTM முன்னறிவிப்பு", query: "எனது உடல்நலக் குறியீடுகளின் 90 நாள் Bi-LSTM கணிப்பை காட்டுங்கள்" },
      { title: "மருத்துவர் ஆலோசனை", query: "மருத்துவரிடம் நான் கேட்க வேண்டிய முக்கிய கேள்விகள் யாவை?" },
    ];
  }
  if (langCode === "te-IN") {
    return [
      { title: "ల్యాబ్ వివరణ", query: "నా ఇటీవలి ల్యాబ్ నివేదికను వివరంగా వివరించండి" },
      { title: "Bi-LSTM అంచనా", query: "నా ఆరోగ్య సూచికల యొక్క 90 రోజుల Bi-LSTM సూచనను చూపించండి" },
      { title: "వైద్యుని సంప్రదింపులు", query: "నేను వైద్యుడిని అడగవలసిన ముఖ్యమైన ప్రశ్నలు ఏమిటి?" },
    ];
  }
  if (langCode === "bn-IN") {
    return [
      { title: "ল্যাব ব্যাখ্যা", query: "আমার সাম্প্রতিক রক্তের রিপোর্ট বিস্তারিত ব্যাখ্যা করুন" },
      { title: "Bi-LSTM পূর্বাভাস", query: "আমার বায়োমার্কারের ৯০ দিনের Bi-LSTM পূর্বাভাস দেখান" },
      { title: "চিকিৎসকের পরামর্শ", query: "ডাক্তারকে আমার কী কী গুরুত্বপূর্ণ প্রশ্ন জিজ্ঞাসা করা উচিত?" },
    ];
  }
  if (langCode === "en-IN") {
    return [
      { title: "Detailed Lab Review", query: "Explain my recent clinical laboratory panel in detail" },
      { title: "Bi-LSTM 90d Trajectory", query: "Show 90-day Bi-LSTM predictive trajectory" },
      { title: "Questions for Physician", query: "What questions should I ask my consulting physician?" },
    ];
  }

  return [
    { title: "लैब रिपोर्ट का विवरण", query: "मेरी नवीनतम लैब रिपोर्ट का विस्तृत विश्लेषण बताइए" },
    { title: "Bi-LSTM 90-दिन का अनुमान", query: "बायोमार्कर्स का 90-दिन का Bi-LSTM अनुमान दिखाइए" },
    { title: "डॉक्टर के लिए प्रश्न", query: "डॉक्टर से परामर्श लेते समय मुझे क्या पूछना चाहिए?" },
  ];
}
