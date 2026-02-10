import React from "react";
import Footer from "../../footer";
// Importations des images
import imgOkemba from "../../../assets/images/okemba.jpeg";
import imgEbata from "../../../assets/images/ebata.jpeg";
import imgLaurent from "../../../assets/images/laurent.jpeg";
import imgAllegra from "../../../assets/images/allegra.jpeg";
import imgGrace from "../../../assets/images/grace.jpeg";
import imgHerika from "../../../assets/images/herika.jpeg";
import imgRuben from "../../../assets/images/ruben.jpeg";
import imgStev from "../../../assets/images/stev.jpeg";
import imgMartis from "../../../assets/images/martis.png";
import imgRuth from "../../../assets/images/ruth.jpeg";
import imgGloire from "../../../assets/images/gloire.jpeg"; // <-- Nouvel import

const teamMembers = [
  {
    name: "BOKADI Stev",
    role: "Chef du Groupe",
    bio: "Un leader naturel doté d'une grande écoute et d'un sens des responsabilités exemplaire.",
    img: imgStev
  },
  {
    name: "NGOUONO Marty",
    role: "Sous-Chef",
    bio: "Rigoureux et bienveillant, il assure la cohésion de l'équipe avec diplomatie.",
    img: imgMartis
  },
  {
    name: "DIAKABANA Gloire", // <-- Nouveau membre
    role: "Membre",
    bio: "Un esprit vif et déterminé, toujours prêt à apporter son expertise pour faire avancer le projet.",
    img: imgGloire
  },
  {
    name: "OUALEMBO Ruth",
    role: "Membre",
    bio: "sa facon de bouder sa fleme et son application pour faussee.",
    img: imgRuth
  },
  {
    name: "Okemba chadrack gercy",
    role: "Membre",
    bio: "Toujours prêt à aider, il se distingue par sa patience et sa persévérance face aux défis.",
    img: imgOkemba
  },
  {
    name: "EBATA ferol",
    role: "Membre",
    bio: "Un esprit curieux et ouvert qui apporte toujours une touche de positivité au groupe.",
    img: imgEbata
  },
  {
    name: "MOUYINGOU Laurent",
    role: "Membre",
    bio: "Calme et réfléchi, il possède une grande capacité d'analyse et d'empathie.",
    img: imgLaurent
  },
  {
    name: "EWANGO Allegra",
    role: "Membre",
    bio: "Sa créativité n'a d'égale que sa générosité et son envie constante d'apprendre.",
    img: imgAllegra
  },
  {
    name: "TSIKA Grace",
    role: "Membre",
    bio: "Dotée d'un excellent sens relationnel, elle sait motiver les autres par son dynamisme.",
    img: imgGrace
  },
  {
    name: "NKOUKA Herika",
    role: "Membre",
    bio: "D'une grande intégrité, elle apporte une stabilité et une sagesse précieuses au projet.",
    img: imgHerika
  },
  {
    name: "kounionguina Ruben",
    role: "Membre",
    bio: "Toujours enthousiaste, il possède un talent pour simplifier les situations complexes.",
    img: imgRuben
  }
];

function Team() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
        <div className="mb-10 text-center">
          <span className="glass-soft inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
            L'Aventure Humaine
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-ink-900 md:text-4xl dark:text-white">
            Rencontrez notre <span className="text-gradient">Equipe</span>
          </h1>
          <p className="mt-3 text-sm text-ink-600 dark:text-white/80">
            Plus que des compétences, ce sont des valeurs humaines qui nous unissent.
          </p>
        </div>

        <div data-reveal-section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {teamMembers.map((member, index) => (
            <div
              className={`glass-card group overflow-hidden rounded-3xl transition hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(39,143,75,0.25)] text-ink-900 dark:text-white h-full ${
                index % 2 === 0 ? "reveal-fade-left" : "reveal-fade-right"
              }`}
              data-reveal
              data-reveal-delay={`${Math.min(400, index * 60)}ms`}
              key={index}
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <img
                  src={member.img}
                  alt={member.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold">{member.name}</h3>
                <span className="mt-2 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-600 dark:bg-slate-900/60 dark:text-white/80">
                  {member.role}
                </span>
                <p className="mt-3 text-sm text-ink-600 dark:text-white/80">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Team;
