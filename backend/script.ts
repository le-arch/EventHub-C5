/**
 * EventHub Backend Edge Script
 * Deployed to Bunny CDN Edge Scripting
 * Handles API routing, rate limiting, and request optimization
 */

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  REQUESTS_PER_MINUTE: 100,
  REQUESTS_PER_HOUR: 5000,
  WINDOW_SIZE: 60, // seconds
};

// API routes that should bypass cache
const NO_CACHE_ROUTES = [
  '/api/v1/auth/',
  '/api/v1/orders',
  '/api/v1/checkin',
];

// Cache settings for different API endpoints
const API_CACHE_SETTINGS = {
  '/api/v1/events/public': 600, // 10 minutes
  '/api/v1/events': 300, // 5 minutes
  '/api/v1/events/': 300,
  '/api/v1/attendees': 60, // 1 minute
  '/api/v1/analytics': 300, // 5 minutes
  '/health': 30, // 30 seconds
  DEFAULT: 0, // No cache
};

/**
 * Main request handler
 */
async function handleRequest(request: any): Promise<Response> {
  const url = new URL(request.Url);
  const path = url.pathname;
  const method = request.HttpMethod;

  // Check rate limiting
  if (!checkRateLimit(request)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Add security headers
  const headers = addSecurityHeaders(request.Headers);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response('', {
      status: 204,
      headers,
    });
  }

  // Redirect HTTP to HTTPS
  if (url.protocol === 'http:' && url.hostname !== 'localhost') {
    return new Response('', {
      status: 301,
      headers: {
        'Location': `https://${url.hostname}${url.pathname}${url.search}`,
      },
    });
  }

  // Health check endpoint
  if (path === '/health' && method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${API_CACHE_SETTINGS['/health']}`,
        },
      }
    );
  }

  // Route to backend
  return routeToBackend(request, headers);
}

/**
 * Check rate limiting
 */
function checkRateLimit(request: any): boolean {
  // In production, implement actual rate limiting with key-value store
  // This is a placeholder for demonstration
  const clientIP = request.Headers['X-Forwarded-For'] || request.Headers['CF-Connecting-IP'] || 'unknown';
  
  // TODO: Implement using Bunny KV or similar
  return true;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(headers: any): any {
  const securityHeaders: any = {
    ...headers,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  };

  // Add CORS headers
  securityHeaders['Access-Control-Allow-Origin'] = headers['Origin'] || '*';
  securityHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
  securityHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
  securityHeaders['Access-Control-Max-Age'] = '86400';
  securityHeaders['Access-Control-Allow-Credentials'] = 'true';

  return securityHeaders;
}

/**
 * Route request to backend
 */
async function routeToBackend(request: any, headers: any): Promise<Response> {
  const url = new URL(request.Url);
  const path = url.pathname;
  const method = request.HttpMethod;

  // Get backend URL from environment or default
  const backendUrl = `http://api:8085${path}${url.search}`;

  // Check if this route should bypass cache
  const shouldBypassCache = NO_CACHE_ROUTES.some(route => path.startsWith(route));

  // Prepare fetch request
  const fetchOptions: any = {
    method: method,
    headers: headers,
  };

  // Include body for POST/PUT/PATCH requests
  if (method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') {
    fetchOptions.body = request.Body;
  }

  try {
    // Fetch from backend with timeout
    const backendRequest = fetch(backendUrl, fetchOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Backend timeout')), 30000) // 30 second timeout
    );

    const response: any = await Promise.race([backendRequest, timeoutPromise]);

    // Clone response to modify headers
    const clonedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    // Set cache control if applicable
    if (method === 'GET' && !shouldBypassCache) {
      const cacheTime = getCacheTime(path);
      if (cacheTime > 0) {
        clonedResponse.Headers['Cache-Control'] = `public, max-age=${cacheTime}`;
      }
    }

    // Add custom headers
    clonedResponse.Headers = addSecurityHeaders(clonedResponse.Headers);

    return clonedResponse;
  } catch (error) {
    // Return error response
    console.error('Backend request failed:', error);
    return new Response(
      JSON.stringify({
        error: 'Backend service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }
}

/**
 * Get cache time for API endpoint
 */
function getCacheTime(path: string): number {
  for (const [route, ttl] of Object.entries(API_CACHE_SETTINGS)) {
    if (route !== 'DEFAULT' && path.startsWith(route)) {
      return ttl as number;
    }
  }
  return API_CACHE_SETTINGS.DEFAULT as number;
}

/**
 * Main entry point for Bunny Edge Scripting
 */
addEventListener('fetch', (event: any) => {
  event.respondWith(handleRequest(event.request));
});
