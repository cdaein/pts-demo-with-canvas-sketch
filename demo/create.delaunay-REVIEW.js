/**
 * create.delaunay
 * https://ptsjs.org/demo/edit/?name=create.delaunay
 */

const path = require("path");
const canvasSketch = require("canvas-sketch");
const createInputEvents = require("simple-input-events");
const { CanvasForm, Pt, Bound, Delaunay, Create, Polygon } = require("pts");

const sketch = ({ canvas, context: ctx, width, height }) => {
  const form = new CanvasForm(ctx);
  const size = new Pt(width, height);
  const center = size.$divide(2);
  const innerBound = new Bound(new Pt(), new Pt(size));

  let de = new Delaunay(); // Delaunay is a Group of Pts
  let triangles = []; // store the delaunay triangles
  let cells = []; // store the voronoi cells
  let lastPt = new Pt();

  // Create 20 random points and generate initial tessellations
  de = Create.delaunay(Create.distributeRandom(innerBound, 20));
  triangles = de.delaunay();
  cells = de.voronoi();

  // mouse events
  const event = createInputEvents(canvas);
  const mouse = new Pt();
  event.on("down", ({ position, event }) => {});
  event.on("up", ({ position, event }) => {});
  event.on("move", ({ position, event, dragging, uv }) => {
    mouse.to(uv).multiply(size);

    // Add up to 100 points on mouse move
    if (dragging && de.length < 100) {
      let p = mouse.clone();
      if (lastPt.$subtract(p).magnitudeSq() > 400) {
        lastPt = p;
        de.push(p);
        triangles = de.delaunay();
        cells = de.voronoi();
      }
    }
  });

  // A simple function to repel the points if they are too close
  let repel = (size) => {
    for (let k = 0, len = de.length; k < len; k++) {
      for (let i = 0, len = de.length; i < len; i++) {
        if (i !== k) {
          let d = de[k].$subtract(de[i]);
          if (d.magnitudeSq() < size * size) {
            de[k].subtract(d.$divide(-size / 3));
            de[i].subtract(d.$divide(size / 3));
          }
        }
      }
    }
  };

  return {
    render({ playhead, time }) {
      form.fillOnly("#123").rect([[0, 0], size]);

      // draw the cells
      form.strokeOnly("#fff", 1).polygons(triangles);
      form.fill("#0c9").points(de, 2, "circle");
      form.strokeOnly("#0fc").polygons(cells);

      // If more than 100 pts are added, do fancy things
      if (de.length >= 100) {
        de[de.length - 1] = mouse;
        repel(50);
        triangles = de.delaunay();
        cells = de.voronoi();

        // Guides: Show the neighbor cells of the point nearest to pointer
        let nearIndex = Polygon.nearestPt(de, mouse);
        // REVIEW: neighbors() 2nd param is not documented.
        de.neighbors(nearIndex, true).map((n) => {
          form.strokeOnly("rgba(255,255,0, .9)", 3).polygon(n.triangle);
          form.strokeOnly("rgba(255,255,0,.3)", 1).circle(n.circle);
          form.fillOnly("#fe6", 1).point(n.circle[0], 2);
        });
      }
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
