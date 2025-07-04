import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { ArrowLeft } from 'lucide-react';
import PricingTable from '@/components/PurchaseFlow/PricingTable';
import CheckoutModal from '@/components/PurchaseFlow/CheckoutModal';
import ConfirmationSection from '@/components/PurchaseFlow/ConfirmationSection';
import RefundPolicyModal from '@/components/PurchaseFlow/RefundPolicyModal';
import ProductSwitchModal from '@/components/PurchaseFlow/ProductSwitchModal';
import StandardBackground from '@/components/StandardBackground';
import StandardCard from '@/components/StandardCard';
import PageHeader from '@/components/PageHeader';
import {
  PageTitle,
  BodyText,
  CaptionText,
} from '@/components/StandardTypography';
import { createStripeSession } from '@/utils/purchaseFlowApi';
import {
  trackPriceViewed,
  trackCheckoutStarted,
  trackPaymentCompleted,
  trackProductSwitched,
} from '@/utils/purchaseAnalytics';

// Product types for type safety
export type ProductType = 'business_builder' | 'social_email' | 'site_audit';

export interface Product {
  id: ProductType;
  name: string;
  price: number;
  features: string[];
  description: string;
  highlighted?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 'business_builder',
    name: 'Business Builder',
    price: 99,
    features: [
      '700–800 words, investor-ready',
      'AI+expert crafted analysis',
      'Market positioning & competition',
      'Fast 24h turnaround',
    ],
    description: 'Get a beautiful, actionable business plan—delivered fast.',
    highlighted: true,
  },
  {
    id: 'social_email',
    name: 'Social Email Kit',
    price: 49,
    features: [
      '3-7 social posts, branded',
      '3-5 conversion email drafts',
      'Tailored to your audience',
      'Launch & boost messaging',
    ],
    description: 'Jumpstart your brand buzz with social and emails.',
  },
  {
    id: 'site_audit',
    name: 'Site Audit & Boost',
    price: 79,
    features: [
      '300–400 word deep-dive audit',
      'Actionable recommendations',
      'Design, UX & copy insights',
      'Prioritized next steps',
    ],
    description: 'Optimize your digital presence with expert insights.',
  },
];

const PurchaseFlow = () => {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductType>('business_builder');
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isRefundPolicyOpen, setRefundPolicyOpen] = useState(false);
  const [isProductSwitchOpen, setProductSwitchOpen] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // Track page view and price viewing
  useEffect(() => {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    if (product) {
      trackPriceViewed({
        product: selectedProduct,
        price: product.price,
        source: 'purchase_flow_page',
      });
    }
  }, [selectedProduct]);

  const handleProductSelect = (productId: ProductType) => {
    const oldProduct = PRODUCTS.find(p => p.id === selectedProduct);
    const newProduct = PRODUCTS.find(p => p.id === productId);

    setSelectedProduct(productId);

    if (oldProduct && newProduct && oldProduct.id !== newProduct.id) {
      console.log('[PostHog] Product switched:', {
        from: selectedProduct,
        to: productId,
      });

      // Track product switch analytics
      trackProductSwitched({
        from_product: oldProduct.id,
        to_product: newProduct.id,
        from_price: oldProduct.price,
        to_price: newProduct.price,
        switch_reason: 'user_selection',
      });
    }
  };

  const handlePurchaseClick = () => {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return;

    // Track checkout started
    trackCheckoutStarted({
      product: selectedProduct,
      price: product.price,
    });

    setCheckoutOpen(true);
  };

  const handleCheckoutConfirm = async () => {
    setProcessing(true);
    const startTime = Date.now();

    try {
      const product = PRODUCTS.find(p => p.id === selectedProduct);
      if (!product) throw new Error('Product not found');

      // Create Stripe session via API
      const response = await createStripeSession({
        spark: {
          title: product.name,
          product_id: selectedProduct,
          price: product.price,
        },
        user_id: 'demo-user-123', // TODO: Get from Memberstack
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setCurrentSessionId(response.session.id);

      // Track payment completion
      const completionTime = Date.now() - startTime;
      trackPaymentCompleted({
        product: selectedProduct,
        price: product.price,
        stripe_session_id: response.session.id,
        completion_time_ms: completionTime,
      });

      // For demo - simulate successful purchase
      setTimeout(() => {
        setProcessing(false);
        setCheckoutOpen(false);
        setPurchaseComplete(true);

        // Navigate to Detailed Input Collection after purchase
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const promptId = urlParams.get('prompt_id') || 'demo-prompt-id';
          window.location.href = `/detailed-input?prompt_id=${promptId}&product=${selectedProduct}`;
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Purchase error:', error);

      // F4-E1: Retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleCheckoutConfirm();
        }, delay);
      } else {
        setProcessing(false);
        alert('Purchase failed. Please try again.');
      }
    }
  };

  const handleRefundPolicy = () => {
    setRefundPolicyOpen(true);
  };

  const handleProductSwitch = () => {
    setProductSwitchOpen(true);
  };

  const handleProductChanged = (newProduct: Product) => {
    setSelectedProduct(newProduct.id);
  };

  if (purchaseComplete) {
    return <ConfirmationSection selectedProduct={selectedProduct} />;
  }

  return (
    <StandardBackground>
      <PageHeader showBackButton={true} logoSize="sm" showTagline={false} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="text-center mb-8">
            <PageTitle className="text-center mb-4 animate-text-glow">
              Complete Your Purchase
            </PageTitle>

            <BodyText className="text-xl max-w-2xl mx-auto">
              Choose your perfect solution and get started in minutes
            </BodyText>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="mb-12 animate-fade-in">
          <PricingTable
            products={PRODUCTS}
            selectedProduct={selectedProduct}
            onProductSelect={handleProductSelect}
            onPurchaseClick={handlePurchaseClick}
          />
        </div>

        {/* Footer Links */}
        <div className="animate-fade-in">
          <StandardCard variant="glass" padding="md" className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button
                onClick={handleRefundPolicy}
                className="text-[#cce7fa] hover:text-[#36d1fe] transition-colors underline"
              >
                30-Day Refund Policy
              </button>
              <span className="text-[#cce7fa]">•</span>
              <button
                id="change-product"
                onClick={handleProductSwitch}
                className="text-[#cce7fa] hover:text-[#36d1fe] transition-colors underline"
              >
                Switch Product
              </button>
              <span className="text-[#cce7fa]">•</span>
              <CaptionText className="opacity-80 mb-0">
                One-time payment • No subscription
              </CaptionText>
              <span className="text-[#cce7fa]">•</span>
              <CaptionText id="subscription-note" className="opacity-80 mb-0">
                Secure checkout with Stripe
              </CaptionText>
            </div>
          </StandardCard>
        </div>

        {/* Modals */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setCheckoutOpen(false)}
          selectedProduct={PRODUCTS.find(p => p.id === selectedProduct)!}
          isProcessing={isProcessing}
          onConfirm={handleCheckoutConfirm}
        />

        <RefundPolicyModal
          isOpen={isRefundPolicyOpen}
          onClose={() => setRefundPolicyOpen(false)}
        />

        <ProductSwitchModal
          isOpen={isProductSwitchOpen}
          onClose={() => setProductSwitchOpen(false)}
          currentProduct={PRODUCTS.find(p => p.id === selectedProduct)!}
          availableProducts={PRODUCTS}
          sessionId={currentSessionId}
          onProductChanged={handleProductChanged}
        />
      </div>
    </StandardBackground>
  );
};

export default PurchaseFlow;
