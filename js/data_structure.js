/*
 * TODO: Allow for handling of probablistic framework
 *    This means handling both the case of hierarchical
 *    and relational probabalistic.
 */

/*
 * We define graphs, basically, as a collection of nodes, 
 * and a series of functions to expand and collapse nodes.
 *
 * Basically, the central component is the Node class defined
 * below. After that, one can just keep a list of nodes and modify
 * them below.
 */

var Node = function(nodeID, metadata, neighbors, proteinDesc) {
  /*
   * A node basically just contains the information about the
   * node (which will only really be meaningful at the base level)
   * and the relationship between the node and surrounding nodes.
   */
  return {
    name: nodeID,
    desc: proteinDesc[1],
    goTerms: proteinDesc[0],
    metadata: (metadata === undefined) ? [] : metadata,
    neighborIDs: (neighbors === undefined) ? [] : neighbors,
    parents: [],
    addParent: function(parentNode) {
      this.parents.push(parentNode);
    },
    children: [],
    addChild: function(childNode) {
      this.children.push(childNode);
    },
    getLeafNodes: function() {
      var childNodes = [];
      if (this.children.length === 0) {
        childNodes.push(this.name);
      } 
      this.children.forEach(function(child) {
        childNodes.push.apply(childNodes, child.getLeafNodes());
      });
      return childNodes;
    },
    getNeighborIDs: function() {
      var neighborNodeIDs = [];
      if (this.neighborIDs.length > 0) {
        neighborNodeIDs.push.apply(neighborNodeIDs, this.neighborIDs);
      }
      this.children.forEach(function(child) {
        neighborNodeIDs.push.apply(neighborNodeIDs, child.getNeighborIDs());
      });
      return neighborNodeIDs;
    },
    getMetadata: function() {
      var outputMetadata = [];
      if (this.children.length === 0) {
        outputMetadata.push.apply(outputMetadata, this.metadata);
      }
      this.children.forEach(function(child) {
        outputMetadata.push.apply(outputMetadata, child.getMetadata());
      });
      return outputMetadata;
    }
  } 
}

function loadInputJSON(json, threshold) {
  var outputNodes = [];
  
  var graphData = json["graph"],
      metadata = json["metadata"];
  
  var metadataMapping = metadata["nodeInformation"];
  var proteinMetadataMapping = metadata["proteinMetadata"];	

  // This is fucking stupid, but I can't figure out 
  // a bug when I unroll the set of edges into a dictionary;
  // it should be implemented as a map from id to list of neighbors
  function getNeighbors(node) {
    var nID = node[0], neighbors=[];
    graphData["base_graph"].forEach(function(edge) {
      if (edge[0] === nID) { neighbors.push(edge[1]); }
      else if (edge[1] === nID) { neighbors.push(edge[0]); }
    })
    return neighbors;
  }
  
  var baseNodes = [];
  graphData["base_graph"].forEach( function(edge) {
	  var [node1, node2] = edge;
    if (! (node1 in baseNodes)) { baseNodes.push(node1); }
    if (! (node2 in baseNodes)) { baseNodes.push(node2); }
  });
  

  var nodeDct = {};
  graphData["nodes"].forEach( function(node) {
    var pNode = Node(node[0], metadataMapping[node[0]], getNeighbors(node), proteinMetadataMapping[node[0]]);
    nodeDct[node[0]] = pNode;
    unrollHierarchy(node[0], node[2], nodeDct, metadataMapping, getNeighbors);
    outputNodes.push(pNode);
  });
  
  var outputEdges = findConnectedNodes(outputNodes, threshold); 
  return [outputNodes, outputEdges, metadata["types"]];
}

function unrollHierarchy(parentNodeID, children, nodeDct, metadataMapping, neighbors) {
  var parentNode = nodeDct[parentNodeID];
  children.forEach(function(ch) {
    var childNode = (ch[0] in nodeDct) ? nodeDct[ch[0]] : Node(ch[0], metadataMapping[ch[0]], neighbors(ch));
    if (! (ch[0] in nodeDct) ) { nodeDct[ch[0]] = childNode; }
    
    childNode.addParent(parentNode);
    parentNode.addChild(childNode);
    unrollHierarchy(ch[0], ch[2], nodeDct, metadataMapping, neighbors);
  });
}


function findConnectedNodes(nodeList, threshold) {
  var connected = [],
      childNodes = [],
      neighborNodes = [];
  
  nodeList.forEach(function(n) {
    childNodes.push(n.getLeafNodes());
    neighborNodes.push(n.getNeighborIDs());
  });

  function connectionStrength(nidx1, nidx2) {
    var i1 = childNodes[nidx1].map(x => (neighborNodes[nidx2].includes(x) ? 1 : 0)).reduce((a,b) => a+b, 0),
        i2 = childNodes[nidx2].map(x => (neighborNodes[nidx1].includes(x) ? 1 : 0)).reduce((a,b) => a+b, 0);
    
    return Math.min(i1, i2) / Math.min(childNodes[nidx1].length, childNodes[nidx2].length);
  }

  for (var i=0; i < nodeList.length; i++) {
    for (var j=i+1; j < nodeList.length; j++) {
      if (connectionStrength(i, j) >= threshold) { connected.push([nodeList[i], nodeList[j]]); }
    
    }
  }
  return connected.filter(function(e) { return e[0].name !== e[1].name; });
}
