/**
 * Waveform Audio Player
 * Advanced audio visualization with WaveSurfer.js
 */

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import type { GeneratedTrack } from '../../types/music';

interface WaveformPlayerProps {
  track: GeneratedTrack;
  autoPlay?: boolean;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ track, autoPlay = false }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#6366f1',
      progressColor: '#8b5cf6',
      cursorColor: '#a855f7',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 80,
      barGap: 2,
      normalize: true,
      responsive: true,
    });

    wavesurfer.load(track.audioUrl);

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      if (autoPlay) {
        wavesurfer.play();
        setIsPlaying(true);
      }
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [track.audioUrl, autoPlay]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      {/* Track Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{track.title}</h3>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{track.genre}</span>
          <span>•</span>
          <span>{track.bpm} BPM</span>
          <span>•</span>
          <span>{track.key}</span>
        </div>
      </div>

      {/* Waveform */}
      <div ref={waveformRef} className="mb-4" />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Time */}
          <div className="text-sm text-white font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-24"
          />
        </div>

        {/* Download */}
        <button className="p-2 hover:bg-slate-700 rounded-lg transition">
          <Download className="w-5 h-5 text-slate-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
};
