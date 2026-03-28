'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SchoolSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (subdomain: string) => {
    // In production: window.location.href = `https://${subdomain}.yourdomain.com`
    // In dev: redirect to local subdomain (you need hosts file entry)
    router.push(`/${subdomain}`); // or use window.location for real subdomains
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for your school by name..."
        className="w-full px-6 py-5 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 shadow-lg"
      />

      {results.length > 0 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-auto z-10">
          {results.map((school: any) => (
            <div
              key={school.id}
              onClick={() => handleSelect(school.subdomain)}
              className="px-6 py-4 hover:bg-blue-50 cursor-pointer flex items-center gap-4 border-b last:border-b-0"
            >
              {school.logoUrl && (
                <img src={school.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
              <div>
                <div className="font-medium">{school.name}</div>
                <div className="text-sm text-gray-500">{school.subdomain}.yourplatform.com</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <div className="absolute right-6 top-6 text-gray-400">Searching...</div>}
    </div>
  );
}