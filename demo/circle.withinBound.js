/**
 * pts
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create, Circle } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  let mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, uv }) => {
    mouse.set(uv);
    mouse.multiply(size);
  });

  const pts = Create.distributeRandom(innerBound, 500);
  const colors = ["#ff2d5d", "#42dc8e", "#2e43eb", "#ffe359"];

  return {
    render({ playhead }) {
      ctx.fillStyle = "#123";
      ctx.fillRect(0, 0, size.x, size.y);

      let r = (Math.abs(mouse.x - center.x) / center.x) * 150 + 70;
      let range = Circle.fromCenter(mouse, r);

      // check if each point is within circle's range
      for (let i = 0, len = pts.length; i < len; i++) {
        if (Circle.withinBound(range, pts[i])) {
          // calculate circle size
          let dist = (r - pts[i].$subtract(mouse).magnitude()) / r;
          let p = pts[i]
            .$subtract(mouse)
            .scale(1 + dist)
            .add(mouse);
          form.fillOnly(colors[i % 4]).point(p, dist * 25, "circle");
        } else {
          form.fillOnly("#fff").point(pts[i], 1);
        }
      }
    },
    resize({ width, height }) {
      size.set([width, height]);
      center.set(size.$divide(2));
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
