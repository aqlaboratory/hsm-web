function createRawLink(l) {
  var olink = {};
  olink["source"] = l[0].name;
  olink["target"] = l[1].name;
  olink["value"] = 1;
  return olink;
}

function createRawNode(n) {
  var onode = {};
  onode["id"] = n.name;
  onode["metadata"] = n.getMetadata();
  onode["proteinDesc"] = n.desc;
  onode["goTerms"] = n.goTerms;
  return onode;
}

function createCenteredNode(n, initX, initY) {
  var onode = {};
  onode["id"] = n.name;
  onode["metadata"] = n.getMetadata();
  onode["proteinDesc"] = n.desc;
  onode["goTerms"] = n.goTerms;
  onode["x"] = initX;
  onode["y"] = initY;
  return onode;
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function printMetadata(d) {
  $("#proteinDescID").html(d.id); 
  $("#proteinDescWell").html(d.proteinDesc); 
  $("#proteinDescGO").html(d.goTerms.join("<br>"));
}

function nodeClick(d) {
  d.fx = null;
  d.fy = null;
  printMetadata(d);
}


// TODO: Robust-ify this. What happens if multiple events happen? 
var draggedArea = {
  dragStartX: null,
  dragStartY: null,
  dragEndX: null,
  dragEndY: null
}
