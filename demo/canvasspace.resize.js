const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Rectangle } = require("pts");

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
  event.on("move", ({ position, event }) => {
    mouse.set(position);
  });

  let currBound = new Bound();

  return {
    render({ width, height }) {
      ctx.fillStyle = "#96bfed";
      ctx.fillRect(0, 0, width, height);

      // create a circles in each quarter
      let quads = Rectangle.quadrants([new Pt(), currBound.size]);
      let circles = quads.map((q) => Rectangle.toCircle(q));

      form.fillOnly("#09f").circles(circles);
      form.strokeOnly("#fff", 2).lines(quads);
      form.fill("#f03").point(center, 10, "circle");
      form.log("Size: " + currBound.size.toString());
    },
    resize({ width, height }) {
      size.set([width, height]); // REVIEW: when setting Pt, param has to be an array, while creating doesn't.
      center.set(size.$divide(2));
      innerBound.bottomRight = size;

      currBound = innerBound;
    },
  };
};

const settings = {
  // dimensions: [600, 600],
  // pixelRatio: 2,
  // exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  // animate: true,
  // duration: 4,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  // suffix: new Date().getTime(),
};

canvasSketch(sketch, settings);
