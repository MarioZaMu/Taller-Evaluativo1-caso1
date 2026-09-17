<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Caso de Estudio 1 - Cocina FastFood</title>
</head>
<body>

<script>
/**
 * TALLER CON FRONTEND - CASO DE ESTUDIO 1: COCINA DE COMIDA RÁPIDA
 * Estructuras Propias: Lista Enlazada + Cola Circular O(1) + Pila LIFO O(1)
 * Todo en un solo archivo autosuficiente para Sublime Text / TypeScript.
 */

// ============================================================================
// 1. ESTRUCTURAS DE DATOS PROPIAS (ESTRICTAMENTE PROHIBIDO USAR ARRAY NATIVO)
// ============================================================================

class NodoLista {
  constructor(info) {
    this.info = info;
    this.sig = null;
  }
}

/** Lista Enlazada Simple para el Catálogo y Recetas */
class ListaEnlazada {
  constructor() {
    this.cabeza = null;
    this.tam = 0;
  }

  insertarFinal(elem) {
    const nuevo = new NodoLista(elem);
    if (!this.cabeza) {
      this.cabeza = nuevo;
    } else {
      let aux = this.cabeza;
      while (aux.sig !== null) {
        aux = aux.sig;
      }
      aux.sig = nuevo;
    }
    this.tam++;
  }

  obtenerLongitud() {
    return this.tam;
  }

  obtenerEn(pos) {
    if (pos < 0 || pos >= this.tam) return null;
    let aux = this.cabeza;
    let idx = 0;
    while (aux !== null && idx < pos) {
      aux = aux.sig;
      idx++;
    }
    return aux ? aux.info : null;
  }

  existe(predicado) {
    let aux = this.cabeza;
    while (aux !== null) {
      if (predicado(aux.info)) return true;
      aux = aux.sig;
    }
    return false;
  }

  buscar(predicado) {
    let aux = this.cabeza;
    while (aux !== null) {
      if (predicado(aux.info)) return aux.info;
      aux = aux.sig;
    }
    return null;
  }

  aArray() {
    const arr = [];
    let aux = this.cabeza;
    while (aux !== null) {
      arr.push(aux.info);
      aux = aux.sig;
    }
    return arr;
  }
}

/** Cola Circular basada en Arreglo Estático de Tamaño Fijo - O(1) */
class ColaCircular {
  constructor(capacidad) {
    this.capacidad = capacidad;
    this.arreglo = new Array(capacidad).fill(null);
    this.frente = 0;
    this.final = 0;
    this.contador = 0;
  }

  estaLlena() {
    return this.contador === this.capacidad;
  }

  estaVacia() {
    return this.contador === 0;
  }

  encolar(item) {
    if (this.estaLlena()) return false;
    this.arreglo[this.final] = item;
    this.final = (this.final + 1) % this.capacidad;
    this.contador++;
    return true;
  }

  desencolar() {
    if (this.estaVacia()) return null;
    const elem = this.arreglo[this.frente];
    this.arreglo[this.frente] = null;
    this.frente = (this.frente + 1) % this.capacidad;
    this.contador--;
    return elem;
  }

  verFrente() {
    if (this.estaVacia()) return null;
    return this.arreglo[this.frente];
  }

  obtenerLongitud() {
    return this.contador;
  }

  obtenerCapacidad() {
    return this.capacidad;
  }

  aArrayEnOrden() {
    const arr = [];
    let idx = this.frente;
    for (let i = 0; i < this.contador; i++) {
      const item = this.arreglo[idx];
      if (item !== null) arr.push(item);
      idx = (idx + 1) % this.capacidad;
    }
    return arr;
  }
}

class NodoPila {
  constructor(info) {
    this.info = info;
    this.sig = null;
  }
}

/** Pila LIFO basada en Nodos - O(1) */
class PilaEncadenada {
  constructor() {
    this.tope = null;
    this.tam = 0;
  }

  apilar(elem) {
    const nuevo = new NodoPila(elem);
    nuevo.sig = this.tope;
    this.tope = nuevo;
    this.tam++;
  }

  desapilar() {
    if (this.estaVacia()) return null;
    const item = this.tope.info;
    this.tope = this.tope.sig;
    this.tam--;
    return item;
  }

  verTope() {
    return this.tope ? this.tope.info : null;
  }

  estaVacia() {
    return this.tope === null;
  }

  obtenerLongitud() {
    return this.tam;
  }

  aArrayDesdeTope() {
    const arr = [];
    let aux = this.tope;
    while (aux !== null) {
      arr.push(aux.info);
      aux = aux.sig;
    }
    return arr;
  }

  vaciar() {
    const removidos = [];
    while (!this.estaVacia()) {
      const elem = this.desapilar();
      if (elem !== null) removidos.push(elem);
    }
    return removidos;
  }
}

// ============================================================================
// 2. LÓGICA DE NEGOCIO (SISTEMA DE COCINA)
// ============================================================================

class SistemaCocina {
  constructor(capacidadMaxColas = 5) {
    this.catálogo = new ListaEnlazada();
    this.colaMostrador = new ColaCircular(capacidadMaxColas);
    this.colaDomicilio = new ColaCircular(capacidadMaxColas);
    this.pilaArmado = new PilaEncadenada();
    
    this.pedidoEnArmado = null;
    this.contadorMostradorAtendidos = 0; // Regla R2 (3:1)
    this.consecutivoPedido = 1;

    // Métricas
    this.totalAtendidosMostrador = 0;
    this.totalAtendidosDomicilio = 0;
    this.totalRechazadosMostrador = 0;
    this.totalRechazadosDomicilio = 0;
    this.erroresArmadoContador = 0;
    this.listaDesperdicios = new ListaEnlazada();
    this.historialPedidos = new ListaEnlazada();
    this.bitacora = new ListaEnlazada();

    this.registrarBitacora("Sistema inicializado. Colas configuradas con capacidad C=" + capacidadMaxColas);
  }

  registrarBitacora(msj) {
    const hora = new Date().toLocaleTimeString();
    this.bitacora.insertarFinal(`[${hora}] ${msj}`);
  }

  // RF-01: cargarCatalogo(datos)
  cargarCatalogo(productos) {
    for (const p of productos) {
      if (!p.codigo || p.receta.length === 0) {
        throw new Error("R1-ERR: Producto inválido o receta vacía.");
      }
      if (this.catálogo.existe(prod => prod.codigo === p.codigo)) {
        throw new Error(`R1-ERR: El código de producto ${p.codigo} ya existe.`);
      }

      const recetaLista = new ListaEnlazada();
      for (const capa of p.receta) {
        recetaLista.insertarFinal(capa.trim().toLowerCase());
      }

      this.catálogo.insertarFinal({
        codigo: p.codigo,
        nombre: p.nombre,
        receta: recetaLista
      });
    }
    this.registrarBitacora(`Catálogo cargado con ${productos.length} productos.`);
  }

  // RF-02: registrarPedido(canal, codigo, sin[], minuto)
  registrarPedido(canal, codigoProd, sinCapas, minuto) {
    const prod = this.catálogo.buscar(p => p.codigo === codigoProd);
    if (!prod) throw new Error("R2-ERR: El producto seleccionado no existe en el catálogo.");

    const sinLista = new ListaEnlazada();
    for (const s of sinCapas) {
      const capaBuscada = s.trim().toLowerCase();
      if (!prod.receta.existe(c => c === capaBuscada)) {
        throw new Error(`R2-ERR: La capa '${s}' no pertenece a la receta del producto.`);
      }
      sinLista.insertarFinal(capaBuscada);
    }

    const nuevoPedido = {
      numero: this.consecutivoPedido++,
      canal: canal,
      productoCodigo: codigoProd,
      sin: sinLista,
      minutoLlegada: minuto,
      estado: 'EN_COLA'
    };

    // Aplicar R7: Límite de capacidad en colas
    if (canal === 'MOSTRADOR') {
      if (this.colaMostrador.estaLlena()) {
        this.totalRechazadosMostrador++;
        this.registrarBitacora(`RECHAZO (R7): Cola MOSTRADOR llena. Pedido #${nuevoPedido.numero} rechazado.`);
        throw new Error("REGLA R7: La cola de MOSTRADOR está llena. Rechazar pedido.");
      }
      this.colaMostrador.encolar(nuevoPedido);
    } else {
      if (this.colaDomicilio.estaLlena()) {
        this.totalRechazadosDomicilio++;
        this.registrarBitacora(`RECHAZO (R7): Cola DOMICILIO llena. Pedido #${nuevoPedido.numero} rechazado.`);
        throw new Error("REGLA R7: La cola de DOMICILIO está llena. Rechazar pedido.");
      }
      this.colaDomicilio.encolar(nuevoPedido);
    }

    this.registrarBitacora(`Pedido #${nuevoPedido.numero} (${canal}) ingresó a la cola en el minuto ${minuto}.`);
    return nuevoPedido;
  }

  // RF-03: siguientePedido()
  siguientePedido() {
    if (this.pedidoEnArmado !== null) {
      throw new Error("ERR: Ya hay un pedido en la estación de armado. Debe finalizarlo o cancelarlo primero.");
    }

    if (this.colaMostrador.estaVacia() && this.colaDomicilio.estaVacia()) {
      return null;
    }

    let elegido = null;
    let motivo = "";

    // Aplicar Regla R2 (3:1)
    if (!this.colaMostrador.estaVacia() && this.contadorMostradorAtendidos < 3) {
      elegido = this.colaMostrador.desencolar();
      this.contadorMostradorAtendidos++;
      motivo = `Atendido de MOSTRADOR (Conteo R2: ${this.contadorMostradorAtendidos}/3).`;
    } else if (!this.colaDomicilio.estaVacia()) {
      elegido = this.colaDomicilio.desencolar();
      this.contadorMostradorAtendidos = 0; // Reinicia al atender domicilio
      motivo = `Atendido de DOMICILIO (Reajuste de ratio R2 a 0/3).`;
    } else if (!this.colaMostrador.estaVacia()) {
      elegido = this.colaMostrador.desencolar();
      this.contadorMostradorAtendidos++;
      motivo = `Atendido de MOSTRADOR (Cola domicilio vacía).`;
    }

    if (elegido) {
      elegido.estado = 'EN_ARMADO';
      this.pedidoEnArmado = elegido;
      this.pilaArmado.vaciar();
      this.registrarBitacora(`Siguiente Pedido: #${elegido.numero} pasó a EN_ARMADO. ${motivo}`);
      return { pedido: elegido, motivo };
    }

    return null;
  }

  obtenerRecetaEsperada(pedido) {
    const prod = this.catálogo.buscar(p => p.codigo === pedido.productoCodigo);
    if (!prod) return [];
    
    const recetaOriginal = prod.receta.aArray();
    const sinArray = pedido.sin.aArray();

    return recetaOriginal.filter(capa => !sinArray.includes(capa));
  }

  // RF-04: colocarCapa(capa)
  colocarCapa(capa) {
    if (!this.pedidoEnArmado) throw new Error("ERR: No hay ningún pedido activo en la estación.");

    const capaLimpia = capa.trim().toLowerCase();
    const recetaEsperada = this.obtenerRecetaEsperada(this.pedidoEnArmado);
    
    const pasoActual = this.pilaArmado.obtenerLongitud();
    let advertencia = undefined;

    if (pasoActual >= recetaEsperada.length || recetaEsperada[pasoActual] !== capaLimpia) {
      // Regla R5
      this.erroresArmadoContador++;
      advertencia = `REGLA R5 VIOLADA: La capa '${capaLimpia}' no corresponde al paso ${pasoActual + 1} de la receta esperada (${recetaEsperada[pasoActual] || 'Fin de receta'}).`;
      this.registrarBitacora(`ERROR ARMADO (R5): Capa '${capaLimpia}' en Pedido #${this.pedidoEnArmado.numero}.`);
    }

    this.pilaArmado.apilar(capaLimpia);
    this.registrarBitacora(`Colocada capa '${capaLimpia}' en Pedido #${this.pedidoEnArmado.numero}.`);
    return { exitoso: true, advertenciaR5: advertencia };
  }

  // RF-05: retirarCapa()
  retirarCapa() {
    if (!this.pedidoEnArmado) throw new Error("ERR: No hay ningún pedido en armado.");
    if (this.pilaArmado.estaVacia()) throw new Error("ERR: La pila de capas está vacía.");

    const retirada = this.pilaArmado.desapilar();
    this.listaDesperdicios.insertarFinal({ capa: retirada, motivo: 'DESAPILADO_CORRECCION' });
    this.registrarBitacora(`Retirada capa tope '${retirada}' del Pedido #${this.pedidoEnArmado.numero}. Registrada como desperdicio.`);
    return retirada;
  }

  // RF-06: verificar()
  verificar() {
    if (!this.pedidoEnArmado) throw new Error("ERR: No hay pedido en armado.");

    const recetaEsperada = this.obtenerRecetaEsperada(this.pedidoEnArmado);
    const pilaDesdeTope = this.pilaArmado.aArrayDesdeTope();
    const pilaDesdeBase = [...pilaDesdeTope].reverse();

    let esExacto = true;
    if (pilaDesdeBase.length !== recetaEsperada.length) esExacto = false;

    for (let i = 0; i < pilaDesdeBase.length; i++) {
      if (i >= recetaEsperada.length || pilaDesdeBase[i] !== recetaEsperada[i]) {
        esExacto = false;
        break;
      }
    }

    const faltantes = [];
    if (pilaDesdeBase.length < recetaEsperada.length) {
      for (let i = pilaDesdeBase.length; i < recetaEsperada.length; i++) {
        faltantes.push(recetaEsperada[i]);
      }
    }

    const sobrantes = [];
    if (pilaDesdeBase.length > recetaEsperada.length) {
      for (let i = recetaEsperada.length; i < pilaDesdeBase.length; i++) {
        sobrantes.push(pilaDesdeBase[i]);
      }
    }

    return { esCorrecto: esExacto, faltantes, sobrantes, colocadas: pilaDesdeBase };
  }

  // RF-07: marcarListo()
  marcarListo(minutoActual) {
    if (!this.pedidoEnArmado) throw new Error("ERR: No hay pedido en la estación de armado.");

    const verificacion = this.verificar();
    if (!verificacion.esCorrecto) {
      throw new Error("REGLA R4 VIOLADA: El producto no coincide exactamente con la receta esperada. Corrija las capas.");
    }

    const ped = this.pedidoEnArmado;
    ped.estado = 'LISTO';
    ped.minutoFinalizacion = minutoActual;

    const tiempoTotal = minutoActual - ped.minutoLlegada;
    const limite = ped.canal === 'MOSTRADOR' ? 8 : 20;
    ped.cumplePromesa = tiempoTotal <= limite;

    if (ped.canal === 'MOSTRADOR') this.totalAtendidosMostrador++;
    else this.totalAtendidosDomicilio++;

    this.historialPedidos.insertarFinal(ped);
    this.registrarBitacora(`Pedido #${ped.numero} MARCADO COMO LISTO en min ${minutoActual}. Tiempo: ${tiempoTotal}m (${ped.cumplePromesa ? 'CUMPLE R8' : 'INCUMPLE R8'}).`);
    
    this.pedidoEnArmado = null;
    this.pilaArmado.vaciar();
  }

  // RF-08: cancelarPedido()
  cancelarPedido() {
    if (!this.pedidoEnArmado) throw new Error("ERR: No hay pedido para cancelar.");

    const ped = this.pedidoEnArmado;
    ped.estado = 'CANCELADO';

    const capasDesperdiciadas = this.pilaArmado.vaciar();
    for (const c of capasDesperdiciadas) {
      this.listaDesperdicios.insertarFinal({ capa: c, motivo: 'CANCELADO' });
    }

    this.historialPedidos.insertarFinal(ped);
    this.registrarBitacora(`Pedido #${ped.numero} CANCELADO (R6). ${capasDesperdiciadas.length} capas enviadas a desperdicio.`);
    this.pedidoEnArmado = null;
  }
}

// ============================================================================
// 3. INTERFAZ GRÁFICA Y CONTROLADOR DOM
// ============================================================================

class InterfazCocina {
  constructor() {
    this.sistema = new SistemaCocina(5);
    this.minutoSimulado = 0;
    this.inyectarEstilosCSS();
    this.construirEstructuraDOM();
    this.cargarDatosEjemplo();
    this.actualizarPantalla();
  }

  inyectarEstilosCSS() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg-dark: #0f172a;
        --panel-bg: #1e293b;
        --accent-blue: #38bdf8;
        --accent-green: #22c55e;
        --accent-amber: #f59e0b;
        --accent-red: #ef4444;
        --text-light: #f8fafc;
        --text-muted: #94a3b8;
        --border-color: #334155;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
      body { background-color: var(--bg-dark); color: var(--text-light); min-height: 100vh; display: flex; flex-direction: column; }
      
      header { background: #0284c7; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
      header h1 { font-size: 1.5rem; color: white; display: flex; align-items: center; gap: 10px; }
      
      nav { display: flex; gap: 8px; background: #0f172a; padding: 8px 2rem; border-bottom: 1px solid var(--border-color); }
      nav button { background: transparent; border: none; color: var(--text-muted); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; }
      nav button.active { background: #0284c7; color: white; }

      main { flex: 1; padding: 1.5rem; max-width: 1400px; margin: 0 auto; width: 100%; }

      .seccion { display: none; }
      .seccion.active { display: grid; gap: 1.5rem; }

      .card { background: var(--panel-bg); border-radius: 8px; border: 1px solid var(--border-color); padding: 1.25rem; }
      .card h2 { font-size: 1.15rem; color: var(--accent-blue); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }

      .grid-2 { grid-template-columns: 1fr 1fr; }
      .grid-armado { grid-template-columns: 280px 1fr 300px; }

      .form-group { margin-bottom: 1rem; }
      label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px; }
      select, input { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: #0f172a; color: white; outline: none; }
      .btn { background: #0284c7; border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
      .btn:hover { opacity: 0.9; }
      .btn-danger { background: var(--accent-red); }
      .btn-amber { background: var(--accent-amber); color: #000; }
      .btn-green { background: var(--accent-green); color: #000; }

      .cola-container { display: flex; gap: 8px; overflow-x: auto; padding: 10px 0; min-height: 80px; align-items: center; }
      .cola-item { background: #334155; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--accent-blue); min-width: 120px; text-align: center; }
      .cola-item.frente { border-left-color: var(--accent-green); background: #1e3a8a; }

      .pila-visual { display: flex; flex-direction: column-reverse; background: #0f172a; border: 2px dashed var(--border-color); border-radius: 8px; min-height: 320px; padding: 10px; gap: 6px; justify-content: flex-start; }
      .capa-block { background: #334155; padding: 10px; border-radius: 4px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: white; border: 1px solid rgba(255,255,255,0.1); }
      .capa-block.tope { border: 2px solid var(--accent-amber); box-shadow: 0 0 8px rgba(245,158,11,0.5); }

      .alert-error { background: #450a0a; border: 1px solid var(--accent-red); color: #fca5a5; padding: 10px; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; display: none; }
      .bitacora-box { background: #0f172a; border-radius: 6px; height: 250px; overflow-y: auto; padding: 10px; font-family: monospace; font-size: 0.85rem; color: #a7f3d0; border: 1px solid var(--border-color); }

      .badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
      .badge-mostrador { background: #0284c7; color: white; }
      .badge-domicilio { background: #d97706; color: white; }
    `;
    document.head.appendChild(style);
  }

  construirEstructuraDOM() {
    document.body.innerHTML = `
      <header>
        <h1>🍔 FastFood Kitchen Engine</h1>
        <div style="display:flex; gap:15px; align-items:center;">
          <span>Minuto Reloj: <strong id="lbl-minuto" style="color:var(--accent-amber)">0</strong></span>
          <button class="btn btn-amber" id="btn-avanzar-minuto">+1 Minuto</button>
          <button class="btn btn-green" id="btn-cargar-ejemplo">Cargar Datos Ejemplo</button>
        </div>
      </header>

      <nav>
        <button class="tab-btn active" data-tab="sec-toma">1. Toma de Pedido</button>
        <button class="tab-btn" data-tab="sec-cocina">2. Pantalla de Cocina (Colas)</button>
        <button class="tab-btn" data-tab="sec-armado">3. Estación de Armado (Pila LIFO)</button>
        <button class="tab-btn" data-tab="sec-reportes">4. Métricas & Bitácora</button>
      </nav>

      <main>
        <div id="alert-global" class="alert-error"></div>

        <div id="sec-toma" class="seccion active grid-2">
          <div class="card">
            <h2>Registrar Nuevo Pedido</h2>
            <form id="form-pedido">
              <div class="form-group">
                <label>Canal de Atención</label>
                <select id="sel-canal">
                  <option value="MOSTRADOR">Mostrador (Atención de pie)</option>
                  <option value="DOMICILIO">Domicilio (App Externa)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Producto del Catálogo</label>
                <select id="sel-producto"></select>
              </div>
              <div class="form-group">
                <label>Capas a Omitir (Sin):</label>
                <div id="box-capas-omitir" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
              </div>
              <button type="submit" class="btn btn-green" style="width:100%">Encolar Pedido</button>
            </form>
          </div>

          <div class="card">
            <h2>Catálogo de Productos y Recetas</h2>
            <div id="lista-catalogo"></div>
          </div>
        </div>

        <div id="sec-cocina" class="seccion grid-2">
          <div class="card">
            <div style="display:flex; justify-content:space-between;">
              <h2>Cola MOSTRADOR (Máx 5)</h2>
              <span id="cant-mostrador" class="badge badge-mostrador">0 / 5</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted)">[FRENTE] ➔ [FINAL]</div>
            <div id="cola-mostrador-ui" class="cola-container"></div>
          </div>

          <div class="card">
            <div style="display:flex; justify-content:space-between;">
              <h2>Cola DOMICILIO (Máx 5)</h2>
              <span id="cant-domicilio" class="badge badge-domicilio">0 / 5</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted)">[FRENTE] ➔ [FINAL]</div>
            <div id="cola-domicilio-ui" class="cola-container"></div>
          </div>

          <div class="card" style="grid-column: span 2;">
            <h2>Control de Despacho (Regla 3:1)</h2>
            <p style="margin-bottom:10px; color:var(--text-muted)">
              Contador Regla R2 (Mostrador atendidos): <strong id="lbl-r2-counter" style="color:var(--accent-amber)">0 / 3</strong>
            </p>
            <button id="btn-siguiente-pedido" class="btn btn-green" style="font-size:1.1rem; padding:12px 24px;">
              🔔 Llamar Siguiente Pedido a Armado
            </button>
          </div>
        </div>

        <div id="sec-armado" class="seccion grid-armado">
          <div class="card">
            <h2>Pila de Capas (LIFO)</h2>
            <div id="pila-ui" class="pila-visual"></div>
          </div>

          <div class="card">
            <h2>Pedido Activo en Estación</h2>
            <div id="info-pedido-activo">Sin pedido en armado.</div>
            <hr style="border-color:var(--border-color); margin:1rem 0;">
            <h3>Controles de Armado</h3>
            <div style="display:flex; gap:8px; margin-top:10px;">
              <select id="sel-capa-colocar"></select>
              <button id="btn-colocar-capa" class="btn">Apilar Capa</button>
            </div>
            <div style="display:flex; gap:8px; margin-top:15px; flex-wrap:wrap;">
              <button id="btn-retirar-capa" class="btn btn-amber">Desapilar Capa (LIFO)</button>
              <button id="btn-verificar" class="btn">Verificar Receta (RF-06)</button>
              <button id="btn-marcar-listo" class="btn btn-green">Marcar LISTO</button>
              <button id="btn-cancelar-pedido" class="btn btn-danger">Cancelar Pedido (R6)</button>
            </div>
          </div>

          <div class="card">
            <h2>Receta Esperada</h2>
            <div id="receta-esperada-ui"></div>
          </div>
        </div>

        <div id="sec-reportes" class="seccion grid-2">
          <div class="card">
            <h2>Métricas del Sistema</h2>
            <div id="metrics-ui"></div>
          </div>

          <div class="card">
            <h2>Bitácora Cronológica de Operaciones</h2>
            <div id="bitacora-ui" class="bitacora-box"></div>
          </div>
        </div>
      </main>
    `;

    this.asociarEventosUI();
  }

  asociarEventosUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(target).classList.add('active');
      });
    });

    document.getElementById('btn-avanzar-minuto').addEventListener('click', () => {
      this.minutoSimulado++;
      document.getElementById('lbl-minuto').innerText = this.minutoSimulado.toString();
    });

    document.getElementById('btn-cargar-ejemplo').addEventListener('click', () => {
      this.cargarDatosEjemplo();
      this.actualizarPantalla();
    });

    document.getElementById('form-pedido').addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const canal = document.getElementById('sel-canal').value;
        const prodCodigo = document.getElementById('sel-producto').value;
        
        const capasOmitir = [];
        document.querySelectorAll('.chk-omitir:checked').forEach(chk => {
          capasOmitir.push(chk.value);
        });

        this.sistema.registrarPedido(canal, prodCodigo, capasOmitir, this.minutoSimulado);
        this.ocultarError();
        this.actualizarPantalla();
      } catch (err) {
        this.mostrarError(err.message);
      }
    });

    document.getElementById('sel-producto').addEventListener('change', (e) => {
      this.renderizarOpcionesSin(e.target.value);
    });

    document.getElementById('btn-siguiente-pedido').addEventListener('click', () => {
      try {
        const res = this.sistema.siguientePedido();
        if (!res) {
          this.mostrarError("No hay pedidos pendientes en ninguna de las colas.");
        } else {
          this.ocultarError();
          this.actualizarPantalla();
          document.querySelector('[data-tab="sec-armado"]').click();
        }
      } catch (err) {
        this.mostrarError(err.message);
      }
    });

    document.getElementById('btn-colocar-capa').addEventListener('click', () => {
      try {
        const capa = document.getElementById('sel-capa-colocar').value;
        const res = this.sistema.colocarCapa(capa);
        if (res.advertenciaR5) {
          this.mostrarError(res.advertenciaR5);
        } else {
          this.ocultarError();
        }
        this.actualizarPantalla();
      } catch (err) {
        this.mostrarError(err.message);
      }
    });

    document.getElementById('btn-retirar-capa').addEventListener('click', () => {
      try {
        this.sistema.retirarCapa();
        this.ocultarError();
        this.actualizarPantalla();
      } catch (err) {
        this.mostrarError(err.message);
      }
    });

    document.getElementById('btn-verificar').addEventListener('click', () => {
      try {
        const verif = this.sistema.verificar();
        if (verif.esCorrecto) {
          alert("✅ VERIFICACIÓN EXITOSA: La pila coincide exactamente con la receta esperada.");
        } else {
          alert(`❌ VERIFICACIÓN FALLIDA:\nFaltantes: ${verif.faltantes.join(', ') || 'Ninguna'}\nSobrantes: ${verif.sobrantes.join(', ') || 'Ninguna'}`);
        }
      } catch (err) {
        this.mostrarError(err.message);
      }
    });

    document.getElementById('btn-marcar-listo').addEventListener('click', () => {
      try {
        this.sistema.marcarListo(this.minutoSimulado);
        this.ocultarError();
        this.actualizarPantalla();
        alert("🎉 Pedido finalizado con éxito.");
      } catch (err) {
        this.mostrarError(err.message);
      }
    });

    document.getElementById('btn-cancelar-pedido').addEventListener('click', () => {
      try {
        this.sistema.cancelarPedido();
        this.ocultarError();
        this.actualizarPantalla();
      } catch (err) {
        this.mostrarError(err.message);
      }
    });
  }

  cargarDatosEjemplo() {
    try {
      this.sistema.cargarCatalogo([
        {
          codigo: 'BRG-01',
          nombre: 'Hamburguesa Clásica',
          receta: ['pan_base', 'salsa', 'carne', 'queso', 'cebolla', 'tomate', 'pan_tapa']
        },
        {
          codigo: 'BRG-02',
          nombre: 'Doble Queso Bacon',
          receta: ['pan_base', 'salsa', 'carne', 'queso', 'carne', 'queso', 'bacon', 'pan_tapa']
        },
        {
          codigo: 'PER-01',
          nombre: 'Perro Caliente Especial',
          receta: ['pan_perro', 'salchicha', 'queso', 'cebolla', 'papas_ripio', 'salsa']
        }
      ]);
      this.actualizarSelectProductos();
    } catch (err) {
      // Catálogo ya inicializado
    }
  }

  actualizarSelectProductos() {
    const sel = document.getElementById('sel-producto');
    sel.innerHTML = '';
    const productos = this.sistema.catálogo.aArray();
    productos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.codigo;
      opt.text = `${p.codigo} - ${p.nombre}`;
      sel.appendChild(opt);
    });

    if (productos.length > 0) {
      this.renderizarOpcionesSin(productos[0].codigo);
    }
  }

  renderizarOpcionesSin(codigoProd) {
    const box = document.getElementById('box-capas-omitir');
    box.innerHTML = '';
    const prod = this.sistema.catálogo.buscar(p => p.codigo === codigoProd);
    if (!prod) return;

    prod.receta.aArray().forEach(capa => {
      const lbl = document.createElement('label');
      lbl.style.display = 'inline-flex';
      lbl.style.alignItems = 'center';
      lbl.style.gap = '4px';
      lbl.style.background = '#334155';
      lbl.style.padding = '4px 8px';
      lbl.style.borderRadius = '4px';
      lbl.innerHTML = `<input type="checkbox" class="chk-omitir" value="${capa}"> ${capa}`;
      box.appendChild(lbl);
    });
  }

  mostrarError(msj) {
    const el = document.getElementById('alert-global');
    el.innerText = msj;
    el.style.display = 'block';
  }

  ocultarError() {
    const el = document.getElementById('alert-global');
    el.style.display = 'none';
  }

  actualizarPantalla() {
    // 1. Catálogo
    const catUI = document.getElementById('lista-catalogo');
    catUI.innerHTML = '';
    this.sistema.catálogo.aArray().forEach(p => {
      catUI.innerHTML += `
        <div style="background:#0f172a; padding:10px; margin-bottom:8px; border-radius:6px; border:1px solid var(--border-color);">
          <strong>${p.codigo} - ${p.nombre}</strong>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
            Receta: ${p.receta.aArray().map((c, i) => `${i + 1}.${c}`).join(' ➔ ')}
          </div>
        </div>
      `;
    });

    // 2. Colas
    const colaM = this.sistema.colaMostrador.aArrayEnOrden();
    const colaMUI = document.getElementById('cola-mostrador-ui');
    colaMUI.innerHTML = colaM.length === 0 ? '<em style="color:var(--text-muted)">Cola vacía</em>' : '';
    colaM.forEach((ped, idx) => {
      colaMUI.innerHTML += `
        <div class="cola-item ${idx === 0 ? 'frente' : ''}">
          <strong>#${ped.numero}</strong><br>
          <small>${ped.productoCodigo}</small><br>
          <small style="color:var(--accent-amber)">Min: ${ped.minutoLlegada}</small>
        </div>
      `;
    });
    document.getElementById('cant-mostrador').innerText = `${this.sistema.colaMostrador.obtenerLongitud()} / 5`;

    const colaD = this.sistema.colaDomicilio.aArrayEnOrden();
    const colaDUI = document.getElementById('cola-domicilio-ui');
    colaDUI.innerHTML = colaD.length === 0 ? '<em style="color:var(--text-muted)">Cola vacía</em>' : '';
    colaD.forEach((ped, idx) => {
      colaDUI.innerHTML += `
        <div class="cola-item ${idx === 0 ? 'frente' : ''}">
          <strong>#${ped.numero}</strong><br>
          <small>${ped.productoCodigo}</small><br>
          <small style="color:var(--accent-amber)">Min: ${ped.minutoLlegada}</small>
        </div>
      `;
    });
    document.getElementById('cant-domicilio').innerText = `${this.sistema.colaDomicilio.obtenerLongitud()} / 5`;

    document.getElementById('lbl-r2-counter').innerText = `${this.sistema.contadorMostradorAtendidos} / 3`;

    // 3. Estación Armado
    const pedActivo = this.sistema.pedidoEnArmado;
    const infoActivo = document.getElementById('info-pedido-activo');
    const recetaExpUI = document.getElementById('receta-esperada-ui');
    const selCapa = document.getElementById('sel-capa-colocar');

    selCapa.innerHTML = '';
    const ingreds = ['pan_base', 'pan_tapa', 'pan_perro', 'salsa', 'carne', 'queso', 'cebolla', 'tomate', 'bacon', 'salchicha', 'papas_ripio'];
    ingreds.forEach(ing => {
      const opt = document.createElement('option');
      opt.value = ing;
      opt.text = ing;
      selCapa.appendChild(opt);
    });

    if (!pedActivo) {
      infoActivo.innerHTML = '<em style="color:var(--text-muted)">No hay ningún pedido activo en armado.</em>';
      recetaExpUI.innerHTML = '-';
    } else {
      const recetaEsperada = this.sistema.obtenerRecetaEsperada(pedActivo);
      infoActivo.innerHTML = `
        <p><strong>Pedido #${pedActivo.numero}</strong> (${pedActivo.canal})</p>
        <p>Producto: ${pedActivo.productoCodigo}</p>
        <p>Sin: ${pedActivo.sin.aArray().join(', ') || 'Ninguna'}</p>
        <p>Ingreso: Minuto ${pedActivo.minutoLlegada}</p>
      `;

      recetaExpUI.innerHTML = recetaEsperada.map((capa, idx) => `
        <div style="padding:6px; background:#0f172a; margin-bottom:4px; border-radius:4px; border-left:3px solid var(--accent-blue)">
          ${idx + 1}. ${capa}
        </div>
      `).join('');
    }

    // Pila LIFO
    const pilaUI = document.getElementById('pila-ui');
    pilaUI.innerHTML = '';
    const capasPila = this.sistema.pilaArmado.aArrayDesdeTope();
    
    if (capasPila.length === 0) {
      pilaUI.innerHTML = '<em style="color:var(--text-muted); margin:auto;">Pila Vacía (Base)</em>';
    } else {
      capasPila.forEach((capa, idx) => {
        const div = document.createElement('div');
        div.className = `capa-block ${idx === 0 ? 'tope' : ''}`;
        div.innerText = `${capa} ${idx === 0 ? '(TOPE)' : ''}`;
        pilaUI.appendChild(div);
      });
    }

    // 4. Métricas y Bitácora
    const metricsUI = document.getElementById('metrics-ui');
    const historial = this.sistema.historialPedidos.aArray();
    const cumplidos = historial.filter(h => h.cumplePromesa).length;
    const porcCumpli = historial.length > 0 ? ((cumplidos / historial.length) * 100).toFixed(1) : '100';

    metricsUI.innerHTML = `
      <p>Atendidos Mostrador: <strong>${this.sistema.totalAtendidosMostrador}</strong></p>
      <p>Atendidos Domicilio: <strong>${this.sistema.totalAtendidosDomicilio}</strong></p>
      <p>Rechazados Mostrador (Cola Llena R7): <strong style="color:var(--accent-red)">${this.sistema.totalRechazadosMostrador}</strong></p>
      <p>Rechazados Domicilio (Cola Llena R7): <strong style="color:var(--accent-red)">${this.sistema.totalRechazadosDomicilio}</strong></p>
      <hr style="border-color:var(--border-color); margin:8px 0;">
      <p>Cumplimiento Tiempo Promesa (R8): <strong>${porcCumpli}%</strong></p>
      <p>Errores de Armado Detectados (R5): <strong style="color:var(--accent-amber)">${this.sistema.erroresArmadoContador}</strong></p>
      <p>Total Capas Desperdiciadas (R5/R6): <strong style="color:var(--accent-red)">${this.sistema.listaDesperdicios.obtenerLongitud()}</strong></p>
    `;

    const bitacoraUI = document.getElementById('bitacora-ui');
    bitacoraUI.innerHTML = this.sistema.bitacora.aArray().map(linea => `<div>${linea}</div>`).join('');
    bitacoraUI.scrollTop = bitacoraUI.scrollHeight;
  }
}

// Inicialización de la aplicación
window.addEventListener('DOMContentLoaded', () => {
  new InterfazCocina();
});
</script>

</body>
</html>
