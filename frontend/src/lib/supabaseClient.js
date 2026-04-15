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
    // Generate a mock chainable object returning empty data
    const chainObj = {
      eq: () => chainObj,
      order: () => chainObj,
      limit: async () => ({ data: [], error: null }),
      then: (resolve) => resolve({ data: [], error: null })
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
