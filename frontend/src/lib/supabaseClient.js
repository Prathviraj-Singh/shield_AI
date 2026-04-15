// MOCKED SUPABASE CLIENT FOR DEMO ENVIRONMENT
// Since actual backend keys are missing, this mock intercepts all requests and mimics Supabase natively.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: { user: JSON.parse(localStorage.getItem('demo_user') || 'null') } }, error: null }),
    onAuthStateChange: (cb) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: async ({ email }) => {
      const user = { id: 'demo-user-123', email };
      localStorage.setItem('demo_user', JSON.stringify(user));
      // Force reload to trigger state hooks globally
      setTimeout(() => window.location.assign('/dashboard'), 100);
      return { data: { user }, error: null };
    },
    signInWithPassword: async ({ email }) => {
      const user = { id: 'demo-user-123', email };
      localStorage.setItem('demo_user', JSON.stringify(user));
      setTimeout(() => window.location.assign('/dashboard'), 100);
      return { data: { user }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('demo_user');
      setTimeout(() => window.location.assign('/login'), 100);
      return { error: null };
    },
  },
  from: (table) => {
    // Robust Dummy Data representing historical detected Scams
    const mockReports = [
      { id: 1, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), message_text: "Dear SBI User, your KYC is pending. Click here to verify: http://sbi-kyc-verify-update.com", scam_type: "Phishing", confidence_score: 0.98, status: "blocked" },
      { id: 2, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), message_text: "You have won ₹50,00,000 in KBC Jio Lottery! Send Rs 1000 processing fee to UPI immediately.", scam_type: "Lottery", confidence_score: 0.95, status: "blocked" },
      { id: 3, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), message_text: "Your Amazon package is delayed. Pay customs charge of Rs 50 here: amazon-deliveries-hub.co.in", scam_type: "Delivery", confidence_score: 0.89, status: "blocked" },
      { id: 4, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), message_text: "Hi Rohan, sending you the project files for tomorrow's meeting.", scam_type: "None", confidence_score: 0.05, status: "safe" }
    ];

    const chainObj = {
      eq: () => chainObj,
      order: () => chainObj,
      limit: async () => ({ data: mockReports, error: null }),
      then: (resolve) => resolve({ data: mockReports, error: null })
    };
    return {
      select: () => chainObj,
      insert: () => chainObj
    }
  },
  channel: () => ({
    on: function() { return this; },
    subscribe: () => ({ unsubscribe: () => {} })
  })
};
