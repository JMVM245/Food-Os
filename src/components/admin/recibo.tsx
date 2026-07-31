"use client";

import { X, Printer, Receipt, MapPin, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatoCOP } from "@/components/cliente/product-card";
import type { Pedido } from "@/store/store";
import "./recibo.css";

const ESTADOS: Record<Pedido["estado"], { texto: string; variante: "success" | "warning" | "secondary" | "outline" | "default" }> = {
  entregado: { texto: "Entregado", variante: "success" },
  preparando: { texto: "Preparando", variante: "outline" },
  notificado: { texto: "Notificado", variante: "warning" },
  reclamo: { texto: "Sin repartidor", variante: "secondary" },
  en_camino: { texto: "En camino", variante: "default" },
};

export default function ReciboModal({ pedido, onCerrar }: { pedido: Pedido; onCerrar: () => void }) {
  const estado = ESTADOS[pedido.estado];
  const fecha = new Date(pedido.creadoEn).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const cliente = pedido.codigoBoleta || "—";

  return (
    <div className="admin-recibo-overlay" onClick={onCerrar}>
      <div className="admin-recibo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-recibo-header">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15">
              <Receipt className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="admin-recibo-tag">Recibo de compra</p>
              <h2 className="admin-recibo-title">Pedido #{pedido.id}</h2>
            </div>
          </div>
          <button className="admin-recibo-close" onClick={onCerrar} aria-label="Cerrar recibo">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="admin-recibo-body">
          <div className="admin-recibo-cliente">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cliente</span>
            </div>
            <p className="admin-recibo-cliente-nombre">{cliente}</p>
            <p className="admin-recibo-cliente-fecha">{fecha}</p>
          </div>

          <div className="admin-recibo-grid">
            <div>
              <p className="admin-recibo-label">Entrega</p>
              <p className="admin-recibo-value">
                {pedido.tipoEntrega === "pickup" ? "Recoger en tienda" : `Zona ${pedido.zona}`}
              </p>
            </div>
            {pedido.tipoEntrega === "delivery" && (
              <div>
                <p className="admin-recibo-label">Hora entrega</p>
                <p className="admin-recibo-value">{pedido.horaEntrega ?? "—"}</p>
              </div>
            )}
            <div>
              <p className="admin-recibo-label">Estado</p>
              <Badge variant={estado.variante}>{estado.texto}</Badge>
            </div>
            {pedido.vendedor && (
              <div>
                <p className="admin-recibo-label">Repartidor</p>
                <p className="admin-recibo-value">{pedido.vendedor.nombre}</p>
              </div>
            )}
          </div>

          {pedido.tipoEntrega === "delivery" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Entrega en zona {pedido.zona} · Tribuna {pedido.tribuna}
            </div>
          )}

          <Separator className="my-4" />

          <ul className="admin-recibo-items">
            {pedido.items.map((item, idx) => (
              <li key={idx} className="admin-recibo-item">
                <div>
                  <p className="admin-recibo-item-nombre">
                    {item.emoji} {item.nombre}
                    {item.variante && (
                      <span className="text-muted-foreground"> ({item.variante.nombre})</span>
                    )}
                  </p>
                  <p className="admin-recibo-item-precio">{formatoCOP.format(item.precio)} c/u</p>
                </div>
                <div className="text-right">
                  <p className="admin-recibo-item-total">{formatoCOP.format(item.precio * item.cantidad)}</p>
                  <p className="admin-recibo-item-qty">×{item.cantidad}</p>
                </div>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="admin-recibo-total">
            <span className="admin-recibo-total-label">
              <Clock className="h-3.5 w-3.5" />
              ~{pedido.tiempoEstimadoMin} min
            </span>
            <div className="text-right">
              <p className="admin-recibo-total-num">{formatoCOP.format(pedido.total)}</p>
              <p className="admin-recibo-total-pagado">{pedido.pagado ? "PAGADO" : "PENDIENTE"}</p>
            </div>
          </div>
        </div>

        <div className="admin-recibo-actions">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCerrar}>
            Cerrar
          </Button>
          <Button size="sm" className="flex-1" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
}
