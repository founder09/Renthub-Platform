/**
 * SubscriptionContext — provides subscription plan data globally.
 * Wrap App with this so any component can check plan features.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getMySubscription } from '../api/subscriptionsApi';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [sub,     setSub]     = useState(null);
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setSub(null); setPlan(null); setLoading(false); return; }
    getMySubscription()
      .then(({ data }) => {
        setSub(data.data.subscription);
        setPlan(data.data.plan);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const refresh = () => {
    if (!user) return;
    getMySubscription()
      .then(({ data }) => { setSub(data.data.subscription); setPlan(data.data.plan); })
      .catch(() => {});
  };

  const hasFeature = (feature) => plan?.features?.[feature] || false;
  const isPro      = sub?.planId === 'pro' || sub?.planId === 'business';
  const isBusiness = sub?.planId === 'business';
  const planId     = sub?.planId || 'free';

  return (
    <SubscriptionContext.Provider value={{ sub, plan, loading, refresh, hasFeature, isPro, isBusiness, planId }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
