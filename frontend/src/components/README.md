# CanAI Frontend Components

<div align="center">

**🎨 React Component Library for the 9-Stage User Journey**

![React](https://img.shields.io/badge/react-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.5-blue.svg)
![Tailwind](https://img.shields.io/badge/tailwindcss-3.4-cyan.svg)
![Accessibility](https://img.shields.io/badge/WCAG-2.2%20AA-green.svg)

</div>

## 🌟 Overview

This directory contains all React components for the CanAI Emotional Sovereignty Platform, organized
by the 9-stage user journey (F1-F9) and supporting UI elements. Each component is built with
TypeScript, styled with Tailwind CSS, and designed to be accessible, performant, and emotionally
resonant.

### 🎭 Component Architecture

The components are organized into two main categories:

- **Journey Components**: Specific to each stage of the user journey (F1-F9)
- **Shared Components**: Reusable UI elements used across multiple stages

## 📁 Directory Structure

```
components/
├── 🎪 DiscoveryHook/              # F1: Landing & Trust Building
│   ├── Hero.tsx                   # Main hero section
│   ├── EnhancedHero.tsx          # Enhanced hero with animations
│   ├── CTAButtons.tsx            # Call-to-action buttons
│   ├── ProductCardsSection.tsx   # Product showcase
│   ├── EnhancedSecondaryCTAs.tsx # Secondary CTAs
│   ├── PsychologicalTrustIndicators.tsx # Trust building elements
│   └── MemberstackLoginButton.tsx # Authentication integration
│
├── 🎯 DiscoveryFunnel/            # F2: Quiz & Assessment (Future)
│   ├── QuizContainer.tsx         # Main quiz wrapper
│   ├── QuestionCard.tsx          # Individual question UI
│   ├── ProgressIndicator.tsx     # Progress tracking
│   └── ValidationFeedback.tsx    # Input validation feedback
│
├── ✨ SparkLayer/                 # F3: Engagement Amplification (Future)
│   ├── SparkContainer.tsx        # Main spark display
│   ├── SparkCard.tsx             # Individual spark UI
│   ├── SparkSelection.tsx        # Selection interface
│   └── RegenerationButton.tsx    # Spark regeneration
│
├── 💳 PurchaseFlow/               # F4: Payment Processing
│   ├── PricingModal.tsx          # Pricing display modal
│   ├── PricingCard.tsx           # Individual pricing cards
│   ├── StripeCheckout.tsx        # Stripe integration
│   └── PaymentConfirmation.tsx   # Success confirmation
│
├── 📝 DetailedInput/              # F5: Data Collection
│   ├── StepOneForm.tsx           # First step of detailed inputs
│   ├── StepTwoForm.tsx           # Second step of detailed inputs
│   ├── AutoSaveIndicator.tsx     # Auto-save status display
│   ├── FormValidation.tsx        # Input validation
│   └── ProgressTracker.tsx       # Form completion progress
│
├── 🪞 IntentMirror/               # F6: Intent Validation (Future)
│   ├── IntentSummary.tsx         # User intent summary
│   ├── ConfirmationDialog.tsx    # Intent confirmation
│   └── EditButton.tsx            # Edit intent option
│
├── 🎨 DeliverableGen/             # F7: Content Generation (Future)
│   ├── GenerationProgress.tsx    # AI generation progress
│   ├── DeliverableDisplay.tsx    # Generated content display
│   ├── RegenerateButton.tsx      # Content regeneration
│   └── DownloadOptions.tsx       # Export options
│
├── ⚖️ SparkSplit/                 # F8: Comparison Analysis
│   ├── ComparisonContainer.tsx   # Main comparison interface
│   ├── OutputComparison.tsx      # Side-by-side comparison
│   ├── VotingInterface.tsx       # User preference selection
│   └── TrustDeltaDisplay.tsx     # Trust score visualization
│
├── 💬 FeedbackCapture/            # F9: Feedback & Sharing (Future)
│   ├── RatingSystem.tsx          # Star rating interface
│   ├── FeedbackForm.tsx          # Detailed feedback form
│   ├── SocialSharing.tsx         # Social media sharing
│   └── ReferralSystem.tsx        # Referral link generation
│
├── 🧩 ui/                         # Base UI Components (shadcn/ui)
│   ├── button.tsx                # Button component
│   ├── card.tsx                  # Card component
│   ├── dialog.tsx                # Modal dialog
│   ├── form.tsx                  # Form components
│   ├── input.tsx                 # Input fields
│   ├── toast.tsx                 # Toast notifications
│   └── ...                       # Other shadcn/ui components
│
├── 🎨 enhanced/                   # Enhanced Component Variants
│   ├── EnhancedButton.tsx        # Button with animations
│   ├── EnhancedCard.tsx          # Card with hover effects
│   └── EnhancedModal.tsx         # Modal with transitions
│
├── 📱 ui-components/              # Custom UI Components
│   ├── LoadingSpinner.tsx        # Loading indicators
│   ├── EmptyState.tsx            # Empty state displays
│   ├── ErrorBoundary.tsx         # Error handling
│   └── ProgressBar.tsx           # Progress indicators
│
└── 🌟 Shared Components           # Reusable across stages
    ├── StandardBackground.tsx     # Consistent background
    ├── StandardCard.tsx          # Standardized card component
    ├── StandardTypography.tsx    # Typography system
    ├── TrustIndicators.tsx       # Trust building elements
    ├── ProductCards.tsx          # Product showcase cards
    ├── PreviewModal.tsx          # Content preview modal
    ├── PageHeader.tsx            # Page header component
    ├── CanAILogo.tsx            # Brand logo component
    ├── CanAICube.tsx            # Brand cube animation
    └── Confetti.tsx             # Celebration animations
```

## 🎪 F1: Discovery Hook Components

### Hero.tsx

```typescript
interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
  backgroundVariant?: 'default' | 'gradient' | 'video';
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaText,
  onCtaClick,
  backgroundVariant = 'default',
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <StandardBackground variant={backgroundVariant} />
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">{title}</h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        <StandardButton size="lg" onClick={onCtaClick} className="px-8 py-4 text-lg">
          {ctaText}
        </StandardButton>
      </div>
    </section>
  );
};
```

### PsychologicalTrustIndicators.tsx

```typescript
interface TrustIndicator {
  id: string;
  text: string;
  author?: string;
  type: 'testimonial' | 'trust_indicator' | 'sample_preview';
  emotionalTone: 'warm' | 'bold' | 'optimistic' | 'inspirational';
  trustScore: number;
}

export const PsychologicalTrustIndicators: React.FC = () => {
  const [indicators, setIndicators] = useState<TrustIndicator[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch trust indicators from API
    fetchTrustIndicators().then(setIndicators);
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Trusted by Thousands of Entrepreneurs
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {indicators.slice(currentIndex, currentIndex + 3).map(indicator => (
            <StandardCard key={indicator.id} variant="elevated">
              <div className="p-6">
                <blockquote className="text-lg mb-4 italic">"{indicator.text}"</blockquote>
                {indicator.author && (
                  <cite className="text-sm text-gray-600">— {indicator.author}</cite>
                )}
                <div className="mt-4 flex items-center">
                  <TrustScore score={indicator.trustScore} />
                  <EmotionalToneIndicator tone={indicator.emotionalTone} />
                </div>
              </div>
            </StandardCard>
          ))}
        </div>
      </div>
    </section>
  );
};
```

## 💳 F4: Purchase Flow Components

### PricingModal.tsx

```typescript
interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack?: 'business_builder' | 'social_email' | 'site_audit';
  onPurchase: (track: string, tier: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  selectedTrack,
  onPurchase,
}) => {
  const [pricingData, setPricingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPricingData().then(data => {
        setPricingData(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>Select the perfect plan for your business needs</DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid md:grid-cols-3 gap-6 py-6">
            {pricingData.map(plan => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isSelected={selectedTrack === plan.product_track}
                onSelect={() => onPurchase(plan.product_track, plan.tier)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

### PricingCard.tsx

```typescript
interface PricingCardProps {
  plan: {
    product_track: string;
    tier: string;
    price: number;
    description: string;
    features: string[];
    word_count_range?: string;
    emotional_benefits: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isSelected, onSelect }) => {
  return (
    <StandardCard
      variant={isSelected ? 'selected' : 'interactive'}
      className={cn(
        'relative transition-all duration-300',
        isSelected && 'ring-2 ring-primary-500 shadow-lg'
      )}
    >
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">{plan.description}</h3>
          <div className="text-3xl font-bold text-primary-600">
            ${plan.price}
            <span className="text-sm font-normal text-gray-500">/one-time</span>
          </div>
          {plan.word_count_range && (
            <p className="text-sm text-gray-600 mt-1">{plan.word_count_range}</p>
          )}
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {plan.emotional_benefits.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-2">Emotional Benefits:</h4>
            <ul className="space-y-1">
              {plan.emotional_benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <HeartIcon className="h-3 w-3 text-red-400 mr-2" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <StandardButton
          variant={isSelected ? 'default' : 'outline'}
          className="w-full"
          onClick={onSelect}
        >
          {isSelected ? 'Selected' : 'Choose Plan'}
        </StandardButton>
      </div>
    </StandardCard>
  );
};
```

## 📝 F5: Detailed Input Components

### StepOneForm.tsx

```typescript
interface StepOneFormProps {
  onNext: (data: StepOneData) => void;
  initialData?: Partial<StepOneData>;
  autoSave?: boolean;
}

export const StepOneForm: React.FC<StepOneFormProps> = ({
  onNext,
  initialData,
  autoSave = true,
}) => {
  const form = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: initialData,
  });

  const { watch } = form;
  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        saveFormProgress('step-one', watchedValues);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [watchedValues, autoSave]);

  const onSubmit = (data: StepOneData) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="businessDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your business in detail..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tell us about your business, what you do, and your vision.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Who are your ideal customers?"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe your ideal customers and their characteristics.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="uniqueValueProposition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique Value Proposition</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What makes your business unique?"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                What sets you apart from competitors? What unique value do you provide?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <AutoSaveIndicator />
          <StandardButton type="submit">Continue to Step 2</StandardButton>
        </div>
      </form>
    </Form>
  );
};
```

### AutoSaveIndicator.tsx

```typescript
interface AutoSaveIndicatorProps {
  status?: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status = 'idle',
  lastSaved,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Saving...',
          className: 'text-blue-600',
        };
      case 'saved':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Saved',
          className: 'text-green-600',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Save failed',
          className: 'text-red-600',
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Auto-save enabled',
          className: 'text-gray-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn('flex items-center space-x-2 text-sm', config.className)}>
      {config.icon}
      <span>{config.text}</span>
      {lastSaved && status === 'saved' && (
        <span className="text-gray-400">• {formatDistanceToNow(lastSaved)} ago</span>
      )}
    </div>
  );
};
```

## ⚖️ F8: SparkSplit Components

### ComparisonContainer.tsx

```typescript
interface ComparisonContainerProps {
  canaiOutput: string;
  genericOutput: string;
  onPreferenceSelect: (preference: 'canai' | 'generic' | 'no_preference') => void;
  onFeedbackSubmit: (feedback: string) => void;
}

export const ComparisonContainer: React.FC<ComparisonContainerProps> = ({
  canaiOutput,
  genericOutput,
  onPreferenceSelect,
  onFeedbackSubmit,
}) => {
  const [selectedPreference, setSelectedPreference] = useState<string | null>(null);
  const [trustDelta, setTrustDelta] = useState<number | null>(null);

  useEffect(() => {
    // Calculate trust delta based on user interaction
    calculateTrustDelta(canaiOutput, genericOutput).then(setTrustDelta);
  }, [canaiOutput, genericOutput]);

  const handlePreferenceSelect = (preference: string) => {
    setSelectedPreference(preference);
    onPreferenceSelect(preference as any);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Which Output Resonates More With You?</h2>
        <p className="text-gray-600">
          Compare these two approaches and choose the one that feels right for your business.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <OutputComparison
          title="CanAI Generated"
          content={canaiOutput}
          isSelected={selectedPreference === 'canai'}
          onSelect={() => handlePreferenceSelect('canai')}
          variant="canai"
        />

        <OutputComparison
          title="Generic AI"
          content={genericOutput}
          isSelected={selectedPreference === 'generic'}
          onSelect={() => handlePreferenceSelect('generic')}
          variant="generic"
        />
      </div>

      {trustDelta !== null && <TrustDeltaDisplay delta={trustDelta} />}

      <VotingInterface
        selectedPreference={selectedPreference}
        onPreferenceSelect={handlePreferenceSelect}
        onFeedbackSubmit={onFeedbackSubmit}
      />
    </div>
  );
};
```

## 🎨 Shared Components

### StandardCard.tsx

```typescript
interface StandardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'selected';
  children: React.ReactNode;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        {
          'shadow-lg hover:shadow-xl transition-shadow duration-300': variant === 'elevated',
          'cursor-pointer hover:bg-accent hover:shadow-md transition-all duration-200':
            variant === 'interactive',
          'ring-2 ring-primary-500 shadow-lg bg-primary-50': variant === 'selected',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

### TrustIndicators.tsx

```typescript
interface TrustIndicatorsProps {
  indicators: TrustIndicator[];
  variant?: 'carousel' | 'grid' | 'list';
  autoRotate?: boolean;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  indicators,
  variant = 'carousel',
  autoRotate = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (autoRotate && variant === 'carousel') {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % indicators.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [autoRotate, variant, indicators.length]);

  if (variant === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicators.map(indicator => (
          <TrustIndicatorCard key={indicator.id} indicator={indicator} />
        ))}
      </div>
    );
  }

  if (variant === 'carousel') {
    return (
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {indicators.map(indicator => (
              <div key={indicator.id} className="w-full flex-shrink-0">
                <TrustIndicatorCard indicator={indicator} />
              </div>
            ))}
          </div>
        </div>
        <CarouselControls
          currentIndex={currentIndex}
          totalItems={indicators.length}
          onIndexChange={setCurrentIndex}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {indicators.map(indicator => (
        <TrustIndicatorCard key={indicator.id} indicator={indicator} />
      ))}
    </div>
  );
};
```

## 🧪 Testing Components

### Component Testing Strategy

```typescript
// Example component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingModal } from '../PricingModal';

describe('PricingModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onPurchase: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pricing options when open', async () => {
    render(<PricingModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
    });
  });

  it('calls onPurchase when plan is selected', async () => {
    render(<PricingModal {...mockProps} />);

    const planButton = await screen.findByText('Choose Plan');
    fireEvent.click(planButton);

    expect(mockProps.onPurchase).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('is accessible via keyboard navigation', () => {
    render(<PricingModal {...mockProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });
});
```

## 🎨 Styling Guidelines

### Tailwind CSS Usage

```typescript
// Use consistent spacing scale
const spacingClasses = {
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

// Use semantic color classes
const colorClasses = {
  primary: 'bg-primary-500 text-white',
  secondary: 'bg-gray-100 text-gray-900',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-500 text-white',
};

// Use consistent typography scale
const typographyClasses = {
  h1: 'text-4xl md:text-6xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl md:text-3xl font-semibold',
  body: 'text-base leading-relaxed',
  caption: 'text-sm text-gray-600',
};
```

## ♿ Accessibility Guidelines

### WCAG 2.2 AA Compliance

```typescript
// Example accessible component
export const AccessibleButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  ariaLabel,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={cn(
        'min-h-[48px] min-w-[48px]', // Minimum touch target size
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2', // Focus indicators
        'disabled:opacity-50 disabled:cursor-not-allowed', // Disabled state
        props.className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Screen reader announcements
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return { announce };
};
```

## 🚀 Performance Optimization

### Component Optimization

```typescript
// Memoization for expensive computations
const MemoizedSparkComparison = memo(({ sparks, onSelect }) => {
  const comparisonData = useMemo(() => computeSparkComparison(sparks), [sparks]);

  return <SparkComparisonUI data={comparisonData} onSelect={onSelect} />;
});

// Lazy loading for route components
const LazyDiscoveryHook = lazy(() => import('./DiscoveryHook/Hero'));
const LazySparkLayer = lazy(() => import('./SparkLayer/SparkContainer'));

// Virtual scrolling for large lists
export const VirtualizedTrustIndicators: React.FC = ({ indicators }) => {
  return (
    <FixedSizeList height={400} itemCount={indicators.length} itemSize={120} itemData={indicators}>
      {({ index, style, data }) => (
        <div style={style}>
          <TrustIndicatorCard indicator={data[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

## 📞 Support & Resources

### Getting Help

- **Component API**: Check individual component TypeScript interfaces
- **Design System**: Review the [Design System Guide](../ui/README.md)
- **Testing**: See component test examples in `__tests__` directories
- **Accessibility**: Check WCAG 2.2 AA compliance guidelines

### External Resources

- **React Documentation**: [https://react.dev](https://react.dev)
- **shadcn/ui Components**: [https://ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **React Testing Library**:
  [https://testing-library.com/docs/react-testing-library/intro/](https://testing-library.com/docs/react-testing-library/intro/)

---

<div align="center">

**Built with ❤️ for the CanAI Emotional Sovereignty Platform**

[🏠 Frontend Home](../README.md) | [🎨 UI Components](./ui/README.md) |
[🧪 Testing](../tests/README.md)

</div>
