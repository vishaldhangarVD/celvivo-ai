'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import { ShieldCheck, XCircle, Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const db = useFirestore();
  const ref = useMemo(
    () => (db && id ? doc(db, 'certificates', String(id).toUpperCase()) : null),
    [db, id]
  );
  const { data, loading } = useDoc(ref) as any;

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-6 text-white">
      <div className="glass max-w-lg w-full rounded-3xl p-10 text-center space-y-6 border border-white/10">
        {loading ? (
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-accent" />
        ) : data ? (
          <>
            <ShieldCheck className="w-16 h-16 text-green-400 mx-auto" />
            <h1 className="text-2xl font-bold">Certificate Verified</h1>
            <div className="space-y-2 text-left text-sm">
              <p><span className="text-white/40">Name:</span> {data.userName}</p>
              <p><span className="text-white/40">Role:</span> {data.role}</p>
              <p><span className="text-white/40">Issued:</span> {data.date}</p>
              <p><span className="text-white/40">ID:</span> {data.certId}</p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold">Certificate Not Found</h1>
            <p className="text-white/50 text-sm">This certificate ID was not issued by Celvivo AI.</p>
          </>
        )}
      </div>
    </div>
  );
}
