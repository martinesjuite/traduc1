
import React, { useRef, useState } from 'react';
import { Play, Pause, Download, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioUrl: string;
  filename: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, filename }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const downloadAudio = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = filename;
    a.click();
    toast({
      title: "Descarga iniciada",
      description: `Descargando: ${filename}`
    });
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Audio Response</Label>
        </div>
        <Button
          onClick={downloadAudio}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          onClick={toggleAudioPlayback}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pausar' : 'Reproducir'}
        </Button>
        
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          controls
          className="flex-1 h-8"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
