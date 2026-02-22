"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Phone,
  Facebook,
  Globe,
  Navigation,
  Tag,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "Private Hospital",
  "Pharmacy",

];

interface HospitalFormProps {
  initialData?: {
    _id?: string;
    name?: string;
    address?: string;
    phone?: string;
    lguCode?: string;
    facebookURI?: string;
    websiteURL?: string;
    coordinates?: { lat: number; lng: number };
    category?: string;
  };
  isEditing?: boolean;
}

export default function HospitalForm({ initialData, isEditing }: HospitalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    lguCode: initialData?.lguCode || "",
    facebookURI: initialData?.facebookURI || "",
    websiteURL: initialData?.websiteURL || "",
    lat: initialData?.coordinates?.lat?.toString() || "",
    lng: initialData?.coordinates?.lng?.toString() || "",
    category: initialData?.category || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      lguCode: form.lguCode,
      facebookURI: form.facebookURI,
      websiteURL: form.websiteURL,
      coordinates: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
      category: form.category,
    };

    try {
      const url = isEditing
        ? `/api/hospitals/${initialData?._id}`
        : "/api/hospitals";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/hospitals");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-slate-800 font-bold text-xl">
          <Building2 className="w-5 h-5 text-blue-600" />
          {isEditing ? "Edit Hospital" : "Register New Hospital"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Hospital Name *
            </Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="St. Luke's Medical Center" className="border-slate-200 focus-visible:ring-blue-500" />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Address *
            </Label>
            <Input id="address" name="address" value={form.address} onChange={handleChange} required placeholder="123 Medical Drive, City, State" className="border-slate-200 focus-visible:ring-blue-500" />
          </div>

 <div className="grid grid-cols-2 gap-3">
             {/* LguCode */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> LGU-CODE *
            </Label>
            <Input id="lguCode" name="lguCode" value={form.lguCode} onChange={handleChange} required placeholder="PH" className="border-slate-200 focus-visible:ring-blue-500" />
          </div>

       
          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone *
            </Label>
            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="+1 (555) 000-0000" className="border-slate-200 focus-visible:ring-blue-500" />
          </div>
</div>


          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Category *
            </Label>
            <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))} required>
              <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                <SelectValue placeholder="Select hospital category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coordinates */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Coordinates *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input name="lat" value={form.lat} onChange={handleChange} required type="number" step="any" placeholder="Latitude (e.g. 14.5995)" className="border-slate-200 focus-visible:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1 ml-1">Latitude</p>
              </div>
              <div>
                <Input name="lng" value={form.lng} onChange={handleChange} required type="number" step="any" placeholder="Longitude (e.g. 120.9842)" className="border-slate-200 focus-visible:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1 ml-1">Longitude</p>
              </div>
            </div>
          </div>

          {/* Facebook URI */}
          <div className="space-y-1.5">
            <Label htmlFor="facebookURI" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5" /> Facebook URL
            </Label>
            <Input id="facebookURI" name="facebookURI" value={form.facebookURI} onChange={handleChange} placeholder="https://facebook.com/hospital" className="border-slate-200 focus-visible:ring-blue-500" />
          </div>

          {/* Website URL */}
          <div className="space-y-1.5">
            <Label htmlFor="websiteURL" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Website URL
            </Label>
            <Input id="websiteURL" name="websiteURL" value={form.websiteURL} onChange={handleChange} placeholder="https://hospital.com" className="border-slate-200 focus-visible:ring-blue-500" />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Update Hospital" : "Create Hospital"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}