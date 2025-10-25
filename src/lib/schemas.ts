import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi")
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const BarangAddSchema = z.object({
  nama_barang: z.string().min(1),
  jumlah: z.coerce.number().int().nonnegative(),
  lokasi: z.string().min(1),
  aksi: z.literal("Tambah Barang").default("Tambah Barang"),
  username: z.string().min(1)
});
export type BarangAddInput = z.infer<typeof BarangAddSchema>;

export const BarangUpdateSchema = z.object({
  nama_barang: z.string().min(1),
  jumlah: z.coerce.number().int().positive(),
  lokasi: z.string().min(1),
  username: z.string().min(1)
});
export type BarangUpdateInput = z.infer<typeof BarangUpdateSchema>;

export const BarangDeleteSchema = z.object({
  nama_barang: z.string().min(1),
  lokasi: z.string().min(1)
});
export type BarangDeleteInput = z.infer<typeof BarangDeleteSchema>;
