function computePValue(k,n,K,N) {
  return -1;
}

async function computeGODistribution(goCounts, goDistribution, edges) {
  var flatEdges = edges.map(x => x.slice(0,2)).flat();
  var neighborhoodProteins = new Set(flatEdges);
  var n = neighborhoodProteins.size, N = goDistribution.N;
  
  var sample = {};
  
  neighborhoodProteins.forEach(function(prot) {
    if (goCounts.hasOwnProperty(prot)) {
      goCounts[prot].forEach(function(goTerm) {
        if (sample.hasOwnProperty(goTerm)) {
          sample[goTerm] = sample[goTerm] + 1;
        } else {
          sample[goTerm] = 1;
        }
      });
    }
  });
  
  var goEnrichment = [];
  Object.keys(sample).forEach(function(goTerm) {
    var k = sample[goTerm];
    var K = (goTerm in goDistribution ? goDistribution[goTerm] : -1);
    if (K > 0 & goTerm !== '') {
      var signif = computePValue(k, n, K, N);
      goEnrichment.push([goTerm, k, signif]); 
    }
  });
  
  goEnrichment.sort(function(a,b) { return a[1] <= b[1]; }); 
  return goEnrichment;
}
