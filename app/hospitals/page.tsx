import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Hospital from "@/models/Hospital";
import HospitalTable from "@/components/HospitalTable";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Building2, Search } from "lucide-react";

async function getHospitals() {
  await connectDB();
  const hospitals = await Hospital.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(hospitals));
}

export default async function HospitalsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const hospitals = await getHospitals();
  const query = searchParams.q?.toLowerCase() || "";
  const categoryFilter = searchParams.category || "";

  const filtered = hospitals.filter((h: any) => {
    const matchQ =
      !query ||
      h.name.toLowerCase().includes(query) ||
      h.address.toLowerCase().includes(query);
    const matchCat = !categoryFilter || h.category === categoryFilter;
    return matchQ && matchCat;
  });

  const categories = [...new Set(hospitals.map((h: any) => h.category))];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-xl leading-tight tracking-tight">
                  Hospital Registry
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""} total
                </p>
              </div>
            </div>
            <Link href="/hospitals/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm h-9 px-4 text-sm">
                <Plus className="w-4 h-4" /> Add Hospital
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Search & Filter */}
          <form className="flex flex-col sm:flex-row gap-2.5 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search hospitals…"
                className="pl-9 h-9 text-sm border-slate-200 bg-white focus-visible:ring-blue-500 focus-visible:ring-1"
              />
            </div>
            <select
              name="category"
              defaultValue={categoryFilter}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Button
              type="submit"
              variant="outline"
              className="h-9 px-4 text-sm border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            >
              Filter
            </Button>
          </form>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold text-base">No hospitals found</p>
              <p className="text-slate-400 text-sm mt-1">
                Try adjusting your search or add a new hospital.
              </p>
              <Link href="/hospitals/new">
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-9 px-4 text-sm">
                  <Plus className="w-4 h-4" /> Add First Hospital
                </Button>
              </Link>
            </div>
          ) : (
            <HospitalTable hospitals={filtered} />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}