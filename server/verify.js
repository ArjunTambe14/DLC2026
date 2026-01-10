import { db, makeId, nowIso } from './db.js';

const insertChallenge = db.prepare(`
  INSERT INTO verification_challenges (id, token, answer, purpose, expires_at, created_at)
  VALUES (@id, @token, @answer, @purpose, @expires_at, @created_at)
`);

const deleteExpired = db.prepare(`
  DELETE FROM verification_challenges WHERE expires_at <= @now
`);

const findChallenge = db.prepare(`
  SELECT * FROM verification_challenges WHERE token = @token
`);

const removeChallenge = db.prepare(`
  DELETE FROM verification_challenges WHERE token = @token
`);

export const createChallenge = (purpose) => {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  const token = makeId('verify');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  insertChallenge.run({
    id: makeId('challenge'),
    token,
    answer: String(a + b),
    purpose,
    expires_at: expiresAt,
    created_at: nowIso()
  });
  return {
    token,
    question: `What is ${a} + ${b}?`,
    expiresAt
  };
};

export const validateChallenge = ({ token, answer, purpose }) => {
  deleteExpired.run({ now: nowIso() });
  const row = findChallenge.get({ token });
  if (!row) return false;
  if (row.purpose !== purpose) return false;
  const ok = row.answer === String(answer).trim();
  if (ok) {
    removeChallenge.run({ token });
  }
  return ok;
};
