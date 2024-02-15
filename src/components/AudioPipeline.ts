import AudioTrack from './AudioTrack';

export default class AudioPipeline {
  private _context: AudioContext;
  private _tracks: Array<AudioTrack>;

  constructor() {
    this._context = new AudioContext();
    this._tracks = [];
  }

  addTrack = (element: HTMLAudioElement) => {
    const track = new AudioTrack(this._context, element);
    this._tracks.push(track);
    track.connect(this._context.destination);
  }

  getTrack = (element: HTMLAudioElement) => (
    this._tracks.find(t => t.hasElement(element))
  );

  start = () => {
    this._context.resume();
    this._tracks.forEach(t => t.play());
  }
}