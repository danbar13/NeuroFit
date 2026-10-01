export interface ExerciseRationale {
  title: string;
  what_we_train: string;
  daily_benefit: string;
}

export interface WorkingMemoryLevelConfig {
  objects_count: number;
  shuffle_speed_ms: number;
  shuffle_count: number;
  hint_enabled: boolean;
}

export interface VisualSearchLevelConfig {
  target: string;
  distractors: string;
  grid_size: number;
  distractors_count: number;
}

export interface TaskSwitchingLevelConfig {
  switch_frequency: 'low' | 'medium' | 'high';
  item_drop_speed_ms: number;
  categories: string[];
}

export interface SemanticWordPair {
  target: string;
  correct: string;
  options: string[];
}

export interface SemanticRetrievalLevelConfig {
  word_pairs: SemanticWordPair[];
}

export const baselineContentMatrix = {
  he: {
    welcome_screen: {
      title: "ברוכים הבאים לאימון המוח שלכם!",
      message: "כדי להתאים לכם אישית את תוכנית האימון, נשחק כעת 4 משחקונים קצרים. זה לא מבחן, אין פה טעויות, פשוט שחקו בקצב שלכם ובהנאה.",
      start_button: "בואו נתחיל"
    },
    exercises: {
      ex_working_memory: {
        id: "ex_working_memory",
        category: "working_memory",
        name: "איפה הכלב?",
        instruction: "היכן מסתתר הכלב?",
        rationale: {
          title: "זיכרון עבודה מרחבי",
          what_we_train: "אנו מאמנים את קליפת המוח הקדם-מצחית לשמור ולעבד מידע ויזואלי לטווח קצר תוך כדי שינוי ומניפולציה.",
          daily_benefit: "תרגול זה מסייע לנו בחיי היומיום לזכור פרטים לטווח קצר, כמו היכן הנחנו את המפתחות, לזכור הוראות הכוונה בזמן נהיגה, או לעקוב אחר מיקומם של נכדים בפארק."
        },
        difficulty_levels: {
          level_1: {
            objects_count: 3,
            shuffle_speed_ms: 1500,
            shuffle_count: 2,
            hint_enabled: true
          },
          level_2: {
            objects_count: 4,
            shuffle_speed_ms: 1000,
            shuffle_count: 4,
            hint_enabled: false
          },
          level_3: {
            objects_count: 5,
            shuffle_speed_ms: 700,
            shuffle_count: 6,
            hint_enabled: false
          }
        }
      },
      ex_visual_search: {
        id: "ex_visual_search",
        category: "attention",
        name: "יוצא דופן",
        instruction: "מצאו ולחצו על התפוח האדום.",
        rationale: {
          title: "קשב וסריקה חזותית",
          what_we_train: "אנו מאמנים את יכולת המוח לסנן 'רעשי רקע' חזותיים ולהתמקד במטרה ספציפית במהירות.",
          daily_benefit: "מסייע במשימות כמו מציאת חפץ מסוים במגירה עמוסה, איתור חבר בתוך קהל, או קריאת שלטי רחוב תוך התעלמות מפרסומות סביבן."
        },
        difficulty_levels: {
          level_1: {
            target: "תפוח אדום",
            distractors: "תפוחים ירוקים",
            grid_size: 4,
            distractors_count: 3
          },
          level_2: {
            target: "תפוח אדום",
            distractors: "תפוחים ירוקים",
            grid_size: 9,
            distractors_count: 8
          },
          level_3: {
            target: "תפוח אדום",
            distractors: "עגבניות ותפוחים ירוקים",
            grid_size: 16,
            distractors_count: 15
          }
        }
      },
      ex_task_switching: {
        id: "ex_task_switching",
        category: "processing_speed",
        name: "מיון מהיר",
        instruction_primary: "מיינו את הצורות לפי צבע.",
        instruction_secondary: "שימו לב: כעת מיינו לפי צורה!",
        rationale: {
          title: "גמישות מחשבתית ומהירות עיבוד",
          what_we_train: "אימון היכולת להחליף בין חוקים שונים במהירות (Task Switching) ותגובה מהירה לגירויים משתנים.",
          daily_benefit: "תורם ליכולת לעבור בצורה חלקה בין משימות, למשל כשמבשלים וצריכים לענות פתאום לטלפון, או בעת קבלת החלטות מהירות בזמן נהיגה."
        },
        difficulty_levels: {
          level_1: {
            switch_frequency: "low" as const,
            item_drop_speed_ms: 3000,
            categories: ["color"]
          },
          level_2: {
            switch_frequency: "medium" as const,
            item_drop_speed_ms: 2000,
            categories: ["color", "shape"]
          },
          level_3: {
            switch_frequency: "high" as const,
            item_drop_speed_ms: 1200,
            categories: ["color", "shape", "size"]
          }
        }
      },
      ex_semantic_retrieval: {
        id: "ex_semantic_retrieval",
        category: "language",
        name: "מילים והפכים",
        instruction: "בחרו את המילה ההפוכה במשמעותה למילה המוצגת.",
        rationale: {
          title: "שליפה סמנטית",
          what_we_train: "אנו מאמנים את מהירות ויעילות הגישה למאגר המילים והמושגים במוח (הלקסיקון המנטלי).",
          daily_benefit: "עוזר למנוע את תופעת 'המילה שעומדת על קצה הלשון', משפר את שטף הדיבור והופך ניהול שיחות למהיר וטבעי יותר."
        },
        difficulty_levels: {
          level_1: {
            word_pairs: [
              { target: "קר", correct: "חם", options: ["רטוב", "רחוק", "גדול", "חם"] },
              { target: "יום", correct: "לילה", options: ["שמש", "בוקר", "לילה", "שבוע"] }
            ]
          },
          level_2: {
            word_pairs: [
              { target: "שקט", correct: "רועש", options: ["רגוע", "מהיר", "רועש", "עמוק"] },
              { target: "ארוך", correct: "קצר", options: ["גבוה", "צר", "קצר", "דק"] }
            ]
          },
          level_3: {
            word_pairs: [
              { target: "שכיח", correct: "נדיר", options: ["נפוץ", "מוזר", "נדיר", "רגיל"] },
              { target: "קבוע", correct: "זמני", options: ["חלקי", "זמני", "תמידי", "רציף"] }
            ]
          }
        }
      }
    }
  },
  en: {
    welcome_screen: {
      title: "Welcome to Your Brain Workout!",
      message: "To personalize your training program, we'll now play 4 short games. This is not a test, there are no mistakes, simply play at your own pace and enjoy.",
      start_button: "Let's Begin"
    },
    exercises: {
      ex_working_memory: {
        id: "ex_working_memory",
        category: "working_memory",
        name: "Where is the Dog?",
        instruction: "Where is the dog hiding?",
        rationale: {
          title: "Spatial Working Memory",
          what_we_train: "We train the prefrontal cortex to hold and process short-term visual information during shifts and manipulations.",
          daily_benefit: "Helps remember short-term details in daily life, such as where you placed keys, driving directions, or keeping track of grandkids at the park."
        },
        difficulty_levels: {
          level_1: {
            objects_count: 3,
            shuffle_speed_ms: 1500,
            shuffle_count: 2,
            hint_enabled: true
          },
          level_2: {
            objects_count: 4,
            shuffle_speed_ms: 1000,
            shuffle_count: 4,
            hint_enabled: false
          },
          level_3: {
            objects_count: 5,
            shuffle_speed_ms: 700,
            shuffle_count: 6,
            hint_enabled: false
          }
        }
      },
      ex_visual_search: {
        id: "ex_visual_search",
        category: "attention",
        name: "Odd One Out",
        instruction: "Find and tap the red apple.",
        rationale: {
          title: "Attention & Visual Search",
          what_we_train: "Trains the brain to filter visual background noise and hone in quickly on a specific target.",
          daily_benefit: "Assists in tasks like finding a specific item in a crowded drawer, spotting a friend in a crowd, or reading street signs while filtering out surrounding ads."
        },
        difficulty_levels: {
          level_1: {
            target: "Red Apple",
            distractors: "Green Apples",
            grid_size: 4,
            distractors_count: 3
          },
          level_2: {
            target: "Red Apple",
            distractors: "Green Apples",
            grid_size: 9,
            distractors_count: 8
          },
          level_3: {
            target: "Red Apple",
            distractors: "Tomatoes and Green Apples",
            grid_size: 16,
            distractors_count: 15
          }
        }
      },
      ex_task_switching: {
        id: "ex_task_switching",
        category: "processing_speed",
        name: "Quick Sort",
        instruction_primary: "Sort the shapes by color.",
        instruction_secondary: "Notice: Now sort by shape!",
        rationale: {
          title: "Mental Flexibility & Processing Speed",
          what_we_train: "Trains the capacity to switch rapidly between different rules (Task Switching) and respond promptly to changing stimuli.",
          daily_benefit: "Fosters smooth transitions between tasks, such as cooking while needing to answer an unexpected phone call, or making quick decisions while driving."
        },
        difficulty_levels: {
          level_1: {
            switch_frequency: "low" as const,
            item_drop_speed_ms: 3000,
            categories: ["color"]
          },
          level_2: {
            switch_frequency: "medium" as const,
            item_drop_speed_ms: 2000,
            categories: ["color", "shape"]
          },
          level_3: {
            switch_frequency: "high" as const,
            item_drop_speed_ms: 1200,
            categories: ["color", "shape", "size"]
          }
        }
      },
      ex_semantic_retrieval: {
        id: "ex_semantic_retrieval",
        category: "language",
        name: "Words & Opposites",
        instruction: "Choose the word opposite in meaning to the shown word.",
        rationale: {
          title: "Semantic Retrieval",
          what_we_train: "Trains the speed and efficiency of accessing the brain's mental lexicon of words and concepts.",
          daily_benefit: "Helps prevent the 'tip-of-the-tongue' phenomenon, enhances verbal fluency, and makes conversation flow more naturally."
        },
        difficulty_levels: {
          level_1: {
            word_pairs: [
              { target: "Cold", correct: "Hot", options: ["Wet", "Far", "Large", "Hot"] },
              { target: "Day", correct: "Night", options: ["Sun", "Morning", "Night", "Week"] }
            ]
          },
          level_2: {
            word_pairs: [
              { target: "Quiet", correct: "Noisy", options: ["Calm", "Fast", "Noisy", "Deep"] },
              { target: "Long", correct: "Short", options: ["Tall", "Narrow", "Short", "Thin"] }
            ]
          },
          level_3: {
            word_pairs: [
              { target: "Common", correct: "Rare", options: ["Popular", "Strange", "Rare", "Normal"] },
              { target: "Permanent", correct: "Temporary", options: ["Partial", "Temporary", "Endless", "Continuous"] }
            ]
          }
        }
      }
    }
  }
};
