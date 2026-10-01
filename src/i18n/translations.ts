export type Language = 'he' | 'en';

export const translations = {
  he: {
    // Header & Navigation
    appTitle: 'NeuroFit • אימון מוחי לגיל השלישי',
    stepOf: 'שלב {current} מתוך {total}',
    pause: 'השהיה',
    home: 'דף הבית',
    resume: 'המשך',
    display: 'תצוגה',
    exitSession: 'שמירה ויציאה',
    
    // Pacing & Reassurance
    noRush: 'קחו את כל הזמן שדרוש. אין שעון עצר או לחץ זמן.',
    waitingAnswer: 'בחרו את תשובתכם למעלה כשנוח לכם',
    nextExercise: 'התרגיל הבא',
    completeSession: 'סיום הכיול וקבלת תוצאות 🎉',
    whyThisHelps: 'מדוע זה מועיל?',
    gotItContinue: 'הבנתי, בואו נמשיך',
    learningMoment: 'הזדמנות ללמידה:',
    brilliantResult: 'מצוין ונפלא!',

    // Accessibility Modal
    accessibilityTitle: 'הגדרות תצוגה ונגישות',
    instantChanges: 'כל שינוי מתעדכן באופן מיידי',
    close: 'סגור',
    done: 'סיום',
    resetDefaults: 'איפוס לברירות המחדל',
    textSize: 'גודל טקסט',
    sizeNormal: 'רגיל',
    sizeLarge: 'גדול (מומלץ)',
    sizeExtraLarge: 'גדול מאוד',
    sizeMax: 'מקסימלי',
    previewText: 'תצוגה מקדימה',
    
    // Theme options
    displayTheme: 'מצב תצוגה',
    themeLight: 'בהיר ☀️',
    themeDark: 'כהה 🌙',
    themeHighContrast: 'ניגודיות גבוהה ⚡ (צהוב-שחור)',
    
    // Language Switcher
    languageSelect: 'שפת הממשק',
    langHebrew: 'עברית 🇮🇱',
    langEnglish: 'English 🇬🇧',

    // Other toggles
    reduceAnimationsTitle: 'הפחתת תנועות ואנימציות',
    reduceAnimationsDesc: 'ממתן תנועות על המסך למניעת סחרחורת או עומס',
    soundCuesTitle: 'צלילי משוב עדינים',
    soundCuesDesc: 'פעמונים נעימים לחיזוק חיובי (ללא צפצופים צורמים)',
    on: 'פעיל',
    off: 'כבוי',

    // Pause Modal
    pausedTitle: 'התרגיל מושהה',
    pausedDesc: 'קחו נשימה עמוקה ושתו כוס מים. ההתקדמות שלכם שמורה במלואה.',

    // Onboarding / Baseline Flow
    onboardingTitle: 'ברוכים הבאים ל-NeuroFit',
    onboardingSubtitle: 'אימון מוחי יומי נעים, מותאם אישית ומבוסס מדע',
    onboardingReassurance: 'זהו אינו מבחן! זהו כיול קצר ונעים של 4 שאלות, כדי שהאפליקציה תתאים עבורכם את רמת הקושי המדויקת והנעימה ביותר.',
    onboardingBullets: [
      'ללא שעוני עצר מלחיצים – אתם קובעים את הקצב',
      'צלילים רגועים ומעודדים (ללא צפצופים או סימוני שגיאה)',
      'התאמה מלאה של גודל הכתב והצבעים',
      'כיול שקט המתאים את התרגילים הבאים ליכולתכם'
    ],
    startCalibrationBtn: 'בואו נתחיל בכיול (כ-2 דקות) 🚀',

    // Test 1: Working Memory
    test1Category: 'זיכרון עבודה חזותי',
    test1Title: 'איפה הכלבלב מתחבא?',
    test1Showing: '👀 הביטו היטב איפה הכלבלב החביב מתחבא!',
    test1Shuffling: '🔄 שימו לב: הדלתות נסגרות ומתערבבות לאט...',
    test1Ready: '👉 געו בדלת שמאחוריה לדעתכם מתחבא הכלבלב:',
    test1Success: 'מצוין! עקבתם אחרי הכלבלב בצורה מושלמת.',
    test1Guidance: 'ניסיון יפה! הנה הדלת שבה הכלבלב התחבא. כל ניסיון מחזק את הזיכרון.',
    doorLabel: 'דלת {num}',
    doorEmpty: 'ריקה',
    doorPuppy: 'כלבלב!',
    test1RationaleTitle: 'זיכרון עבודה ומעקב חזותי',
    test1Benefit: 'תרגיל זה מאמן את "לוח הטיוטה" של המוח – היכולת להחזיק מידע חזותי פעיל בעת תנועה ושינוי.',
    test1Impact: 'עוזר לזכור היכן הנחתם את המשקפיים, המפתחות או התרופות, ולשמור על ריכוז במתכונים ובישול.',
    test1Neuro: 'מעקב מתון מפעיל את האונות המצחיות והקודקודיות ומעודד יצירת קשרים עצביים חדשים.',

    // Test 2: Visual Search
    test2Category: 'סריקה ומיקוד חזותי',
    test2Title: 'מצאו את התפוח האדום 🍎',
    test2Instruction: 'חפשו את התפוח האדום הבודד בין כל התפוחים הירוקים ולחצו עליו:',
    test2Success: 'מעולה! המיקוד והסריקה החזותית שלכם מצוינים.',
    test2Guidance: 'טוב מאוד! הנה התפוח האדום המסומן. סריקה בין מסיחים מחדדת את הראייה והקשב.',
    test2RationaleTitle: 'סריקה חזותית וקשב סלקטיבי',
    test2Benefit: 'מאמן את המוח להתעלם מגירויים מסיחים ולהתמקד במה שחשוב באמת.',
    test2Impact: 'עוזר למצוא פריט מבוקש במדף בסופרמרקט, שלט ברחוב או שם ברשימת אנשי קשר.',
    test2Neuro: 'מחזק את הקשר בין קליפת הראייה לאזורי הקשב הבררני במוח.',

    // Test 3: Processing Speed & Cognitive Flexibility
    test3Category: 'מהירות עיבוד וגמישות מחשבתית',
    test3Title: 'מיון צורות וצבעים 🔄',
    test3RuleShape: 'כלל המיון הנוכחי: לפי צורה (עיגול מול ריבוע)',
    test3RuleColor: 'שימו לב: הכלל השתנה! כעת לפי צבע (כחול מול כתום)',
    test3Prompt: 'לאיזה סלסילה שייך הפריט המוצג?',
    test3BasketCircle: 'סלסילת עיגולים ⚪',
    test3BasketSquare: 'סלסילת ריבועים ⬛',
    test3BasketBlue: 'סלסילה כחולה 🔵',
    test3BasketOrange: 'סלסילה כתומה 🟠',
    test3Success: 'נפלא! הסתגלתם לשינוי הכלל בגמישות מחשבתית נהדרת.',
    test3Guidance: 'כל הכבוד על הניסיון! היכולת להחליף חוקי מיון שומרת על גמישות המוח.',
    test3RationaleTitle: 'גמישות קוגניטיבית ועיכוב תגובה',
    test3Benefit: 'אימון על החלפת כללים מדמה מצבי חיים שבהם התוכניות משתנות ונדרשת הסתגלות מהירה.',
    test3Impact: 'מסייע להתמודד ברוגע עם שינויי מסלול, עדכון הנחיות חדשות או שינוי סדר יום.',
    test3Neuro: 'ממריץ את הקורטקס הקדם-מצחי האחראי על הפונקציות הניהוליות הבכירות במוח.',

    // Test 4: Semantic Retrieval & Language
    test4Category: 'שפה ושליפה סמנטית',
    test4Title: 'מהי המילה ההפוכה? 📖',
    test4Instruction: 'בחרו את המילה שהיא ההפך המדויק מן המילה המוצגת:',
    test4PromptWord: 'המילה: "{word}"',
    test4Success: 'מדויק לחלוטין! שליפת המילים ואוצר המילים שלכם חדים.',
    test4Guidance: 'הנה המילה ההפוכה: "{correct}". תרגול סמנטי מעשיר את הזיכרון המילולי.',
    test4RationaleTitle: 'שליפה סמנטית ואוצר מילים',
    test4Benefit: 'מחדד את מהירות השליפה של מילים מתוך "המילון הפנימי" של הזיכרון ארוך הטווח.',
    test4Impact: 'מונע את תחושת "המילה עומדת לי על קצה הלשון" בשיחות יומיומיות עם משפחה וחברים.',
    test4Neuro: 'מפעיל את רשת השפה השמאלית באונה הטמפורלית ומחזק את הקישוריות המילולית.',

    // Baseline Results Screen
    resultsTitle: 'הכיול הושלם בהצלחה!',
    resultsSubtitle: 'הפרופיל הקוגניטיבי ההתחלתי שלכם נקבע ומותאם אישית במדויק.',
    coinsBonus: 'קיבלתם 50 מטבעות מוח כמתנת הצטרפות! 🪙',
    calibratedLevelsTitle: 'הרמות שהותאמו במיוחד עבורכם:',
    level1Name: 'רמה 1: קצב רגוע ומלווה בסיוע מרבי',
    level2Name: 'רמה 2: רמה מאוזנת ונוחה',
    level3Name: 'רמה 3: רמה מתקדמת ומאתגרת',
    accuracyLabel: 'דיוק ממוצע',
    speedLabel: 'זמן מענה ממוצע',
    seconds: 'שניות',
    startDailyExercises: 'עברו לאימון היומי הראשון שלכם 🎯',
    retakeCalibration: 'כיול מחדש',
  },

  en: {
    // Header & Navigation
    appTitle: 'NeuroFit • Senior Cognitive Training',
    stepOf: 'Step {current} of {total}',
    pause: 'Pause',
    home: 'Home',
    resume: 'Resume',
    display: 'Display',
    exitSession: 'Save & Exit',
    
    // Pacing & Reassurance
    noRush: 'Take all the time you need. There is no countdown clock or pressure.',
    waitingAnswer: 'Select your answer above when you are ready',
    nextExercise: 'Next Exercise',
    completeSession: 'Finish Calibration & View Results 🎉',
    whyThisHelps: 'Why This Helps',
    gotItContinue: 'Got it, Continue',
    learningMoment: 'Learning Moment:',
    brilliantResult: 'Wonderful & Brilliant!',

    // Accessibility Modal
    accessibilityTitle: 'Display & Accessibility Settings',
    instantChanges: 'All changes apply immediately',
    close: 'Close',
    done: 'Done',
    resetDefaults: 'Reset to Standard Defaults',
    textSize: 'Text Size',
    sizeNormal: 'Normal',
    sizeLarge: 'Large (Recommended)',
    sizeExtraLarge: 'Extra Large',
    sizeMax: 'Maximum',
    previewText: 'Preview',
    
    // Theme options
    displayTheme: 'Display Theme',
    themeLight: 'Light ☀️',
    themeDark: 'Dark 🌙',
    themeHighContrast: 'High Contrast ⚡ (Yellow/Black)',
    
    // Language Switcher
    languageSelect: 'Interface Language',
    langHebrew: 'עברית 🇮🇱',
    langEnglish: 'English 🇬🇧',

    // Other toggles
    reduceAnimationsTitle: 'Reduce Animations & Motion',
    reduceAnimationsDesc: 'Softens screen motion to prevent dizziness or eye fatigue',
    soundCuesTitle: 'Gentle Sound Cues',
    soundCuesDesc: 'Pleasant chimes for positive feedback (strictly no harsh buzzers)',
    on: 'ON',
    off: 'OFF',

    // Pause Modal
    pausedTitle: 'Exercise Paused',
    pausedDesc: 'Take a deep breath and a sip of water. Your progress is fully saved.',

    // Onboarding / Baseline Flow
    onboardingTitle: 'Welcome to NeuroFit',
    onboardingSubtitle: 'Pleasant, scientifically-backed daily cognitive training at your own pace',
    onboardingReassurance: 'This is not a test! It is just a quick 4-question calibration so the app adapts exercises to your most comfortable and enjoyable level.',
    onboardingBullets: [
      'No stress countdown timers – you dictate the pace',
      'Calming, positive feedback (no buzzers or harsh red X marks)',
      'Full control over text size, light/dark themes, and contrast',
      'Quiet calibration that tunes future exercises to your baseline'
    ],
    startCalibrationBtn: 'Start Quick Calibration (2 min) 🚀',

    // Test 1: Working Memory
    test1Category: 'Visual Working Memory',
    test1Title: 'Where is the puppy hiding?',
    test1Showing: '👀 Look closely at where the friendly puppy is hiding!',
    test1Shuffling: '🔄 Watch closely: doors are closing and shuffling gently...',
    test1Ready: '👉 Touch the door where you think the puppy is hiding:',
    test1Success: 'Wonderful! You tracked the puppy perfectly.',
    test1Guidance: 'Good try! Here is where the puppy was hiding. Every round exercises your memory.',
    doorLabel: 'Door {num}',
    doorEmpty: 'Empty',
    doorPuppy: 'Puppy!',
    test1RationaleTitle: 'Working Memory & Visual Tracking',
    test1Benefit: 'Trains the brain’s "mental scratchpad"—the ability to hold visual information active during shifts.',
    test1Impact: 'Helps you recall where you set down your glasses or keys, and stay focused while cooking or following steps.',
    test1Neuro: 'Gentle tracking activates frontal and parietal networks, encouraging healthy neuroplasticity.',

    // Test 2: Visual Search
    test2Category: 'Visual Search & Focus',
    test2Title: 'Find the Red Apple 🍎',
    test2Instruction: 'Find the single red apple among all the green apples and tap it:',
    test2Success: 'Excellent! Your visual focus and attention to detail are sharp.',
    test2Guidance: 'Well done! Here is the highlighted red apple. Scanning among distractors sharpens visual focus.',
    test2RationaleTitle: 'Visual Search & Selective Attention',
    test2Benefit: 'Trains your visual system to filter out background distractions and hone in on key targets.',
    test2Impact: 'Helps you quickly spot an item on grocery shelves, a street sign, or a contact name on your phone.',
    test2Neuro: 'Reinforces connectivity between the visual cortex and frontal attentional hubs.',

    // Test 3: Processing Speed & Cognitive Flexibility
    test3Category: 'Processing Speed & Mental Flexibility',
    test3Title: 'Sort Shapes & Colors 🔄',
    test3RuleShape: 'Current Sorting Rule: By Shape (Circle vs Square)',
    test3RuleColor: 'Notice: Rule Changed! Now sort by Color (Blue vs Orange)',
    test3Prompt: 'Which basket does this item belong to?',
    test3BasketCircle: 'Circles Basket ⚪',
    test3BasketSquare: 'Squares Basket ⬛',
    test3BasketBlue: 'Blue Basket 🔵',
    test3BasketOrange: 'Orange Basket 🟠',
    test3Success: 'Great job! You adapted to the rule change with wonderful flexibility.',
    test3Guidance: 'Great effort! Practicing rule changes keeps cognitive pathways agile and resilient.',
    test3RationaleTitle: 'Cognitive Flexibility & Task Switching',
    test3Benefit: 'Switching criteria exercises the executive control needed when everyday situations shift.',
    test3Impact: 'Assists in smoothly adjusting when plans change, new directions arise, or daily routines alter.',
    test3Neuro: 'Stimulates the prefrontal cortex governing high-order executive functioning.',

    // Test 4: Semantic Retrieval & Language
    test4Category: 'Language & Semantic Retrieval',
    test4Title: 'What is the Opposite? 📖',
    test4Instruction: 'Select the word that is the direct opposite (antonym) of the shown word:',
    test4PromptWord: 'Word: "{word}"',
    test4Success: 'Spot on! Your vocabulary retrieval and language centers are sharp.',
    test4Guidance: 'Here is the antonym: "{correct}". Practicing words enriches verbal recall and memory.',
    test4RationaleTitle: 'Semantic Retrieval & Vocabulary',
    test4Benefit: 'Sharpens word retrieval from the long-term semantic lexicon.',
    test4Impact: 'Helps prevent the "tip-of-the-tongue" feeling during lively conversations with family and friends.',
    test4Neuro: 'Activates the left temporal language network and strengthens verbal fluency.',

    // Baseline Results Screen
    resultsTitle: 'Calibration Complete!',
    resultsSubtitle: 'Your initial cognitive profile has been calibrated and personalized.',
    coinsBonus: 'You received 50 Brain Coins as a welcome gift! 🪙',
    calibratedLevelsTitle: 'Levels calibrated specifically for you:',
    level1Name: 'Level 1: Gentle Pace & Maximum Hints',
    level2Name: 'Level 2: Balanced Standard Pace',
    level3Name: 'Level 3: Advanced & Challenging',
    accuracyLabel: 'Average Accuracy',
    speedLabel: 'Average Response Time',
    seconds: 'seconds',
    startDailyExercises: 'Start Your First Daily Workout 🎯',
    retakeCalibration: 'Recalibrate',
  },
};
