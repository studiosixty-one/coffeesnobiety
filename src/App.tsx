import React, { useState } from 'react';
import { Coffee, Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_live_51QCIV4DGQ4cQ6CRCLg1UB0eX6Tt2NA6uqs5WbhSi37hT1h3ub2mJVKzDs8kwxShBLHjMnwCuc50UJclPnDriLxvg001k2Qa6hf');

const App: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [isSubscription, setIsSubscription] = useState(false);
  const [monthlyBags, setMonthlyBags] = useState(1);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>) => () => setter(prev => prev + 1);
  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>) => () => setter(prev => Math.max(1, prev - 1));
  const handleQuantityChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setter(isNaN(value) ? 1 : Math.max(1, value));
  };

  const handleCheckout = async () => {
    try {
      setCheckoutError(null);
      console.log('Initiating checkout...');
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const lineItems = isSubscription
        ? [{ price: 'price_1QCIzaDGQ4cQ6CRCJ8CxTmUM', quantity: monthlyBags }] // Replace with your subscription price ID
        : [{ price: 'price_1QCIszDGQ4cQ6CRCDcFyIADc', quantity: quantity }];

      console.log('Redirecting to Stripe checkout...');
      const { error } = await stripe.redirectToCheckout({
        lineItems: lineItems,
        mode: isSubscription ? 'subscription' : 'payment',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const QuantitySelector = ({ value, onChange, onIncrement, onDecrement }: {
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onIncrement: () => void;
    onDecrement: () => void;
  }) => (
    <div className="flex items-center">
      <button onClick={onDecrement} className="bg-[#273F2A] text-white p-2">
        <Minus size={20} />
      </button>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-16 text-center mx-2 bg-transparent"
      />
      <button onClick={onIncrement} className="bg-[#273F2A] text-white p-2">
        <Plus size={20} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#273F2A] flex items-center justify-center p-4">
      <div className="bg-[#F5F3F0] w-full max-w-4xl">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="Coffee Pouch" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="mb-6 h-16 flex items-center">
              <span className="text-[#273F2A] uppercase text-xl font-bold">YOUR LOGO</span>
            </div>
            <h1 className="text-3xl font-bold mb-4 uppercase">PREMIUM COFFEE POUCH</h1>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-current" size={20} />
              ))}
              <span className="ml-2 uppercase">5.0</span>
            </div>
            <p className="mb-6 uppercase">EXPERIENCE THE RICH, BOLD FLAVOR OF OUR PREMIUM COFFEE BLEND. PERFECTLY ROASTED AND PACKAGED FOR MAXIMUM FRESHNESS.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <Coffee className="mr-2" size={20} />
                <span className="uppercase">SINGLE ORIGIN</span>
              </div>
              <div className="flex items-center">
                <Coffee className="mr-2" size={20} />
                <span className="uppercase">MEDIUM ROAST</span>
              </div>
            </div>
            <div className="mb-6">
              <label className="flex items-center mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSubscription}
                  onChange={() => setIsSubscription(!isSubscription)}
                  className="sr-only"
                />
                <div className="w-6 h-6 border-2 border-[#273F2A] mr-2 flex items-center justify-center">
                  {isSubscription && <div className="w-4 h-4 bg-[#273F2A]"></div>}
                </div>
                <span className="uppercase">MONTHLY SUBSCRIPTION</span>
              </label>
              <div>
                <p className="uppercase mb-2">{isSubscription ? 'BAGS PER MONTH:' : 'QUANTITY:'}</p>
                <QuantitySelector
                  value={isSubscription ? monthlyBags : quantity}
                  onChange={handleQuantityChange(isSubscription ? setMonthlyBags : setQuantity)}
                  onIncrement={handleIncrement(isSubscription ? setMonthlyBags : setQuantity)}
                  onDecrement={handleDecrement(isSubscription ? setMonthlyBags : setQuantity)}
                />
              </div>
            </div>
            <p className="text-2xl font-bold mb-6 uppercase">
              {isSubscription ? '£19.99 GBP / BAG / MONTH' : '£24.99 GBP'}
            </p>
            <button
              onClick={handleCheckout}
              className="bg-[#273F2A] text-white py-2 px-4 flex items-center justify-center w-full uppercase"
            >
              <ShoppingCart className="mr-2" size={20} />
              {isSubscription ? 'SUBSCRIBE NOW' : 'BUY NOW'}
            </button>
            {checkoutError && (
              <p className="text-red-500 mt-2 uppercase">{checkoutError}</p>
            )}
            <div className="mt-6 flex items-center justify-center">
              <a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://m.media-amazon.com/images/G/01/AmazonExports/Fuji/2020/October/Fuji_LP_ASINA_en_US_1x._CB432774714_.jpg" 
                  alt="As Seen on Amazon" 
                  className="h-8 hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;