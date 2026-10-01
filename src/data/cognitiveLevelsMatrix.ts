/**
 * Scientific Cognitive Levels Matrix (40 Levels: 10 per category)
 * Based on validated neuropsychological paradigms:
 * 1. Working Memory: Corsi Block-Tapping (Backward Recall)
 * 2. Attention: Schulte Table (Dynamic Ascending Visual Search)
 * 3. Processing Speed: Symbol Digit Modalities Test (SDMT)
 * 4. Language & Semantic: Semantic Intruder (Deep Concept Exclusion)
 */

export interface CorsiLevelConfig {
  level: number;
  gridSize: 3 | 4; // 3x3 (9 blocks) or 4x4 (16 blocks)
  sequenceLength: number; // 3 up to 7 items
  flashDurationMs: number; // Duration each tile lights up
  intervalMs: number; // Delay between flashes
  distractorColorChange: boolean; // Visual distractor during display
  targetRecall: 'reverse' | 'forward';
}

export interface SchulteLevelConfig {
  level: number;
  gridDimension: 3 | 4 | 5; // 3x3 (1-9), 4x4 (1-16), or 5x5 (1-25)
  maxNumber: number;
  colorDistractors: boolean; // Random tile background colors to disrupt grouping
  targetTimeSeconds: number;
  shuffleOnCorrect: boolean; // Shuffles remaining tiles on every tap (levels 9-10)
}

export interface SDMTSymbolMapping {
  symbol: string;
  digit: number;
}

export interface SDMTLevelConfig {
  level: number;
  mappingCount: number; // 5 to 9 symbol-digit pairs in legend
  sequenceLength: number; // Number of items to decode
  timeLimitSeconds: number;
  complexSymbols: boolean; // Geometric vs abstract Unicode glyphs
}

export interface SemanticIntruderItem {
  id: string;
  categoryTheme: { he: string; en: string };
  words: {
    he: { word: string; isIntruder: boolean; explanation: string }[];
    en: { word: string; isIntruder: boolean; explanation: string }[];
  };
}

export interface SemanticLevelConfig {
  level: number;
  abstractComplexity: 'concrete' | 'moderate' | 'high' | 'philosophical';
  timeLimitSeconds: number;
  items: SemanticIntruderItem[];
}

// --------------------------------------------------------------------------
// 1. WORKING MEMORY: Corsi Block-Tapping (Reverse Sequence)
// --------------------------------------------------------------------------
export const CORSI_LEVELS: CorsiLevelConfig[] = [
  { level: 1, gridSize: 3, sequenceLength: 3, flashDurationMs: 1200, intervalMs: 600, distractorColorChange: false, targetRecall: 'reverse' },
  { level: 2, gridSize: 3, sequenceLength: 3, flashDurationMs: 1000, intervalMs: 500, distractorColorChange: false, targetRecall: 'reverse' },
  { level: 3, gridSize: 3, sequenceLength: 4, flashDurationMs: 950, intervalMs: 450, distractorColorChange: false, targetRecall: 'reverse' },
  { level: 4, gridSize: 4, sequenceLength: 4, flashDurationMs: 900, intervalMs: 400, distractorColorChange: false, targetRecall: 'reverse' },
  { level: 5, gridSize: 4, sequenceLength: 5, flashDurationMs: 850, intervalMs: 350, distractorColorChange: false, targetRecall: 'reverse' },
  { level: 6, gridSize: 4, sequenceLength: 5, flashDurationMs: 800, intervalMs: 300, distractorColorChange: true, targetRecall: 'reverse' },
  { level: 7, gridSize: 4, sequenceLength: 6, flashDurationMs: 750, intervalMs: 300, distractorColorChange: true, targetRecall: 'reverse' },
  { level: 8, gridSize: 4, sequenceLength: 6, flashDurationMs: 650, intervalMs: 250, distractorColorChange: true, targetRecall: 'reverse' },
  { level: 9, gridSize: 4, sequenceLength: 7, flashDurationMs: 600, intervalMs: 250, distractorColorChange: true, targetRecall: 'reverse' },
  { level: 10, gridSize: 4, sequenceLength: 7, flashDurationMs: 500, intervalMs: 200, distractorColorChange: true, targetRecall: 'reverse' },
];

// --------------------------------------------------------------------------
// 2. ATTENTION: Schulte Table (1-25 Dynamic Ascending Search)
// --------------------------------------------------------------------------
export const SCHULTE_LEVELS: SchulteLevelConfig[] = [
  { level: 1, gridDimension: 3, maxNumber: 9, colorDistractors: false, targetTimeSeconds: 20, shuffleOnCorrect: false },
  { level: 2, gridDimension: 3, maxNumber: 9, colorDistractors: true, targetTimeSeconds: 15, shuffleOnCorrect: false },
  { level: 3, gridDimension: 4, maxNumber: 16, colorDistractors: false, targetTimeSeconds: 35, shuffleOnCorrect: false },
  { level: 4, gridDimension: 4, maxNumber: 16, colorDistractors: true, targetTimeSeconds: 30, shuffleOnCorrect: false },
  { level: 5, gridDimension: 5, maxNumber: 25, colorDistractors: false, targetTimeSeconds: 65, shuffleOnCorrect: false },
  { level: 6, gridDimension: 5, maxNumber: 25, colorDistractors: true, targetTimeSeconds: 55, shuffleOnCorrect: false },
  { level: 7, gridDimension: 5, maxNumber: 25, colorDistractors: true, targetTimeSeconds: 48, shuffleOnCorrect: false },
  { level: 8, gridDimension: 5, maxNumber: 25, colorDistractors: true, targetTimeSeconds: 40, shuffleOnCorrect: false },
  { level: 9, gridDimension: 5, maxNumber: 25, colorDistractors: true, targetTimeSeconds: 38, shuffleOnCorrect: true },
  { level: 10, gridDimension: 5, maxNumber: 25, colorDistractors: true, targetTimeSeconds: 32, shuffleOnCorrect: true },
];

// --------------------------------------------------------------------------
// 3. PROCESSING SPEED: Symbol Digit Modalities Test (SDMT)
// --------------------------------------------------------------------------
export const SDMT_LEVELS: SDMTLevelConfig[] = [
  { level: 1, mappingCount: 5, sequenceLength: 6, timeLimitSeconds: 35, complexSymbols: false },
  { level: 2, mappingCount: 6, sequenceLength: 8, timeLimitSeconds: 35, complexSymbols: false },
  { level: 3, mappingCount: 6, sequenceLength: 10, timeLimitSeconds: 35, complexSymbols: false },
  { level: 4, mappingCount: 7, sequenceLength: 12, timeLimitSeconds: 35, complexSymbols: false },
  { level: 5, mappingCount: 8, sequenceLength: 14, timeLimitSeconds: 35, complexSymbols: true },
  { level: 6, mappingCount: 9, sequenceLength: 16, timeLimitSeconds: 35, complexSymbols: true },
  { level: 7, mappingCount: 9, sequenceLength: 18, timeLimitSeconds: 32, complexSymbols: true },
  { level: 8, mappingCount: 9, sequenceLength: 20, timeLimitSeconds: 30, complexSymbols: true },
  { level: 9, mappingCount: 9, sequenceLength: 22, timeLimitSeconds: 28, complexSymbols: true },
  { level: 10, mappingCount: 9, sequenceLength: 25, timeLimitSeconds: 25, complexSymbols: true },
];

// Base symbols pool for SDMT
export const SDMT_SYMBOLS = [
  '◆', '▲', '●', '★', '✚', '✖', '⬟', '◓', '✦',
  '⊞', '⊗', '⊙', '⊘', '◬', '◸', '☯', '⚝', '❖'
];

// --------------------------------------------------------------------------
// 4. LANGUAGE: Semantic Intruder (Deep Concept Exclusion)
// --------------------------------------------------------------------------
export const SEMANTIC_LEVELS: SemanticLevelConfig[] = [
  // Level 1: Functional everyday objects
  {
    level: 1,
    abstractComplexity: 'concrete',
    timeLimitSeconds: 30,
    items: [
      {
        id: 'sem_1_1',
        categoryTheme: { he: 'כלי שולחן לסעודה', en: 'Dining Utensils' },
        words: {
          he: [
            { word: 'מזלג', isIntruder: false, explanation: 'כלי אוכל' },
            { word: 'כף', isIntruder: false, explanation: 'כלי אוכל' },
            { word: 'סכין', isIntruder: false, explanation: 'כלי אוכל' },
            { word: 'צלחת', isIntruder: false, explanation: 'כלי הגשה לסעודה' },
            { word: 'מברשת', isIntruder: true, explanation: 'כלי טיפוח/ניקוי, אינו שייך לשולחן האוכל' },
          ],
          en: [
            { word: 'Fork', isIntruder: false, explanation: 'Eating utensil' },
            { word: 'Spoon', isIntruder: false, explanation: 'Eating utensil' },
            { word: 'Knife', isIntruder: false, explanation: 'Eating utensil' },
            { word: 'Plate', isIntruder: false, explanation: 'Dining dishware' },
            { word: 'Brush', isIntruder: true, explanation: 'Grooming tool, not a dining utensil' },
          ],
        },
      },
    ],
  },

  // Level 2: Natural Elements / Climate
  {
    level: 2,
    abstractComplexity: 'concrete',
    timeLimitSeconds: 28,
    items: [
      {
        id: 'sem_2_1',
        categoryTheme: { he: 'משקעים אטמוספריים', en: 'Atmospheric Precipitation' },
        words: {
          he: [
            { word: 'גשם', isIntruder: false, explanation: 'משקע מים' },
            { word: 'ברד', isIntruder: false, explanation: 'משקע קרח' },
            { word: 'שלג', isIntruder: false, explanation: 'משקע גבישי' },
            { word: 'טל', isIntruder: false, explanation: 'עיבוי לחות אטמוספרית' },
            { word: 'רוח', isIntruder: true, explanation: 'זרימת אוויר ולא סוג של משקע מים' },
          ],
          en: [
            { word: 'Rain', isIntruder: false, explanation: 'Water precipitation' },
            { word: 'Hail', isIntruder: false, explanation: 'Ice precipitation' },
            { word: 'Snow', isIntruder: false, explanation: 'Crystal precipitation' },
            { word: 'Dew', isIntruder: false, explanation: 'Atmospheric condensation' },
            { word: 'Wind', isIntruder: true, explanation: 'Air movement, not a water precipitation' },
          ],
        },
      },
    ],
  },

  // Level 3: Architecture & Space
  {
    level: 3,
    abstractComplexity: 'moderate',
    timeLimitSeconds: 26,
    items: [
      {
        id: 'sem_3_1',
        categoryTheme: { he: 'אלמנטים מבניים נושאי משקל', en: 'Structural Load-Bearing Elements' },
        words: {
          he: [
            { word: 'עמוד', isIntruder: false, explanation: 'אלמנט תמיכה אנכי' },
            { word: 'קורה', isIntruder: false, explanation: 'אלמנט תמיכה אופקי' },
            { word: 'יסודות', isIntruder: false, explanation: 'בסיס נושא משקל' },
            { word: 'קיר תומך', isIntruder: false, explanation: 'קיר קונסטרוקטיבי' },
            { word: 'וילון', isIntruder: true, explanation: 'אלמנט הצללה ועיצוב בלבד' },
          ],
          en: [
            { word: 'Column', isIntruder: false, explanation: 'Vertical support element' },
            { word: 'Beam', isIntruder: false, explanation: 'Horizontal load bearer' },
            { word: 'Foundation', isIntruder: false, explanation: 'Structural base' },
            { word: 'Load-bearing Wall', isIntruder: false, explanation: 'Structural wall' },
            { word: 'Curtain', isIntruder: true, explanation: 'Purely decorative/shading element' },
          ],
        },
      },
    ],
  },

  // Level 4: Psychology / Emotions
  {
    level: 4,
    abstractComplexity: 'moderate',
    timeLimitSeconds: 25,
    items: [
      {
        id: 'sem_4_1',
        categoryTheme: { he: 'מידות וערכי מוסר חברתיים', en: 'Prosocial Virtues' },
        words: {
          he: [
            { word: 'חמלה', isIntruder: false, explanation: 'ערך אמפתי כלפי האחר' },
            { word: 'אדיבות', isIntruder: false, explanation: 'התחשבות ונעימות לזולת' },
            { word: 'אלטרואיזם', isIntruder: false, explanation: 'הקרבה למען טובת הכלל' },
            { word: 'נדיבות', isIntruder: false, explanation: 'נתינה לזולת' },
            { word: 'שאפתנות', isIntruder: true, explanation: 'מניע הישגי אישי, אינו בהכרח מידה מוסרית בין-אישית' },
          ],
          en: [
            { word: 'Compassion', isIntruder: false, explanation: 'Empathy toward others' },
            { word: 'Courtesy', isIntruder: false, explanation: 'Consideration for others' },
            { word: 'Altruism', isIntruder: false, explanation: 'Selflessness for common good' },
            { word: 'Generosity', isIntruder: false, explanation: 'Giving to others' },
            { word: 'Ambition', isIntruder: true, explanation: 'Self-focused achievement drive' },
          ],
        },
      },
    ],
  },

  // Level 5: Musical & Acoustic Structures
  {
    level: 5,
    abstractComplexity: 'moderate',
    timeLimitSeconds: 24,
    items: [
      {
        id: 'sem_5_1',
        categoryTheme: { he: 'פרמטרים יסודיים של צליל', en: 'Fundamental Acoustic Parameters' },
        words: {
          he: [
            { word: 'גובה צליל (Pitch)', isIntruder: false, explanation: 'תדר הצליל' },
            { word: 'עוצמה (Volume)', isIntruder: false, explanation: 'אמפליטודת גל הקול' },
            { word: 'גוון (Timbre)', isIntruder: false, explanation: 'אופי הצליל וההרמוניות' },
            { word: 'משך (Duration)', isIntruder: false, explanation: 'אורך הזמן שהצליל נשמע' },
            { word: 'מחיאות כפיים', isIntruder: true, explanation: 'פעולה אנושית ולא מאפיין פיזיקלי של גל קול' },
          ],
          en: [
            { word: 'Pitch', isIntruder: false, explanation: 'Frequency of vibration' },
            { word: 'Amplitude/Volume', isIntruder: false, explanation: 'Sound wave intensity' },
            { word: 'Timbre', isIntruder: false, explanation: 'Harmonic color of sound' },
            { word: 'Duration', isIntruder: false, explanation: 'Temporal length of tone' },
            { word: 'Applause', isIntruder: true, explanation: 'A human gesture, not a physics wave parameter' },
          ],
        },
      },
    ],
  },

  // Level 6: Historical & Sociopolitical Eras
  {
    level: 6,
    abstractComplexity: 'high',
    timeLimitSeconds: 22,
    items: [
      {
        id: 'sem_6_1',
        categoryTheme: { he: 'עקרונות מרכזיים של תנועת הנאורות', en: 'Key Enlightenment Principles' },
        words: {
          he: [
            { word: 'רציונליזם', isIntruder: false, explanation: 'השכל כמקור הידיעה העיקרי' },
            { word: 'חירות הפרט', isIntruder: false, explanation: 'זכויות טבעיות ואוטונומיה' },
            { word: 'ספקנות מדעית', isIntruder: false, explanation: 'בחינה ביקורתית של אמונות' },
            { word: 'הפרדת רשויות', isIntruder: false, explanation: 'איזון דמוקרטי כנגד עריצות' },
            { word: 'פאטליזם', isIntruder: true, explanation: 'אמונה בגורל עיוור קבוע מראש, מנוגדת לרוח הנאורות' },
          ],
          en: [
            { word: 'Rationalism', isIntruder: false, explanation: 'Reason as primary authority' },
            { word: 'Individual Liberty', isIntruder: false, explanation: 'Natural human rights' },
            { word: 'Scientific Skepticism', isIntruder: false, explanation: 'Empirical critical thinking' },
            { word: 'Separation of Powers', isIntruder: false, explanation: 'Democratic constitutional design' },
            { word: 'Fatalism', isIntruder: true, explanation: 'Belief that human action cannot change fate' },
          ],
        },
      },
    ],
  },

  // Level 7: Literature & Narrative Theory
  {
    level: 7,
    abstractComplexity: 'high',
    timeLimitSeconds: 20,
    items: [
      {
        id: 'sem_7_1',
        categoryTheme: { he: 'אמצעים רטוריים וספרותיים של השוואה והשאלה', en: 'Figurative Language Devices' },
        words: {
          he: [
            { word: 'מטאפורה', isIntruder: false, explanation: 'העברת משמעות ציורית ישירה' },
            { word: 'דימוי (סימילי)', isIntruder: false, explanation: 'השוואה מפורשת באמצעות כ\' הדמיון' },
            { word: 'האנשה', isIntruder: false, explanation: 'ייחוס תכונות אנוש לדומם' },
            { word: 'מטונימיה', isIntruder: false, explanation: 'שימוש בחלק לייצוג השלם או הגורם המקורב' },
            { word: 'אליטרציה', isIntruder: true, explanation: 'צלצול צלילי חזרתי בעיצורים (אמצעי פונטי ולא סמנטי)' },
          ],
          en: [
            { word: 'Metaphor', isIntruder: false, explanation: 'Direct symbolic comparison' },
            { word: 'Simile', isIntruder: false, explanation: 'Explicit comparison using like/as' },
            { word: 'Personification', isIntruder: false, explanation: 'Giving human traits to non-human' },
            { word: 'Metonymy', isIntruder: false, explanation: 'Referring to entity by associated attribute' },
            { word: 'Alliteration', isIntruder: true, explanation: 'Repetition of consonant sounds (phonetic, not semantic)' },
          ],
        },
      },
    ],
  },

  // Level 8: Philosophy of Mind & Epistemology
  {
    level: 8,
    abstractComplexity: 'high',
    timeLimitSeconds: 20,
    items: [
      {
        id: 'sem_8_1',
        categoryTheme: { he: 'מצבים קוגניטיביים של ידיעה ותפיסה ישירה', en: 'Direct Epistemic Mental States' },
        words: {
          he: [
            { word: 'תובנה', isIntruder: false, explanation: 'הבנה עמוקה ופתאומית של מהות' },
            { word: 'אינטואיציה', isIntruder: false, explanation: 'השגה מידית ללא היסק מודע' },
            { word: 'הכרה', isIntruder: false, explanation: 'תפיסה ומודעות אובייקטיבית' },
            { word: 'הבחנה', isIntruder: false, explanation: 'זיהוי הבדל מהותי בין מושגים' },
            { word: 'דוגמטיות', isIntruder: true, explanation: 'אחיזה עיוורת באקסיומה ללא בחינה' },
          ],
          en: [
            { word: 'Insight', isIntruder: false, explanation: 'Direct deep comprehension' },
            { word: 'Intuition', isIntruder: false, explanation: 'Immediate apprehension without reasoning' },
            { word: 'Recognition', isIntruder: false, explanation: 'Conscious awareness of truth' },
            { word: 'Discernment', isIntruder: false, explanation: 'Perceiving subtle differences' },
            { word: 'Dogmatism', isIntruder: true, explanation: 'Rigid adherence to doctrine without inquiry' },
          ],
        },
      },
    ],
  },

  // Level 9: Logic & Scientific Methodology
  {
    level: 9,
    abstractComplexity: 'philosophical',
    timeLimitSeconds: 18,
    items: [
      {
        id: 'sem_9_1',
        categoryTheme: { he: 'כשלים לוגיים בלתי-פורמליים', en: 'Informal Logical Fallacies' },
        words: {
          he: [
            { word: 'אד הומינם', isIntruder: false, explanation: 'תקיפת הטוען במקום הטיעון' },
            { word: 'איש קש', isIntruder: false, explanation: 'עיוות עמדת היריב כדי להפריכה בקלות' },
            { word: 'מדרון חלקלק', isIntruder: false, explanation: 'הנחה שצעד אחד יוביל בהכרח לקטסטרופה' },
            { word: 'הנחת המבוקש', isIntruder: false, explanation: 'שימוש במסקנה כהנחת יסוד' },
            { word: 'סילוגיזם', isIntruder: true, explanation: 'מבנה תקף של היסק לוגי (אינו כשל)' },
          ],
          en: [
            { word: 'Ad Hominem', isIntruder: false, explanation: 'Attacking person instead of argument' },
            { word: 'Straw Man', isIntruder: false, explanation: 'Misrepresenting opponent position' },
            { word: 'Slippery Slope', isIntruder: false, explanation: 'Assuming inevitable negative cascade' },
            { word: 'Begging the Question', isIntruder: false, explanation: 'Circular reasoning fallacy' },
            { word: 'Syllogism', isIntruder: true, explanation: 'A valid logical deductive inference structure (not a fallacy)' },
          ],
        },
      },
    ],
  },

  // Level 10: Deep Philosophical Concepts of Time and Being
  {
    level: 10,
    abstractComplexity: 'philosophical',
    timeLimitSeconds: 16,
    items: [
      {
        id: 'sem_10_1',
        categoryTheme: { he: 'מושגים המבטאים ארעיות וחלוף', en: 'Concepts Expressing Impermanence and Flux' },
        words: {
          he: [
            { word: 'בר-חלוף', isIntruder: false, explanation: 'מתקיים לזמן קצר בלבד' },
            { word: 'אפימרי', isIntruder: false, explanation: 'זמני, בן-יומו' },
            { word: 'טרנזיטורי', isIntruder: false, explanation: 'מצב מעבר זמני' },
            { word: 'ארעי', isIntruder: false, explanation: 'שאינו קבוע, חולף' },
            { word: 'אימננטי', isIntruder: true, explanation: 'פנימי, מהותי ובלתי נפרד (אינו קשור לחלוף זמני)' },
          ],
          en: [
            { word: 'Transient', isIntruder: false, explanation: 'Passing with time' },
            { word: 'Ephemeral', isIntruder: false, explanation: 'Lasting for a very short time' },
            { word: 'Fleeting', isIntruder: false, explanation: 'Swiftly disappearing' },
            { word: 'Perishable', isIntruder: false, explanation: 'Subject to decay and cessation' },
            { word: 'Immanent', isIntruder: true, explanation: 'Indwelling, inherent and essential (not transient)' },
          ],
        },
      },
    ],
  },
];
