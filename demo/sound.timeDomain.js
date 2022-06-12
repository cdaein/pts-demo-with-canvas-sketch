/**
 * sound.timeDomain
 * https://ptsjs.org/demo/edit/?name=sound.timeDomain
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const {
  CanvasForm,
  Pt,
  Bound,
  Sound,
  Circle,
  Triangle,
  Const,
  Geom,
  Line,
  Num,
} = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  var files = [
    "./assets/beautiful-moments.mp3",
    "./assets/sunday-afternoon.mp3",
    "./assets/beautiful-moments.mp3",
  ];
  var sounds = [];
  var currFile = 0;
  var bins = 256;
  var sound;
  let bufferLoaded = false;

  function loadSound(i) {
    Sound.loadAsBuffer(files[i])
      .then((s) => {
        sound = s;
        sounds.push(s);
        if (i < files.length - 1) loadSound(i + 1);
        // fix for slow loading other files and going back to button view.
        if (i === files.length - 1) bufferLoaded = true;
      })
      .catch((e) => console.error(e));
  }

  loadSound(0); // load all sounds

  // Draw play button
  function playButton() {
    if (!sound || !sound.playing) {
      form.fillOnly("rgba(0,0,0,.2)").circle(Circle.fromCenter(center, 30));
      form
        .fillOnly("#fff")
        .polygon(
          Triangle.fromCenter(center, 15).rotate2D(Const.half_pi, center)
        );
    }
  }

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("up", ({ position, event }) => {
    if (
      bufferLoaded &&
      Geom.withinBound(mouse, center.$subtract(25), center.$add(25))
    ) {
      if (!sound.playing && sounds.length > 0) {
        currFile = (currFile + 1) % sounds.length;
        sound = sounds[currFile];
        sound.createBuffer().analyze(bins).start(); // reset buffer and analyzer
      }
    }
  });
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
  });

  return {
    render({ playhead, time }) {
      form.fillOnly("#eae6ef").rect([[0, 0], size]);

      if (sound && sound.playing) {
        // map time domain data to lines drawing two half circles
        let tdata = sound.timeDomainTo([Const.two_pi, 1]).map((t, i) => {
          let ln = Line.fromAngle(
            [i > 128 ? size.x : 0, center.y],
            t.x - Const.half_pi,
            size.y / 0.9
          );
          return [ln.p1, ln.interpolate(t.y)];
        });

        for (let i = 0, len = tdata.length; i < len; i++) {
          let c = Math.floor(Num.cycle(i / tdata.length) * 200);
          form.stroke(`rgba( ${255 - c}, 20, ${c}, .7 )`, 1).line(tdata[i]);
        }
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
  dimensions: [600, 600],
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
