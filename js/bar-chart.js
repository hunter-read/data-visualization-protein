


// set the dimensions of the canvas
var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 850 - margin.left - margin.right,
    height = 1100 - margin.top - margin.bottom;




// Add svg element
var svg = d3.select("#bar-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
         "translate(" + margin.left + "," + margin.top + ")");


d3.json("data/1AAJ.json", function(data) {

    //data.

    var wildTypeSize = [];
    var wildTypeCount = [];

    var mutation1Size = [];
    var mutation1Count = [];

    var mutation2Size = [];
    var mutation2Count = [];

    // needs to be dynamically updated when new mutations are added
    var maxSize = 0;

    // gets wildtype sizes and counts
    data.clusterSizeDistribution.forEach(function(d) {
        wildTypeSize.push(d.size);
        wildTypeCount.push(d.count);



    });
    maxSize = wildTypeSize[wildTypeSize.length-1]
    //console.log(data.clusterSizeDistribution[0].size)
    //console.log(data.mutations[0].mutants[0].clusterSizeDistribution[0].size);
    //console.log(data.mutations[0].mutants[0]);


    //

    // gets a mutations sizes and counts
    data.mutations[0].mutants[0].clusterSizeDistribution.forEach(function(d1) {
        mutation1Size.push(d1.size);
        mutation1Count.push(d1.count);
    });

    // gets another mutations sizes and counts
    data.mutations[0].mutants[1].clusterSizeDistribution.forEach(function(d2) {
        mutation2Size.push(d2.size);
        mutation2Count.push(d2.count);
    });


    // set the ranges
    var x = d3.scale.ordinal().rangeBands([0, width]);
    var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    x.domain(wildTypeCount);
    x0.domain(wildTypeCount).rangeRoundBands([0, x0.rangeBand()]);

    var yAxisScale = d3.scale.linear()
        .domain([0, maxSize + 50])
        .range([height, 0])
        .nice();

    // define the axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");


    var yAxis = d3.svg.axis()
        .scale(yAxisScale)
        .orient("left")
        .ticks(10);




    // add axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Cluster Size");


    // Add bar chart
    svg.selectAll("rect")
        .data(wildTypeSize)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("height",function(d, i) {return height - yAxisScale(d)})
          .attr("width","30")
          .attr("x", function(d, i) {return (i * 115) + 10})
          .attr("y", function(d, i) {return yAxisScale(d)});


    svg.selectAll("rect")
        .data(mutation1Size)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("height",function(d, i) {return height - yAxisScale(d)})
        .attr("width","30")
        .attr("x", function(d, i) {return (i * 115) + 40})
        .attr("y", function(d, i) {return yAxisScale(d)});








});
