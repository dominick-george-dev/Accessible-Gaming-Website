import { useEffect, useState } from 'react';

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

export default function AccessibilityIssuesList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = 'http://localhost:3000';

  useEffect(() => {
    fetchIssues();
  }, []);

  async function fetchIssues() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token'); // use single consistent key
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

      const data = JSON.parse(text);
      setIssues(data);
    } catch (err: any) {
      console.error('fetchIssues error:', err);
      setError(err.message || 'Failed to load issues.');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }

  async function resolveIssue(id: number) {
    if (!confirm('Resolve this issue and remove it from the list?')) return;
    try {
      const token = localStorage.getItem('access_token'); // same key here
      const res = await fetch(`${apiBase}/accessibility-issues/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Delete failed', res.status, text);
        throw new Error(text || 'Delete failed');
      }
      setIssues(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not resolve issue: ' + (err as any).message);
      setError((err as any).message || 'Could not resolve issue.');
    }
  }

  if (loading) return <div>Loading issues…</div>;
  if (!issues.length) return <div>No accessibility issues reported.</div>;

  return (
    <div role="list" aria-label="Accessibility issues">
      {issues.map(issue => (
        <article key={issue.id} role="listitem" aria-labelledby={`issue-${issue.id}-title`} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
          <header>
            <strong id={`issue-${issue.id}-title`}>Issue #{issue.id}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(issue.createdAt).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Reported by: {issue.User?.name ?? issue.User?.email ?? 'Unknown'}</div>
          </header>
          <p>{issue.message}</p>
          <button onClick={() => resolveIssue(issue.id)} aria-label={`Resolve issue ${issue.id}`}>
            Resolve the issue
          </button>
        </article>
      ))}
    </div>
  );
}