import { notFound } from "next/navigation";
import  connectDB  from "@/lib/mongodb";
import Hospital from "@/models/Hospital";
import HospitalForm from "@/components/HospitalForm";
import Link from "next/link";



async function getHospital(id: string) {
  await connectDB();
  try {
    const hospital = await Hospital.findById(id).lean();
    if (!hospital) return null;
    return JSON.parse(JSON.stringify(hospital));
  } catch {
    return null;
  }
}



export default async function EditHospitalPage({ params }: { params: Promise<{ id: string }> }) {

   const { id } = await params;

  
  const hospital = await getHospital(id);

  if (!hospital) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/hospitals" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">
          ← Back to Hospitals
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Edit Hospital</h1>
        <p className="text-slate-400 text-sm mt-1">Update the details for <strong>{hospital.name}</strong>.</p>
      </div>
      <HospitalForm initialData={hospital} isEditing />
    </div>
  );
}