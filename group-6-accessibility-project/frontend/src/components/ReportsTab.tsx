// ...existing code...
import React, { useEffect, useState } from 'react';
import { Trash2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

type User = {
  id: number;
  email?: string;
  name?: string;
};

type Issue = {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
  User?: User;
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function AccessibilityIssuesList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: 'deleting' | null }>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const apiBase = 'http://localhost:3000';

  useEffect(() => {
    fetchIssues();
  }, []);

  const addToast = (message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiBase}/accessibility-issues`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });

      const text = await res.text();
      const ct = res.headers.get('content-type') || '';

      if (!res.ok) {
        console.error('API error', res.status, text);
        throw new Error(`API ${res.status}: ${text.slice(0, 500)}`);
      }

      if (!ct.includes('application/json')) {
        console.error('Non-JSON response', text);
        throw new Error(`Expected JSON but got ${ct}`);
      }

      const data: Issue[] = JSON.parse(text);
      setIssues(data);
    } catch (err: any) {
      console.error('fetchIssues error:', err);
      setError(err.message || 'Failed to load issues.');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const resolveIssue = async (id: number) => {
    const issue = issues.find(i => i.id === id);
    const confirmMsg = `Resolve and remove issue #${id}?${issue ? `\n\n"${issue.message.slice(0, 120)}${issue.message.length > 120 ? '…' : ''}"` : ''}`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(prev => ({ ...prev, [id]: 'deleting' }));
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiBase}/accessibility-issues/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Delete failed', res.status, text);
        throw new Error(text || 'Delete failed');
      }

      setIssues(prev => prev.filter(i => i.id !== id));
      addToast(`Issue #${id} resolved and removed`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || 'Could not resolve issue', 'error');
      setError(err?.message || 'Could not resolve issue.');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '');

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center justify-between p-4 rounded-lg shadow-lg min-w-80 max-w-md transform transition-all duration-300 ease-in-out ${
            t.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            t.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            t.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {t.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{t.message}</span>
          </div>
          <button onClick={() => removeToast(t.id)} className="ml-4 p-1 hover:bg-black/10 rounded" aria-label="Close notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Accessibility Reports</h1>
          <p className="text-gray-500">Review and resolve reported accessibility issues submitted by users.</p>
        </div>

        <hr className="border-gray-200" />

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600">Error: {error}</p>
              </div>
              <button onClick={fetchIssues} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
            </div>
          </div>
        )}

        {issues.length === 0 ? (
          <div className="p-8 text-center border border-gray-200 rounded-lg bg-white">
            <p className="text-gray-500">No accessibility issues reported.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {issues.map(issue => (
              <div key={issue.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight text-gray-900">Issue #{issue.id}</h3>
                    <div className="text-sm text-gray-500">{formatDate(issue.createdAt)}</div>
                  </div>

                  <p className="text-gray-500 text-sm italic">Reported by: {issue.User?.name ?? issue.User?.email ?? 'Unknown'}</p>

                  <p className="text-sm leading-relaxed text-gray-700 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                    {issue.message}
                  </p>
                </div>

                <div className="flex gap-2 p-4 pt-0">
                  <button
                    onClick={() => resolveIssue(issue.id)}
                    disabled={actionLoading[issue.id] === 'deleting'}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors font-medium"
                    aria-label={`Resolve issue ${issue.id}`}
                  >
                    {actionLoading[issue.id] === 'deleting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Resolve the issue
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
// ...existing code...