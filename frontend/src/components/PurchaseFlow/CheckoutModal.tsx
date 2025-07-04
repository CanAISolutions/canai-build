import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product } from '@/pages/PurchaseFlow';
import { Clock, CreditCard, Shield } from 'lucide-react';
import React from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product;
  isProcessing: boolean;
  onConfirm: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  isProcessing,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        id="checkout-modal"
        className="bg-glass-modal border-canai-primary max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="modal-title text-2xl font-bold text-center mb-4">
            Secure Checkout
          </DialogTitle>
        </DialogHeader>

        <Card className="canai-pricing-card border-canai-primary/50">
          <CardContent className="p-6">
            {/* Product Summary */}
            <div className="text-center mb-6">
              <h3 className="text-canai-card-title text-lg font-bold mb-2">
                {selectedProduct.name}
              </h3>
              <div className="text-3xl font-bold text-canai-primary mb-2">
                ${selectedProduct.price}
              </div>
              <p className="text-canai-light-blue text-sm">
                {selectedProduct.description}
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-canai-light text-sm">
                <Shield className="w-4 h-4 text-canai-primary" />
                <span>Secure payment with Stripe</span>
              </div>
              <div className="flex items-center gap-3 text-canai-light text-sm">
                <Clock className="w-4 h-4 text-canai-primary" />
                <span>Instant access after payment</span>
              </div>
              <div className="flex items-center gap-3 text-canai-light text-sm">
                <CreditCard className="w-4 h-4 text-canai-primary" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="canai"
                className="w-full"
                onClick={onConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ${selectedProduct.price}
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full text-canai-light hover:text-canai-primary"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-canai-light-blue text-center mt-4 opacity-80">
              By clicking &quot;Pay&quot;, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
