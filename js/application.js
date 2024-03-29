/*jshint esversion: 6 */

//Read route paranms
let pdbid = window.location.search.substr(1);
if (!pdbid) {
  pdbid = "1KJ5";
}

let protein;
let heatmapData = [];
let wtData = {};
let barchartData = {
  mutation: [],
  sizes: [],
  counts: []
};

function addBarchartData(clusterSizeDistribution, mutationName) {
  let size = [];
  let count = [];
  clusterSizeDistribution.forEach((d) => {
    size.push(d.size);
    count.push(d.count);
  });
  barchartData.mutation.push(mutationName);
  barchartData.sizes.push(size);
  barchartData.counts.push(count);
  console.log(barchartData)
}



d3.json(`data/${pdbid}.json`, (data) => {
  protein = data;
  wtData = data.basicStats;
  data.mutations.forEach((d) => {
    heatmapData.push(d.mutants.map((m) => {
      if (m.mutantAcid === d.aminoAcidLetterCode) {
        return null;
      }
      return {
        rigidityDistance: m.rigidityDistance,
        avgClusterSize: m.basicStats.avgClusterSize,
        largestCluster: m.basicStats.largestCluster,
        clusterSizeDistribution: m.clusterSizeDistribution,
        points: m.basicStats.points,
        freePoints: m.basicStats.freePoints,
        hinges: m.basicStats.hinges,
        bars: m.basicStats.bars,
        bodies: m.basicStats.bodies,
        dofs: m.basicStats.dofs,
      };
    }));
  });
  let wildTypeSize = [];
  let wildTypeCount = [];

  addBarchartData(data.clusterSizeDistribution, "Wild Type");
  heatmap();
});

function heatmap() {
  let width = 800;
  let height = 40 * heatmapData.length;
  const margin = {
    top: 120,
    right: 0,
    bottom: 10,
    left: 80
  };

  let acid_labels = [
    "ALA (A)",
    "CYS (C)",
    "ASP (D)",
    "GLU (E)",
    "PHE (F)",
    "GLY (G)",
    "HIS (H)",
    "ILE (I)",
    "LYS (K)",
    "LEU (L)",
    "MET (M)",
    "ASN (N)",
    "PRO (P)",
    "GLN (Q)",
    "ARG (R)",
    "SER (S)",
    "THR (T)",
    "VAL (V)",
    "TRP (W)",
    "TYR (Y)"
  ];
  const legendHeight = 20;
  const legendWidth = width + margin.left + margin.right;
  const legendId = 'legendGradient';

  const stable_color = "#2c7bb6";
  const middle_color = "#ffffbf";
  const unstable_color = "#d7191c";
  const low_color = "#e5f5f9";
  const mid_color = "#99d8c9";
  const high_color = "#2ca25f";
  const black = "#000";
  const white = "#fff";

  let removedRowCount = 0;
  let removedColumnCount = 0;
  let rowLabels = [];
  for (let i = 0; i < heatmapData.length; i++) {
    rowLabels.push(`${i + 1}`);
  }

  const x = d3.scale.ordinal().rangeBands([0, width]);
  const y = d3.scale.ordinal().rangeBands([0, height]);

  const z = d3.scale.linear().range([0, 1]).clamp(true);
  const c = d3.scale.linear().range([unstable_color, middle_color, stable_color]);

  //options nemu
  let selectedOptionTitle = "Rigidity Distance"
  let selected_option = "rigidityDistance";
  const options_data = {
    "Rigidity Distance": "rigidityDistance",
    "Average Cluster Size": "avgClusterSize",
    "Largest Cluster": "largestCluster",
    "Points": "points",
    "Free Points": "freePoints",
    "Hinges": "hinges",
    "Bars": "bars",
    "Bodies": "bodies",
    "Degrees of Freedom": "dofs"

  };

  const select = d3.select('#options-menu')
    .append('select')
    	.attr('class','select')
      .on('change', onOptionChange);

  const options = select
    .selectAll('option')
  	.data(Object.keys(options_data)).enter()
  	.append('option')
  		.text((d) => d);

  function onOptionChange() {
    selectedOptionTitle = d3.select('select').property('value');
  	selected_option = options_data[selectedOptionTitle];
  	updateHeatmap();
  }

  //svg initialize
  const svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg.append("text")
    .attr("class", "chartTitle")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width / 2}, ${-margin.top / 2 - 20})`)
    .text("Rigidity of Protein Mutations");


  const legend = d3.select("#heatmap")
    .append("div")
      .append("svg:svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight);

  const gradient = svg.append("svg:defs")
    .append("svg:linearGradient")
    .attr("id", "heatmap-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

  const leftGradient = gradient.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", unstable_color)
    .attr("stop-opacity", 1);

  const midGradient = gradient.append("svg:stop")
    .attr("offset", "50%")
    .attr("stop-color", middle_color)
    .attr("stop-opacity", 1);

  const rightGradient = gradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", stable_color)
    .attr("stop-opacity", 1);

  legend.append("svg:rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#heatmap-gradient)")
    .attr("transform", `translate(${margin.left}, 0)`);

  let minRD = d3.min(heatmapData, (d) => d3.min(d, (k) => k ? k.rigidityDistance : Infinity));
  let maxRD = d3.max(heatmapData, (d) => d3.max(d, (k) => k ? k.rigidityDistance : -Infinity));

  const rightLegendText = legend.append("text")
    .attr("class", "legendText")
    .attr("text-anchor", "end")
    .attr("y", legendHeight - 5)
    .attr("x", legendWidth - margin.right - 10)
    .style("fill", black)
    .text(`Stable: ${maxRD}`);

  const midLegendText = legend.append("text")
    .attr("class", "legendText")
    .attr("text-anchor", "end")
    .attr("y", legendHeight - 5)
    .attr("x", width / 2 + margin.left + 10)
    .style("fill", black)
    .text("WT: 0");

  const leftLegendText = legend.append("text")
    .attr("class", "legendText")
    .attr("y", legendHeight - 5)
    .attr("x", margin.left + 10)
    .style("fill", white)
    .text(`Unstable: ${minRD}`);

  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


  function updateHeatmap() {
    let min = d3.min(heatmapData, (d) => d3.min(d, (k) => k ? k[selected_option] : Infinity));
    let max = d3.max(heatmapData, (d) => d3.max(d, (k) => k ? k[selected_option] : -Infinity));
    if (selected_option === "rigidityDistance") {
      c.range([unstable_color, middle_color, stable_color]).domain([min, 0, max]);

      leftLegendText.style("fill", white).text(`Unstable: ${min}`);
      rightLegendText.style("fill", black).text(`Stable: ${max}`);
      midLegendText.style("fill", black)
        .text("WT: 0");

      leftGradient.attr("stop-color", unstable_color);
      midGradient.attr("stop-color", middle_color);
      rightGradient.attr("stop-color", stable_color);
    } else {
      c.range([low_color, mid_color, high_color]).domain([min, max]);

      leftLegendText.style("fill", black)
        .text(min);
      rightLegendText.style("fill", white)
        .text(max);
      midLegendText.style("fill", black)
        .text(`WT: ${wtData[selected_option]}`);

      leftGradient.attr("stop-color", low_color);
      midGradient.attr("stop-color", mid_color);
      rightGradient.attr("stop-color", high_color);
    }
    svg.selectAll(".row")
      .data(heatmapData)
      .each(rowFuncUpdate);
  }

  function rowFuncUpdate(rowObject) {
    let cell = d3.select(this).selectAll(".cell")
      .data(rowObject)
      .transition().duration(1000)
      .style("fill", (d) => d !== null ? c(d[selected_option]) : black);
  }

  function rowFunc(rowObject, idx) {
    let cell = d3.select(this).selectAll(".cell")
      .data(rowObject)
      .enter().append("rect")
      .attr("class", "cell")
      .attr("id", (d, i) => `cell-${i}`)
      .attr("x", (d, i) => x(i))
      .attr("width", x.rangeBand())
      .attr("height", y.rangeBand())
      .style("fill", (d) => d !== null ? c(d[selected_option]) : black)
      .on("mouseover", (d, i) => {
        let index = rowObject.indexOf(null);
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        if (d) {

          tooltip.html(`Amino Acid ${idx + 1}<br/>From ${acid_labels[index]} to ${acid_labels[i]}<br\>${selected_option == 'rigidityDistance' ? "<br\>" : ""}Rigidity Distance: ${d.rigidityDistance}<br/><br/>${selected_option == 'rigidityDistance' ? "" : selectedOptionTitle + ": " + d[selected_option]}`)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        } else {
          tooltip.html("<br/><br/>WT amino acid")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        }
      })
      .on("mouseout", (d) =>  {
          tooltip.transition()
              .duration(500)
              .style("opacity", 0);
      })
      .on("click", (d, i) => {
        let index = rowObject.indexOf(null);
        addBarchartData(d.clusterSizeDistribution, `Amino Acid ${idx + 1}: Mutation ${acid_labels[index]} -> ${acid_labels[i]}`);
      });
  }

  yLen = heatmapData.length;
  xLen = heatmapData[0].length;

  let xScale = d3.scale.linear()
    .domain([0, xLen])
    .range([0, width]);

  let yScale = d3.scale.linear()
    .domain([0, yLen])
    .range([height, 0]);

  let min = d3.min(heatmapData, (d) => d3.min(d, (k) => k ? k.rigidityDistance : Infinity));
  let max = d3.max(heatmapData, (d) => d3.max(d, (k) => k ? k.rigidityDistance : -Infinity));

  c.domain([min, 0, max]);
  x.domain(d3.range(xLen));
  y.domain(d3.range(yLen));

  const rect = svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#eee");

  let row = svg.selectAll(".row")
    .data(heatmapData)
    .enter().append("g")
    .attr("class", "row")
    .attr("id", (d, i) => `row-${i}`)
    .attr("transform", (d, i) => `translate(0, ${y(i)})`)
    .each(rowFunc);

  //row labels
  row.append("line")
  .attr("x2", width)
  .attr("stroke", "#fff");

  rowText = row.append("text")
    .attr("x", -6)
    .attr("y", y.rangeBand() / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .style("cursor", "pointer")
    .text((d, i) => rowLabels[i]);

  rowText.on("click", (d, i) => {
    heatmapData.splice(i, 1);
    rowLabels.splice(i, 1);
    updateHeatmap();
    rowText.text((d, i) => rowLabels[i]);
    d3.select(`#row-${heatmapData.length}`)
      .remove();
    height = height - 40;
    rect.attr("height", `${height}`);
    removedRowCount++;
    legend.transition().duration(1000).attr("transform", `translate(0, ${-40 * removedRowCount})`);
  });

  //column labels
  let column = svg.selectAll(".column")
    .data(heatmapData[0])
    .enter().append("g")
    .attr("class", "column")
    .attr("transform", (d, i) => `translate(${x(i)})rotate(-90)`);

  column.append("line")
    .attr("x1", -height)
    .attr("stroke", "#fff");

  columnText = column.append("text")
    .attr("x", 6)
    .attr("y", x.rangeBand() / 2)
    .attr("dy", ".32em")
    // .attr("dx", "1em")
    .attr("text-anchor", "start")
    .style("cursor", "pointer")
    .text((d, i) =>  acid_labels[i]);

  columnText.on("click", (d, i) => {
    heatmapData.forEach((d) => {
      d.splice(i, 1);
    });
    acid_labels.splice(i, 1);
    updateHeatmap();
    columnText.text((d, i) => acid_labels[i]);
    d3.selectAll(`#cell-${heatmapData[0].length}`)
      .remove();
    width = width - 40;
    rect.attr("width", `${width}`);
    removedColumnCount++;
  });

}
