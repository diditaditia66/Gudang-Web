export type Barang = {
  id?: number;
  nama_barang: string;
  jumlah: number;
  lokasi: string;
};

export type HistoryItem = {
  id: number;
  nama_barang: string;
  jumlah: number;
  lokasi: string;
  aksi: string;
  username: string;
  waktu: string; // ISO
};
