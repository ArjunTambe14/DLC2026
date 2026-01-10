import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db, initDb, makeId, nowIso } from './db.js';
import { signToken, authRequired, adminRequired } from './auth.js';
import { createChallenge, validateChallenge } from './verify.js';

dotenv.config();
initDb();

const app = express();
const port = process.env.PORT || 5174;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const categories = [
  'food',
  'retail',
  'services',
  'health',
  'auto',
  'beauty',
  'entertainment',
  'home',
  'other'
];

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const isOpenNow = (hoursJson) => {
  if (!hoursJson) return null;
  const now = new Date();
  const key = dayKeys[now.getDay()];
  const today = hoursJson[key];
  if (!today || !today.open || !today.close) return null;
  const [openH, openM] = today.open.split(':').map(Number);
  const [closeH, closeM] = today.close.split(':').map(Number);
  const open = new Date(now);
  open.setHours(openH, openM, 0, 0);
  const close = new Date(now);
  close.setHours(closeH, closeM, 0, 0);
  return now >= open && now <= close;
};

const businessSelect = `
  SELECT b.*,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS review_count
  FROM businesses b
  LEFT JOIN reviews r ON r.business_id = b.id
`;

const businessListQuery = `
  ${businessSelect}
  WHERE 1=1
    AND (@category IS NULL OR b.category = @category)
    AND (
      @search IS NULL
      OR LOWER(b.name) LIKE @search
      OR LOWER(b.description) LIKE @search
      OR LOWER(b.city) LIKE @search
      OR LOWER(b.tags_json) LIKE @search
    )
  GROUP BY b.id
`;

const businessByIdQuery = `
  ${businessSelect}
  WHERE b.id = @id
  GROUP BY b.id
  LIMIT 1
`;

const dealListQuery = `
  SELECT d.*, b.name AS business_name
  FROM deals d
  LEFT JOIN businesses b ON b.id = d.business_id
  WHERE 1=1
    AND (@category IS NULL OR d.category = @category)
    AND (@businessId IS NULL OR d.business_id = @businessId)
`;

const makeBusinessPayload = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  address: row.address,
  city: row.city,
  state: row.state,
  zip: row.zip,
  phone: row.phone,
  website: row.website,
  hours: row.hours_text,
  hoursJson: parseJson(row.hours_json, null),
  priceLevel: row.price_level,
  tags: parseJson(row.tags_json, []),
  description: row.description,
  verifiedBadge: Boolean(row.verified_badge),
  imageUrl: row.image_url,
  gallery: parseJson(row.gallery_json, []),
  latitude: row.latitude,
  longitude: row.longitude,
  averageRating: Number(row.average_rating || 0),
  reviewCount: Number(row.review_count || 0),
  createdAt: row.created_at
});

const dealPayload = (row) => ({
  id: row.id,
  businessId: row.business_id,
  businessName: row.business_name,
  title: row.title,
  description: row.description,
  discountValue: row.discount_value,
  startDate: row.start_date,
  endDate: row.end_date,
  terms: row.terms,
  couponCode: row.coupon_code,
  redemptionInstructions: row.redemption_instructions,
  category: row.category,
  viewCount: row.view_count,
  copyCount: row.copy_count,
  createdAt: row.created_at
});

const reviewPayload = (row) => ({
  id: row.id,
  businessId: row.business_id,
  rating: row.rating,
  reviewText: row.review_text,
  userName: row.full_name,
  userEmail: row.email,
  createdAt: row.created_at
});

const ensureCategory = (category) => category && categories.includes(category);

const paginate = (items, page, pageSize) => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    pagination: {
      total,
      page: currentPage,
      pageSize,
      totalPages
    }
  };
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/verify-challenge', (req, res) => {
  const purpose = req.query.purpose || 'signup';
  res.json(createChallenge(purpose));
});

app.post('/api/auth/signup', (req, res) => {
  const { fullName, email, password, challengeToken, challengeAnswer } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const validChallenge = validateChallenge({
    token: challengeToken,
    answer: challengeAnswer,
    purpose: 'signup'
  });
  if (!validChallenge) {
    return res.status(400).json({ error: 'Verification failed.' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Email already registered.' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id: makeId('user'),
    full_name: fullName.trim(),
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    role: 'member',
    created_at: nowIso()
  };
  db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, created_at)
    VALUES (@id, @full_name, @email, @password_hash, @role, @created_at)
  `).run(user);
  const token = signToken({ id: user.id, email: user.email, role: user.role, fullName: user.full_name });
  return res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role, fullName: user.full_name });
  return res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, full_name, email, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ id: user.id, fullName: user.full_name, email: user.email, role: user.role });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/businesses', (req, res) => {
  const { category, search, sort, openNow } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 9);
  const validCategory = ensureCategory(category) ? category : null;
  const searchLike = search ? `%${search.toLowerCase()}%` : null;
  const rows = db.prepare(businessListQuery).all({
    category: validCategory,
    search: searchLike
  });

  let items = rows.map((row) => {
    const payload = makeBusinessPayload(row);
    const open = isOpenNow(payload.hoursJson);
    return { ...payload, openNow: open };
  });

  if (openNow === 'true') {
    items = items.filter((item) => item.openNow === true);
  }

  if (sort === 'rating') {
    items.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sort === 'reviews') {
    items.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const payload = paginate(items, page, pageSize);
  return res.json(payload);
});

app.get('/api/businesses/:id', (req, res) => {
  const row = db.prepare(businessByIdQuery).get({ id: req.params.id });
  if (!row) {
    return res.status(404).json({ error: 'Business not found.' });
  }
  const business = makeBusinessPayload(row);
  return res.json({ ...business, openNow: isOpenNow(business.hoursJson) });
});

app.post('/api/businesses', authRequired, adminRequired, (req, res) => {
  const {
    name,
    category,
    address,
    city,
    state,
    zip,
    phone,
    website,
    hours,
    hoursJson,
    priceLevel,
    tags,
    description,
    verifiedBadge,
    imageUrl,
    gallery,
    latitude,
    longitude
  } = req.body;

  if (!name || !city || !state || !ensureCategory(category)) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const id = makeId('biz');
  db.prepare(`
    INSERT INTO businesses (
      id, name, category, address, city, state, zip, phone, website,
      hours_text, hours_json, price_level, tags_json, description, verified_badge,
      image_url, gallery_json, latitude, longitude, created_at
    )
    VALUES (
      @id, @name, @category, @address, @city, @state, @zip, @phone, @website,
      @hours_text, @hours_json, @price_level, @tags_json, @description, @verified_badge,
      @image_url, @gallery_json, @latitude, @longitude, @created_at
    )
  `).run({
    id,
    name: name.trim(),
    category,
    address,
    city,
    state,
    zip,
    phone,
    website,
    hours_text: hours || null,
    hours_json: hoursJson ? JSON.stringify(hoursJson) : null,
    price_level: priceLevel || '$$',
    tags_json: tags ? JSON.stringify(tags) : null,
    description: description || '',
    verified_badge: verifiedBadge ? 1 : 0,
    image_url: imageUrl || null,
    gallery_json: gallery ? JSON.stringify(gallery) : null,
    latitude: latitude || null,
    longitude: longitude || null,
    created_at: nowIso()
  });
  return res.json({ id });
});

app.put('/api/businesses/:id', authRequired, adminRequired, (req, res) => {
  const {
    name,
    category,
    address,
    city,
    state,
    zip,
    phone,
    website,
    hours,
    hoursJson,
    priceLevel,
    tags,
    description,
    verifiedBadge,
    imageUrl,
    gallery,
    latitude,
    longitude
  } = req.body;

  if (!name || !city || !state || !ensureCategory(category)) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const result = db.prepare(`
    UPDATE businesses
    SET name = @name,
        category = @category,
        address = @address,
        city = @city,
        state = @state,
        zip = @zip,
        phone = @phone,
        website = @website,
        hours_text = @hours_text,
        hours_json = @hours_json,
        price_level = @price_level,
        tags_json = @tags_json,
        description = @description,
        verified_badge = @verified_badge,
        image_url = @image_url,
        gallery_json = @gallery_json,
        latitude = @latitude,
        longitude = @longitude
    WHERE id = @id
  `).run({
    id: req.params.id,
    name: name.trim(),
    category,
    address,
    city,
    state,
    zip,
    phone,
    website,
    hours_text: hours || null,
    hours_json: hoursJson ? JSON.stringify(hoursJson) : null,
    price_level: priceLevel || '$$',
    tags_json: tags ? JSON.stringify(tags) : null,
    description: description || '',
    verified_badge: verifiedBadge ? 1 : 0,
    image_url: imageUrl || null,
    gallery_json: gallery ? JSON.stringify(gallery) : null,
    latitude: latitude || null,
    longitude: longitude || null
  });

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Business not found.' });
  }

  return res.json({ ok: true });
});

app.delete('/api/businesses/:id', authRequired, adminRequired, (req, res) => {
  db.prepare('DELETE FROM businesses WHERE id = ?').run(req.params.id);
  return res.json({ ok: true });
});

app.get('/api/businesses/:id/reviews', (req, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 5);
  const rows = db.prepare(`
    SELECT r.*, u.full_name, u.email
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.business_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.id);
  const payload = paginate(rows.map(reviewPayload), page, pageSize);
  return res.json(payload);
});

app.post('/api/businesses/:id/reviews', authRequired, (req, res) => {
  const { rating, reviewText, challengeToken, challengeAnswer } = req.body;
  if (!rating || !reviewText) {
    return res.status(400).json({ error: 'Missing review fields.' });
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }
  const validChallenge = validateChallenge({
    token: challengeToken,
    answer: challengeAnswer,
    purpose: 'review'
  });
  if (!validChallenge) {
    return res.status(400).json({ error: 'Verification failed.' });
  }
  if (reviewText.trim().length < 10) {
    return res.status(400).json({ error: 'Review must be at least 10 characters.' });
  }
  try {
    db.prepare(`
      INSERT INTO reviews (id, business_id, user_id, rating, review_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(makeId('rev'), req.params.id, req.user.id, rating, reviewText.trim(), nowIso());
  } catch (err) {
    if (String(err).includes('UNIQUE')) {
      return res.status(409).json({ error: 'You already reviewed this business.' });
    }
    return res.status(500).json({ error: 'Failed to submit review.' });
  }
  return res.json({ ok: true });
});

app.delete('/api/reviews/:id', authRequired, adminRequired, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  return res.json({ ok: true });
});

app.get('/api/admin/reviews', authRequired, adminRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT r.id,
           r.rating,
           r.review_text,
           r.created_at,
           b.name AS business_name,
           u.full_name AS reviewer_name,
           u.email AS reviewer_email
    FROM reviews r
    JOIN businesses b ON b.id = r.business_id
    JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
    LIMIT 200
  `).all();
  return res.json({ items: rows });
});

app.get('/api/deals', (req, res) => {
  const { category, businessId, expiringSoon } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 6);
  const validCategory = ensureCategory(category) ? category : null;
  const rows = db.prepare(dealListQuery).all({
    category: validCategory,
    businessId: businessId || null
  });
  let items = rows.map(dealPayload);
  if (expiringSoon === 'true') {
    const now = new Date();
    const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    items = items.filter((deal) => {
      const end = new Date(deal.endDate);
      return end >= now && end <= soon;
    });
  }
  items.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  const payload = paginate(items, page, pageSize);
  return res.json(payload);
});

app.post('/api/deals', authRequired, adminRequired, (req, res) => {
  const {
    businessId,
    title,
    description,
    discountValue,
    startDate,
    endDate,
    terms,
    couponCode,
    redemptionInstructions,
    category
  } = req.body;

  if (!businessId || !title || !description || !discountValue || !startDate || !endDate || !ensureCategory(category)) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  db.prepare(`
    INSERT INTO deals (
      id, business_id, title, description, discount_value, start_date, end_date,
      terms, coupon_code, redemption_instructions, category, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    makeId('deal'),
    businessId,
    title.trim(),
    description.trim(),
    discountValue.trim(),
    startDate,
    endDate,
    terms || '',
    couponCode || '',
    redemptionInstructions || '',
    category,
    nowIso()
  );
  return res.json({ ok: true });
});

app.put('/api/deals/:id', authRequired, adminRequired, (req, res) => {
  const {
    businessId,
    title,
    description,
    discountValue,
    startDate,
    endDate,
    terms,
    couponCode,
    redemptionInstructions,
    category
  } = req.body;

  if (!businessId || !title || !description || !discountValue || !startDate || !endDate || !ensureCategory(category)) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const result = db.prepare(`
    UPDATE deals
    SET business_id = ?,
        title = ?,
        description = ?,
        discount_value = ?,
        start_date = ?,
        end_date = ?,
        terms = ?,
        coupon_code = ?,
        redemption_instructions = ?,
        category = ?
    WHERE id = ?
  `).run(
    businessId,
    title.trim(),
    description.trim(),
    discountValue.trim(),
    startDate,
    endDate,
    terms || '',
    couponCode || '',
    redemptionInstructions || '',
    category,
    req.params.id
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Deal not found.' });
  }
  return res.json({ ok: true });
});

app.delete('/api/deals/:id', authRequired, adminRequired, (req, res) => {
  db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id);
  return res.json({ ok: true });
});

app.post('/api/deals/:id/copy', authRequired, (req, res) => {
  db.prepare('UPDATE deals SET copy_count = copy_count + 1 WHERE id = ?').run(req.params.id);
  db.prepare(`
    INSERT INTO deal_interactions (id, deal_id, user_id, type, created_at)
    VALUES (?, ?, ?, 'copy', ?)
  `).run(makeId('interaction'), req.params.id, req.user.id, nowIso());
  return res.json({ ok: true });
});

app.post('/api/deals/:id/view', (req, res) => {
  db.prepare('UPDATE deals SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);
  db.prepare(`
    INSERT INTO deal_interactions (id, deal_id, user_id, type, created_at)
    VALUES (?, ?, ?, 'view', ?)
  `).run(makeId('interaction'), req.params.id, req.user?.id || null, nowIso());
  return res.json({ ok: true });
});

app.get('/api/bookmarks', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*,
           COALESCE(AVG(r.rating), 0) AS average_rating,
           COUNT(r.id) AS review_count
    FROM bookmarks bm
    JOIN businesses b ON b.id = bm.business_id
    LEFT JOIN reviews r ON r.business_id = b.id
    WHERE bm.user_id = ?
    GROUP BY b.id
    ORDER BY bm.created_at DESC
  `).all(req.user.id);
  const items = rows.map((row) => makeBusinessPayload(row));
  return res.json({ items });
});

app.post('/api/bookmarks/:businessId', authRequired, (req, res) => {
  const existing = db.prepare(`
    SELECT id FROM bookmarks WHERE business_id = ? AND user_id = ?
  `).get(req.params.businessId, req.user.id);
  if (existing) {
    db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existing.id);
    return res.json({ saved: false });
  }
  db.prepare(`
    INSERT INTO bookmarks (id, business_id, user_id, created_at)
    VALUES (?, ?, ?, ?)
  `).run(makeId('bm'), req.params.businessId, req.user.id, nowIso());
  return res.json({ saved: true });
});

const toCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((key) => escape(row[key])).join(','));
  });
  return lines.join('\n');
};

app.get('/api/reports/top-rated', authRequired, adminRequired, (req, res) => {
  const minReviews = Number(req.query.minReviews || 3);
  const rows = db.prepare(`
    SELECT b.name,
           b.category,
           ROUND(AVG(r.rating), 2) AS average_rating,
           COUNT(r.id) AS review_count
    FROM businesses b
    JOIN reviews r ON r.business_id = b.id
    GROUP BY b.id
    HAVING review_count >= ?
    ORDER BY average_rating DESC, review_count DESC
    LIMIT 10
  `).all(minReviews);
  return res.json({ items: rows });
});

app.get('/api/reports/most-reviewed', authRequired, adminRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT b.name,
           b.category,
           COUNT(r.id) AS review_count
    FROM businesses b
    LEFT JOIN reviews r ON r.business_id = b.id
    GROUP BY b.id
    ORDER BY review_count DESC
    LIMIT 10
  `).all();
  return res.json({ items: rows });
});

app.get('/api/reports/favorites', authRequired, adminRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT b.name,
           b.category,
           COUNT(bm.id) AS favorite_count
    FROM businesses b
    LEFT JOIN bookmarks bm ON bm.business_id = b.id
    GROUP BY b.id
    ORDER BY favorite_count DESC
    LIMIT 10
  `).all();
  return res.json({ items: rows });
});

app.get('/api/reports/deals', authRequired, adminRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT d.title,
           b.name AS business,
           d.copy_count,
           d.view_count
    FROM deals d
    JOIN businesses b ON b.id = d.business_id
    ORDER BY d.copy_count DESC, d.view_count DESC
    LIMIT 10
  `).all();
  return res.json({ items: rows });
});

app.get('/api/reports/category-distribution', authRequired, adminRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT category, COUNT(id) AS business_count
    FROM businesses
    GROUP BY category
    ORDER BY business_count DESC
  `).all();
  return res.json({ items: rows });
});

app.get('/api/reports/weekly-activity', authRequired, adminRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT
      strftime('%Y-%W', created_at) AS week,
      COUNT(id) AS count,
      'users' AS metric
    FROM users
    WHERE created_at >= date('now', '-56 days')
    GROUP BY week
    UNION ALL
    SELECT
      strftime('%Y-%W', created_at) AS week,
      COUNT(id) AS count,
      'reviews' AS metric
    FROM reviews
    WHERE created_at >= date('now', '-56 days')
    GROUP BY week
    UNION ALL
    SELECT
      strftime('%Y-%W', created_at) AS week,
      COUNT(id) AS count,
      'favorites' AS metric
    FROM bookmarks
    WHERE created_at >= date('now', '-56 days')
    GROUP BY week
    UNION ALL
    SELECT
      strftime('%Y-%W', created_at) AS week,
      COUNT(id) AS count,
      'deal_interactions' AS metric
    FROM deal_interactions
    WHERE created_at >= date('now', '-56 days')
    GROUP BY week
  `).all();
  return res.json({ items: rows });
});

app.get('/api/reports/:type.csv', authRequired, adminRequired, (req, res) => {
  const type = req.params.type;
  let rows = [];
  if (type === 'top-rated') {
    rows = db.prepare(`
      SELECT b.name, b.category, ROUND(AVG(r.rating), 2) AS average_rating, COUNT(r.id) AS review_count
      FROM businesses b
      JOIN reviews r ON r.business_id = b.id
      GROUP BY b.id
      ORDER BY average_rating DESC, review_count DESC
      LIMIT 10
    `).all();
  } else if (type === 'most-reviewed') {
    rows = db.prepare(`
      SELECT b.name, b.category, COUNT(r.id) AS review_count
      FROM businesses b
      LEFT JOIN reviews r ON r.business_id = b.id
      GROUP BY b.id
      ORDER BY review_count DESC
      LIMIT 10
    `).all();
  } else if (type === 'favorites') {
    rows = db.prepare(`
      SELECT b.name, b.category, COUNT(bm.id) AS favorite_count
      FROM businesses b
      LEFT JOIN bookmarks bm ON bm.business_id = b.id
      GROUP BY b.id
      ORDER BY favorite_count DESC
      LIMIT 10
    `).all();
  } else if (type === 'deals') {
    rows = db.prepare(`
      SELECT d.title, b.name AS business, d.copy_count, d.view_count
      FROM deals d
      JOIN businesses b ON b.id = d.business_id
      ORDER BY d.copy_count DESC, d.view_count DESC
      LIMIT 10
    `).all();
  } else if (type === 'category-distribution') {
    rows = db.prepare(`
      SELECT category, COUNT(id) AS business_count
      FROM businesses
      GROUP BY category
      ORDER BY business_count DESC
    `).all();
  } else if (type === 'weekly-activity') {
    rows = db.prepare(`
      SELECT
        strftime('%Y-%W', created_at) AS week,
        COUNT(id) AS count,
        'users' AS metric
      FROM users
      WHERE created_at >= date('now', '-56 days')
      GROUP BY week
      UNION ALL
      SELECT
        strftime('%Y-%W', created_at) AS week,
        COUNT(id) AS count,
        'reviews' AS metric
      FROM reviews
      WHERE created_at >= date('now', '-56 days')
      GROUP BY week
      UNION ALL
      SELECT
        strftime('%Y-%W', created_at) AS week,
        COUNT(id) AS count,
        'favorites' AS metric
      FROM bookmarks
      WHERE created_at >= date('now', '-56 days')
      GROUP BY week
      UNION ALL
      SELECT
        strftime('%Y-%W', created_at) AS week,
        COUNT(id) AS count,
        'deal_interactions' AS metric
      FROM deal_interactions
      WHERE created_at >= date('now', '-56 days')
      GROUP BY week
    `).all();
  } else {
    return res.status(404).json({ error: 'Report not found.' });
  }
  const csv = toCsv(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment(`${type}.csv`);
  return res.send(csv);
});

app.listen(port, () => {
  console.log(`StreetPulse API listening on ${port}`);
});
