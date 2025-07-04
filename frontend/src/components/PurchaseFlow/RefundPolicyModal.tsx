import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, CreditCard, Shield } from 'lucide-react';
import React from 'react';

interface RefundPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RefundPolicyModal: React.FC<RefundPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        id="refund-policy"
        className="bg-glass-modal border-canai-primary max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="modal-title text-2xl font-bold text-center mb-4">
            30-Day Refund Policy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Policy Overview */}
          <div className="bg-canai-blue-card/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-canai-primary" />
              <h3 className="text-canai-card-title text-lg font-bold">
                100% Satisfaction Guarantee
              </h3>
            </div>
            <p className="text-canai-light mb-4">
              We stand behind our work. If you&apos;re not completely satisfied
              with your CanAI deliverable, we&apos;ll refund your full payment
              within 30 days of purchase.
            </p>
          </div>

          {/* Refund Process */}
          <div className="space-y-4">
            <h4 className="text-canai-card-title font-semibold">
              How to Request a Refund
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-canai-primary mt-1" />
                <div>
                  <span className="text-canai-light font-medium">
                    Within 30 Days:
                  </span>
                  <p className="text-canai-light-blue text-sm mt-1">
                    Submit your refund request within 30 days of your original
                    purchase date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-canai-primary mt-1" />
                <div>
                  <span className="text-canai-light font-medium">
                    Fast Processing:
                  </span>
                  <p className="text-canai-light-blue text-sm mt-1">
                    Refunds are processed within 5-7 business days back to your
                    original payment method.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-canai-blue-card/30 rounded-lg p-4">
            <p className="text-canai-light text-sm text-center">
              To request a refund, contact us at{' '}
              <a
                href="mailto:support@canai.com"
                className="text-canai-primary hover:text-canai-cyan underline"
              >
                support@canai.com
              </a>{' '}
              or use the chat support in your dashboard.
            </p>
          </div>

          {/* Close Button */}
          <Button variant="canai" className="w-full" onClick={onClose}>
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundPolicyModal;
