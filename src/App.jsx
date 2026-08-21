import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'patouGameProfile'
const SUB_KEY = 'patouGameSubscription'
const WB = 'https://api.worldbank.org/v2'
const BASE = import.meta.env.BASE_URL

const PLAN_ORDER = ['Gratuit', 'Starter Pack', 'Premium', 'VIP', 'Challenger']
const PLANS = [
  { name: 'Gratuit', price: '0 €', tag: 'Découverte', image: `${BASE}assets/plans/free.webp`, headline: 'Démarre et explore le jeu', cta: 'Commencer gratuitement', features: ['Accès au cœur de l’expérience', 'Profil local et progression de base', 'Découverte du système de vitalité'] },
  { name: 'Starter Pack', price: '2,99 € / mois', tag: 'Lancement', image: `${BASE}assets/plans/starter.webp`, headline: 'Un meilleur départ, sans friction', cta: 'Choisir Starter Pack', features: ['Tout le contenu Gratuit', 'Plus de personnalisation visuelle', 'Bonus de démarrage et confort de jeu'] },
  { name: 'Premium', price: '9,99 € / mois', tag: 'Populaire', image: `${BASE}assets/plans/premium.webp`, featured: true, headline: 'La meilleure porte d’entrée', cta: 'Passer à Premium', features: ['Tout le Starter Pack', 'Modification de la date de naissance, du sexe et du pays', 'Avantages Premium et futures nouveautés'] },
  { name: 'VIP', price: '19,99 € / mois', tag: 'Prestige', image: `${BASE}assets/plans/vip.webp`, headline: 'Pour les joueurs qui veulent plus', cta: 'Devenir VIP', features: ['Tout le Premium', 'Avantages VIP et priorités sur certains bonus', 'Présence plus prestigieuse dans l’écosystème'] },
  { name: 'Challenger', price: '34,99 € / mois', tag: 'Ultime', image: `${BASE}assets/plans/challenger.webp`, headline: 'L’édition légendaire', cta: 'Atteindre Challenger', features: ['Tout le VIP', 'Édition la plus complète', 'Accès au niveau de prestige maximal'] }
]

function getStoredProfile() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null } }
function getStoredPlan() { return localStorage.getItem(SUB_KEY) || 'Gratuit' }
function premiumEdit(plan) { return PLAN_ORDER.indexOf(plan) >= 2 }
function fixedFieldsComplete(profile) { return Boolean(profile?.birthDate && profile?.sex && profile?.countryCode) }
function ageYears(date) { return Math.max(0, (Date.now() - new Date(`${date}T00:00:00`).getTime()) / (365.2425 * 86400000)) }
function visibleAge(date) { return Math.floor(ageYears(date)) }
function indicatorFor(sex) { return sex === 'female' ? 'SP.DYN.LE00.FE.IN' : 'SP.DYN.LE00.MA.IN' }
function vitalityPercent(profile) { const life = Number(profile?.lifeExpectancy?.value || 80); return Math.max(0, Math.min(100, ((life - ageYears(profile.birthDate)) / life) * 100)) }
function avatarFor(profile) { if (profile?.photo) return profile.photo; const seed = encodeURIComponent(`${profile?.firstName || ''} ${profile?.lastName || ''}`); return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}` }

async function fetchLifeExpectancy(country, sex) {
  const response = await fetch(`${WB}/country/${encodeURIComponent(country)}/indicator/${indicatorFor(sex)}?format=json&mrv=10&per_page=10`)
  if (!response.ok) throw new Error('World Bank unavailable')
  const data = await response.json()
  const row = (data?.[1] || []).find(item => item.value != null)
  if (!row) throw new Error('No life expectancy data')
  return { value: Number(row.value), year: row.date, fetchedAt: new Date().toISOString(), source: 'Banque mondiale' }
}

async function refreshLifeExpectancy(profile, force = false) {
  if (!profile?.countryCode || !profile?.sex) return profile
  const cacheAge = Date.now() - new Date(profile.lifeExpectancy?.fetchedAt || 0).getTime()
  if (!force && profile.lifeExpectancy?.value && cacheAge < 7 * 86400000) return profile
  try { return { ...profile, lifeExpectancy: await fetchLifeExpectancy(profile.countryCode, profile.sex) } }
  catch { if (profile.lifeExpectancy?.value) return profile; return { ...profile, lifeExpectancy: { value: 80, year: null, fetchedAt: new Date().toISOString(), source: 'Valeur de secours' } } }
}

function Welcome({ onStart }) {
  return <main className="center-screen"><section className="hero glass"><div className="chips"><span>5 éditions disponibles</span><span>Données personnelles locales</span><span>Progression vivante</span></div><h1>Prêt à jouer ?</h1><p>Crée ton profil, entre dans le monde, puis découvre une expérience qui s’approfondit avec le temps.</p><button className="primary" onClick={onStart}>Commencer la partie</button></section></main>
}

function ProfileForm({ initialProfile, plan, onSave, onCancel }) {
  const isCreate = !fixedFieldsComplete(initialProfile)
  const canEditFixed = isCreate || premiumEdit(plan)
  const [countries, setCountries] = useState([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [form, setForm] = useState({ firstName: initialProfile?.firstName || '', lastName: initialProfile?.lastName || '', birthDate: initialProfile?.birthDate || '', sex: initialProfile?.sex || '', countryCode: initialProfile?.countryCode || '', photo: null })

  useEffect(() => {
    let active = true
    fetch(`${WB}/country?format=json&per_page=400`).then(r => r.json()).then(data => { if (!active) return; const list = (data?.[1] || []).filter(c => c.iso2Code && c.region?.id !== 'NA').sort((a, b) => a.name.localeCompare(b.name, 'fr')); setCountries(list) }).finally(() => active && setLoadingCountries(false))
    return () => { active = false }
  }, [])

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))
  async function submit(event) {
    event.preventDefault()
    const country = countries.find(c => c.iso2Code === form.countryCode)
    let photo = initialProfile?.photo || ''
    if (form.photo) photo = await fileToDataUrl(form.photo)
    const base = { ...initialProfile, firstName: form.firstName.trim(), lastName: form.lastName.trim(), photo, birthDate: canEditFixed ? form.birthDate : initialProfile.birthDate, sex: canEditFixed ? form.sex : initialProfile.sex, countryCode: canEditFixed ? form.countryCode : initialProfile.countryCode, countryName: canEditFixed ? (country?.name || initialProfile?.countryName || '') : initialProfile.countryName }
    const changed = !initialProfile || base.birthDate !== initialProfile.birthDate || base.sex !== initialProfile.sex || base.countryCode !== initialProfile.countryCode
    onSave(await refreshLifeExpectancy(base, changed))
  }

  return <main className="center-screen"><form className="profile-form glass" onSubmit={submit}><h2>{isCreate ? 'Créer ton profil' : 'Modifier ton profil'}</h2><p>Les informations structurelles restent libres lors de la première création, puis deviennent Premium à modifier.</p><div className="form-grid"><Field label="Prénom"><input required value={form.firstName} onChange={e => set('firstName', e.target.value)} /></Field><Field label="Nom"><input required value={form.lastName} onChange={e => set('lastName', e.target.value)} /></Field><Field label="Date de naissance" hint={canEditFixed ? 'Utilisée pour calculer ton âge automatiquement.' : '🔒 Modification réservée à Premium, VIP et Challenger.'} premium={!canEditFixed}><input type="date" required disabled={!canEditFixed} value={form.birthDate} onChange={e => set('birthDate', e.target.value)} /></Field><Field label="Sexe" hint={canEditFixed ? 'Donnée stable conservée dans ton profil local.' : '🔒 Modification réservée à Premium, VIP et Challenger.'} premium={!canEditFixed}><select required disabled={!canEditFixed} value={form.sex} onChange={e => set('sex', e.target.value)}><option value="">Choisir…</option><option value="female">Femme</option><option value="male">Homme</option></select></Field><Field label="Pays" full hint={canEditFixed ? 'Sert à récupérer l’espérance de vie statistique du pays.' : '🔒 Modification réservée à Premium, VIP et Challenger.'} premium={!canEditFixed}><select required disabled={!canEditFixed || loadingCountries} value={form.countryCode} onChange={e => set('countryCode', e.target.value)}><option value="">{loadingCountries ? 'Chargement des pays…' : 'Choisir un pays…'}</option>{countries.map(country => <option value={country.iso2Code} key={country.iso2Code}>{country.name}</option>)}</select></Field><Field label="Photo de profil" full hint="La photo reste dans ton navigateur."><input type="file" accept="image/*" onChange={e => set('photo', e.target.files?.[0] || null)} /></Field></div><div className="privacy">🔒 Date de naissance, sexe et pays restent stockés localement. Ils ne sont jamais bloqués avant que tu les aies renseignés une première fois.</div><div className="form-actions">{onCancel && <button type="button" className="ghost" onClick={onCancel}>Retour</button>}<button className="primary" type="submit">Enregistrer</button></div></form></main>
}

function Field({ label, hint, premium, full, children }) { return <label className={`field ${full ? 'full' : ''}`}><span>{label}</span>{children}{hint && <small className={premium ? 'premium-hint' : ''}>{hint}</small>}</label> }
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) }) }

function SubscriptionShop({ plan, onChoose, onBack }) {
  return <main className="plans-screen"><section className="plans-shell glass"><header className="plans-head"><div><button className="ghost" onClick={onBack}>← Retour au jeu</button><h2>Choisis l’édition qui te correspond</h2><p>Une montée en gamme lisible, avec une identité visuelle et un niveau de prestige propres à chaque offre.</p></div><div className="current-plan"><span>Offre actuelle</span><strong>{plan}</strong></div></header><div className="plans-grid">{PLANS.map(item => <article key={item.name} className={`plan-card ${item.featured ? 'featured' : ''} ${item.name === plan ? 'active' : ''}`}><span className="plan-tag">{item.tag}</span><div className="plan-art"><img src={item.image} alt={`Emblème ${item.name}`} /></div><h3>{item.name}</h3><div className="plan-price">{item.price}</div><p className="plan-headline">{item.headline}</p><ul>{item.features.map(feature => <li key={feature}>{feature}</li>)}</ul><button className="plan-cta" onClick={() => onChoose(item.name)}>{item.name === plan ? 'Abonnement actuel' : item.cta}</button></article>)}</div></section></main>
}

function Game({ profile, plan, onEdit, onPlans, onReset }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const vitality = useMemo(() => vitalityPercent(profile), [profile])
  const life = profile.lifeExpectancy
  return <main className="game-screen" onClick={() => setMenuOpen(false)}><section className="world"><h2>Monde principal</h2><p>Les éléments visibles ne racontent qu’une partie du système. Certaines valeurs suivent silencieusement le temps réel.</p></section><button className="profile-trigger" onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}><span className="avatar-wrap"><img className="avatar" src={avatarFor(profile)} alt="Profil" /><i /></span><span><b>{profile.firstName}</b><small>{plan} · Niveau 1</small></span><em>⌄</em></button><aside className={`profile-menu ${menuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}><div className="profile-head"><img className="avatar large" src={avatarFor(profile)} alt="Profil" /><div><strong>{profile.firstName} {profile.lastName}</strong><span>{visibleAge(profile.birthDate)} ans · {profile.sex === 'female' ? 'Femme' : 'Homme'}</span><span>{profile.countryName || profile.countryCode}</span></div><b className="plan-pill">{plan}</b></div><Progress label="Vitalité" value={`${Math.round(vitality)} / 100`} percent={vitality} kind="health" /><Progress label="Progression" value="42%" percent={42} kind="xp" /><div className="life-source">{life?.year ? `Référence : ${Number(life.value).toFixed(1)} ans · ${life.year} · Banque mondiale` : 'Référence statistique temporairement indisponible'}</div><div className="profile-actions"><button><b>Mon profil</b><small>Identité et apparence</small></button><button><b>Progression</b><small>Niveau, XP et objectifs</small></button><button><b>Inventaire</b><small>Objets et collections</small></button><button className="shop" onClick={onPlans}><b>Éditions & abonnements</b><small>Gratuit, Starter, Premium…</small></button></div><div className="profile-footer"><button className="ghost" onClick={onEdit}>Modifier</button><button className="ghost" onClick={onReset}>Réinitialiser</button></div></aside><div className="hud"><nav className="actionbar">{[['⚔','1'],['✨','2'],['🎒','B'],['📜','J'],['🗺','M'],['🧍','C'],['👥','O']].map(([icon,key]) => <button key={key}>{icon}<small>{key}</small></button>)}</nav><aside className="resources"><span>Ressources</span><div>{[['1 250','Crédits'],['84','Énergie'],['3','Talents'],['12','Points']].map(([value,label]) => <article key={label}><b>{value}</b><small>{label}</small></article>)}</div></aside></div></main>
}

function Progress({ label, value, percent, kind }) { return <div className="progress"><div><span>{label}</span><span>{value}</span></div><div className="track"><i className={kind} style={{ width: `${percent}%` }} /></div></div> }

export default function App() {
  const [profile, setProfile] = useState(() => getStoredProfile())
  const [plan, setPlan] = useState(() => getStoredPlan())
  const [view, setView] = useState('welcome')
  function saveProfile(next) { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setProfile(next); setView('game') }
  function choosePlan(next) { localStorage.setItem(SUB_KEY, next); setPlan(next) }
  function reset() { localStorage.removeItem(STORAGE_KEY); setProfile(null); setView('welcome') }
  async function start() { if (!profile || !fixedFieldsComplete(profile)) { setView('profile'); return } const next = await refreshLifeExpectancy(profile); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setProfile(next); setView('game') }
  const canReturnToGame = fixedFieldsComplete(profile)
  if (view === 'profile') return <ProfileForm initialProfile={profile} plan={plan} onSave={saveProfile} onCancel={canReturnToGame ? () => setView('game') : null} />
  if (view === 'plans') return <SubscriptionShop plan={plan} onChoose={choosePlan} onBack={() => setView(profile && fixedFieldsComplete(profile) ? 'game' : 'welcome')} />
  if (view === 'game' && profile && fixedFieldsComplete(profile)) return <Game profile={profile} plan={plan} onEdit={() => setView('profile')} onPlans={() => setView('plans')} onReset={reset} />
  return <Welcome onStart={start} />
}
