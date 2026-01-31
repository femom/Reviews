import React from "react";
import "./Team.css";
import Footer from "../../footer/index.jsx";
import { Card } from "../../ui";

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
    img: imgStev,
  },
  {
    name: "NGOUONO Marty",
    role: "Sous-Chef",
    bio: "Rigoureux et bienveillant, il assure la cohésion de l'équipe avec diplomatie.",
    img: imgMartis,
  },
  {
    name: "DIAKABANA Gloire", // <-- Nouveau membre
    role: "Membre",
    bio: "Un esprit vif et déterminé, toujours prêt à apporter son expertise pour faire avancer le projet.",
    img: imgGloire,
  },
  {
    name: "OUALEMBO Ruth",
    role: "Membre",
    bio: "sa facon de bouder sa fleme et son application pour faussee.",
    img: imgRuth,
  },
  {
    name: "Okemba chadrack gercy",
    role: "Membre",
    bio: "Toujours prêt à aider, il se distingue par sa patience et sa persévérance face aux défis.",
    img: imgOkemba,
  },
  {
    name: "EBATA ferol",
    role: "Membre",
    bio: "Un esprit curieux et ouvert qui apporte toujours une touche de positivité au groupe.",
    img: imgEbata,
  },
  {
    name: "MOUYINGOU Laurent",
    role: "Membre",
    bio: "Calme et réfléchi, il possède une grande capacité d'analyse et d'empathie.",
    img: imgLaurent,
  },
  {
    name: "EWANGO Allegra",
    role: "Membre",
    bio: "Sa créativité n'a d'égale que sa générosité et son envie constante d'apprendre.",
    img: imgAllegra,
  },
  {
    name: "TSIKA Grace",
    role: "Membre",
    bio: "Dotée d'un excellent sens relationnel, elle sait motiver les autres par son dynamisme.",
    img: imgGrace,
  },
  {
    name: "NKOUKA Herika",
    role: "Membre",
    bio: "D'une grande intégrité, elle apporte une stabilité et une sagesse précieuses au projet.",
    img: imgHerika,
  },
  {
    name: "kounionguina Ruben",
    role: "Membre",
    bio: "Toujours enthousiaste, il possède un talent pour simplifier les situations complexes.",
    img: imgRuben,
  },
];

function Team() {
  return (
    <>
      <div className="team-page">
        <div className="team-header">
          <span className="team-badge">L'Aventure Humaine</span>
          <h1>
            Rencontrez notre <span>Equipe</span>
          </h1>
          <p>
            Plus que des compétences, ce sont des valeurs humaines qui nous
            unissent.
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <Card key={index} className="h-[360px]">
              <div className="w-full h-44 overflow-hidden">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 absolute bottom-0 left-0 right-0 text-white">
                <h3 className="text-lg font-bold">{member.name}</h3>
                <span className="text-sm opacity-90">{member.role}</span>
                <p className="text-sm opacity-90 mt-2">{member.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Team;
