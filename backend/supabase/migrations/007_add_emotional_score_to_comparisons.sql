-- Migration: Add emotional_score and score_source to comparisons
-- PRD: Task 6, Emotional Resonance Service

ALTER TABLE public.comparisons
  ADD COLUMN IF NOT EXISTS emotional_score JSONB,
  ADD COLUMN IF NOT EXISTS score_source TEXT CHECK (score_source IN ('hume', 'gpt4o'));

CREATE INDEX IF NOT EXISTS idx_comparisons_score_source ON public.comparisons(score_source); 