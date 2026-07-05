import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Load test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp to 50 users
    { duration: '2m', target: 100 },   // Spike to 100 users
    { duration: '1m', target: 50 },    // Scale back to 50
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.1'],     // Error rate below 10%
  },
};

// Custom metrics
const responseTime = new Trend('response_time');
const successRate = new Rate('success_rate');
const errorCount = new Counter('errors');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = __ENV.API_URL || 'http://localhost:5000';

export default function () {
  group('Frontend - Home Page', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'page loads in < 2s': (r) => r.timings.duration < 2000,
    });
    responseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    if (res.status !== 200) errorCount.add(1);
  });

  sleep(1);

  group('API - Tickets List', () => {
    const res = http.get(`${API_URL}/api/tickets?from=0&to=50`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has data': (r) => r.body.includes('referenceNumber'),
    });
    responseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    if (res.status !== 200) errorCount.add(1);
  });

  sleep(1);

  group('API - Dashboard', () => {
    const res = http.get(`${API_URL}/api/dashboard`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
      'has KPIs': (r) => r.body.includes('kpis'),
    });
    responseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    if (res.status !== 200) errorCount.add(1);
  });

  sleep(1);

  group('API - Chatbot', () => {
    const payload = {
      message: 'What is the investment process?',
      sessionId: `session-${__VU}-${__ITER}`,
      language: 'en',
    };
    const res = http.post(`${API_URL}/api/chatbot`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 3000ms': (r) => r.timings.duration < 3000,
      'has response': (r) => r.body.length > 0,
    });
    responseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    if (res.status !== 200) errorCount.add(1);
  });

  sleep(2);

  group('API - Analytics Event', () => {
    const payload = {
      eventType: 'tool_usage',
      eventName: 'roi_calculator',
      metadata: 'load_test',
    };
    const res = http.post(`${API_URL}/api/analytics/event`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 200ms': (r) => r.timings.duration < 200,
    });
    responseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    if (res.status !== 200) errorCount.add(1);
  });

  sleep(1);
}
