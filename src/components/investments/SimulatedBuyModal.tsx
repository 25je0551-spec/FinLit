import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { StockQuote, SimulatedOrder } from '../../types/market';

interface SimulatedBuyModalProps {
  stock: StockQuote;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: (order: SimulatedOrder) => void;
}

export const SimulatedBuyModal: React.FC<SimulatedBuyModalProps> = ({
  stock,
  isOpen,
  onClose,
  onOrderPlaced,
}) => {
  const [step, setStep] = useState<'configure' | 'review' | 'success'>('configure');
  const [quantity, setQuantity] = useState<number>(1);
  const [placedOrder, setPlacedOrder] = useState<SimulatedOrder | null>(null);

  if (!isOpen) return null;

  const estimatedValue = Number((quantity * stock.price).toFixed(2));

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(1000, prev + delta)));
  };

  const handlePlaceOrder = () => {
    const order: SimulatedOrder = {
      id: `SIM-${Date.now().toString().slice(-6)}`,
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      quantity,
      price: stock.price,
      totalValue: estimatedValue,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }) + ' IST',
    };
    setPlacedOrder(order);
    setStep('success');
    if (onOrderPlaced) {
      onOrderPlaced(order);
    }
  };

  const handleResetAndClose = () => {
    setStep('configure');
    setQuantity(1);
    setPlacedOrder(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-fintech-navy/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div className="w-full max-w-[500px] bg-white rounded-[22px] border border-[#DCE5EE] shadow-dialog p-6 sm:p-7 relative text-left animate-scale-up">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-fintech-slate hover:text-fintech-navy hover:bg-[#F0F5FA] transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: CONFIGURE ORDER */}
        {step === 'configure' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-fintech-teal mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Simulated Order • Demo
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-fintech-navy tracking-tight">
                Buy {stock.name}
              </h3>
              <p className="text-[12.5px] text-fintech-slate mt-0.5">
                {stock.displaySymbol} • {stock.exchange} Equity
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-4 flex items-center justify-between">
              <div>
                <span className="text-[11.5px] text-fintech-slate font-medium block">
                  Current Market Price
                </span>
                <span className="text-[20px] font-extrabold text-fintech-navy">
                  ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                NSE Regular
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="bg-white border border-[#DCE5EE] rounded-[16px] p-4 space-y-2 shadow-subtle">
              <span className="text-[13px] font-bold text-fintech-navy block">
                Quantity (Shares)
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-[10px] bg-[#F0F5FA] hover:bg-[#E3ECF4] disabled:opacity-40 text-fintech-navy flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <span className="text-[22px] font-extrabold text-fintech-navy block">
                    {quantity}
                  </span>
                  <span className="text-[11px] text-fintech-slate">
                    share{quantity > 1 ? 's' : ''}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 1000}
                  className="w-10 h-10 rounded-[10px] bg-[#F0F5FA] hover:bg-[#E3ECF4] disabled:opacity-40 text-fintech-navy flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Estimated Value Calculation */}
            <div className="bg-[#EEF8F8] border border-[#CDEAEB] rounded-[14px] p-4 text-[13px] space-y-1">
              <div className="flex justify-between items-center text-fintech-slate text-[12px]">
                <span>Calculation breakdown:</span>
                <span>
                  {quantity} share{quantity > 1 ? 's' : ''} × ₹{stock.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-fintech-navy font-bold pt-1 border-t border-[#CDEAEB]/60">
                <span className="text-[14px]">Estimated order value:</span>
                <span className="text-[18px] text-fintech-teal">
                  ₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start space-x-2 text-[11px] text-fintech-slate leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 text-fintech-slate shrink-0 mt-0.5" />
              <span>
                This is a simulated order for the prototype. No real money or trade is executed.
              </span>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => setStep('review')}
              className="w-full h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14.5px] transition-all flex items-center justify-center space-x-2 shadow-subtle cursor-pointer active:scale-[0.99]"
            >
              <span>Review order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: REVIEW ORDER */}
        {step === 'review' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-fintech-teal block mb-1">
                Order Confirmation
              </span>
              <h3 className="text-[22px] font-bold text-fintech-navy tracking-tight">
                Review Your Order
              </h3>
              <p className="text-[12.5px] text-fintech-slate mt-0.5">
                Verify order details before simulated submission
              </p>
            </div>

            {/* Review Parameters Table */}
            <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-4.5 space-y-2.5 text-[13px]">
              <div className="flex justify-between items-center pb-2 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate font-medium">Stock:</span>
                <span className="font-bold text-fintech-navy text-[13.5px]">{stock.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate font-medium">Exchange:</span>
                <span className="font-bold text-fintech-navy">{stock.exchange}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate font-medium">Quantity:</span>
                <span className="font-bold text-fintech-navy">{quantity} share{quantity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate font-medium">Estimated Price:</span>
                <span className="font-bold text-fintech-navy">
                  ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-fintech-navy font-bold text-[14px]">Estimated Order Value:</span>
                <span className="text-[18px] font-extrabold text-fintech-teal">
                  ₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Mandatory Safety Notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-[12px] text-[11.5px] text-amber-900 leading-relaxed flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> This is a simulated order for the prototype. No real transaction will be placed with any broker or exchange.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="h-[46px] rounded-[12px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-fintech-navy font-semibold text-[14px] transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14px] transition-all shadow-subtle cursor-pointer active:scale-[0.99]"
              >
                Place simulated order
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER SUCCESS */}
        {step === 'success' && placedOrder && (
          <div className="text-center py-2 space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-subtle">
              <CheckCircle2 className="w-8 h-8 stroke-[2.3]" />
            </div>

            <div>
              <h3 className="text-[22px] font-bold text-fintech-navy tracking-tight">
                Order Placed Successfully
              </h3>
              <p className="text-[13px] text-fintech-slate mt-1 max-w-sm mx-auto">
                Your simulated buy order for {placedOrder.quantity} share{placedOrder.quantity > 1 ? 's' : ''} has been recorded in this session.
              </p>
            </div>

            {/* Order Receipt */}
            <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-4 text-left text-[12.5px] space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate">Order ID:</span>
                <span className="font-mono font-bold text-fintech-navy">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate">Stock:</span>
                <span className="font-bold text-fintech-navy">{placedOrder.name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate">Quantity:</span>
                <span className="font-bold text-fintech-navy">{placedOrder.quantity} share{placedOrder.quantity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate">Price Used:</span>
                <span className="font-bold text-fintech-navy">₹{placedOrder.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-[#EDF2F7]">
                <span className="text-fintech-slate">Estimated Order Value:</span>
                <span className="font-extrabold text-fintech-teal text-[14px]">
                  ₹{placedOrder.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-fintech-slate">Timestamp:</span>
                <span className="text-fintech-slate font-medium">{placedOrder.timestamp}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14.5px] transition-all shadow-subtle cursor-pointer active:scale-[0.99]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
