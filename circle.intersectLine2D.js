/**
 * circle.intersectLine2D
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Group, Create, Circle, Const } = require("pts");

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

  const lines = [];

  // function to create random lines
  var createLines = () => {
    lines.length = 0;
    const ps = Create.distributeRandom(innerBound, 50);
    for (let i = 0, len = ps.length; i < len; i++) {
      lines.push(
        new Group(
          ps[i],
          ps[i]
            .clone()
            .toAngle(
              Math.random() * Const.pi,
              (Math.random() * size.y) / 2 + 20,
              true
            )
        )
      );
    }
  };

  createLines();

  return {
    render({ playhead }) {
      ctx.fillStyle = "#123";
      ctx.fillRect(0, 0, size.x, size.y);

      // define a range from the pointer
      let range = Circle.fromCenter(mouse, 100);
      form.stroke("#fff").lines(lines);

      for (let i = 0, len = lines.length; i < len; i++) {
        // check rays and lines intersection with pointer's range
        let inPath = Circle.intersectRay2D(range, lines[i]);
        let inLine = Circle.intersectLine2D(range, lines[i]);

        if (inPath.length > 1) {
          form
            .stroke("rgba(255,255,255,.15)")
            .line(lines[i].concat(inPath[0], inPath[1]));
          form.stroke("#fe6").line(lines[i]);
          form.fillOnly("#fff").points(inPath, 1, "circle");
        }

        if (inLine.length > 0) {
          form.stroke("#f03").line(lines[i]);
          form.fillOnly("#f03").points(inLine, 3, "circle");
        }
      }
    },
    resize({ width, height }) {
      size.set([width, height]);
      center.set(size.$divide(2));
      innerBound.bottomRight = size;

      // createLines();
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
