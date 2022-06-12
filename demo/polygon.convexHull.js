/**
 * polygon.convexHull
 * https://ptsjs.org/demo/edit/?name=polygon.convexHull
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create, Polygon, Mat } = require("pts");

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
    mouse.to(uv).multiply(size);
  });

  // Make a face with 30 radial points with slight randomness
  const radius = size.minValue().value / 3;
  const pts = Create.radialPts(center, radius, 30);
  pts.map((p) => p.add(50 * (Math.random() - Math.random())));

  return {
    render({ playhead, time }) {
      form.fillOnly("#0c3").rect([[0, 0], size]);

      pts[pts.length - 1] = mouse;

      // convex hull the points
      let hull = Polygon.convexHull(pts);

      // eyes' positions
      let left = center.$subtract(50);
      let right = center.$add(50, -50);
      let leftB = left.clone().toAngle(mouse.$subtract(left).angle(), 10, left);
      let rightB = right
        .clone()
        .toAngle(mouse.$subtract(right).angle(), 10, right);

      // draw face and eyes
      form.fillOnly("rgba(255, 255, 255, 0.5)").polygon(hull);
      form.fill("#fff").points([left, right], 20, "circle");
      form.fill("#123").points([leftB, rightB], 5, "circle");

      // draw the hull and pts
      form.fill("#fff").points(hull, 5, "circle");
      form.fill("rgba(0,0,0,.5)").points(pts, 2, "circle");
      form.fill("#f03").point(mouse, 10, "circle");

      // draw mouth
      form.strokeOnly("#123", 5).line([left.$add(0, 80), right.$add(0, 80)]);
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
  // animate: true,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
