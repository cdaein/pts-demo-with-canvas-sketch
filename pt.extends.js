/**
 * pts
 *
 * TOFIX:
 * - with fixed dimensions, mouse has unwanted offset.
 */

const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const {
  CanvasForm,
  Pt,
  Bound,
  Group,
  Util,
  Triangle,
  Rectangle,
  Const,
} = require("pts");
const path = require("path");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  const pts = new Group();

  class Confetti extends Pt {
    constructor(...args) {
      super(...args);
      this.color = ["#f03", "#09f", "#0c6", "#fff"][Util.randomInt(4)];
      this.size = Math.random() * 7 + 2;
      this.angle = Math.random() * Const.two_pi;
      this.dir = Math.random() > 0.5 ? 1 : -1;
      this.shape = ["rect", "circle", "tri"][Util.randomInt(3)];
    }

    render(form) {
      if (this.y < size.y) {
        this.y += 2 / this.size + Math.random();
        this.x += Math.random() - Math.random();
        this.angle +=
          this.dir * (Math.random() * Const.one_degree + Const.one_degree);

        if (this.shape == "tri" || this.shape == "rect") {
          let shape =
            this.shape == "tri"
              ? Triangle.fromCenter(this, this.size)
              : Rectangle.corners(Rectangle.fromCenter(this, this.size * 2));
          shape.rotate2D(this.angle, this);
          form.fillOnly(this.color).polygon(shape);
        } else {
          form.fillOnly(this.color).point(this, this.size, "circle");
        }
      }
    }
  }

  // mouse events
  const event = createInputEvents(canvas);
  let mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, uv }) => {
    mouse.set(uv);
    mouse.multiply(size);
    pts.push(new Confetti(mouse));
  });

  return {
    render({ playhead, time }) {
      ctx.fillStyle = "#fe3";
      ctx.fillRect(0, 0, size.x, size.y);

      // remove confetti if reaching the bottom or too many
      if (pts.length > 1000 || (pts.length > 0 && pts[0].y > size.y))
        pts.shift();

      // add a confetti every second
      if (Math.floor(time % 1000) > 980) pts.push(new Confetti(mouse));

      // render the confetti
      pts.forEach((p) => p.render(form));
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
  // suffix: new Date().getTime(),
  prefix: path.basename(__filename),
};

canvasSketch(sketch, settings);
