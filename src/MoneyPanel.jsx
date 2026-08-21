import { useEffect, useMemo, useState } from 'react'
import './money.css'

const MONEY_KEY='patouMoneySettings'

function readSaved(){try{return JSON.parse(localStorage.getItem(MONEY_KEY))||{}}catch{return {}}}
function amount(value){return Math.max(0,Number(value)||0)}
function euro(value){return `${Math.round(Number(value)||0).toLocaleString('fr-FR')} €`}

export default function MoneyPanel(){
  const [form,setForm]=useState(()=>({income:'',fixed:'',variable:'',debt:'',saving:'',emergency:'',...readSaved()}))
  const set=(key,value)=>setForm(current=>({...current,[key]:value}))
  useEffect(()=>{localStorage.setItem(MONEY_KEY,JSON.stringify(form))},[form])
  const results=useMemo(()=>{
    const income=amount(form.income),fixed=amount(form.fixed),variable=amount(form.variable),debt=amount(form.debt),saving=amount(form.saving),emergency=amount(form.emergency)
    const left=income-fixed-variable-debt
    const after=left-saving
    const rate=income?saving/income*100:0
    const essential=fixed+debt+variable*.5
    const months=essential?emergency/essential:0
    return {left,after,rate,months}
  },[form])
  const fields=[
    ['income','Revenus nets mensuels','2000',10],
    ['fixed','Charges fixes','900',10],
    ['variable','Dépenses variables','500',10],
    ['debt','Remboursements de dettes','150',10],
    ['saving','Épargne mensuelle visée','250',10],
    ['emergency','Fonds d’urgence actuel','3000',50]
  ]
  return <div className="money-inline">
    <div className="money-signal">ARGENT // TABLEAU DE BORD</div>
    <p className="money-intro">Comprendre où va ton argent et construire une marge de sécurité. Les données restent uniquement dans ton navigateur.</p>
    <div className="money-grid">
      <section className="money-form-card"><h3>Flux mensuels</h3><div className="money-form">{fields.map(([key,label,placeholder,step])=><label key={key}>{label}<input name={key} type="number" min="0" step={step} value={form[key]} placeholder={placeholder} onChange={e=>set(key,e.target.value)}/><span>€</span></label>)}</div></section>
      <section className="money-results">
        <article><small>RESTE APRÈS DÉPENSES</small><strong>{euro(results.left)}</strong><p>Revenus − charges − dépenses − dettes.</p></article>
        <article><small>APRÈS ÉPARGNE VISÉE</small><strong>{euro(results.after)}</strong><p>La marge réellement disponible à la fin du mois.</p></article>
        <article><small>TAUX D’ÉPARGNE VISÉ</small><strong>{results.rate.toFixed(1)} %</strong><p>Épargne visée rapportée aux revenus nets.</p></article>
        <article><small>COUVERTURE D’URGENCE</small><strong>{results.months.toFixed(1)} mois</strong><p>Nombre de mois de charges essentielles couvertes.</p></article>
      </section>
    </div>
    <div className="money-foundations"><h3>Les bases à maîtriser</h3><div className="money-foundation-grid">
      <article><b>1 · Budget</b><p>Savoir ce qui entre, ce qui sort et distinguer fixe, variable et exceptionnel.</p></article>
      <article><b>2 · Sécurité</b><p>Construire progressivement un fonds d’urgence adapté à ses dépenses essentielles.</p></article>
      <article><b>3 · Dettes</b><p>Connaître taux, mensualités, coût total et prioriser les dettes les plus coûteuses.</p></article>
      <article><b>4 · Administratif</b><p>Comprendre impôts, assurances, abonnements, contrats, factures et échéances.</p></article>
      <article><b>5 · Épargne & projets</b><p>Donner un objectif et un horizon à l’argent mis de côté avant de chercher du rendement.</p></article>
      <article><b>6 · Risque</b><p>Ne pas confondre rendement potentiel et certitude ; diversifier plutôt que tout concentrer.</p></article>
    </div></div>
    <small className="money-note">Outil pédagogique général : il ne remplace pas un conseil financier, fiscal ou juridique personnalisé.</small>
  </div>
}
