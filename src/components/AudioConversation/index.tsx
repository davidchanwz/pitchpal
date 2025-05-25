import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { LiveAudioVisualizer } from 'react-audio-visualize';

interface AudioConversationProps {
  inputAudioTrack: MediaStreamTrack | null;
  outputAudioTrack: MediaStreamTrack | null;
  profileUrl: string;
  avatarName: string;
}

const AudioConversation: React.FC<AudioConversationProps> = ({ 
  inputAudioTrack, 
  outputAudioTrack,
  profileUrl,
  avatarName 
}) => {
  const [inputRecorder, setInputRecorder] = useState<MediaRecorder | null>(null);
  const [outputRecorder, setOutputRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    if (inputAudioTrack) {
      const stream = new MediaStream([inputAudioTrack]);
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setInputRecorder(recorder);
    }

    if (outputAudioTrack) {
      const stream = new MediaStream([outputAudioTrack]);
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setOutputRecorder(recorder);
    }

    return () => {
      inputRecorder?.stop();
      outputRecorder?.stop();
    };
  }, [inputAudioTrack, outputAudioTrack]);

  return (
    <div className="w-full h-full bg-gray-800">
      <div className="flex items-center justify-content-center" style={{ paddingTop: '200px' }}>
        <Image
          src={profileUrl} 
          alt={avatarName}
          width={200}
          height={200}
          style={{ borderRadius: '50%' }}
        />
      </div>

      <div className="mt-2 text-center" style={{ paddingBottom: '80px' }}>
        <h2 className="text-xl font-bold text-white">{avatarName}</h2>
      </div>

      <div className="w-full h-full flex items-center justify-content-center relative overflow-hidden">
        {outputRecorder && (
          <div className="h-16">
            <LiveAudioVisualizer
              mediaRecorder={outputRecorder}
              width={400}
              height={64}
              barWidth={4}
              gap={8}
              barColor="#FF8C00"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioConversation;
