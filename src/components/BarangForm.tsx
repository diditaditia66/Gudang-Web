"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarangAddSchema, BarangUpdateSchema, type BarangAddInput, type BarangUpdateInput } from "@/lib/schemas";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FormTambah() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState:{errors} } = useForm<BarangAddInput>({
    resolver: zodResolver(BarangAddSchema),
    defaultValues: { aksi: "Tambah Barang" }
  });
  return (
    <form className="grid gap-3 max-w-md" onSubmit={handleSubmit(async (v)=>{
      setLoading(true);
      await api.post("/add_barang", v);
      setLoading(false);
      r.push("/");
    })}>
      <input placeholder="Nama Barang" {...register("nama_barang")} className="border p-2 rounded"/>
      {errors.nama_barang && <small className="text-red-600">{errors.nama_barang.message}</small>}
      <input type="number" placeholder="Jumlah" {...register("jumlah")} className="border p-2 rounded"/>
      <input placeholder="Lokasi" {...register("lokasi")} className="border p-2 rounded"/>
      <input placeholder="Username" {...register("username")} className="border p-2 rounded"/>
      <button disabled={loading} className="border px-3 py-2 rounded bg-black text-white">{loading?"Menyimpan...":"Simpan"}</button>
    </form>
  );
}

export function FormAmbil() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState:{errors} } = useForm<BarangUpdateInput>({
    resolver: zodResolver(BarangUpdateSchema)
  });
  return (
    <form className="grid gap-3 max-w-md" onSubmit={handleSubmit(async (v)=>{
      setLoading(true);
      await api.post("/update_barang", v);
      setLoading(false);
      r.refresh();
    })}>
      <input placeholder="Nama Barang" {...register("nama_barang")} className="border p-2 rounded"/>
      {errors.nama_barang && <small className="text-red-600">{errors.nama_barang.message}</small>}
      <input type="number" placeholder="Jumlah diambil" {...register("jumlah")} className="border p-2 rounded"/>
      <input placeholder="Lokasi" {...register("lokasi")} className="border p-2 rounded"/>
      <input placeholder="Username" {...register("username")} className="border p-2 rounded"/>
      <button disabled={loading} className="border px-3 py-2 rounded bg-black text-white">{loading?"Memproses...":"Ambil"}</button>
    </form>
  );
}
