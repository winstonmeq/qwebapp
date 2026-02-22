import HospitalForm from "@/components/HospitalForm";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function NewHospitalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/hospitals" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">
          ← Back to Hospitals
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" /> Register Hospital
        </h1>
        <p className="text-slate-400 text-sm mt-1">Fill in the details below to add a new hospital to the registry.</p>
      </div>
      <HospitalForm />
    </div>
  );
}