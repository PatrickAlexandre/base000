import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChessRook, faCompass, faEye, faFeatherPointed, faCrown, faLightbulb,
  faWandMagicSparkles, faMasksTheater, faShieldHalved, faScrewdriverWrench,
  faHeart, faPalette, faGavel, faHammer, faPeopleGroup, faMusic, faUtensils,
  faLock, faCircleNodes, faRankingStar
} from '@fortawesome/free-solid-svg-icons'

const STORAGE_KEY = 'patouGameProfile'
const SUB_KEY = 'patouGameSubscription'
const WB = 'https://api.worldbank.org/v2'
const BASE = import.meta.env.BASE_URL

const PLAN_ORDER = ['Gratuit', 'Starter Pack', 'Premium', 'VIP', 'Challenger']
const PLANS = [
  { name: 'Gratuit', price: '0 €', tag: 'Découverte', image: `${BASE}assets/plans/free.webp`, headline: 'Entre dans le signal', cta: 'Commencer gratuitement', features: ['Accès au cœur de l’expérience', 'Profil local et progression de base', 'Premiers fragments du système'] },
  { name: 'Starter Pack', price: '2,99 € / mois', tag: 'Initiation', image: `${BASE}assets/plans/starter.webp`, headline: 'Le monde commence à répondre', cta: 'Choisir Starter Pack', features: ['Tout le contenu Gratuit', 'Plus de personnalisation visuelle', 'Bonus de démarrage et confort de jeu'] },
  { name: 'Premium', price: '9,99 € / mois', tag: 'Accès', image: `${BASE}assets/plans/premium.webp`, featured: true, headline: 'Ouvre les couches cachées', cta: 'Passer à Premium', features: ['Tout le Starter Pack', 'Modification date de naissance, sexe et pays', 'Avantages Premium et futures ramifications'] },
  { name: 'VIP', price: '19,99 € / mois', tag: 'Cercle intérieur', image: `${BASE}assets/plans/vip.webp`, headline: 'Approche du noyau', cta: 'Devenir VIP', features: ['Tout le Premium', 'Avantages VIP et priorités', 'Accès aux signes de prestige avancés'] },
  { name: 'Challenger', price: '34,99 € / mois', tag: '0,001%', image: `${BASE}assets/plans/challenger.webp`, headline: 'Le dernier palier ne compte que 33 noms', cta: 'Viser Challenger', features: ['Tout le VIP', 'Palier de prestige maximal', 'Éligibilité au Registre des 33 de chaque cycle mensuel'] }
]

const MBTI_CLASSES = [
  { type:'INTJ', name:'Architecte', color:'#6d5dfc', icon:faChessRook, mission:'Déceler l’architecture invisible derrière les événements.' },
  { type:'INTP', name:'Cryptologue', color:'#8b5cf6', icon:faCircleNodes, mission:'Relier les anomalies et résoudre ce que personne ne remarque.' },
  { type:'ENTJ', name:'Commandant', color:'#ef4444', icon:faCrown, mission:'Transformer une vision en campagne et rallier les autres.' },
  { type:'ENTP', name:'Inventeur', color:'#f97316', icon:faLightbulb, mission:'Tester les limites du système et provoquer de nouvelles voies.' },
  { type:'INFJ', name:'Oracle', color:'#14b8a6', icon:faEye, mission:'Lire les motifs humains cachés et guider sans imposer.' },
  { type:'INFP', name:'Pèlerin', color:'#22c55e', icon:faFeatherPointed, mission:'Protéger le sens de la quête et les choix qui définissent le joueur.' },
  { type:'ENFJ', name:'Guide', color:'#06b6d4', icon:faCompass, mission:'Créer des alliances et faire progresser un groupe entier.' },
  { type:'ENFP', name:'Éclaireur', color:'#eab308', icon:faWandMagicSparkles, mission:'Suivre les pistes improbables et ouvrir des chemins inattendus.' },
  { type:'ISTJ', name:'Gardien', color:'#64748b', icon:faShieldHalved, mission:'Préserver les preuves, les règles et la mémoire du monde.' },
  { type:'ISFJ', name:'Veilleur', color:'#0ea5e9', icon:faHeart, mission:'Repérer les besoins silencieux et maintenir le groupe debout.' },
  { type:'ESTJ', name:'Magistrat', color:'#b45309', icon:faGavel, mission:'Mettre de l’ordre dans le chaos et faire tenir les structures.' },
  { type:'ESFJ', name:'Héraut', color:'#ec4899', icon:faPeopleGroup, mission:'Créer du lien et transformer les rencontres en communauté.' },
  { type:'ISTP', name:'Artisan', color:'#78716c', icon:faScrewdriverWrench, mission:'Comprendre les mécanismes par l’action et réparer ce qui casse.' },
  { type:'ISFP', name:'Alchimiste', color:'#10b981', icon:faPalette, mission:'Transformer l’expérience en créations, symboles et traces.' },
  { type:'ESTP', name:'Pionnier', color:'#dc2626', icon:faHammer, mission:'Agir au bon moment et franchir les obstacles avant les autres.' },
  { type:'ESFP', name:'Barde', color:'#f43f5e', icon:faMusic, mission:'Faire vivre l’aventure et convertir les moments en récits.' }
]

function getStoredProfile(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null} }
function getStoredPlan(){ return localStorage.getItem(SUB_KEY)||'Gratuit' }
function premiumEdit(plan){ return PLAN_ORDER.indexOf(plan)>=2 }
function fixedFieldsComplete(profile){ return Boolean(profile?.birthDate&&profile?.sex&&profile?.countryCode) }
function classInfo(type){ return MBTI_CLASSES.find(item=>item.type===type) }
function ageYears(date){ return Math.max(0,(Date.now()-new Date(`${date}T00:00:00`).getTime())/(365.2425*86400000)) }
function visibleAge(date){ return Math.floor(ageYears(date)) }
function indicatorFor(sex){ return sex==='female'?'SP.DYN.LE00.FE.IN':'SP.DYN.LE00.MA.IN' }
function vitalityPercent(profile){ const life=Number(profile?.lifeExpectancy?.value||80); return Math.max(0,Math.min(100,((life-ageYears(profile.birthDate))/life)*100)) }
function avatarFor(profile){ if(profile?.photo)return profile.photo; const seed=encodeURIComponent(`${profile?.firstName||''} ${profile?.lastName||''}`); return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}` }

async function fetchLifeExpectancy(country,sex){
  const response=await fetch(`${WB}/country/${encodeURIComponent(country)}/indicator/${indicatorFor(sex)}?format=json&mrv=10&per_page=10`)
  if(!response.ok) throw new Error('World Bank unavailable')
  const data=await response.json()
  const row=(data?.[1]||[]).find(item=>item.value!=null)
  if(!row) throw new Error('No life expectancy data')
  return {value:Number(row.value),year:row.date,fetchedAt:new Date().toISOString(),source:'Banque mondiale'}
}
async function refreshLifeExpectancy(profile,force=false){
  if(!profile?.countryCode||!profile?.sex)return profile
  const cacheAge=Date.now()-new Date(profile.lifeExpectancy?.fetchedAt||0).getTime()
  if(!force&&profile.lifeExpectancy?.value&&cacheAge<7*86400000)return profile
  try{return {...profile,lifeExpectancy:await fetchLifeExpectancy(profile.countryCode,profile.sex)}}
  catch{if(profile.lifeExpectancy?.value)return profile;return {...profile,lifeExpectancy:{value:80,year:null,fetchedAt:new Date().toISOString(),source:'Valeur de secours'}}}
}
function fileToDataUrl(file){ return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)}) }

function Welcome({onStart}){
  return <main className="center-screen arg-bg"><section className="hero glass">
    <div className="signal"><FontAwesomeIcon icon={faCircleNodes}/> SIGNAL // 001.33</div>
    <div className="chips"><span>5 paliers</span><span>16 classes</span><span>33 sièges Challenger</span></div>
    <h1>Tu n’es pas arrivé ici par hasard.</h1>
    <p>Crée ton profil. Choisis un rôle si tu le souhaites. Certaines mécaniques sont visibles immédiatement. D’autres ne révèlent leur sens qu’après du temps passé dans le système.</p>
    <button className="primary" onClick={onStart}>Commencer la partie</button>
    <small className="arg-whisper">Le premier indice est toujours celui qu’on croit décoratif.</small>
  </section></main>
}

function Field({label,hint,premium,full,children}){return <label className={`field ${full?'full':''}`}><span>{label}</span>{children}{hint&&<small className={premium?'premium-hint':''}>{hint}</small>}</label>}

function ProfileForm({initialProfile,plan,onSave,onCancel}){
  const isCreate=!fixedFieldsComplete(initialProfile)
  const canEditFixed=isCreate||premiumEdit(plan)
  const [countries,setCountries]=useState([])
  const [loadingCountries,setLoadingCountries]=useState(true)
  const [form,setForm]=useState({firstName:initialProfile?.firstName||'',lastName:initialProfile?.lastName||'',birthDate:initialProfile?.birthDate||'',sex:initialProfile?.sex||'',countryCode:initialProfile?.countryCode||'',mbtiClass:initialProfile?.mbtiClass||'',photo:null})
  useEffect(()=>{let active=true;fetch(`${WB}/country?format=json&per_page=400`).then(r=>r.json()).then(data=>{if(!active)return;setCountries((data?.[1]||[]).filter(c=>c.iso2Code&&c.region?.id!=='NA').sort((a,b)=>a.name.localeCompare(b.name,'fr')))}).finally(()=>active&&setLoadingCountries(false));return()=>{active=false}},[])
  const set=(key,value)=>setForm(current=>({...current,[key]:value}))
  const selectedClass=classInfo(form.mbtiClass)
  async function submit(event){
    event.preventDefault()
    const country=countries.find(c=>c.iso2Code===form.countryCode)
    let photo=initialProfile?.photo||''
    if(form.photo)photo=await fileToDataUrl(form.photo)
    const base={...initialProfile,firstName:form.firstName.trim(),lastName:form.lastName.trim(),photo,mbtiClass:form.mbtiClass||'',birthDate:canEditFixed?form.birthDate:initialProfile.birthDate,sex:canEditFixed?form.sex:initialProfile.sex,countryCode:canEditFixed?form.countryCode:initialProfile.countryCode,countryName:canEditFixed?(country?.name||initialProfile?.countryName||''):initialProfile.countryName}
    const changed=!initialProfile||base.birthDate!==initialProfile.birthDate||base.sex!==initialProfile.sex||base.countryCode!==initialProfile.countryCode
    onSave(await refreshLifeExpectancy(base,changed))
  }
  return <main className="center-screen arg-bg"><form className="profile-form glass" onSubmit={submit}>
    <div className="signal"><FontAwesomeIcon icon={faLock}/> IDENTITÉ // LOCALE</div>
    <h2>{isCreate?'Créer ton personnage':'Modifier ton profil'}</h2>
    <p>Ton identité civile alimente certaines mécaniques. Ta classe, elle, est un rôle narratif facultatif.</p>
    <div className="form-grid">
      <Field label="Prénom"><input required value={form.firstName} onChange={e=>set('firstName',e.target.value)}/></Field>
      <Field label="Nom"><input required value={form.lastName} onChange={e=>set('lastName',e.target.value)}/></Field>
      <Field label="Date de naissance" hint={canEditFixed?'Utilisée pour calculer ton âge automatiquement.':'🔒 Modification réservée à Premium, VIP et Challenger.'} premium={!canEditFixed}><input type="date" required disabled={!canEditFixed} value={form.birthDate} onChange={e=>set('birthDate',e.target.value)}/></Field>
      <Field label="Sexe" hint={canEditFixed?'Donnée stable conservée dans ton profil local.':'🔒 Modification réservée à Premium, VIP et Challenger.'} premium={!canEditFixed}><select required disabled={!canEditFixed} value={form.sex} onChange={e=>set('sex',e.target.value)}><option value="">Choisir…</option><option value="female">Femme</option><option value="male">Homme</option></select></Field>
      <Field label="Pays" full hint={canEditFixed?'Sert à récupérer l’espérance de vie statistique du pays.':'🔒 Modification réservée à Premium, VIP et Challenger.'} premium={!canEditFixed}><select required disabled={!canEditFixed||loadingCountries} value={form.countryCode} onChange={e=>set('countryCode',e.target.value)}><option value="">{loadingCountries?'Chargement…':'Choisir un pays…'}</option>{countries.map(country=><option value={country.iso2Code} key={country.iso2Code}>{country.name}</option>)}</select></Field>
      <Field label="Classe — optionnel" full hint="Inspirée du MBTI comme archétype de jeu, pas comme diagnostic psychologique."><select value={form.mbtiClass} onChange={e=>set('mbtiClass',e.target.value)}><option value="">Aucune classe pour l’instant</option>{MBTI_CLASSES.map(item=><option value={item.type} key={item.type}>{item.type} — {item.name}</option>)}</select></Field>
      {selectedClass&&<div className="class-preview full" style={{'--class-color':selectedClass.color}}><FontAwesomeIcon icon={selectedClass.icon}/><div><strong>{selectedClass.type} // {selectedClass.name}</strong><span>{selectedClass.mission}</span></div></div>}
      <Field label="Photo de profil" full hint="La photo reste dans ton navigateur."><input type="file" accept="image/*" onChange={e=>set('photo',e.target.files?.[0]||null)}/></Field>
    </div>
    <div className="privacy">🔒 Tes données restent locales. Date de naissance, sexe et pays ne deviennent verrouillés qu’après leur premier enregistrement.</div>
    <div className="form-actions">{onCancel&&<button type="button" className="ghost" onClick={onCancel}>Retour</button>}<button className="primary" type="submit">Enregistrer</button></div>
  </form></main>
}

function SubscriptionShop({plan,onChoose,onBack}){
  return <main className="plans-screen arg-bg"><section className="plans-shell glass"><header className="plans-head"><div><button className="ghost" onClick={onBack}>← Retour au jeu</button><div className="signal">PALIER // ACCÈS</div><h2>Jusqu’où veux-tu aller ?</h2><p>Chaque édition rapproche du dernier cercle. Challenger n’est pas présenté comme un achat de statut : il faut encore gagner sa place dans le registre.</p></div><div className="current-plan"><span>Accès actuel</span><strong>{plan}</strong></div></header><div className="plans-grid">{PLANS.map(item=><article key={item.name} className={`plan-card ${item.featured?'featured':''} ${item.name===plan?'active':''} ${item.name==='Challenger'?'challenger-plan':''}`}><span className="plan-tag">{item.tag}</span><div className="plan-art"><img src={item.image} alt={`Emblème ${item.name}`}/></div><h3>{item.name}</h3><div className="plan-price">{item.price}</div><p className="plan-headline">{item.headline}</p><ul>{item.features.map(feature=><li key={feature}>{feature}</li>)}</ul><button className="plan-cta" onClick={()=>onChoose(item.name)}>{item.name===plan?'Accès actuel':item.cta}</button></article>)}</div></section></main>
}

function ChallengerBoard(){
  const seats=Array.from({length:33},(_,i)=>i+1)
  return <section className="challenger-board"><header><div><span className="signal"><FontAwesomeIcon icon={faRankingStar}/> REGISTRE // CHALLENGER</span><h3>Les 33</h3></div><span className="cycle">Cycle mensuel · ouverture le 1er</span></header>
    <p>Le dernier palier représente les 0,001% les plus engagés. À l’intérieur de ce groupe, seuls 33 noms sont inscrits dans le registre public de chaque cycle.</p>
    <div className="seats">{seats.slice(0,8).map(n=><div className="seat" key={n}><b>{String(n).padStart(2,'0')}</b><span>████████</span></div>)}</div>
    <small>Les positions réelles seront synchronisées lorsque le classement mondial disposera de son backend. Le registre n’invente pas de faux joueurs.</small>
  </section>
}

function Progress({label,value,percent,kind}){return <div className="progress"><div><span>{label}</span><span>{value}</span></div><div className="track"><i className={kind} style={{width:`${percent}%`}}/></div></div>}

function Game({profile,plan,onEdit,onPlans,onReset}){
  const [menuOpen,setMenuOpen]=useState(false)
  const vitality=useMemo(()=>vitalityPercent(profile),[profile])
  const life=profile.lifeExpectancy
  const playerClass=classInfo(profile.mbtiClass)
  const actions=[
    [faHammer,'Action','1'],[faWandMagicSparkles,'Compétences','2'],[faUtensils,'Chef Cuisinier','3'],
    [faCompass,'Quêtes','J'],[faEye,'Carte','M'],[faShieldHalved,'Personnage','C'],[faPeopleGroup,'Social','O']
  ]
  return <main className="game-screen" onClick={()=>setMenuOpen(false)}><section className="world"><div className="world-copy"><span className="signal">SIGNAL ACTIF // {profile.mbtiClass||'SANS CLASSE'}</span><h2>Monde principal</h2><p>Tout ce qui ressemble à une simple interface peut devenir un indice. Certaines valeurs suivent silencieusement le temps réel. Certaines portes n’existent qu’après avoir remarqué qu’elles étaient là.</p>{playerClass&&<div className="mission-card" style={{'--class-color':playerClass.color}}><FontAwesomeIcon icon={playerClass.icon}/><div><small>MISSION DE CLASSE</small><strong>{playerClass.name}</strong><span>{playerClass.mission}</span></div></div>}</div><ChallengerBoard/></section>
    <button className="profile-trigger" onClick={e=>{e.stopPropagation();setMenuOpen(v=>!v)}}><span className="avatar-wrap"><img className="avatar" src={avatarFor(profile)} alt="Profil"/><i/></span><span><b>{profile.firstName}</b><small>{playerClass?`${playerClass.type} · ${playerClass.name}`:`${plan} · Niveau 1`}</small></span><em>⌄</em></button>
    <aside className={`profile-menu ${menuOpen?'open':''}`} onClick={e=>e.stopPropagation()}><div className="profile-head"><img className="avatar large" src={avatarFor(profile)} alt="Profil"/><div><strong>{profile.firstName} {profile.lastName}</strong><span>{visibleAge(profile.birthDate)} ans · {profile.sex==='female'?'Femme':'Homme'}</span>{playerClass&&<span className="class-line" style={{color:playerClass.color}}><FontAwesomeIcon icon={playerClass.icon}/> {playerClass.type} · {playerClass.name}</span>}</div><b className="plan-pill">{plan}</b></div><Progress label="Vitalité" value={`${Math.round(vitality)} / 100`} percent={vitality} kind="health"/><Progress label="Progression" value="42%" percent={42} kind="xp"/><div className="life-source">{life?.year?`Référence : ${Number(life.value).toFixed(1)} ans · ${life.year} · Banque mondiale`:'Référence statistique temporairement indisponible'}</div><div className="profile-actions"><button><b>Mon profil</b><small>Identité et apparence</small></button><button><b>Progression</b><small>Niveau, XP et objectifs</small></button><button><b>Inventaire</b><small>Objets et collections</small></button><button className="shop" onClick={onPlans}><b>Éditions & abonnements</b><small>Jusqu’au palier Challenger</small></button></div><div className="profile-footer"><button className="ghost" onClick={onEdit}>Modifier</button><button className="ghost" onClick={onReset}>Réinitialiser</button></div></aside>
    <div className="hud"><nav className="actionbar">{actions.map(([icon,label,key])=><button key={label} title={label}><FontAwesomeIcon icon={icon}/><small>{key}</small><span className="action-label">{label}</span></button>)}</nav><aside className="resources"><span>Ressources</span><div>{[['1 250','Crédits'],['84','Énergie'],['3','Talents'],['12','Points']].map(([value,label])=><article key={label}><b>{value}</b><small>{label}</small></article>)}</div></aside></div>
  </main>
}

export default function App(){
  const [profile,setProfile]=useState(()=>getStoredProfile())
  const [plan,setPlan]=useState(()=>getStoredPlan())
  const [view,setView]=useState('welcome')
  function saveProfile(next){localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setProfile(next);setView('game')}
  function choosePlan(next){localStorage.setItem(SUB_KEY,next);setPlan(next)}
  function reset(){localStorage.removeItem(STORAGE_KEY);setProfile(null);setView('welcome')}
  async function start(){if(!profile||!fixedFieldsComplete(profile)){setView('profile');return}const next=await refreshLifeExpectancy(profile);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setProfile(next);setView('game')}
  const canReturnToGame=fixedFieldsComplete(profile)
  if(view==='profile')return <ProfileForm initialProfile={profile} plan={plan} onSave={saveProfile} onCancel={canReturnToGame?()=>setView('game'):null}/>
  if(view==='plans')return <SubscriptionShop plan={plan} onChoose={choosePlan} onBack={()=>setView(profile&&fixedFieldsComplete(profile)?'game':'welcome')}/>
  if(view==='game'&&profile&&fixedFieldsComplete(profile))return <Game profile={profile} plan={plan} onEdit={()=>setView('profile')} onPlans={()=>setView('plans')} onReset={reset}/>
  return <Welcome onStart={start}/>
}
