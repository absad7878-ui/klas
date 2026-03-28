// apps/api/src/services/sms.service.ts
// Termii SMS API wrapper

const TERMII_BASE = 'https://v3.api.termii.com/api';

export interface TermiiSendPayload {
  to: string;
  from: string;
  sms: string;
  type: 'plain';
  channel: 'generic' | 'dnd' | 'WhatsApp';
  api_key: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0'))   return '234' + digits.slice(1);
  return digits;
}

export async function sendSms(
  to: string,
  message: string,
  apiKey: string,
  senderId: string = 'SchoolAlert',
): Promise<SmsSendResult> {
  try {
    const phone = normalisePhone(to);
    console.log(`[SMS] Sending to ${phone} | senderId=${senderId}`);

    const payload: TermiiSendPayload = {
      to:      phone,
      from:    senderId,
      sms:     message,
      type:    'plain',
      channel: 'generic',
      api_key: apiKey,
    };

    const res = await fetch(`${TERMII_BASE}/sms/send`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json() as any;
    console.log('[SMS] Termii response:', JSON.stringify(data));

    if (data.message_id || data.message === 'Successfully Sent') {
      return { success: true, messageId: data.message_id };
    }

    return { success: false, error: data.message || 'Unknown Termii error' };
  } catch (err: any) {
    console.error('[SMS] Exception:', err.message);
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function getTermiiBalance(apiKey: string): Promise<number | null> {
  try {
    const res = await fetch(`${TERMII_BASE}/get-balance?api_key=${apiKey}`);
    const data = await res.json() as any;
    return data.balance ?? null;
  } catch {
    return null;
  }
}

export function buildAttendanceMessage(opts: {
  parentName:   string;
  studentName:  string;
  status:       'PRESENT' | 'ABSENT' | string;
  date:         Date;
  schoolName:   string;
}): string {
  const dateStr = opts.date.toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (opts.status === 'ABSENT') {
    return (
      `Dear ${opts.parentName}, your ward ${opts.studentName} was marked ABSENT on ${dateStr}. ` +
      `Please contact the school if this is unexpected. - ${opts.schoolName}`
    );
  }

  return (
    `Dear ${opts.parentName}, ${opts.studentName} was marked PRESENT on ${dateStr}. ` +
    `- ${opts.schoolName}`
  );
}