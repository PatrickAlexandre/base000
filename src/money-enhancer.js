const MONEY_KEY='patouMoneySettings'

function moneyData(){try{return JSON.parse(localStorage.getItem(MONEY_KEY))||{}}catch{return {}}}
function euro(value){return `${Math.round(Number(value)||0).toLocaleString('fr-FR')} €`}
function numberFrom(root,name){return Math.max(0,Number(root.querySelector(`[name="${name}"]`)?.value)||0)}

function moneyMarkup(){
  const saved=moneyData()
  return `<div class="money-backdrop" data-money-modal><section class="money-panel" role="dialog" aria-modal="true" aria-labelledby="money-title">
    <header><div><span class="money-signal">ARGENT // TABLEAU DE BORD</span><h2 id="money-title">Piloter ses finances</h2><p>Un module simple pour comprendre où va ton argent et construire une marge de sécurité. Les données restent uniquement dans ton navigateur.</p></div><button class="money-close" aria-label="Fermer">×</button></header>
    <div class="money-grid">
      <section class="money-form-card"><h3>Flux mensuels</h3><div class="money-form">
        <label>Revenus nets mensuels<input name="income" type="number" min="0" step="10" value="${saved.income||''}" placeholder="2000"><span>€</span></label>
        <label>Charges fixes<input name="fixed" type="number" min="0" step="10" value="${saved.fixed||''}" placeholder="900"><span>€</span></label>
        <label>Dépenses variables<input name="variable" type="number" min="0" step="10" value="${saved.variable||''}" placeholder="500"><span>€</span></label>
        <label>Remboursements de dettes<input name="debt" type="number" min="0" step="10" value="${saved.debt||''}" placeholder="150"><span>€</span></label>
        <label>Épargne mensuelle visée<input name="saving" type="number" min="0" step="10" value="${saved.saving||''}" placeholder="250"><span>€</span></label>
        <label>Fonds d’urgence actuel<input name="emergency" type="number" min="0" step="50" value="${saved.emergency||''}" placeholder="3000"><span>€</span></label>
      </div></section>
      <section class="money-results"><article><small>RESTE APRÈS DÉPENSES</small><strong data-money-left>—</strong><p>Revenus − charges − dépenses − dettes.</p></article><article><small>APRÈS ÉPARGNE VISÉE</small><strong data-money-after>—</strong><p>La marge réellement disponible à la fin du mois.</p></article><article><small>TAUX D’ÉPARGNE VISÉ</small><strong data-money-rate>—</strong><p>Épargne visée rapportée aux revenus nets.</p></article><article><small>COUVERTURE D’URGENCE</small><strong data-money-months>—</strong><p>Nombre de mois de charges essentielles couvertes.</p></article></section>
    </div>
    <div class="money-foundations"><h3>Les bases à maîtriser</h3><div class="money-foundation-grid">
      <article><b>1 · Budget</b><p>Savoir ce qui entre, ce qui sort et distinguer fixe, variable et exceptionnel.</p></article><article><b>2 · Sécurité</b><p>Construire progressivement un fonds d’urgence adapté à ses dépenses essentielles.</p></article><article><b>3 · Dettes</b><p>Connaître taux, mensualités, coût total et prioriser les dettes les plus coûteuses.</p></article><article><b>4 · Administratif</b><p>Comprendre impôts, assurances, abonnements, contrats, factures et échéances.</p></article><article><b>5 · Épargne & projets</b><p>Donner un objectif et un horizon à l’argent mis de côté avant de chercher du rendement.</p></article><article><b>6 · Risque</b><p>Ne pas confondre rendement potentiel et certitude ; diversifier plutôt que tout concentrer.</p></article>
    </div></div><small class="money-note">Outil pédagogique général : il ne remplace pas un conseil financier, fiscal ou juridique personnalisé.</small>
  </section></div>`
}

function closeMoney(){document.querySelector('[data-money-modal]')?.remove()}
function recalcMoney(){
  const root=document.querySelector('[data-money-modal]');if(!root)return
  const income=numberFrom(root,'income'),fixed=numberFrom(root,'fixed'),variable=numberFrom(root,'variable'),debt=numberFrom(root,'debt'),saving=numberFrom(root,'saving'),emergency=numberFrom(root,'emergency')
  const left=income-fixed-variable-debt,after=left-saving,rate=income?saving/income*100:0,essential=fixed+debt+variable*.5,months=essential?emergency/essential:0
  root.querySelector('[data-money-left]').textContent=euro(left)
  root.querySelector('[data-money-after]').textContent=euro(after)
  root.querySelector('[data-money-rate]').textContent=`${rate.toFixed(1)} %`
  root.querySelector('[data-money-months]').textContent=`${months.toFixed(1)} mois`
  const data={};root.querySelectorAll('.money-form input').forEach(input=>data[input.name]=input.value);localStorage.setItem(MONEY_KEY,JSON.stringify(data))
}
function openMoney(){closeMoney();document.body.insertAdjacentHTML('beforeend',moneyMarkup());const modal=document.querySelector('[data-money-modal]');modal.querySelector('.money-close')?.addEventListener('click',closeMoney);modal.addEventListener('click',e=>{if(e.target===modal)closeMoney()});modal.querySelectorAll('input').forEach(input=>input.addEventListener('input',recalcMoney));recalcMoney()}
function installMoneyAction(){const bar=document.querySelector('.npc-actionbar');if(!bar||bar.querySelector('[data-money-action]'))return;const button=document.createElement('button');button.type='button';button.dataset.moneyAction='true';button.title='Argent';button.innerHTML='<span class="money-action-icon" aria-hidden="true">💶</span><small>A</small><span class="action-label">Argent</span>';button.addEventListener('click',e=>{e.stopPropagation();openMoney()});bar.appendChild(button)}
const moneyObserver=new MutationObserver(installMoneyAction);moneyObserver.observe(document.documentElement,{childList:true,subtree:true});installMoneyAction();document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMoney()})
