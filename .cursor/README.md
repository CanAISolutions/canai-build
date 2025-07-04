# CanAI Development Guidelines

<div align="center">

**🤖 AI-Powered Development Framework**

![Cursor](https://img.shields.io/badge/cursor-AI%20IDE-blue.svg)
![Guidelines](https://img.shields.io/badge/guidelines-22%20files-green.svg)
![TaskMaster](https://img.shields.io/badge/taskmaster-ready-orange.svg)

</div>

## 🌟 Overview

This directory provides flexible development guidelines and configurations for the CanAI Emotional
Sovereignty Platform. These guidelines promote consistent, high-quality development while allowing
adaptability across TypeScript code, user journey implementation, database design, and deployment
processes.

## 📁 Directory Structure

```
.cursor/
├── 📋 guidelines/                 # Development guidelines
│   ├── canai-analytics.mdc        # Analytics & PostHog integration
│   ├── canai-api.mdc              # API development practices
│   ├── canai-ci-cd.mdc            # CI/CD pipeline recommendations
│   ├── canai-cortex.mdc           # Cortex memory management
│   ├── canai-data-lifecycle.mdc   # Data lifecycle & GDPR
│   ├── canai-docs.mdc             # Documentation practices
│   ├── canai-error-handling.mdc   # Error handling patterns
│   ├── canai-feature-flags.mdc    # Feature flag management
│   ├── canai-github.mdc           # GitHub workflow practices
│   ├── canai-llm-prompting.mdc    # LLM prompting guidelines
│   ├── canai-llm.mdc              # LLM integration practices
│   ├── canai-make-automation.mdc  # Make.com automation
│   ├── canai-memberstack-sync.mdc # Memberstack integration
│   ├── canai-observability.mdc    # Monitoring & observability
│   ├── canai-performance.mdc      # Performance optimization
│   ├── canai-security.mdc         # Security practices
│   ├── canai-structure.mdc        # Project structure recommendations
│   ├── canai-supabase.mdc        # Supabase database practices
│   ├── canai-taskmaster.mdc       # TaskMaster integration
│   ├── canai-testing.mdc          # Testing recommendations
│   ├── canai-typescript.mdc       # TypeScript coding practices
│   ├── canai-user-journey.mdc     # 9-stage user journey guidelines
│   ├── cortex.md                  # Cortex memory system
│   └── README.md                  # Guidelines documentation
└── 📖 README.md                   # This documentation file
```

## 🎯 Core Guideline Categories

### 🏗️ Architecture & Structure

- **`canai-structure.mdc`**: Recommendations for project organization and file naming
- **`canai-api.mdc`**: API design patterns and endpoint organization
- **`canai-typescript.mdc`**: TypeScript best practices and type usage

### 🎭 User Journey Implementation

- **`canai-user-journey.mdc`**: Guidelines for 9-stage user journey implementation
- **`canai-performance.mdc`**: Performance optimization suggestions
- **`canai-testing.mdc`**: Testing approaches for user journey validation

### 🗄️ Data & Backend

- **`canai-supabase.mdc`**: Database schema and query optimization
- **`canai-data-lifecycle.mdc`**: Data retention and GDPR compliance
- **`canai-error-handling.mdc`**: Error handling patterns

### 🤖 AI Integration

- **`canai-llm.mdc`**: GPT-4o and Hume AI integration practices
- **`canai-llm-prompting.mdc`**: Prompt engineering recommendations
- **`canai-analytics.mdc`**: PostHog analytics and user tracking

### 🔒 Security & Compliance

- **`canai-security.mdc`**: Security best practices
- **`canai-memberstack-sync.mdc`**: Authentication and user management
- **`canai-observability.mdc`**: Monitoring and logging recommendations

### 🚀 DevOps & Automation

- **`canai-ci-cd.mdc`**: GitHub Actions and deployment recommendations
- **`canai-github.mdc`**: Git workflow and code review practices
- **`canai-taskmaster.mdc`**: TaskMaster integration guidelines
- **`canai-make-automation.mdc`**: Make.com workflow automation

## 🎯 Key Guideline Highlights

### TypeScript Practices

```typescript
// From canai-typescript.mdc
interface UserJourneyStage {
  stage: 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9';
  completed: boolean;
  data: Record<string, any>;
  timestamp: Date;
  trustScore?: number;
  emotionalResonance?: EmotionalResonanceData;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}
```

### User Journey Guidelines

```typescript
// From canai-user-journey.mdc
const JOURNEY_STAGES = {
  F1: 'Discovery Hook - Landing & Trust Building',
  F2: '2-Step Discovery Funnel - Quiz & Assessment',
  F3: 'Spark Layer - Engagement Amplification',
  F4: 'Purchase Flow - Payment Processing',
  F5: 'Detailed Input Collection - Data Gathering',
  F6: 'Intent Mirror - Validation & Confirmation',
  F7: 'Deliverable Generation - AI Content Creation',
  F8: 'SparkSplit - Comparison & Analysis',
  F9: 'Feedback Capture - User Feedback & Sharing',
} as const;
```

### Database Practices

```sql
-- From canai-supabase.mdc
ALTER TABLE user_data_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_data_policy ON user_data_table
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
```

## 🤖 AI Development Guidelines

### Prompt Engineering

```typescript
// From canai-llm-prompting.mdc
interface PromptTemplate {
  system: string;
  user: string;
  context?: Record<string, any>;
  parameters: {
    temperature: number;
    max_tokens: number;
    top_p: number;
  };
}

const SPARK_GENERATION_PROMPT: PromptTemplate = {
  system: `You are a business strategist specializing in emotional intelligence and small business growth. Generate emotionally resonant sparks to engage the user and build trust.`,
  user: `Business Type: {{businessType}}
         Challenge: {{primaryChallenge}}
         Tone: {{preferredTone}}

         Generate sparks that address the challenge, match the tone, and encourage engagement.`,
  parameters: {
    temperature: 0.7,
    max_tokens: 800,
    top_p: 0.9,
  },
};
```

### Error Handling

```typescript
// From canai-error-handling.mdc
class CanAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public stage?: JourneyStage,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'CanAIError';
  }
}
```

## 🔄 TaskMaster Integration

```typescript
// From canai-taskmaster.mdc
interface TaskMasterTask {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  technicalRequirements: string[];
  dependencies: string[];
  stage: JourneyStage;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}
```

## 🧠 Cortex Memory System

The `cortex.md` file maintains development context:

```markdown
# CanAI Cortex Memory System

## Current Development Context

- **Active Sprint**: User Journey Implementation
- **Current Focus**: F3 Spark Layer
- **Last Milestone**: F2 Discovery Funnel
- **Next Milestone**: F4 Purchase Flow

## Architecture Decisions

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI Services**: GPT-4o + Hume AI
- **Deployment**: Render.com
```

## 🔍 Guideline Validation

```bash
# Validate guidelines
npm run canai:guidelines:validate

# Generate summary
npm run canai:guidelines:summary
```

## 🚀 Usage in Development

### Cursor IDE Integration

1. **Auto-completion**: Guidelines provide context for code suggestions
2. **Code Generation**: AI generates code aligned with patterns
3. **Documentation**: Auto-generated from guideline templates

### Development Workflow

```bash
# Start development
cursor .

# Generate code
cursor generate component --follow-guidelines canai-typescript.mdc
```

## 🤝 Contributing

### Adding Guidelines

1. Create new `.mdc` file in `guidelines/`
2. Follow guideline template format
3. Include examples
4. Update this README

### Guideline Template

````markdown
# Guideline Name

## Purpose

Describe what this guideline covers.

## Recommendations

Best practices and suggestions.

## Examples

```typescript
// Recommended approach
const example = {};
```
````

```

## Acceptance Criteria

- [ ] Clear purpose
- [ ] Practical examples
- [ ] Flexible recommendations

---

<div align="center">

**Built with ❤️ for the CanAI Emotional Sovereignty Platform**

[🏠 Back to Root](../README.md) | [🤖 Guidelines Directory](./guidelines/README.md) | [🧠 Cortex Memory](./guidelines/cortex.md)

</div>
```
