import React, { useState, useMemo } from "react";

// NSC Verkorte Karaktertest (mini-MVP) - webinar instapmodel
// Structuur: variant D, route A2.
// - Meetlaag: 20 items voeden facetten (onzichtbare motor voor archetype-berekening).
// - Communicatielaag (zichtbaar): 5 hoofdtrekken (domeinen) en 10 aspecten.
// - Archetype-berekening: exacte MVP-gewichten uit v4.12 (ARCHETYPE_WEIGHTS), toegepast op de gemeten facetten.
// - Items zuiver (niet gecontextualiseerd). Kapitaalvertaling in het rapport, niet in de vragen.
// - Lokaal-only: geen opslag, geen mail. PDF via window.print.
// - Wft: structurele observatie, geen advies, geen producten, geen allocatiepercentages.
// Let op: indicatief instapmodel. 1 tot 3 items per facet, geen volwaardige 120-vragenmeting.

const NAVY = "#1A1F3A";
const GOUD = "#C9A961";
const WARMGRIJS = "#6B6358";
const CHAMPAGNE = "#E8DCC4";
const BORDEAUX = "#5C1A2B";
const WARMWIT = "#FAF8F3";
const SCHEID = "#D9CFB8";

// ---- Zichtbare structuur: 5 domeinen, elk 2 aspecten ----
const DOMEIN_ASPECTEN = {
  "Openheid": ["Intellect", "Esthetiek"],
  "Conscientieusheid": ["IJver", "Ordelijkheid"],
  "Extraversie": ["Enthousiasme", "Assertiviteit"],
  "Meegaandheid": ["Compassie", "Beleefdheid"],
  "Neuroticisme": ["Terughoudendheid", "Volatiliteit"],
};
const DOMEINEN = Object.keys(DOMEIN_ASPECTEN);

// Aspectbeschrijvingen exact uit v4.12 (ASPECT_DESCRIPTIONS).
const ASPECT_DESCRIPTIONS = {
  Intellect: "Beschrijft in welke mate je je graag bezighoudt met intellectuele interesses, hoe snel je denkt en verbanden ziet.",
  Esthetiek: "Gaat over creativiteit, genieten van schoonheid en kunst, emotionele diepgang, voorstellingsvermogen en fantasie.",
  IJver: "Het ervaren van verantwoordelijkheid tegenover taken en verplichtingen, en de motivatie en volharding die hieruit volgt.",
  Ordelijkheid: "De neiging om zaken goed te organiseren en een voorkeur voor gestructureerde omgevingen.",
  Enthousiasme: "De mate van levendigheid, energie en positieve emoties die men toont in sociale situaties.",
  Assertiviteit: "De mate waarin je sociaal daadkrachtig bent en initiatief neemt in groepen.",
  Compassie: "Het voelen van emotionele betrokkenheid en daar ook naar willen handelen.",
  Beleefdheid: "Respectvol en genuanceerd willen overkomen. Hierdoor wordt direct conflict vaak vermeden.",
  Terughoudendheid: "Een voortdurende ervaring van nervositeit en zorgen, wat in praktische zin vaak leidt tot het vermijden van risicovolle of nieuwe situaties.",
  Volatiliteit: "Reflecteert de frequentie, intensiteit en wisselingen in emoties, in het bijzonder negatieve emoties zoals frustratie en boosheid.",
};

// ---- Onzichtbare motor: archetype-gewichten exact uit v4.12 ----
const ARCHETYPE_WEIGHTS = {
  Architect: { C2_Ordelijkheid: 2, C5_Zelfdiscipline: 2, C6_Voorzichtigheid: 2, C4_Prestatiegerichtheid: 1, C1_Zelfvertrouwen: 1, O5_Intellect: 1, N6_Kwetsbaarheid: -2, N1_Angst: -1, E5_Sensatiezucht: -2, N2_Woede: -1 },
  Veroveraar: { E3_Assertiviteit: 2, E5_Sensatiezucht: 2, C1_Zelfvertrouwen: 2, E4_Activiteitsniveau: 1, N5_Onmatigheid: 1, A5_Bescheidenheid: -2, C6_Voorzichtigheid: -2, A1_Vertrouwen: -1, A3_Altruisme: -1, A2_Oprechtheid: -1 },
  Beschermer: { C6_Voorzichtigheid: 2, N1_Angst: 2, C2_Ordelijkheid: 1, A1_Vertrouwen: 1, A6_Mededogen: 1, O4_Avontuurlijkheid: -2, E5_Sensatiezucht: -2, O1_Verbeelding: -1, C4_Prestatiegerichtheid: -1, E3_Assertiviteit: -1 },
  Ontdekker: { O4_Avontuurlijkheid: 2, O1_Verbeelding: 2, E5_Sensatiezucht: 2, O5_Intellect: 1, E4_Activiteitsniveau: 1, O2_Artistieke: 1, C5_Zelfdiscipline: -2, C2_Ordelijkheid: -1, C6_Voorzichtigheid: -1 },
  Rentmeester: { A3_Altruisme: 2, A6_Mededogen: 2, O6_Liberalisme: 1, O3_Emotionaliteit: 1, C4_Prestatiegerichtheid: 1, C2_Ordelijkheid: 1, A5_Bescheidenheid: 1, A2_Oprechtheid: 1, E5_Sensatiezucht: -1 },
  Vermijder: { N1_Angst: 2, N4_Sociale_schaamte: 2, N6_Kwetsbaarheid: 2, N3_Depressie: 1, A1_Vertrouwen: 1, C5_Zelfdiscipline: -2, C1_Zelfvertrouwen: -2, E3_Assertiviteit: -2, O5_Intellect: -1, C4_Prestatiegerichtheid: -1 },
};

const KELLY_MODIFIERS = { Architect: 0.50, Veroveraar: 0.25, Beschermer: 0.25, Ontdekker: 0.25, Rentmeester: 0.40, Vermijder: 0.20 };

const ARCHETYPE_DESCRIPTIONS = {
  Architect: "Systeembouwer. Lange horizon, regelgebaseerd, lage emotionele reactiviteit. Behandelt kapitaal als ingenieursvraagstuk.",
  Veroveraar: "Status en upside gericht. Geconcentreerde posities, sterke controlebehoefte, hoge zelfovertuiging.",
  Beschermer: "Kapitaalbehoud dominant. Generatiegericht, vermijdt complexiteit, vertrouwt op vaste partners.",
  Ontdekker: "Thematisch en trendgedreven. Vroege adopter, switcht snel tussen ideeen, intellectueel nieuwsgierig.",
  Rentmeester: "Kapitaal als middel voor maatschappelijke of generationele impact. Zingeving boven rendement.",
  Vermijder: "Uitstel en delegatie. Kapitaal blijft inactief, schaamte rond financiele gesprekken, twijfel aan eigen oordeel.",
};

// Facet-hotspots exact uit v4.12, voor de risicosignalen (governance-toon).
const FACET_HOTSPOTS = {
  N1_Angst: { high: "Verhoogde angst signaleert kwetsbaarheid voor paniekverkoop bij koersdalingen. Governance: vooraf vastgelegd protocol bij negatieve marktbewegingen.", low: "Lage angst kan leiden tot onderschatting van staartrisico en Black Swan events. Governance: scenario stress tests en stop-loss niveaus verplicht opnemen in mandaat (de afspraak met jezelf)." },
  N4_Sociale_schaamte: { high: "Hoge sociale schaamte wijst op risico van vermijding rond financiele gesprekken. Governance: gestructureerde review van besluiten met buddy of coach inplannen met vaste agenda.", low: "Lage sociale schaamte ondersteunt open dialoog over verlies en fouten in accountability setting." },
  N6_Kwetsbaarheid: { high: "Onder druk overweldigd. Governance: voorgedefinieerde noodprotocollen, geen ad hoc beslissingen tijdens stress, verplichte cool down periode van minimaal 24 uur.", low: "Robuust onder druk. Geen extra interventies nodig." },
  E3_Assertiviteit: { high: "Hoge assertiviteit kan leiden tot overruling van accountability (ik weet het beter). Governance: vetorecht voor buddy of coach vastleggen.", low: "Lage assertiviteit kan leiden tot delegatie of het overnemen van adviezen van (f)influencers en bankiers zonder toetsing. Governance: actief deelnemen aan accountability meetings verplicht stellen." },
  E5_Sensatiezucht: { high: "Sterke aantrekkingskracht tot risico om het risico (thrill seeking). Governance: vooraf afgebakend klein aandeel van het portfolio dat aan nieuwe projecten mag worden toegewezen, kernportefeuille beschermd.", low: "Vermijding van risico per definitie. Governance: minimum allocatie groei assets om verwatering van het portfolio door inflatie te voorkomen." },
  O4_Avontuurlijkheid: { high: "Sterke aantrekking tot nieuwe asset classes. Governance: due diligence proces verplicht voor elke nieuwe categorie, review door accountability partner of coach.", low: "Voorkeur voor bekende structuren. Governance: periodieke review of de kernportefeuille niet te statisch wordt en voldoende gericht is op groei." },
  A1_Vertrouwen: { high: "Sterke neiging om derden te vertrouwen. Governance: onafhankelijke verificatie van aanbevelingen verplicht. Plus een wachtperiode van minimaal 72 uur. Geen emotionele investeringen doen.", low: "Wantrouwen kan leiden tot beslisparalyse. Governance: gestructureerd evaluatieproces voor externe adviseurs, tussenpersonen en influencers. Wat hebben ze echt te bieden?" },
  A5_Bescheidenheid: { high: "Hoge bescheidenheid ondersteunt feedback acceptatie. Geen extra interventies nodig.", low: "Lage bescheidenheid signaleert overconfidence. Governance: pre-mortem analyse verplicht voor grote posities. Pre-mortem: stel je voor dat je 12 maanden verder bent en deze belegging is helemaal misgegaan, wat kan er gebeurd zijn? Dus vooraf de mogelijke fouten bestuderen." },
  C1_Zelfvertrouwen: { high: "Sterk vertrouwen in eigen oordeel. Governance: review verplicht door buddy, coach of een onafhankelijke derde.", low: "Twijfel aan eigen oordeel. Governance: ondersteunende structuren en duidelijke grenzen, zowel voor verliezen als voor winstname." },
  C5_Zelfdiscipline: { high: "Sterke uitvoering van plannen. Geen extra interventies nodig.", low: "Uitstelgedrag risico. Governance: vaste accountability data en automatische escalatie met consequenties bij gemiste deadlines." },
  C6_Voorzichtigheid: { high: "Sterke risicoanalyse voor actie. Governance: actiedrempels nodig om verlamming te voorkomen. Dus vooraf bepaalde instapdrempels die, mochten ze zich voordoen, tot een aankoop moeten leiden.", low: "Snelle besluitvorming zonder volledige analyse. Governance: verplichte wachttijd boven bepaalde positiegrootte. Bijvoorbeeld 48 uur bij elk besluit groter dan 20.000 euro." },
};

// ---- 20 items (route A2). Elk item voedt een facet; facet valt onder een aspect en domein. ----
// Balans: elk domein heeft minstens een omgekeerd (reversed) item.
// Meegaandheid en Neuroticisme hebben er twee, omdat daar de opwaartse vertekening het grootst was.
// Reverse-items zijn als tegenpool geformuleerd en scoren via 6 - antwoord, zodat de facetscore
// dezelfde richting houdt.
const ITEMS = [
  { id: 1, domein: "Openheid", aspect: "Intellect", facet: "O5_Intellect", reversed: false, tekst: "Ik verdiep me graag in ingewikkelde vraagstukken en abstracte ideeen." },
  { id: 2, domein: "Openheid", aspect: "Intellect", facet: "O6_Liberalisme", reversed: false, tekst: "Ik sta open voor opvattingen die afwijken van wat gebruikelijk is." },
  { id: 3, domein: "Openheid", aspect: "Esthetiek", facet: "O4_Avontuurlijkheid", reversed: false, tekst: "Ik zoek graag nieuwe ervaringen en onbekende situaties op." },
  { id: 4, domein: "Openheid", aspect: "Esthetiek", facet: "O1_Verbeelding", reversed: true, tekst: "Ik houd mijn aandacht liever bij feiten dan bij fantasie of dagdromen." },

  { id: 5, domein: "Conscientieusheid", aspect: "IJver", facet: "C5_Zelfdiscipline", reversed: false, tekst: "Ik maak taken af, ook als ze langdurig of saai worden." },
  { id: 6, domein: "Conscientieusheid", aspect: "IJver", facet: "C1_Zelfvertrouwen", reversed: false, tekst: "Ik heb vertrouwen in mijn eigen oordeel bij belangrijke keuzes." },
  { id: 7, domein: "Conscientieusheid", aspect: "IJver", facet: "C4_Prestatiegerichtheid", reversed: true, tekst: "Ik leg de lat voor mezelf niet zo hoog en neem het werk zoals het komt." },
  { id: 8, domein: "Conscientieusheid", aspect: "Ordelijkheid", facet: "C6_Voorzichtigheid", reversed: false, tekst: "Voordat ik handel, denk ik de gevolgen grondig door." },
  { id: 9, domein: "Conscientieusheid", aspect: "Ordelijkheid", facet: "C2_Ordelijkheid", reversed: false, tekst: "Ik houd graag orde en structuur in wat ik doe." },

  { id: 10, domein: "Extraversie", aspect: "Enthousiasme", facet: "E1_Vriendelijkheid", reversed: false, tekst: "Ik maak gemakkelijk contact en voel me op mijn gemak bij mensen." },
  { id: 11, domein: "Extraversie", aspect: "Assertiviteit", facet: "E5_Sensatiezucht", reversed: false, tekst: "Ik zoek af en toe spanning en avontuur op." },
  { id: 12, domein: "Extraversie", aspect: "Assertiviteit", facet: "E3_Assertiviteit", reversed: false, tekst: "Ik neem graag de leiding en stuur een groep aan." },
  { id: 13, domein: "Extraversie", aspect: "Assertiviteit", facet: "E4_Activiteitsniveau", reversed: true, tekst: "Ik houd van een rustig tempo en hoef niet steeds bezig te zijn." },

  { id: 14, domein: "Meegaandheid", aspect: "Compassie", facet: "A3_Altruisme", reversed: false, tekst: "Ik zet me graag in voor het welzijn van anderen." },
  { id: 15, domein: "Meegaandheid", aspect: "Compassie", facet: "A6_Mededogen", reversed: true, tekst: "Ik blijf nuchter bij de zorgen van anderen en laat me er weinig door raken." },
  { id: 16, domein: "Meegaandheid", aspect: "Beleefdheid", facet: "A1_Vertrouwen", reversed: true, tekst: "Ik ben op mijn hoede en ga er niet zomaar van uit dat mensen het goed bedoelen." },
  { id: 17, domein: "Meegaandheid", aspect: "Beleefdheid", facet: "A5_Bescheidenheid", reversed: false, tekst: "Ik stel me bescheiden op en zet mezelf niet op de voorgrond." },

  { id: 18, domein: "Neuroticisme", aspect: "Terughoudendheid", facet: "N1_Angst", reversed: false, tekst: "Ik maak me vaak zorgen over dingen die kunnen gebeuren." },
  { id: 19, domein: "Neuroticisme", aspect: "Terughoudendheid", facet: "N4_Sociale_schaamte", reversed: true, tekst: "Ik voel me op mijn gemak wanneer de aandacht op mij gericht is." },
  { id: 20, domein: "Neuroticisme", aspect: "Volatiliteit", facet: "N6_Kwetsbaarheid", reversed: true, tekst: "Onder druk blijf ik kalm en houd ik het overzicht." },
];

const SCHAAL = [
  { waarde: 1, label: "Volledig oneens" },
  { waarde: 2, label: "Oneens" },
  { waarde: 3, label: "Neutraal" },
  { waarde: 4, label: "Eens" },
  { waarde: 5, label: "Volledig eens" },
];

// Schaal: het gemiddelde antwoord (1 tot 5) wordt lineair omgezet naar 0 tot 100.
// Antwoord 1 -> 0, antwoord 3 -> 50, antwoord 5 -> 100.
// som/max ligt tussen 0.2 (alles 1) en 1.0 (alles 5); we rekenen dat terug naar het
// gemiddelde antwoord en schalen dat van [1,5] naar [0,100].
function toPercent(som, max) {
  if (max === 0) return 50;
  const genormaliseerd = som / max;        // 0.2 tot 1.0
  const gemAntwoord = genormaliseerd * 5;  // 1 tot 5
  return Math.round(((gemAntwoord - 1) / 4) * 100); // 0 tot 100
}

function berekenFacetScores(antwoorden) {
  const perFacet = {};
  ITEMS.forEach((it) => {
    const ruw = antwoorden[it.id];
    if (!ruw) return;
    const gescoord = it.reversed ? 6 - ruw : ruw;
    if (!perFacet[it.facet]) perFacet[it.facet] = [];
    perFacet[it.facet].push(gescoord);
  });
  const scores = {};
  Object.keys(perFacet).forEach((f) => {
    const arr = perFacet[f];
    const gem = arr.reduce((a, b) => a + b, 0) / arr.length;
    scores[f] = toPercent(gem, 5);
  });
  return scores;
}

function berekenAspectScores(antwoorden) {
  const scores = {};
  Object.values(DOMEIN_ASPECTEN).flat().forEach((asp) => {
    const items = ITEMS.filter((it) => it.aspect === asp);
    let som = 0, max = 0;
    items.forEach((it) => {
      const ruw = antwoorden[it.id];
      if (!ruw) return;
      const gescoord = it.reversed ? 6 - ruw : ruw;
      som += gescoord; max += 5;
    });
    scores[asp] = toPercent(som, max);
  });
  return scores;
}

function berekenDomeinScores(aspectScores) {
  const scores = {};
  DOMEINEN.forEach((dom) => {
    const asps = DOMEIN_ASPECTEN[dom];
    const som = asps.reduce((a, asp) => a + aspectScores[asp], 0);
    scores[dom] = Math.round(som / asps.length);
  });
  return scores;
}

// Archetype met exacte MVP-gewichten. Facetscore 0-100 wordt gecentreerd rond 0
// (50 = neutraal) zodat positieve en negatieve gewichten kloppen. Facetten zonder
// item krijgen 50 (neutraal), zodat de formule draait zonder valse uitschieters.
function bepaalArchetype(facetScores) {
  const resultaten = Object.keys(ARCHETYPE_WEIGHTS).map((arch) => {
    const gewichten = ARCHETYPE_WEIGHTS[arch];
    let score = 0;
    Object.keys(gewichten).forEach((facet) => {
      const fs = facetScores[facet] !== undefined ? facetScores[facet] : 50;
      const gecentreerd = (fs - 50) / 50;
      score += gecentreerd * gewichten[facet];
    });
    return { naam: arch, score };
  });
  resultaten.sort((a, b) => b.score - a.score);
  return resultaten;
}

function bepaalRisicosignalen(facetScores) {
  const signalen = [];
  Object.keys(FACET_HOTSPOTS).forEach((facet) => {
    const fs = facetScores[facet];
    if (fs === undefined) return;
    if (fs >= 66) signalen.push({ facet, tekst: FACET_HOTSPOTS[facet].high, afstand: fs - 50 });
    else if (fs <= 35) signalen.push({ facet, tekst: FACET_HOTSPOTS[facet].low, afstand: 50 - fs });
  });
  signalen.sort((a, b) => b.afstand - a.afstand);
  return signalen.slice(0, 5);
}

function hoogteLabel(score) {
  if (score >= 66) return "hoog";
  if (score <= 35) return "laag";
  return "gemiddeld";
}

export default function NSCVerkorteKaractertest() {
  const [fase, setFase] = useState("intro");
  const [naam, setNaam] = useState("");
  const [antwoorden, setAntwoorden] = useState({});
  const [huidige, setHuidige] = useState(0);

  const alleBeantwoord = ITEMS.every((it) => antwoorden[it.id]);

  const resultaat = useMemo(() => {
    if (!alleBeantwoord) return null;
    const facetScores = berekenFacetScores(antwoorden);
    const aspectScores = berekenAspectScores(antwoorden);
    const domeinScores = berekenDomeinScores(aspectScores);
    const archetypeRangschikking = bepaalArchetype(facetScores);
    const archetype = archetypeRangschikking[0];
    const risico = bepaalRisicosignalen(facetScores);
    return { facetScores, aspectScores, domeinScores, archetype, risico };
  }, [antwoorden, alleBeantwoord]);

  function beantwoord(waarde) {
    const item = ITEMS[huidige];
    setAntwoorden((prev) => ({ ...prev, [item.id]: waarde }));
    if (huidige < ITEMS.length - 1) setTimeout(() => setHuidige((h) => h + 1), 120);
  }

  const voortgang = Math.round((Object.keys(antwoorden).length / ITEMS.length) * 100);

  const wrap = { fontFamily: "Inter, system-ui, sans-serif", color: WARMGRIJS, background: WARMWIT, minHeight: "100vh" };
  const container = { maxWidth: 720, margin: "0 auto", padding: "48px 24px" };
  const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

  if (fase === "intro") {
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={{ background: NAVY, padding: "40px 32px", marginBottom: 32, textAlign: "center" }}>
            <div style={{ ...serif, fontSize: 64, letterSpacing: 8, color: GOUD, fontWeight: 700, lineHeight: 1 }}>NSC</div>
            <div style={{ ...serif, fontSize: 24, letterSpacing: 5, color: GOUD, textTransform: "uppercase", marginTop: 10 }}>Neuro Structured Capital</div>
            <div style={{ height: 3, width: "100%", background: GOUD, marginTop: 24 }} />
          </div>

          <h1 style={{ ...serif, color: NAVY, fontSize: 34, lineHeight: 1.2, textAlign: "center", margin: "24px 0 12px" }}>
            Ken het karakter achter je kapitaal
          </h1>
          <p style={{ textAlign: "center", fontSize: 17, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Een verkorte analyse van twintig vragen. Je ontvangt direct een helder rapport met je dominante kapitaalarchetype, vijf hoofdtrekken, tien aspecten en de structurele signalen voor de opbouw van je vermogen.
          </p>

          <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
            {[
              ["Anders", "Niet je portefeuille, maar het karakter dat je keuzes stuurt."],
              ["Makkelijk", "Twintig stellingen, ongeveer vier minuten. Geen voorbereiding nodig."],
              ["Veilig", "Alles blijft in je eigen browser. Geen opslag, geen verzending van je gegevens."],
            ].map(([kop, tekst]) => (
              <div key={kop} style={{ background: WARMWIT, border: `1px solid ${SCHEID}`, borderLeft: `3px solid ${GOUD}`, padding: "14px 18px" }}>
                <div style={{ ...serif, color: NAVY, fontSize: 16, marginBottom: 2 }}>{kop}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{tekst}</div>
              </div>
            ))}
          </div>

          <div style={{ background: CHAMPAGNE, padding: "22px 24px", marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
              Bij elke beweging in de markt voel je de drang om iets te doen, terwijl je eigenlijk wilt vasthouden aan je plan. Je vermogen is opgebouwd, maar de rust ontbreekt. Je wilt weten waarom je doet wat je doet, zodat je met vertrouwen keuzes maakt in plaats van uit onrust.
            </p>
          </div>
          <p style={{ fontSize: 14, fontStyle: "italic", textAlign: "center", margin: "0 0 28px", color: WARMGRIJS, lineHeight: 1.6 }}>
            Wij geloven dat inzicht in je eigen karakter de brug slaat tussen onrust en rust. Deze test beschrijft structuur en gedrag. Het is geen beleggingsadvies en doet geen uitspraken over producten of rendement.
          </p>

          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <label style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: WARMGRIJS }}>Je naam (voor op het rapport)</label>
            <input value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Voornaam"
              style={{ width: "100%", padding: "12px 14px", margin: "8px 0 16px", border: `1px solid ${SCHEID}`, background: "#fff", fontSize: 16, boxSizing: "border-box" }} />
            <button onClick={() => setFase("test")} style={{ width: "100%", padding: "16px", background: NAVY, color: WARMWIT, border: "none", fontSize: 16, letterSpacing: 1, cursor: "pointer", ...serif }}>
              Start de test
            </button>
            <p style={{ fontSize: 11, textAlign: "center", color: WARMGRIJS, marginTop: 16, lineHeight: 1.5 }}>
              Deze test draait volledig lokaal in je eigen browser. Er worden geen antwoorden opgeslagen of verzonden. Het rapport maak je zelf op je eigen apparaat. De pagina wordt gehost via GitHub Pages, dat standaard technische bezoekgegevens zoals je IP-adres kan registreren.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (fase === "test") {
    const item = ITEMS[huidige];
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={{ height: 4, background: SCHEID, marginBottom: 8 }}>
            <div style={{ height: 4, background: GOUD, width: `${voortgang}%`, transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: 12, letterSpacing: 1, color: WARMGRIJS, marginBottom: 40, textTransform: "uppercase" }}>
            Vraag {huidige + 1} van {ITEMS.length}
          </div>

          <h2 style={{ ...serif, color: NAVY, fontSize: 26, lineHeight: 1.3, minHeight: 100 }}>{item.tekst}</h2>

          <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
            {SCHAAL.map((s) => {
              const gekozen = antwoorden[item.id] === s.waarde;
              return (
                <button key={s.waarde} onClick={() => beantwoord(s.waarde)}
                  style={{ textAlign: "left", padding: "14px 18px", background: gekozen ? NAVY : "#fff", color: gekozen ? WARMWIT : WARMGRIJS, border: `1px solid ${gekozen ? NAVY : SCHEID}`, fontSize: 15, cursor: "pointer" }}>
                  {s.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button onClick={() => setHuidige((h) => Math.max(0, h - 1))} disabled={huidige === 0}
              style={{ background: "none", border: "none", color: huidige === 0 ? SCHEID : WARMGRIJS, cursor: huidige === 0 ? "default" : "pointer", fontSize: 14 }}>
              Vorige
            </button>
            {alleBeantwoord && (
              <button onClick={() => setFase("rapport")} style={{ background: GOUD, border: "none", color: NAVY, padding: "12px 24px", fontSize: 15, cursor: "pointer", ...serif }}>
                Bekijk mijn rapport
              </button>
            )}
            {!alleBeantwoord && huidige < ITEMS.length - 1 && antwoorden[item.id] && (
              <button onClick={() => setHuidige((h) => h + 1)} style={{ background: "none", border: `1px solid ${SCHEID}`, color: WARMGRIJS, padding: "8px 18px", cursor: "pointer", fontSize: 14 }}>
                Volgende
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { aspectScores, domeinScores, archetype, risico } = resultaat;
  const kelly = KELLY_MODIFIERS[archetype.naam];
  return (
    <div style={wrap}>
      <style>{`@media print { .geen-print { display: none !important; } body { background: #fff; } }`}</style>
      <div style={container}>
        <div className="geen-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <button onClick={() => { setFase("intro"); setAntwoorden({}); setHuidige(0); }} style={{ background: "none", border: `1px solid ${SCHEID}`, padding: "8px 16px", cursor: "pointer", color: WARMGRIJS }}>
            Opnieuw
          </button>
          <button onClick={() => window.print()} style={{ background: NAVY, color: WARMWIT, border: "none", padding: "10px 22px", cursor: "pointer", ...serif }}>
            Download als PDF
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ ...serif, fontSize: 14, letterSpacing: 4, color: GOUD, fontWeight: 700 }}>NSC</div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: WARMGRIJS, textTransform: "uppercase" }}>Neuro Structured Capital</div>
          <div style={{ height: 2, width: 56, background: GOUD, margin: "14px auto" }} />
        </div>

        <h1 style={{ ...serif, color: NAVY, fontSize: 28, textAlign: "center", margin: "8px 0 4px" }}>Verkort karakterrapport</h1>
        {naam && <p style={{ textAlign: "center", margin: "0 0 24px", fontSize: 15 }}>voor {naam}</p>}

        <div style={{ background: NAVY, color: WARMWIT, padding: "28px 26px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOUD, marginBottom: 6 }}>Je dominante kapitaalarchetype</div>
          <div style={{ ...serif, fontSize: 32, marginBottom: 10 }}>{archetype.naam}</div>
          <p style={{ margin: "0 0 12px", fontSize: 15, opacity: 0.92, lineHeight: 1.6 }}>{ARCHETYPE_DESCRIPTIONS[archetype.naam]}</p>
          <div style={{ borderTop: `1px solid ${GOUD}`, paddingTop: 12, fontSize: 13, opacity: 0.85 }}>
            <strong style={{ color: GOUD }}>Kelly-modulator.</strong> Als illustratieve referentiebandbreedte hoort bij dit profiel een fractie van ongeveer {Math.round(kelly * 100)} procent van de volledige Kelly. Dit is een structurele observatie, geen advies.
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: WARMGRIJS, marginBottom: 14 }}>Vijf hoofdtrekken</div>
          {DOMEINEN.map((dom) => (
            <div key={dom} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                <span style={{ color: NAVY, fontWeight: 600 }}>{dom}</span>
                <span style={{ color: GOUD, fontWeight: 700 }}>{domeinScores[dom]} ({hoogteLabel(domeinScores[dom])})</span>
              </div>
              <div style={{ height: 8, background: SCHEID }}>
                <div style={{ height: 8, background: dom === "Neuroticisme" ? BORDEAUX : GOUD, width: `${domeinScores[dom]}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: WARMGRIJS, marginBottom: 6 }}>Tien aspecten</div>
          <p style={{ fontSize: 13, margin: "0 0 14px", color: WARMGRIJS }}>Elke hoofdtrek bestaat uit twee onderliggende aspecten. Deze laag geeft scherper inzicht in de structuur van je profiel.</p>
          {DOMEINEN.map((dom) => (
            <div key={dom} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: NAVY, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{dom}</div>
              {DOMEIN_ASPECTEN[dom].map((asp) => (
                <div key={asp} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                    <span style={{ color: NAVY }}>{asp}</span>
                    <span style={{ color: GOUD, fontWeight: 700 }}>{aspectScores[asp]} ({hoogteLabel(aspectScores[asp])})</span>
                  </div>
                  <div style={{ height: 6, background: SCHEID }}>
                    <div style={{ height: 6, background: GOUD, width: `${aspectScores[asp]}%` }} />
                  </div>
                  <p style={{ fontSize: 12, margin: "6px 0 0", color: WARMGRIJS, lineHeight: 1.5 }}>{ASPECT_DESCRIPTIONS[asp]}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ background: CHAMPAGNE, padding: "22px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: NAVY, marginBottom: 12 }}>Structurele signalen voor governance</div>
          {risico.length === 0 ? (
            <p style={{ fontSize: 14, margin: 0 }}>Geen uitgesproken signalen. De profielwaarden liggen dicht bij het midden.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {risico.map((r, i) => (
                <li key={i} style={{ fontSize: 14, marginBottom: 10, color: WARMGRIJS, lineHeight: 1.55 }}>{r.tekst}</li>
              ))}
            </ul>
          )}
        </div>

        <p style={{ fontSize: 12, fontStyle: "italic", color: WARMGRIJS, borderTop: `1px solid ${SCHEID}`, paddingTop: 16, lineHeight: 1.6 }}>
          Dit rapport beschrijft karakter, structuur en gedrag rond vermogensopbouw. Het betreft een indicatieve verkorte analyse van twintig vragen en vormt geen volledige meting. Het is geen beleggingsadvies en doet geen uitspraken over financiele producten, allocatiepercentages of rendement.
        </p>

        <div className="geen-print" style={{ textAlign: "center", marginTop: 28 }}>
          <p style={{ ...serif, color: NAVY, fontSize: 18, marginBottom: 4 }}>Wil je het volledige beeld?</p>
          <p style={{ fontSize: 14, marginBottom: 16 }}>De volledige analyse van honderdtwintig vragen brengt je profiel volledig in kaart.</p>
        </div>
      </div>
    </div>
  );
}
