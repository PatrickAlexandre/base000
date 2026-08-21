import './formation.css'

const HOME_TOPICS=[
  ['Autonomie quotidienne','Budget, comptes, impôts, démarches, assurances, logement et contrats.'],
  ['Vie professionnelle','CV, candidatures, entretien, e-mail professionnel, fiche de paie, droit du travail de base et négociation.'],
  ['Compétences domestiques','Cuisine, nutrition pratique, lessive, entretien du logement, bricolage et réparations simples.'],
  ['Sécurité & numérique','Premiers secours, sécurité domestique, mots de passe, sauvegardes, arnaques et hygiène numérique.'],
  ['Organisation & projets','Planifier une semaine, tenir un budget, gérer un projet, documenter son travail et respecter une échéance.'],
  ['Initiative économique','Prix, marge, facturation, micro-entreprise, vente, relation client et fonctionnement élémentaire d’une activité.']
]
const PUBLIC_TOPICS=[
  ['Socle académique','Français, mathématiques, sciences, histoire-géographie et enseignement moral et civique.'],
  ['Langues & culture','Langues vivantes, littérature, arts, culture générale et compréhension de références communes.'],
  ['Méthode scolaire','Lire une consigne, rédiger, argumenter, résoudre des problèmes, réviser et passer des évaluations.'],
  ['Vie collective','Travail en groupe, confrontation à des profils variés, règles communes et socialisation quotidienne.'],
  ['Sport & activités','Éducation physique et sportive, projets collectifs et activités proposées par l’établissement.'],
  ['Diplômes & orientation','Parcours standardisé, examens reconnus, orientation et passerelles vers études ou formations.']
]
const HOME_PROS=['Rythme très personnalisable','Possibilité d’intégrer la vie réelle aux apprentissages','Plus de temps pour approfondir les intérêts','Horaires et méthodes adaptables au profil de l’élève']
const HOME_CONS=['Qualité très dépendante du temps, des compétences et des moyens de la famille','Socialisation à organiser volontairement','Moins d’accès spontané à certains équipements, enseignants spécialisés ou activités','Risque de lacunes si le programme est trop centré sur les préférences familiales']
const PUBLIC_PROS=['Enseignants spécialisés et programme structuré','Contact quotidien avec un groupe diversifié','Diplômes, évaluations et orientation standardisés','Accès à des équipements et activités collectives selon les établissements']
const PUBLIC_CONS=['Personnalisation limitée dans des groupes nombreux','Rythme commun qui convient inégalement aux élèves','Compétences pratiques de vie adulte et professionnelle parfois peu ou inégalement couvertes','Qualité et offre d’activités variables selon les établissements et territoires']

function Topics({items}){return items.map(([title,text])=><article className="formation-topic" key={title}><strong>{title}</strong><p>{text}</p></article>)}
function Points({items,kind}){return <ul className={`formation-points ${kind}`}>{items.map(item=><li key={item}>{item}</li>)}</ul>}

export default function FormationPanel(){
  return <div className="formation-inline">
    <div className="formation-signal">FORMATION // DEUX VOIES</div>
    <p className="formation-intro">Deux modèles, deux forces. Cette comparaison décrit des tendances et des possibilités : aucun parcours ne garantit à lui seul tous ces apprentissages.</p>
    <div className="formation-split formation-learning">
      <section><div className="formation-column-title"><span>⌂</span><div><small>ÉCOLE À LA MAISON</small><h3>Apprentissages pratiques possibles</h3></div></div><Topics items={HOME_TOPICS}/><div className="formation-gap-note"><b>Compétences pratiques souvent à compléter</b><p>Fiscalité personnelle, assurances, location d’un logement, fiche de paie, candidatures, budget, entretien domestique et démarches administratives sont souvent appris de façon inégale ou tardive, quel que soit le parcours.</p></div></section>
      <section><div className="formation-column-title"><span>🏫</span><div><small>ÉCOLE PUBLIQUE</small><h3>Apprentissages structurés</h3></div></div><Topics items={PUBLIC_TOPICS}/></section>
    </div>
    <div className="formation-verdict-title"><span>COMPARAISON // POUR & CONTRE</span></div>
    <div className="formation-split formation-proscons">
      <section><h3>École à la maison</h3><div className="formation-pair"><div><h4>+</h4><Points items={HOME_PROS} kind="pros"/></div><div><h4>−</h4><Points items={HOME_CONS} kind="cons"/></div></div></section>
      <section><h3>École publique</h3><div className="formation-pair"><div><h4>+</h4><Points items={PUBLIC_PROS} kind="pros"/></div><div><h4>−</h4><Points items={PUBLIC_CONS} kind="cons"/></div></div></section>
    </div>
  </div>
}
