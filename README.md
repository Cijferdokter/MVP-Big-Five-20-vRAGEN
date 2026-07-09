# NSC Verkorte Karaktertest

Tijdelijke, lokaal draaiende karaktertest voor webinargebruik. Draait volledig in de browser: geen opslag, geen verzending, PDF via de printfunctie van de browser.

## Publiceren op GitHub Pages

1. Maak een nieuwe repository aan op GitHub. Onthoud de naam.
2. Pas in `vite.config.js` de regel `base` aan naar je repo-naam. Heet je repo bijvoorbeeld `nsc-test`, dan is de base `/nsc-test/` (met schuine strepen ervoor en erna). Dit is de belangrijkste stap: klopt de base niet, dan laadt de pagina wit.
3. Push alle bestanden uit deze map naar de `main` branch van je repo.
4. Ga op GitHub naar Settings, dan Pages. Zet bij "Build and deployment" de bron (Source) op "GitHub Actions".
5. De workflow bouwt en publiceert automatisch. Na een minuut staat de test op `https://JOUWNAAM.github.io/REPO-NAAM/`.

## Na het webinar

Zet de test offline door in Settings, Pages de publicatie uit te schakelen, of maak de repository prive of verwijder hem. Zo blijft de opzet eenmalig.

## Lokaal testen (optioneel)

```
npm install
npm run dev
```
