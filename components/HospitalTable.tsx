"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Facebook,
  Globe,
  Navigation,
  Pencil,
  Trash2,
  Tag,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Hospital {
  _id: string;
  name: string;
  address: string;
  phone: string;
  facebookURI?: string;
  websiteURL?: string;
  coordinates: { lat: number; lng: number };
  category: string;
}

function DeleteDialog({
  hospital,
  open,
  onOpenChange,
}: {
  hospital: Hospital;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/hospitals/${hospital._id}`, { method: "DELETE" });
    router.refresh();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-700">{hospital.name}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function HospitalRow({ hospital }: { hospital: Hospital }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <tr className="group border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-150">
        {/* Name + Category */}
        <td className="px-5 py-3.5 min-w-[200px]">
          <p className="font-semibold text-slate-800 text-sm leading-tight">{hospital.name}</p>
          <Badge
            variant="secondary"
            className="mt-1.5 bg-blue-50 text-blue-700 border-blue-100 text-[11px] font-medium px-1.5 py-0"
          >
            <Tag className="w-2.5 h-2.5 mr-1" />
            {hospital.category}
          </Badge>
        </td>

        {/* Address */}
        <td className="px-4 py-3.5 max-w-[220px]">
          <div className="flex items-start gap-1.5 text-slate-500 text-sm">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-2 leading-snug">{hospital.address}</span>
          </div>
        </td>

        {/* Phone */}
        <td className="px-4 py-3.5 whitespace-nowrap">
          <a
            href={`tel:${hospital.phone}`}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {hospital.phone}
          </a>
        </td>

        {/* Coordinates */}
        <td className="px-4 py-3.5 whitespace-nowrap">
          <a
            href={`https://maps.google.com/?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-blue-600 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {hospital.coordinates.lat.toFixed(4)}, {hospital.coordinates.lng.toFixed(4)}
            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
        </td>

        {/* Links */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            {hospital.facebookURI ? (
              <a
                href={hospital.facebookURI}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            ) : (
              <span className="w-7 h-7 rounded-md flex items-center justify-center text-slate-200 cursor-not-allowed">
                <Facebook className="w-4 h-4" />
              </span>
            )}
            {hospital.websiteURL ? (
              <a
                href={hospital.websiteURL}
                target="_blank"
                rel="noopener noreferrer"
                title="Website"
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            ) : (
              <span className="w-7 h-7 rounded-md flex items-center justify-center text-slate-200 cursor-not-allowed">
                <Globe className="w-4 h-4" />
              </span>
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Link href={`/hospitals/${hospital._id}/edit`}>
              <button
                title="Edit"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              title="Delete"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      <DeleteDialog
        hospital={hospital}
        open={showDelete}
        onOpenChange={setShowDelete}
      />
    </>
  );
}

export default function HospitalTable({ hospitals }: { hospitals: Hospital[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Coordinates
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Links
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((hospital) => (
              <HospitalRow key={hospital._id} hospital={hospital} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Showing <span className="font-medium text-slate-600">{hospitals.length}</span> result{hospitals.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}