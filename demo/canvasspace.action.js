const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Group } = require("pts");
const path = require("path");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const innerBound = new Bound(new Pt(), new Pt(size));

  const chain = new Group();
  let stretch = false;

  // mouse events
  const event = createInputEvents(canvas);
  let mouse = new Pt();
  event.on("down", ({ position, event }) => (stretch = true));
  event.on("up", ({ position, event }) => (stretch = false));
  event.on("move", ({ position, event, uv }) => {
    mouse.set(uv);
    mouse.multiply(size);
    chain.push(new Pt(mouse));
  });

  return {
    render({ width, height }) {
      ctx.fillStyle = "#fe3";
      ctx.fillRect(0, 0, width, height);

      // shorten the line when it's not stretching
      if (chain.length > (stretch ? 100 : 10)) chain.shift();

      form.strokeOnly("#123", 3).line(chain);
      form.fillOnly("#123").point(mouse, 10, "circle");
    },
    resize({ width, height }) {
      size.set([width, height]); // REVIEW: when setting Pt, param has to be an array, while creating doesn't.
      innerBound.bottomRight = size;
    },
  };
};

const settings = {
  dimensions: [800, 800],
  // pixelRatio: 2,
  // exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  animate: true,
  // duration: 4,
  // fps: 30,
  // playbackRate: "throttle",
  duration: 4,
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
