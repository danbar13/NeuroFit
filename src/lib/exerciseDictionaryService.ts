import type {
  ExerciseDictionaryCategory,
  ExerciseDictionaryEntry,
  LanguagePayload,
  VisualSearchPayload,
  ProcessingSpeedPayload,
  WorkingMemoryPayload,
} from '../types/database';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'neurofit_exercise_dictionary_v2';

// --------------------------------------------------------------------------
// Initial Seed Data across all 4 categories and levels 1-10
// --------------------------------------------------------------------------
export const INITIAL_EXERCISE_DICTIONARY: ExerciseDictionaryEntry[] = [
  // --- LANGUAGE (Semantic Retrieval) ---
  {
    item_id: 'lang_he_1',
    category: 'language',
    target_level: 1,
    language_code: 'he',
    title: 'הפכים בסיסיים: חום וקור',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'קר',
      correct_answer: 'חם',
      distractors: ['רטוב', 'רחוק', 'גדול'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_he_2',
    category: 'language',
    target_level: 2,
    language_code: 'he',
    title: 'הפכים: אור וחושך',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'אור',
      correct_answer: 'חושך',
      distractors: ['שמש', 'כוכב', 'יום'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_he_3',
    category: 'language',
    target_level: 3,
    language_code: 'he',
    title: 'הפכים: התחלה וסיום',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'התחלה',
      correct_answer: 'סוף',
      distractors: ['אמצע', 'צעד', 'מהיר'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_he_4',
    category: 'language',
    target_level: 4,
    language_code: 'he',
    title: 'הפכים: שקט ורעש',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'שקט',
      correct_answer: 'רעש',
      distractors: ['מוזיקה', 'שינה', 'עדין'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_he_5',
    category: 'language',
    target_level: 5,
    language_code: 'he',
    title: 'הפכים ברמה בינונית: עומק',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'עמוק',
      correct_answer: 'רדוד',
      distractors: ['מים', 'בריכה', 'צר'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_he_6',
    category: 'language',
    target_level: 6,
    language_code: 'he',
    title: 'הפכים: אומץ ופחד',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'אמיץ',
      correct_answer: 'פחדן',
      distractors: ['גיבור', 'שקט', 'חזק'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_he_7',
    category: 'language',
    target_level: 7,
    language_code: 'he',
    title: 'תכונות אופי מורכבות: נדיבות',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'נדיב',
      correct_answer: 'קמצן',
      distractors: ['עשיר', 'חכם', 'צנוע'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_he_8',
    category: 'language',
    target_level: 8,
    language_code: 'he',
    title: 'מונחים מופשטים: קביעות וארעיות',
    instruction: 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.',
    content_payload: {
      target_word: 'קבוע',
      correct_answer: 'ארעי',
      distractors: ['בית', 'יציב', 'ישן'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_en_1',
    category: 'language',
    target_level: 1,
    language_code: 'en',
    title: 'Basic Antonyms: Temperature',
    instruction: 'Select the word that is opposite in meaning to the target word.',
    content_payload: {
      target_word: 'Cold',
      correct_answer: 'Hot',
      distractors: ['Wet', 'Far', 'Large'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'lang_en_2',
    category: 'language',
    target_level: 2,
    language_code: 'en',
    title: 'Basic Antonyms: Brightness',
    instruction: 'Select the word that is opposite in meaning to the target word.',
    content_payload: {
      target_word: 'Light',
      correct_answer: 'Dark',
      distractors: ['Sun', 'Star', 'Day'],
    } as LanguagePayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },

  // --- ATTENTION (Visual Search) ---
  {
    item_id: 'att_1',
    category: 'attention',
    target_level: 1,
    language_code: 'he',
    title: 'סריקה חזותית בסיסית - רשת 2x2',
    instruction: 'מצאו ולחצו על התפוח האדום.',
    content_payload: {
      target_item: '🍎 תפוח אדום',
      distractor_item: '🍏 תפוחים ירוקים',
      grid_size: 4,
      distractors_count: 3,
    } as VisualSearchPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'att_2',
    category: 'attention',
    target_level: 2,
    language_code: 'he',
    title: 'סריקה חזותית בינונית - רשת 3x3',
    instruction: 'מצאו ולחצו על התפוח האדום בתוך הרשת.',
    content_payload: {
      target_item: '🍎 תפוח אדום',
      distractor_item: '🍏 תפוחים ירוקים',
      grid_size: 9,
      distractors_count: 8,
    } as VisualSearchPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'att_3',
    category: 'attention',
    target_level: 3,
    language_code: 'he',
    title: 'סריקה מתקדמת עם מסיח דמיון - 3x3',
    instruction: 'מצאו את התפוח האדום (שימו לב לתותים המסיחים!).',
    content_payload: {
      target_item: '🍎 תפוח אדום',
      distractor_item: '🍓 תות שדה',
      grid_size: 9,
      distractors_count: 8,
    } as VisualSearchPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'att_4',
    category: 'attention',
    target_level: 4,
    language_code: 'he',
    title: 'סריקה חזותית צפופה - רשת 4x4',
    instruction: 'מצאו את הכוכב הזוהר ברשת עמוסה.',
    content_payload: {
      target_item: '⭐ כוכב זהב',
      distractor_item: '✨ ניצוצות',
      grid_size: 16,
      distractors_count: 15,
    } as VisualSearchPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },

  // --- SPEED (Processing Speed & Task Switching) ---
  {
    item_id: 'spd_1',
    category: 'speed',
    target_level: 1,
    language_code: 'he',
    title: 'מיון צבעים בסיסי',
    instruction: 'מיינו את הפריטים לפי צבע לסל המתאים.',
    content_payload: {
      stimulus_name: 'ריבוע כחול',
      stimulus_symbol: '🟦',
      target_rule: 'color',
      rule_description: 'מיינו לפי צבע: כחול מול כתום',
      options: [
        { label: 'כחול', symbol: '🔵', is_correct: true },
        { label: 'כתום', symbol: '🟠', is_correct: false },
      ],
      presentation_time_ms: 2500,
    } as ProcessingSpeedPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'spd_2',
    category: 'speed',
    target_level: 2,
    language_code: 'he',
    title: 'החלפת חוק: מיון צורות',
    instruction: 'שימו לב: כעת מיינו לפי צורה!',
    content_payload: {
      stimulus_name: 'עיגול כתום',
      stimulus_symbol: '🟠',
      target_rule: 'shape',
      rule_description: 'מיינו לפי צורה: עיגול מול ריבוע',
      options: [
        { label: 'עיגול', symbol: '⚪', is_correct: true },
        { label: 'ריבוע', symbol: '⬛', is_correct: false },
      ],
      presentation_time_ms: 1800,
    } as ProcessingSpeedPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'spd_3',
    category: 'speed',
    target_level: 3,
    language_code: 'he',
    title: 'תגובה מהירה עם 3 אפשרויות',
    instruction: 'לחצו במהירות על הצבע התואם.',
    content_payload: {
      stimulus_name: 'משולש ירוק',
      stimulus_symbol: '🟢',
      target_rule: 'color',
      rule_description: 'מיינו לפי צבע: ירוק / אדום / צהוב',
      options: [
        { label: 'ירוק', symbol: '🟢', is_correct: true },
        { label: 'אדום', symbol: '🔴', is_correct: false },
        { label: 'צהוב', symbol: '🟡', is_correct: false },
      ],
      presentation_time_ms: 1200,
    } as ProcessingSpeedPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },

  // --- MEMORY (Working Memory) ---
  {
    item_id: 'mem_1',
    category: 'memory',
    target_level: 1,
    language_code: 'he',
    title: 'חפש את הכלב - 3 דלתות עם רמז',
    instruction: 'עקבו אחרי הכלב וזכרו מאחורי איזו דלת הוא מסתתר.',
    content_payload: {
      theme_name: 'איפה הכלב?',
      target_symbol: '🐶',
      container_symbol: '🚪',
      objects_count: 3,
      shuffle_speed_ms: 1500,
      shuffle_count: 2,
      hint_enabled: true,
    } as WorkingMemoryPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'mem_2',
    category: 'memory',
    target_level: 2,
    language_code: 'he',
    title: 'חפש את הכלב - 4 דלתות',
    instruction: 'עקבו בעיון אחרי הכלב כשהדלתות מתערבבות.',
    content_payload: {
      theme_name: 'איפה הכלב?',
      target_symbol: '🐶',
      container_symbol: '🚪',
      objects_count: 4,
      shuffle_speed_ms: 1000,
      shuffle_count: 4,
      hint_enabled: false,
    } as WorkingMemoryPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    item_id: 'mem_3',
    category: 'memory',
    target_level: 3,
    language_code: 'he',
    title: 'חפש את הכלב - 5 דלתות ערבוב מהיר',
    instruction: 'אתגר זיכרון עבודה מרחבי: 5 דלתות.',
    content_payload: {
      theme_name: 'איפה הכלב?',
      target_symbol: '🐶',
      container_symbol: '🚪',
      objects_count: 5,
      shuffle_speed_ms: 700,
      shuffle_count: 6,
      hint_enabled: false,
    } as WorkingMemoryPayload,
    is_active: true,
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
];

// --------------------------------------------------------------------------
// Storage Helpers
// --------------------------------------------------------------------------
function getStoredLocalData(): ExerciseDictionaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }
  // Initialize with seed data if not present
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EXERCISE_DICTIONARY));
  } catch {
    // Ignore storage errors
  }
  return [...INITIAL_EXERCISE_DICTIONARY];
}

function saveStoredLocalData(entries: ExerciseDictionaryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage errors
  }
}

// --------------------------------------------------------------------------
// Exercise Dictionary Service (CRUD + Supabase/Local sync)
// --------------------------------------------------------------------------
export const exerciseDictionaryService = {
  /**
   * Fetch all dictionary entries, optionally filtered by category
   */
  async getAll(category?: ExerciseDictionaryCategory): Promise<ExerciseDictionaryEntry[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('exercise_dictionary').select('*');
        if (category) {
          query = query.eq('category', category);
        }
        const { data, error } = await query.order('target_level', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as ExerciseDictionaryEntry[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    const localData = getStoredLocalData();
    if (category) {
      return localData.filter((item) => item.category === category);
    }
    return localData;
  },

  /**
   * Fetch entries by specific category and target level
   */
  async getByLevel(
    category: ExerciseDictionaryCategory,
    level: number,
    language: 'he' | 'en' = 'he'
  ): Promise<ExerciseDictionaryEntry[]> {
    const all = await this.getAll(category);
    return all.filter(
      (item) =>
        item.target_level === level &&
        item.is_active &&
        (item.language_code === language || item.language_code === undefined)
    );
  },

  /**
   * Create a new exercise entry
   */
  async create(
    entry: Omit<ExerciseDictionaryEntry, 'item_id' | 'created_at' | 'updated_at'>
  ): Promise<ExerciseDictionaryEntry> {
    const nowIso = new Date().toISOString();
    const newEntry: ExerciseDictionaryEntry = {
      ...entry,
      item_id: `ex_${entry.category}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('exercise_dictionary')
          .insert([newEntry])
          .select()
          .single();
        if (!error && data) {
          // Sync local as well
          const local = getStoredLocalData();
          saveStoredLocalData([data as ExerciseDictionaryEntry, ...local]);
          return data as ExerciseDictionaryEntry;
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving to local storage:', err);
      }
    }

    const local = getStoredLocalData();
    const updated = [newEntry, ...local];
    saveStoredLocalData(updated);
    return newEntry;
  },

  /**
   * Update an existing exercise entry
   */
  async update(
    itemId: string,
    updates: Partial<Omit<ExerciseDictionaryEntry, 'item_id' | 'created_at'>>
  ): Promise<ExerciseDictionaryEntry | null> {
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('exercise_dictionary')
          .update({ ...updates, updated_at: nowIso })
          .eq('item_id', itemId)
          .select()
          .single();
        if (!error && data) {
          const local = getStoredLocalData();
          saveStoredLocalData(
            local.map((item) => (item.item_id === itemId ? (data as ExerciseDictionaryEntry) : item))
          );
          return data as ExerciseDictionaryEntry;
        }
      } catch (err) {
        console.warn('Supabase update failed, fallback to local storage:', err);
      }
    }

    const local = getStoredLocalData();
    const targetIdx = local.findIndex((item) => item.item_id === itemId);
    if (targetIdx === -1) return null;

    const updatedEntry: ExerciseDictionaryEntry = {
      ...local[targetIdx],
      ...updates,
      updated_at: nowIso,
    };
    local[targetIdx] = updatedEntry;
    saveStoredLocalData(local);
    return updatedEntry;
  },

  /**
   * Delete an exercise entry by ID
   */
  async delete(itemId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('exercise_dictionary').delete().eq('item_id', itemId);
        if (!error) {
          const local = getStoredLocalData();
          saveStoredLocalData(local.filter((item) => item.item_id !== itemId));
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete failed, removing locally:', err);
      }
    }

    const local = getStoredLocalData();
    const filtered = local.filter((item) => item.item_id !== itemId);
    saveStoredLocalData(filtered);
    return true;
  },

  /**
   * Reset local storage back to baseline seed dictionary
   */
  async resetToDefaults(): Promise<ExerciseDictionaryEntry[]> {
    saveStoredLocalData([...INITIAL_EXERCISE_DICTIONARY]);
    return [...INITIAL_EXERCISE_DICTIONARY];
  },

  /**
   * Export all content as formatted JSON
   */
  async exportJson(): Promise<string> {
    const all = await this.getAll();
    return JSON.stringify(all, null, 2);
  },

  /**
   * Import content from JSON
   */
  async importJson(jsonString: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Input must be a JSON array of entries' };
      }
      saveStoredLocalData(parsed);
      return { success: true, count: parsed.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Invalid JSON format' };
    }
  },
};
