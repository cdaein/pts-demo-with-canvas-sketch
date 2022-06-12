/**
 * curve.cardinal
 * https://ptsjs.org/demo/edit/?name=curve.cardinal
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Line, Curve, Geom } = require("pts");

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

  // make 10 pts between 10% to 90% of space's boundary
  let pts = Line.subpoints([size.$multiply(0.1), size.$multiply(0.9)], 10);
  let temp = pts.clone();

  return {
    render({ playhead, time }) {
      form.fillOnly("#0c6").rect([[0, 0], size]);

      for (let i = 0, len = temp.length; i < len; i++) {
        let d = pts[i].$subtract(mouse);

        // push out if inside threshold (100 radius)
        if (d.magnitudeSq() < 100 * 100) {
          temp[i].to(mouse.$add(d.unit().$multiply(100)));
        } else {
          // pull in if outside threshold
          if (!pts[i].equals(temp[i], 0.1)) {
            temp[i].to(Geom.interpolate(temp[i], pts[i], 0.02));
          }
        }
      }

      form.fillOnly("rgba(255, 230, 0, 0.9)").line(Curve.catmullRom(temp, 10));
      form.stroke("#f06").line(Curve.cardinal(temp, 10, 0.2));
      form.strokeOnly("#123", 3).line(Curve.cardinal(temp, 10, 0.8));
      form.stroke(false).fill("#fff").points(temp, 5, "circle");
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
