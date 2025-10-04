import fetch from 'node-fetch';

export async function GET(req) {
  try {
    const res = await fetch('https://model-late-thunder-6593.fly.dev/cluster');
    const json = await res.json();

    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
