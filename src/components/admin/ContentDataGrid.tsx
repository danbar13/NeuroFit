import React, { useState } from 'react';
import type {
  ExerciseDictionaryCategory,
  ExerciseDictionaryEntry,
  LanguagePayload,
  VisualSearchPayload,
  ProcessingSpeedPayload,
  WorkingMemoryPayload,
} from '../../types/database';
import {
  Edit2,
  Trash2,
  Code,
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ContentDataGridProps {
  category?: ExerciseDictionaryCategory;
  entries: ExerciseDictionaryEntry[];
  onEdit: (entry: ExerciseDictionaryEntry) => void;
  onDelete: (itemId: string) => Promise<void>;
  onToggleActive?: (entry: ExerciseDictionaryEntry) => Promise<void>;
}

export const ContentDataGrid: React.FC<ContentDataGridProps> = ({
  category: _category,
  entries,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inspectEntry, setInspectEntry] = useState<ExerciseDictionaryEntry | null>(null);

  // Filtered list
  const filteredEntries = entries.filter((item) => {
    if (levelFilter !== 'all' && item.target_level !== levelFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(term);
      const instructionMatch = item.instruction.toLowerCase().includes(term);
      const payloadStr = JSON.stringify(item.content_payload).toLowerCase();
      if (!titleMatch && !instructionMatch && !payloadStr.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const handleDeleteClick = async (itemId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק תרגיל זה ממאגר הנתונים?')) {
      try {
        setDeletingId(itemId);
        await onDelete(itemId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Render Category-Specific details column
  const renderDetails = (item: ExerciseDictionaryEntry) => {
    if (item.category === 'language') {
      const p = item.content_payload as LanguagePayload;
      return (
        <div className="text-xs">
          <div className="font-semibold text-slate-200">
            {p.target_word} ➔ <span className="text-emerald-400 font-bold">{p.correct_answer}</span>
          </div>
          <div className="text-slate-400 text-[11px] truncate max-w-xs">
            מסיחים: {p.distractors ? p.distractors.join(', ') : 'אין'}
          </div>
        </div>
      );
    }

    if (item.category === 'attention') {
      const p = item.content_payload as VisualSearchPayload;
      return (
        <div className="text-xs">
          <div className="font-semibold text-slate-200">
            מטרה: <span className="text-indigo-300">{p.target_item}</span> | מסיח: {p.distractor_item}
          </div>
          <div className="text-slate-400 text-[11px]">
            רשת: {p.grid_size} משבצות ({p.distractors_count} מסיחים)
          </div>
        </div>
      );
    }

    if (item.category === 'speed') {
      const p = item.content_payload as ProcessingSpeedPayload;
      return (
        <div className="text-xs">
          <div className="font-semibold text-slate-200">
            {p.stimulus_symbol} {p.stimulus_name} ({p.target_rule})
          </div>
          <div className="text-slate-400 text-[11px]">
            {p.rule_description} • {p.presentation_time_ms}ms
          </div>
        </div>
      );
    }

    if (item.category === 'memory') {
      const p = item.content_payload as WorkingMemoryPayload;
      return (
        <div className="text-xs">
          <div className="font-semibold text-slate-200">
            {p.theme_name} ({p.target_symbol} בתוך {p.container_symbol})
          </div>
          <div className="text-slate-400 text-[11px]">
            {p.objects_count} דלתות | {p.shuffle_speed_ms}ms | {p.hint_enabled ? 'כולל רמז' : 'ללא רמז'}
          </div>
        </div>
      );
    }

    return <span className="text-slate-400 text-xs">מידע מותאם אישית</span>;
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
      {/* Search & Filters Bar */}
      <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-850">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש לפי מילה, כותרת או תוכן..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">כל הרמות (1-10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>
                  רמה {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 self-end sm:self-center">
          נמצאו <span className="text-white font-bold">{filteredEntries.length}</span> רשומות במאגר
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/80">
            <tr>
              <th className="py-3 px-4">רמה</th>
              <th className="py-3 px-3">שפה</th>
              <th className="py-3 px-4">כותרת תרגיל</th>
              <th className="py-3 px-4">תוכן ופרמטרים</th>
              <th className="py-3 px-3 text-center">סטטוס</th>
              <th className="py-3 px-4 text-center">פעולות (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                  לא נמצאו רשומות מתאימות לחיפוש בקטגוריה זו.
                </td>
              </tr>
            ) : (
              filteredEntries.map((item) => (
                <tr key={item.item_id} className="hover:bg-slate-750/50 transition-colors">
                  {/* Level Badge */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                      רמה {item.target_level}
                    </span>
                  </td>

                  {/* Language */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        item.language_code === 'en'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {item.language_code}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-slate-400 text-[11px] truncate max-w-[200px]">
                      {item.instruction}
                    </div>
                  </td>

                  {/* Details / Payload summary */}
                  <td className="py-3 px-4">{renderDetails(item)}</td>

                  {/* Status Toggle */}
                  <td className="py-3 px-3 text-center">
                    {onToggleActive ? (
                      <button
                        onClick={() => onToggleActive(item)}
                        title={item.is_active ? 'פעיל (לחץ להשבתה)' : 'מושבת (לחץ להפעלה)'}
                        className="inline-flex items-center gap-1 text-[11px] hover:opacity-80 transition-opacity"
                      >
                        {item.is_active ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> פעיל
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> מושבת
                          </span>
                        )}
                      </button>
                    ) : (
                      <span className={item.is_active ? 'text-emerald-400' : 'text-slate-500'}>
                        {item.is_active ? 'פעיל' : 'מושבת'}
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* JSON inspect */}
                      <button
                        onClick={() => setInspectEntry(item)}
                        title="צפה ב-JSON הגולמי"
                        className="p-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(item)}
                        title="ערוך תרגיל"
                        className="p-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/50 text-amber-300 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        disabled={deletingId === item.item_id}
                        onClick={() => handleDeleteClick(item.item_id)}
                        title="מחק תרגיל"
                        className="p-1.5 bg-red-950/70 hover:bg-red-900 border border-red-700/50 text-red-300 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Inspection Modal */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-white">
                  נתוני DB (JSON Payload): {inspectEntry.item_id}
                </h3>
              </div>
              <button
                onClick={() => setInspectEntry(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded"
              >
                סגור
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
              {JSON.stringify(inspectEntry, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
