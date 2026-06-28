export type ModelSpeed = 'fast' | 'balanced' | 'premium';
export type ModelCost = 'free' | 'budget' | 'balanced' | 'premium';

export interface ZoukModel {
  id: string;
  displayName: string;
  speed: ModelSpeed;
  cost: ModelCost;
  description?: string;
  badge?: string;
}

export interface ModelGroup {
  label: string;
  emoji: string;
  models: ZoukModel[];
}

/*
 * ZOUK preset: a curated persona that maps to a configurable OpenRouter model.
 * To change the underlying model, update ZOUK_PRESET_MODEL_ID only.
 */
export const ZOUK_PRESET_ID = 'zouk';
export const ZOUK_PRESET_MODEL_ID = 'google/gemini-2.5-flash:free';
export const ZOUK_PROVIDER_NAME = 'OpenRouter';

export const MODEL_GROUPS: ModelGroup[] = [
  {
    label: 'Free',
    emoji: '🆓',
    models: [
      {
        id: ZOUK_PRESET_ID,
        displayName: 'ZOUK',
        speed: 'fast',
        cost: 'free',
        description: 'Default Zouk builder model for beta workflows.',
        badge: 'Default',
      },
      {
        id: 'google/gemini-2.5-flash:free',
        displayName: 'Gemini 2.5 Flash Free',
        speed: 'fast',
        cost: 'free',
        description: 'Fast free OpenRouter option.',
      },
      {
        id: 'meta-llama/llama-4-scout:free',
        displayName: 'Llama 4 Scout Free',
        speed: 'fast',
        cost: 'free',
        description: 'Free general builder model.',
      },
      {
        id: 'deepseek/deepseek-chat-v3-0324:free',
        displayName: 'DeepSeek V3 Free',
        speed: 'fast',
        cost: 'free',
        description: 'Free coding and planning model.',
      },
    ],
  },
  {
    label: 'Fast',
    emoji: '🚀',
    models: [
      { id: 'google/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', speed: 'fast', cost: 'budget' },
      { id: 'openai/gpt-4.1-mini', displayName: 'GPT-4.1 Mini', speed: 'fast', cost: 'budget' },
      { id: 'meta-llama/llama-4-maverick', displayName: 'Llama 4 Maverick', speed: 'fast', cost: 'budget' },
      { id: 'x-ai/grok-3-mini', displayName: 'Grok 3 Mini', speed: 'fast', cost: 'budget' },
    ],
  },
  {
    label: 'Deep',
    emoji: '🧩',
    models: [
      { id: 'anthropic/claude-sonnet-4', displayName: 'Claude Sonnet 4', speed: 'balanced', cost: 'balanced' },
      { id: 'openai/gpt-4.1', displayName: 'GPT-4.1', speed: 'balanced', cost: 'balanced' },
      { id: 'google/gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', speed: 'balanced', cost: 'balanced' },
      { id: 'deepseek/deepseek-r1', displayName: 'DeepSeek R1', speed: 'balanced', cost: 'balanced' },
    ],
  },
  {
    label: 'Elite',
    emoji: '🧠',
    models: [
      { id: 'anthropic/claude-opus-4', displayName: 'Claude Opus 4', speed: 'premium', cost: 'premium' },
      { id: 'openai/o3', displayName: 'OpenAI o3', speed: 'premium', cost: 'premium' },
      { id: 'google/gemini-2.5-pro-exp', displayName: 'Gemini 2.5 Pro Exp', speed: 'premium', cost: 'premium' },
    ],
  },
];

export const ALL_ZOUK_MODELS = MODEL_GROUPS.flatMap((g) => g.models);

/** Resolve display ID (e.g. 'zouk') to actual OpenRouter model ID for API calls. */
export function resolveZoukModel(id: string): string {
  if (id === ZOUK_PRESET_ID) {
    return ZOUK_PRESET_MODEL_ID;
  }

  return id;
}

export function getModelDisplay(id: string): ZoukModel | undefined {
  return ALL_ZOUK_MODELS.find((m) => m.id === id);
}

export const COST_BADGE: Record<ModelCost, { label: string; color: string }> = {
  free: { label: '🟢 Free', color: '#22c55e' },
  budget: { label: '🟢 Budget', color: '#22c55e' },
  balanced: { label: '🟡 Balanced', color: '#eab308' },
  premium: { label: '🔴 Premium', color: '#ef4444' },
};

export const SPEED_LABEL: Record<ModelSpeed, string> = {
  fast: '⚡ Fast',
  balanced: '🧩 Deep',
  premium: '🧠 Elite',
};
