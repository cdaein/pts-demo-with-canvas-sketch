/**
 * shaping.linear
 * https://ptsjs.org/demo/edit/?name=shaping.linear
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create, Shaping, Group } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, uv }) => {
    mouse.to(uv).multiply(size);
  });

  const fns = [
    "linear",
    "quadraticIn",
    "quadraticOut",
    "quadraticInOut",
    "cubicIn",
    "cubicOut",
    "cubicInOut",
    "sineIn",
    "sineOut",
    "sineInOut",
    "cosineApprox",
    "circularIn",
    "circularOut",
    "circularInOut",
    "exponentialIn",
    "exponentialOut",
    "elasticIn",
    "elasticOut",
    "elasticInOut",
    "bounceIn",
    "bounceOut",
    "bounceInOut",
    "sigmoid",
    "logSigmoid",
    "seat",
    "quadraticTarget",
    "quadraticBezier",
    "cubicBezier",
    "cliff",
    "step",
  ];

  // Use a shaping function (`fn`) to find the value at `t` for this bounding box with (`pos`, `size`)
  function pointAt(fn, t, pos, size) {
    var v =
      fn == Shaping.step
        ? Shaping.step(Shaping.quadraticOut, 6, t, size.y)
        : fn(t, size.y);
    return new Pt(pos.x + t * size.x, pos.y + v);
  }

  // Get a series of points to draw the path of this shaping function (`fn`)
  function shaping(fn, pos, size) {
    var pts = new Group();
    for (var i = 0; i <= 20; i++) {
      pts.push(pointAt(fn, i / 20, pos, size));
    }
    return pts;
  }

  let columns = Math.ceil(Math.sqrt(fns.length));
  let rows = Math.ceil((fns.length - columns) / columns);
  if (rows * columns < fns.length) rows += 1;
  const grid = Create.gridCells(innerBound, columns, rows);
  console.log(grid);

  return {
    render({ playhead, time }) {
      time *= 1000;

      form.fillOnly("#fe3").rect([[0, 0], size]);

      let progress = (time % 3000) / 3000; // one iteration every 3 sec

      // go through each shaping function per grid cell
      grid.forEach((r, idx) => {
        let fn = idx < fns.length ? Shaping[fns[idx]] : false; // get shaping function

        if (fn) {
          let size = r[1].$subtract(r[0]);
          let pts = shaping(fn, r[0], size);
          let nv = pointAt(fn, progress, new Pt(0, 0), new Pt(1, 1)).y; // current normalized value
          let bgcolor = "rgba(0,0,0, " + (nv / 2 + 0.05) + ")";
          let radius =
            Math.min(size.x, size.y) / 8 + (nv * Math.min(size.x, size.y)) / 4;

          form
            .fillOnly(bgcolor)
            .point(size.$divide(2).add(r[0]), radius, "circle"); // draw bg circle
          form.strokeOnly("#fff", 2).line(pts); // draw path
          form
            .fillOnly("#09f")
            .point(pointAt(fn, progress, r[0], size), 3, "circle");
          form
            .fill("rgba(0,0,0,.5)")
            .font(11)
            .text(r[0].$add(10, 15), fns[idx]);
        }
      });
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
