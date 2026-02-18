import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import EmergencyModel from '@/models/Emergency';
import { format, differenceInMinutes } from 'date-fns';
import { getServerSession } from 'next-auth';



export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await request.json();
    const { startDate, endDate, type } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Start date and end date are required',
      }, { status: 400 });
    }

    await connectDB();

    // Fetch emergencies within date range
    const emergencies = await EmergencyModel.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ createdAt: -1 });

    // Calculate statistics
    const totalEmergencies = emergencies.length;

    // By Status
    const byStatus = {
      pending: emergencies.filter(e => e.status === 'pending').length,
      acknowledged: emergencies.filter(e => e.status === 'acknowledged').length,
      responding: emergencies.filter(e => e.status === 'responding').length,
      resolved: emergencies.filter(e => e.status === 'resolved').length,
      cancelled: emergencies.filter(e => e.status === 'cancelled').length,
    };

    // By Severity
    const bySeverity = {
      critical: emergencies.filter(e => e.severity === 'critical').length,
      high: emergencies.filter(e => e.severity === 'high').length,
      medium: emergencies.filter(e => e.severity === 'medium').length,
      low: emergencies.filter(e => e.severity === 'low').length,
    };

    // By Type
    const byType = {
      medical: emergencies.filter(e => e.emergencyType === 'medical').length,
      fire: emergencies.filter(e => e.emergencyType === 'fire').length,
      crime: emergencies.filter(e => e.emergencyType === 'flood').length,
      accident: emergencies.filter(e => e.emergencyType === 'accident').length,
      'landslide': emergencies.filter(e => e.emergencyType === 'landslide').length,
      other: emergencies.filter(e => e.emergencyType === 'ambulance').length,
    };

    // Response Statistics
    const emergenciesWithResponder = emergencies.filter(e => e.responderName);
    const resolvedEmergencies = emergencies.filter(e => e.status === 'resolved');

    // Calculate average response time
    let totalResponseMinutes = 0;
    let countWithResponseTime = 0;

    emergenciesWithResponder.forEach(emergency => {
      if (emergency.responderName && emergency.createdAt) {
        const responseTime = differenceInMinutes(
          new Date(emergency.createdAt),
          new Date(emergency.updatedAt)
        );
        totalResponseMinutes += responseTime;
        countWithResponseTime++;
      }
    });

    const averageResponseMinutes = countWithResponseTime > 0 
      ? Math.round(totalResponseMinutes / countWithResponseTime)
      : 0;

    const averageResponseTime = averageResponseMinutes > 0
      ? averageResponseMinutes < 60
        ? `${averageResponseMinutes} min`
        : `${Math.floor(averageResponseMinutes / 60)}h ${averageResponseMinutes % 60}m`
      : 'N/A';

    // Get unique responders
    const responderMap = new Map();
    emergenciesWithResponder.forEach(emergency => {
      if (emergency.responderName) {
        const name = emergency.responderName;
        responderMap.set(name, (responderMap.get(name) || 0) + 1);
      }
    });

    const topResponders = Array.from(responderMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const resolutionRate = totalEmergencies > 0
      ? Math.round((resolvedEmergencies.length / totalEmergencies) * 100)
      : 0;

    const responseStats = {
      averageResponseTime,
      totalResponders: responderMap.size,
      resolvedCount: resolvedEmergencies.length,
      resolutionRate,
    };

    // Generate period label
    let period = '';
    if (type === 'weekly') {
      period = 'Weekly Report';
    } else if (type === 'monthly') {
      period = 'Monthly Report';
    } else {
      period = 'Custom Report';
    }

    const reportData = {
      period,
      startDate: format(new Date(startDate), 'MMM dd, yyyy'),
      endDate: format(new Date(endDate), 'MMM dd, yyyy'),
      totalEmergencies,
      byStatus,
      bySeverity,
      byType,
      responseStats,
      topResponders,
      emergenciesList: emergencies,
    };

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
