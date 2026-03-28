'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BarChart2, AlertCircle } from 'lucide-react';

export default function ParentPerformancePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/public/student/${studentId}/scores`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load performance');
        return res.json();
      })
      .then(setScores)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-8 text-center">Loading performance...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Student Performance - ID: {studentId}
      </h1>

      {scores.length === 0 ? (
        <p className="text-center text-gray-600 bg-white p-8 rounded-xl shadow-sm border">No scores recorded yet</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Term</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase">Max</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scores.map((s, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">{s.term}</td>
                  <td className="px-6 py-4">{s.assessmentType}</td>
                  <td className="px-6 py-4 text-center font-medium">{s.score}</td>
                  <td className="px-6 py-4 text-center">{s.maxScore}</td>
                  <td className="px-6 py-4">{s.comments || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}