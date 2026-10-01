import React, { useState, useEffect } from 'react';
import type {
  ExerciseDictionaryCategory,
  ExerciseDictionaryEntry,
  LanguagePayload,
  VisualSearchPayload,
  ProcessingSpeedPayload,
  WorkingMemoryPayload,
} from '../../types/database';
import { PlusCircle, Save, X, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface ContentFormProps {
  category: ExerciseDictionaryCategory;
  initialData?: ExerciseDictionaryEntry | null;
  onSave: (entry: Omit<ExerciseDictionaryEntry, 'item_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel?: () => void;
}

export const ContentForm: React.FC<ContentFormProps> = ({
  category,
  initialData,
  onSave,
  onCancel,
}) => {
  // Common Fields
  const [targetLevel, setTargetLevel] = useState<number>(initialData?.target_level || 1);
  const [languageCode, setLanguageCode] = useState<'he' | 'en'>(initialData?.language_code || 'he');
  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [instruction, setInstruction] = useState<string>(
    initialData?.instruction ||
      (category === 'language'
        ? 'בחרו את המילה ההפוכה במשמעותה למילה המוצגת.'
        : category === 'attention'
        ? 'מצאו ולחצו על הפריט הייחודי ברשת.'
        : category === 'speed'
        ? 'מיינו במהירות את הפריטים לפי החוק המוצג.'
        : 'עקבו אחרי המטרה וזכרו היכן היא מסתתרת.')
  );
  const [isActive, setIsActive] = useState<boolean>(initialData ? initialData.is_active : true);

  // Category: Language (Semantic Retrieval)
  const langPayload = initialData?.content_payload as LanguagePayload | undefined;
  const [targetWord, setTargetWord] = useState<string>(langPayload?.target_word || '');
  const [correctAnswer, setCorrectAnswer] = useState<string>(langPayload?.correct_answer || '');
  const [distractorsInput, setDistractorsInput] = useState<string>(
    langPayload?.distractors ? langPayload.distractors.join(', ') : ''
  );

  // Category: Visual Search (Attention)
  const visPayload = initialData?.content_payload as VisualSearchPayload | undefined;
  const [targetItem, setTargetItem] = useState<string>(visPayload?.target_item || '🍎 תפוח אדום');
  const [distractorItem, setDistractorItem] = useState<string>(visPayload?.distractor_item || '🍏 תפוח ירוק');
  const [gridSize, setGridSize] = useState<number>(visPayload?.grid_size || 9);
  const [distractorsCount, setDistractorsCount] = useState<number>(visPayload?.distractors_count || 8);
  const [imageUrl, setImageUrl] = useState<string>(visPayload?.image_url || '');

  // Category: Processing Speed
  const spdPayload = initialData?.content_payload as ProcessingSpeedPayload | undefined;
  const [stimulusName, setStimulusName] = useState<string>(spdPayload?.stimulus_name || 'ריבוע כחול');
  const [stimulusSymbol, setStimulusSymbol] = useState<string>(spdPayload?.stimulus_symbol || '🟦');
  const [targetRule, setTargetRule] = useState<'color' | 'shape' | 'number' | 'custom'>(
    spdPayload?.target_rule || 'color'
  );
  const [ruleDescription, setRuleDescription] = useState<string>(
    spdPayload?.rule_description || 'מיינו לפי צבע: כחול מול כתום'
  );
  const [presentationTimeMs, setPresentationTimeMs] = useState<number>(
    spdPayload?.presentation_time_ms || 1800
  );

  // Category: Working Memory
  const memPayload = initialData?.content_payload as WorkingMemoryPayload | undefined;
  const [themeName, setThemeName] = useState<string>(memPayload?.theme_name || 'איפה הכלב?');
  const [targetSymbol, setTargetSymbol] = useState<string>(memPayload?.target_symbol || '🐶');
  const [containerSymbol, setContainerSymbol] = useState<string>(memPayload?.container_symbol || '🚪');
  const [objectsCount, setObjectsCount] = useState<number>(memPayload?.objects_count || 3);
  const [shuffleSpeedMs, setShuffleSpeedMs] = useState<number>(memPayload?.shuffle_speed_ms || 1200);
  const [shuffleCount, setShuffleCount] = useState<number>(memPayload?.shuffle_count || 3);
  const [hintEnabled, setHintEnabled] = useState<boolean>(memPayload?.hint_enabled ?? true);

  // State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync when initialData changes
  useEffect(() => {
    if (initialData) {
      setTargetLevel(initialData.target_level);
      setLanguageCode(initialData.language_code);
      setTitle(initialData.title);
      setInstruction(initialData.instruction);
      setIsActive(initialData.is_active);

      if (category === 'language') {
        const p = initialData.content_payload as LanguagePayload;
        setTargetWord(p.target_word || '');
        setCorrectAnswer(p.correct_answer || '');
        setDistractorsInput(p.distractors ? p.distractors.join(', ') : '');
      } else if (category === 'attention') {
        const p = initialData.content_payload as VisualSearchPayload;
        setTargetItem(p.target_item || '');
        setDistractorItem(p.distractor_item || '');
        setGridSize(p.grid_size || 9);
        setDistractorsCount(p.distractors_count || 8);
        setImageUrl(p.image_url || '');
      } else if (category === 'speed') {
        const p = initialData.content_payload as ProcessingSpeedPayload;
        setStimulusName(p.stimulus_name || '');
        setStimulusSymbol(p.stimulus_symbol || '');
        setTargetRule(p.target_rule || 'color');
        setRuleDescription(p.rule_description || '');
        setPresentationTimeMs(p.presentation_time_ms || 1800);
      } else if (category === 'memory') {
        const p = initialData.content_payload as WorkingMemoryPayload;
        setThemeName(p.theme_name || '');
        setTargetSymbol(p.target_symbol || '');
        setContainerSymbol(p.container_symbol || '');
        setObjectsCount(p.objects_count || 3);
        setShuffleSpeedMs(p.shuffle_speed_ms || 1200);
        setShuffleCount(p.shuffle_count || 3);
        setHintEnabled(p.hint_enabled ?? true);
      }
    }
  }, [initialData, category]);

  // Validation & Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('נא להזין כותרת / שם לתרגיל');
      return;
    }

    let payload: any = {};

    if (category === 'language') {
      if (!targetWord.trim() || !correctAnswer.trim()) {
        setErrorMessage('חובה להזין מילת מטרה (Target Word) ותשובה נכונה (Correct Answer)');
        return;
      }
      const parsedDistractors = distractorsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsedDistractors.length === 0) {
        setErrorMessage('נא להזין לפחות מסיח אחד (Distractor) מופרד בפסיקים');
        return;
      }

      payload = {
        target_word: targetWord.trim(),
        correct_answer: correctAnswer.trim(),
        distractors: parsedDistractors,
      } as LanguagePayload;
    } else if (category === 'attention') {
      if (!targetItem.trim() || !distractorItem.trim()) {
        setErrorMessage('חובה להזין פריט מטרה ופריט מסיח');
        return;
      }
      payload = {
        target_item: targetItem.trim(),
        distractor_item: distractorItem.trim(),
        grid_size: Number(gridSize),
        distractors_count: Number(distractorsCount),
        ...(imageUrl.trim() ? { image_url: imageUrl.trim() } : {}),
      } as VisualSearchPayload;
    } else if (category === 'speed') {
      if (!stimulusName.trim() || !stimulusSymbol.trim()) {
        setErrorMessage('חובה להזין שם גירוי וסמל גירוי');
        return;
      }
      payload = {
        stimulus_name: stimulusName.trim(),
        stimulus_symbol: stimulusSymbol.trim(),
        target_rule: targetRule,
        rule_description: ruleDescription.trim(),
        options: [
          { label: targetRule === 'color' ? 'מותאם' : 'עיגול', symbol: stimulusSymbol, is_correct: true },
          { label: targetRule === 'color' ? 'שונה' : 'ריבוע', symbol: '⬛', is_correct: false },
        ],
        presentation_time_ms: Number(presentationTimeMs),
      } as ProcessingSpeedPayload;
    } else if (category === 'memory') {
      if (!targetSymbol.trim() || !containerSymbol.trim()) {
        setErrorMessage('חובה להזין סמל מטרה וסמל מיכל');
        return;
      }
      payload = {
        theme_name: themeName.trim(),
        target_symbol: targetSymbol.trim(),
        container_symbol: containerSymbol.trim(),
        objects_count: Number(objectsCount),
        shuffle_speed_ms: Number(shuffleSpeedMs),
        shuffle_count: Number(shuffleCount),
        hint_enabled: hintEnabled,
      } as WorkingMemoryPayload;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        category,
        target_level: Number(targetLevel),
        language_code: languageCode,
        title: title.trim(),
        instruction: instruction.trim(),
        content_payload: payload,
        is_active: isActive,
      });

      // Clear if adding new
      if (!initialData) {
        setTitle('');
        setTargetWord('');
        setCorrectAnswer('');
        setDistractorsInput('');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'שגיאה בשמירת הנתונים במסד');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 mb-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {initialData ? (
            <Save className="w-5 h-5 text-amber-400" />
          ) : (
            <PlusCircle className="w-5 h-5 text-indigo-400" />
          )}
          <h2 className="text-base font-semibold text-white">
            {initialData ? `עריכת תרגיל: ${initialData.title}` : `הוספת תרגיל חדש לקטגוריה`}
          </h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-700/60 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
            ביטול עריכה
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Level, Language, Active Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              רמת קושי יעד (DDA Level 1-10)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={targetLevel}
                onChange={(e) => setTargetLevel(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="w-9 text-center font-bold text-sm bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 px-2 py-1 rounded">
                {targetLevel}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">שפת התרגיל</label>
            <select
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value as 'he' | 'en')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="he">עברית (Hebrew - he)</option>
              <option value="en">אנגלית (English - en)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">סטטוס זמינות</label>
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
              />
              <span>פעיל במאגר (Active in Workout Engine)</span>
            </label>
          </div>
        </div>

        {/* Row 2: Title & Instruction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              שם / כותרת התרגיל (Title) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: הפכים בנושא טמפרטורה"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              הוראה למתאמן (Instruction)
            </label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="הוראה שתוצג בראש המסך"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category-Specific Form Section */}
        <div className="pt-2 border-t border-slate-750">
          {category === 'language' && (
            <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-750">
              <span className="text-xs font-semibold text-emerald-400 block mb-1">
                פרמטרים לחשיבה מילולית (Semantic Retrieval)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    מילת מטרה (Target Word) *
                  </label>
                  <input
                    type="text"
                    value={targetWord}
                    onChange={(e) => setTargetWord(e.target.value)}
                    placeholder="למשל: קר"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    תשובה נכונה (Correct Answer) *
                  </label>
                  <input
                    type="text"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="למשל: חם"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  מסיחים מופרדים בפסיקים (Distractors, comma separated) *
                </label>
                <input
                  type="text"
                  value={distractorsInput}
                  onChange={(e) => setDistractorsInput(e.target.value)}
                  placeholder="רטוב, רחוק, גדול"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  required
                />
              </div>
            </div>
          )}

          {category === 'attention' && (
            <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-750">
              <span className="text-xs font-semibold text-indigo-400 block mb-1">
                פרמטרים לקשב וסריקה חזותית (Visual Search)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    פריט מטרה (Target Item / Emoji) *
                  </label>
                  <input
                    type="text"
                    value={targetItem}
                    onChange={(e) => setTargetItem(e.target.value)}
                    placeholder="למשל: 🍎 תפוח אדום"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    פריט מסיח (Distractor Item / Emoji) *
                  </label>
                  <input
                    type="text"
                    value={distractorItem}
                    onChange={(e) => setDistractorItem(e.target.value)}
                    placeholder="למשל: 🍏 תפוח ירוק"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">גודל רשת (Grid Size)</label>
                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value={4}>4 (רשת 2x2)</option>
                    <option value={9}>9 (רשת 3x3)</option>
                    <option value={16}>16 (רשת 4x4)</option>
                    <option value={20}>20 (רשת 5x4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">כמות מסיחים ברשת</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={distractorsCount}
                    onChange={(e) => setDistractorsCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    כתובת תמונה אופציונלית (Image URL)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (אופציונלי)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'speed' && (
            <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-755">
              <span className="text-xs font-semibold text-amber-400 block mb-1">
                פרמטרים למהירות עיבוד ומעבר משימות (Processing Speed)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    שם הגירוי (Stimulus Name) *
                  </label>
                  <input
                    type="text"
                    value={stimulusName}
                    onChange={(e) => setStimulusName(e.target.value)}
                    placeholder="למשל: ריבוע כחול"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    סמל/אימוג'י הגירוי (Symbol) *
                  </label>
                  <input
                    type="text"
                    value={stimulusSymbol}
                    onChange={(e) => setStimulusSymbol(e.target.value)}
                    placeholder="🟦"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">כלל סיווג (Target Rule)</label>
                  <select
                    value={targetRule}
                    onChange={(e) =>
                      setTargetRule(e.target.value as 'color' | 'shape' | 'number' | 'custom')
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="color">צבע (Color)</option>
                    <option value="shape">צורה (Shape)</option>
                    <option value="number">מספר/כמות (Number)</option>
                    <option value="custom">מותאם אישית (Custom)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    תיאור הכלל למתאמן (Rule Description)
                  </label>
                  <input
                    type="text"
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    placeholder="מיינו לפי צבע: כחול מול כתום"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  מהירות הצגה מקסימלית (Presentation Time MS)
                </label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="100"
                  value={presentationTimeMs}
                  onChange={(e) => setPresentationTimeMs(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {category === 'memory' && (
            <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-750">
              <span className="text-xs font-semibold text-blue-400 block mb-1">
                פרמטרים לזיכרון עבודה מרחבי (Working Memory)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">נושא (Theme Name)</label>
                  <input
                    type="text"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="איפה הכלב?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">סמל מטרה מוסתר (Target)</label>
                  <input
                    type="text"
                    value={targetSymbol}
                    onChange={(e) => setTargetSymbol(e.target.value)}
                    placeholder="🐶"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">סמל מיכל (Container)</label>
                  <input
                    type="text"
                    value={containerSymbol}
                    onChange={(e) => setContainerSymbol(e.target.value)}
                    placeholder="🚪"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">כמות חפצים (Doors 3-6)</label>
                  <input
                    type="number"
                    min="3"
                    max="6"
                    value={objectsCount}
                    onChange={(e) => setObjectsCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">זמן ערבוב (Shuffle MS)</label>
                  <input
                    type="number"
                    min="400"
                    max="3000"
                    step="100"
                    value={shuffleSpeedMs}
                    onChange={(e) => setShuffleSpeedMs(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">רמז מקדים מופעל</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={hintEnabled}
                      onChange={(e) => setHintEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span>הצג היכן המטרה לפני הערבוב</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-900/90 border border-slate-700/60 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mb-2 font-medium">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>תצוגה מקדימה של הגירוי (Live Stimulus Preview):</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
            {category === 'language' && (
              <div className="flex items-center gap-4 w-full justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">מילת מטרה:</span>
                  <span className="text-lg font-bold text-white">{targetWord || '(טרם הוגדר)'}</span>
                </div>
                <div className="text-center">
                  <span className="text-emerald-400 text-[11px] block">תשובה נכונה:</span>
                  <span className="font-semibold text-emerald-300">{correctAnswer || '(טרם הוגדר)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">מסיחים אפשריים:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {distractorsInput || 'אין'}
                  </span>
                </div>
              </div>
            )}

            {category === 'attention' && (
              <div className="flex items-center gap-4 w-full justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{targetItem.split(' ')[0] || '🎯'}</span>
                  <div>
                    <span className="text-slate-400 text-[11px] block">מטרה לחיפוש</span>
                    <span className="text-white font-semibold">{targetItem}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">מסיח ברשת</span>
                  <span className="text-slate-300">{distractorItem}</span>
                </div>
                <div className="bg-slate-900 px-2 py-1 rounded text-[11px] text-indigo-300 border border-indigo-800/40">
                  רשת: {gridSize} משבצות ({distractorsCount} מסיחים)
                </div>
              </div>
            )}

            {category === 'speed' && (
              <div className="flex items-center gap-4 w-full justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stimulusSymbol}</span>
                  <span className="text-white font-semibold">{stimulusName}</span>
                </div>
                <div className="text-xs text-amber-300">כלל: {ruleDescription}</div>
                <div className="text-[11px] text-slate-400 font-mono">{presentationTimeMs}ms</div>
              </div>
            )}

            {category === 'memory' && (
              <div className="flex items-center gap-4 w-full justify-between">
                <div className="text-white font-semibold">{themeName}</div>
                <div className="flex items-center gap-2 text-xl">
                  <span>{targetSymbol}</span>
                  <span className="text-xs text-slate-400">בתוך</span>
                  <span>{containerSymbol}</span>
                </div>
                <div className="text-[11px] text-blue-300 bg-slate-900 px-2 py-1 rounded">
                  {objectsCount} דלתות | {shuffleSpeedMs}ms
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 px-3.5 rounded-lg transition-colors"
            >
              ביטול
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold text-xs py-2 px-5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>שומר במסד...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{initialData ? 'עדכן תרגיל במסד' : 'שמור פריט למאגר (Insert to DB)'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
