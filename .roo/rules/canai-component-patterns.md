---
description:
globs:
alwaysApply: false
---

# CanAI Component Patterns Guidelines

## Purpose

Standardize React component development patterns across the 9-stage user journey (F1-F9), ensuring
consistency, reusability, accessibility, and emotional resonance through the established design
system and component architecture.

## Scope

Apply to all React components in the CanAI platform, leveraging the existing
[ui component system](mdc:frontend/src/components/ui/README.md) and journey-specific components
outlined in [component documentation](mdc:frontend/src/components/README.md).

## Core Principles

### Component Architecture

- **Journey-Based Organization**: Group components by user journey stage (F1-F9)
- **UI Foundation**: Use [shadcn/ui components](mdc:frontend/src/components/ui) as the foundation
  layer
- **Standard Components**: Leverage
  [StandardButton](mdc:frontend/src/components/ui/standard-button.tsx),
  [StandardModal](mdc:frontend/src/components/ui/standard-modal.tsx), etc.
- **Enhanced Variants**: Use [EnhancedButton](mdc:frontend/src/components/ui/enhanced-button.tsx)
  for advanced interactions

### Design System Compliance

- **Emotional Variants**: Support `warm`, `bold`, `optimistic`, `inspirational` variants for
  emotional resonance
- **Accessibility First**: WCAG 2.2 AA compliance is mandatory
- **TypeScript Strict**: Full TypeScript support with proper interfaces
- **Performance Optimized**: Lazy loading, memoization, and efficient rendering

## Implementation Patterns

### ✅ Standard Component Usage

```typescript
import { StandardButton } from '@/components/ui/standard-button';
import { StandardCard } from '@/components/StandardCard';
import { StandardTypography } from '@/components/StandardTypography';

// Use standard components with emotional variants
export const DiscoveryHookSection = () => {
  return (
    <StandardCard variant="glass" className="emotional-warmth">
      <StandardTypography variant="h1" emotional="inspirational">
        Transform Your Business Vision
      </StandardTypography>

      <StandardButton
        variant="optimistic"
        size="lg"
        loading={isGenerating}
        loadingText="Creating Your Sparks..."
        icon={<SparkIcon />}
        iconPosition="left"
        onClick={handleGenerateSparks}
        aria-label="Generate business sparks"
      >
        Start Your Journey
      </StandardButton>
    </StandardCard>
  );
};
```

### ✅ Journey-Specific Component Structure

```typescript
// F1: Discovery Hook Components
export interface DiscoveryHookProps {
  trustIndicators: TrustIndicator[];
  onEngagement: (action: string) => void;
  emotionalTone: 'warm' | 'bold' | 'optimistic' | 'inspirational';
}

export const DiscoveryHook: React.FC<DiscoveryHookProps> = ({
  trustIndicators,
  onEngagement,
  emotionalTone = 'optimistic',
}) => {
  return (
    <section className="discovery-hook" data-stage="F1">
      <EnhancedHero
        variant={emotionalTone}
        trustIndicators={trustIndicators}
        onCtaClick={() => onEngagement('cta_clicked')}
      />
      <PsychologicalTrustIndicators indicators={trustIndicators} variant="carousel" autoRotate />
    </section>
  );
};
```

### ✅ State Management Patterns

```typescript
// Journey state management with proper types
interface JourneyState {
  currentStage: JourneyStage;
  userData: UserData;
  progress: ProgressData;
  trustScore: number;
}

export const useJourneyState = () => {
  const [state, setState] = useState<JourneyState>(initialState);

  const updateStage = useCallback((stage: JourneyStage) => {
    setState(prev => ({
      ...prev,
      currentStage: stage,
      progress: calculateProgress(stage),
    }));

    // Track stage progression
    trackJourneyProgression(stage);
  }, []);

  return {
    state,
    updateStage,
    isComplete: state.progress.percentage >= 100,
  };
};
```

### ✅ Error Boundary Implementation

```typescript
// Journey-aware error boundaries
export class JourneyErrorBoundary extends React.Component<
  PropsWithChildren<{ stage: JourneyStage }>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: PropsWithChildren<{ stage: JourneyStage }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to analytics with journey context
    logError({
      error: error.message,
      stage: this.props.stage,
      errorInfo,
      action: 'component_error',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          stage={this.props.stage}
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

### ✅ Accessibility Patterns

```typescript
// Comprehensive accessibility implementation
export const AccessibleComponent: React.FC<ComponentProps> = ({ children, ...props }) => {
  const { announce } = useAccessibility();
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    announce(isExpanded ? 'Section collapsed' : 'Section expanded', 'polite');
  };

  return (
    <div role="region" aria-labelledby={`heading-${contentId}`} className="accessible-component">
      <h2 id={`heading-${contentId}`} className="sr-only">
        Component Section
      </h2>

      <button
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={handleToggle}
        className="expand-toggle"
      >
        {isExpanded ? 'Collapse' : 'Expand'} Content
      </button>

      <div
        id={contentId}
        aria-hidden={!isExpanded}
        className={cn('transition-all duration-300', isExpanded ? 'opacity-100' : 'opacity-0 h-0')}
      >
        {children}
      </div>
    </div>
  );
};
```

## Journey-Specific Patterns

### F1: Discovery Hook Components

```typescript
// Trust-building with emotional resonance
export const PsychologicalTrustIndicators: React.FC<TrustIndicatorProps> = ({
  indicators,
  variant = 'grid',
  autoRotate = false,
}) => {
  return (
    <section className="trust-indicators" aria-label="Trust indicators">
      {variant === 'carousel' ? (
        <TrustCarousel indicators={indicators} autoRotate={autoRotate} />
      ) : (
        <TrustGrid indicators={indicators} />
      )}
    </section>
  );
};
```

### F3: Spark Layer Components

```typescript
// Interactive spark selection with feedback
export const SparkSelector: React.FC<SparkSelectorProps> = ({
  sparks,
  onSelection,
  emotionalTone,
}) => {
  const [selectedSpark, setSelectedSpark] = useState<Spark | null>(null);

  return (
    <div className="spark-selector" data-emotional-tone={emotionalTone}>
      {sparks.map(spark => (
        <SparkCard
          key={spark.id}
          spark={spark}
          selected={selectedSpark?.id === spark.id}
          onSelect={spark => {
            setSelectedSpark(spark);
            onSelection(spark);
            trackSparkSelection(spark);
          }}
          trustScore={spark.trustScore}
          emotionalResonance={spark.emotionalResonance}
        />
      ))}
    </div>
  );
};
```

### F8: SparkSplit Components

```typescript
// Comparison interface with trust metrics
export const SparkSplitComparison: React.FC<ComparisonProps> = ({
  canaiOutput,
  genericOutput,
  onPreferenceSubmit,
}) => {
  return (
    <ComparisonContainer className="sparksplit-comparison">
      <OutputSection
        title="CanAI Enhanced"
        output={canaiOutput}
        trustDelta={canaiOutput.trustDelta}
        emotionalResonance={canaiOutput.emotionalResonance}
        variant="enhanced"
      />

      <OutputSection
        title="Generic Output"
        output={genericOutput}
        trustDelta={genericOutput.trustDelta}
        emotionalResonance={genericOutput.emotionalResonance}
        variant="generic"
      />

      <PreferenceSelector onSubmit={onPreferenceSubmit} />
    </ComparisonContainer>
  );
};
```

## Performance Patterns

### ✅ Lazy Loading & Code Splitting

```typescript
// Route-based code splitting
const DiscoveryHook = lazy(() => import('@/pages/DiscoveryHook'));
const SparkLayer = lazy(() => import('@/pages/SparkLayer'));
const DeliverableGeneration = lazy(() => import('@/pages/DeliverableGeneration'));

// Component-based lazy loading
const LazyModal = lazy(() => import('@/components/ui/standard-modal'));

export const App = () => {
  return (
    <Suspense fallback={<LoadingState variant="page" />}>
      <Routes>
        <Route path="/" element={<DiscoveryHook />} />
        <Route path="/sparks" element={<SparkLayer />} />
        <Route path="/generate" element={<DeliverableGeneration />} />
      </Routes>
    </Suspense>
  );
};
```

### ✅ Memoization Patterns

```typescript
// Strategic memoization for expensive operations
export const ExpensiveComponent: React.FC<Props> = memo(({ data, onUpdate, trustScore }) => {
  const processedData = useMemo(() => {
    return processLargeDataSet(data);
  }, [data]);

  const handleUpdate = useCallback(
    (newData: Data) => {
      onUpdate(newData);
      trackDataUpdate(newData);
    },
    [onUpdate]
  );

  // Only re-render if trust score significantly changes
  return useMemo(
    () => (
      <div className="expensive-component">
        <TrustScoreDisplay score={trustScore} />
        <DataVisualization data={processedData} />
      </div>
    ),
    [processedData, Math.floor(trustScore * 10) / 10]
  );
});
```

## Testing Patterns

### ✅ Component Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('SparkSelector', () => {
  const mockSparks = [
    { id: '1', title: 'Spark 1', trustScore: 0.85 },
    { id: '2', title: 'Spark 2', trustScore: 0.92 },
  ];

  it('renders sparks with trust scores', () => {
    render(<SparkSelector sparks={mockSparks} onSelection={vi.fn()} emotionalTone="optimistic" />);

    expect(screen.getByText('Spark 1')).toBeInTheDocument();
    expect(screen.getByText('Spark 2')).toBeInTheDocument();
  });

  it('meets accessibility standards', async () => {
    const { container } = render(
      <SparkSelector sparks={mockSparks} onSelection={vi.fn()} emotionalTone="optimistic" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('tracks spark selection analytics', async () => {
    const onSelection = vi.fn();

    render(
      <SparkSelector sparks={mockSparks} onSelection={onSelection} emotionalTone="optimistic" />
    );

    fireEvent.click(screen.getByText('Spark 1'));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith(mockSparks[0]);
    });
  });
});
```

## Anti-Patterns

### ❌ Avoid These Patterns

```typescript
// DON'T: Direct HTML elements without accessibility
<button onClick={handleClick}>Click me</button>

// DON'T: Inconsistent styling
<div className="custom-button-style">Button</div>

// DON'T: Missing error boundaries
<ComplexComponent /> // Could crash entire app

// DON'T: Prop drilling without context
<ComponentA data={data} onUpdate={onUpdate} />
  <ComponentB data={data} onUpdate={onUpdate} />
    <ComponentC data={data} onUpdate={onUpdate} />

// DON'T: Missing TypeScript types
const Component = ({ data, onUpdate }) => {
```

### ✅ Correct Patterns

```typescript
// DO: Use standard components with proper accessibility
<StandardButton
  variant="optimistic"
  onClick={handleClick}
  aria-label="Start your business transformation"
  loading={isProcessing}
>
  Click me
</StandardButton>

// DO: Wrap in error boundaries
<JourneyErrorBoundary stage="F3">
  <SparkLayer />
</JourneyErrorBoundary>

// DO: Use context for shared state
<JourneyProvider>
  <ComponentA />
</JourneyProvider>

// DO: Full TypeScript support
interface ComponentProps {
  data: BusinessData;
  onUpdate: (data: BusinessData) => void;
}

const Component: React.FC<ComponentProps> = ({ data, onUpdate }) => {
```

## Integration Requirements

### Analytics Integration

```typescript
// Track component interactions
const useComponentAnalytics = (componentName: string) => {
  const trackInteraction = useCallback(
    (action: string, properties?: object) => {
      posthog.capture(`${componentName}_${action}`, {
        component: componentName,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    },
    [componentName]
  );

  return { trackInteraction };
};
```

### Performance Monitoring

```typescript
// Monitor component render performance
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name.includes(componentName)) {
          trackPerformanceMetric({
            component: componentName,
            renderTime: entry.duration,
            type: 'component_render',
          });
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, [componentName]);
};
```

## Quality Standards

- **Accessibility**: All components must pass WCAG 2.2 AA compliance
- **Performance**: Components should render within 100ms for optimal UX
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Testing**: Minimum 90% test coverage for critical user journey components
- **Documentation**: All public interfaces must have comprehensive JSDoc comments

---

**Created**: January 2025 **Version**: 1.0.0 **Alignment**: PRD Sections 5, 6, 7, 8
