
function updateEdgeThreshold(thr) {
  edgeThreshold = thr;
  link = findConnectedNodes(nodes, edgeThreshold).map(createRawLink);
  updateVisualization();
}

function updateMaxNodeRadius(rad) {
  var newOpts = {maxRadius:rad}; 
  pieChartBuilder.updateColorOptions(newOpts);
  pieChartBuilder.forceNodeUpdate(nodeD3);
}

function updateLinkLength(len) {
  linkDistance = len 
  updateVisualization();
}

function updateRepulsion(rep) {
  nodeRepulsion = -1 * rep;
  simulation.force("charge", d3.forceManyBody().strength(nodeRepulsion));
  simulation.alpha(CONST_alpha).restart();
}

var SliderFactory = function(svg, updateFn, posX, posY, width, height, rangeMin, rangeMax, initValue, interpolateOnDrag, sliderName) {
  var slider = svg.append("g")
                  .attr("class", "slider")
                  .attr("id", sliderName.split().join(''));
  
  var scale = d3.scaleLinear().domain([rangeMin, rangeMax]).range([posX, posX + width]);
  
  slider.append("rect")
        .attr("x", posX - .5 * height).attr("y", posY)
        .attr("height", height).attr("width", width + height)
        .attr("rx", height/2).attr("ry", height/2)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "#dddddd")
        .attr("fill-opacity", .7);
  
  function boundX(x, isDrag) { 
    var boundedX = Math.max(posX, Math.min(posX + width, x)); 
    if ( (!isDrag) || interpolateOnDrag) {
      updateFn(scale.invert(boundedX));
    }
    return boundedX;
  }
  slider.insert("circle")
        .attr("r", .5 * height)
        .attr("cx", scale(initValue)).attr("cy", posY + .5 * height)
	.attr("fill", "black")
        .call(d3.drag()
              .on("drag", function(d) { var uX = boundX(d3.event.x, true); d3.select(this).attr("cx", uX);})
              .on("end", function(d) { var uX = boundX(d3.event.x, false); d3.select(this).attr("cx", uX); })); 
  
  slider.insert("g")
        .attr("id", "tick-numbers")
        .selectAll("text")
        .data(scale.ticks(5))
        .enter().append("text")
        .attr("x", scale).attr("y", posY + 1.75 * height)
        .attr("font-family", "sans-serif")
        .attr("font-size", height/2)
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });
  slider.insert("text")
        .attr("x", posX).attr("y", posY - .5 * height)
        .attr("text-anchor", "start")
        .attr("font-family", "sans-serif")
        .attr("font-size", height/1.5)
        .text(sliderName);
  

} 
