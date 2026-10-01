export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface UserProfile {
  user_id: string;
  display_name: string;
  birth_year: number | null;
  total_coins: number;
  current_streak: number;
  family_group_id: string | null;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccessibilitySettings {
  user_id: string;
  font_size_multiplier: number; // 1.0 to 2.0
  high_contrast: boolean; // Yellow-on-black mode
  reduce_animations: boolean;
  sound_enabled: boolean;
  updated_at?: string;
}

export interface CognitiveProfile {
  user_id: string;
  memory_level: number; // 1-10
  attention_level: number; // 1-10
  speed_level: number; // 1-10
  language_level: number; // 1-10
  baseline_completed: boolean;
  last_assessed_at: string;
}

export interface DailySession {
  session_id: string;
  user_id: string;
  completed_at: string;
  coins_earned: number;
  duration_seconds: number;
}

export interface ExerciseLog {
  log_id?: string;
  session_id?: string | null;
  user_id: string;
  category: 'memory' | 'attention' | 'speed' | 'language';
  level_played: number;
  accuracy_score: number; // 0 - 100
  avg_response_time_ms: number;
  played_at?: string;
}

export interface FamilyGroup {
  group_id: string;
  group_name: string;
  invite_code: string;
  admin_user_id: string | null;
  created_at: string;
}

export interface UserBadge {
  badge_assignment_id?: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  icon_name: 'Sun' | 'Flame' | 'Sparkles' | 'Brain' | 'Trophy';
  awarded_at: string;
}

export interface FamilyNotification {
  notification_id: string;
  from_user_id: string;
  to_user_id: string;
  sender_name: string;
  message: string;
  notification_type: 'applause' | 'streak_celebration' | 'general' | 'encouragement';
  created_at: string;
  read_at?: string | null;
}

export type ExerciseDictionaryCategory = 'language' | 'attention' | 'speed' | 'memory';

export interface LanguagePayload {
  target_word: string;
  correct_answer: string;
  distractors: string[]; // e.g. ["Wet", "Far", "Large"]
}

export interface VisualSearchPayload {
  target_item: string; // e.g. "🍎 Red Apple" or image URL
  distractor_item: string; // e.g. "🍏 Green Apple"
  grid_size: number; // e.g. 4, 9, 16
  distractors_count: number;
  image_url?: string;
}

export interface ProcessingSpeedPayload {
  stimulus_name: string; // e.g. "Blue Square"
  stimulus_symbol: string; // e.g. "🟦"
  target_rule: 'color' | 'shape' | 'number' | 'custom';
  rule_description: string; // e.g. "Sort by color"
  options: Array<{
    label: string;
    symbol: string;
    is_correct: boolean;
  }>;
  presentation_time_ms: number;
}

export interface WorkingMemoryPayload {
  theme_name: string; // e.g. "Where is the dog?"
  target_symbol: string; // e.g. "🐶"
  container_symbol: string; // e.g. "🚪"
  objects_count: number; // 3, 4, 5, etc.
  shuffle_speed_ms: number;
  shuffle_count: number;
  hint_enabled: boolean;
}

export type ExerciseContentPayload =
  | LanguagePayload
  | VisualSearchPayload
  | ProcessingSpeedPayload
  | WorkingMemoryPayload
  | Record<string, any>;

export interface ExerciseDictionaryEntry {
  item_id: string;
  category: ExerciseDictionaryCategory;
  target_level: number; // 1 - 10
  language_code: 'he' | 'en';
  title: string;
  instruction: string;
  content_payload: ExerciseContentPayload;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
