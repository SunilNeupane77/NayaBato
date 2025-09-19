export async function GET() {
  return new Response('Service Worker has been removed', {
    status: 410,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
