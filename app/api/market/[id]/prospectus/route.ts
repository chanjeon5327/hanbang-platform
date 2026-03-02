import { NextResponse } from 'next/server';

const PDF_BASE64 =
  'JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9Db250ZW50cyA0IDAgUiAvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNDQ+PnN0cmVhbQpCVAovRjEgMjQgVGYKNzIgNzIwIFRkCihIQU5CQU5HIFBST1NQRUNUVVMpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYT4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMTUgMDAwMDAgbiAKMDAwMDAwMDMwNCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNiAvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgozODAKJSVFT0YK';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const pdf = Buffer.from(PDF_BASE64, 'base64');

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${id}-prospectus.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
