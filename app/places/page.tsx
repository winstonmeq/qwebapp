"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Map, Building2, Trash2, Loader2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LocationCRUD() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);

  const [countryForm, setCountryForm] = useState({ code: '', name: '' });
  const [provinceForm, setProvinceForm] = useState({ countryCode: '', code: '', name: '', region: '' });
  const [muniForm, setMuniForm] = useState({
    countryCode: '', provinceCode: '', code: '', name: '', type: 'city', zipCode: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cRes, pRes, mRes] = await Promise.all([
        fetch('/api/places/countries'),
        fetch('/api/places/provinces'),
        fetch('/api/places/municipalities')
      ]);
      setCountries(await cRes.json());
      setProvinces(await pRes.json());
      setMunicipalities(await mRes.json());
    } catch (err) {
      toast({ title: "Fetch Error", description: "Could not load location data." });
    }
  };

  const handleSave = async (endpoint: string, data: any, resetFn: () => void) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/places/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      toast({ title: "Success", description: "Entry saved successfully." });
      resetFn();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (endpoint: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(`/api/places/${endpoint}?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted", description: "Record removed successfully." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Location Hierarchy</h1>
        <p className="text-muted-foreground">Manage Countries, Provinces, and Municipalities.</p>
      </div>

      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="countries"><Globe className="w-4 h-4 mr-2" /> Countries</TabsTrigger>
          <TabsTrigger value="provinces"><Map className="w-4 h-4 mr-2" /> Provinces</TabsTrigger>
          <TabsTrigger value="municipalities"><Building2 className="w-4 h-4 mr-2" /> LGUs</TabsTrigger>
        </TabsList>

        {/* --- COUNTRY SECTION --- */}
        <TabsContent value="countries" className="grid md:grid-cols-3 gap-6 mt-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader><CardTitle>Add Country</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ISO Code</Label>
                <Input value={countryForm.code} onChange={(e) => setCountryForm({...countryForm, code: e.target.value.toUpperCase()})} placeholder="PH" />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={countryForm.name} onChange={(e) => setCountryForm({...countryForm, name: e.target.value})} placeholder="Philippines" />
              </div>
              <Button disabled={loading} onClick={() => handleSave('countries', countryForm, () => setCountryForm({code:'', name:''}))} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Country
              </Button>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Country Directory</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countries.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-bold">{c.code}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('countries', c._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PROVINCE SECTION --- */}
        <TabsContent value="provinces" className="grid md:grid-cols-3 gap-6 mt-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader><CardTitle>Add Province</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Country</Label>
              <Select onValueChange={(v) => setProvinceForm({...provinceForm, countryCode: v})}>
                <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                <SelectContent>{countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Code (e.g. CEB)" onChange={(e) => setProvinceForm({...provinceForm, code: e.target.value.toUpperCase()})} />
              <Input placeholder="Name" onChange={(e) => setProvinceForm({...provinceForm, name: e.target.value})} />
              <Input placeholder="Region" onChange={(e) => setProvinceForm({...provinceForm, region: e.target.value})} />
              <Button disabled={loading} onClick={() => handleSave('provinces', provinceForm, () => fetchData())} className="w-full">Save Province</Button>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Province Directory</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provinces.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-mono">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell><Badge variant="outline">{p.countryCode}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('provinces', p._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- MUNICIPALITY SECTION --- */}
        <TabsContent value="municipalities" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Add Municipality / City</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Select onValueChange={(v) => setMuniForm({...muniForm, provinceCode: v, countryCode: provinces.find(p => p.code === v)?.countryCode})}>
                    <SelectTrigger><SelectValue placeholder="Select Province" /></SelectTrigger>
                    <SelectContent>{provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                <Label>LGU Code (Unique)</Label>
                <Input 
                  placeholder="e.g. MKTI" 
                  value={muniForm.code}
                  onChange={(e) => setMuniForm({...muniForm, code: e.target.value.toUpperCase().trim()})} 
                />
              </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="e.g. Makati" onChange={(e) => setMuniForm({...muniForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select onValueChange={(v: any) => setMuniForm({...muniForm, type: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="city">City</SelectItem><SelectItem value="municipality">Municipality</SelectItem></SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleSave('municipalities', muniForm, () => fetchData())} className="w-full">Add LGU</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>LGU Directory</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Zip</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {municipalities.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell><Badge variant={m.type === 'city' ? 'default' : 'secondary'}>{m.type}</Badge></TableCell>
                      <TableCell>{m.provinceCode}</TableCell>
                      <TableCell>{m.zipCode || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('municipalities', m._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}