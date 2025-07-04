import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Product } from '@/pages/PurchaseFlow';
import { switchProduct } from '@/utils/purchaseFlowApi';
import { trackProductSwitched } from '@/utils/purchaseAnalytics';

interface ProductSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: Product;
  availableProducts: Product[];
  sessionId?: string;
  onProductChanged: (newProduct: Product) => void;
}

const ProductSwitchModal: React.FC<ProductSwitchModalProps> = ({
  isOpen,
  onClose,
  currentProduct,
  availableProducts,
  sessionId,
  onProductChanged,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSwitch = async () => {
    if (!selectedProduct || !sessionId) return;

    setIsProcessing(true);

    try {
      const response = await switchProduct({
        session_id: sessionId,
        new_product: selectedProduct.id,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Track product switch
      trackProductSwitched({
        from_product: currentProduct.id,
        to_product: selectedProduct.id,
        from_price: currentProduct.price,
        to_price: selectedProduct.price,
        switch_reason: 'user_preference',
      });

      onProductChanged(selectedProduct);
      onClose();
    } catch (error) {
      console.error('Product switch failed:', error);
      alert('Failed to switch product. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const otherProducts = availableProducts.filter(
    p => p.id !== currentProduct.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        id="change-product"
        className="bg-glass-modal border-canai-primary max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="modal-title text-2xl font-bold text-center mb-4">
            Switch Your Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Selection */}
          <div className="bg-canai-blue-card/50 rounded-lg p-4">
            <h3 className="text-canai-card-title font-semibold mb-2">
              Currently Selected:
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-canai-light font-medium">
                  {currentProduct.name}
                </span>
                <p className="text-canai-light-blue text-sm">
                  {currentProduct.description}
                </p>
              </div>
              <div className="text-canai-primary font-bold text-xl">
                ${currentProduct.price}
              </div>
            </div>
          </div>

          {/* Available Alternatives */}
          <div className="space-y-3">
            <h3 className="text-canai-card-title font-semibold">Switch to:</h3>

            {otherProducts.map(product => (
              <div
                key={product.id}
                className={`bg-canai-blue-card/30 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProduct?.id === product.id
                    ? 'border-2 border-canai-primary bg-canai-blue-card/50'
                    : 'border border-canai-primary/20 hover:border-canai-primary/40'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-canai-light font-medium">
                        {product.name}
                      </span>
                      {product.highlighted && (
                        <span className="bg-canai-primary text-white text-xs px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-canai-light-blue text-sm mb-2">
                      {product.description}
                    </p>
                    <ul className="text-canai-light-blue text-xs space-y-1">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-canai-primary font-bold text-xl ml-4">
                    ${product.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-canai-light hover:text-canai-primary"
              onClick={onClose}
              disabled={isProcessing}
            >
              Keep Current
            </Button>

            <Button
              variant="canai"
              className="flex-1"
              onClick={handleProductSwitch}
              disabled={!selectedProduct || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  Switch Product
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-canai-light-blue text-center opacity-80">
            Switching will update your checkout session with the new product
            pricing
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSwitchModal;
