<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise System Dashboard</title>
    <!-- Babel standalone for runtime TypeScript compilation -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        /* ==========================================
           1. CSS VARIABLES & THEME SETUP
           Palette: Red, Yellow, White & Neutral Dark
           ========================================== */
        :root {
            --bg-main: #f4f5f7;
            --bg-card: #ffffff;
            --primary-red: #d32f2f;
            --primary-red-hover: #b71c1c;
            --primary-red-light: #ffebee;
            --accent-yellow: #fbc02d;
            --accent-yellow-light: #fffde7;
            --accent-yellow-dark: #f57f17;
            --text-dark: #212121;
            --text-muted: #666666;
            --border-color: #e0e0e0;
            --border-red: #ef5350;
            --border-yellow: #fdd835;
            --sidebar-width: 260px;
            --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
            --radius-sm: 6px;
            --radius-md: 10px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: var(--bg-main);
            color: var(--text-dark);
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        /* ==========================================
           2. SIDEBAR NAVIGATION
           ========================================== */
        .sidebar {
            width: var(--sidebar-width);
            background-color: var(--primary-red);
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1.5rem 1rem;
            box-shadow: 2px 0 10px rgba(0,0,0,0.15);
            z-index: 10;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 2rem;
            padding: 0 0.5rem;
        }

        .brand-logo {
            width: 36px;
            height: 36px;
            background-color: var(--accent-yellow);
            color: var(--primary-red);
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
        }

        .brand-title {
            font-size: 1.1rem;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .nav-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .nav-item {
            padding: 10px 14px;
            border-radius: var(--radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .nav-item:hover {
            background-color: rgba(255, 255, 255, 0.15);
        }

        .nav-item.active {
            background-color: var(--accent-yellow);
            color: var(--text-dark);
            font-weight: 700;
        }

        .user-profile {
            background-color: rgba(0, 0, 0, 0.15);
            padding: 12px;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            gap: 10px;
            border-left: 4px solid var(--accent-yellow);
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            background-color: #ffffff;
            color: var(--primary-red);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .user-details {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-size: 0.85rem;
            font-weight: 600;
        }

        .user-role {
            font-size: 0.75rem;
            opacity: 0.8;
        }

        /* ==========================================
           3. MAIN LAYOUT & HEADER
           ========================================== */
        .main-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .top-header {
            background-color: var(--bg-card);
            padding: 1rem 2rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: var(--shadow-sm);
        }

        .header-title {
            font-size: 1.4rem;
            color: var(--primary-red);
            font-weight: 700;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .status-badge {
            background-color: var(--accent-yellow-light);
            border: 1px solid var(--accent-yellow);
            color: var(--accent-yellow-dark);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .content-area {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        /* ==========================================
           4. METRIC CARDS SECTION
           ========================================== */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
        }

        .metric-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-top: 4px solid var(--primary-red);
            border-radius: var(--radius-md);
            padding: 1.2rem;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .metric-card.yellow-accent {
            border-top-color: var(--accent-yellow);
        }

        .metric-label {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
        }

        .metric-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-dark);
        }

        .metric-subtext {
            font-size: 0.75rem;
            color: var(--primary-red);
            font-weight: 500;
        }

        /* ==========================================
           5. DASHBOARD GRID PANELS
           ========================================== */
        .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
        }

        .panel {
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.2rem;
            padding-bottom: 0.8rem;
            border-bottom: 2px solid var(--primary-red-light);
        }

        .panel-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary-red);
        }

        /* ==========================================
           6. FORM CONTROLS & BUTTONS
           ========================================== */
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 1rem;
        }

        .form-group label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-dark);
        }

        .form-control {
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.2s;
        }

        .form-control:focus {
            border-color: var(--primary-red);
            box-shadow: 0 0 0 2px var(--primary-red-light);
        }

        .btn-group {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 10px 18px;
            border: none;
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
        }

        .btn:active {
            transform: scale(0.98);
        }

        .btn-primary {
            background-color: var(--primary-red);
            color: #ffffff;
        }

        .btn-primary:hover {
            background-color: var(--primary-red-hover);
        }

        .btn-accent {
            background-color: var(--accent-yellow);
            color: var(--text-dark);
        }

        .btn-accent:hover {
            background-color: var(--accent-yellow-dark);
            color: #ffffff;
        }

        .btn-secondary {
            background-color: #e0e0e0;
            color: var(--text-dark);
        }

        .btn-secondary:hover {
            background-color: #d6d6d6;
        }

        /* ==========================================
           7. DATA TABLE STYLING
           ========================================== */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.9rem;
        }

        .data-table th {
            background-color: var(--primary-red-light);
            color: var(--primary-red);
            padding: 12px;
            font-weight: 700;
            border-bottom: 2px solid var(--border-red);
        }

        .data-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
        }

        .data-table tr:hover {
            background-color: var(--accent-yellow-light);
        }

        .badge-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
            display: inline-block;
        }

        .badge-active {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        .badge-pending {
            background-color: var(--accent-yellow-light);
            color: var(--accent-yellow-dark);
            border: 1px solid var(--accent-yellow);
        }

        .badge-failed {
            background-color: var(--primary-red-light);
            color: var(--primary-red);
        }

        /* ==========================================
           8. ACTIVITY LOG & ALERTS
           ========================================== */
        .log-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-height: 280px;
            overflow-y: auto;
        }

        .log-item {
            padding: 10px;
            background-color: #fafafa;
            border-left: 3px solid var(--accent-yellow);
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .log-item.error {
            border-left-color: var(--primary-red);
            background-color: var(--primary-red-light);
        }

        .log-timestamp {
            color: var(--text-muted);
            font-size: 0.7rem;
            margin-bottom: 2px;
        }

        .log-message {
            font-weight: 500;
        }

        .alert-box {
            background-color: var(--accent-yellow-light);
            border: 1px solid var(--accent-yellow);
            padding: 12px;
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            color: var(--accent-yellow-dark);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Responsive tweaks */
        @media (max-width: 900px) {
            body {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                height: auto;
            }
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>

    <!-- SIDEBAR NAVIGATION -->
    <aside class="sidebar">
        <div>
            <div class="brand">
                <div class="brand-logo">TS</div>
                <div class="brand-title">ControlHub</div>
            </div>
            <ul class="nav-list">
                <li class="nav-item active" id="nav-dashboard">Dashboard</li>
                <li class="nav-item" id="nav-documents">Document Processing</li>
                <li class="nav-item" id="nav-servers">Server Nodes</li>
                <li class="nav-item" id="nav-logs">System Logs</li>
                <li class="nav-item" id="nav-settings">Settings</li>
            </ul>
        </div>
        <div class="user-profile">
            <div class="user-avatar">AD</div>
            <div class="user-details">
                <span class="user-name">Administrator</span>
                <span class="user-role">System Architect</span>
            </div>
        </div>
    </aside>

    <!-- MAIN WRAPPER -->
    <div class="main-wrapper">
        <!-- TOP HEADER -->
        <header class="top-header">
            <h1 class="header-title" id="page-title">Enterprise System Dashboard</h1>
            <div class="header-actions">
                <span class="status-badge" id="system-status">System Operational</span>
                <button class="btn btn-accent" id="btn-refresh">Refresh Engine</button>
            </div>
        </header>

        <!-- MAIN CONTENT AREA -->
        <main class="content-area">

            <!-- METRIC CARDS -->
            <section class="metrics-grid">
                <div class="metric-card">
                    <span class="metric-label">Total Documents</span>
                    <span class="metric-value" id="metric-docs">1,284</span>
                    <span class="metric-subtext">+12% from last hour</span>
                </div>
                <div class="metric-card yellow-accent">
                    <span class="metric-label">Active Server Nodes</span>
                    <span class="metric-value" id="metric-servers">8 / 10</span>
                    <span class="metric-subtext">2 nodes standby</span>
                </div>
                <div class="metric-card">
                    <span class="metric-label">Average Latency</span>
                    <span class="metric-value" id="metric-latency">42 ms</span>
                    <span class="metric-subtext">Optimal performance</span>
                </div>
                <div class="metric-card yellow-accent">
                    <span class="metric-label">Error Rate</span>
                    <span class="metric-value" id="metric-errors">0.04%</span>
                    <span class="metric-subtext">Within safety parameters</span>
                </div>
            </section>

            <!-- MAIN PANELS -->
            <section class="dashboard-grid">
                <!-- PANEL 1: DATA TABLE & ENGINE CONTROL -->
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Batch Document Processing Queue</h2>
                        <button class="btn btn-primary" id="btn-add-doc">Process New Batch</button>
                    </div>

                    <div class="alert-box" id="alert-banner">
                        <span>Notice: Automated document compilation active using TypeScript engine layer.</span>
                    </div>

                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Document Name</th>
                                    <th>Format</th>
                                    <th>Size</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="document-table-body">
                                <!-- Populated dynamically by TypeScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- PANEL 2: SYSTEM LOGS & ACTIONS -->
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">System Event Logs</h2>
                        <button class="btn btn-secondary" id="btn-clear-logs">Clear</button>
                    </div>

                    <div class="form-group">
                        <label for="log-filter">Filter Severity</label>
                        <select id="log-filter" class="form-control">
                            <option value="ALL">All Events</option>
                            <option value="INFO">Information Only</option>
                            <option value="WARNING">Warnings</option>
                            <option value="ERROR">Errors</option>
                        </select>
                    </div>

                    <div class="log-container" id="log-container">
                        <!-- Populated dynamically by TypeScript -->
                    </div>

                    <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-weight: 600; font-size: 0.85rem;">Manual System Dispatch</label>
                        <div class="btn-group">
                            <button class="btn btn-accent" id="btn-dispatch-job" style="flex: 1;">Dispatch Task</button>
                            <button class="btn btn-primary" id="btn-trigger-error" style="flex: 1;">Simulate Fail</button>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    </div>

    <!-- ====================================================================
         TYPESCRIPT ARCHITECTURE IMPLEMENTATION
         ==================================================================== -->
    <script type="text/babel" lang="ts">

        // ==========================================
        // 1. DATA MODELS & ENUMS
        // ==========================================
        
        type DocumentFormat = "PDF" | "DOCX" | "JSON" | "XML";
        type ProcessStatus = "COMPLETED" | "PROCESSING" | "QUEUED" | "FAILED";
        type LogSeverity = "INFO" | "WARNING" | "ERROR";

        interface BatchDocument {
            id: string;
            filename: string;
            format: DocumentFormat;
            sizeMb: number;
            status: ProcessStatus;
            createdAt: Date;
        }

        interface SystemLog {
            id: string;
            timestamp: Date;
            severity: LogSeverity;
            message: string;
        }

        interface ServerNode {
            nodeId: string;
            name: string;
            loadPercentage: number;
            isOnline: boolean;
        }

        // ==========================================
        // 2. STATE MANAGEMENT LAYER
        // ==========================================

        class SystemStateManager {
            private documents: BatchDocument[] = [];
            private logs: SystemLog[] = [];
            private servers: ServerNode[] = [];
            private listeners: Array<() => void> = [];

            constructor() {
                this.seedInitialData();
            }

            private seedInitialData(): void {
                this.documents = [
                    { id: "DOC-1001", filename: "financial_report_q3.pdf", format: "PDF", sizeMb: 4.2, status: "COMPLETED", createdAt: new Date() },
                    { id: "DOC-1002", filename: "user_manifest_v2.json", format: "JSON", sizeMb: 0.8, status: "PROCESSING", createdAt: new Date() },
                    { id: "DOC-1003", filename: "architecture_diagram.xml", format: "XML", sizeMb: 12.5, status: "QUEUED", createdAt: new Date() },
                    { id: "DOC-1004", filename: "legal_contract_final.docx", format: "DOCX", sizeMb: 2.1, status: "FAILED", createdAt: new Date() }
                ];

                this.servers = [
                    { nodeId: "SRV-01", name: "US-East Primary Node", loadPercentage: 45, isOnline: true },
                    { nodeId: "SRV-02", name: "EU-Central Worker Node", loadPercentage: 82, isOnline: true },
                    { nodeId: "SRV-03", name: "AP-East Secondary Node", loadPercentage: 0, isOnline: false }
                ];

                this.addLog("INFO", "System state initialized successfully.");
                this.addLog("WARNING", "Server node SRV-03 offline for maintenance.");
            }

            public subscribe(listener: () => void): void {
                this.listeners.push(listener);
            }

            private notify(): void {
                this.listeners.forEach(callback => callback());
            }

            public getDocuments(): BatchDocument[] {
                return [...this.documents];
            }

            public getLogs(): SystemLog[] {
                return [...this.logs];
            }

            public getServers(): ServerNode[] {
                return [...this.servers];
            }

            public addDocument(doc: BatchDocument): void {
                this.documents.unshift(doc);
                this.addLog("INFO", `Document added to processing queue: ${doc.filename}`);
                this.notify();
            }

            public removeDocument(id: string): void {
                this.documents = this.documents.filter(d => d.id !== id);
                this.addLog("WARNING", `Document removed: ${id}`);
                this.notify();
            }

            public addLog(severity: LogSeverity, message: string): void {
                const newLog: SystemLog = {
                    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                    timestamp: new Date(),
                    severity,
                    message
                };
                this.logs.unshift(newLog);
                this.notify();
            }

            public clearLogs(): void {
                this.logs = [];
                this.notify();
            }
        }

        // Initialize Global State
        const appState = new SystemStateManager();

        // ==========================================
        // 3. DOCUMENT PROCESSOR SERVICE (FACTORY PATTERN)
        // ==========================================

        class DocumentFactory {
            private static counter: number = 1005;

            public static createRandomDocument(): BatchDocument {
                const formats: DocumentFormat[] = ["PDF", "DOCX", "JSON", "XML"];
                const statuses: ProcessStatus[] = ["QUEUED", "PROCESSING", "COMPLETED"];
                
                const chosenFormat = formats[Math.floor(Math.random() * formats.length)];
                const chosenStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                const id = `DOC-${this.counter++}`;
                const filename = `data_export_${Math.floor(Math.random() * 100)}.${chosenFormat.toLowerCase()}`;
                const sizeMb = parseFloat((Math.random() * 15 + 0.1).toFixed(1));

                return {
                    id,
                    filename,
                    format: chosenFormat,
                    sizeMb,
                    status: chosenStatus,
                    createdAt: new Date()
                };
            }
        }

        // ==========================================
        // 4. UI RENDERER & INTERACTIVE LOGIC
        // ==========================================

        class DashboardUI {
            private docTableBody: HTMLElement;
            private logContainer: HTMLElement;
            private metricDocs: HTMLElement;
            private logFilterSelect: HTMLSelectElement;

            constructor() {
                this.docTableBody = document.getElementById("document-table-body")!;
                this.logContainer = document.getElementById("log-container")!;
                this.metricDocs = document.getElementById("metric-docs")!;
                this.logFilterSelect = document.getElementById("log-filter") as HTMLSelectElement;

                this.bindEvents();
                appState.subscribe(() => this.render());
            }

            private bindEvents(): void {
                // Add Document Button
                document.getElementById("btn-add-doc")?.addEventListener("click", () => {
                    const newDoc = DocumentFactory.createRandomDocument();
                    appState.addDocument(newDoc);
                });

                // Clear Logs Button
                document.getElementById("btn-clear-logs")?.addEventListener("click", () => {
                    appState.clearLogs();
                });

                // Dispatch Job Button
                document.getElementById("btn-dispatch-job")?.addEventListener("click", () => {
                    appState.addLog("INFO", "Manual job execution dispatched to active nodes.");
                });

                // Trigger Error Button
                document.getElementById("btn-trigger-error")?.addEventListener("click", () => {
                    appState.addLog("ERROR", "Execution failure reported in processing node SRV-02.");
                });

                // Refresh Button
                document.getElementById("btn-refresh")?.addEventListener("click", () => {
                    appState.addLog("INFO", "Engine state re-synchronized.");
                });

                // Filter Change
                this.logFilterSelect?.addEventListener("change", () => {
                    this.renderLogs();
                });

                // Navigation Items Interaction
                const navItems = document.querySelectorAll(".nav-item");
                navItems.forEach(item => {
                    item.addEventListener("click", (e) => {
                        navItems.forEach(i => i.classList.remove("active"));
                        (e.target as HTMLElement).classList.add("active");
                        const navName = (e.target as HTMLElement).innerText;
                        appState.addLog("INFO", `Navigated to section: ${navName}`);
                    });
                });
            }

            private getStatusBadgeClass(status: ProcessStatus): string {
                switch (status) {
                    case "COMPLETED": return "badge-active";
                    case "PROCESSING": return "badge-pending";
                    case "QUEUED": return "badge-pending";
                    case "FAILED": return "badge-failed";
                }
            }

            public render(): void {
                this.renderDocuments();
                this.renderLogs();
                this.renderMetrics();
            }

            private renderDocuments(): void {
                const docs = appState.getDocuments();
                this.docTableBody.innerHTML = "";

                if (docs.length === 0) {
                    this.docTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No active documents in processing queue.</td></tr>`;
                    return;
                }

                docs.forEach(doc => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td><strong>${doc.id}</strong></td>
                        <td>${doc.filename}</td>
                        <td>${doc.format}</td>
                        <td>${doc.sizeMb} MB</td>
                        <td><span class="badge-status ${this.getStatusBadgeClass(doc.status)}">${doc.status}</span></td>
                        <td>
                            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.deleteDocument('${doc.id}')">Delete</button>
                        </td>
                    `;
                    this.docTableBody.appendChild(row);
                });
            }

            private renderLogs(): void {
                const selectedSeverity = this.logFilterSelect.value;
                let logs = appState.getLogs();

                if (selectedSeverity !== "ALL") {
                    logs = logs.filter(l => l.severity === selectedSeverity);
                }

                this.logContainer.innerHTML = "";

                if (logs.length === 0) {
                    this.logContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 10px;">No logs match criteria.</div>`;
                    return;
                }

                logs.forEach(log => {
                    const item = document.createElement("div");
                    item.className = `log-item ${log.severity === 'ERROR' ? 'error' : ''}`;
                    
                    const timeStr = log.timestamp.toLocaleTimeString();
                    
                    item.innerHTML = `
                        <div class="log-timestamp">[${timeStr}] Severity: ${log.severity}</div>
                        <div class="log-message">${log.message}</div>
                    `;
                    this.logContainer.appendChild(item);
                });
            }

            private renderMetrics(): void {
                const docs = appState.getDocuments();
                this.metricDocs.textContent = docs.length.toString();
            }
        }

        // Global helper for row actions
        (window as any).deleteDocument = (id: string): void => {
            appState.removeDocument(id);
        };

        // Initialize application on DOM ready
        document.addEventListener("DOMContentLoaded", () => {
            const ui = new DashboardUI();
            ui.render();
        });

    </script>
</body>
</html>
