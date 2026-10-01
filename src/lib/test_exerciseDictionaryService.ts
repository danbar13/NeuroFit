import { exerciseDictionaryService } from './exerciseDictionaryService';
import type { LanguagePayload } from '../types/database';

// Simple mock for localStorage in node/tsx environment if not present
if (typeof localStorage === 'undefined' || !localStorage.getItem) {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
  };
}

async function runTests() {
  console.log('--- RUNNING CMS EXERCISE DICTIONARY SERVICE TESTS ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
    }
  }

  // 1. Initial Seed Data
  const initial = await exerciseDictionaryService.getAll();
  assert(initial.length >= 10, `Initial seed items loaded (count=${initial.length})`);

  // 2. Filter by Category
  const langItems = await exerciseDictionaryService.getAll('language');
  assert(
    langItems.every((item) => item.category === 'language') && langItems.length > 0,
    `getAll('language') returns only language entries (count=${langItems.length})`
  );

  // 3. Create New Entry (Language - Semantic Retrieval)
  const created = await exerciseDictionaryService.create({
    category: 'language',
    target_level: 5,
    language_code: 'he',
    title: 'מילים נרדפות והפכים: חכם ומטופש',
    instruction: 'בחרו את המילה ההפוכה',
    content_payload: {
      target_word: 'חכם',
      correct_answer: 'טיפש',
      distractors: ['מלומד', 'מהיר', 'עשיר'],
    } as LanguagePayload,
    is_active: true,
  });
  assert(
    created.item_id.startsWith('ex_language_') && created.target_level === 5,
    `Create language exercise successful (item_id=${created.item_id})`
  );

  // 4. Read newly created item
  const level5Items = await exerciseDictionaryService.getByLevel('language', 5, 'he');
  const found = level5Items.find((i) => i.item_id === created.item_id);
  assert(
    !!found && (found.content_payload as LanguagePayload).target_word === 'חכם',
    'GetByLevel retrieves newly inserted item correctly'
  );

  // 5. Update Entry
  const updated = await exerciseDictionaryService.update(created.item_id, {
    title: 'כותרת מעודכנת לבדיקה',
    target_level: 6,
  });
  assert(
    updated?.title === 'כותרת מעודכנת לבדיקה' && updated?.target_level === 6,
    'Update exercise modifies fields and persists'
  );

  // 6. Delete Entry
  const deleteRes = await exerciseDictionaryService.delete(created.item_id);
  const afterDelete = await exerciseDictionaryService.getAll();
  assert(
    deleteRes === true && !afterDelete.some((i) => i.item_id === created.item_id),
    'Delete exercise removes entry completely from database'
  );

  // 7. JSON Export & Import
  const exportedJson = await exerciseDictionaryService.exportJson();
  assert(exportedJson.includes('lang_he_1'), 'JSON Export generates valid formatted data');

  const importRes = await exerciseDictionaryService.importJson(exportedJson);
  assert(importRes.success && importRes.count === afterDelete.length, 'JSON Import restores dictionary');

  console.log(`\nTEST RESULTS: ${passed}/${total} passed`);
  if (passed === total) {
    console.log('ALL CMS EXERCISE DICTIONARY TESTS PASSED!');
  } else {
    (globalThis as any)?.process?.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  (globalThis as any)?.process?.exit(1);
});
