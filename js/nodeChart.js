function modifyColorOptions(opts, update) {
  Object.keys(update).forEach(function(k) {
    opts[k] = update[k]; 
  });
  // TODO: throw error if improperly formatted.
  
  var updateArcsNeeded = (("typeMapping" in update) || ("typeOrdering" in update) || ("maxRadius" in update));
  if (updateArcsNeeded) {
    var _updatedArcs = [];

    var radiusStep = (opts.maxRadius / opts.typeOrdering.length),
        radiusPadHalf = (opts.intermediatePad === null) ? 0 : opts.intermediatePad / 2; 
    
    if (radiusPadHalf * 2 > radiusStep) { radiusPadHalf = 0; }

    for (var i=0; i < opts.typeOrdering.length; i++) {
      var newArc = d3.arc()
                     .innerRadius(i * radiusStep + radiusPadHalf)
                     .outerRadius((i+1) * radiusStep - radiusPadHalf);
      _updatedArcs.push(newArc);
    }
    opts.arcs = _updatedArcs;
  } 
  return updateArcsNeeded;
}

function makeColoringFunction(typeMapping, defaultColor) {
  var classes = [];
  Object.keys(metadataTypes).forEach(function(t) {
    classes.push.apply(classes, typeMapping[t]);
  });
  
  var colors = (classes.length <= 10) ? d3.scaleOrdinal(d3.schemeCategory10) : d3.scaleOrdinal(d3.schemeCategory20);
  var cmap = {};

  for (var i=0; i < classes.length; i++) {
    cmap[classes[i]] = colors(i);
  }
  
  var dcolor = (defaultColor === null) ?  "#F5F5DC" : defaultColor;

  return function(inClass) {
    if (inClass in cmap){
      return cmap[inClass];
    }
    return dcolor;  
  } 
}


function pbdColoringFunction() {
  var cmap = {
    Kinase_TK_domain: "#007EEA",
    SH2_domain: "#A6D2F8",
    PTB_domain: "#59ABF1",
    PTP_domain: "#0D5BA1",
    PDZ_domain: "#FEB80A",
    WW_domain: "#7FD13B",
    WH1_domain: "#CCEDB1",
    SH3_domain: "#5E9031",
    tyr_peptide: "#007EEA",
    prol_peptide: "#7FD13B",
    pdz_peptide: "#FEB80A"
  }
  var defaultColor = "#DCDCDC";
  
  return function(inClass) {
    if (inClass in cmap) {
      return cmap[inClass];
    }
    return defaultColor;
  }
}


function extractProportions(classesPerType, metadata) {
  var countsDct = {};
  classesPerType.forEach(function(cl) { countsDct[cl] = 0; });
  
  metadata.forEach(function(cl) {
    if (classesPerType.includes(cl)) {
      countsDct[cl] += 1;
    }
  });

  var proportions = [];
  Object.keys(countsDct).forEach(function(cl) {
    var ct = countsDct[cl];
    if (ct > 0) {proportions.push({group:cl, value:ct})}
  })

  if (proportions.length === 0) {
    proportions.push({group:undefined, value:1});
  }
  return proportions;
}

var PieChartBuilder = function(initialColorOptions) {
  var pie = d3.pie()
              .sort(null)
              .value(function(d) { return d.value; });
  
  var colorOptions = {
    visibleTypes: null,
    typeMapping: null,
    typeOrdering: null, // This is the type order inside to outside
    maxRadius: 15,
    intermediatePad: .5,
    coloringFunction: null,
    arcs: null,
  };
  modifyColorOptions(colorOptions, initialColorOptions);  

  return {
    _colorOptions: colorOptions,
    updateColorOptions: function(update) { modifyColorOptions(this._colorOptions, update); },
    makePieChart: function(nodeElement) {
      for (var j=0; j < this._colorOptions.typeOrdering.length; j++) {
        var currArc = this._colorOptions.arcs[j];
        var ringID = "arcRing" + j;
        var classes = this._colorOptions.typeMapping[this._colorOptions.typeOrdering[j]];
        var colorFn = this._colorOptions.coloringFunction;
        nodeElement.selectAll("path")
                   .filter("." + ringID)
                   .data(function(d, i) { return pie(extractProportions(classes, d.metadata)); })
                   .enter()
                   .append("svg:path")
                   .attr("class", ringID) 
                   .attr("d", currArc)
                   .attr("fill", function(d, i) { return colorFn(d.data.group); }); 
      }

    },
    forceNodeUpdate: function(nodeElement) {
      for (var j=0; j < this._colorOptions.typeOrdering.length; j++) {
        var currArc = this._colorOptions.arcs[j];
        var ringID = "arcRing" + j;
        var classes = this._colorOptions.typeMapping[this._colorOptions.typeOrdering[j]];
        var colorFn = this._colorOptions.coloringFunction;
        nodeElement.selectAll("." + ringID)
                   .each(function(d) { d3.select(this).attr("d", currArc); });
      }	
    }
  }
} 
