"use client";

import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VENDEDORES_DEMO, type Zona } from "@/lib/data";
import { LogIn, LogOut, Clock } from "lucide-react";
import "./control-ingreso.css";

interface Props {
  zona: Zona;
}

export function ControlIngreso({ zona }: Props) {
  const ingresoVendedor = useStore((s) => s.ingresoVendedor);
  const setIngresoVendedor = useStore((s) => s.setIngresoVendedor);
  const vendedor = VENDEDORES_DEMO[zona];

  function handleIngreso() {
    setIngresoVendedor(true, new Date().toISOString());
  }

  function handleSalida() {
    setIngresoVendedor(false);
  }

  function calcularDuracion() {
    if (!ingresoVendedor.horaInicio) return null;
    const inicio = new Date(ingresoVendedor.horaInicio).getTime();
    const ahora = Date.now();
    const diffMs = ahora - inicio;
    const horas = Math.floor(diffMs / 3600000);
    const minutos = Math.floor((diffMs % 3600000) / 60000);
    return `${horas}h ${minutos}m`;
  }

  return (
    <Card className="ingreso-card">
      <CardHeader className="ingreso-header">
        <CardTitle className="ingreso-title">
          <Clock className="h-5 w-5 text-accent" />
          Control de Jornada
        </CardTitle>
        <CardDescription className="ingreso-desc">
          {vendedor.nombre} · #{vendedor.codigo} · Zona {zona}
        </CardDescription>
      </CardHeader>
      <CardContent className="ingreso-content">
        <div className="ingreso-status">
          <div className="ingreso-status-info">
            <p className="ingreso-status-label">Estado</p>
            <Badge variant={ingresoVendedor.activo ? "success" : "outline"}>
              {ingresoVendedor.activo ? "En servicio" : "Fuera de servicio"}
            </Badge>
          </div>
          {ingresoVendedor.activo && ingresoVendedor.horaInicio && (
            <div className="ingreso-tiempo">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="ingreso-tiempo-text">{calcularDuracion()}</span>
            </div>
          )}
        </div>

        <div className="ingreso-actions">
          {!ingresoVendedor.activo ? (
            <Button className="ingreso-btn" onClick={handleIngreso}>
              <LogIn className="h-4 w-4" />
              Registrar ingreso
            </Button>
          ) : (
            <Button className="ingreso-btn ingreso-btn-salida" variant="destructive" onClick={handleSalida}>
              <LogOut className="h-4 w-4" />
              Registrar salida
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
