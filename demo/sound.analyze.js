/**
 * sound.analyze
 * https://ptsjs.org/demo/edit/?name=sound.analyze
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Sound, Geom, Triangle, Const } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  var bins = 256;
  var sound;
  var colors = ["#f06", "#62e", "#fff", "#fe3", "#0c9"];
  var bufferLoaded = false;
  Sound.loadAsBuffer("./assets/beautiful-moments.mp3")
    .then((s) => {
      sound = s;
      bufferLoaded = true;
    })
    .catch((e) => console.error(e));

  function toggle() {
    if (sound.playing || !bufferLoaded) {
      sound.stop();
    } else {
      sound.createBuffer().analyze(bins); // recreate buffer again
      sound.start();
    }
  }

  // Draw play button
  function playButton() {
    if (!bufferLoaded) {
      form.fillOnly("#9ab").text([20, 30], "Loading...");
      return;
    }
    if (!sound || !sound.playing) {
      form.fillOnly("#f06").rect([
        [0, 0],
        [50, 50],
      ]);
      form
        .fillOnly("#fff")
        .polygon(
          Triangle.fromCenter([25, 25], 10).rotate2D(Const.half_pi, [25, 25])
        );
    } else {
      form.fillOnly("rgba(0,0,0,.2)").rect([
        [0, 0],
        [50, 50],
      ]);
      form.fillOnly("#fff").rect([
        [18, 18],
        [32, 32],
      ]);
    }
  }

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("up", ({ position, event }) => {
    if (Geom.withinBound(mouse, [0, 0], [50, 50])) {
      // clicked button
      toggle();
    }
  });
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
  });

  return {
    render({ playhead, time }) {
      form.fillOnly("#eae6ef").rect([[0, 0], size]);

      if (sound && sound.playable) {
        sound.freqDomainTo(size).forEach((t, i) => {
          form.fillOnly(colors[i % 5]).point(t, 30);
        });
      }
      playButton();
    },
    resize({ width, height }) {
      size.to(width, height);
      center.to(size.$divide(2));
      innerBound.bottomRight = size;
    },
  };
};

const settings = {
  // dimensions: [600, 600],
  // pixelRatio: 2,
  exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
