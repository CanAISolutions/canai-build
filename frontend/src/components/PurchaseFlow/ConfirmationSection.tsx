import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Mail, ArrowRight } from 'lucide-react';
import { ProductType } from '@/pages/PurchaseFlow';

interface ConfirmationSectionProps {
  selectedProduct: ProductType;
}

const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  selectedProduct,
}) => {
  useEffect(() => {
    // TODO: PostHog integration
    // posthog.capture('purchase_confirmation_viewed', { product: selectedProduct });
    console.log('[PostHog] Purchase confirmation viewed:', selectedProduct);

    // TODO: Trigger Make.com add_project.json workflow
    // This should happen automatically within 10 seconds of payment
    // await fetch('/api/make/trigger-project-creation', {
    //   method: 'POST',
    //   body: JSON.stringify({ product: selectedProduct })
    // });
    console.log('[Make.com] Project creation triggered for:', selectedProduct);
  }, [selectedProduct]);

  const getProductDetails = () => {
    switch (selectedProduct) {
      case 'business_builder':
        return {
          name: 'Business Builder',
          deliveryTime: '24 hours',
          deliveryMethod: 'Email + Dashboard',
        };
      case 'social_email':
        return {
          name: 'Social Email Kit',
          deliveryTime: '12 hours',
          deliveryMethod: 'Email + Download',
        };
      case 'site_audit':
        return {
          name: 'Site Audit & Boost',
          deliveryTime: '48 hours',
          deliveryMethod: 'Email + Report',
        };
      default:
        return {
          name: 'Your Purchase',
          deliveryTime: '24 hours',
          deliveryMethod: 'Email',
        };
    }
  };

  const productDetails = getProductDetails();

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center px-4"
      style={{
        background: `radial-gradient(ellipse at 55% 24%, #152647 0%, #091023 65%, #052947 100%)`,
        backgroundColor: '#0A1535',
      }}
    >
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="bg-green-500/20 rounded-full p-6 animate-glow-pop">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
        </div>

        {/* Confirmation Message */}
        <Card className="canai-pricing-card border-green-400/50 mb-8">
          <CardHeader>
            <CardTitle
              id="confirm-text"
              className="text-canai-card-title text-2xl font-bold mb-4"
            >
              🎉 Purchase Complete!
            </CardTitle>
            <p className="text-canai-light-blue text-lg">
              Thank you for choosing CanAI. Your {productDetails.name} is being
              prepared.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-canai-blue-card/50 rounded-lg p-4">
              <h3 className="text-canai-card-title font-semibold mb-3">
                What happens next?
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-canai-primary" />
                  <span className="text-canai-light">
                    Confirmation email sent to your inbox
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-canai-primary" />
                  <span className="text-canai-light">
                    Your {productDetails.name} will be delivered within{' '}
                    {productDetails.deliveryTime}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-canai-primary" />
                  <span className="text-canai-light">
                    Access via {productDetails.deliveryMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="canai"
                className="w-full"
                onClick={() => (window.location.href = '/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="ghost"
                className="w-full text-canai-light hover:text-canai-primary"
                onClick={() => (window.location.href = '/')}
              >
                Return to Home
              </Button>
            </div>

            {/* Support Information */}
            <div className="text-xs text-canai-light-blue opacity-80 mt-6">
              <p>Need help? Contact us at support@canai.com</p>
              <p className="mt-1">Order processed securely by Stripe</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ConfirmationSection;
