import axios from 'axios';

export const billingApi = {
  getPlans: async () => {
    const { data } = await axios.get('/api/v1/billing/plans');
    return data;
  },
  getCurrentSubscription: async (workspaceId: string) => {
    const { data } = await axios.get(`/api/v1/billing/workspaces/${workspaceId}/subscription`);
    return data;
  },
  createCheckout: async (workspaceId: string, payload: { planId: string; successUrl: string; cancelUrl: string }) => {
    const { data } = await axios.post(`/api/v1/billing/workspaces/${workspaceId}/checkout`, payload);
    return data;
  },
  cancelSubscription: async (subscriptionId: string) => {
    const { data } = await axios.post(`/api/v1/billing/subscriptions/${subscriptionId}/cancel`);
    return data;
  },
  getPayments: async (workspaceId: string, params?: Record<string, any>) => {
    const { data } = await axios.get(`/api/v1/billing/workspaces/${workspaceId}/payments`, { params });
    return data;
  },
  getTransactions: async (workspaceId: string, params?: Record<string, any>) => {
    const { data } = await axios.get(`/api/v1/billing/workspaces/${workspaceId}/transactions`, { params });
    return data;
  },
};
