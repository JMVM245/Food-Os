import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type EncuestaSatisfaccion = {
  pedido_id: string;
  cliente: string;
  satisfaccion: number;
  atencion: number;
  calidad: number;
  rapidez: number;
  comentario: string;
  fecha: string;
};

export type RegistroVendedor = {
  id?: string;
  vendedor_nombre: string;
  vendedor_codigo: string;
  zona: string;
  tipo: "ingreso" | "salida";
  timestamp: string;
};
