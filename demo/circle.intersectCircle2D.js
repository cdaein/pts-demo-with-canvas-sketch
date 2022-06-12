/**
 * circle.intersectCircle2D
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Circle } = require("pts");

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

  return {
    render({ playhead }) {
      ctx.fillStyle = "#fe3";
      ctx.fillRect(0, 0, size.x, size.y);

      let c1 = Circle.fromCenter(mouse, size.y / 4);
      let c2 = Circle.fromCenter(mouse, size.y / 8);
      let ct = Circle.fromCenter(center, size.y / 4);

      let ins1 = Circle.intersectCircle2D(c1, ct);
      let ins2 = Circle.intersectCircle2D(c2, ct);

      form.fillOnly("#0c6").circle(c1);
      form.fill("#fe3").circle(c2);
      form.fill("rgba(70,30,240,.2)").circle(ct);
      form.fill("rgba(70,30,240, .3)").points(ins1, 10, "circle");
      form.fill("#f06").points(ins2, 5, "circle");
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
  // exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
