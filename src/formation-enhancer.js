const HOME_TOPICS = [
  ['Autonomie quotidienne','Budget, comptes, impôts, démarches, assurances, logement et contrats.'],
  ['Vie professionnelle','CV, candidatures, entretien, e-mail professionnel, fiche de paie, droit du travail de base et négociation.'],
  ['Compétences domestiques','Cuisine, nutrition pratique, lessive, entretien du logement, bricolage et réparations simples.'],
  ['Sécurité & numérique','Premiers secours, sécurité domestique, mots de passe, sauvegardes, arnaques et hygiène numérique.'],
  ['Organisation & projets','Planifier une semaine, tenir un budget, gérer un projet, documenter son travail et respecter une échéance.'],
  ['Initiative économique','Prix, marge, facturation, micro-entreprise, vente, relation client et fonctionnement élémentaire d’une activité.']
]

const PUBLIC_TOPICS = [
  ['Socle académique','Français, mathématiques, sciences, histoire-géographie et enseignement moral et civique.'],
  ['Langues & culture','Langues vivantes, littérature, arts, culture générale et compréhension de références communes.'],
  ['Méthode scolaire','Lire une consigne, rédiger, argumenter, résoudre des problèmes, réviser et passer des évaluations.'],
  ['Vie collective','Travail en groupe, confrontation à des profils variés, règles communes et socialisation quotidienne.'],
  ['Sport & activités','Éducation physique et sportive, projets collectifs et activités proposées par l’établissement.'],
  ['Diplômes & orientation','Parcours standardisé, examens reconnus, orientation et passerelles vers études ou formations.']
]

const HOME_PROS = ['Rythme très personnalisable','Possibilité d’intégrer la vie réelle aux apprentissages','Plus de temps pour approfondir les intérêts','Horaires et méthodes adaptables au profil de l’élève']
const HOME_CONS = ['Qualité très dépendante du temps, des compétences et des moyens de la famille','Socialisation à organiser volontairement','Moins d’accès spontané à certains équipements, enseignants spécialisés ou activités','Risque de lacunes si le programme est trop centré sur les préférences familiales']
const PUBLIC_PROS = ['Enseignants spécialisés et programme structuré','Contact quotidien avec un groupe diversifié','Diplômes, évaluations et orientation standardisés','Accès à des équipements et activités collectives selon les établissements']
const PUBLIC_CONS = ['Personnalisation limitée dans des groupes nombreux','Rythme commun qui convient inégalement aux élèves','Compétences pratiques de vie adulte et professionnelle parfois peu ou inégalement couvertes','Qualité et offre d’activités variables selon les établissements et territoires']

function cards(items){
  return items.map(([title,text])=>`<article class="formation-topic"><strong>${title}</strong><p>${text}</p></article>`).join('')
}
function points(items,kind){return `<ul class="formation-points ${kind}">${items.map(item=>`<li>${item}</li>`).join('')}</ul>`}

function panelMarkup(){
  return `<div class="formation-backdrop" data-formation-modal>
    <section class="formation-panel" role="dialog" aria-modal="true" aria-labelledby="formation-title">
      <header><div><span class="formation-signal">FORMATION // DEUX VOIES</span><h2 id="formation-title">Apprendre pour le monde réel</h2><p>Deux modèles, deux forces. La comparaison décrit des tendances et des possibilités : ni l’instruction à domicile ni l’école publique ne garantissent à elles seules tous ces apprentissages.</p></div><button class="formation-close" aria-label="Fermer">×</button></header>
      <div class="formation-split formation-learning">
        <section><div class="formation-column-title"><span>⌂</span><div><small>ÉCOLE À LA MAISON</small><h3>Apprentissages pratiques possibles</h3></div></div>${cards(HOME_TOPICS)}<div class="formation-gap-note"><b>Angle mort fréquent à la sortie du secondaire</b><p>Beaucoup d’adolescents, quel que soit leur parcours, doivent encore apprendre sur le tas la fiscalité personnelle, les assurances, la location d’un logement, la lecture d’une fiche de paie, les candidatures, la gestion d’un budget, l’entretien domestique et certaines démarches administratives. L’école publique peut les aborder, mais leur enseignement reste variable et souvent moins systématique que les matières académiques.</p></div></section>
        <section><div class="formation-column-title"><span>🏫</span><div><small>ÉCOLE PUBLIQUE</small><h3>Apprentissages structurés</h3></div></div>${cards(PUBLIC_TOPICS)}</section>
      </div>
      <div class="formation-verdict-title"><span>COMPARAISON // POUR & CONTRE</span></div>
      <div class="formation-split formation-proscons">
        <section><h3>École à la maison</h3><div class="formation-pair"><div><h4>+</h4>${points(HOME_PROS,'pros')}</div><div><h4>−</h4>${points(HOME_CONS,'cons')}</div></div></section>
        <section><h3>École publique</h3><div class="formation-pair"><div><h4>+</h4>${points(PUBLIC_PROS,'pros')}</div><div><h4>−</h4>${points(PUBLIC_CONS,'cons')}</div></div></section>
      </div>
    </section>
  </div>`
}

function closeFormation(){document.querySelector('[data-formation-modal]')?.remove()}
function openFormation(){
  closeFormation()
  document.body.insertAdjacentHTML('beforeend',panelMarkup())
  const modal=document.querySelector('[data-formation-modal]')
  modal.querySelector('.formation-close')?.addEventListener('click',closeFormation)
  modal.addEventListener('click',event=>{if(event.target===modal)closeFormation()})
}

function installFormationAction(){
  const bar=document.querySelector('.npc-actionbar')
  if(!bar||bar.querySelector('[data-formation-action]'))return
  const button=document.createElement('button')
  button.type='button'
  button.dataset.formationAction='true'
  button.title='Formation'
  button.innerHTML='<span class="formation-action-icon" aria-hidden="true">🎓</span><small>F</small><span class="action-label">Formation</span>'
  button.addEventListener('click',event=>{event.stopPropagation();openFormation()})
  bar.appendChild(button)
}

const observer=new MutationObserver(installFormationAction)
observer.observe(document.documentElement,{childList:true,subtree:true})
installFormationAction()
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeFormation()})
