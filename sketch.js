/**
 * pts CanvasForm(ctx) template
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound } = require("pts");

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
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
  });

  return {
    render({ playhead, time }) {
      form.fillOnly("gray").rect([[0, 0], size]);
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
