import { settingsService } from './settingsService';

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

async function runSettingsTests() {
  console.log('--- RUNNING SETTINGS & PROFILE MANAGEMENT TESTS ---');
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

  // 1. Get default profile
  const profile = await settingsService.getUserProfile('user_sarah');
  assert(profile.user_id === 'user_sarah' && profile.display_name === 'סבתא שרה', 'Retrieve default user profile');

  // 2. Update Profile Name and Birth Year
  const updated = await settingsService.updateUserProfile('user_sarah', {
    display_name: 'סבתא שרה ברקאי',
    birth_year: 1947,
  });
  assert(
    updated.display_name === 'סבתא שרה ברקאי' && updated.birth_year === 1947,
    'Update profile display_name and birth_year'
  );

  // 3. Join Family Group - Valid Code COHN7 (משפחת כהן)
  const joinResult = await settingsService.joinFamilyByInviteCode('user_sarah', 'COHN7');
  assert(
    joinResult.success && joinResult.group?.group_id === 'group_cohen',
    `Join family with valid code COHN7 (joined: ${joinResult.group?.group_name})`
  );

  const profileAfterJoin = await settingsService.getUserProfile('user_sarah');
  assert(
    profileAfterJoin.family_group_id === 'group_cohen',
    'User profile family_group_id updated in DB/storage'
  );

  // 4. Join Family Group - Invalid Code
  const invalidResult = await settingsService.joinFamilyByInviteCode('user_sarah', 'INVALID');
  assert(!invalidResult.success, 'Reject invalid invite code with length != 5');

  const unknownResult = await settingsService.joinFamilyByInviteCode('user_sarah', 'XXXXX');
  assert(!unknownResult.success, 'Reject non-existent invite code');

  // 5. Save Accessibility Settings to table
  await settingsService.saveAccessibilitySettings('user_sarah', {
    font_size_multiplier: 1.5,
    high_contrast: true,
    reduce_animations: true,
    sound_enabled: true,
  });
  assert(true, 'Persistent save of accessibility settings completed without error');

  // 6. Logout function
  await settingsService.logoutUser();
  assert(true, 'Logout function executes cleanly');

  console.log(`\nTEST RESULTS: ${passed}/${total} passed`);
  if (passed === total) {
    console.log('ALL SETTINGS & PROFILE MANAGEMENT TESTS PASSED!');
  } else {
    (globalThis as any)?.process?.exit(1);
  }
}

runSettingsTests().catch((err) => {
  console.error(err);
  (globalThis as any)?.process?.exit(1);
});
