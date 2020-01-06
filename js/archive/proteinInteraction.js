function visualizeInteraction(uprot1, uprot2, interactionMetadata) {
	var key1 = uprot1 + ":" + uprot2,
      key2 = uprot2 + ":" + uprot1;
  var interaction = (key1 in interactionMetadata.interactions) ? interactionMetadata.interactions[key1] : interactionMetadata.interactions[key2];
  var metadata1 = interactionMetadata.protein[uprot1];
  var metadata2 = interactionMetadata.protein[uprot2];
  
  d3.select("svg#edgeVisualization").html("");
  var interactionSVG = d3.select("svg#edgeVisualization");
  var width = interactionSVG.attr("width"),
      height = interactionSVG.attr("height");
 
  interactionSVG.append("text")
                .text("HSM/D Interaction Predictions")
                .attr("x", 5)
                .attr("y", 20)
                .attr("text-anchor", "start")
                .style("font", "20px sans-serif");
  
  protein1Positions = drawLine(interactionSVG, width, height, .35, metadata1, metadata2.proteinLength);
  protein2Positions = drawLine(interactionSVG, width, height, .85, metadata2, metadata1.proteinLength);

  interaction.forEach(function(interact) {
    drawInteraction(interactionSVG, uprot1, protein1Positions, uprot2, protein2Positions, interact);
  });
  
  interactionSVG.append("text")
                .text(uprot1)
                .attr("x", 10)
                .attr("y", .38 * height)
                .style("font", "bold 10px sans-serif")
                .attr("text-anchor", "start");
 
  interactionSVG.append("text")
                .text(uprot2)
                .attr("x", 10)
                .attr("y", .88 * height)
                .style("font", "bold 10px sans-serif")
                .attr("text-anchor", "start");

  interactionSVG.append("text")
                .text("Strength Denoted By Width and Opacity")
                .attr("x", width * .95)
                .attr("y", height * .95)
                .style("font", "bold 8px sans-serif")
                .attr("text-anchor", "end");
} 

function drawInteraction(svgObject, uprot1, positions1, uprot2, positions2, interact) {
  var u1 = interact[0], u2 = interact[1], strength = interact[2];
  
  if (u1[0] == uprot1) {
    var pos1 = positions1[u1[1] + ":" + u1[2] + ":" + u1[3]],
        pos2 = positions2[u2[1] + ":" + u2[2] + ":" + u2[3]];
  } else {
    var pos1 = positions2[u1[1] + ":" + u1[2] + ":" + u1[3]],
        pos2 = positions1[u2[1] + ":" + u2[2] + ":" + u2[3]];
  }
  
  var x1 = (pos1[0] + pos1[1]) /2, x2 = (pos2[0] + pos2[1]) / 2;
  var y1 = (pos1[2] + pos1[3]) / 2 ,
      y2 = (pos2[2] + pos2[3]) / 2;

  svgObject.insert("line", ":first-child")
     .attr("x1", y1).attr("y1", x1)
     .attr("x2", y2).attr("y2", x2)
     .attr("stroke-linecap", "round")
     .style("stroke", "black")
     .style("stroke-width", 4 * strength)
     .style("opacity", strength)
     .style("stroke-dasharray", "5,5");
  
  /*
  svgObject.append("circle")
     .attr("cx", (x1 + x2) / 2).attr("cy", (y1 + y2)/2)
     .attr("r", 10)
     .style("fill", "black");
  svgObject.append("text")
     .attr("x", (x1+x2)/2).attr("y", (y1+y2)/2)
     .style("fill", "white")
     .style("font", "15px sans-serif")
     .text(strength);
  */
}

function drawLine(svgObject, width, height, hpctage, metadata, otherLength) {
  var cmap = {
    Kinase_TK_domain: "#4D648D",
    SH2_domain: "#6A7B93",
    PTB_domain: "#8097C0",
    PTP_domain: "#D0E1F9",
    PDZ_domain: "#B6452C",
    WW_domain: "#B3DE81",
    WH1_domain: "#68A225",
    SH3_domain: "#265C00",
    tyr_peptide: "#357e97",
    prol_peptide: "#3f681c",
    pdz_peptide: "#B6452C"
  }
	
  var cheight = height * hpctage;
  var y0 = cheight - .05 * cheight, y1 = cheight + .05 * cheight;
  
  var d0 = cheight - .025 * height, d1 = cheight + .025 * height;
  var p0 = cheight - .075 * cheight, p1 = cheight  + .075 * cheight;
  
  var plength = metadata.proteinLength;
  var wpctage = (plength < otherLength) ? (plength / otherLength) : 1; 
  var offset = .15 * width;
  var x0 = offset + (width - offset) * ((1-wpctage) / 2), x1 = width - 5 - ((1-wpctage) /2) * (width - offset);
  var svgWidth = (x1-x0) / 2;

  svgObject.append("line")
     .attr("x1", x0)
     .attr("x2", x1)
     .attr("y1", cheight)
     .attr("y2", cheight)
     .attr("stroke-linecap", "round")
     .attr("stroke", "black")
     .attr("stroke-width", 5);
  
  var positions = {};
  
  var domainMetadata = metadata.domain,
      peptideMetadata = metadata.peptide;

  domainMetadata.forEach(function(dtuple) {
    var color = cmap[dtuple[0]];
    var sidx = dtuple[1], eidx = dtuple[2];
    var dstart = x0 + (x1-x0) * (sidx / plength),
        dend = x1 - (x1-x0) * ((plength - eidx) / plength);
    svgObject.append("rect")
       .attr("x", dstart)
       .attr("width", dend - dstart)
       .attr("y", d0)
       .attr("height", d1-d0)
       .attr("rx", 1)
       .attr("ry", 1)
       .attr("stroke-width", 2)
       .attr("fill", color);
    positions[dtuple[0] + ":" + sidx + ":" + eidx] = [d0, d1, dstart, dend]
  });

  peptideMetadata.forEach(function(ptuple) {
    var color = cmap[ptuple[0]];
    var sidx = ptuple[1], eidx = ptuple[2];
    var pstart = x0 + (x1-x0) * (sidx / plength),
        pend = x1 - (x1-x0) * ((plength-eidx) / plength);
    svgObject.append("circle")
       .attr("cx", (pend+pstart) / 2)
       .attr("cy", (p0 + p1)/2)
       .attr("r", 5)
       .attr("stroke-width", 2)
       .attr("fill", color);
    positions[ptuple[0] + ":" + sidx + ":" + eidx] = [d0, d1, pstart, pend]
  });
  return positions 
}
interactionMetadata = {};
interactionMetadata.protein = {};
interactionMetadata.protein["O00308"] = {proteinLength:100, domain:[["SH2_domain", 15,35], ["PDZ_domain", 85,99]], peptide:[["tyr_peptide", 45,60]]};
interactionMetadata.protein["Q96JM2"] = {proteinLength:250, domain:[["Kinase_TK_domain", 10,100]], peptide:[["tyr_peptide", 60,80], ["tyr_peptide", 110,125], ["pdz_peptide", 240,250]]};
interactionMetadata.interactions = {};
interactionMetadata.interactions["O00308:Q96JM2"] = [[["O00308", "SH2_domain", 15, 35], ["Q96JM2", "tyr_peptide", 110, 125], .95],
					   [["O00308", "SH2_domain", 15, 35], ["Q96JM2", "tyr_peptide", 60, 80], .05],
					   [["O00308", "PDZ_domain", 85, 99], ["Q96JM2", "pdz_peptide", 240,250], .65],
					   [["Q96JM2", "Kinase_TK_domain", 10, 100], ["O00308", "tyr_peptide", 45, 60], .55]];

visualizeInteraction("O00308", "Q96JM2", interactionMetadata, "0.95")
