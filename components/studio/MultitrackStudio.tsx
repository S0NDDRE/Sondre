/**
 * Multitrack Studio Interface
 * Professional DAW-style timeline with drag-and-drop
 */

import React, { useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Plus } from 'lucide-react';
import { useMusicStore } from '../../store/musicStore';

export const MultitrackStudio: React.FC = () => {
  const {
    currentProject,
    isPlaying,
    currentTime,
    duration,
    volume,
    setPlaying,
    setCurrentTime,
    setVolume,
  } = useMusicStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    setCurrentTime(newTime);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {currentProject?.name || 'Untitled Project'}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{currentProject?.bpm || 120} BPM</span>
            <span>•</span>
            <span>{currentProject?.timeSignature || '4/4'}</span>
            <span>•</span>
            <span>{currentProject?.key || 'C'}</span>
          </div>
        </div>

        <button
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add Track
        </button>
      </div>

      {/* Transport Controls */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-700 rounded-lg transition">
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setPlaying(!isPlaying)}
              className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>

            <button className="p-2 hover:bg-slate-700 rounded-lg transition">
              <SkipForward className="w-5 h-5 text-white" />
            </button>

            <div className="text-white font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-slate-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-slate-400 w-12">{volume}%</span>
          </div>

          {/* Zoom Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
            >
              −
            </button>
            <span className="text-sm text-slate-400 w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        {/* Timeline Ruler */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 h-8 flex items-center px-4 z-10">
          {Array.from({ length: Math.ceil(duration / 4) }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 text-xs text-slate-400"
              style={{ width: `${40 * zoom}px` }}
            >
              {i * 4}s
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="relative">
          {currentProject?.tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex border-b border-slate-700 hover:bg-slate-800/50"
            >
              {/* Track Header */}
              <div className="w-48 flex-shrink-0 p-3 bg-slate-800 border-r border-slate-700">
                <div className="text-sm font-medium text-white mb-1">{track.name}</div>
                <div className="flex gap-2">
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      track.solo
                        ? 'bg-yellow-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    S
                  </button>
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      track.mute
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    M
                  </button>
                </div>
              </div>

              {/* Track Timeline */}
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                className="flex-1 relative cursor-pointer"
                style={{ minHeight: '60px' }}
              >
                {/* Track Region */}
                {track.generatedTrack && (
                  <div
                    className="absolute top-2 h-14 bg-gradient-to-r from-purple-600/80 to-blue-600/80 rounded border border-purple-500/50 hover:border-purple-400 transition"
                    style={{
                      left: `${(track.position / duration) * 100}%`,
                      width: `${(track.generatedTrack.duration / duration) * 100}%`,
                    }}
                  >
                    <div className="px-2 py-1 text-xs text-white truncate">
                      {track.generatedTrack.title}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {(!currentProject || currentProject.tracks.length === 0) && (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <div className="text-center">
                <p className="mb-2">No tracks in this project</p>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                  Add Track
                </button>
              </div>
            </div>
          )}

          {/* Playhead */}
          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-purple-500 pointer-events-none z-20"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute top-0 -left-1 w-2 h-2 bg-purple-500 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
