'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Clock } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  createdAt: string;
}

export default function NotificationBell({
  apiUrl,
  token,
  role = 'teacher',
}: {
  apiUrl: string;
  token: string;
  role?: string;
}) {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = `klas_last_read_${role}`;

  useEffect(() => {
    if (!token) return;
    loadAnnouncements();
  }, [token]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: Announcement[] = await res.json();
        setAnnouncements(data);

        const lastRead = localStorage.getItem(STORAGE_KEY);
        const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;

        const unreadCount = data.filter(
          (a) => new Date(a.createdAt).getTime() > lastReadTime
        ).length;

        setUnread(unreadCount);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setUnread(0);
    }
  };

  const audienceInfo = (a: string) => {
    if (a === 'parents')
      return { label: 'Parents', bg: '#EFF6FF', color: '#2563EB' };
    if (a === 'teachers')
      return { label: 'Teachers', bg: '#ECFDF5', color: '#16A34A' };
    return { label: 'Everyone', bg: '#FFF7ED', color: '#EA580C' };
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,.15)',
          background: open ? 'rgba(201,150,58,.2)' : 'rgba(255,255,255,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Bell size={18} color={open ? '#C9963A' : '#94A3B8'} />

        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              borderRadius: 20,
              background: '#EF4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: 18,
            boxShadow: '0 25px 70px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0',
            zIndex: 999,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '.9rem', fontWeight: 700 }}>
              Announcements
            </h4>

            <button
              onClick={() => setOpen(false)}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: 8,
                padding: 5,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              Loading...
            </div>
          ) : announcements.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              No announcements yet
            </div>
          ) : (
            <div style={{ padding: '.5rem' }}>
              {announcements.map((a) => {
                const aud = audienceInfo(a.targetAudience);

                return (
                  <div
                    key={a.id}
                    style={{
                      padding: '.8rem',
                      borderRadius: 12,
                      marginBottom: '.5rem',
                      background: '#F8FAFC',
                      transition: '0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Title + Badge */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '.5rem',
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: '.85rem',
                          margin: 0,
                          color: '#0F172A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {a.title}
                      </p>

                      <span
                        style={{
                          fontSize: '.6rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 20,
                          background: aud.bg,
                          color: aud.color,
                          flexShrink: 0,
                        }}
                      >
                        {aud.label}
                      </span>
                    </div>

                    {/* Content */}
                    <p
                      style={{
                        fontSize: '.75rem',
                        color: '#64748B',
                        margin: '6px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {a.content}
                    </p>

                    {/* Date */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '.7rem',
                        color: '#94A3B8',
                      }}
                    >
                      <Clock size={11} />
                      {new Date(a.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}