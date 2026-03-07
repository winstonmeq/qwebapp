import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmergencyModel from '@/models/Emergency';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // 1. Extract Search Params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // 2. Date Range (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // 3. Initialize Query
    const query: any = {
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    };

    // 4. RBAC Logic
    if (session.user.role !== "system-admin") {
      query.lguCode = session.user.lguCode;
    }

    // 5. Optional Filters
    if (status) {
      query.status = status;
    }

    // 6. Execute Query
    const emergencies = await EmergencyModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });

  } catch (error: any) {
    console.error("Error fetching emergencies:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}




export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    // Validate GeoJSON requirements
    const longitude = Number(body.location.longitude);
    const latitude = Number(body.location.latitude);

    if (isNaN(longitude) || isNaN(latitude)) {
      return NextResponse.json({ success: false, error: 'Invalid coordinates' }, { status: 400 });
    }


  // const tenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  //   const reportCount = await EmergencyModel.countDocuments({
  //     userPhone: body.userPhone,
  //     createdAt: { $gte: tenMinutesAgo }
  //   });

  //   if (reportCount >= 3) {
  //     return NextResponse.json(
  //       {
  //         success: false,
  //         error: "Too many reports sent recently. Please wait a few minutes."
  //       },
  //       { status: 429 }
  //     );
  //   }
    

// LOCATION DUPLICATE CHECK (within 50 meters in last 5 minutes)

// const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

// const duplicateNearby = await EmergencyModel.findOne({
//    userPhone: body.userPhone,
//   createdAt: { $gte: fiveMinutesAgo },
//   location: {
//     $near: {
//       $geometry: {
//         type: "Point",
//         coordinates: [longitude, latitude]
//       },
//       $maxDistance: 50
//     }
//   }
// });



// if (duplicateNearby) {
//   return NextResponse.json(
//     {
//       success: false,
//       error: "An incident was already reported nearby recently."
//     },
//     { status: 409 }
//   );
// }



const emergency = new EmergencyModel({
      lguCode: body.lguCode, // IMPORTANT: Required by your model
      userId: body.userId,
      userName: body.userName,
      userPhone: body.userPhone,
      location: {
        type: 'Point', // Explicitly set as per LocationSchema
        coordinates: [longitude, latitude], // [long, lat] order
        accuracy: Number(body.location.accuracy || 0),
      },
      emergencyType: body.emergencyType,
      severity: body.severity || 'medium',
      description: body.description,
      status: 'pending',
      photoUrl: body.photoUrl
    });

    await emergency.save();

    try {
  // We write to a "notifications" collection in Firestore
  // The dashboard will be listening to this.
  await setDoc(doc(db, "notifications", emergency.lguCode), {
    lastIncidentId: emergency._id.toString(),
    timestamp: Date.now(),
    type: emergency.emergencyType
  });


} catch (e) {
  console.error("Firebase sync failed", e);
}


    return NextResponse.json({
      success: true,
      data: emergency,
    }, { status: 201 });


  } catch (error: any) {
    console.error('Error creating emergency:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
