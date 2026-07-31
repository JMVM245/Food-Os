"use client";

import { useStore } from "@/store/store";
import { ZONAS, type Zona } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Armchair } from "lucide-react";
import "./seat-selector.css";

export function SeatSelector() {
  const asiento = useStore((s) => s.asiento);
  const setAsiento = useStore((s) => s.setAsiento);

  return (
    <div className="seat-selector">
      <div className="seat-selector-header">
        <Armchair className="seat-selector-icon" />
        <p className="seat-selector-title">Tu ubicación en el estadio</p>
      </div>
      <div className="seat-selector-grid">
        <div className="seat-selector-field">
          <Label htmlFor="tribuna">Tribuna</Label>
          <Select
            value={asiento.tribuna ?? undefined}
            onValueChange={(v) => setAsiento({ tribuna: v as Zona })}
          >
            <SelectTrigger id="tribuna">
              <SelectValue placeholder="Elegir" />
            </SelectTrigger>
            <SelectContent>
              {ZONAS.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="seat-selector-field mt-3">
        <Label htmlFor="codigoBoleta">Código de boleta</Label>
        <Input
          id="codigoBoleta"
          placeholder="Ej. BKT-8721-439"
          value={asiento.codigoBoleta}
          onChange={(e) => setAsiento({ codigoBoleta: e.target.value })}
        />
      </div>
      {asiento.tribuna && (
        <p className="seat-selector-confirm">
          Entregaremos en{" "}
          <span className="seat-selector-location">
            {asiento.tribuna}
          </span>
        </p>
      )}
    </div>
  );
}
