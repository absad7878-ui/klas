'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DollarSign, AlertCircle } from 'lucide-react';

export default function ParentFeesPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/public/student/${studentId}/fees`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load fees');
        return res.json();
      })
      .then(setFees)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-8 text-center">Loading fees status...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Fees Status - Student ID: {studentId}
      </h1>

      {fees.length === 0 ? (
        <p className="text-center text-gray-600 bg-white p-8 rounded-xl shadow-sm border">No fees recorded yet</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {fees.map((f, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl border shadow-sm ${
                f.status === 'Paid' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <h3 className="font-bold text-xl mb-2">{f.term}</h3>
              <p className="text-lg">
                Status: <span className={f.status === 'Paid' ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                  {f.status}
                </span>
              </p>
              <p className="mt-2">Amount Due: ₦{f.amountDue.toLocaleString()}</p>
              <p>Amount Paid: ₦{f.amountPaid.toLocaleString()}</p>
              {f.lastPaymentDate && (
                <p className="mt-3 text-sm text-gray-600">
                  Last Payment: {new Date(f.lastPaymentDate).toDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}