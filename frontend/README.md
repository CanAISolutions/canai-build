# CanAI Frontend - React User Interface

<div align="center">

**🎨 Frontend Application & User Experience**

![React](https://img.shields.io/badge/react-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.5-blue.svg)
![Vite](https://img.shields.io/badge/vite-5.4-purple.svg)
![Tailwind](https://img.shields.io/badge/tailwindcss-3.4-cyan.svg)

</div>

## 🌟 Overview

The CanAI frontend is a modern React application built with Vite and TypeScript that delivers the
complete 9-stage Emotional Sovereignty Platform user experience. Featuring responsive design,
accessibility compliance (WCAG 2.2 AA), and seamless integration with Webflow CMS, it provides an
intuitive and emotionally resonant interface for small business owners and solopreneurs.

### 🎯 Key Features

- **🎭 9-Stage User Journey**: Complete implementation of F1-F9 user experience
- **🎨 Modern UI Components**: Built with shadcn/ui and Tailwind CSS
- **📱 Responsive Design**: Mobile-first approach with PWA capabilities
- **♿ Accessibility**: WCAG 2.2 AA compliant with screen reader support
- **🔗 Webflow Integration**: Dynamic CMS content and pricing management
- **⚡ Performance**: Optimized for Core Web Vitals and fast loading
- **🧪 Testing**: Comprehensive unit, integration, and E2E test coverage

### 🎪 User Journey Stages

| Stage  | Component Directory | Purpose                  | Key Features                            |
| ------ | ------------------- | ------------------------ | --------------------------------------- |
| **F1** | `DiscoveryHook/`    | Landing & engagement     | Hero sections, trust indicators, CTAs   |
| **F2** | `DiscoveryFunnel/`  | Quiz & assessment        | Interactive forms, validation, progress |
| **F3** | `SparkLayer/`       | Engagement amplification | AI-generated sparks, selection UI       |
| **F4** | `PurchaseFlow/`     | Payment processing       | Stripe integration, pricing modals      |
| **F5** | `DetailedInput/`    | Data collection          | Multi-step forms, auto-save, tooltips   |
| **F6** | `IntentMirror/`     | Intent validation        | Summary display, confirmation UI        |
| **F7** | `DeliverableGen/`   | Content generation       | Progress tracking, result display       |
| **F8** | `SparkSplit/`       | Comparison analysis      | Side-by-side comparison, voting UI      |
| **F9** | `FeedbackCapture/`  | Feedback & sharing       | Rating system, social sharing           |

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Git for version control

### Development Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open application**
   - Development: http://localhost:3000
   - Network: http://localhost:3000 (accessible on local network)

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build
npm run serve
```

## 🏗️ Architecture

### Component Structure

```
src/
├── 🎨 components/                 # Reusable UI components
│   ├── DiscoveryHook/            # F1: Landing page components
│   ├── DiscoveryFunnel/          # F2: Quiz and assessment
│   ├── SparkLayer/               # F3: Engagement amplification
│   ├── PurchaseFlow/             # F4: Payment processing
│   ├── DetailedInput/            # F5: Data collection forms
│   ├── IntentMirror/             # F6: Intent validation
│   ├── DeliverableGen/           # F7: Content generation
│   ├── SparkSplit/               # F8: Comparison analysis
│   ├── FeedbackCapture/          # F9: User feedback
│   ├── ui/                       # Base UI components (shadcn/ui)
│   └── enhanced/                 # Enhanced component variants
├── 🔧 services/                  # API integration services
├── 🎣 hooks/                     # Custom React hooks
├── 🛠️ utils/                     # Utility functions
├── 📱 pages/                     # Page components
├── 🎨 styles/                    # Global styles and themes
├── 📝 types/                     # TypeScript type definitions
├── 🔗 integrations/              # External service integrations
└── 🧪 tests/                     # Test files
```

## 🎨 Design System

### Theme Configuration

```typescript
// tailwind.config.ts - CanAI Brand Colors
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6', // Primary blue
          600: '#2563eb',
          900: '#1e3a8a',
        },
        // Emotional Intelligence Colors
        warm: '#f59e0b', // Warm tone
        bold: '#dc2626', // Bold tone
        optimistic: '#10b981', // Optimistic tone
        inspirational: '#8b5cf6', // Inspirational tone
      },
    },
  },
};
```

## 📱 Responsive Design

### Performance Targets

- **Largest Contentful Paint (LCP)**: <2.5s
- **First Input Delay (FID)**: <100ms
- **Cumulative Layout Shift (CLS)**: <0.1
- **Mobile-First**: Optimized for touch interfaces
- **Accessibility**: WCAG 2.2 AA compliant

## 🧪 Testing Strategy

### Test Structure

```
tests/
├── unit/                      # Unit tests for components
├── integration/               # Integration tests
└── e2e/                      # End-to-end tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 🔒 Security Implementation

### Content Security Policy

- Input sanitization with DOMPurify
- Secure API communication
- XSS prevention measures
- CSRF protection

## 📊 Analytics Integration

### Event Tracking

- PostHog analytics integration
- User journey progression tracking
- Performance monitoring
- Error tracking with Sentry

## 🤝 Contributing

### Development Guidelines

1. **Component Development**
   - Follow React best practices and hooks patterns
   - Use TypeScript for all new components
   - Implement proper error boundaries
   - Ensure accessibility compliance

2. **Styling Guidelines**
   - Use Tailwind CSS utility classes
   - Follow the design system tokens
   - Implement responsive design patterns
   - Test across different devices

3. **Testing Requirements**
   - Write unit tests for all components
   - Include integration tests for user flows
   - Test accessibility with screen readers
   - Validate performance metrics

### Code Quality

```bash
# Development workflow
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm run format       # Format code with Prettier
npm run test         # Run test suite
npm run build        # Production build
```

## 📞 Support & Resources

### Getting Help

- **Component Documentation**: Check individual component README files
- **Design System**: Review the component library documentation
- **API Integration**: See API integration guides
- **Testing**: Review testing guidelines

### External Resources

- **React Documentation**: [https://react.dev](https://react.dev)
- **Vite Documentation**: [https://vitejs.dev](https://vitejs.dev)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)

---

<div align="center">

**Built with ❤️ for the CanAI Emotional Sovereignty Platform**

[🏠 Back to Root](../README.md) | [🔧 Backend](../backend/README.md) |
[📖 Documentation](../docs/README.md)

</div>
