import { listCalendarFileNames, renderCalendarFile } from '@/lib/calendar-files';
import { resolveSiteUrl } from '@/lib/site-url';

// Generated once at build time and served as static files:
// /calendar/nida-junaid-nikah.ics and /calendar/nida-junaid-mehndi.ics
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return listCalendarFileNames().map((file) => ({ file }));
}

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  const body = renderCalendarFile(file, resolveSiteUrl(process.env), new Date());

  if (body === null) {
    return new Response('Calendar file not found.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      // "inline" lets iPhone Safari offer "Add to Calendar"; other browsers save the file.
      'Content-Disposition': `inline; filename="${file}"`,
    },
  });
}
