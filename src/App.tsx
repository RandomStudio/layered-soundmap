import { MouseEvent, TouchEvent, useMemo, useRef, useState } from 'react';
import styles from 'styles/app.module.scss';

import urlImgFloorPlan from './assets/img/floorplan.png';
import urlImgShadowDoux from './assets/img/shadow-doux.png';
import urlImgShadowReve from './assets/img/shadow-reve.png';
import urlImgShadowYou from './assets/img/shadow-you.png';
import urlImgSoundMap from './assets/img/soundmap-blur-50.png';
import urlSoundDoux from './assets/wav/Doux.wav';
import urlSoundReve from './assets/wav/Reve.wav';
import urlSoundYou from './assets/wav/You.wav';
import urlSoundAmbience from './assets/wav/Ambience.wav';
import AudioPipeline from './components/AudioPipeline';
import { AudioTrackType } from './types';

// import urlImageCursor from './assets/img/ear-32.png';
// interface Point {
//   x: number
//   y: number
// }

const isTouchEnabled = () => (
  ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0)
);

const App = () => {

  const soundMapCanvas = useRef<HTMLCanvasElement>(null);
  const soundmap = useRef<HTMLImageElement>(null);
  const floorplan = useRef<HTMLImageElement>(null);
  const soundDoux = useRef<HTMLAudioElement>(null);
  const soundReve = useRef<HTMLAudioElement>(null);
  const soundYou = useRef<HTMLAudioElement>(null);
  const soundAmbience = useRef<HTMLAudioElement>(null);

  const audio = useMemo(() => new AudioPipeline(), []);

  const [allSoundsLoaded, setAllSoundsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundMapCtx, setSoundMapCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [sampledColor, setSampledColor] = useState<Uint8ClampedArray>(new Uint8ClampedArray(4).fill(0));
  const [volume, setVolume] = useState(0.5);
  const [volumeAmbience, setVolumeAmbience] = useState(0.5);

  const drawSoundMap = () => {
    if (!soundMapCanvas.current || !soundmap.current) {
      console.error('Could not draw sound map; element does not exist.');
      return;
    }
    soundMapCanvas.current!.width = soundmap.current!.naturalWidth;
    soundMapCanvas.current!.height = soundmap.current!.naturalHeight;
    const ctx = soundMapCanvas.current!.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(soundmap.current!, 0, 0, soundmap.current!.naturalWidth, soundmap.current!.naturalHeight);
    } else {
      console.error('Could not draw sound map; failed to create canvas context.');
      return;
    }
    setSoundMapCtx(ctx);
  }

  const onLoadAudio = () => {
    if (isPlaying) {
      setAllSoundsLoaded(audio.areAllTracksLoaded());
      if (audio.areAllTracksLoaded()) {
        audio.seek(0);
      }
    }
  }

  const start = () => {
    audio.addTrack(AudioTrackType.DOUX, soundDoux.current!);
    audio.addTrack(AudioTrackType.REVE, soundReve.current!);
    audio.addTrack(AudioTrackType.YOU, soundYou.current!);
    audio.addTrack(AudioTrackType.AMBIENCE, soundAmbience.current!);
    setIsPlaying(true);
    audio.start();
    setAllSoundsLoaded(audio.areAllTracksLoaded());
    updateVolumes();
    if (allSoundsLoaded) {
      audio.seek(0);
    }
  }

  const onMouseMove = (event: MouseEvent<HTMLImageElement>) => {
    if (isPlaying && floorplan.current && soundMapCtx) {
      const rect = floorplan.current!.getBoundingClientRect();
      sampleColor(
        (event.pageX - rect.left) / rect.width,
        (event.pageY - rect.top) / rect.height
      );
    }
  }

  const onTouchMove = (event: TouchEvent<HTMLImageElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (isPlaying && floorplan.current && soundMapCtx) {
      const rect = floorplan.current!.getBoundingClientRect();
      sampleColor(
        (event.touches[0].pageX - rect.left) / rect.width,
        (event.touches[0].pageY - rect.top) / rect.height
      );
    }
  }

  const sampleColor = (x: number, y: number) => {
    if (soundMapCtx) {
      setSampledColor(
        soundMapCtx.getImageData(
          Math.round(soundMapCtx.canvas.width * x),
          Math.round(soundMapCtx.canvas.height * y),
          1,
          1
        ).data
      );
      updateVolumes();
    }
  }

  const updateVolumes = () => {
    const [r, g, b] = sampledColor;
    audio.getTracksByType(AudioTrackType.DOUX).forEach(t => t.volume = 0.7 * volume * r / 255.0);
    audio.getTracksByType(AudioTrackType.REVE).forEach(t => t.volume = volume * g / 255.0);
    audio.getTracksByType(AudioTrackType.YOU).forEach(t => t.volume = volume * b / 255.0);
    audio.getTracksByType(AudioTrackType.AMBIENCE).forEach(t => t.volume = volume * volumeAmbience);
  }

  return (
    <div className={styles.app}>

      <audio
        ref={soundDoux}
        src={urlSoundDoux}
        loop
        preload="auto"
        onCanPlayThrough={() => onLoadAudio()}
      />
      <audio
        ref={soundReve}
        src={urlSoundReve}
        loop
        preload="auto"
        onCanPlayThrough={() => onLoadAudio()}
      />
      <audio
        ref={soundYou}
        src={urlSoundYou}
        loop
        preload="auto"
        onCanPlayThrough={() => onLoadAudio()}
      />
      <audio
        ref={soundAmbience}
        src={urlSoundAmbience}
        loop
        preload="auto"
        onCanPlayThrough={() => onLoadAudio()}
      />

      <div className={styles.map}>
        <img
          ref={soundmap}
          className={styles.hidden}
          draggable={false}
          src={urlImgSoundMap}
          onLoad={drawSoundMap}
        />
        <canvas
          ref={soundMapCanvas}
          className={styles.hidden}
        />
        <img
          ref={floorplan}
          className={styles.floorplan}
          draggable={false}
          src={urlImgFloorPlan}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchMove}
          onTouchMove={onTouchMove}
        />
        <div
          className={styles.shadows}
          style={{
            left: floorplan.current?.getBoundingClientRect()?.left,
            top: floorplan.current?.getBoundingClientRect()?.top,
            width: floorplan.current?.getBoundingClientRect()?.width,
            height: floorplan.current?.getBoundingClientRect()?.height,
          }}
        >
          <img
            src={urlImgShadowDoux}
            draggable={false}
            style={{ filter: `opacity(${0.6 * (1.0 - sampledColor[0] / 255.0)})` }}
          />
          <img
            src={urlImgShadowReve}
            draggable={false}
            style={{ filter: `opacity(${0.6 * (1.0 - sampledColor[1] / 255.0)})` }}
          />
          <img
            src={urlImgShadowYou}
            draggable={false}
            style={{ filter: `opacity(${0.6 * (1.0 - sampledColor[2] / 255.0)})` }}
          />
        </div>
        {/* <img
          src={urlImageCursor}
          className={`${styles.cursor} ${hasSoundStarted ? styles.animating : ''}`}
          style={{ left: `${mousePos.x - 16}px`, top: `${mousePos.y - 16}px` }}
        /> */}
      </div>

      {isPlaying && (
        <div className={styles.beat} />
      )}

      <div className={styles.footer}>
        <div className={styles.volumeControl}>
          <span>AMBIENCE VOLUME</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volumeAmbience * 100.0}
            onChange={e => {
              setVolumeAmbience(Number(e.target.value) / 100.0);
              updateVolumes();
            }}
          />
        </div>
        <div className={styles.volumeControl}>
          <span>OVERALL VOLUME</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100.0}
            onChange={e => {
              setVolume(Number(e.target.value) / 100.0);
              updateVolumes();
            }}
          />
        </div>
      </div>

      {!allSoundsLoaded && (
        <div className={styles.modal}>
          <div className={styles.loader} />
        </div>
      )}

      {!isPlaying && (
        <div className={styles.modal} onClick={start}>
          {isTouchEnabled() && (
            <>
              <p>Tap to start</p>
              <p>Move to control</p>
              <div className={styles.move} />
            </>
          )}
          {!isTouchEnabled() && (
            <p>Click to start</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App
