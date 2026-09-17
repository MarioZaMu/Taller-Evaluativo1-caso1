<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Caso de Estudio 1 - FastFood Kitchen</title>
</head>
<body>

<script>
/**
 * TALLER CON FRONTEND - CASO DE ESTUDIO 1: FAST FOOD KITCHEN
 * Custom Data Structures: Linked List + Circular Queue O(1) + LIFO Stack O(1)
 * Everything in a single self-contained file for Sublime Text / TypeScript.
 */

// ============================================================================
// 1. ESTRUCTURAS DE DATOS PROPIAS (NATIVE ARRAY USE STRICTLY PROHIBITED)
// ============================================================================

class ListNode {
  constructor(info) {
    this.info = info;
    this.sig = null;
  }
}

/** Linked List Simple para el Catálogo y Recipes */
class LinkedList {
  constructor() {
    this.cabeza = null;
    this.size = 0;
  }

  insertAtEnd(elem) {
    const nuevo = new ListNode(elem);
    if (!this.cabeza) {
      this.cabeza = nuevo;
    } else {
      let aux = this.cabeza;
      while (aux.sig !== null) {
        aux = aux.sig;
      }
      aux.sig = nuevo;
    }
    this.size++;
  }

  getLength() {
    return this.size;
  }

  getAt(pos) {
    if (pos < 0 || pos >= this.size) return null;
    let aux = this.cabeza;
    let idx = 0;
    while (aux !== null && idx < pos) {
      aux = aux.sig;
      idx++;
    }
    return aux ? aux.info : null;
  }

  exists(predicado) {
    let aux = this.cabeza;
    while (aux !== null) {
      if (predicado(aux.info)) return true;
      aux = aux.sig;
    }
    return false;
  }

  find(predicado) {
    let aux = this.cabeza;
    while (aux !== null) {
      if (predicado(aux.info)) return aux.info;
      aux = aux.sig;
    }
    return null;
  }

  toArray() {
    const arr = [];
    let aux = this.cabeza;
    while (aux !== null) {
      arr.push(aux.info);
      aux = aux.sig;
    }
    return arr;
  }
}

/** Circular Queue basada en Arreglo Estático de Tamaño Fijo - O(1) */
class CircularQueue {
  constructor(capacity) {
    this.capacity = capacity;
    this.array = new Array(capacity).fill(null);
    this.front = 0;
    this.rear = 0;
    this.count = 0;
  }

  isFull() {
    return this.count === this.capacity;
  }

  isEmpty() {
    return this.count === 0;
  }

  enqueue(item) {
    if (this.isFull()) return false;
    this.array[this.rear] = item;
    this.rear = (this.rear + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const elem = this.array[this.front];
    this.array[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return elem;
  }

  peekFront() {
    if (this.isEmpty()) return null;
    return this.array[this.front];
  }

  getLength() {
    return this.count;
  }

  getCapacity() {
    return this.capacity;
  }

  toArrayInOrder() {
    const arr = [];
    let idx = this.front;
    for (let i = 0; i < this.count; i++) {
      const item = this.array[idx];
      if (item !== null) arr.push(item);
      idx = (idx + 1) % this.capacity;
    }
    return arr;
  }
}

class StackNode {
  constructor(info) {
    this.info = info;
    this.sig = null;
  }
}

/** LIFO Stack basada en Nodos - O(1) */
class LinkedStack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(elem) {
    const nuevo = new StackNode(elem);
    nuevo.sig = this.top;
    this.top = nuevo;
    this.size++;
  }

  pop() {
    if (this.isEmpty()) return null;
    const item = this.top.info;
    this.top = this.top.sig;
    this.size--;
    return item;
  }

  peek() {
    return this.top ? this.top.info : null;
  }

  isEmpty() {
    return this.top === null;
  }

  getLength() {
    return this.size;
  }

  toArrayFromTop() {
    const arr = [];
    let aux = this.top;
    while (aux !== null) {
      arr.push(aux.info);
      aux = aux.sig;
    }
    return arr;
  }

  clear() {
    const removed = [];
    while (!this.isEmpty()) {
      const elem = this.pop();
      if (elem !== null) removed.push(elem);
    }
    return removed;
  }
}

// ============================================================================
// 2. BUSINESS LOGIC (KITCHEN SYSTEM)
// ============================================================================

class KitchenSystem {
  constructor(capacidadMaxQueues = 5) {
    this.catalog = new LinkedList();
    this.counterQueue = new CircularQueue(capacidadMaxQueues);
    this.deliveryQueue = new CircularQueue(capacidadMaxQueues);
    this.assemblyStack = new LinkedStack();
    
    this.activeOrder = null;
    this.counterOrdersServed = 0; // Regla R2 (3:1)
    this.orderSequence = 1;

    // Métricas
    this.totalCounterServed = 0;
    this.totalDeliveryServed = 0;
    this.totalCounterRejected = 0;
    this.totalDeliveryRejected = 0;
    this.assemblyErrors = 0;
    this.wasteList = new LinkedList();
    this.orderHistory = new LinkedList();
    this.log = new LinkedList();

    this.logEvent("Sistema inicializado. Queues configuradas con capacity C=" + capacidadMaxQueues);
  }

  logEvent(message) {
    const time = new Date().toLocaleTimeString();
    this.log.insertAtEnd(`[${time}] ${message}`);
  }

  // RF-01: loadCatalog(datos)
  loadCatalog(products) {
    for (const p of products) {
      if (!p.code || p.receta.length === 0) {
        throw new Error("R1-ERR: Invalid product or empty recipe.");
      }
      if (this.catalog.exists(prod => prod.codigo === p.code)) {
        throw new Error(`R1-ERR: The product code ${p.code} ya exists.`);
      }

      const recipeList = new LinkedList();
      for (const capa of p.receta) {
        recipeList.insertAtEnd(capa.trim().toLowerCase());
      }

      this.catalog.insertAtEnd({
        code: p.code,
        nombre: p.nombre,
        receta: recipeList
      });
    }
    this.logEvent(`Catalog loaded with ${products.length} products.`);
  }

  // RF-02: registerOrder(canal, codigo, sin[], minute)
  registerOrder(canal, productCode, skippedLayers, minute) {
    const prod = this.catalog.find(p => p.code === productCode);
    if (!prod) throw new Error("R2-ERR: El producto seleccionado no exists en el catalog.");

    const sinLista = new LinkedList();
    for (const s of skippedLayers) {
      const searchedLayer = s.trim().toLowerCase();
      if (!prod.receta.exists(c => c === searchedLayer)) {
        throw new Error(`R2-ERR: The layer '${s}' does not belong to the product recipe.`);
      }
      sinLista.insertAtEnd(searchedLayer);
    }

    const newOrder = {
      numero: this.orderSequence++,
      channel: channel,
      productCode: productCode,
      sin: sinLista,
      arrivalMinute: minute,
      estado: 'QUEUED'
    };

    // Aplicar R7: Límite de capacity en colas
    if (canal === 'COUNTER') {
      if (this.counterQueue.isFull()) {
        this.totalCounterRejected++;
        this.logEvent(`REJECTION (R7): COUNTER queue full. Order #${newOrder.numero} rechazado.`);
        throw new Error("RULE R7: La cola de COUNTER está llena. Rechazar pedido.");
      }
      this.counterQueue.enqueue(newOrder);
    } else {
      if (this.deliveryQueue.isFull()) {
        this.totalDeliveryRejected++;
        this.logEvent(`REJECTION (R7): DELIVERY queue full. Order #${newOrder.numero} rechazado.`);
        throw new Error("RULE R7: La cola de DELIVERY está llena. Rechazar pedido.");
      }
      this.deliveryQueue.enqueue(newOrder);
    }

    this.logEvent(`Order #${newOrder.numero} (${canal}) ingresó a la cola en el minute ${minute}.`);
    return newOrder;
  }

  // RF-03: nextOrder()
  nextOrder() {
    if (this.activeOrder !== null) {
      throw new Error("ERR: There is already an order at the assembly station. Finish or cancel it first.");
    }

    if (this.counterQueue.isEmpty() && this.deliveryQueue.isEmpty()) {
      return null;
    }

    let elegido = null;
    let motivo = "";

    // Aplicar Regla R2 (3:1)
    if (!this.counterQueue.isEmpty() && this.counterOrdersServed < 3) {
      elegido = this.counterQueue.dequeue();
      this.counterOrdersServed++;
      motivo = `Served from COUNTER (R2 Count: ${this.counterOrdersServed}/3).`;
    } else if (!this.deliveryQueue.isEmpty()) {
      elegido = this.deliveryQueue.dequeue();
      this.counterOrdersServed = 0; // Reinicia al atender domicilio
      motivo = `Served from DELIVERY (R2 ratio reset to 0/3).`;
    } else if (!this.counterQueue.isEmpty()) {
      elegido = this.counterQueue.dequeue();
      this.counterOrdersServed++;
      motivo = `Served from COUNTER (Delivery queue empty).`;
    }

    if (elegido) {
      elegido.estado = 'IN ASSEMBLY';
      this.activeOrder = elegido;
      this.assemblyStack.clear();
      this.logEvent(`Siguiente Pedido: #${elegido.numero} moved to IN ASSEMBLY. ${motivo}`);
      return { pedido: elegido, motivo };
    }

    return null;
  }

  getExpectedRecipe(pedido) {
    const prod = this.catalog.find(p => p.code === pedido.productCode);
    if (!prod) return [];
    
    const originalRecipe = prod.receta.toArray();
    const skipArray = pedido.sin.toArray();

    return originalRecipe.filter(capa => !skipArray.includes(capa));
  }

  // RF-04: addLayer(capa)
  addLayer(capa) {
    if (!this.activeOrder) throw new Error("ERR: There is no active order at the station.");

    const cleanLayer = capa.trim().toLowerCase();
    const expectedRecipe = this.getExpectedRecipe(this.activeOrder);
    
    const currentStep = this.assemblyStack.getLength();
    let warning = undefined;

    if (currentStep >= expectedRecipe.length || expectedRecipe[currentStep] !== cleanLayer) {
      // Regla R5
      this.assemblyErrors++;
      warning = `R5 RULE VIOLATED: The layer '${cleanLayer}' no corresponde al paso ${currentStep + 1} de la receta esperada (${expectedRecipe[currentStep] || 'End of recipe'}).`;
      this.logEvent(`ASSEMBLY ERROR (R5): Capa '${cleanLayer}' en Order #${this.activeOrder.numero}.`);
    }

    this.assemblyStack.push(cleanLayer);
    this.logEvent(`Layer added '${cleanLayer}' en Order #${this.activeOrder.numero}.`);
    return { exitoso: true, advertenciaR5: warning };
  }

  // RF-05: removeLayer()
  removeLayer() {
    if (!this.activeOrder) throw new Error("ERR: There is no order being assembled.");
    if (this.assemblyStack.isEmpty()) throw new Error("ERR: The layer stack is empty.");

    const retirada = this.assemblyStack.pop();
    this.wasteList.insertAtEnd({ capa: retirada, motivo: 'UNSTACKED_CORRECTION' });
    this.logEvent(`Retirada capa top '${retirada}' del Order #${this.activeOrder.numero}. Registered as waste.`);
    return retirada;
  }

  // RF-06: verify()
  verify() {
    if (!this.activeOrder) throw new Error("ERR: There is no order being assembled.");

    const expectedRecipe = this.getExpectedRecipe(this.activeOrder);
    const pilaDesdeTope = this.assemblyStack.toArrayFromTop();
    const pilaDesdeBase = [...pilaDesdeTope].reverse();

    let isExact = true;
    if (pilaDesdeBase.length !== expectedRecipe.length) isExact = false;

    for (let i = 0; i < pilaDesdeBase.length; i++) {
      if (i >= expectedRecipe.length || pilaDesdeBase[i] !== expectedRecipe[i]) {
        isExact = false;
        break;
      }
    }

    const missing = [];
    if (pilaDesdeBase.length < expectedRecipe.length) {
      for (let i = pilaDesdeBase.length; i < expectedRecipe.length; i++) {
        missing.push(expectedRecipe[i]);
      }
    }

    const extra = [];
    if (pilaDesdeBase.length > expectedRecipe.length) {
      for (let i = expectedRecipe.length; i < pilaDesdeBase.length; i++) {
        extra.push(pilaDesdeBase[i]);
      }
    }

    return { esCorrecto: isExact, missing, extra, placed: pilaDesdeBase };
  }

  // RF-07: markReady()
  markReady(minutoActual) {
    if (!this.activeOrder) throw new Error("ERR: There is no order at the assembly station.");

    const verificacion = this.verify();
    if (!verificacion.esCorrecto) {
      throw new Error("R4 RULE VIOLATED: El producto no coincide exactamente con la receta esperada. Corrija las capas.");
    }

    const ped = this.activeOrder;
    ped.estado = 'READY';
    ped.completionMinute = minutoActual;

    const totalTime = minutoActual - ped.arrivalMinute;
    const limit = order.channel === 'COUNTER' ? 8 : 20;
    ped.meetsPromise = totalTime <= limit;

    if (order.channel === 'COUNTER') this.totalCounterServed++;
    else this.totalDeliveryServed++;

    this.orderHistory.insertAtEnd(ped);
    this.logEvent(`Order #${ped.numero} MARCADO COMO READY en min ${minutoActual}. Time: ${totalTime}m (${ped.meetsPromise ? 'MEETS R8' : 'FAILS R8'}).`);
    
    this.activeOrder = null;
    this.assemblyStack.clear();
  }

  // RF-08: cancelOrder()
  cancelOrder() {
    if (!this.activeOrder) throw new Error("ERR: There is no order to cancel.");

    const ped = this.activeOrder;
    ped.estado = 'CANCELLED';

    const wastedLayers = this.assemblyStack.clear();
    for (const c of wastedLayers) {
      this.wasteList.insertAtEnd({ capa: c, motivo: 'CANCELLED' });
    }

    this.orderHistory.insertAtEnd(ped);
    this.logEvent(`Order #${ped.numero} CANCELLED (R6). ${wastedLayers.length} layers sent to waste.`);
    this.activeOrder = null;
  }
}

// ============================================================================
// 3. GRAPHICAL INTERFACE AND DOM CONTROLLER
// ============================================================================

class KitchenInterface {
  constructor() {
    this.sistema = new KitchenSystem(5);
    this.simulatedMinute = 0;
    this.injectCSS();
    this.buildDOM();
    this.loadSampleData();
    this.updateScreen();
  }

  injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg-dark: #2b0b0b;
        --panel-bg: #4a1717;
        --accent-blue: #ffffff;
        --accent-green: #dc2626;
        --accent-amber: #facc15;
        --accent-red: #dc2626;
        --text-light: #ffffff;
        --text-muted: #fde68a;
        --border-color: #7f1d1d;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
      body { background-color: var(--bg-dark); color: var(--text-light); min-height: 100vh; display: flex; flex-direction: column; }
      
      header { background: #b91c1c; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
      header h1 { font-size: 1.5rem; color: white; display: flex; align-items: center; gap: 10px; }
      
      nav { display: flex; gap: 8px; background: #2b0b0b; padding: 8px 2rem; border-bottom: 1px solid var(--border-color); }
      nav button { background: transparent; border: none; color: var(--text-muted); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; }
      nav button.active { background: #b91c1c; color: white; }

      main { flex: 1; padding: 1.5rem; max-width: 1400px; margin: 0 auto; width: 100%; }

      .section { display: none; }
      .section.active { display: grid; gap: 1.5rem; }

      .card { background: var(--panel-bg); border-radius: 8px; border: 1px solid var(--border-color); padding: 1.25rem; }
      .card h2 { font-size: 1.15rem; color: var(--accent-blue); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }

      .grid-2 { grid-template-columns: 1fr 1fr; }
      .grid-armado { grid-template-columns: 280px 1fr 300px; }

      .form-group { margin-bottom: 1rem; }
      label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px; }
      select, input { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: #2b0b0b; color: white; outline: none; }
      .btn { background: #b91c1c; border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
      .btn:hover { opacity: 0.9; }
      .btn-danger { background: var(--accent-red); }
      .btn-amber { background: var(--accent-amber); color: #000; }
      .btn-green { background: var(--accent-green); color: #000; }

      .queue-container { display: flex; gap: 8px; overflow-x: auto; padding: 10px 0; min-height: 80px; align-items: center; }
      .queue-item { background: #6b1d1d; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--accent-blue); min-width: 120px; text-align: center; }
      .queue-item.front { border-left-color: var(--accent-green); background: #7f1d1d; }

      .stack-visual { display: flex; flex-direction: column-reverse; background: #2b0b0b; border: 2px dashed var(--border-color); border-radius: 8px; min-height: 320px; padding: 10px; gap: 6px; justify-content: flex-start; }
      .layer-block { background: #6b1d1d; padding: 10px; border-radius: 4px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: white; border: 1px solid rgba(255,255,255,0.1); }
      .layer-block.top { border: 2px solid var(--accent-amber); box-shadow: 0 0 8px rgba(245,158,11,0.5); }

      .alert-error { background: #3f0a0a; border: 1px solid var(--accent-red); color: #fca5a5; padding: 10px; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; display: none; }
      .log-box { background: #2b0b0b; border-radius: 6px; height: 250px; overflow-y: auto; padding: 10px; font-family: monospace; font-size: 0.85rem; color: #a7f3d0; border: 1px solid var(--border-color); }

      .badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
      .badge-counter { background: #b91c1c; color: white; }
      .badge-delivery { background: #ca8a04; color: white; }
    `;
    document.head.appendChild(style);
  }

  buildDOM() {
    document.body.innerHTML = `
      <header>
        <h1>🍔 FastFood Kitchen Engine</h1>
        <div style="display:flex; gap:15px; align-items:center;">
          <span>+ Clock Minute: <strong id="lbl-minute" style="color:var(--accent-amber)">0</strong></span>
          <button class="btn btn-amber" id="btn-avanzar-minute">+1 Minuto</button>
          <button class="btn btn-green" id="btn-load-sample">Load Sample Data</button>
        </div>
      </header>

      <nav>
        <button class="tab-btn active" data-tab="sec-order">1. Order Taking</button>
        <button class="tab-btn" data-tab="sec-kitchen">2. Kitchen Display (Queues)</button>
        <button class="tab-btn" data-tab="sec-assembly">3. Assembly Station (LIFO Stack)</button>
        <button class="tab-btn" data-tab="sec-reports">4. Metrics & Log</button>
      </nav>

      <main>
        <div id="global-alert" class="alert-error"></div>

        <div id="sec-order" class="section active grid-2">
          <div class="card">
            <h2>Register New Order</h2>
            <form id="form-order">
              <div class="form-group">
                <label>Service Channel</label>
                <select id="sel-channel">
                  <option value="COUNTER">Counter (Walk-in)</option>
                  <option value="DELIVERY">Delivery (External App)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Catalog Product</label>
                <select id="sel-product"></select>
              </div>
              <div class="form-group">
                <label>Layers to Skip (Without):</label>
                <div id="box-skip-layers" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
              </div>
              <button type="submit" class="btn btn-green" style="width:100%">Queue Order</button>
            </form>
          </div>

          <div class="card">
            <h2>Product Catalog & Recipes</h2>
            <div id="lista-catalogo"></div>
          </div>
        </div>

        <div id="sec-kitchen" class="section grid-2">
          <div class="card">
            <div style="display:flex; justify-content:space-between;">
              <h2>Queue COUNTER (Max 5)</h2>
              <span id="counter-count" class="badge badge-counter">0 / 5</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted)">[FRENTE] ➔ [FINAL]</div>
            <div id="counter-queue-ui" class="queue-container"></div>
          </div>

          <div class="card">
            <div style="display:flex; justify-content:space-between;">
              <h2>Queue DELIVERY (Max 5)</h2>
              <span id="delivery-count" class="badge badge-delivery">0 / 5</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted)">[FRENTE] ➔ [FINAL]</div>
            <div id="delivery-queue-ui" class="queue-container"></div>
          </div>

          <div class="card" style="grid-column: span 2;">
            <h2>Dispatch Control (3:1 Rule)</h2>
            <p style="margin-bottom:10px; color:var(--text-muted)">
              R2 Rule Counter (Counter orders served): <strong id="lbl-r2-counter" style="color:var(--accent-amber)">0 / 3</strong>
            </p>
            <button id="btn-next-order" class="btn btn-green" style="font-size:1.1rem; padding:12px 24px;">
              🔔 Call Next Order to Assembly
            </button>
          </div>
        </div>

        <div id="sec-assembly" class="section grid-armado">
          <div class="card">
            <h2>Layer Stack (LIFO)</h2>
            <div id="stack-ui" class="stack-visual"></div>
          </div>

          <div class="card">
            <h2>Active Order at Station</h2>
            <div id="active-order-info">No order in assembly.</div>
            <hr style="border-color:var(--border-color); margin:1rem 0;">
            <h3>Assembly Controls</h3>
            <div style="display:flex; gap:8px; margin-top:10px;">
              <select id="sel-layer"></select>
              <button id="btn-add-layer" class="btn">Push Layer</button>
            </div>
            <div style="display:flex; gap:8px; margin-top:15px; flex-wrap:wrap;">
              <button id="btn-remove-layer" class="btn btn-amber">Pop Layer (LIFO)</button>
              <button id="btn-verify" class="btn">Verify Recipe (RF-06)</button>
              <button id="btn-mark-ready" class="btn btn-green">Mark READY</button>
              <button id="btn-cancel-order" class="btn btn-danger">Cancel Order (R6)</button>
            </div>
          </div>

          <div class="card">
            <h2>Expected Recipe</h2>
            <div id="expected-recipe-ui"></div>
          </div>
        </div>

        <div id="sec-reports" class="section grid-2">
          <div class="card">
            <h2>System Metrics</h2>
            <div id="metrics-ui"></div>
          </div>

          <div class="card">
            <h2>Chronological Operation Log</h2>
            <div id="log-ui" class="log-box"></div>
          </div>
        </div>
      </main>
    `;

    this.bindUIEvents();
  }

  bindUIEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(target).classList.add('active');
      });
    });

    document.getElementById('btn-avanzar-minute').addEventListener('click', () => {
      this.simulatedMinute++;
      document.getElementById('lbl-minute').innerText = this.simulatedMinute.toString();
    });

    document.getElementById('btn-load-sample').addEventListener('click', () => {
      this.loadSampleData();
      this.updateScreen();
    });

    document.getElementById('form-order').addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const canal = document.getElementById('sel-channel').value;
        const prodCodigo = document.getElementById('sel-product').value;
        
        const capasOmitir = [];
        document.querySelectorAll('.chk-omitir:checked').forEach(chk => {
          capasOmitir.push(chk.value);
        });

        this.sistema.registerOrder(canal, prodCodigo, capasOmitir, this.simulatedMinute);
        this.hideError();
        this.updateScreen();
      } catch (err) {
        this.showError(err.message);
      }
    });

    document.getElementById('sel-product').addEventListener('change', (e) => {
      this.renderSkipOptions(e.target.value);
    });

    document.getElementById('btn-next-order').addEventListener('click', () => {
      try {
        const res = this.sistema.nextOrder();
        if (!res) {
          this.showError("There are no pending orders in either queue.");
        } else {
          this.hideError();
          this.updateScreen();
          document.querySelector('[data-tab="sec-assembly"]').click();
        }
      } catch (err) {
        this.showError(err.message);
      }
    });

    document.getElementById('btn-add-layer').addEventListener('click', () => {
      try {
        const capa = document.getElementById('sel-layer').value;
        const res = this.sistema.addLayer(capa);
        if (res.advertenciaR5) {
          this.showError(res.advertenciaR5);
        } else {
          this.hideError();
        }
        this.updateScreen();
      } catch (err) {
        this.showError(err.message);
      }
    });

    document.getElementById('btn-remove-layer').addEventListener('click', () => {
      try {
        this.sistema.removeLayer();
        this.hideError();
        this.updateScreen();
      } catch (err) {
        this.showError(err.message);
      }
    });

    document.getElementById('btn-verify').addEventListener('click', () => {
      try {
        const verif = this.sistema.verify();
        if (verif.esCorrecto) {
          alert("✅ VERIFICATION SUCCESSFUL: The stack exactly matches the expected recipe.");
        } else {
          alert(`❌ VERIFICATION FAILED:\nMissing: ${verif.missing.join(', ') || 'None'}\nExtra: ${verif.extra.join(', ') || 'None'}`);
        }
      } catch (err) {
        this.showError(err.message);
      }
    });

    document.getElementById('btn-mark-ready').addEventListener('click', () => {
      try {
        this.sistema.markReady(this.simulatedMinute);
        this.hideError();
        this.updateScreen();
        alert("🎉 Order completed successfully.");
      } catch (err) {
        this.showError(err.message);
      }
    });

    document.getElementById('btn-cancel-order').addEventListener('click', () => {
      try {
        this.sistema.cancelOrder();
        this.hideError();
        this.updateScreen();
      } catch (err) {
        this.showError(err.message);
      }
    });
  }

  loadSampleData() {
    try {
      this.sistema.loadCatalog([
        {
          code: 'BRG-01',
          nombre: 'Classic Burger',
          receta: ['pan_base', 'salsa', 'carne', 'queso', 'cebolla', 'tomate', 'pan_tapa']
        },
        {
          code: 'BRG-02',
          nombre: 'Double Bacon Cheeseburger',
          receta: ['pan_base', 'salsa', 'carne', 'queso', 'carne', 'queso', 'bacon', 'pan_tapa']
        },
        {
          code: 'PER-01',
          nombre: 'Special Hot Dog',
          receta: ['pan_perro', 'salchicha', 'queso', 'cebolla', 'papas_ripio', 'salsa']
        }
      ]);
      this.updateProductSelect();
    } catch (err) {
      // Catálogo ya inicializado
    }
  }

  updateProductSelect() {
    const sel = document.getElementById('sel-product');
    sel.innerHTML = '';
    const products = this.sistema.catalog.toArray();
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.code;
      opt.text = `${p.code} - ${p.nombre}`;
      sel.appendChild(opt);
    });

    if (products.length > 0) {
      this.renderSkipOptions(products[0].codigo);
    }
  }

  renderSkipOptions(productCode) {
    const box = document.getElementById('box-skip-layers');
    box.innerHTML = '';
    const prod = this.sistema.catalog.find(p => p.code === productCode);
    if (!prod) return;

    prod.receta.toArray().forEach(capa => {
      const lbl = document.createElement('label');
      lbl.style.display = 'inline-flex';
      lbl.style.alignItems = 'center';
      lbl.style.gap = '4px';
      lbl.style.background = '#6b1d1d';
      lbl.style.padding = '4px 8px';
      lbl.style.borderRadius = '4px';
      lbl.innerHTML = `<input type="checkbox" class="chk-omitir" value="${capa}"> ${capa}`;
      box.appendChild(lbl);
    });
  }

  showError(message) {
    const el = document.getElementById('global-alert');
    el.innerText = message;
    el.style.display = 'block';
  }

  hideError() {
    const el = document.getElementById('global-alert');
    el.style.display = 'none';
  }

  updateScreen() {
    // 1. Catálogo
    const catUI = document.getElementById('lista-catalogo');
    catUI.innerHTML = '';
    this.sistema.catalog.toArray().forEach(p => {
      catUI.innerHTML += `
        <div style="background:#2b0b0b; padding:10px; margin-bottom:8px; border-radius:6px; border:1px solid var(--border-color);">
          <strong>${p.code} - ${p.nombre}</strong>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
            Recipe: ${p.receta.toArray().map((c, i) => `${i + 1}.${c}`).join(' ➔ ')}
          </div>
        </div>
      `;
    });

    // 2. Queues
    const colaM = this.sistema.counterQueue.toArrayInOrder();
    const colaMUI = document.getElementById('counter-queue-ui');
    colaMUI.innerHTML = colaM.length === 0 ? '<em style="color:var(--text-muted)">Empty queue</em>' : '';
    colaM.forEach((ped, idx) => {
      colaMUI.innerHTML += `
        <div class="queue-item ${idx === 0 ? 'front' : ''}">
          <strong>#${ped.numero}</strong><br>
          <small>${ped.productCode}</small><br>
          <small style="color:var(--accent-amber)">Min: ${ped.arrivalMinute}</small>
        </div>
      `;
    });
    document.getElementById('counter-count').innerText = `${this.sistema.counterQueue.getLength()} / 5`;

    const colaD = this.sistema.deliveryQueue.toArrayInOrder();
    const colaDUI = document.getElementById('delivery-queue-ui');
    colaDUI.innerHTML = colaD.length === 0 ? '<em style="color:var(--text-muted)">Empty queue</em>' : '';
    colaD.forEach((ped, idx) => {
      colaDUI.innerHTML += `
        <div class="queue-item ${idx === 0 ? 'front' : ''}">
          <strong>#${ped.numero}</strong><br>
          <small>${ped.productCode}</small><br>
          <small style="color:var(--accent-amber)">Min: ${ped.arrivalMinute}</small>
        </div>
      `;
    });
    document.getElementById('delivery-count').innerText = `${this.sistema.deliveryQueue.getLength()} / 5`;

    document.getElementById('lbl-r2-counter').innerText = `${this.sistema.counterOrdersServed} / 3`;

    // 3. Estación Armado
    const pedActivo = this.sistema.activeOrder;
    const infoActivo = document.getElementById('active-order-info');
    const recetaExpUI = document.getElementById('expected-recipe-ui');
    const selCapa = document.getElementById('sel-layer');

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
      const expectedRecipe = this.sistema.getExpectedRecipe(pedActivo);
      infoActivo.innerHTML = `
        <p><strong>Order #${pedActivo.numero}</strong> (${pedActivo.canal})</p>
        <p>Product: ${pedActivo.productCode}</p>
        <p>Without: ${pedActivo.sin.toArray().join(', ') || 'None'}</p>
        <p>Arrival: Minute ${pedActivo.arrivalMinute}</p>
      `;

      recetaExpUI.innerHTML = expectedRecipe.map((capa, idx) => `
        <div style="padding:6px; background:#2b0b0b; margin-bottom:4px; border-radius:4px; border-left:3px solid var(--accent-blue)">
          ${idx + 1}. ${capa}
        </div>
      `).join('');
    }

    // LIFO Stack
    const pilaUI = document.getElementById('stack-ui');
    pilaUI.innerHTML = '';
    const capasPila = this.sistema.assemblyStack.toArrayFromTop();
    
    if (capasPila.length === 0) {
      pilaUI.innerHTML = '<em style="color:var(--text-muted); margin:auto;">Empty Stack (Base)</em>';
    } else {
      capasPila.forEach((capa, idx) => {
        const div = document.createElement('div');
        div.className = `layer-block ${idx === 0 ? 'top' : ''}`;
        div.innerText = `${capa} ${idx === 0 ? '(TOPE)' : ''}`;
        pilaUI.appendChild(div);
      });
    }

    // 4. Métricas y Bitácora
    const metricsUI = document.getElementById('metrics-ui');
    const historial = this.sistema.orderHistory.toArray();
    const cumplidos = historial.filter(h => h.meetsPromise).length;
    const porcCumpli = historial.length > 0 ? ((cumplidos / historial.length) * 100).toFixed(1) : '100';

    metricsUI.innerHTML = `
      <p>Counter Served: <strong>${this.sistema.totalCounterServed}</strong></p>
      <p>Delivery Served: <strong>${this.sistema.totalDeliveryServed}</strong></p>
      <p>Counter Rejected (Full Queue R7): <strong style="color:var(--accent-red)">${this.sistema.totalCounterRejected}</strong></p>
      <p>Delivery Rejected (Full Queue R7): <strong style="color:var(--accent-red)">${this.sistema.totalDeliveryRejected}</strong></p>
      <hr style="border-color:var(--border-color); margin:8px 0;">
      <p>Promise Time Compliance (R8): <strong>${porcCumpli}%</strong></p>
      <p>Assembly Errors Detected (R5): <strong style="color:var(--accent-amber)">${this.sistema.assemblyErrors}</strong></p>
      <p>Total Wasted Layers (R5/R6): <strong style="color:var(--accent-red)">${this.sistema.wasteList.getLength()}</strong></p>
    `;

    const bitacoraUI = document.getElementById('log-ui');
    bitacoraUI.innerHTML = this.sistema.log.toArray().map(line => `<div>${line}</div>`).join('');
    bitacoraUI.scrollTop = bitacoraUI.scrollHeight;
  }
}

// Inicialización de la aplicación
window.addEventListener('DOMContentLoaded', () => {
  new KitchenInterface();
});
</script>

</body>
</html>
