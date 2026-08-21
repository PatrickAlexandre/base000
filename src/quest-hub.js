const QUEST_STATE_KEY='patouQuestState'
const PROFILE_KEY='patouGameProfile'
const SUBSCRIPTION_KEY='patouGameSubscription'
const MONEY_KEY='patouMoneySettings'
const CALORIE_KEY='patouCalorieSettings'
const PLAN_ORDER=['Gratuit','Starter Pack','Premium','VIP','Challenger']

const CLASS_PROFILES={
  INTJ:{name:'Architecte',color:'#6d5dfc',focus:'structure',mission:'Choisis un système réel qui te ralentit et réduis-le à trois règles simples.'},
  INTP:{name:'Cryptologue',color:'#8b5cf6',focus:'analyse',mission:'Prends une anomalie de ton quotidien et trouve une explication vérifiable.'},
  ENTJ:{name:'Commandant',color:'#ef4444',focus:'leadership',mission:'Fais avancer un projet bloqué en définissant la prochaine décision concrète.'},
  ENTP:{name:'Inventeur',color:'#f97316',focus:'expérience',mission:'Teste une manière différente de résoudre un petit problème réel aujourd’hui.'},
  INFJ:{name:'Oracle',color:'#14b8a6',focus:'sens',mission:'Observe une situation humaine et note ce qui semble important mais n’est jamais dit.'},
  INFP:{name:'Pèlerin',color:'#22c55e',focus:'valeurs',mission:'Fais une action concrète qui rapproche ta journée de ce que tu considères important.'},
  ENFJ:{name:'Guide',color:'#06b6d4',focus:'alliance',mission:'Aide une personne à faire un pas concret sur quelque chose qu’elle repousse.'},
  ENFP:{name:'Éclaireur',color:'#eab308',focus:'découverte',mission:'Sors de ta routine et explore un lieu, une idée ou une piste que tu ne connais pas.'},
  ISTJ:{name:'Gardien',color:'#64748b',focus:'fiabilité',mission:'Sécurise une chose importante : document, sauvegarde, échéance ou information.'},
  ISFJ:{name:'Veilleur',color:'#0ea5e9',focus:'soutien',mission:'Repère un besoin discret autour de toi et règle-le sans attendre qu’on te le demande.'},
  ESTJ:{name:'Magistrat',color:'#b45309',focus:'ordre',mission:'Remets de l’ordre dans une zone, une tâche ou une procédure qui crée du chaos.'},
  ESFJ:{name:'Héraut',color:'#ec4899',focus:'communauté',mission:'Renforce un lien réel : prends des nouvelles, remercie ou organise un moment utile.'},
  ISTP:{name:'Artisan',color:'#78716c',focus:'mécanique',mission:'Répare, améliore ou comprends le fonctionnement d’un objet que tu utilises souvent.'},
  ISFP:{name:'Alchimiste',color:'#10b981',focus:'création',mission:'Transforme quelque chose de banal en trace concrète : image, objet, texte ou composition.'},
  ESTP:{name:'Pionnier',color:'#dc2626',focus:'action',mission:'Choisis un obstacle court et traite-le immédiatement au lieu de le planifier.'},
  ESFP:{name:'Barde',color:'#f43f5e',focus:'récit',mission:'Crée un moment mémorable dans le monde réel et garde-en une trace.'}
}

const SECONDARY_POOL=[
  {key:'money',icon:'💶',category:'Autonomie',title:'Regarde tes flux',text:'Passe deux minutes à vérifier où va ton argent ce mois-ci.',module:'Argent',cta:'Ouvrir Argent'},
  {key:'calories',icon:'🔥',category:'Énergie',title:'Connais ton carburant',text:'Vérifie ton estimation énergétique et compare-la à ta journée réelle.',module:'Calories',cta:'Ouvrir Calories'},
  {key:'social',icon:'◎',category:'Réseau',title:'Réactive un lien',text:'Choisis une personne de ton réseau et fais une interaction utile, pas seulement un like.',module:'Social',cta:'Voir le réseau'},
  {key:'chef',icon:'🍲',category:'Autonomie',title:'Prépare quelque chose',text:'Prépare ou planifie un repas simple au lieu de déléguer automatiquement la décision.',module:'Chef Cuisinier',cta:'Voir Marcel'},
  {key:'gardener',icon:'🌱',category:'Extérieur',title:'Inspecte ton terrain',text:'Observe un espace extérieur et identifie une amélioration d’entretien ou d’aménagement.',module:'Jardinier',cta:'Voir Jean-Michel'},
  {key:'repair',icon:'🛠',category:'Maintenance',title:'Diagnostique avant de jeter',text:'Choisis un appareil qui pose problème et formule précisément le symptôme.',module:'Réparateur',cta:'Voir Kevin'},
  {key:'florist',icon:'✿',category:'Relation',title:'Fais un geste tangible',text:'Pense à une personne à qui un petit geste concret ferait réellement plaisir.',module:'Fleuriste',cta:'Voir Fleurine'},
  {key:'outside',icon:'↗',category:'Monde réel',title:'Quitte l’interface',text:'Marche dix minutes sans contenu dans les oreilles et remarque trois détails nouveaux.',module:null,cta:'Mission extérieure'}
]

const ARG_SIGNALS=[
  'Un élément de ton interface n’est peut-être pas décoratif. Regarde les répétitions.',
  'Le système se souvient davantage de ce que tu accomplis que de ce que tu consultes.',
  'Certains accès apparaissent après une transformation, pas après un clic.',
  'Le prochain indice peut être une absence plutôt qu’un message.',
  'Deux joueurs ayant le même rang ne voient pas nécessairement la même route.'
]

function readJson(key,fallback={}){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function writeState(state){localStorage.setItem(QUEST_STATE_KEY,JSON.stringify(state))}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function dayKey(){const d=new Date();const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function planUnlocked(plan,target){return PLAN_ORDER.indexOf(plan)>=PLAN_ORDER.indexOf(target)}
function moneyConfigured(){const d=readJson(MONEY_KEY);return Number(d.income)>0&&Number(d.fixed)>=0}
function caloriesConfigured(){const d=readJson(CALORIE_KEY);return Number(d.weight)>0&&Number(d.height)>0}
function context(){
  const profile=readJson(PROFILE_KEY,null)||{}
  const plan=localStorage.getItem(SUBSCRIPTION_KEY)||'Gratuit'
  const state=readJson(QUEST_STATE_KEY,{completed:{},totalCompleted:0,traces:0})
  const classCode=profile.mbtiClass||profile.classCode||''
  return {profile,plan,state,classCode,classInfo:CLASS_PROFILES[classCode]||null,today:dayKey(),vip:planUnlocked(plan,'VIP'),moneyReady:moneyConfigured(),caloriesReady:caloriesConfigured()}
}
function completedToday(ctx){return ctx.state.completed?.[ctx.today]||{}}
function questDone(ctx,id){return Boolean(completedToday(ctx)[id])}

function dailyQuests(ctx){
  const seed=`${ctx.today}|${ctx.classCode}|${ctx.plan}|${Math.floor((ctx.state.totalCompleted||0)/4)}`
  let main
  if(!ctx.moneyReady){main={key:'setup-money',icon:'💶',category:'QUÊTE PRINCIPALE · AUTONOMIE',title:'Donne une carte à ton argent',text:'Renseigne tes flux mensuels. Le but n’est pas d’optimiser chaque euro : commence par rendre la situation visible.',module:'Argent',cta:'Ouvrir Argent'}}
  else if(!ctx.caloriesReady){main={key:'setup-energy',icon:'🔥',category:'QUÊTE PRINCIPALE · ÉNERGIE',title:'Établis ton point de départ',text:'Renseigne taille, poids et activité afin d’obtenir une estimation énergétique de référence.',module:'Calories',cta:'Ouvrir Calories'}}
  else if(ctx.classInfo){main={key:`class-${ctx.classCode}`,icon:'◆',category:`QUÊTE PRINCIPALE · ${ctx.classInfo.name.toUpperCase()}`,title:`Agis comme un ${ctx.classInfo.name}`,text:ctx.classInfo.mission,module:null,cta:'Faire dans le monde réel',color:ctx.classInfo.color}}
  else{main={key:'main-real',icon:'◇',category:'QUÊTE PRINCIPALE · MONDE RÉEL',title:'Supprime un point de friction',text:'Choisis une chose petite mais pénible que tu repousses depuis plusieurs jours et règle-la complètement.',module:null,cta:'Faire dans le monde réel'}}
  main.id=`${ctx.today}:main:${main.key}`

  let pool=SECONDARY_POOL.filter(q=>q.key!=='money'||ctx.moneyReady).filter(q=>q.key!=='calories'||ctx.caloriesReady)
  if(ctx.vip)pool=[...pool,{key:'formation',icon:'🎓',category:'Formation',title:'Apprends quelque chose d’utilisable',text:'Choisis une compétence pratique que tu pourrais employer cette semaine et approfondis-la.',module:'Formation',cta:'Ouvrir Formation'}]
  const ordered=[...pool].sort((a,b)=>hash(`${seed}|${a.key}`)-hash(`${seed}|${b.key}`))
  const secondaries=ordered.slice(0,3).map((q,index)=>({...q,id:`${ctx.today}:side:${index}:${q.key}`}))
  return [main,...secondaries]
}

function trajectory(ctx){
  const n=Number(ctx.state.totalCompleted)||0
  if(n>=30&&ctx.vip)return {index:3,name:'Accès',note:'Le système commence à ouvrir des couches qui ne sont pas proposées à tout le monde.'}
  if(n>=16)return {index:2,name:'Utilité',note:'Ta progression commence à compter par ce que tu peux réellement résoudre ou apporter.'}
  if(n>=7)return {index:1,name:'Réputation',note:'Tes actions répétées commencent à former une identité observable.'}
  return {index:0,name:'Progression',note:'Construis d’abord des preuves d’action. Le statut vient après.'}
}

function liveEntries(ctx){
  const entries=[]
  if(ctx.classInfo)entries.push(`<li><b style="color:${ctx.classInfo.color}">${escapeHtml(ctx.classInfo.name)}</b><span>La route du jour tient compte de ton archétype.</span></li>`)
  else entries.push('<li><b>Sans classe</b><span>Les quêtes restent généralistes tant que tu ne choisis pas d’archétype.</span></li>')
  entries.push(`<li><b>Argent</b><span>${ctx.moneyReady?'Carte financière initialisée.':'Données encore inconnues : le système privilégie cette étape.'}</span></li>`)
  entries.push(`<li><b>Formation</b><span>${ctx.vip?'Accès VIP actif.':'Signal verrouillé · accès à partir de VIP.'}</span></li>`)
  return entries.join('')
}

function anomaly(ctx){
  const signalHash=hash(`${ctx.today}|${ctx.classCode}|ARG|${ctx.state.totalCompleted||0}`)
  if((ctx.state.totalCompleted||0)<3||signalHash%5>1)return ''
  const text=ARG_SIGNALS[signalHash%ARG_SIGNALS.length]
  return `<article class="quest-anomaly"><span>ANOMALIE // ${String(signalHash%33+1).padStart(2,'0')}</span><p>${escapeHtml(text)}</p></article>`
}

function questCard(q,ctx,main=false){
  const done=questDone(ctx,q.id)
  const color=q.color||'#7dd3fc'
  return `<article class="${main?'daily-main-quest':'daily-side-quest'} ${done?'is-done':''}" data-quest-id="${escapeHtml(q.id)}" style="--quest-color:${color}">
    <div class="quest-card-head"><span class="quest-card-icon">${q.icon}</span><div><small>${escapeHtml(q.category)}</small><h${main?'1':'3'}>${escapeHtml(q.title)}</h${main?'1':'3'}></div>${done?'<b class="quest-complete-mark">✓</b>':''}</div>
    <p>${escapeHtml(q.text)}</p>
    <div class="quest-card-actions">${q.module&&!done?`<button class="quest-tool" data-quest-module="${escapeHtml(q.module)}">${escapeHtml(q.cta)}</button>`:''}${!done?`<button class="quest-done" data-complete-quest="${escapeHtml(q.id)}">Marquer accomplie</button>`:'<span class="quest-done-copy">Action enregistrée</span>'}</div>
  </article>`
}

function hubMarkup(ctx){
  const quests=dailyQuests(ctx)
  const doneCount=quests.filter(q=>questDone(ctx,q.id)).length
  const allDone=doneCount===quests.length
  const path=trajectory(ctx)
  const firstName=escapeHtml(ctx.profile.firstName||'joueur')
  const stages=['Progression','Réputation','Utilité','Accès']
  return `<div class="daily-quest-hub" data-quest-hub>
    <header class="quest-hub-header"><div><span class="quest-hub-signal">JOURNAL VIVANT // ${escapeHtml(ctx.today)}</span><h2>${allDone?'Le système n’a plus rien à te demander aujourd’hui.':`Ta prochaine action, ${firstName}.`}</h2><p>${allDone?'Tu as terminé les quatre missions du jour. Il n’y a pas de récompense à rester ici : retourne dans le monde réel.':'Une priorité, trois possibilités. Tu peux consulter les outils, mais la progression vient de ce que tu fais hors de cette interface.'}</p></div><div class="quest-day-score"><strong>${doneCount}/4</strong><span>missions aujourd’hui</span></div></header>
    <div class="quest-hub-grid">
      <section class="quest-main-column">${questCard(quests[0],ctx,true)}<div class="quest-secondary-title"><span>MISSIONS SECONDAIRES</span><b>Choisis ou ignore. Rien n’expire en te punissant.</b></div><div class="daily-side-grid">${quests.slice(1).map(q=>questCard(q,ctx)).join('')}</div></section>
      <aside class="quest-live-column"><section class="quest-live-card"><div class="quest-live-title"><span>ÉTAT DU SYSTÈME</span><b>${path.name}</b></div><ul>${liveEntries(ctx)}</ul></section>
        <section class="quest-trajectory"><span>TRAJECTOIRE</span><div>${stages.map((stage,index)=>`<i class="${index<=path.index?'active':''} ${index===path.index?'current':''}"><b>${index+1}</b><small>${stage}</small></i>`).join('')}</div><p>${escapeHtml(path.note)}</p><small>${Number(ctx.state.totalCompleted)||0} actions enregistrées au total · aucune série quotidienne à préserver.</small></section>
        ${anomaly(ctx)}
        <button class="quest-open-journal" data-quest-module="Quêtes">Ouvrir le Journal des quêtes</button>
      </aside>
    </div>
  </div>`
}

function findAction(title){return [...document.querySelectorAll('.npc-actionbar button')].find(button=>button.title===title||button.querySelector('.action-label')?.textContent.trim()===title)}
function openModule(title){
  let button=null
  if(title==='Argent')button=document.querySelector('[data-money-action]')
  else if(title==='Formation')button=document.querySelector('[data-formation-action]')
  else button=findAction(title)
  if(button&&button.getAttribute('aria-disabled')!=='true'){button.click();return true}
  return false
}
function completeQuest(id){
  const ctx=context();const quests=dailyQuests(ctx);const quest=quests.find(q=>q.id===id);if(!quest||questDone(ctx,id))return
  const state=ctx.state||{};state.completed=state.completed||{};state.completed[ctx.today]=state.completed[ctx.today]||{};state.completed[ctx.today][id]=new Date().toISOString();state.totalCompleted=(Number(state.totalCompleted)||0)+1;state.traces=(Number(state.traces)||0)+(id.includes(':main:')?3:1);state.lastCompleted=id;writeState(state);renderHub()
}
function bindHub(root){
  root.querySelectorAll('[data-quest-module]').forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();openModule(button.dataset.questModule)}))
  root.querySelectorAll('[data-complete-quest]').forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();completeQuest(button.dataset.completeQuest)}))
}
function installHub(){
  const world=document.querySelector('.game-screen .world');if(!world)return
  world.classList.add('quest-hub-active');world.querySelector('.world-copy')?.classList.add('quest-hub-original-hidden')
  if(world.querySelector('[data-quest-hub]'))return
  world.insertAdjacentHTML('beforeend',hubMarkup(context()));bindHub(world.querySelector('[data-quest-hub]'))
}
function renderHub(){
  const world=document.querySelector('.game-screen .world');if(!world)return
  world.querySelector('[data-quest-hub]')?.remove();world.classList.add('quest-hub-active');world.querySelector('.world-copy')?.classList.add('quest-hub-original-hidden');world.insertAdjacentHTML('beforeend',hubMarkup(context()));bindHub(world.querySelector('[data-quest-hub]'));syncJournal()
}
function syncJournal(){
  const panel=[...document.querySelectorAll('.center-panel')].find(item=>item.querySelector('h2')?.textContent.trim()==='Journal des quêtes');if(!panel||panel.querySelector('[data-daily-quest-summary]'))return
  const ctx=context();const quests=dailyQuests(ctx);const rows=quests.map(q=>`<li class="${questDone(ctx,q.id)?'done':''}"><span>${q.icon}</span><div><b>${escapeHtml(q.title)}</b><small>${questDone(ctx,q.id)?'Accomplie aujourd’hui':escapeHtml(q.category.replace('QUÊTE PRINCIPALE · ',''))}</small></div></li>`).join('')
  panel.insertAdjacentHTML('beforeend',`<section class="daily-journal-sync" data-daily-quest-summary><span>MISSIONS DU JOUR // ${escapeHtml(ctx.today)}</span><ul>${rows}</ul></section>`)
}

const questObserver=new MutationObserver(()=>{installHub();syncJournal()})
questObserver.observe(document.documentElement,{childList:true,subtree:true})
installHub()
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHub()})
window.addEventListener('storage',event=>{if([QUEST_STATE_KEY,PROFILE_KEY,SUBSCRIPTION_KEY,MONEY_KEY,CALORIE_KEY].includes(event.key))renderHub()})
