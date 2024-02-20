import { AudioTrackType } from '@/types';

import AudioTrack from './AudioTrack';

export default class AudioPipeline {
  private _context: AudioContext;
  private _tracks: Array<AudioTrack>;

  constructor() {
    this._context = new AudioContext();
    this._tracks = [];
  }

  addTrack = (type: AudioTrackType, element: HTMLAudioElement) => {
    if (!this.getTracksByElement(element).length) {
      const track = new AudioTrack(type, this._context, element);
      this._tracks.push(track);
      track.connect(this._context.destination);
    }
  }

  getTracksByElement = (element: HTMLAudioElement): Array<AudioTrack> => (
    this._tracks.filter(t => t.hasElement(element))
  );

  getTracksByType = (type: AudioTrackType): Array<AudioTrack> => (
    this._tracks.filter(t => t.type === type)
  );

  areAllTracksLoaded = (): boolean => {
    this._tracks.forEach(t => console.log('\t', t.type, t.canPlayThrough));
    return this._tracks.reduce((loaded, track) => (
      loaded && track.canPlayThrough
    ), true);
  }

  start = () => {
    this._context.resume();
    this._tracks.forEach(t => t.play());
  }

  seek = (position: number) => {
    this._tracks.forEach(t => t.seek(position));
  }
}