{
  "baseline_test": {
    "welcome_screen": {
      "title": "ברוכים הבאים לאימון המוח שלכם!",
      "message": "כדי להתאים לכם אישית את תוכנית האימון, נשחק כעת 4 משחקונים קצרים. זה לא מבחן, אין פה טעויות, פשוט שחקו בקצב שלכם ובהנאה.",
      "start_button": "בואו נתחיל"
    },
    "exercises": [
      {
        "id": "ex_working_memory",
        "category": "working_memory",
        "name": "איפה הכלב?",
        "instruction": "היכן מסתתר הכלב?",
        "rationale": {
          "title": "זיכרון עבודה מרחבי",
          "what_we_train": "אנו מאמנים את קליפת המוח הקדם-מצחית לשמור ולעבד מידע ויזואלי לטווח קצר תוך כדי שינוי ומניפולציה.",
          "daily_benefit": "תרגול זה מסייע לנו בחיי היומיום לזכור פרטים לטווח קצר, כמו היכן הנחנו את המפתחות, לזכור הוראות הכוונה בזמן נהיגה, או לעקוב אחר מיקומם של נכדים בפארק."
        },
        "difficulty_levels": {
          "level_1": {
            "objects_count": 3,
            "shuffle_speed_ms": 1500,
            "shuffle_count": 2,
            "hint_enabled": true
          },
          "level_2": {
            "objects_count": 4,
            "shuffle_speed_ms": 1000,
            "shuffle_count": 4,
            "hint_enabled": false
          },
          "level_3": {
            "objects_count": 5,
            "shuffle_speed_ms": 700,
            "shuffle_count": 6,
            "hint_enabled": false
          }
        }
      },
      {
        "id": "ex_visual_search",
        "category": "attention",
        "name": "יוצא דופן",
        "instruction": "מצאו ולחצו על התפוח האדום.",
        "rationale": {
          "title": "קשב וסריקה חזותית",
          "what_we_train": "אנו מאמנים את יכולת המוח לסנן 'רעשי רקע' חזותיים ולהתמקד במטרה ספציפית במהירות.",
          "daily_benefit": "מסייע במשימות כמו מציאת חפץ מסוים במגירה עמוסה, איתור חבר בתוך קהל, או קריאת שלטי רחוב תוך התעלמות מפרסומות סביבן."
        },
        "difficulty_levels": {
          "level_1": {
            "target": "תפוח אדום",
            "distractors": "תפוחים ירוקים",
            "grid_size": 4,
            "distractors_count": 3
          },
          "level_2": {
            "target": "תפוח אדום",
            "distractors": "תפוחים ירוקים",
            "grid_size": 9,
            "distractors_count": 8
          },
          "level_3": {
            "target": "תפוח אדום",
            "distractors": "עגבניות ותפוחים ירוקים",
            "grid_size": 16,
            "distractors_count": 15
          }
        }
      },
      {
        "id": "ex_task_switching",
        "category": "processing_speed",
        "name": "מיון מהיר",
        "instruction_primary": "מיינו את הצורות לפי צבע.",
        "instruction_secondary": "שימו לב: כעת מיינו לפי צורה!",
        "rationale": {
          "title": "גמישות מחשבתית ומהירות עיבוד",
          "what_we_train": "אימון היכולת להחליף בין חוקים שונים במהירות (Task Switching) ותגובה מהירה לגירויים משתנים.",
          "daily_benefit": "תורם ליכולת לעבור בצורה חלקה בין משימות, למשל כשמבשלים וצריכים לענות פתאום לטלפון, או בעת קבלת החלטות מהירות בזמן נהיגה."
        },
        "difficulty_levels": {
          "level_1": {
            "switch_frequency": "low",
            "item_drop_speed_ms": 3000,
            "categories": ["color"]
          },
          "level_2": {
            "switch_frequency": "medium",
            "item_drop_speed_ms": 2000,
            "categories": ["color", "shape"]
          },
          "level_3": {
            "switch_frequency": "high",
            "item_drop_speed_ms": 1200,
            "categories": ["color", "shape", "size"]
          }
        }
      },
      {
        "id": "ex_semantic_retrieval",
        "category": "language",
        "name": "מילים והפכים",
        "instruction": "בחרו את המילה ההפוכה במשמעותה למילה המוצגת.",
        "rationale": {
          "title": "שליפה סמנטית",
          "what_we_train": "אנו מאמנים את מהירות ויעילות הגישה למאגר המילים והמושגים במוח (הלקסיקון המנטלי).",
          "daily_benefit": "עוזר למנוע את תופעת 'המילה שעומדת על קצה הלשון', משפר את שטף הדיבור והופך ניהול שיחות למהיר וטבעי יותר."
        },
        "difficulty_levels": {
          "level_1": {
            "word_pairs": [
              {"target": "קר", "correct": "חם", "options": ["רטוב", "רחוק", "גדול", "חם"]},
              {"target": "יום", "correct": "לילה", "options": ["שמש", "בוקר", "לילה", "שבוע"]}
            ]
          },
          "level_2": {
            "word_pairs": [
              {"target": "שקט", "correct": "רועש", "options": ["רגוע", "מהיר", "רועש", "עמוק"]},
              {"target": "ארוך", "correct": "קצר", "options": ["גבוה", "צר", "קצר", "דק"]}
            ]
          },
          "level_3": {
            "word_pairs": [
              {"target": "שכיח", "correct": "נדיר", "options": ["נפוץ", "מוזר", "נדיר", "רגיל"]},
              {"target": "קבוע", "correct": "זמני", "options": ["חלקי", "זמני", "תמידי", "רציף"]}
            ]
          }
        }
      }
    ]
  }
}