function mapy(){
var width = 450,
    height = 500;

var tooltip = d3.select("#tooltip")
    .style("opacity", 0);

var caption = d3.select("#caption")
    .style("opacity", 1.0);

    caption.style("left", "550px")     
    caption.style("top", "100px");  
    caption.select(".info").html("Average Rents for 2014<br/>"); 
    caption.select(".content").html("Rollover the map to reveal more detail on rents. The charts below revela further information on a selection of towns.");
    //caption.select(".cash").html("<br><br><br><br>Legend:<br>");  

var projection = d3.geo.albers()
    .center([-0.4, 54.4])
    .rotate([4.4, 0])
    .parallels([60, 60])
    .scale(1210 * 5)
    .translate([width*1.1, height / 3]);


var path = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("data/map/uk.json", function(error, uk) {
  svg.selectAll(".subunit")
      .data(topojson.feature(uk, uk.objects.subunits).features)
    .enter().append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a !== b && a.id !== "IRL"; }))
      .attr("d", path)
      .attr("class", "subunit-boundary");

  svg.append("path")
      .datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a === b && a.id === "IRL"; }))
      .attr("d", path)
      .attr("class", "subunit-boundary IRL");

   
      

	d3.csv("data/rentAllYrsFoc.csv", function(error, places) {
		var max = d3.max(places, function(d) { return +d.rent} );
		var rScale = d3.scale.linear()
			  .domain([0, max])
			  .range([1,25]);


	   var pin = svg.selectAll("circle")
		    .data(places)
		    .enter()

		    pin.append("circle")
		    .attr("class", function(d){
		    	if (+d.change < 0){
		    		return "pinNeg";

		    	}else{
		    		return "pinPos";}
		    })
		    .attr("r", function(d){
		  	//console.log(rScale(d.rent))
		  	return rScale(d.rent)
		  })
		    .style("stroke-width", function(d){
		    	if (d.focus=="TRUE"){
		    		return "#F00";}
		    })
		    .style("stroke-width", function(d){
		    	if (d.focus=="TRUE"){
		    		return .9;}
		    })
		  .attr("transform", function(d) {
		    return "translate(" + projection([
		      d.lon,
		      d.lat
		    ]) + ")"})
		  .on("mouseover", mouseover)
      	  .on("mouseout", mouseout);
	  

	var legend = svg.append("g")
	    .attr("class", "legend")
	    .attr("transform", "translate(" + (width - 416) + "," + (height - 40) + ")")
	  .selectAll("g")
	    .data([500, 1000, 1500])
	  .enter().append("g");

	legend.append("circle")
	    .attr("cy", function(d) { return -rScale(d); })
	    .attr("r", rScale);

	legend.append("text")
    .attr("y", function(d) { return -2 * rScale(d); })
    .attr("dy", "1.3em")
    .text(d3.format(".1s"));

    /*var instruct = svg.append("g")
	    .attr("class", "instruct")
	    .attr("transform", "translate(" + (width - 405) + "," + (height - 300) + ")")
	    .append("text")
	    .text("Rollover map to");

	    svg.append("g")
	    .attr("class", "instruct")
	    .attr("transform", "translate(" + (width - 410) + "," + (height - 285) + ")")
	    .append("text")
	    .text("for more 2014");

	    svg.append("g")
	    .attr("class", "instruct")
	    .attr("transform", "translate(" + (width - 429) + "," + (height - 270) + ")")
	    .append("text")
	    .text("details.");*/



	    });

//console.log(pin)
	});

function mouseover(d){
  tooltip.transition()        
        .duration(200)      
        .style("opacity", .9); 
        
       /* // Position tooltip
               if (d3.event.pageX > (width - 200)) {
                   tooltip.style("left", (d3.event.pageX) + "px");
               } else {
                   tooltip.style("left", (d3.event.pageX + 30) + "px")
                       .style("top", (d3.event.pageY -30) + "px");
               }
               
               if (d3.event.pageY > (height - 150)) {
                    tooltip.style("top", (d3.event.pageY) + "px");
               } else {
                    tooltip.style("top", (d3.event.pageY - 40) + "px");
               }
               */
        tooltip.style("left", (d3.event.pageX + 15) + "px")     
        tooltip.style("top", (d3.event.pageY - 30) + "px");  

        tooltip.select(".info").html(d.place+ "<br/>"); 
        tooltip.select(".content").html("Average rent: <br><b>€"+d.rent+"</b>");
        tooltip.select(".cash").html("<br>change since 2013:<br>"+d.change+"%");    
 }

function mouseout(){
  tooltip.transition()
      .duration(500)
      .style("opacity", 1e-6);
 }
  
;}