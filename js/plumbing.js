var interactionDir = "assets/interaction_data/predictions/";
var goMetadataDir = "assets/interaction_data/go_metadata/";
var descriptionMetadataDir = "assets/interaction_data/description_metadata/";
var proteinCompositionFile = "assets/interaction_data/proteinComposition.json";
var goMetadataCounts = "assets/interaction_data/go.background.json";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadInteractions(queryProteins, hsmpThreshold, neighborsThreshold) {
  var interactions = [];
  var goMetadata = {};
  var descMetadata = {};
  
  var loaded = 0;

  for (var i=0; i < queryProteins.length; i++) {
    d3.json(interactionDir + queryProteins[i] + ".json", function(data) {
      for (var i=0; i < data.length; i++) {
        interactions.push(data[i]);
      }
      loaded++;
    });

    d3.json(goMetadataDir + queryProteins[i] + ".json", function(data) {
      Object.assign(goMetadata, data);
      loaded++;
    });

    d3.json(descriptionMetadataDir + queryProteins[i] + ".json", function(data) {
      Object.assign(descMetadata, data);
      loaded++;
    });
  }
  
  var proteinComposition = undefined;
  d3.json(proteinCompositionFile, function(data) {
    proteinComposition = data;
  });
  
  var goDistribution = undefined;
  d3.json(goMetadataCounts, function(data) {
    goDistribution = data;
  });
  
  for (var i=0; i < 30; i++) {
    console.log("Awaiting");
    if (queryProteins.length * 3 > loaded | proteinComposition === undefined | goDistribution === undefined) {
      await sleep(1000);
    } else {
      break;
    }
  }
  if (queryProteins.length * 3 > loaded | proteinComposition === undefined | goDistribution === undefined) {
    alert("Query was to large, could not load. Please adjust parameters.");
  }
  return [interactions, goMetadata, descMetadata, proteinComposition, goDistribution];
}

function addInteractions(interactions) {
  var interactionsHTML = interactions.map(function(ai) {
    return "<tr><td><small>" + ai [0] + "</small></td><td><small>" + ai[1] + "</small></td><td><small>" + ai[2].toString() + "</small></td></tr>";
  }).join('');

  $("#interactionLikelihoodTable").empty();
  $("#interactionLikelihoodTable").append(interactionsHTML);
}

async function createGraph(edges, goMetadata, descMetadata, nodeComposition, threshold) {
  console.log("creating graph");
  var graphData = {};
	
  var edgesFilt = edges.filter(function(e) { return e[2] >= threshold; });

  var neighborhoodProteins = new Set(edgesFilt.map(x=>x.slice(0,2)).flat()); 

  graphData["graph"] = {
    base_graph: edgesFilt, 
    nodes: Array.from(neighborhoodProteins).map(function(n) { return [n,[],[],1]; })
  };
  
  var typeOrders = {
    inner: ["SH2", "Kinase_TK", "PTP", "PTB", "WH1", "WW", "SH3", "PDZ"].map(function(s) { return s + "_domain"; } ),
    outer: ["prol", "tyr", "pdz"].map(function(s) { return s + "_peptide"; })
  };
  
  var nodeMetadata = {};
  neighborhoodProteins.forEach(function(n) {
    var go = (n in goMetadata) ? goMetadata[n] : null; 
    var desc = (n in descMetadata) ? descMetadata[n] : null;
    nodeMetadata[n] = [go, desc];
  });

  graphData["metadata"] = {
    nodeInformation: nodeComposition,
    types: typeOrders,
    proteinMetadata:nodeMetadata
  };
  
  return graphData;
};

var pbdContainingProteins = [["P19174"],["Q15303"],["O15018"],["Q9UHR4"],["Q96RU3"],["Q92729"],["O14508"],["O14936"],["Q9BYW2"],["Q6S5L8"],["A6NJZ7"],["Q5T0N5"],["P22607"],["Q9BRR9"],["Q9UKN7"],["Q15811"],["Q8WXI2"],["Q15700"],["Q14CM0"],["Q7M4L6"],["O43295"],["Q12774"],["Q9UKW4"],["O60861"],["Q9H6Y5"],["Q8IUC4"],["Q96N96"],["P29320"],["Q15256"],["Q5T2T1"],["Q8WXD9"],["Q9Y371"],["Q01973"],["Q13796"],["Q6ZV89"],["P42679"],["Q5R372"],["A7KAX9"],["Q969H4"],["Q13882"],["P54792"],["Q02410"],["Q9BYG4"],["Q8TF42"],["Q16674"],["P06213"],["Q13308"],["Q92614"],["P06241"],["P29475"],["P15924"],["P18031"],["O15146"],["P80192"],["Q9P202"],["Q07912"],["P43403"],["Q9BY11"],["Q15678"],["O75400"],["Q5JRA6"],["O00459"],["Q6P9H4"],["Q9H6S3"],["Q9H6Q3"],["Q08289"],["O15068"],["P08581"],["Q7Z6J2"],["O00151"],["O00560"],["Q12923"],["Q9HAU0"],["Q15262"],["P35968"],["Q15599"],["O14559"],["P42680"],["P29376"],["O60828"],["Q96JP2"],["Q6XZF7"],["Q06187"],["Q7Z698"],["Q14511"],["Q8N5H7"],["Q9HAP6"],["Q02763"],["Q8TF17"],["Q5TCZ1"],["P29323"],["O95049"],["P35590"],["Q9ULJ8"],["P16591"],["Q13470"],["P54829"],["Q8TCU6"],["O94885"],["Q9C0E4"],["P54756"],["P55345"],["P11532"],["P23471"],["Q9H5P4"],["Q9BRG2"],["Q8N3X1"],["P07333"],["P56945"],["P20929"],["P46934"],["P52630"],["Q96QH2"],["P54762"],["P98171"],["Q9NSI8"],["Q9Y5X1"],["Q04912"],["Q13402"],["Q03001"],["Q9NRF2"],["Q92608"],["O14908"],["Q16825"],["P09769"],["Q92625"],["P21709"],["P49796"],["P43405"],["Q14451"],["Q9NRD5"],["Q9H3Y6"],["P29074"],["Q9HBL0"],["Q92835"],["Q13576"],["Q8TBB1"],["P30530"],["Q9H7D0"],["Q13625"],["Q53GG5"],["Q5VV41"],["Q8TF64"],["P78314"],["Q16832"],["Q9Y6V0"],["Q9Y4G8"],["Q9HAU4"],["Q07157"],["Q92882"],["A8MT19"],["Q6ZUM4"],["Q8IZP0"],["P17948"],["P98077"],["Q5VWT5"],["Q8WWI1"],["Q9Y6R0"],["Q5JV73"],["Q9ULZ2"],["Q9NZM3"],["Q13813"],["Q9BX66"],["P07948"],["Q12913"],["Q96JY6"],["Q8N2Y8"],["O14796"],["Q16827"],["Q99469"],["O15524"],["P51813"],["P14598"],["P83110"],["Q9BSQ5"],["Q7KZ85"],["Q9P2A4"],["Q13332"],["Q92783"],["Q4JDL3"],["Q9ULH1"],["O75052"],["Q68CZ2"],["Q05209"],["P14616"],["P42684"],["O76041"],["Q9NR12"],["Q9UPV0"],["O00401"],["Q8TEJ3"],["P46109"],["P21860"],["Q68DX3"],["Q8TF65"],["P10721"],["O75044"],["P42224"],["Q6P0Q8"],["O75554"],["Q6ZMN7"],["Q86WV1"],["A4FU49"],["P40763"],["Q7Z6G8"],["Q9H3S7"],["Q9P0V3"],["Q96B97"],["Q13526"],["Q15642"],["Q8WXE0"],["Q16288"],["O95153"],["Q9NZQ3"],["Q8TC17"],["P54753"],["O75112"],["Q9UQF2"],["P29322"],["Q15080"],["Q9BXM0"],["Q02779"],["Q13368"],["Q5VST9"],["Q5VZ18"],["Q96HC4"],["Q8TB24"],["P17706"],["Q8IX03"],["O15259"],["Q5TCX8"],["Q14449"],["Q9ULV8"],["Q13884"],["O00160"],["O43166"],["Q76N89"],["Q09666"],["Q8TDM6"],["Q14160"],["Q13387"],["Q96HU1"],["O60229"],["Q9NXL2"],["Q8TEC5"],["Q96Q04"],["Q96PC5"],["Q8TEU7"],["Q14185"],["A6NI72"],["P22455"],["P27986"],["O00305"],["P29597"],["Q99952"],["Q96FS4"],["P57105"],["P23468"],["Q5T2W1"],["P23458"],["Q5JZY3"],["Q14155"],["Q9H4B6"],["Q96JB8"],["O14907"],["Q9Y566"],["O75815"],["Q96SB3"],["Q9NZW5"],["Q00013"],["O60759"],["Q9NYB9"],["Q6ZN28"],["Q8TE82"],["P49757"],["O75886"],["P12931"],["P26045"],["Q99962"],["Q76G19"],["Q5SQS7"],["Q9HD26"],["P06239"],["Q9NUP9"],["P23467"],["Q12866"],["Q5SW96"],["Q9UNF0"],["Q06124"],["Q9BQQ3"],["Q9HD43"],["Q92743"],["Q9ULD6"],["O75563"],["Q92997"],["Q9Y3P9"],["Q96MF2"],["O00233"],["Q13671"],["P11362"],["P54760"],["Q6J9G0"],["Q9P227"],["P04629"],["Q6ZWJ1"],["P52757"],["P42681"],["Q8NFA2"],["Q9H8Y8"],["Q9NR46"],["Q5TCQ9"],["Q9NPB6"],["A1A4S6"],["Q92529"],["Q9H788"],["Q9UPX8"],["P16234"],["Q5VWI1"],["O43307"],["Q8IVI9"],["P51451"],["Q9UQ26"],["Q13588"],["O75962"],["Q9UFD9"],["Q8WYQ5"],["Q96NW7"],["Q86UT5"],["P00519"],["O15021"],["Q8N1G2"],["O15357"],["O75159"],["Q6ZMT1"],["Q16620"],["P54764"],["Q08881"],["O60307"],["Q14289"],["Q63HR2"],["Q9H4Z3"],["O14641"],["Q8NI35"],["Q6AWC2"],["Q9Y2R2"],["O00499"],["Q9BVN2"],["Q12959"],["Q8IXQ8"],["P98082"],["P08922"],["P46940"],["Q6ZMQ8"],["P23470"],["P42226"],["P09619"],["O60880"],["P02549"],["Q8WXH5"],["P28827"],["P29353"],["O00213"],["Q15052"],["P42768"],["P42229"],["Q9UPQ7"],["P07332"],["Q9UMZ3"],["Q99767"],["P55196"],["Q86YM7"],["P50552"],["Q9NQ75"],["P07947"],["Q9ULL8"],["P20936"],["Q9UJU6"],["Q9GZV5"],["Q9NZC7"],["Q6PIF6"],["Q8NEN9"],["O14910"],["O14512"],["Q92796"],["Q14005"],["O94868"],["O95817"],["Q96L92"],["P04626"],["P52333"],["O14745"],["Q8N8S7"],["P46939"],["P21802"],["Q96QZ7"],["Q9HCE7"],["Q13474"],["P83105"],["O94875"],["Q9NSE2"],["A8MUH7"],["Q96IW2"],["Q9H0M0"],["P41240"],["Q12929"],["Q05397"],["P15498"],["Q92569"],["Q9UPN3"],["A1X283"],["Q13191"],["Q7Z6B7"],["Q6IN97"],["Q13425"],["Q9UKS6"],["P50479"],["O15085"],["Q13239"],["O15197"],["P08575"],["Q13094"],["Q9NP31"],["Q86WN1"],["Q7Z4S9"],["Q14247"],["O95704"],["P14317"],["Q8TF72"],["Q5EBL8"],["Q8IWW6"],["Q9NSC5"],["Q2MJR0"],["Q96JZ2"],["Q8TB45"],["Q9UMS6"],["P22681"],["O14522"],["O60674"],["O43464"],["O43150"],["Q9C0H5"],["Q9P2F8"],["Q9UDY2"],["Q9UM73"],["Q8N3R9"],["Q9UBP9"],["Q8TE67"],["Q01974"],["Q8IZW8"],["P42685"],["Q9Y6N9"],["P35236"],["P51692"],["Q15375"],["P16333"],["Q8N448"],["Q86UR5"],["P53667"],["Q02641"],["P29317"],["Q12965"],["Q86UR1"],["O14544"],["P08631"],["Q9UQQ2"],["P62993"],["Q16584"],["O14640"],["Q08345"],["Q8IVF5"],["A6NNM3"],["Q92932"],["P10586"],["Q9NZN5"],["Q9BXL6"],["Q96JH8"],["P08069"],["Q9H987"],["Q8N5V2"],["Q9UF33"],["O14713"],["O96018"],["P00533"],["Q5T5U3"],["O43639"],["Q96RT1"],["Q8IZD9"],["O15034"],["Q5HYK7"],["Q9UI08"],["Q96KQ4"],["Q9BYC5"],["Q8WYP3"],["Q96RF0"],["Q06418"],["Q13322"],["Q96DR7"],["O60504"],["Q9NY99"],["Q9BXL7"],["O14492"],["O75970"],["Q96PU5"],["Q99961"],["O60292"],["Q9Y5K6"],["O75791"],["Q96HL8"],["Q15464"],["Q14168"],["Q9H190"],["P16885"],["P35916"],["Q9P2P5"],["P36888"],["Q92968"],["Q14765"],["P49418"],["Q9NSN8"],["O14543"],["Q6NWY9"],["P78352"],["Q8N1I0"],["P07949"],["P46937"],["P57075"],["Q7Z6J0"],["P19878"],["O14924"],["P52735"],["P54284"],["Q8NEU8"],["P18433"],["Q70Z35"],["A8MVU1"],["Q13424"],["Q14847"],["Q8WUF5"],["Q16849"],["Q8IVF2"],["O75553"],["Q92870"],["Q8IWU2"],["P53671"],["P34925"],["Q96J02"],["Q8TCX5"],["Q9UKG1"],["A6NI28"],["Q9NSB8"],["Q8TEW0"],["O75995"],["P23469"],["Q9Y2H9"],["P46108"],["Q7Z7G1"],["O15117"],["Q8N157"],["O43281"],["Q9UGK3"],["Q9BTA9"],["Q13009"],["A4D2P6"],["Q9NR80"],["Q9UN19"],["Q7Z2X4"],["Q8WV41"],["Q9UNA1"],["Q8WV28"],["O15428"],["Q9Y3R0"],["Q8TE68"],["Q6UXY1"],["P43378"],["Q99963"],["O00308"],["Q7Z699"],["P29350"],["Q9NRC9"],["Q6IQ23"],["Q5SYB0"],["Q8IW93"],["Q8TEW8"],["A1IGU5"],["P15882"],["Q9BYB0"],["Q9BYG5"],["Q86UL8"],["O43586"],["O14776"],["Q9UQB8"]];

function initializePBDInput() {
  var htmlFormatted = pbdContainingProteins.map(function(a) {
    return "<option id=\"" + a[0] + "\">" + a[0] + "</option>";
  }).join("");

  $("#inputQueryProteins").append(htmlFormatted);
}
