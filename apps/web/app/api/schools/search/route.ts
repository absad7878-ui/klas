// apps/web/app/api/schools/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  // Mock data for now (replace with real Prisma query later)
  const mockSchools = [
    { id: '1', name: 'Greenwood Academy', subdomain: 'greenwood', logoUrl: null },
    { id: '2', name: 'Lagos Modern School', subdomain: 'lagosmodern', logoUrl: null },
    { id: '3', name: 'Nairobi Elite', subdomain: 'nairobielite', logoUrl: null },
    // add more mocks if needed
  ];

  const filtered = mockSchools.filter(
    s => s.name.toLowerCase().includes(q) || s.subdomain.toLowerCase().includes(q)
  );

  return NextResponse.json(filtered.slice(0, 8));
}