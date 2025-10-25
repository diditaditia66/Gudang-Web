"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type Row = { nama_barang:string; jumlah:number; lokasi:string; };

export default function ListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<{open:boolean; nama?:string; lokasi?:string}>({open:false});

  useEffect(()=>{ load(); },[]);
  async function load(){ const r=await fetch(process.env.NEXT_PUBLIC_API_BASE_URL+"/get_barang"); setRows(await r.json()); }

  const filtered = useMemo(()=>{
    const s=q.toLowerCase();
    if(!s) return rows;
    return rows.filter(b=>b.nama_barang.toLowerCase().includes(s) || b.lokasi.toLowerCase().includes(s));
  },[rows,q]);

  async function remove(nama:string, lokasi:string){
    await fetch(process.env.NEXT_PUBLIC_API_BASE_URL+"/delete_barang",{
      method:"DELETE", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ nama_barang:nama, lokasi })
    });
    setConfirm({open:false}); await load();
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">List Barang</h1>

      <Card><CardBody>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Cari Barang/Lokasi" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </CardBody></Card>

      <Card><CardBody>
        <div className="overflow-auto rounded-xl border">
          <table className="table">
            <thead><tr>
              <th className="th">Nama</th><th className="th">Jumlah</th><th className="th">Lokasi</th><th className="th w-32">Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.map((b,i)=>(
                <tr key={i}>
                  <td className="td">{b.nama_barang}</td>
                  <td className="td">{b.jumlah}</td>
                  <td className="td"><span className="tag">{b.lokasi}</span></td>
                  <td className="td">
                    <Button onClick={()=>setConfirm({open:true, nama:b.nama_barang, lokasi:b.lokasi})}>Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody></Card>

      <Modal open={confirm.open} onClose={()=>setConfirm({open:false})} title="Konfirmasi Hapus">
        <p>Hapus barang <b>{confirm.nama}</b> di lokasi <b>{confirm.lokasi}</b>?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={()=>setConfirm({open:false})}>Batal</button>
          <button className="btn btn-primary" onClick={()=>remove(confirm.nama!, confirm.lokasi!)}>Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
