/**
 * geom.interpolate
 * https://ptsjs.org/demo/edit/?name=geom.interpolate
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Rectangle, Group, Num, Geom } = require("pts");

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
    mouse.set(uv);
    mouse.multiply(size);
  });

  // A function to recusively draw interpolated squares up to max depth
  const interpolate = (pts, _t, depth, max) => {
    if (depth > max) return;
    let g = new Group();
    let t = Num.boundValue(_t, 0, 1);

    for (let i = 1, len = pts.length; i < len; i++) {
      g.push(Geom.interpolate(pts[i - 1], pts[i], t));
    }
    g.push(Geom.interpolate(pts[pts.length - 1], pts[0], t));

    form.fillOnly(depth % 2 === 0 ? "#fff" : "#123").polygon(g);
    interpolate(g, t + 0.02, depth + 1, max);
  };

  return {
    render({ playhead, time }) {
      time *= 1000;

      form.fillOnly("#fe3").rect([[0, 0], size]);

      let rectSize = size.$multiply(0.5).minValue().value;
      let rect = Rectangle.corners([
        center.$subtract(rectSize),
        center.$add(rectSize),
      ]);
      let t = mouse.x / size.x + (time % 10000) / 10000;

      interpolate(rect, t, 0, 20);
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
