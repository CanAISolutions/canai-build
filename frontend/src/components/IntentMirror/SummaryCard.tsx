import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, HelpCircle, CheckCircle, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SummaryCardProps {
  summary: string;
  confidenceScore: number;
  clarifyingQuestions: string[];
  originalData: Record<string, string>;
  isConfirming: boolean;
  onConfirm: () => void;
  onEdit: (field: string) => void;
  onSupport: () => void;
  showLowConfidenceHelp: boolean;
  showSupportLink: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  confidenceScore,
  clarifyingQuestions,
  originalData,
  isConfirming,
  onConfirm,
  onEdit,
  onSupport,
  showLowConfidenceHelp,
  showSupportLink,
}) => (
  <Card className="bg-canai-blue-card/90 border-2 border-canai-primary/40 backdrop-blur-md mb-8 shadow-2xl hover:shadow-canai-primary/20 transition-all duration-300">
    <CardHeader className="pb-4">
      <CardTitle className="text-2xl text-canai-light text-center font-bold flex items-center justify-center gap-3">
        <CheckCircle className="w-6 h-6 text-canai-primary" />
        Business Intent Summary
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-8 px-8 pb-8">
      <div className="bg-gradient-to-br from-black/30 to-black/10 rounded-xl p-8 border border-canai-primary/30 hover:border-canai-primary/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-canai-light">
            Your Business Plan Focus:
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('summary')}
            className="text-canai-primary hover:text-canai-cyan hover:bg-canai-primary/10 opacity-75 hover:opacity-100 transition-all duration-200"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <p id="summary-text" className="text-white text-lg leading-relaxed">
          {summary}
        </p>
      </div>
      <div className="bg-gradient-to-br from-black/30 to-black/10 rounded-xl p-8 border border-canai-primary/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-canai-light">
            Confidence Score
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-3xl font-bold ${
                confidenceScore >= 0.8
                  ? 'text-green-400'
                  : confidenceScore >= 0.6
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {(confidenceScore * 100).toFixed(0)}%
            </span>
            {confidenceScore >= 0.8 && (
              <CheckCircle className="w-6 h-6 text-green-400" />
            )}
          </div>
        </div>
        <Progress
          id="confidence-gauge"
          value={confidenceScore * 100}
          className="h-6 bg-canai-primary-blue-dark rounded-full overflow-hidden mb-3"
        />
        <div className="flex justify-between items-center">
          <p
            className={`text-sm font-medium ${
              confidenceScore >= 0.8
                ? 'text-green-300'
                : confidenceScore >= 0.6
                  ? 'text-yellow-300'
                  : 'text-red-300'
            }`}
          >
            {confidenceScore >= 0.8
              ? 'High confidence - ready to proceed!'
              : confidenceScore >= 0.6
                ? 'Good confidence - minor refinements suggested'
                : 'Lower confidence - we recommend clarification'}
          </p>
          {confidenceScore < 0.8 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit('general')}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Improve
            </Button>
          )}
        </div>
      </div>

      {/* Clarifying Questions */}
      {showLowConfidenceHelp && clarifyingQuestions.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40 rounded-xl p-8 hover:border-amber-400/60 transition-all duration-300">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-7 h-7 text-amber-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-amber-200 mb-4">
                Help us understand better:
              </h3>
              <div id="clarify-text" className="space-y-3 mb-6">
                {clarifyingQuestions.map((question, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <p className="text-amber-100 text-lg">{question}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => onEdit('clarification')}
                className="bg-amber-500/20 border-amber-400 text-amber-200 hover:bg-amber-500/30 hover:border-amber-300"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Provide More Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Actions */}
      <div className="flex flex-col lg:flex-row gap-4 pt-8 border-t-2 border-canai-primary/30">
        <div className="flex-1">
          <Button
            id="confirm-btn"
            variant="canai"
            onClick={onConfirm}
            disabled={isConfirming}
            className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isConfirming ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                Generating Your Plan...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 mr-3" />
                Looks Perfect - Create My Plan
              </>
            )}
          </Button>
        </div>
        <div className="lg:w-auto">
          <Button
            id="edit-btn"
            variant="outline"
            onClick={() => onEdit('general')}
            className="w-full lg:w-auto bg-transparent border-2 border-canai-primary text-canai-light hover:bg-canai-primary/20 hover:border-canai-cyan transition-all duration-300 py-6 px-8 text-lg font-semibold whitespace-nowrap"
          >
            <Edit2 className="w-5 h-5 mr-3" />
            Edit Details
          </Button>
        </div>
      </div>
      {/* Quick Edit Fields */}
      <div className="bg-gradient-to-br from-black/20 to-black/5 rounded-xl p-6 border border-canai-primary/20">
        <h4 className="text-lg font-semibold text-canai-light mb-4 text-center">
          Quick Edit Specific Fields
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(originalData).map(([key, _value]) => (
            <Button
              key={key}
              id={`edit-field-${key}`}
              variant="ghost"
              size="sm"
              onClick={() => onEdit(key)}
              className="text-canai-light hover:bg-canai-primary/15 hover:text-canai-primary text-sm p-3 h-auto rounded-lg border border-transparent hover:border-canai-primary/30 transition-all duration-200 group"
            >
              <Edit2 className="w-3 h-3 mr-2 group-hover:text-canai-cyan transition-colors" />
              <span className="truncate">
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
              </span>
            </Button>
          ))}
        </div>
      </div>
      {/* Support Link */}
      {showSupportLink && (
        <div className="text-center pt-6 border-t border-canai-primary/20">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/30">
            <HelpCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <p className="text-canai-light mb-4 text-lg">
              Having trouble with the summary?
            </p>
            <p className="text-white opacity-75 mb-4 text-sm">
              Our team can help refine your business summary for better results
            </p>
            <Button
              id="support-link"
              variant="outline"
              onClick={onSupport}
              className="bg-blue-500/20 border-blue-400 text-blue-200 hover:bg-blue-500/30 hover:border-blue-300 transition-all duration-200"
            >
              <Users className="w-4 h-4 mr-2" />
              Get help from our team
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default SummaryCard;
