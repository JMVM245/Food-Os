"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase, type EncuestaSatisfaccion } from "@/lib/supabase";
import { useStore } from "@/store/store";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import "./encuesta.css";

interface EncuestaProps {
  pedidoId: string;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="encuesta-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`encuesta-star ${star <= value ? "encuesta-star-active" : "encuesta-star-inactive"}`}
        >
          <Star className={`h-6 w-6 ${star <= value ? "fill-accent text-accent" : ""}`} />
        </button>
      ))}
    </div>
  );
}

export function EncuestaSatisfaccion({ pedidoId }: EncuestaProps) {
  const [enviada, setEnviada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [satisfaccion, setSatisfaccionLocal] = useState(0);
  const [atencion, setAtencion] = useState(0);
  const [calidad, setCalidad] = useState(0);
  const [rapidez, setRapidez] = useState(0);
  const [comentario, setComentario] = useState("");

  const pedido = useStore((s) => s.pedidos.find((p) => p.id === pedidoId));
  const setSatisfaccion = useStore((s) => s.setSatisfaccion);

  const yaRespondida = pedido?.satisfaccion != null;

  async function handleEnviar() {
    if (satisfaccion === 0) return;
    setEnviando(true);

    const data: EncuestaSatisfaccion = {
      pedido_id: pedidoId,
      cliente: `Fila ${pedido?.fila} · Silla ${pedido?.silla}`,
      satisfaccion,
      atencion,
      calidad,
      rapidez,
      comentario,
      fecha: new Date().toISOString(),
    };

    setSatisfaccion(pedidoId, {
      puntuacion: satisfaccion,
      atencion,
      calidad,
      rapidez,
      comentario,
    });

    if (supabase) {
      const { error } = await supabase.from("encuestas_satisfaccion").insert(data);
      if (!error) setEnviada(true);
    } else {
      setEnviada(true);
    }
    setEnviando(false);
  }

  if (yaRespondida || enviada) {
    return (
      <Card className="encuesta-card encuesta-card-success">
        <CardContent className="encuesta-success-content">
          <CheckCircle2 className="encuesta-success-icon" />
          <p className="encuesta-success-title">¡Gracias por tu opinión!</p>
          <p className="encuesta-success-desc">Tu feedback nos ayuda a mejorar el servicio.</p>
          {pedido?.satisfaccion && (
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= (pedido.satisfaccion?.puntuacion ?? 0) ? "fill-accent text-accent" : "text-muted"}`} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="encuesta-card">
      <CardHeader>
        <CardTitle className="encuesta-title">
          <MessageSquare className="h-5 w-5 text-accent" />
          ¿Qué tal fue tu experiencia?
        </CardTitle>
        <CardDescription className="encuesta-desc">
          Ayúdanos a mejorar calificando tu pedido #{pedidoId}
        </CardDescription>
      </CardHeader>
      <CardContent className="encuesta-content">
        <div className="encuesta-field">
          <Label className="encuesta-label">Satisfacción general</Label>
          <StarRating value={satisfaccion} onChange={setSatisfaccionLocal} />
        </div>
        <div className="encuesta-field">
          <Label className="encuesta-label">Atención del vendedor</Label>
          <StarRating value={atencion} onChange={setAtencion} />
        </div>
        <div className="encuesta-field">
          <Label className="encuesta-label">Calidad de los productos</Label>
          <StarRating value={calidad} onChange={setCalidad} />
        </div>
        <div className="encuesta-field">
          <Label className="encuesta-label">Rapidez de entrega</Label>
          <StarRating value={rapidez} onChange={setRapidez} />
        </div>
        <div className="encuesta-field">
          <Label className="encuesta-label">Comentario adicional (opcional)</Label>
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuéntanos cómo fue tu experiencia..."
            className="encuesta-textarea"
          />
        </div>
      </CardContent>
      <CardFooter className="encuesta-footer">
        <Button
          className="encuesta-btn"
          disabled={satisfaccion === 0 || enviando}
          onClick={handleEnviar}
        >
          <Send className="h-4 w-4" />
          {enviando ? "Enviando..." : "Enviar encuesta"}
        </Button>
      </CardFooter>
    </Card>
  );
}
