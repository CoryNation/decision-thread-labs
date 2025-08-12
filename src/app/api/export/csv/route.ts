import { NextResponse } from 'next/server'

export async function GET() {
  const csv = 'id,title\n1,Example Decision'
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="decisions.csv"'
    }
  })
}
