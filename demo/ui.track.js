/**
 * ui.track
 * https://ptsjs.org/demo/?name=ui.track
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const {
  CanvasForm,
  Pt,
  Bound,
  Line,
  Curve,
  Num,
  Rectangle,
  Group,
  Const,
  UI,
  UIDragger,
  UIButton,
} = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  // below may not be the best implementation...
  event.on("down", ({ position, event }) => {
    UI.track(handles, "down", new Pt(mouse));
    UI.track([firstPt, lastPt], "down", new Pt(mouse));
  });
  event.on("up", ({ position, event }) => {
    UI.track(handles, "up", new Pt(mouse));
    UI.track([firstPt, lastPt], "up", new Pt(mouse));
  });
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);
    UI.track(handles, "move", new Pt(mouse));
    UI.track([firstPt, lastPt], "move", new Pt(mouse));
    if (dragging) {
      UI.track(handles, "drag", new Pt(mouse));
      UI.track([firstPt, lastPt], "drag", new Pt(mouse));
    }
  });

  var handles;
  var firstPt, lastPt;
  var tension = 0.5;
  var prev;
  var ang = 0;

  let hs = Line.subpoints(
    [center.$multiply(0.25), center.$add(center.$multiply(0.75))],
    5
  );

  // convert points to UIs
  handles = hs.map((h) => {
    let ud = UIDragger.fromCircle([h, [10, 10]]);

    ud.onDrag((ui, pt) => {
      // drag handling
      ui.group[0].to(mouse.$subtract(ui.state("offset")));
    });

    ud.onHover(
      // hover handling
      (ui) => ui.group[1].scale(2),
      (ui) => ui.group[1].scale(1 / 2)
    );
    return ud;
  });

  let hovOn = (ui) => ui.group.scale(3, ui.group.centroid());
  let hovOff = (ui) => ui.group.scale(1 / 3, ui.group.centroid());

  firstPt = UIButton.fromPolygon([
    [0, center.y - 30],
    [0, center.y + 30],
    [30, center.y],
  ]);
  firstPt.onClick((ui) => {
    tension = Math.max(0.1, tension - 0.1);
  });
  firstPt.onHover(hovOn, hovOff);

  lastPt = UIButton.fromPolygon([
    [width, center.y - 30],
    [width, center.y + 30],
    [width - 30, center.y],
  ]);
  lastPt.onClick((ui) => {
    tension = Math.min(2, tension + 0.1);
  });
  lastPt.onHover(hovOn, hovOff);

  return {
    render({ playhead, time }) {
      time *= 1000;

      form.fillOnly("#42e").rect([[0, 0], size]);

      let ctrls = handles.map((g) => g.group[0]);
      ctrls.unshift(firstPt.group[2]);
      ctrls.push(lastPt.group[2]);

      let curve = Curve.cardinal(ctrls, 15, tension);
      curve.unshift(firstPt.group[0]);
      curve.unshift(new Pt(0, 0));
      curve.push(lastPt.group[0]);
      curve.push(new Pt(size.x, 0));

      let t = Num.cycle((time % 5000) / 5000);

      // get current curve point and angle
      let ci = 2 + Math.floor(t * (curve.length - 4));
      if (prev !== undefined && !curve[ci].equals(curve[prev])) {
        ang = curve[ci].$subtract(curve[prev]).angle() + Const.quarter_pi;
      }
      prev = ci;

      form.fillOnly("#f06");
      handles.forEach((h) => h.render((g) => form.circle(g)));

      form.fillOnly("rgba(0,0,50,.8)").line(curve);

      let rect = Rectangle.corners(
        Rectangle.fromCenter(curve[ci], 20)
      ).rotate2D(ang, curve[ci]);
      form.strokeOnly("#fff", 7).lines([
        [rect[0], rect[2]],
        [rect[1], rect[3]],
      ]);

      firstPt.render((g) => form.fillOnly("#fe3").polygon(g));
      lastPt.render((g) => form.fillOnly("#0c6").polygon(g));
    },
    resize({ width, height }) {
      size.to(width, height);
      center.to(size.$divide(2));
      innerBound.bottomRight = size;

      if (form.ready) {
        firstPt.group = Group.fromArray([
          [0, center.y - 30],
          [0, center.y + 30],
          [30, center.y],
        ]);
        lastPt.group = Group.fromArray([
          [width, center.y - 30],
          [width, center.y + 30],
          [width - 30, center.y],
        ]);
      }
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
