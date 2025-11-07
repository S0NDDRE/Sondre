# 🎨 Vannmerk Fjerner Pro

En AI-drevet applikasjon som fjerner vannmerker, logoer og uønskede objekter fra videoer og bilder på sekunder. Perfekt for innholdsskapere, markedsførere og studenter.

![Watermark Remover](https://img.shields.io/badge/AI-Watermark%20Remover-purple?style=for-the-badge&logo=image)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)

## ✨ Funksjoner

### 🖼️ AI-Drevet Vannmerkefjerning

- **Automatisk Deteksjon**: AI identifiserer automatisk vannmerker, logoer og uønskede objekter
- **Manuell Markering**: Marker selv områder du vil fjerne med presist utvalgsverktøy
- **Video & Bilder**: Støtter både stillbilder (JPG, PNG, WEBP) og videoer (MP4, AVI, MOV)
- **Raske Resultater**: Behandling på sekunder med avanserte inpainting-algoritmer
- **Høy Kvalitet**: Bevarer original bildekvalitet uten synlige spor

### 🤖 Smart AI-Assistent

- **Samtalebasert Veiledning**: Chat med AI-assistenten for trinn-for-trinn instruksjoner
- **Norsk Språkstøtte**: Fullstendig norsk grensesnitt og AI-assistent
- **Kontekstuell Hjælp**: Får forslag til beste teknikker for ditt spesifikke innhold
- **Sanntids Tilbakemelding**: Umiddelbar respons og veiledning under prosessen

### 🎯 Presist Utvalgsverktøy

- **Frihåndsmarkering**: Tegn nøyaktige områder med musen
- **Rektangulært Utvalg**: Rask markering av firkantede områder
- **Zoom & Pan**: Forstørr for presisjon på små detaljer
- **Forhandsvisning**: Se resultat før endelig prosessering

### 📥 Last Opp & Last Ned

- **Dra-og-Slipp**: Enkel filopplasting med dra-og-slipp-grensesnitt
- **Størrelsesvalidering**: Håndterer store filer opp til 100MB
- **Flere Formater**: Eksporter i PNG, JPG, WEBP, MP4
- **Ingen Vannmerker**: Rene, profesjonelle resultater klare for bruk

## 🚀 Komme i Gang

### Forutsetninger

- Node.js 18+
- npm eller yarn

### Installasjon

1. Klon repositoriet:
```bash
git clone https://github.com/S0NDDRE/watermark-remover-pro.git
cd watermark-remover-pro
```

2. Installer avhengigheter:
```bash
npm install
```

3. Sett opp miljøvariabler:
```bash
cp .env.local.example .env.local
```

Rediger `.env.local` og legg til API-nøklene:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start utviklingsserveren:
```bash
npm run dev
```

5. Åpne nettleseren på `http://localhost:5173`

## 🏗️ Prosjektstruktur

```
watermark-remover-pro/
├── components/          # React-komponenter
│   ├── WatermarkRemover.tsx    # Hovedkomponent
│   ├── FileUploader.tsx        # Filopplasting
│   ├── MediaPreview.tsx        # Forhåndsvisning
│   ├── SelectionTool.tsx       # Utvalgsverktøy
│   └── ChatWindow.tsx          # AI-assistent chat
├── services/           # Forretningslogikk og API-integrasjoner
│   ├── watermark/      # Vannmerkefjerning
│   ├── ai/             # AI-assistenttjenester
│   └── media/          # Medie-behandling
├── store/              # Tilstandsadministrasjon (Zustand)
├── types/              # TypeScript-typedefinisjoner
└── utils/              # Hjelpefunksjoner
```

## 🎨 Teknologistakk

### Frontend
- **React 19**: Nyeste React med samtidige funksjoner
- **TypeScript**: Type-sikker utvikling
- **Tailwind CSS**: Utility-first CSS-rammeverk
- **Framer Motion**: Jevne animasjoner
- **Zustand**: Lett tilstandsadministrasjon

### Mediebehandling
- **Canvas API**: Bildemanipulering og utvalg
- **FFmpeg.wasm**: Videobehandling i nettleseren
- **React Dropzone**: Dra-og-slipp filopplasting

### AI & ML
- **Google Gemini**: AI-assistent og analyse
- **Computer Vision AI**: Automatisk vannmerkedeteksjon
- **Inpainting Algoritmer**: Intelligent objektfjerning

## 📖 Bruksanvisning

### Laste Opp Fil

1. Klikk på **Last Opp** eller dra og slipp en fil
2. Støttede formater:
   - Bilder: JPG, PNG, WEBP, BMP
   - Videoer: MP4, AVI, MOV, WEBM
3. Maks filstørrelse: 100MB

### Fjerne Vannmerke

**Automatisk modus:**
1. Klikk på **Automatisk Deteksjon**
2. AI finner og markerer vannmerker automatisk
3. Bekreft markeringene eller juster etter behov
4. Klikk **Fjern Vannmerke**

**Manuell modus:**
1. Velg **Manuelt Utvalg**
2. Klikk og dra for å markere området med vannmerket
3. Bruk verktøyene for å justere utvalget
4. Klikk **Fjern Vannmerke**

### AI-Assistent

1. Åpne **Chat**-vinduet
2. Still spørsmål på norsk eller engelsk
3. Få trinn-for-trinn veiledning
4. Be om tips for beste resultater

### Laste Ned Resultat

1. Forhåndsvis det rensede bildet/videoen
2. Velg eksportformat (PNG, JPG, WEBP, MP4)
3. Klikk **Last Ned**
4. Filen lagres uten vannmerker

## 🔑 API-Nøkler

Du trenger API-nøkler for følgende tjenester:

- **Gemini API**: Få fra [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Computer Vision API**: Valgfri for avansert automatisk deteksjon

## 🤝 Bidrag

Bidrag er velkomne! Send gjerne inn en Pull Request.

1. Fork repositoriet
2. Opprett din feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dine endringer (`git commit -m 'Legg til en fantastisk funksjon'`)
4. Push til branchen (`git push origin feature/AmazingFeature`)
5. Åpne en Pull Request

## 📝 Lisens

Dette prosjektet er lisensiert under MIT-lisensen - se [LICENSE](LICENSE)-filen for detaljer.

## 🙏 Anerkjennelser

- Google for Gemini AI
- FFmpeg-teamet for kraftig videobehandling
- React og TypeScript-fellesskapet
- Alle bidragsytere til åpen kildekode

## 🐛 Kjente Problemer

- Noen funksjoner krever aktive API-nøkler og fungerer kanskje ikke uten dem
- Videobehandling kan ta lengre tid for store filer
- Automatisk deteksjon fungerer best med tydelige vannmerker
- Komplekse vannmerker kan kreve manuell justering

## 🗺️ Veikart

- [ ] Støtte for batch-behandling av flere filer
- [ ] Forbedret AI-deteksjon for komplekse vannmerker
- [ ] Mobilapp (iOS/Android)
- [ ] Skymalelagring og synkronisering
- [ ] Avanserte redigeringsverktøy
- [ ] Støtte for flere videoformater
- [ ] API for integrasjon med andre verktøy
- [ ] Premium-funksjoner for profesjonelle brukere

## 💡 Brukstilfeller

### 📹 Innholdsskapere
- Fjern vannmerker fra stock-bilder for presentasjoner
- Rens videomateriale før redigering
- Forbered innhold for publisering på sosiale medier

### 📊 Markedsførere
- Gjenbruk visuelt innhold for kampanjer
- Rens produktbilder for markedsføringsmateriell
- Forbered presentasjoner uten distraksjoner

### 🎓 Studenter
- Rens skjermbilder for akademiske presentasjoner
- Forbered videomateriale for forskningsprosjekter
- Fjern distraherende elementer fra læremateriale

## 📧 Kontakt

For spørsmål, forslag eller problemer, vennligst åpne en issue på GitHub.

---

Laget med ❤️ av Vannmerk Fjerner Pro-teamet
