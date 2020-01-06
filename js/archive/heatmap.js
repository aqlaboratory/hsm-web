function d3ifyData(data, rowNames, colNames) {
  var dataD3 = [];
  for (var i=0; i < rowNames.length; i++) {
    var domainProt = rowNames[i];
    for (var j=0; j < colNames.length; j++) {
      var newDataPoint = {};
      newDataPoint.domain = domainProt;
      newDataPoint.peptide = colNames[j];
      newDataPoint.value = data[i][j];
      dataD3.push(newDataPoint);
    }
  }
  return dataD3;
}

function indexArray(arr) {
  var indexing = {};
  for (var i=0; i < arr.length; i++) {
    indexing[arr[i]] = i;
  }
  return indexing;
}


function getTicks(length, offset, scale) {
  var ticks = [];
  for (var i=0; i < length; i++) {
    ticks.push(i + offset);
  }
  return ticks;
}

function tooltipFmt(d, strength) {
  var before = "<br/><p><strong style='color:white'>Domain Containing Protein:</strong> <span style='color:red'>",
      middleFirst = "</span><br/><strong style='color:white'>Peptide Containing Protein:</strong> <span style='color:red'>",
      middleSecond = "</span><br/><strong style='color:white'>Strength:</strong><span style='color:red'>",
      after = "</span></p>";

  return before + d.domain + middleFirst + d.peptide + middleSecond + strength + after; 
}

function initializeHeatmap(data, rowNames, colNames) {
  var dataD3 = d3ifyData(data, rowNames, colNames);
  
  // Controls for display options. Currently loaded as a constant viewbox with zooming...
  var heatmapParentDiv = document.getElementById("heatmapDiv");
  var svgViewBoxHeight = heatmapParentDiv.clientHeight,
      svgViewBoxWidth = heatmapParentDiv.clientWidth;
  var margin = {top: 120, right: 50, bottom: 50, left: 110};
  var width = svgViewBoxWidth - margin.left - margin.right,
      height = svgViewBoxHeight - margin.top - margin.bottom;
  
  // Scales: color and xy scales. Note: the more appropriate option for the ordinal
  // data represented by xy scales would be a scalePoint type ordinal scale. In order
  // to zoom, however, we need to have a continuous scale...
  var colorScale = d3.scaleLinear()
                     .domain([0, .46, 1])
                     .range(["#007EEA", "#FFFFFF", "#EA157A"]);
  var notPredictedColor = "#D3D3D3";

  var xscale = d3.scaleLinear()
                 .domain([0, colNames.length])
                 .range([0, width]);
  
  var yscale = d3.scaleLinear()
                 .domain([0, rowNames.length])
                 .range([0, height]);
  
  var xstride = xscale(1) - xscale(0), ystride = yscale(1) - yscale(0);
  var xticks = getTicks(colNames.length, 0.5, xscale),
      yticks = getTicks(rowNames.length, 0.5, yscale);
  
  var xaxis = d3.axisTop(xscale)
                .tickValues(xticks)
                .tickFormat( function(d) {
                  return colNames[Math.floor(d)]
                });
  
  var yaxis = d3.axisLeft(yscale)
                .tickValues(yticks)
                .tickFormat( function(d) {
                  return rowNames[Math.floor(d)];
                });
  console.log(yscale(rowNames.length+1)); 
  var domainIndexing = indexArray(rowNames);
  var peptideIndexing = indexArray(colNames);
  
  // Inserting into the above space.
	d3.select("svg").remove();
	d3.select(".tooltip").remove();
  
  var zoom = d3.zoom()
               .scaleExtent([1, 10])
               .on("zoom", zoomed);
  
  var svg = d3.select('.heatmap')
              .append("svg")
              .attr("width", svgViewBoxWidth)
              .attr("height", svgViewBoxHeight);

	var container = svg.append("g")
              			 .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                     .call(zoom);
 	
  var tooltipDiv = d3.select('.heatmapTooltip')
                     .append("div")
                     .attr("class", "tooltip")
                     .style("opacity", 0);		
  

  var cells = container.selectAll('rect')
                 .data(dataD3)
                 .enter().append('g').append('rect')
                 .attr('class', 'cell')
                 .attr('width', xstride)
                 .attr('height', ystride)
                 //.style("stroke", "white")
                 .attr('y', function(d) { return yscale(domainIndexing[d.domain]); })
                 .attr('x', function(d) { return xscale(peptideIndexing[d.peptide]); })
                 .attr('fill', function(d) { return (d.value > 0) ? colorScale(d.value) : notPredictedColor; })
                 .on("mouseover", function(d) {
                    tooltipDiv.transition().duration(200).style("opacity", .9);
                    var strength = (d.value >= 0) ? d.value.toString().slice(0,4) : "Not Predicted";
                    tooltipDiv.html(tooltipFmt(d, strength));
                 })
                 .on("mouseout", function(d) {
                    tooltipDiv.transition().duration(200).style("opacity", 0);
                 });
  
  var yaxisG = container.append("g")
                        .attr("class", "y axis")
                        .call(yaxis)
                        .selectAll('text')
                        .attr('font-weight', 'normal');
  
  var xaxisG = container.append("g")
                        .attr("class", "x axis")
                        .call(xaxis)
                        .selectAll('text')
                        .style("text-anchor", "start")
                        .attr("dx", ".8em")
                        .attr("dy", ".5em")
                        .attr('font-weight', 'normal')
                        .attr("transform", function (d) {
                            return "rotate(-65)";
                        });

  function zoomed() {
    var newXscale = d3.event.transform.rescaleX(xscale);
    var newYscale = d3.event.transform.rescaleY(yscale);
    
    /*
    xaxisG.call(xaxis.scale(newXscale));
    yaxisG.call(yaxis.scale(newYscale));
    cells.attr("transform", d3.event.transform);
    */
	}
}
