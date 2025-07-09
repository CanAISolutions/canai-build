export const CONTEXT_NAME = 'canai';

export const allowedTracks = [
  'business-plan-builder',
  'social-media-campaign',
  'website-audit-feedback',
];

export function sampleFunction(input: string): string {
  if (!input) {
    throw new Error('Empty input');
  }
  return input.toUpperCase();
}
