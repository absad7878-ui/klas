'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, AlertCircle } from 'lucide-react';

export default function ParentAttendancePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/public/student/${studentId}/attendance`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load attendance');
        return res.json();
      })
      .then(setAttendance)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-8 text-center">Loading attendance...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Attendance History - ID: {studentId}
      </h1>

      {attendance.length === 0 ? (
        <p className="text-center text-gray-600 bg-white p-8 rounded-xl shadow-sm border">No attendance records yet</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendance.map((record, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="font-medium">
                {new Date(record.date).toLocaleDateString()}
              </p>
              <p className="mt-2 text-lg">
                Status: <span className={record.status === 'PRESENT' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {record.status}
                </span>
              </p>
              <p className="mt-1 text-gray-600">{record.subject || 'General'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}