const tablaBody = document.querySelector('#tabla-partidos tbody');
const ligaSelect = document.getElementById('liga-select');
const modal = document.getElementById('modal-partido');
const ctx = document.getElementById('ev-chart').getContext('2d');
let evChart;

ligaSelect.addEventListener('change', () => cargarPartidos(ligaSelect.value));

tablaBody.addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const id = row.dataset.idpartido;
    const res = await fetch(`/api/predictions/${id}`);
    const partido = await res.json();

    modal.innerHTML = `
<h2>${partido.local} vs ${partido.visitante}</h2>
<p>Prob. local: ${(partido.probabilidad_local*100).toFixed(1)}%</p>
<p>Prob. empate: ${(partido.probabilidad_empate*100).toFixed(1)}%</p>
<p>Prob. visitante: ${(partido.probabilidad_visitante*100).toFixed(1)}%</p>
<p>EV local: ${partido.ev_local.toFixed(2)}</p>
<p>EV empate: ${partido.ev_empate.toFixed(2)}</p>
<p>EV visitante: ${partido.ev_visitante.toFixed(2)}</p>
<hr>
<p>BTTS (ambos anotan): ${partido.btts}</p>
<p>Goles más/menos 2.5: ${partido.goles25}</p>
<p>Goles más/menos 1.5: ${partido.goles15}</p>
`;
    modal.style.display = 'block';

    if(evChart) evChart.destroy();
    evChart = new Chart(ctx,{
        type:'bar',
        data:{
            labels:[partido.local,'Empate',partido.visitante],
            datasets:[{
                label:'EV',
                data:[partido.ev_local,partido.ev_empate,partido.ev_visitante],
                backgroundColor:['#4caf50','#ffc107','#f44336']
            }]
        },
        options:{scales:{y:{beginAtZero:true}}}
    });
});

async function cargarPartidos(filtro='todas'){
    const res = await fetch('/api/predictions');
    let partidos = await res.json();
    if(filtro !== 'todas') partidos = partidos.filter(p => p.liga === filtro);

    tablaBody.innerHTML = '';
    partidos.forEach(p => {
        const row = document.createElement('tr');
        row.dataset.idpartido = p.idpartido;
        row.innerHTML = `
<td>${new Date(p.fecha).toLocaleString()}</td>
<td>${p.local} vs ${p.visitante}</td>
<td>${(p.probabilidad_local*100).toFixed(1)}%</td>
<td>${(p.probabilidad_empate*100).toFixed(1)}%</td>
<td>${(p.probabilidad_visitante*100).toFixed(1)}%</td>
<td>${p.cuotas_local.toFixed(2)}</td>
<td>${p.cuotas_empate.toFixed(2)}</td>
<td>${p.cuotas_visitante.toFixed(2)}</td>
<td class="${p.ev_local>0?'positivo':'negativo'}">${p.ev_local.toFixed(2)}</td>
<td class="${p.ev_empate>0?'positivo':'negativo'}">${p.ev_empate.toFixed(2)}</td>
<td class="${p.ev_visitante>0?'positivo':'negativo'}">${p.ev_visitante.toFixed(2)}</td>
<td>${p.btts}</td>
<td>${p.goles25}</td>
<td>${p.goles15}</td>
`;
        tablaBody.appendChild(row);
    });
}

cargarPartidos();