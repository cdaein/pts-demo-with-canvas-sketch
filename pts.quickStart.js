const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Line, Util, Rectangle } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);

  // mouse events
  const event = createInputEvents(canvas);
  let mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event }) => {
    mouse.set(position);
  });

  const size = new Pt(width, height);
  const innerBound = new Bound(new Pt(), new Pt(size));

  return {
    render({ width, height }) {
      ctx.fillStyle = "#f03";
      ctx.fillRect(0, 0, width, height);

      let subs = innerBound.map((p) => Line.subpoints([p, mouse], 30));
      let rects = Util.zip(subs).map((r, i) =>
        Rectangle.corners(r).rotate2D((i * Math.PI) / 60, mouse)
      );
      form.strokeOnly("#FDC", 2).polygons(rects);
    },
    resize({ width, height }) {
      size.set([width, height]); // REVIEW: when setting Pt, param has to be an array, while creating doesn't.
      innerBound.bottomRight = size;
    },
  };
};

const settings = {
  // dimensions: [600, 600],
  pixelRatio: 2,
  exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  scaleToView: true,
  animate: true,
  // duration: 4,
  // fps: 30,
  // playbackRate: "throttle",
  duration: 4,
  // suffix: new Date().getTime(),
};

canvasSketch(sketch, settings);
