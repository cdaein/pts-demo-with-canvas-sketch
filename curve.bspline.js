/**
 * curve.bspline
 * https://ptsjs.org/demo/edit/?name=curve.bspline
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create, Num, Curve, Geom } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt(center);
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, uv }) => {
    mouse.set(uv);
    mouse.multiply(size);
  });

  let radius = size.minValue().value / 3;
  let pts = Create.radialPts(center, radius, 10);
  pts.map((p) => p.add(20 * (Math.random() - Math.random())));
  let temp = pts.clone();

  return {
    render({ playhead, time }) {
      time *= 1000;

      form.fillOnly("#f03").rect([[0, 0], size]);

      const r = radius + radius * (Num.cycle((time % 3000) / 3000) * 0.2);

      for (let i = 0, len = temp.length; i < len; i++) {
        let d = pts[i].$subtract(mouse);

        // push out if inside threshold
        if (d.magnitudeSq() < r * r) {
          temp[i].to(mouse.$add(d.unit().$multiply(r)));

          // pull in if outside threshold
        } else {
          if (!pts[i].equals(temp[i], 0.1)) {
            temp[i].to(Geom.interpolate(temp[i], pts[i], 0.02));
          }
        }
      }

      // close the bspline curve with 3 extra points
      let tempB = temp.clone();
      tempB.push(temp.p1);
      tempB.push(temp.p2);
      tempB.push(temp.p3);

      form.fillOnly("#fff").line(Curve.bspline(tempB, 10));
      form.fill("rgba(255, 255, 255, 0.5)").points(temp, 2, "circle");
      form.fill("#fd6").point(temp.centroid(), radius / 3, "circle");
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
