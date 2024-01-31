import { MouseEvent, useRef, useState } from 'react';
import styles from 'styles/app.module.scss';

import urlImgFloorPlan from './assets/img/floorplan.png';
import urlImgSoundMap from './assets/img/soundmap-blur-50.png';
import urlSoundClub from './assets/mp3/club.mp3';
import urlSoundHome from './assets/mp3/home.mp3';
import urlSoundStreet from './assets/mp3/street.mp3';

const App = () => {

  const canvas = useRef<HTMLCanvasElement>(null);
  const soundmap = useRef<HTMLImageElement>(null);
  const floorplan = useRef<HTMLImageElement>(null);
  const soundStreet = useRef<HTMLAudioElement>(null);
  const soundHome = useRef<HTMLAudioElement>(null);
  const soundClub = useRef<HTMLAudioElement>(null);

  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ ctx, setCtx ] = useState<CanvasRenderingContext2D | null>(null);
  const [ sampledColor, setSampledColor ] = useState<Uint8ClampedArray>(new Uint8ClampedArray(4).fill(0));
  const [ volume, setVolume ] = useState(0.5);

  const drawSoundMap = () => {
    if (!canvas.current || !soundmap.current) {
      console.error('Could not draw sound map; element does not exist.');
      return;
    }
    canvas.current!.width = soundmap.current!.naturalWidth;
    canvas.current!.height = soundmap.current!.naturalHeight;
    const ctx = canvas.current!.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(soundmap.current!, 0, 0, soundmap.current!.naturalWidth, soundmap.current!.naturalHeight);
    } else {
      console.error('Could not draw sound map; failed to create canvas context.');
      return;
    }
    setCtx(ctx);
  }

  const start = () => {
    soundClub.current?.play();
    soundHome.current?.play();
    soundStreet.current?.play();
    setIsPlaying(true);
  }

  const onMouseMove = (event: MouseEvent<HTMLImageElement>) => {
    if (isPlaying && floorplan.current && ctx) {
      const rect = floorplan.current!.getBoundingClientRect();
      const x = event.pageX - rect.left;
      const y = event.pageY - rect.top;

      sampleColor(
        x / rect.width,
        y / rect.height
      );
    }
  }

  const sampleColor = (x: number, y: number) => {
    if (ctx) {
      setSampledColor(
        ctx.getImageData(
          Math.round(ctx.canvas.width * x),
          Math.round(ctx.canvas.height * y),
          1,
          1
        ).data
      );
      updateVolumes();
    }
  }

  const updateVolumes = () => {
    const [ r, g, b ] = sampledColor;
    if (soundClub.current) {
      soundClub.current!.volume = volume * r / 255.0;
    }
    if (soundStreet.current) {
      soundStreet.current!.volume = volume * g / 255.0;
    }
    if (soundHome.current) {
      soundHome.current!.volume = volume * b / 255.0;
    }
  }

  return (
    <div className={styles.app}>

      <audio
        ref={soundStreet}
        src={urlSoundStreet}
        loop
        preload="auto"
      />
      <audio
        ref={soundHome}
        src={urlSoundHome}
        loop
        preload="auto"
      />
      <audio
        ref={soundClub}
        src={urlSoundClub}
        loop
        preload="auto"
      />

      <div className={styles.map}>
        <canvas
          ref={canvas}
          className={styles.canvas}
        />
        <img
          ref={soundmap}
          className={styles.soundmap}
          src={urlImgSoundMap}
          onLoad={drawSoundMap}
        />
        <img
          ref={floorplan}
          className={styles.floorplan}
          src={urlImgFloorPlan}
          onMouseMove={onMouseMove}
        />
      </div>

      <div className={styles.footer}>
        <span>Volume</span>
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

      { !isPlaying && (
        <div className={styles.modal} onClick={start}>
          <p>Click to start</p>
        </div>
      )}
    </div>
  )
}

export default App
