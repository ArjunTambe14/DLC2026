// Purpose: Admin management and report dashboard for listings.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';
const CATEGORY_OPTIONS = ['Food', 'Retail', 'Services'];
const REPORT_CATEGORY_OPTIONS = ['All', 'Food', 'Retail', 'Services'];
const REPORT_SORT_OPTIONS = [
  { value: 'rating', label: 'Rating (High \u2192 Low)' },
  { value: 'reviews', label: 'Review Count (High \u2192 Low)' },
  { value: 'name', label: 'Name (A \u2192 Z)' }
];

const emptyForm = {
  name: '',
  category: 'Food',
  description: '',
  deal: ''
};

export default function Admin() {
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [reportCategory, setReportCategory] = useState('All');
  const [reportMinRating, setReportMinRating] = useState('0');
  const [reportSort, setReportSort] = useState('rating');
  const [reportRows, setReportRows] = useState([]);
  const [reportStatus, setReportStatus] = useState('');

  useEffect(() => {
    if (verified) {
      fetchBusinesses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  // Keep report data in sync with filters while admin is verified.
  useEffect(() => {
    if (verified) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, reportCategory, reportMinRating, reportSort]);

  // Derived summary stats are used in the presentable report section.
  const reportSummary = useMemo(() => {
    if (!reportRows.length) {
      return { total: 0, averageRating: 0, topCategory: 'N/A', topBusiness: 'N/A' };
    }
    const total = reportRows.length;
    const averageRating =
      reportRows.reduce((sum, row) => sum + row.avg_rating, 0) / total;
    const categoryCounts = reportRows.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0];
    const topBusiness = reportRows.reduce((best, row) => (
      row.avg_rating > best.avg_rating ? row : best
    ), reportRows[0]).name;
    return { total, averageRating, topCategory, topBusiness };
  }, [reportRows]);

  async function verifyCode(event) {
    event.preventDefault();
    setStatus('Verifying...');
    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid code.');
      setVerified(true);
      setStatus('Verified. You can manage businesses now.');
    } catch (error) {
      setVerified(false);
      setStatus(error.message);
    }
  }

  async function fetchBusinesses() {
    try {
      const res = await fetch(`${API_BASE}/admin/businesses?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load businesses.');
      setBusinesses(data);
    } catch (error) {
      setStatus(error.message);
      setBusinesses([]);
    }
  }

  async function fetchReport() {
    // Build the report query to match the backend filters.
    setReportStatus('Loading report...');
    const params = new URLSearchParams();
    if (reportCategory !== 'All') params.set('category', reportCategory);
    if (reportMinRating !== '') params.set('min_rating', reportMinRating);
    params.set('sort', reportSort);

    try {
      const res = await fetch(`${API_BASE}/report/businesses?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load report.');
      setReportRows(data);
      setReportStatus('');
    } catch (error) {
      setReportRows([]);
      setReportStatus(error.message);
    }
  }

  function exportReportCsv() {
    // Export only the currently filtered/sorted dataset.
    const headers = ['Name', 'Category', 'Avg Rating', 'Review Count', 'Deal'];
    const lines = [headers.join(',')];
    reportRows.forEach((row) => {
      const values = [
        row.name,
        row.category,
        row.avg_rating.toFixed(2),
        row.review_count,
        row.deal || ''
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`);
      lines.push(values.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleReportRatingChange(value) {
    const numeric = Math.max(0, Math.min(5, Number(value)));
    setReportMinRating(Number.isNaN(numeric) ? '' : String(numeric));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('Saving business...');
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      deal: form.deal.trim()
    };

    const url = editingId
      ? `${API_BASE}/admin/business/${editingId}?code=${encodeURIComponent(code)}`
      : `${API_BASE}/admin/business?code=${encodeURIComponent(code)}`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Save failed.');
      setForm(emptyForm);
      setEditingId(null);
      setStatus('Business saved.');
      fetchBusinesses();
    } catch (error) {
      setStatus(error.message);
    }
  }

  function startEdit(business) {
    setEditingId(business.id);
    setForm({
      name: business.name || '',
      category: business.category || 'Food',
      description: business.description || '',
      deal: business.deal || ''
    });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this business?')) return;
    setStatus('Deleting business...');
    try {
      const res = await fetch(`${API_BASE}/admin/business/${id}?code=${encodeURIComponent(code)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Delete failed.');
      setStatus('Business removed.');
      fetchBusinesses();
    } catch (error) {
      setStatus(error.message);
    }
  }

  // Render the UI for this view.
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin - Business Management</h1>
          <p className="text-slate-600">Use the passcode to update listings safely.</p>
        </div>

        <form onSubmit={verifyCode} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <label className="text-sm text-slate-700">
            Admin passcode
            <div className="mt-2 flex flex-wrap gap-3">
              <input
                type="password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 min-w-[220px]"
                required
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Verify
              </button>
            </div>
          </label>
          {status && <p className="text-sm text-slate-600 mt-3">{status}</p>}
        </form>

        {verified && (
          <>
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-slate-900">Business Report</h2>
                <p className="text-slate-600">Summarizes ratings, reviews, and deals for analysis.</p>
              </div>

              <div className="flex flex-wrap items-end gap-4 border border-slate-200 rounded-lg p-4 mb-6">
                <label className="text-sm text-slate-700">
                  Category
                  <select
                    value={reportCategory}
                    onChange={(event) => setReportCategory(event.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {REPORT_CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  Minimum rating
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={reportMinRating}
                    onChange={(event) => handleReportRatingChange(event.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Sort by
                  <select
                    value={reportSort}
                    onChange={(event) => setReportSort(event.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {REPORT_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={exportReportCsv}
                    className="px-4 py-2 border border-slate-200 rounded-lg"
                    disabled={!reportRows.length}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Total Businesses Shown</div>
                  <div className="text-2xl font-semibold text-slate-900">{reportSummary.total}</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Average Rating</div>
                  <div className="text-2xl font-semibold text-slate-900">
                    {reportSummary.averageRating.toFixed(2)}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Top Category</div>
                  <div className="text-2xl font-semibold text-slate-900">{reportSummary.topCategory}</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Highest Rated Business</div>
                  <div className="text-lg font-semibold text-slate-900">{reportSummary.topBusiness}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-slate-500 border-b">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Avg Rating</th>
                      <th className="py-2">Review Count</th>
                      <th className="py-2">Deal/Coupon</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row) => (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="py-2 font-medium text-slate-900">{row.name}</td>
                        <td className="py-2">{row.category}</td>
                        <td className="py-2">{row.avg_rating.toFixed(2)}</td>
                        <td className="py-2">{row.review_count}</td>
                        <td className="py-2">{row.deal || '-'}</td>
                        <td className="py-2">
                          <Link
                            to={`/BusinessDetail?id=${row.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {!reportRows.length && (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500">
                          {reportStatus || 'No results for the selected filters.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {editingId ? 'Edit Business' : 'Add Business'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700">
                  Name
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-700 md:col-span-2">
                  Description (optional)
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                    rows="3"
                  />
                </label>
                <label className="text-sm text-slate-700 md:col-span-2">
                  Deal / coupon (optional)
                  <input
                    value={form.deal}
                    onChange={(event) => setForm({ ...form, deal: event.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {editingId ? 'Update business' : 'Add business'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Existing Businesses</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-slate-500 border-b">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Deal</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((business) => (
                      <tr key={business.id} className="border-b last:border-0">
                        <td className="py-2 font-medium text-slate-900">{business.name}</td>
                        <td className="py-2">{business.category}</td>
                        <td className="py-2">{business.deal || '-'}</td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(business)}
                              className="px-3 py-1 border border-slate-200 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(business.id)}
                              className="px-3 py-1 border border-red-200 text-red-600 rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!businesses.length && (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-slate-500">
                          No businesses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
