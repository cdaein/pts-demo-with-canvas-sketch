const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Rectangle, Create, Typography } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  // const space = new CanvasSpace(canvas);
  // const form = space.getForm();
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  let mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event }) => {
    mouse.set(position);
  });

  let grid = [];
  let headerResize;
  let widthResize;

  const layout = () => {
    const gs = Rectangle.halves(innerBound, 0.2, true);
    const bound = Bound.fromGroup(gs[1]);
    grid = Create.gridCells(bound, 4, 1);
    grid.unshift(gs[0]);
  };

  // start - REVIEW: reason for having start() method in space.add()?
  layout();
  headerResize = Typography.fontSizeToBox(grid[0], 0.8); // a function to resize header font based on box height
  widthResize = Typography.fontSizeToThreshold(850, -1); // a function to resize header font based on threshold

  return {
    render({ width, height }) {
      ctx.fillStyle = "#0c9";
      ctx.fillRect(0, 0, width, height);

      let w = size.x;

      // measure text width accurately
      form.fontWidthEstimate(false);
      form.fillOnly("#123").font(headerResize(grid[0])).alignText("left");
      form.textBox(grid[0], "The Metamorphosis", "middle", "ᔘ");

      form.font(widthResize(14, w)).alignText("right");
      form.fillOnly("#fff").textBox(grid[0], "By Franz Kafka", "bottom", "...");

      form
        .fillOnly("#123")
        .font(widthResize(42, w))
        .alignText("left")
        .textBox(grid[1], "One morning", "top", "☀ ");
      form
        .font(widthResize(16, w))
        .alignText("center")
        .textBox(grid[1], "when Gregor Samsa woke", "middle", "☟");
      form
        .font(widthResize(14, w))
        .alignText("right")
        .textBox(grid[1], "from troubled dreams", "bottom", "🐜");

      form
        .font(widthResize(30, w))
        .paragraphBox(
          grid[2],
          "he found himself transformed in his bed into a horrible vermin."
        );
      form
        .font(12)
        .alignText("left")
        .paragraphBox(
          grid[3],
          "He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.",
          2,
          "middle",
          true
        );

      // measure text width by estimate (faster but less accurate)
      form.fontWidthEstimate(true);
      form
        .font(widthResize(16, w))
        .alignText("left")
        .paragraphBox(
          grid[4],
          "'What's happened to me'?\nhe thought.\nIt wasn't a dream.\nHis room, a proper human room although a little too small, lay peacefully between its four familiar walls."
        );
      form
        .font(widthResize(11, w))
        .alignText("right")
        .paragraphBox(
          grid[4],
          "A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame.",
          1,
          "bottom"
        );
      form.strokeOnly("#fff").rects(grid);
    },
    resize({ width, height }) {
      size.set([width, height]); // REVIEW: when setting Pt, param has to be an array, while creating doesn't.
      center.set(size.$divide(2));
      innerBound.bottomRight = size;

      layout();
    },
  };
};

const settings = {
  // dimensions: [600, 600],
  // pixelRatio: 2,
  // exportPixelRatio: 2,
  // scaleToFitPadding: 0,
  // scaleToView: true,
  // animate: true,
  // duration: 4,
  // fps: 30,
  // playbackRate: "throttle",
  // duration: 4,
  // suffix: new Date().getTime(),
};

canvasSketch(sketch, settings);
