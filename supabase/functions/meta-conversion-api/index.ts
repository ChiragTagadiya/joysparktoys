// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const PIXEL_ID = '1469475641884487';
const GRAPH_API_VERSION = 'v23.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Normalize email/phone before hashing to improve matching. */
const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const normalizePhone = (phone: string): string =>
  phone.replace(/\D/g, '').replace(/^0+/, '');

const sha256 = async (input: string): Promise<string> => {
  if (!input) return '';
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const generateEventId = (): string => {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { event_name, event_id, user, custom_data } = body;

    if (!event_name) {
      return new Response(JSON.stringify({ error: 'event_name is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('META_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Server not configured: missing META_ACCESS_TOKEN' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const userData: Record<string, any> = {};

    if (user?.email) {
      userData.em = await sha256(normalizeEmail(user.email));
    }

    if (user?.phone) {
      userData.ph = await sha256(normalizePhone(user.phone));
    }

    const clientIp = req.headers.get('x-forwarded-for') || '';
    const userAgent = req.headers.get('user-agent') || '';

    if (clientIp) {
      userData.client_ip_address = clientIp.split(',')[0].trim();
    }
    if (userAgent) {
      userData.client_user_agent = userAgent;
    }

    const event: Record<string, any> = {
      event_name,
      event_id: event_id || generateEventId(),
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: custom_data?.event_source_url || '',
      action_source: 'website',
      user_data: userData,
      custom_data: { ...custom_data },
    };

    // Remove the URL from custom_data since it's already in event_source_url.
    delete event.custom_data.event_source_url;

    const payload: Record<string, any> = { data: [event] };

    const testCode = Deno.env.get('META_TEST_EVENT_CODE') || custom_data?.test_event_code;
    if (testCode) {
      payload.test_event_code = testCode;
    }

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json().catch(() => ({}));

    return new Response(
      JSON.stringify({
        success: res.ok,
        event_id: event.event_id,
        fbtrace_id: json.fbtrace_id,
        messages: json.messages,
      }),
      {
        status: res.ok ? 200 : 422,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
