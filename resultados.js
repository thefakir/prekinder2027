// ==================== CONFIG ====================
// Mismas credenciales que script.js (Publishable key, segura para exponer en el navegador).
// Si rotan la clave en Supabase, actualizar también acá.
const SUPABASE_URL = 'https://zyqnjtfdbzdnsaujfkjf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FAMR1CdVpDZ_pPUaAxLGDg_yxjaaKxa';

const HEADERS = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

const ORDEN_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio'];

const LABELS_RELACION = {
    'padre-madre': 'Padres y madres',
    'familiar': 'Familiares (tíos, abuelos, hermanos...)',
    'amigo-aliado': 'Amigos y aliados',
    'ya-paso': 'Ya pasaron por el proceso',
};

const PALETA = [
    '#1E3A5F', '#2E86DE', '#48C9B0', '#F4B400', '#E67E22',
    '#C0392B', '#8E44AD', '#16A085', '#7F8C8D', '#3498DB',
];

function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchView(view, params = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${view}?select=*${params}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Error leyendo ${view}: ${res.status}`);
    return res.json();
}

function renderLeyenda(container, rows, colors, labelFn, key) {
    container.innerHTML = rows.map((r, i) => `
        <div class="stat-bar-row">
            <span class="stat-bar-swatch" style="background:${colors[i % colors.length]}"></span>
            <span class="stat-bar-label">${labelFn(r[key])}</span>
            <span class="stat-bar-count">${r.total}</span>
        </div>
    `).join('');
}

let ULTIMOS_DATOS = null;
const CHARTS = {};

if (window.Chart) {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#4B5563';
}

async function cargarEstadisticas() {
    const contentEl = document.getElementById('res-content');
    const timestampEl = document.getElementById('res-timestamp');

    try {
        const [totalRows, deptRows, relRows, mesRows] = await Promise.all([
            fetchView('stats_total'),
            fetchView('stats_departamento', '&order=total.desc'),
            fetchView('stats_relacion'),
            fetchView('stats_mes'),
        ]);

        const total = totalRows[0]?.total ?? 0;
        mesRows.sort((a, b) => ORDEN_MESES.indexOf(a.mes_nacimiento) - ORDEN_MESES.indexOf(b.mes_nacimiento));

        ULTIMOS_DATOS = { total, departamentos: deptRows, relaciones: relRows, meses: mesRows };

        contentEl.innerHTML = `
            <div class="res-total">
                <span class="num">${total}</span>
                <span class="label">registros verificados en el sitio</span>
            </div>

            <div class="res-block res-block--wide">
                <h2>Por departamento</h2>
                <div class="chart-wrap chart-wrap--donut"><canvas id="chart-departamento"></canvas></div>
                <div id="leyenda-departamento"></div>
            </div>

            <div class="res-block">
                <h2>Por relación con el tema</h2>
                <div class="chart-wrap chart-wrap--donut"><canvas id="chart-relacion"></canvas></div>
                <div id="leyenda-relacion"></div>
            </div>

            <div class="res-block res-block--wide">
                <h2>Por mes de nacimiento (afectados directos)</h2>
                <div class="chart-wrap chart-wrap--bar"><canvas id="chart-mes"></canvas></div>
            </div>

            <div class="res-download">
                <button class="btn btn-primary" id="btn-pdf">Descargar reporte en PDF</button>
            </div>

            <p class="res-disclaimer">
                Datos generados automáticamente a partir de registros verificados con Carnet de Identidad.
                Iniciativa ciudadana, sin filiación política. No representa al Ministerio de Educación.
            </p>
        `;

        dibujarGraficos(deptRows, relRows, mesRows);
        renderLeyenda(document.getElementById('leyenda-departamento'), deptRows, PALETA, v => v, 'departamento');
        renderLeyenda(document.getElementById('leyenda-relacion'), relRows, PALETA, v => LABELS_RELACION[v] || v, 'relacion');

        document.getElementById('btn-pdf').addEventListener('click', () => descargarPDF(ULTIMOS_DATOS));

        timestampEl.textContent = `Generado el ${new Date().toLocaleString('es-BO')}`;
    } catch (err) {
        console.error(err);
        contentEl.innerHTML = '<p class="res-error">No se pudieron cargar los datos. Revisa la conexión o vuelve a intentar en unos minutos.</p>';
    }
}

function dibujarGraficos(deptRows, relRows, mesRows) {
    CHARTS.departamento = new Chart(document.getElementById('chart-departamento'), {
        type: 'doughnut',
        data: {
            labels: deptRows.map(r => r.departamento),
            datasets: [{
                data: deptRows.map(r => r.total),
                backgroundColor: PALETA,
                borderColor: '#fff',
                borderWidth: 2,
            }],
        },
        options: {
            maintainAspectRatio: false,
            devicePixelRatio: 3,
            plugins: { legend: { display: false } },
        },
    });

    CHARTS.relacion = new Chart(document.getElementById('chart-relacion'), {
        type: 'doughnut',
        data: {
            labels: relRows.map(r => LABELS_RELACION[r.relacion] || r.relacion),
            datasets: [{
                data: relRows.map(r => r.total),
                backgroundColor: PALETA,
                borderColor: '#fff',
                borderWidth: 2,
            }],
        },
        options: {
            maintainAspectRatio: false,
            devicePixelRatio: 3,
            plugins: { legend: { display: false } },
        },
    });

    CHARTS.mes = new Chart(document.getElementById('chart-mes'), {
        type: 'bar',
        data: {
            labels: mesRows.map(r => capitalizar(r.mes_nacimiento)),
            datasets: [{
                data: mesRows.map(r => r.total),
                backgroundColor: '#2E86DE',
                borderRadius: 6,
                maxBarThickness: 56,
            }],
        },
        options: {
            maintainAspectRatio: false,
            devicePixelRatio: 3,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#F3F4F6' } },
                x: { grid: { display: false } },
            },
        },
    });
}

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function agregarEncabezadoPDF(doc, subtitulo) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 30, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Prekínder Bolivia 2027', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(210, 222, 235);
    doc.text(subtitulo, 14, 23);

    doc.setFontSize(8);
    doc.text(`Generado el ${new Date().toLocaleString('es-BO')}`, pageWidth - 14, 23, { align: 'right' });
}

function agregarPiePDF(doc, pagina, totalPaginas) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(229, 231, 235);
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Iniciativa ciudadana, sin filiación política. No representa al Ministerio de Educación.', 14, pageHeight - 12);
    doc.text(`Página ${pagina} de ${totalPaginas}`, pageWidth - 14, pageHeight - 12, { align: 'right' });
}

function tarjetaPDF(doc, x, y, w, h) {
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(250, 250, 251);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');
}

function tituloSeccionPDF(doc, texto, x, y) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 95);
    doc.text(texto, x, y);
}

function imagenAjustadaPDF(doc, chart, x, y, maxW, maxH) {
    const canvas = chart.canvas;
    const ratio = canvas.width / canvas.height;
    let w = maxW, h = maxW / ratio;
    if (h > maxH) {
        h = maxH;
        w = maxH * ratio;
    }
    doc.addImage(chart.toBase64Image(), 'PNG', x, y, w, h);
    return { w, h };
}

function listaConSwatchPDF(doc, x, yStart, rowH, rows, labelFn, rightX) {
    doc.setFontSize(9.5);
    let ly = yStart;
    rows.forEach((r, i) => {
        doc.setFillColor(...hexToRgb(PALETA[i % PALETA.length]));
        doc.rect(x, ly - 3.2, 3, 3, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(31, 41, 55);
        doc.text(labelFn(r), x + 6, ly, { maxWidth: rightX - x - 20 });
        doc.setFont('helvetica', 'bold');
        doc.text(String(r.total), rightX, ly, { align: 'right' });
        ly += rowH;
    });
}

function descargarPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margenX = 14;
    const anchoContenido = pageWidth - margenX * 2;

    // ---------- Página 1 ----------
    agregarEncabezadoPDF(doc, 'Reporte de registros verificados');

    let y = 40;
    tarjetaPDF(doc, margenX, y, anchoContenido, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(30, 58, 95);
    doc.text(String(data.total), pageWidth / 2, y + 17, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text('registros verificados en el sitio', pageWidth / 2, y + 25, { align: 'center' });

    y += 42;

    const cardDeptoH = 88;
    tarjetaPDF(doc, margenX, y, anchoContenido, cardDeptoH);
    tituloSeccionPDF(doc, 'Por departamento', margenX + 6, y + 11);

    if (CHARTS.departamento) {
        const imgY = y + 16;
        const { w: imgW, h: imgH } = imagenAjustadaPDF(doc, CHARTS.departamento, margenX + 6, imgY, 62, 62);

        const listX = margenX + 6 + imgW + 16;
        const rowH = 6.4;
        const listStartY = imgY + Math.max(0, (imgH - data.departamentos.length * rowH) / 2) + 4;
        listaConSwatchPDF(doc, listX, listStartY, rowH, data.departamentos, d => d.departamento, pageWidth - margenX - 6);
    }

    agregarPiePDF(doc, 1, 2);

    // ---------- Página 2 ----------
    doc.addPage();
    agregarEncabezadoPDF(doc, 'Detalle por relación con el tema y por mes de nacimiento');
    y = 40;

    const cardRelH = 74;
    tarjetaPDF(doc, margenX, y, anchoContenido, cardRelH);
    tituloSeccionPDF(doc, 'Por relación con el tema', margenX + 6, y + 11);

    if (CHARTS.relacion) {
        const imgY = y + 14;
        const { w: imgW, h: imgH } = imagenAjustadaPDF(doc, CHARTS.relacion, margenX + 6, imgY, 52, 52);

        const listX = margenX + 6 + imgW + 16;
        const rowH = 8.5;
        const listStartY = imgY + Math.max(0, (imgH - data.relaciones.length * rowH) / 2) + 4;
        listaConSwatchPDF(doc, listX, listStartY, rowH, data.relaciones, r => LABELS_RELACION[r.relacion] || r.relacion, pageWidth - margenX - 6);
    }

    y += cardRelH + 10;

    const cardMesH = 92;
    tarjetaPDF(doc, margenX, y, anchoContenido, cardMesH);
    tituloSeccionPDF(doc, 'Por mes de nacimiento (afectados directos)', margenX + 6, y + 11);

    if (CHARTS.mes) {
        imagenAjustadaPDF(doc, CHARTS.mes, margenX + 6, y + 16, anchoContenido - 12, 70);
    }

    agregarPiePDF(doc, 2, 2);

    doc.save('reporte-prekinder-bolivia-2027.pdf');
}

document.addEventListener('DOMContentLoaded', cargarEstadisticas);
