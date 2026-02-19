'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  MapPin, User as UserIcon, LogOut, Phone, 
  Shield, Calendar, Map as MapIcon, Mail, 
  Navigation2, Info, Loader2
} from 'lucide-react';

export default function UserPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH LIVE DATA FROM DATABASE ---
  useEffect(() => {
    const fetchLiveProfile = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveProfile();
  }, [session?.user?.id]);

  // Handle coordinates from the fetched userData
  const lng = userData?.location?.coordinates?.[0];
  const lat = userData?.location?.coordinates?.[1];

  const lastSeenDate = userData?.updatedAt 
    ? new Date(userData.updatedAt).toLocaleDateString(undefined, { 
        month: 'long', day: 'numeric', year: 'numeric' 
      }) 
    : 'Connecting...';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <Loader2 className="text-cyan-500 animate-spin mb-4" size={40} />
        <p className="text-slate-400 font-medium tracking-widest text-xs uppercase">Initializing Secure Interface</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Top Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 transition duration-1000"></div>
              <div className="relative w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shadow-2xl">
                {userData?.image ? (
                  <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-slate-500" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">{userData?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
                  {userData?.role}
                </span>
              </div>
              <p className="text-slate-400 flex items-center gap-2">
                <Mail size={14} className="text-cyan-500/50" /> {userData?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 border border-slate-700 rounded-xl text-sm font-medium transition-all duration-300"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Demographics */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Info size={16} className="text-cyan-500" /> Personal Profile
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-500 text-sm italic">Age</span>
                  <span className="text-white font-semibold">{userData?.age || '—'} <span className="text-[10px] text-slate-500">YRS</span></span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-500 text-sm italic">Sex</span>
                  <span className="text-white font-semibold">{userData?.sex || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-500 text-sm italic">Phone</span>
                  <span className="text-white font-semibold tracking-tighter">{userData?.phone || 'UNSET'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 text-sm italic">System Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${userData?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                    <span className="text-white font-bold text-xs uppercase tracking-widest">{userData?.isActive ? 'Active' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="p-6 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-cyan-500/20 rounded-3xl shadow-lg group hover:border-cyan-500/40 transition-colors">
               <div className="flex items-center gap-3 text-cyan-400 mb-2">
                 <Shield size={20} />
                 <span className="font-bold text-xs uppercase tracking-tighter italic">LGU Identification</span>
               </div>
               <p className="text-2xl font-bold text-white leading-tight font-mono">
                 {userData?.lguCode || 'N/A'}
               </p>
            </div>
          </div>

          {/* Right Column: Address & Location */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Province', value: userData?.province, icon: MapIcon },
                { label: 'Municipality', value: userData?.municipality, icon: MapPin },
                { label: 'Barangay', value: userData?.barangay, icon: Navigation2 },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl hover:bg-slate-800/40 transition-all duration-300">
                  <item.icon className="text-cyan-500/50 mb-3" size={18} />
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{item.label}</p>
                  <p className="text-white font-bold truncate text-sm uppercase">{item.value || 'Not Set'}</p>
                </div>
              ))}
            </div>

            {/* Geospatial Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                    <MapPin className="text-cyan-500" size={16} /> 
                  </div>
                  Geospatial Pulse
                </h3>
                <span className="text-[10px] text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-md uppercase font-black tracking-tighter">
                  Real-time Point
                </span>
              </div>
              
              {/* <div className="p-10 flex flex-col md:flex-row items-center gap-12 justify-center bg-gradient-to-b from-transparent to-cyan-500/[0.02]">
                <div className="text-center group">
                  <p className="text-4xl font-mono font-bold text-white mb-2 tracking-tighter group-hover:text-cyan-400 transition-colors">
                    {lat ? lat.toFixed(6) : '0.000000'}
                  </p>
                  <div className="h-1 w-8 bg-cyan-500/30 mx-auto rounded-full mb-2"></div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Latitude</p>
                </div>
                
                <div className="h-16 w-[1px] bg-slate-800 hidden md:block"></div>

                <div className="text-center group">
                  <p className="text-4xl font-mono font-bold text-white mb-2 tracking-tighter group-hover:text-cyan-400 transition-colors">
                    {lng ? lng.toFixed(6) : '0.000000'}
                  </p>
                  <div className="h-1 w-8 bg-cyan-500/30 mx-auto rounded-full mb-2"></div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Longitude</p>
                </div>
              </div> */}

              <div className="bg-slate-900/80 p-5 px-8 flex items-center justify-between border-t border-slate-800">
                 <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <Calendar size={14} className="text-cyan-500" />
                    <span className="uppercase font-bold tracking-widest text-[10px]">Registry Update:</span> 
                    <span className="text-slate-100 font-mono">{lastSeenDate}</span>
                 </div>
                 <div className="flex items-center gap-1 text-[10px] font-black text-cyan-400 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                    Secure Logged
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-slate-800/30 text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.4em] font-black italic opacity-50">
            End-to-End Encrypted Dashboard • EMS Node 01
          </p>
        </footer>
      </main>
    </div>
  );
}