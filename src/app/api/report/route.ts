// File: src/app/api/reports/route.ts
// Handles creating, fetching, and updating reports, with user authentication and role-based access.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route'; // Import authentication options
import { ReportType } from '@prisma/client';

// --- ReportRequest Interface ---
interface ReportRequest {
  type: string;
  target_id: string;
  reason: string;
  description?: string | null; // Optional field
  submitted_by?: string | null;
}

// --- POST Handler (Create Report) ---
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
    }

    const { type, target_id, reason, description, submitted_by }: ReportRequest = await req.json() as ReportRequest;

    if (!type || !target_id || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newReport = await prisma.report.create({
      data: {
        type: type as ReportType,
        target_id: BigInt(target_id),
        reason,
        description: description || null,
        submitted_by: submitted_by ? BigInt(submitted_by) : null,
        status: "pending",
      },
    });

    const safeReport = {
      ...newReport,
    };

    return new NextResponse(JSON.stringify(safeReport, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('POST /api/reports error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- GET Handler (Fetch Reports) ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
    }

    const id = session.user?.id;

    if (!id) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    let user;
    console.log("finding user");

    try {
      user = await prisma.user.findUnique({ where: { id: BigInt(id) } });
    } catch (err) {
      console.error('Error fetching user from database:', err);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log("found a good user");

    const isAdmin = user.role === 'admin';

    let reports;
    console.log("getting reports");
    try {
      if (isAdmin) {
        reports = await prisma.report.findMany({
          include: {
            submitter: true,
            resolver: true,
          },
        });
      } else {
        reports = await prisma.report.findMany({
          where: {
            submitted_by: user.id,
          },
          include: {
            submitter: true,
            resolver: true,
          },
        });
      }
    } catch (err) {
      console.error('Database error while fetching reports:', err);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    const safeReports = reports.map((report) => {
      const { id, target_id, submitted_by, resolved_by, submitter, resolver, ...rest } = report;

      const safeSubmitter = submitter ? {
        ...submitter,
        id: submitter.id.toString(),
      } : null;

      const safeResolver = resolver ? {
        ...resolver,
        id: resolver.id.toString(),
      } : null;

      return {
        ...rest,
        id: id.toString(),
        target_id: target_id.toString(),
        submitted_by: submitted_by?.toString() ?? null,
        resolved_by: resolved_by?.toString() ?? null,
        submitter: safeSubmitter,
        resolver: safeResolver,
      };
    });

    return NextResponse.json(safeReports, { status: 200 });
  } catch (err) {
    console.error('GET /api/reports error:', err);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// --- PATCH Handler (Update Report) ---
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing report ID' }, { status: 400 });
    }

    interface ReportUpdateBody {
      status: 'resolved' | 'rejected';
      response: string;
      resolvedBy: string | number;
    }

    const { status, response, resolvedBy } = await req.json() as ReportUpdateBody;

    const existingReport = await prisma.report.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    let updatedReport;

    if (status === 'resolved') {
      if (!resolvedBy) {
        return NextResponse.json({ error: 'Missing resolvedBy' }, { status: 400 });
      }

      updatedReport = await prisma.report.update({
        where: { id: BigInt(id) },
        data: {
          status: 'resolved',
          resolved_by: BigInt(resolvedBy),
          resolved_at: new Date(),
          response: response.toString() || null,
        },
      });
    } else if (status === 'rejected') {
      if (!response) {
        return NextResponse.json({ error: 'Missing rejection reason' }, { status: 400 });
      }

      updatedReport = await prisma.report.update({
        where: { id: BigInt(id) },
        data: {
          status: 'rejected',
          response: response,
          resolved_by: BigInt(resolvedBy),
          resolved_at: new Date(),
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const safeReport = {
      ...updatedReport,
      id: updatedReport.id.toString(),
      target_id: updatedReport.target_id.toString(),
      submitted_by: updatedReport.submitted_by?.toString(),
      resolved_by: updatedReport.resolved_by?.toString() ?? null,
    };

    console.log("✅ Report updated:", safeReport);
    return NextResponse.json(safeReport, { status: 200 });
  } catch (err) {
    console.error('❌ PATCH /api/report error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
