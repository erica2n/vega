var dl = require('datalib'),
    d3 = require('d3'),
    Geo = require('./Geo'),
    Transform = require('./Transform'),
    tuple = require('../dataflow/tuple');

function GeoPath(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, Geo.Parameters);
  Transform.addParameters(this, {
    value: {type: "field", default: null},
  });

  this._output = {
    "path": "layout_path"
  };
  return this;
}

var proto = (GeoPath.prototype = new Transform());

proto.transform = function(input) {
  var output = this._output,
      geojson = this.param("value").accessor || dl.identity,
      proj = Geo.d3Projection.call(this),
      path = d3.geo.path().projection(proj);

  function set(t) {
    tuple.set(t, output.path, path(geojson(t)));
  }

  input.add.forEach(set);
  if (this.reevaluate(input)) {
    input.mod.forEach(set);
    input.rem.forEach(set);
  }

  input.fields[output.path] = 1;
  return input;
};

module.exports = GeoPath;
