export interface MateriaPrima {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockDisponible: number;
  stockMaximo: number;
  costoUnitario: number;
}

export type CategoriaInsumo = "Panadería" | "Proteína" | "Vegetal" | "Lácteo" | "Salsa" | "Acompañamiento" | "Grasa" | "Condimento" | "Bebida" | "Fruta" | "Insumo de servicio";

export const MATERIAS_PRIMAS_INICIALES: MateriaPrima[] = [
  // Hamburguesa
  { id: "pan-hamburguesa", nombre: "Pan de hamburguesa", categoria: "Panadería", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 5000, costoUnitario: 700 },
  { id: "carne-res", nombre: "Carne de res (molida)", categoria: "Proteína", unidadMedida: "g", stockDisponible: 0, stockMaximo: 500000, costoUnitario: 26 },
  { id: "lechuga", nombre: "Lechuga batavia", categoria: "Vegetal", unidadMedida: "g", stockDisponible: 0, stockMaximo: 100000, costoUnitario: 3.5 },
  { id: "tomate", nombre: "Tomate chonto", categoria: "Vegetal", unidadMedida: "g", stockDisponible: 0, stockMaximo: 100000, costoUnitario: 2.8 },
  { id: "queso-cheddar", nombre: "Queso tipo cheddar", categoria: "Lácteo", unidadMedida: "g", stockDisponible: 0, stockMaximo: 150000, costoUnitario: 21 },
  { id: "cebolla", nombre: "Cebolla cabezona", categoria: "Vegetal", unidadMedida: "g", stockDisponible: 0, stockMaximo: 80000, costoUnitario: 2.6 },
  { id: "ketchup", nombre: "Salsa ketchup", categoria: "Salsa", unidadMedida: "ml", stockDisponible: 0, stockMaximo: 50000, costoUnitario: 9 },
  { id: "mostaza", nombre: "Salsa mostaza", categoria: "Salsa", unidadMedida: "ml", stockDisponible: 0, stockMaximo: 50000, costoUnitario: 8 },
  { id: "mayonesa", nombre: "Salsa mayonesa", categoria: "Salsa", unidadMedida: "ml", stockDisponible: 0, stockMaximo: 50000, costoUnitario: 10 },

  // Perro caliente
  { id: "pan-perro", nombre: "Pan de perro", categoria: "Panadería", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 5000, costoUnitario: 550 },
  { id: "salchicha", nombre: "Salchicha", categoria: "Proteína", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 5000, costoUnitario: 750 },
  { id: "ripio-papa", nombre: "Ripio de papa", categoria: "Acompañamiento", unidadMedida: "g", stockDisponible: 0, stockMaximo: 60000, costoUnitario: 12 },
  { id: "salsa-rosada", nombre: "Salsa rosada", categoria: "Salsa", unidadMedida: "ml", stockDisponible: 0, stockMaximo: 30000, costoUnitario: 10 },

  // Papas fritas
  { id: "papa-congelada", nombre: "Papa corte francés (congelada)", categoria: "Acompañamiento", unidadMedida: "kg", stockDisponible: 0, stockMaximo: 3000, costoUnitario: 6500 },
  { id: "aceite", nombre: "Aceite vegetal", categoria: "Grasa", unidadMedida: "l", stockDisponible: 0, stockMaximo: 1000, costoUnitario: 9700 },
  { id: "sal", nombre: "Sal", categoria: "Condimento", unidadMedida: "kg", stockDisponible: 0, stockMaximo: 200, costoUnitario: 1600 },

  // Bebidas
  { id: "jarabe-cocacola", nombre: "Jarabe concentrado Coca-Cola", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 2000, costoUnitario: 19000 },
  { id: "jarabe-pepsi", nombre: "Jarabe concentrado Pepsi", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 2000, costoUnitario: 18000 },
  { id: "jarabe-fanta", nombre: "Jarabe concentrado Fanta", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 2000, costoUnitario: 17500 },
  { id: "jarabe-7up", nombre: "Jarabe concentrado 7up", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 2000, costoUnitario: 17500 },
  { id: "jarabe-sprite", nombre: "Jarabe concentrado Sprite", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 2000, costoUnitario: 17500 },
  { id: "jugo-hit", nombre: "Jugo Hit", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 2000, costoUnitario: 6500 },
  { id: "agua-tratada", nombre: "Agua potable tratada", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 5000, costoUnitario: 1000 },

  // Ensalada de frutas
  { id: "papaya", nombre: "Papaya", categoria: "Fruta", unidadMedida: "kg", stockDisponible: 0, stockMaximo: 500, costoUnitario: 2100 },
  { id: "manzana", nombre: "Manzana", categoria: "Fruta", unidadMedida: "kg", stockDisponible: 0, stockMaximo: 500, costoUnitario: 4200 },
  { id: "sandia", nombre: "Sandía", categoria: "Fruta", unidadMedida: "kg", stockDisponible: 0, stockMaximo: 500, costoUnitario: 1700 },
  { id: "mango", nombre: "Mango", categoria: "Fruta", unidadMedida: "kg", stockDisponible: 0, stockMaximo: 500, costoUnitario: 3300 },
  { id: "banano", nombre: "Banano", categoria: "Fruta", unidadMedida: "kg", stockDisponible: 0, stockMaximo: 500, costoUnitario: 2200 },
  { id: "crema-leche", nombre: "Crema de leche", categoria: "Lácteo", unidadMedida: "ml", stockDisponible: 0, stockMaximo: 30000, costoUnitario: 13 },
  { id: "leche-condensada", nombre: "Leche condensada (lecherita)", categoria: "Lácteo", unidadMedida: "ml", stockDisponible: 0, stockMaximo: 30000, costoUnitario: 15 },

  // Nachos
  { id: "tortilla-chips", nombre: "Tortilla chips (nachos)", categoria: "Acompañamiento", unidadMedida: "g", stockDisponible: 0, stockMaximo: 200000, costoUnitario: 14 },
  { id: "queso-nacho", nombre: "Queso nacho (salsa cheddar líquida)", categoria: "Lácteo", unidadMedida: "ml", stockDisponible: 0, stockMaximo: 60000, costoUnitario: 18 },
  { id: "jalapenos", nombre: "Jalapeños en rodajas", categoria: "Vegetal", unidadMedida: "g", stockDisponible: 0, stockMaximo: 30000, costoUnitario: 16 },
  { id: "guacamole", nombre: "Guacamole / salsa de aguacate", categoria: "Salsa", unidadMedida: "g", stockDisponible: 0, stockMaximo: 30000, costoUnitario: 12 },

  // Cerveza
  { id: "cerveza-barril", nombre: "Cerveza barril (chopp nacional)", categoria: "Bebida", unidadMedida: "l", stockDisponible: 0, stockMaximo: 3000, costoUnitario: 5500 },
  { id: "cerveza-lata", nombre: "Cerveza lata/botella (nacional)", categoria: "Bebida", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 10000, costoUnitario: 2200 },

  // Insumos de servicio
  { id: "envoltorio", nombre: "Envoltorio papel antigrasa / caja fibra de caña", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 10000, costoUnitario: 300 },
  { id: "servilleta", nombre: "Servilleta fibra reciclada", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 20000, costoUnitario: 35 },
  { id: "bandeja", nombre: "Bandeja cartón / fibra natural", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 10000, costoUnitario: 260 },
  { id: "cono-papas", nombre: "Cono cartón / bagazo (papas)", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 10000, costoUnitario: 230 },
  { id: "vaso-bebidas", nombre: "Vaso cartón + PLA (bebidas)", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 15000, costoUnitario: 280 },
  { id: "botella-agua", nombre: "Botella reciclable/biodegradable (agua)", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 5000, costoUnitario: 550 },
  { id: "vaso-ensalada", nombre: "Vaso PLA / cartón (ensalada de frutas)", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 8000, costoUnitario: 320 },
  { id: "bandeja-nachos", nombre: "Bandeja/charola cartón (nachos)", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 8000, costoUnitario: 240 },
  { id: "vaso-cerveza", nombre: "Vaso plástico reciclable (cerveza, 12oz)", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 15000, costoUnitario: 220 },
  { id: "cuchara", nombre: "Cuchara madera/bambú", categoria: "Insumo de servicio", unidadMedida: "unidad", stockDisponible: 0, stockMaximo: 8000, costoUnitario: 160 },
];
