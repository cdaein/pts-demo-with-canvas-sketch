/**
 * img.pattern
 * https://ptsjs.org/demo/edit/?name=img.pattern
 *
 * TOFIX:
 * - requires 'space' object
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const {
  CanvasForm,
  Pt,
  Bound,
  Img,
  Create,
  Num,
  Shaping,
  Circle,
} = require("pts");

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
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
  });

  const w = size.$divide(2).minValue().value;
  const cells = 12;

  const img = Img.blank(new Pt(w, w), space); // TOFIX: i don't have space...
  const imgForm = img.getForm();

  const grid = Create.gridPts(img.canvasSize.toBound(), cells, cells);
  const cellSize = w / cells;

  return {
    render({ playhead, time }) {
      console.log(img);

      form.fillOnly("#fe3").rect([[0, 0], size]);

      const p = center.$subtract(mouse);
      const unit = cellSize / 2 + p.magnitude() / cellSize;

      // Pattern background
      imgForm.fillOnly("#000").rect([[0, 0], img.canvasSize]);

      // Pattern dots
      grid.forEach((c, i) => {
        const t = Num.cycle(
          Shaping.sigmoid((((i * time) / 10000) % unit) / unit)
        );
        imgForm.fillOnly(["#fe3", "#f03", "#63c", "#fff"][i % 4]);

        // draw circles scaled by pixelScale since we're drawing on the internal canvas for pattern fill
        imgForm.circle(Circle.fromCenter(c, unit * t * img.pixelScale));
      });

      // Transform and fill pattern
      pattern = img.pattern("repeat", true); // TOFIX
      pattern.setTransform(
        // We get the `scaledMatrix` instance first which pre-calculate the scaling factor (ie, `img.pixelScale`) based on screen pixel density.
        // Alternatively, if we don't want to support retina, we can set the pixelScale to be always `1` in `Img.blank(..., 1)` above
        img.scaledMatrix.translate2D([time / 50, 0]).rotate2D(p.angle(), center)
          .domMatrix
      );

      form.fill(pattern).rect(innerBound);
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
