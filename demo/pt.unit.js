/**
 * pt.unit
 */

const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create, Group } = require("pts");
const path = require("path");

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
      ctx.fillStyle = "#123";
      ctx.fillRect(0, 0, size.x, size.y);

      // get a line from pointer to center, and use it for direction and magnitude calculations
      let ln = mouse.$subtract(center.$add(0.1));
      let dir = ln.$unit();
      let mag = ln.magnitude();
      let mag2 = size.magnitude();

      // create a grid of lines
      let lines = Create.gridPts(innerBound, 20, 10).map((p) => {
        let dist = p.$subtract(center).magnitude() / mag2;
        return new Group(p, p.$add(dir.$multiply(dist * (20 + mag / 5))));
      });

      form.strokeOnly("#fe3").line([center, mouse]);
      form.strokeOnly("#fff").lines(lines);
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
