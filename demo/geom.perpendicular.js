/**
 * geom.perpendicular
 * https://ptsjs.org/demo/edit/?name=geom.perpendicular
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Group, Line, Geom, Const, Num } = require("pts");

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
    mouse.to(uv).multiply(size);
  });

  return {
    render({ playhead, time }) {
      time *= 1000;

      form.fillOnly("#f1f3f7").rect([[0, 0], size]);

      // create a line and get 200 interpolated points
      let offset = size.$multiply(0.2).y;
      let line = new Group(new Pt(0, offset), new Pt(size.x, size.y - offset));
      let pts = Line.subpoints(line, 200);

      // get perpendicular unit vectors from each points on the line
      let pps = pts.map((p) =>
        Geom.perpendicular(p.$subtract(line[0]).unit()).add(p)
      );

      let angle = (mouse.x / size.x) * Const.two_pi * 2;

      // draw each perpendicular like a sine-wave
      pps.forEach((pp, i) => {
        let t =
          (i / 200) * Const.two_pi + angle + Num.cycle((time % 10000) / 10000);

        if (i % 2 === 0) {
          pp[0].to(Geom.interpolate(pts[i], pp[0], Math.sin(t) * offset * 2));
          pp[1].to(pts[i]);
          form.stroke("#0c6", 2).line(pp);
        } else {
          pp[0].to(pts[i]);
          pp[1].to(Geom.interpolate(pts[i], pp[1], Math.cos(t) * offset * 2));
          form.stroke("#f03", 2).line(pp);
        }
      });
    },
    resize({ width, height }) {
      size.to(width, height);
      center.to(size.$divide(2));
      innerBound.bottomRight = size;
    },
  };
};

const settings = {
  // dimensions: [600, 600],
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
