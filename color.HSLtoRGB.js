/**
 * color.HSLtoRGB
 * https://ptsjs.org/demo/edit/?name=color.HSLtoRGB
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Color, Num, Rectangle } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  let mouse = new Pt(center);
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, uv }) => {
    mouse.set(uv);
    mouse.multiply(size);
  });

  // to interpolate color
  let t = 0;
  // hsl max value range (360,1,1,1)
  let cu = Color.hsl(Color.maxValues("hsl"));

  // recursively subdivide a rectangle
  function subdivide(color, rect, depth, index, center) {
    if (depth > 5) return;
    let qs = Rectangle.quadrants(rect, center);
    qs.map((r) => r[1].ceil()); // fix the floating-point stroke problem

    form.fill(color(rect.interpolate(t))).rects(qs);

    if (index < 0) {
      for (let i = 0, len = qs.length; i < len; i++) {
        subdivide(color, qs[i], depth + 1, i);
      }
    } else {
      let i = Num.boundValue(index + 2, 0, 4);
      subdivide(color, qs[i], depth + 1, index);
    }
  }

  return {
    render({ playhead, time }) {
      ctx.fillStyle = "gray";
      ctx.fillRect(0, 0, size.x, size.y);

      t = Num.cycle((time % 3000) / 3000);

      // get HSL color string, given a point position
      const color = (p) => {
        let p1 = p.$divide(size);
        let p2 = mouse.$divide(size);
        let c = cu.$multiply(Pt.make(4, 1).to(p2.x, p2.y / 2 + p1.x / 2, p1.y));
        return Color.HSLtoRGB(c).toString("rgb");
      };

      form.stroke(false);
      subdivide(color, innerBound, 0, -1, mouse);
    },
    resize({ width, height }) {
      size.set([width, height]);
      center.set(size.$divide(2));
      innerBound.bottomRight = size;
    },
  };
};

const settings = {
  // dimensions: [600, 600],
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
