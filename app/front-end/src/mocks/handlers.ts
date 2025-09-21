import { http, HttpResponse } from 'msw';
import experiences from './fixtures/experiences.json';
import skills from './fixtures/skills.json';
import certifications from './fixtures/certifications.json';
import testimonials from './fixtures/testimonials.json';

function logRequest(req: any) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const headers = Object.fromEntries(req.headers.entries());
    console.info('[MSW][preview] Incoming request:', req.method, req.url, {
      params,
      headers,
    });
  } catch (err) {
    // ignore
  }
}

function sanitizeArray(arr: any[], tag = 'preview') {
  return arr.map(item => {
    const copy = { ...item };
    delete copy._id;
    delete copy.user_id;
    if (copy.company) copy.company = `${copy.company} (${tag})`;
    return copy;
  });
}

export const handlers = [
  // Interceptar rutas relativas y con host completo
  http.get('/api/experiences', ({ request }) => {
    logRequest(request);
    return HttpResponse.json(sanitizeArray(experiences));
  }),
  // full URL handlers removed to avoid interfering in non-local environments

  http.get('/api/skills', ({ request }) => {
    logRequest(request);
    return HttpResponse.json(skills);
  }),
  // full URL handlers removed to avoid interfering in non-local environments

  http.get('/api/certifications', ({ request }) => {
    logRequest(request);
    return HttpResponse.json(certifications);
  }),
  // full URL handlers removed to avoid interfering in non-local environments

  http.get('/api/testimonials', ({ request }) => {
    logRequest(request);
    return HttpResponse.json(testimonials);
  }),
  // full URL handlers removed to avoid interfering in non-local environments

  // Media endpoints (mocks) -------------------------------------------------
  http.post('/api/media/sign', ({ request }) => {
    logRequest(request);
    const timestamp = Math.round(Date.now() / 1000);
    return HttpResponse.json({
      success: true,
      signature: 'mock-signature',
      timestamp,
      apiKey: 'mock-api-key',
      // Use the project's test cloud name so URLs look realistic in dev
      cloudName: 'dtdnfd2ku',
    });
  }),

  // Intercept direct calls to Cloudinary's unsigned/signed upload endpoint
  http.post(
    'https://api.cloudinary.com/v1_1/:cloudName/image/upload',
    async ({ request, params }) => {
      logRequest(request as any);
      try {
        const cloudName = params.cloudName || 'dtdnfd2ku';
        const id = Date.now();
        // Return a response shape similar to Cloudinary's successful upload
        return HttpResponse.json({
          asset_id: `mock-asset-${id}`,
          public_id: `mock-${id}`,
          version: id,
          version_id: `v${id}`,
          signature: 'mock-signature',
          width: 800,
          height: 600,
          format: 'jpg',
          resource_type: 'image',
          created_at: new Date().toISOString(),
          tags: [],
          bytes: 12345,
          type: 'upload',
          etag: 'mock-etag',
          placeholder: false,
          // Point to a local dev image so the browser can actually GET it
          url: `/mock-images/mock-image.svg`,
          secure_url: `/mock-images/mock-image.svg`,
        });
      } catch (err) {
        return HttpResponse.json({ success: false, error: String(err) }, { status: 500 });
      }
    }
  ),

  http.post('/api/media/upload', async ({ request }) => {
    // Accept FormData or JSON
    try {
      logRequest(request);
      // If form data, we won't parse files here; return mocked file URL
      const id = Date.now();
      return HttpResponse.json({
        success: true,
        file: {
          id,
          // Return a local dev URL to avoid external 404s during preview
          url: `/mock-images/mock-image.svg`,
          name: 'mock-image.jpg',
          size: 12345,
          thumbnail: `/mock-images/mock-image.svg`,
          filename: `mock-image-${id}`,
          source: 'mock',
        },
      });
    } catch (err) {
      return HttpResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
  }),

  http.get('/api/media', ({ request }) => {
    logRequest(request);
    return HttpResponse.json([]);
  }),

  // Health check
  http.get('/api/health', ({ request }) => {
    logRequest(request);
    return HttpResponse.json({ status: 'ok' });
  }),

  // Auth related mocks
  http.get('/api/auth/first-admin-user', ({ request }) => {
    logRequest(request);
    return HttpResponse.json({ exists: true });
  }),

  http.get('/api/auth/has-user', ({ request }) => {
    logRequest(request);
    return HttpResponse.json({ hasUser: true });
  }),

  // Profile and public endpoints
  http.get('/api/profile/public/username/admin', ({ request }) => {
    logRequest(request);
    return HttpResponse.json({ username: 'admin', displayName: 'Admin User' });
  }),

  // Projects, skills, experiences endpoints with optional userId query
  http.get('/api/projects', ({ request }) => {
    logRequest(request);
    const url = new URL(request.url as any);
    const userId = url.searchParams.get('userId') || 'admin';
    return HttpResponse.json([{ id: 'p1', title: `Project for ${userId}` }]);
  }),

  http.get('/api/experiences', ({ request }) => {
    logRequest(request);
    return HttpResponse.json(sanitizeArray(experiences, 'dev'));
  }),

  http.get('/api/certifications', ({ request }) => {
    logRequest(request);
    const url = new URL(request.url as any);
    const userId = url.searchParams.get('userId') || 'dynamic-admin-id';
    return HttpResponse.json(certifications.filter(c => !userId || true));
  }),

  http.get('/api/skills', ({ request }) => {
    logRequest(request);
    const url = new URL(request.url as any);
    const userId = url.searchParams.get('userId') || 'admin';
    return HttpResponse.json(skills);
  }),

  http.get('/api/profile/:id/pattern', ({ request, params }) => {
    logRequest(request);
    return HttpResponse.json({ pattern: `pattern-for-${params.id}` });
  }),

  http.get('/api/testimonials', ({ request }) => {
    logRequest(request);
    return HttpResponse.json(testimonials);
  }),
];
