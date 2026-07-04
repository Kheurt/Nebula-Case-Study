import { NextRequest, NextResponse } from 'next/server';

let requestCounter = 0;
let errorCounter = 0;

// Track metrics in-process (no prom-client to avoid edge runtime issues)
export function incrementRequests() { requestCounter++; }
export function incrementErrors() { errorCounter++; }

export async function GET(_req: NextRequest) {
  const metrics = [
    `# HELP http_requests_total Total HTTP requests`,
    `# TYPE http_requests_total counter`,
    `http_requests_total ${requestCounter}`,
    ``,
    `# HELP http_errors_total Total HTTP errors`,
    `# TYPE http_errors_total counter`,
    `http_errors_total ${errorCounter}`,
    ``,
    `# HELP process_uptime_seconds Process uptime in seconds`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${process.uptime().toFixed(2)}`,
    ``,
    `# HELP nodejs_heap_size_bytes Node.js heap size`,
    `# TYPE nodejs_heap_size_bytes gauge`,
    `nodejs_heap_size_bytes ${process.memoryUsage().heapUsed}`,
  ].join('\n');

  return new NextResponse(metrics, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' },
  });
}
