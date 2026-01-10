const nowIso = () => new Date().toISOString();

const seed = {
  Business: [
    {
      id: 'biz_1',
      name: 'Joe\'s Coffee Roasters',
      category: 'food',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      phone: '(217) 555-0101',
      website: 'https://joescoffee.example.com',
      hours: 'Mon-Fri 7am-6pm, Sat-Sun 8am-4pm',
      priceLevel: '$$',
      tags: ['coffee', 'breakfast', 'wifi'],
      description: 'Small-batch roasts, pastries, and a cozy place to work.',
      verifiedBadge: true,
      imageUrl: '',
      averageRating: 4.6,
      reviewCount: 12,
      created_date: nowIso()
    },
    {
      id: 'biz_2',
      name: 'Maple Street Books',
      category: 'retail',
      address: '45 Maple Ave',
      city: 'Springfield',
      state: 'IL',
      zip: '62702',
      phone: '(217) 555-0133',
      website: 'https://maplestreetbooks.example.com',
      hours: 'Daily 10am-7pm',
      priceLevel: '$$',
      tags: ['books', 'events', 'community'],
      description: 'Independent bookstore with weekly author events.',
      verifiedBadge: false,
      imageUrl: '',
      averageRating: 4.8,
      reviewCount: 7,
      created_date: nowIso()
    }
  ],
  Review: [
    {
      id: 'rev_1',
      businessId: 'biz_1',
      rating: 5,
      reviewText: 'Great latte and super friendly staff.',
      userName: 'Maya',
      userEmail: 'maya@example.com',
      created_date: nowIso()
    },
    {
      id: 'rev_2',
      businessId: 'biz_1',
      rating: 4,
      reviewText: 'Nice atmosphere, pastries could be fresher.',
      userName: 'Jordan',
      userEmail: 'jordan@example.com',
      created_date: nowIso()
    }
  ],
  Deal: [
    {
      id: 'deal_1',
      businessId: 'biz_1',
      title: 'Morning Brew Bundle',
      description: 'Get a pastry free with any large coffee.',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      couponCode: 'BREW10',
      redemptionInstructions: 'Show this offer at checkout.',
      category: 'food',
      viewCount: 42,
      saveCount: 10,
      created_date: nowIso()
    }
  ],
  Bookmark: [
    {
      id: 'bm_1',
      businessId: 'biz_1',
      userEmail: 'alex@example.com',
      created_date: nowIso()
    }
  ]
};

const store = {
  Business: [...seed.Business],
  Review: [...seed.Review],
  Deal: [...seed.Deal],
  Bookmark: [...seed.Bookmark]
};

const makeId = (prefix) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}`;
};

const sortRecords = (records, sortKey) => {
  if (!sortKey) return [...records];
  const isDesc = sortKey.startsWith('-');
  const key = isDesc ? sortKey.slice(1) : sortKey;
  const sorted = [...records].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (aVal === bVal) return 0;
    return aVal > bVal ? 1 : -1;
  });
  return isDesc ? sorted.reverse() : sorted;
};

const filterRecords = (records, criteria = {}) => {
  return records.filter((record) =>
    Object.entries(criteria).every(([key, value]) => record[key] === value)
  );
};

const makeEntity = (name) => ({
  list: async (sortKey, limit) => {
    const sorted = sortRecords(store[name], sortKey);
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  },
  filter: async (criteria, sortKey, limit) => {
    const filtered = filterRecords(store[name], criteria);
    const sorted = sortRecords(filtered, sortKey);
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  },
  create: async (data) => {
    const id = makeId(name.toLowerCase());
    const record = { ...data, id, created_date: nowIso() };
    store[name].push(record);
    return record;
  },
  update: async (id, updates) => {
    const index = store[name].findIndex((record) => record.id === id);
    if (index === -1) throw new Error(`${name} not found`);
    store[name][index] = { ...store[name][index], ...updates };
    return store[name][index];
  },
  delete: async (id) => {
    const index = store[name].findIndex((record) => record.id === id);
    if (index === -1) return;
    store[name].splice(index, 1);
  }
});

let currentUser = {
  full_name: 'Alex Local',
  email: 'alex@example.com',
  role: 'Member'
};

export const base44 = {
  auth: {
    me: async () => {
      if (!currentUser) throw new Error('Not authenticated');
      return currentUser;
    },
    logout: async () => {
      currentUser = null;
      return true;
    },
    redirectToLogin: (returnTo) => {
      const target = returnTo || window.location.href;
      alert(`Demo mode: redirect to login would happen here.\nReturn to: ${target}`);
    }
  },
  entities: {
    Business: makeEntity('Business'),
    Review: makeEntity('Review'),
    Deal: makeEntity('Deal'),
    Bookmark: makeEntity('Bookmark')
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => {
        const summary = 'Here is a quick summary based on the available business info.';
        return `${summary}\n\n(${prompt.slice(0, 140)}...)`;
      }
    }
  }
};
