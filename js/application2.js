/*jshint esversion: 6 */
const width = 800;
const height = 1520;
const margin = {
  top: 120,
  right: 0,
  bottom: 10,
  left: 80
};

const acidLabels = [
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

const divergingColors = ["#d7191c", "#ffffbf", "#2c7bb6"];
const sequentialColors = ["#e5f5f9", "#99d8c9", "#2ca25f"];
const black = "#000";
const white = "#fff";

const x = d3.scale.ordinal().rangeBands([0, width]);
const y = d3.scale.ordinal().rangeBands([0, height]);

const z = d3.scale.linear().range([0, 1]).clamp(true);
const c = d3.scale.linear().range(divergingColors);

let mutations = ["Wild Type"];
let clusterDistribution = [];

//options nemu
let selectedOption = "rigidityDistance";
const optionsData = {
  "Rigidity Distance": "rigidityDistance",
  "Average Cluster Size": "avgClusterSize",
  "Largest Cluster": "largestCluster"
};
const select = d3.select('#options-menu')
  .append('select')
  	.attr('class','select')
    .on('change', onOptionChange);

const options = select
  .selectAll('option')
	.data(Object.keys(optionsData)).enter()
	.append('option')
		.text((d) => d);

function onOptionChange() {
	selectedOption = optionsData[d3.select('select').property('value')];
	updateHeatmap();
}

// //protein select
// selectedProtein = "1KJ5";
// optionsProtein = [
//   "1KJ5",
//   "1AAJ",
//   "1IYC",
//   "2DX3",
//   "2N2F",
//   "5JOJ"
// ];
// const proteinSelect = d3.select('#protein-menu')
//   .append('select')
//   	.attr('class','select')
//     .on('change', onProteinChange);
//
// const proteinOptions = proteinSelect
//   .selectAll('option')
// 	.data(optionsProtein).enter()
// 	.append('option')
// 		.text((d) => d);
//
// function onProteinChange() {
// 	selectedProtein = d3.select('select').property('value');
//   loadProteinData();
// 	updateHeatmap();
// }

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
  .attr("stop-color", divergingColors[0])
  .attr("stop-opacity", 1);

const midGradient = gradient.append("svg:stop")
  .attr("offset", "50%")
  .attr("stop-color", divergingColors[1])
  .attr("stop-opacity", 1);

const rightGradient = gradient.append("svg:stop")
  .attr("offset", "100%")
  .attr("stop-color", divergingColors[2])
  .attr("stop-opacity", 1);

legend.append("svg:rect")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .style("fill", "url(#heatmap-gradient)")
  .attr("transform", `translate(${margin.left}, 0)`);

const rightLegendText = legend.append("text")
  .attr("class", "legendText")
  .attr("text-anchor", "end")
  .attr("y", legendHeight - 5)
  .attr("x", legendWidth - margin.right - 10)
  .style("fill", black)
  .text("Stable");

const leftLegendText = legend.append("text")
  .attr("class", "legendText")
  .attr("y", legendHeight - 5)
  .attr("x", margin.left + 10)
  .style("fill", white)
  .text("Unstable");

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


let proteinData = [];

function loadProteinData() {
  return null;
}

d3.json("data/1KJ5.json", (data) => {
  clusterDistribution.push(data.clusterSizeDistribution);
  data.mutations.forEach((d) => {
    proteinData.push(d.mutants.map((m) => {
      if (m.mutantAcid === d.aminoAcidLetterCode) {
        return null;
      }
      return {
        rigidityDistance: m.rigidityDistance,
        avgClusterSize: m.basicStats.avgClusterSize,
        largestCluster: m.basicStats.largestCluster
      };
    }));
  });

  console.log(proteinData);

  yLen = proteinData.length;
  xLen = proteinData[0].length;

  let xScale = d3.scale.linear()
    .domain([0, xLen])
    .range([0, width]);

  let yScale = d3.scale.linear()
    .domain([0, yLen])
    .range([height, 0]);

  let min = d3.min(proteinData, (d) => d3.min(d, (k) => k ? k.rigidityDistance : Infinity));
  let max = d3.max(proteinData, (d) => d3.max(d, (k) => k ? k.rigidityDistance : -Infinity));
  console.log(min);
  console.log(max);
  c.domain([min, 0, max]);
  x.domain(d3.range(xLen));
  y.domain(d3.range(yLen));

  svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#eee");

  let row = svg.selectAll(".row")
    .data(proteinData)
    .enter().append("g")
    .attr("class", "row")
    .attr("transform", (d, i) => `translate(0, ${y(i)})`)
    .each(rowFunc);

  //row labels
  row.append("line")
  .attr("x2", width)
  .attr("stroke", "#fff");

  row.append("text")
    .attr("x", -6)
    .attr("y", y.rangeBand() / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .text((d, i) => i + 1);

  //column labels
  let column = svg.selectAll(".column")
    .data(proteinData[0])
    .enter().append("g")
    .attr("class", "column")
    .attr("transform", (d, i) => `translate(${x(i)})rotate(-90)`);

  column.append("line")
    .attr("x1", -height)
    .attr("stroke", "#fff");

  column.append("text")
    .attr("x", 6)
    .attr("y", x.rangeBand() / 2)
    .attr("dy", ".32em")
    // .attr("dx", "1em")
    .attr("text-anchor", "start")
    .text((d, i) =>  acidLabels[i]);

});

function updateHeatmap() {
  let min = d3.min(proteinData, (d) => d3.min(d, (k) => k ? k[selectedOption] : Infinity));
  let max = d3.max(proteinData, (d) => d3.max(d, (k) => k ? k[selectedOption] : -Infinity));
  if (selectedOption === "rigidityDistance") {
    c.range(divergingColors).domain([min, 0, max]);

    leftLegendText.style("fill", white)
      .text("Unstable");
    rightLegendText.style("fill", black)
      .text("Stable");

    leftGradient.attr("stop-color", divergingColors[0]);
    midGradient.attr("stop-color", divergingColors[1]);
    rightGradient.attr("stop-color", divergingColors[2]);
  } else {
    c.range(sequentialColors).domain([min, max]);

    leftLegendText.style("fill", black)
      .text(min);
    rightLegendText.style("fill", white)
      .text(max);

    leftGradient.attr("stop-color", sequentialColors[0]);
    midGradient.attr("stop-color",sequentialColors[1]);
    rightGradient.attr("stop-color", sequentialColors[2]);
  }
  svg.selectAll(".row")
    .data(proteinData)
    .each(rowFuncUpdate);

  leftLegendText.text(min);
}

function rowFuncUpdate(rowObject) {
  let cell = d3.select(this).selectAll(".cell")
    .data(rowObject)
    .transition().duration(1000)
    .style("fill", (d) => d !== null ? c(d[selectedOption]) : black);
}

function rowFunc(rowObject, idx) {
  let cell = d3.select(this).selectAll(".cell")
    .data(rowObject)
    .enter().append("rect")
    .attr("class", "cell")
    .attr("x", (d, i) => x(i))
    .attr("width", x.rangeBand())
    .attr("height", y.rangeBand())
    .style("fill", (d) => d !== null ? c(d[selectedOption]) : black)
    .on("mouseover", (d, i) => {
      let index = rowObject.indexOf(null);
      tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
      if (d) {
        tooltip.html(`Amino Acid ${idx + 1}<br/>From ${acidLabels[index]} to ${acidLabels[i]}<br\>
          Rigidity Distance: ${d.rigidityDistance}<br/>Average Cluster Size: ${d.avgClusterSize}<br/>Largest Cluster: ${d.largestCluster}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      } else {
        tooltip.html("<br/><br/>WT amino acid")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      }
    })
    .on("mouseout", function(d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });
}





/**************************/
/*      Bar Chart         */
/**************************/
const qualitativeColors = [
  "#000", "#1f78b4", "#33a02c", "#e31a1c", "#ff7f00", "#6a3d9a", "#b15928",
  "#a6cee3", "#b2df8a", "#fb9a99", "#fdbf6f", "#cab2d6", "#ffff99"
];
//set the dimensions of the canvas

const marginBar = {top: 20, right: 20, bottom: 30, left: 40};
const widthBar = 960 - margin.left - margin.right;
const heightBar = 500 - margin.top - margin.bottom;

const x0Bar = d3.scale.ordinal().rangeRoundBands([0, widthBar], 0.1);
const x1Bar = d3.scale.ordinal();
const yBar = d3.scale.linear().range([heightBar, 0]);

const xAxisBar = d3.svg.axis()
  .scale(x0Bar)
  .tickSize(0)
  .orient("bottom");

const yAxisBar = d3.svg.axis()
  .scale(yBar)
  .orient("left");

const colorsBar = d3.scale.ordinal()
    .range(qualitativeColors);

const svgBar = d3.select('#bar-chart').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

x0Bar.domain(clusterDistribution);
x1Bar.domain(mutations).rangeRoundBands([0, x0Bar.rangeBand()]);
yBar.domain([0, d3.max(clusterDistribution, (d) => d3.max(d, (k) => k.count))]);

svgBar.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${heightBar})`)
    .call(xAxisBar)
  .append("text")
    .attr("x", widthBar)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style('font-weight','bold')
    .text("Cluster Size");


svgBar.append("g")
    .attr("class", "y axis")
    .call(yAxisBar)
.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style('font-weight','bold')
    .text("Cluster Counts");

const slice = svgBar.selectAll(".slice")
    .data(clusterDistribution)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", (d, i) => `translate(${x0Bar(i)}, 0)`);

slice.selectAll("rect")
    .data((d) => d.count)
.enter().append("rect")
    .attr("width", x1Bar.rangeBand())
    .attr("x", (d) => x1Bar(d.size))
    .style("fill", (d, i) => qualitativeColors[i])
    .attr("y", (d) => yBar(0))
    .attr("height", (d) => heightBar - yBar(0));

//Legend
const legendBar = svgBar.selectAll(".legend")
    .data(mutations)
.enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

legendBar.append("rect")
    .attr("x", widthBar - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", (d, i) => qualitativeColors[i]);

legendBar.append("text")
    .attr("x", widthBar - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text((d) => d);

console.log(clusterDistribution);
