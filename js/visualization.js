var CONST_alpha = .35;
var edgeThreshold = .1;
var linkDistance = 100;
var nodeRepulsion = -500;

var svg = d3.select("svg#mainVisualization");

var width = 1250,
    height = 1250;
console.log(width, height);

var simulation = d3.forceSimulation()
    .alpha(CONST_alpha)
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(nodeRepulsion))
    .force("center", d3.forceCenter(width / 2, height / 2));

var nodes = null,
    metadataTypes = null;

var linkD3 = null,
    link = null
    nodeD3 = null,
    node = null;

var pieChartBuilder = null; 


function reloadGraph(graph, edgeThreshold) {
  svg.selectAll("*").remove();
  var links = null;
  [nodes, links, metadataTypes] = loadInputJSON(graph, edgeThreshold);
  node = nodes.map(createRawNode);
  link = links.map(createRawLink);

  linkD3 = svg.append("g")
              .attr("class", "links")
	            .attr("id", "linksContainer")
              .selectAll("line")
              .data(link, function(d) { return d.source.id + "-" + d.target.id; })
              .enter().append("line")
              .attr("stroke-width", 1);

  nodeD3 = svg.append("g")
              .attr("class", "nodes")
	            .attr("id", "nodesContainer")
              .selectAll("g")
              .data(node, function(d) { return d.id; })
              .enter()
              .append("g")
              .attr("id", function(d, i) { return d.id; })
              .on("click", nodeClick)
              .call(d3.drag()
                      .on("start", dragstarted)
                      .on("drag", dragged)
                      .on("end", dragended));

  var update = {
    visibleTypes: Object.keys(metadataTypes),
    typeMapping: metadataTypes,
    typeOrdering: Object.keys(metadataTypes).sort(),
    //coloringFunction: makeColoringFunction(metadataTypes, null), 
    coloringFunction: pbdColoringFunction() 
  }
  pieChartBuilder = PieChartBuilder(update); 
  pieChartBuilder.makePieChart(nodeD3);

  nodeD3.append("text")
        .attr("dx", 16)
        .attr("dy", ".35em")
        .text(function(d) { return d.id; });

  //SliderFactory(svg, updateLinkLength, width - 10, height - 20, 80, 10, 10, 200, linkDistance, true, "Link Length");
  //SliderFactory(svg, updateMaxNodeRadius, width - 10, height - 50, 80, 10, 10, 50, pieChartBuilder._colorOptions.maxRadius, true, "Node Max. Radius");
  //SliderFactory(svg, updateRepulsion, width - 10, height - 80, 80, 10, 0, 500, -1 * nodeRepulsion, true, "Node Repulsion");
  
  simulation.nodes(node).on("tick", ticked);
  simulation.force("link").links(link).distance(linkDistance);
  simulation.alpha(CONST_alpha).restart();

}

function ticked() {
    linkD3
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    nodeD3
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"});
}
