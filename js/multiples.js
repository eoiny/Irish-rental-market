var margin = {top: 15, right: 18, bottom: 20, left: 18},
    width = 110 - margin.left - margin.right,
    height = 160 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse;
    bisectDate = d3.bisector(function(d) { return d.year; }).left,
    formatDate = d3.time.format("%m/%d/%Y %I:%M:%S %p");

var x = d3.time.scale()
    .range([0, width]);

var z = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var format = d3.format("$0");

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(0)
    .outerTickSize(0);
    //.tickFormat(d3.time.format("'%y"))
    //.orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickValues(d3.range(500,1000))
    .tickSize(-width)
    .tickFormat("");

var area = d3.svg.area()
    .x(function(d) { return x(d.year); })
    .y0(height)
    .y1(function(d) { return y(d.value); });


var line = d3.svg.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });


function compare(a,b) {
  if (a.key < b.key)
     return -1;
  if (a.key > b.key)
    return 1;
  return 0;
}
 
d3.csv("data/data.csv", function(error, data) {
    data.forEach(function(d) { 
      d.value = +d.value;
      d.year = d.year;
    })
//console.log(data)
    x.domain(d3.extent(data, function(d) { return d.year; }))
    y.domain([0, d3.max(data, function(d) { return d.value; })])

    var mousemove, mouseout, mouseover, circle, curYear, caption;

    var nested = d3.nest()
      .key(function(d) { return d.location; })
      .entries(data);

    nested = nested.sort(compare);

    var plots = d3.select("#chart").selectAll("div")
      .data(nested)
    .enter().append("div")
      .attr("class", "containers")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //** added this
    plots.append("rect")
         .attr("class", "background")
         .style("pointer-events", "all")
         .attr("width", width + 5)
         .attr("height", height + margin.top + margin.bottom)
         .on("mouseover", mouseover)
         .on("mousemove", mousemove)
         .on("mouseout", mouseout);


    plots.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    plots.append("path")
      .datum(function(d) {
        return d.values; 
      })
      .attr("class", "line")
      .style("pointer-events", "none")
      .attr("d", line);

    plots.append("path")
      .datum(function(d) {
        return d.values; 
      })
      .attr("class", "area")
      .style("pointer-events", "none")
      .attr("d", area);

    plots.append("text")
      .attr("transform", "translate(" + (width/2) + ",-5)")
      .attr("text-anchor","middle")
      .attr("class", "country-labels")
      .text(function(d) { return d.key; });

    

    plots.append("text")
        .attr("class", "static_year")
        .attr("text-anchor", "start")
        .style("pointer-events", "none")
        .attr("dy", 13).attr("y", height)
        .attr("x", 0)
        .text(function(c) {
          return c.values[0].year;
        });

    plots.append("text")
        .attr("class", "static_year")
        .attr("text-anchor", "end")
        .style("pointer-events", "none")
        .attr("dy", 13).attr("y", height)
        .attr("x", width)
        .text(function(c) {
          return c.values[c.values.length - 1].year;
        });

    /*plots.append("g")
        .attr("class", "y-axis")
        //.attr("transform", "translate(0," + height + ")")
        .call(yAxis);*/




    circle = plots.append("circle")
                  .attr("r", 2.5)
                  .attr("opacity", 0)
                  .style("fill", "darkmagenta")
                  .style("pointer-events", "none");   

    caption = plots.append("text")
                   .attr("class", "caption")
                   .attr("text-anchor", "middle")
                   .style("pointer-events", "none")
                   .attr("dy", -8);

    curYear = plots.append("text")
                    .attr("class", "year")
                    .attr("text-anchor", "middle")
                    .style("pointer-events", "none")
                    .attr("dy", 13).attr("y", height);



    //**brushing multiple charts*****
    
    function mouseover() { 
      //focus.style("display", null);
      circle.attr("opacity", 1.0);  
      d3.selectAll(".static_year").classed("hidden", true);
    };

    function mousemove() {
      var index=0,
      size=0;
      var x0 = Math.round(x.invert(d3.mouse(this)[0]));
        
        //console.log(x0);


      //var x0 = Math.round(x.invert(d3.mouse(this)[0]));
     // var index = 0;

      circle.attr("opacity", function(c) {
                size=c.values.length;
                index = bisectDate(c.values, x0, 1),
                  c0 = c.values[index-1],
                  c1 = c.values[index],
                  c = x0 - c0.year > c1.year - x0 ? c1 : c0;
                            if(x0==c.year){
                            return 1.0;
                          }else{
                            return 0;
                          };
                           

      })
            .attr("cx", x(x0))
            .attr("cy", function(c) {
                 index = bisectDate(c.values, x0, 1),
                  c0 = c.values[index-1],
                  c1 = c.values[index],
                  c = x0 - c0.year > c1.year - x0 ? c1 : c0;
                          //index = bisectDate(c.values, x0, 0, c.values.length);
                          //console.log(x0+"-"+c.values[index].value);
                          //  return y(c.values[index].value);
                            return y(c.value);
                      });
       caption.attr("x", x(x0))
              .attr("y", function(c) {
                index = bisectDate(c.values, x0, 1),
                  c0 = c.values[index-1],
                  c1 = c.values[index],
                  c = x0 - c0.year > c1.year - x0 ? c1 : c0;
                            return y(c.value);
                          })
              .text(function(c) {
                size=c.values.length;
                index = bisectDate(c.values, x0, 1),
                  c0 = c.values[index-1],
                  c1 = c.values[index],
                  c = x0 - c0.year > c1.year - x0 ? c1 : c0;
                            if(x0==c.year){
                            return "€"+c.value;
                           
                          }else{
                            return "no data";
                          };
                           

      });
        curYear.attr("x", x(x0)).text(x0);
    };

    function mouseout() {
      //focus.style("display", "none");
      circle.attr("opacity",0);
      d3.selectAll(".static_year").classed("hidden", false);

      caption.text("");
      return curYear.text("");

  


      
       };
    
})