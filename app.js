const tableBody=document.querySelector('#matches-table tbody');
const leagueSelect=document.getElementById('league-select');
const modal=document.getElementById('prediction-modal');
const ctx=document.getElementById('ev-chart').getContext('2d');
let evChart;

leagueSelect.addEventListener('change',()=>loadMatches(leagueSelect.value));

tableBody.addEventListener('click',async(e)=>{
    const row=e.target.closest('tr');
    if(!row)return;
    const matchId=row.dataset.matchid;
    const res=await fetch(`/api/predictions/${matchId}`);
    const match=await res.json();
    modal.innerHTML=`
<h2>${match.home} vs ${match.away}</h2>
<p>prob home: ${(match.probabilityhome*100).toFixed(1)}%</p>
<p>prob draw: ${(match.probabilitydraw*100).toFixed(1)}%</p>
<p>prob away: ${(match.probabilityaway*100).toFixed(1)}%</p>
<p>ev home: ${match.evhome.toFixed(2)}</p>
<p>ev draw: ${match.evdraw.toFixed(2)}</p>
<p>ev away: ${match.evaway.toFixed(2)}</p>
<hr>
<p>btts (ambos anotan): ${match.btts}</p>
<p>goles más/menos 2.5: ${match.goles25}</p>
<p>goles más/menos 1.5: ${match.goles15}</p>
`;
    modal.style.display='block';

    if(evChart) evChart.destroy();
    evChart=new Chart(ctx,{
        type:'bar',
        data:{
            labels:[match.home,'empate',match.away],
            datasets:[{
                label:'EV',
                data:[match.evhome,match.evdraw,match.evaway],
                backgroundColor:['#4caf50','#ffc107','#f44336']
            }]
        },
        options:{scales:{y:{beginAtZero:true}}}
    });
});

async function loadMatches(filterLeague='all'){
    const res=await fetch('/api/predictions');
    let matches=await res.json();
    if(filterLeague!=='all') matches=matches.filter(m=>m.league==filterLeague);

    tableBody.innerHTML='';
    matches.forEach(match=>{
        const row=document.createElement('tr');
        row.dataset.matchid=match.matchid;
        row.innerHTML=`
<td>${new Date(match.date).toLocaleString()}</td>
<td>${match.home} vs ${match.away}</td>
<td>${(match.probabilityhome*100).toFixed(1)}%</td>
<td>${(match.probabilitydraw*100).toFixed(1)}%</td>
<td>${(match.probabilityaway*100).toFixed(1)}%</td>
<td>${match.oddshome.toFixed(2)}</td>
<td>${match.oddsdraw.toFixed(2)}</td>
<td>${match.oddsaway.toFixed(2)}</td>
<td class="${match.evhome>0?'ev-positive':'ev-negative'}">${match.evhome.toFixed(2)}</td>
<td class="${match.evdraw>0?'ev-positive':'ev-negative'}">${match.evdraw.toFixed(2)}</td>
<td class="${match.evaway>0?'ev-positive':'ev-negative'}">${match.evaway.toFixed(2)}</td>
<td>${match.btts}</td>
<td>${match.goles25}</td>
<td>${match.goles15}</td>
`;
        tableBody.appendChild(row);
    });
}

loadMatches();