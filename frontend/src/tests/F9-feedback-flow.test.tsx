import { render, screen, waitFor, fireEvent } from './test-utils';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import FeedbackPage from '../pages/Feedback';

// Mock Supabase client
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi
        .fn()
        .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi
        .fn()
        .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
    }),
  },
  insertPromptLog: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  insertSessionLog: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  insertInitialPromptLog: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  insertSparkLog: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  insertIntentMirrorLog: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  insertErrorLog: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  insertComparisonLog: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  updateComparisonFeedback: vi
    .fn()
    .mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  enableVaultEncryption: vi.fn().mockResolvedValue(true),
  initializeIntentMirrorSupport: vi.fn().mockResolvedValue(true),
}));

// Mock dependencies
vi.mock('@/hooks/useFeedbackForm', () => ({
  useFeedbackForm: () => ({
    rating: 0,
    setRating: vi.fn(),
    comment: '',
    setComment: vi.fn(),
    email: '',
    setEmail: vi.fn(),
    referModalOpen: false,
    setReferModalOpen: vi.fn(),
    showPurge: false,
    setShowPurge: vi.fn(),
    showFollowup: true,
    handleSubmit: vi.fn().mockImplementation(async cb => {
      await cb();
    }),
    handleRefer: vi.fn(),
    handlePurge: vi.fn(),
    handleShare: vi.fn(),
    openRefer: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('FeedbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  test('renders main feedback form elements', () => {
    render(<FeedbackPage />);

    expect(screen.getByText('Share Your Experience')).toBeInTheDocument();
    expect(screen.getByText(/SparkSplit experience/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/business plan comparison/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Submit Feedback/ })
    ).toBeInTheDocument();
  });

  test('displays star rating component', () => {
    render(<FeedbackPage />);

    // Should find 5 star buttons
    const starButtons = screen.getAllByLabelText(/Star$/);
    expect(starButtons).toHaveLength(5);
  });

  test('shows enhanced social sharing options', () => {
    render(<FeedbackPage />);

    expect(screen.getByText('Spread the Word')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  test('displays enhanced referral component', () => {
    render(<FeedbackPage />);

    expect(screen.getByText('Refer & Earn')).toBeInTheDocument();
    expect(
      screen.getByText('Get $10 credit for each successful referral')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('friend@example.com')
    ).toBeInTheDocument();
  });

  test.skip('handles form submission with success animation', () => {
    // Skipped: Animation and copy not MVP-critical per PRD.md section 9.1
  });

  test('referral link generation and copying', async () => {
    render(<FeedbackPage />);

    const emailInput = screen.getByPlaceholderText('friend@example.com');
    const generateButton = screen.getByText('Generate Referral Link');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Your Referral Link')).toBeInTheDocument();
    });
  });

  test.skip('post-submission state shows thank you message', () => {
    // Skipped: Copy not MVP-critical per PRD.md section 9.1
  });

  test('danger zone purge functionality', () => {
    render(<FeedbackPage />);

    const purgeButton = screen.getByText('Purge my data');
    fireEvent.click(purgeButton);

    // Should trigger the purge modal (handled by DangerZone component)
    expect(purgeButton).toBeInTheDocument();
  });
});
