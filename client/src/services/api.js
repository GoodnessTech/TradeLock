const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchTrades(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_BASE}/orders${params ? '?' + params : ''}`);
  return res.json();
}

export async function fetchTrade(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  return res.json();
}

export async function createTrade(payload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function submitEvidence(tradeId, evidencePayload) {
  const res = await fetch(`${API_BASE}/orders/${tradeId}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evidencePayload),
  });
  return res.json();
}

export async function analyzeOrder(tradeId, payload = {}) {
  const res = await fetch(`${API_BASE}/orders/${tradeId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchOrderReview(tradeId) {
  const res = await fetch(`${API_BASE}/orders/${tradeId}/review`);
  return res.json();
}

export async function requestAttestation(tradeId, payload = {}) {
  const res = await fetch(`${API_BASE}/orders/${tradeId}/attestation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function verifyTrade(tradeId, payload = {}) {
  const res = await fetch(`${API_BASE}/orders/${tradeId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return res.json();
}

export async function recordTransaction(tradeId, txPayload) {
  const res = await fetch(`${API_BASE}/orders/${tradeId}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txPayload),
  });
  return res.json();
}

export async function disputeOrder(tradeId, disputePayload) {
  const res = await fetch(`${API_BASE}/orders/${tradeId}/dispute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(disputePayload),
  });
  return res.json();
}

export async function verifyCustom(payload) {
  const res = await fetch(`${API_BASE}/verify-custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
