/**
 * line.intersectLine2D
 * https://ptsjs.org/demo/edit/?name=line.intersectLine2D
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Create, Line, Group, Const } = require("pts");

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

  // create a grid of lines
  const pts = Create.gridPts(innerBound, 10, 10);
  const lines = pts.map((p, i) =>
    Line.fromAngle(
      p,
      i * Const.one_degree * 10,
      (Math.random() * size.x) / 5 + 20
    )
  );

  // check intersect of a line with other lines
  const intersect = (ln, k) => {
    let ps = new Group();
    for (let i = 0, len = lines.length; i < len; i++) {
      // this loop can be optimized
      if (i !== k) {
        let ip = Line.intersectLine2D(lines[i], ln);
        if (ip) ps.push(ip);
      }
    }
    return ps;
  };

  return {
    render({ playhead, time }) {
      form.fillOnly("#123").rect([[0, 0], size]);

      let speed = (mouse.x - center.x) / center.x;

      // rotate each line, then check and draw intersections
      lines.forEach((ln, i) => {
        ln[1].rotate2D(0.02 * speed, ln[0]);
        let ips = intersect(ln, i);

        form
          .stroke(ips.length > 0 ? "#fff" : "rgba(255,255,255,.3)", 2)
          .line(ln);
        form.strokeOnly("#f03", 2).points(ips, 5, "circle");
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
