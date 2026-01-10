// Purpose: Presentable report page with filters and CSV export.
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';
const CATEGORY_OPTIONS = ['All', 'Food', 'Retail', 'Services'];

function downloadCsv(rows) {
  // Generate CSV from the current filtered report rows.
  const headers = ['Name', 'Category', 'Avg Rating', 'Review Count', 'Deal'];
  const lines = [headers.join(',')];
  rows.forEach((row) => {
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

export default function Reports() {
  const [category, setCategory] = useState('All');
  const [minRating, setMinRating] = useState('0');
  const [sort, setSort] = useState('rating');
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');

  const summary = useMemo(() => {
    // Summary stats are derived from the same rows shown in the table.
    if (!rows.length) {
      return { total: 0, averageRating: 0, mostCommon: 'N/A' };
    }
    const total = rows.length;
    const ratingSum = rows.reduce((sum, row) => sum + row.avg_rating, 0);
    const averageRating = ratingSum / total;
    const categoryCounts = rows.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});
    const mostCommon = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0];
    return { total, averageRating, mostCommon };
  }, [rows]);

  async function loadReport(event) {
    event.preventDefault();
    // Build a query that mirrors the report filter controls.
    setStatus('Loading report...');
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (minRating !== '') params.set('min_rating', minRating);
    params.set('sort', sort);

    try {
      const res = await fetch(`${API_BASE}/report/businesses?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to load report.');
      }
      setRows(data);
      setStatus('');
    } catch (error) {
      setStatus(error.message);
      setRows([]);
    }
  }

  function handleRatingChange(value) {
    const numeric = Math.max(0, Math.min(5, Number(value)));
    setMinRating(Number.isNaN(numeric) ? '' : String(numeric));
  }

  // Render the UI for this view.
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Business Report</h1>
          <p className="text-slate-600">Presentable summary for judges and stakeholders.</p>
        </div>

        <form onSubmit={loadReport} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm text-slate-700">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-700">
              Minimum rating (0-5)
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(event) => handleRatingChange(event.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>

            <label className="text-sm text-slate-700">
              Sort by
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
              >
                <option value="rating">Rating (desc)</option>
                <option value="reviews">Review count (desc)</option>
                <option value="name">Name (asc)</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Generate report
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(rows)}
              className="px-4 py-2 border border-slate-200 rounded-lg"
              disabled={!rows.length}
            >
              Export CSV
            </button>
          </div>
          {status && <p className="text-sm text-slate-600 mt-3">{status}</p>}
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-700">
            <div>Total businesses: <span className="font-semibold">{summary.total}</span></div>
            <div>Average rating: <span className="font-semibold">{summary.averageRating.toFixed(2)}</span></div>
            <div>Most common category: <span className="font-semibold">{summary.mostCommon}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Avg Rating</th>
                  <th className="py-2">Review Count</th>
                  <th className="py-2">Deal</th>
                  <th className="py-2">View</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
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
                {!rows.length && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-500">
                      Generate a report to see results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
