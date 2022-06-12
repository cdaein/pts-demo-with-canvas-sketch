/**
 * line.perpendicularFromPt
 * https://ptsjs.org/demo/edit/?name=line.perpendicularFromPt
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Group, Create, Line } = require("pts");

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

  const pts = Create.distributeRandom(innerBound, 200);

  return {
    render({ playhead, time }) {
      form.fillOnly("#123").rect([[0, 0], size]);

      // make a line and turn it into an "op" (see the guide on Op for more)
      let perpend = new Group(center, mouse).op(Line.perpendicularFromPt);
      pts.rotate2D(0.0005, center);

      pts.forEach((p, i) => {
        // for each point, find the perpendicular to the line
        let lp = perpend(p);
        var ratio = Math.min(1, 1 - lp.$subtract(p).magnitude() / (size.x / 2));
        form.stroke(`rgba(255,255,255,${ratio}`, ratio * 2).line([p, lp]);
        form.fillOnly(["#f03", "#09f", "#0c6"][i % 3]).point(p, 1);
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
