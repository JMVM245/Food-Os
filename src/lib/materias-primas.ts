export interface MateriaPrima {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockDisponible: number;
  stockMaximo: number;
  umbralAlertaPct: number;
  costoUnitario: number;
}

const CATALOGO = [
  { nombre: "Harina de trigo", categoria: "Panadería", unidadMedida: "kg", stockDisponible: 50, stockMaximo: 100, umbralAlertaPct: 20, costoUnitario: 3200 },
  { nombre: "Harina de maíz", categoria: "Panadería", unidadMedida: "kg", stockDisponible: 30, stockMaximo: 80, umbralAlertaPct: 20, costoUnitario: 2800 },
  { nombre: "Pan para perro", categoria: "Panadería", unidadMedida: "unidad", stockDisponible: 100, stockMaximo: 200, umbralAlertaPct: 15, costoUnitario: 800 },
  { nombre: "Pan de hamburguesa", categoria: "Panadería", unidadMedida: "unidad", stockDisponible: 80, stockMaximo: 200, umbralAlertaPct: 15, costoUnitario: 1200 },
  { nombre: "Arepa", categoria: "Panadería", unidadMedida: "unidad", stockDisponible: 60, stockMaximo: 120, umbralAlertaPct: 20, costoUnitario: 1500 },
  { nombre: "Salchicha", categoria: "Proteína", unidadMedida: "unidad", stockDisponible: 150, stockMaximo: 300, umbralAlertaPct: 15, costoUnitario: 2500 },
  { nombre: "Carne molida", categoria: "Proteína", unidadMedida: "kg", stockDisponible: 40, stockMaximo: 80, umbralAlertaPct: 20, costoUnitario: 18000 },
  { nombre: "Queso mozzarella", categoria: "Proteína", unidadMedida: "kg", stockDisponible: 25, stockMaximo: 50, umbralAlertaPct: 20, costoUnitario: 22000 },
  { nombre: "Queso costeño", categoria: "Proteína", unidadMedida: "kg", stockDisponible: 20, stockMaximo: 40, umbralAlertaPct: 20, costoUnitario: 20000 },
  { nombre: "Pollo desmechado", categoria: "Proteína", unidadMedida: "kg", stockDisponible: 30, stockMaximo: 60, umbralAlertaPct: 20, costoUnitario: 16000 },
  { nombre: "Huevo", categoria: "Proteína", unidadMedida: "unidad", stockDisponible: 200, stockMaximo: 400, umbralAlertaPct: 15, costoUnitario: 500 },
  { nombre: "Lechuga", categoria: "Vegetal", unidadMedida: "unidad", stockDisponible: 40, stockMaximo: 80, umbralAlertaPct: 25, costoUnitario: 2000 },
  { nombre: "Tomate", categoria: "Vegetal", unidadMedida: "kg", stockDisponible: 30, stockMaximo: 60, umbralAlertaPct: 25, costoUnitario: 3500 },
  { nombre: "Cebolla", categoria: "Vegetal", unidadMedida: "kg", stockDisponible: 25, stockMaximo: 50, umbralAlertaPct: 20, costoUnitario: 2500 },
  { nombre: "Papá criolla", categoria: "Vegetal", unidadMedida: "kg", stockDisponible: 20, stockMaximo: 40, umbralAlertaPct: 20, costoUnitario: 4000 },
  { nombre: "Repollo", categoria: "Vegetal", unidadMedida: "unidad", stockDisponible: 30, stockMaximo: 60, umbralAlertaPct: 25, costoUnitario: 1800 },
  { nombre: "Cilantro", categoria: "Vegetal", unidadMedida: "kg", stockDisponible: 5, stockMaximo: 10, umbralAlertaPct: 30, costoUnitario: 6000 },
  { nombre: "Leche entera", categoria: "Lácteo", unidadMedida: "l", stockDisponible: 40, stockMaximo: 80, umbralAlertaPct: 20, costoUnitario: 3500 },
  { nombre: "Crema de leche", categoria: "Lácteo", unidadMedida: "l", stockDisponible: 15, stockMaximo: 30, umbralAlertaPct: 20, costoUnitario: 8000 },
  { nombre: "Mantequilla", categoria: "Lácteo", unidadMedida: "kg", stockDisponible: 10, stockMaximo: 20, umbralAlertaPct: 20, costoUnitario: 12000 },
  { nombre: "Queso crema", categoria: "Lácteo", unidadMedida: "kg", stockDisponible: 12, stockMaximo: 25, umbralAlertaPct: 20, costoUnitario: 15000 },
  { nombre: "Salsa de tomate", categoria: "Salsa", unidadMedida: "l", stockDisponible: 20, stockMaximo: 40, umbralAlertaPct: 20, costoUnitario: 5000 },
  { nombre: "Mostaza", categoria: "Salsa", unidadMedida: "l", stockDisponible: 15, stockMaximo: 30, umbralAlertaPct: 20, costoUnitario: 6000 },
  { nombre: "Mayonesa", categoria: "Salsa", unidadMedida: "l", stockDisponible: 18, stockMaximo: 35, umbralAlertaPct: 20, costoUnitario: 7000 },
  { nombre: "Salsa tártara", categoria: "Salsa", unidadMedida: "l", stockDisponible: 10, stockMaximo: 20, umbralAlertaPct: 20, costoUnitario: 8000 },
  { nombre: "Salsa de ajo", categoria: "Salsa", unidadMedida: "l", stockDisponible: 12, stockMaximo: 25, umbralAlertaPct: 20, costoUnitario: 6500 },
  { nombre: "Salsa BBQ", categoria: "Salsa", unidadMedida: "l", stockDisponible: 14, stockMaximo: 28, umbralAlertaPct: 20, costoUnitario: 7500 },
  { nombre: "Papas a la francesa", categoria: "Acompañamiento", unidadMedida: "kg", stockDisponible: 40, stockMaximo: 80, umbralAlertaPct: 20, costoUnitario: 6000 },
  { nombre: "Nachos", categoria: "Acompañamiento", unidadMedida: "kg", stockDisponible: 25, stockMaximo: 50, umbralAlertaPct: 20, costoUnitario: 8000 },
  { nombre: "Plátano maduro", categoria: "Acompañamiento", unidadMedida: "kg", stockDisponible: 20, stockMaximo: 40, umbralAlertaPct: 20, costoUnitario: 3500 },
  { nombre: "Yuca frita", categoria: "Acompañamiento", unidadMedida: "kg", stockDisponible: 20, stockMaximo: 40, umbralAlertaPct: 20, costoUnitario: 4000 },
  { nombre: "Coca-Cola", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 200, stockMaximo: 400, umbralAlertaPct: 15, costoUnitario: 3000 },
  { nombre: "Sprite", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 120, stockMaximo: 250, umbralAlertaPct: 15, costoUnitario: 3000 },
  { nombre: "Fanta", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 80, stockMaximo: 200, umbralAlertaPct: 15, costoUnitario: 3000 },
  { nombre: "Pepsi", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 100, stockMaximo: 200, umbralAlertaPct: 15, costoUnitario: 3000 },
  { nombre: "Quatro", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 60, stockMaximo: 150, umbralAlertaPct: 15, costoUnitario: 3500 },
  { nombre: "Agua sin gas", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 150, stockMaximo: 300, umbralAlertaPct: 15, costoUnitario: 2500 },
  { nombre: "Agua con gas", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 80, stockMaximo: 150, umbralAlertaPct: 15, costoUnitario: 3000 },
  { nombre: "Cerveza Águila", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 200, stockMaximo: 400, umbralAlertaPct: 15, costoUnitario: 4000 },
  { nombre: "Club Colombia", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 100, stockMaximo: 200, umbralAlertaPct: 15, costoUnitario: 5000 },
  { nombre: "Cerveza Poker", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 120, stockMaximo: 250, umbralAlertaPct: 15, costoUnitario: 4000 },
  { nombre: "Cerveza Costeña", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 80, stockMaximo: 150, umbralAlertaPct: 15, costoUnitario: 3500 },
  { nombre: "Limón", categoria: "Fruta", unidadMedida: "kg", stockDisponible: 15, stockMaximo: 30, umbralAlertaPct: 25, costoUnitario: 3000 },
  { nombre: "Aguacate", categoria: "Fruta", unidadMedida: "unidad", stockDisponible: 30, stockMaximo: 60, umbralAlertaPct: 25, costoUnitario: 4000 },
  { nombre: "Fresas", categoria: "Fruta", unidadMedida: "kg", stockDisponible: 10, stockMaximo: 20, umbralAlertaPct: 25, costoUnitario: 8000 },
  { nombre: "Sal", categoria: "Condimento", unidadMedida: "kg", stockDisponible: 10, stockMaximo: 20, umbralAlertaPct: 15, costoUnitario: 2000 },
  { nombre: "Pimienta", categoria: "Condimento", unidadMedida: "kg", stockDisponible: 5, stockMaximo: 10, umbralAlertaPct: 15, costoUnitario: 15000 },
  { nombre: "Comino", categoria: "Condimento", unidadMedida: "kg", stockDisponible: 3, stockMaximo: 8, umbralAlertaPct: 15, costoUnitario: 12000 },
  { nombre: "Ajo en polvo", categoria: "Condimento", unidadMedida: "kg", stockDisponible: 4, stockMaximo: 10, umbralAlertaPct: 15, costoUnitario: 10000 },
  { nombre: "Color", categoria: "Condimento", unidadMedida: "kg", stockDisponible: 3, stockMaximo: 6, umbralAlertaPct: 15, costoUnitario: 8000 },
  { nombre: "Aceite vegetal", categoria: "Grasa", unidadMedida: "l", stockDisponible: 25, stockMaximo: 50, umbralAlertaPct: 20, costoUnitario: 6000 },
  { nombre: "Aceite de oliva", categoria: "Grasa", unidadMedida: "l", stockDisponible: 8, stockMaximo: 15, umbralAlertaPct: 20, costoUnitario: 22000 },
  { nombre: "Servilletas", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 1000, stockMaximo: 2000, umbralAlertaPct: 15, costoUnitario: 100 },
  { nombre: "Bandejas", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 300, stockMaximo: 600, umbralAlertaPct: 15, costoUnitario: 500 },
  { nombre: "Vasos desechables", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 500, stockMaximo: 1000, umbralAlertaPct: 15, costoUnitario: 200 },
  { nombre: "Cubiertos", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 400, stockMaximo: 800, umbralAlertaPct: 15, costoUnitario: 300 },
  { nombre: "Bolsas", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 200, stockMaximo: 400, umbralAlertaPct: 15, costoUnitario: 150 },
  { nombre: "Guantes", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 300, stockMaximo: 600, umbralAlertaPct: 15, costoUnitario: 250 },
];

export const MATERIAS_PRIMAS_INICIALES: MateriaPrima[] = CATALOGO.map((mp, i) => ({
  id: `mp-${i}`,
  ...mp,
}));
