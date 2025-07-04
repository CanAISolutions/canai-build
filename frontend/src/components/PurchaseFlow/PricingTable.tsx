import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Product, ProductType } from '@/pages/PurchaseFlow';

interface PricingTableProps {
  products: Product[];
  selectedProduct: ProductType;
  onProductSelect: (productId: ProductType) => void;
  onPurchaseClick: () => void;
}

const PricingTable: React.FC<PricingTableProps> = ({
  products,
  selectedProduct,
  onProductSelect,
  onPurchaseClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <Card
          key={product.id}
          className={`relative transition-all duration-300 cursor-pointer backdrop-blur-sm min-h-[480px] flex flex-col ${
            selectedProduct === product.id
              ? 'ring-4 ring-[#36d1fe] scale-105 shadow-[0_0_40px_rgba(54,209,254,0.5)] border-[#36d1fe] bg-gradient-to-br from-[#193c65]/95 to-[#1e314f]/95'
              : 'border-[#36d1fe]/40 hover:border-[#36d1fe]/60 hover:scale-102 bg-gradient-to-br from-[#193c65]/90 to-[#1e314f]/90'
          }`}
          onClick={() => onProductSelect(product.id)}
        >
          {product.highlighted && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] px-4 py-1 rounded-full text-sm font-bold text-white shadow-lg border border-white/20">
                Most Popular
              </span>
            </div>
          )}

          <CardHeader className="text-center pb-6 flex-shrink-0">
            <CardTitle className="text-[#36d1fe] text-xl font-bold mb-3 font-playfair uppercase tracking-wider drop-shadow-lg">
              {product.name}
            </CardTitle>
            <div className="text-4xl font-extrabold text-white mb-3 font-playfair drop-shadow-lg">
              ${product.price}
            </div>
            <p className="text-[#E6F6FF] text-sm font-manrope leading-relaxed opacity-95">
              {product.description}
            </p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-between">
            <ul className="space-y-3 mb-6 flex-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#36d1fe] mt-0.5 flex-shrink-0 drop-shadow-lg" />
                  <span className="text-[#E6F6FF] text-sm font-manrope leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              id={
                selectedProduct === product.id
                  ? 'purchase-btn'
                  : 'change-product'
              }
              variant="canai"
              className="w-full font-bold shadow-[0_0_20px_rgba(54,209,254,0.4)] hover:shadow-[0_0_30px_rgba(54,209,254,0.6)]"
              onClick={e => {
                e.stopPropagation();
                if (selectedProduct === product.id) {
                  onPurchaseClick();
                } else {
                  onProductSelect(product.id);
                }
              }}
            >
              {selectedProduct === product.id ? (
                <>
                  <span>Purchase Now</span>
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Select Plan'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PricingTable;
