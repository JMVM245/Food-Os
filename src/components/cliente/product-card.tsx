"use client";

import { useState } from "react";
import { useStore } from "@/store/store";
import type { Producto, Zona } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";
import "./product-card.css";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function ProductCard({ producto, zona, esTienda }: { producto: Producto; zona: Zona | null; esTienda?: boolean }) {
  const [varianteId, setVarianteId] = useState(producto.variantes?.[0]?.id);
  const carrito = useStore((s) => s.carrito);
  const addToCart = useStore((s) => s.addToCart);
  const setCantidad = useStore((s) => s.setCantidad);
  const disponiblePorZona = useStore((s) => s.disponiblePorZona);

  const disponible = zona
    ? esTienda
      ? (producto.stockTienda[zona as keyof typeof producto.stockTienda] ?? 0)
      : disponiblePorZona(producto.id, zona)
    : null;
  const agotado = zona ? disponible !== null && disponible <= 0 : false;
  const varianteSel = producto.variantes?.find((v) => v.id === varianteId);
  const precioFinal = producto.precio + (varianteSel?.precioExtra ?? 0);

  const enCarrito = carrito.find((i) => {
    const match = i.productoId === producto.id;
    if (producto.variantes) return match && i.varianteId === varianteId;
    return match;
  })?.cantidad ?? 0;

  function handleAgregar() {
    addToCart(producto.id, varianteId);
  }

  return (
    <Card className={agotado ? "product-card-agotado" : "product-card"}>
      <CardContent className="product-card-content">
        <div className="product-card-top">
          <div className="product-card-emoji">
            {producto.emoji}
          </div>
          {zona ? (
            agotado ? (
              <Badge variant="soldout">Agotado</Badge>
            ) : (
              <Badge variant="success">{disponible} disp.</Badge>
            )
          ) : (
            <Badge variant="outline">Elige ubicación</Badge>
          )}
        </div>

        <div className="product-card-info">
          <p className="product-card-name">{producto.nombre}</p>
          <p className="product-card-price">{formatoCOP.format(precioFinal)}</p>
        </div>

        {producto.variantes && producto.variantes.length > 0 && (
          <Select value={varianteId} onValueChange={setVarianteId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Elegir" />
            </SelectTrigger>
            <SelectContent>
              {producto.variantes.map((v) => (
                <SelectItem key={v.id} value={v.id} className="text-xs">
                  {v.nombre}{v.precioExtra > 0 ? ` (+${formatoCOP.format(v.precioExtra)})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {enCarrito === 0 ? (
          <Button
            size="sm"
            className="w-full"
            disabled={!zona || agotado}
            onClick={handleAgregar}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        ) : (
          <div className="product-card-cart-actions">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setCantidad(producto.id, enCarrito - 1, varianteId)}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="product-card-cart-qty">{enCarrito}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={disponible !== null && enCarrito >= disponible}
              onClick={handleAgregar}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { formatoCOP };
