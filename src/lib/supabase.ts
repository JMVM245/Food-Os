import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface EncuestaSatisfaccion {
  pedido_id: string;
  cliente: string;
  satisfaccion: number;
  atencion: number;
  calidad: number;
  rapidez: number;
  comentario: string;
  fecha: string;
}
