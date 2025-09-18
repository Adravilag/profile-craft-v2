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
];
