# 🎵 AI Music Generation Studio

A professional, full-featured AI-powered music generation and production studio built with React, TypeScript, and cutting-edge AI models.

![AI Music Studio](https://img.shields.io/badge/AI-Music%20Studio-purple?style=for-the-badge&logo=music)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎼 Advanced AI Music Generation

- **Text-to-Music**: Generate complete songs from simple text descriptions
- **Lyrics-to-Song**: Transform your lyrics into full compositions with vocals and instruments
- **Audio Extension**: Extend existing audio files to your desired length and style
- **Sample-to-Song**: Upload audio samples and create full tracks around them
- **Multi-Model Support**: Choose from Suno V4/V4.5/V5, Udio Allegro V1.5, and Stable Audio

### 🎚️ Professional Multitrack Studio

- **DAW-Style Timeline**: Drag-and-drop interface similar to Ableton Live, Logic Pro, and FL Studio
- **Generative Stems**: AI generates new layers that automatically adapt to your existing tracks
- **12+ Track Stem Separation**: Isolate vocals, drums, bass, guitar, piano, synth, and more
- **Professional Controls**: Volume, pitch, tempo, pan, EQ, and effects on every track
- **Visual Waveforms**: Advanced audio visualization with WaveSurfer.js

### 🎤 Voice AI & Cloning

- **AI Vocal Synthesis**: High-quality, realistic voice generation
- **Custom Voice Cloning**: Clone any voice from 3-60 seconds of audio
- **Multilingual Support**: Generate vocals in multiple languages
- **Voice-to-Instrument**: Convert humming/singing to realistic instruments
- **Pitch Correction**: Automatic or manual vocal tuning with AI assistance

### 🎹 MIDI Generation & Export

- **Audio-to-MIDI**: Convert audio recordings to editable MIDI
- **Text-to-MIDI**: Generate MIDI from text descriptions
- **MIDI Export**: Export all tracks as MIDI for use in any DAW
- **DAW Integration**: VST/AU plugin support (planned)

### 🎛️ AI Mixing & Mastering

- **Auto-Mix**: AI-powered automatic mixing with professional results
- **Smart Mastering**: Adaptive mastering for streaming, CD, vinyl, or club
- **Audio Effects**: Reverb, delay, distortion, chorus, EQ, compression, filtering
- **Reference Matching**: Match your mix to professional reference tracks
- **Noise Removal**: AI-powered background noise elimination

### 🤖 Smart AI Bot

- **Personalized Assistant**: Learns your style preferences and production habits
- **Production Analysis**: Analyzes your work and provides actionable insights
- **Contextual Suggestions**: Real-time suggestions for improvements and arrangements
- **Natural Language Commands**: Control the studio with conversational commands

### 📤 Export & Commercial Use

- **Multi-Format Export**: MP3, WAV (24-bit lossless), FLAC, MIDI, MP4
- **Stem Export**: Download individual tracks for further production
- **Royalty-Free**: All generated music is 100% free for commercial use
- **No Watermarks**: Professional, clean exports ready for distribution

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-music-studio.git
cd ai-music-studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## 🏗️ Project Structure

```
ai-music-studio/
├── components/          # React components
│   ├── studio/         # Studio interface components
│   ├── audio/          # Audio player and visualization
│   └── effects/        # Audio effects UI
├── services/           # Business logic and API integrations
│   ├── music/          # Music generation services
│   ├── audio/          # Audio processing services
│   ├── voice/          # Voice AI services
│   ├── midi/           # MIDI services
│   └── ai/             # Smart bot services
├── store/              # State management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # Third-party library integrations
```

## 🎨 Tech Stack

### Frontend
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Zustand**: Lightweight state management

### Audio & Music
- **WaveSurfer.js**: Advanced audio visualization
- **Tone.js**: Web Audio framework
- **@tonejs/midi**: MIDI processing
- **Howler.js**: Audio playback
- **Pizzicato.js**: Audio effects

### AI & ML
- **Google Gemini**: AI assistant and analysis
- **Suno AI**: Music generation
- **Udio**: Advanced music synthesis
- **Stable Audio**: High-quality audio generation

## 📖 Usage

### Generating Music

1. Navigate to the **Generate** tab
2. Choose your generation type:
   - Text to Music
   - Lyrics to Song
   - Extend Audio
   - Sample to Song
3. Select your AI model, genre, mood, and voice type
4. Adjust tempo and duration
5. Click **Generate Music**

### Working in the Studio

1. Switch to the **Studio** tab
2. Add generated tracks to your project
3. Arrange tracks on the timeline
4. Adjust volume, pan, and effects
5. Use the playback controls to preview

### Separating Stems

1. Go to the **Stems** tab
2. Upload an audio file
3. Select the number of stems (4, 8, or 12)
4. Wait for AI processing
5. Download or edit individual stems

### Exporting

1. Navigate to the **Export** tab
2. Select your track
3. Choose format (MP3, WAV, FLAC, MIDI)
4. Configure quality settings
5. Click export and download

## 🔑 API Keys

You'll need API keys for the following services:

- **Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Suno API**: Contact Suno for access
- **Udio API**: Sign up at [Udio](https://udio.com)
- **Stable Audio**: Get from [Stability AI](https://stability.ai)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Suno AI for amazing music generation
- Udio for advanced synthesis capabilities
- Stability AI for Stable Audio
- Google for Gemini AI
- All open-source contributors

## 🐛 Known Issues

- Some features require active API keys and may not work without them
- Voice cloning requires 3-60 seconds of high-quality audio
- Large projects may require significant processing time
- MIDI export is currently in beta

## 🗺️ Roadmap

- [ ] VST/AU plugin for DAW integration
- [ ] Live performance mode
- [ ] Collaborative editing
- [ ] Marketplace for presets and templates
- [ ] Video generation for music
- [ ] Mobile app (iOS/Android)
- [ ] Offline mode
- [ ] Cloud storage integration

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

Made with ❤️ by the AI Music Studio Team
