"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  MapPin,
  Phone,
  Facebook,
  Globe,
  Navigation,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";

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

export default function HospitalCard({ hospital }: { hospital: Hospital }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/hospitals/${hospital._id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <>
      <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{hospital.name}</h3>
              <Badge variant="secondary" className="mt-1.5 bg-blue-50 text-blue-700 border-blue-100 text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {hospital.category}
              </Badge>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/hospitals/${hospital._id}/edit`}>
                <Button size="icon" variant="outline" className="h-8 w-8 border-slate-200 hover:border-blue-300 hover:text-blue-600">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button size="icon" variant="outline" onClick={() => setShowDelete(true)} className="h-8 w-8 border-slate-200 hover:border-red-300 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
              <span className="line-clamp-2">{hospital.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <a href={`tel:${hospital.phone}`} className="hover:text-blue-600 transition-colors">{hospital.phone}</a>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <a
                href={`https://maps.google.com/?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors font-mono text-xs"
              >
                {hospital.coordinates.lat.toFixed(4)}, {hospital.coordinates.lng.toFixed(4)}
              </a>
            </div>
          </div>

          {(hospital.facebookURI || hospital.websiteURL) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
              {hospital.facebookURI && (
                <a href={hospital.facebookURI} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-slate-200 hover:border-blue-400 hover:text-blue-600">
                    <Facebook className="w-3 h-3" /> Facebook
                  </Button>
                </a>
              )}
              {hospital.websiteURL && (
                <a href={hospital.websiteURL} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-slate-200 hover:border-teal-400 hover:text-teal-600">
                    <Globe className="w-3 h-3" /> Website
                  </Button>
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{hospital.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}