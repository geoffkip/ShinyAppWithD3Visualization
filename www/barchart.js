
var margin = {top: 30, right: 30, bottom: 30, left: 250},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var barHeight = 20;

var color = d3.scale.ordinal()
    .range(["steelblue", "#ccc"]);

var duration = 750,
    delay = 25;

var partition = d3.layout.partition()
    .value(function(d) { return d.size; });

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");
    
//var tip = d3.tip()
//  .attr('class', 'd3-tip')
//  .offset([-10, 0])
//  .html(function(d) {
//    return "<strong>Frequency:</strong> <span style='color:red'> hello</span>";
//});



var svg = d3.select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height",height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", 300)
    .on("click", up);

svg.append("g")
    .attr("class", "x axis");

svg.append("g")
    .attr("class", "y axis")
    .append("line")
    .attr("y1", "100%");



var div = d3.select(".chart").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);    


//d3.json("readme.json", function(error, root) {
//  if (error) throw error;
Shiny.addCustomMessageHandler("jsondata",
function(message){
var data=message;

root = JSON.parse(data);


  partition.nodes(root);
  x.domain([0, root.value]).nice();
  down(root, 0);
});


    
    
function down(d, i) {
  if (!d.children || this.__transition__) return;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
      .attr("class", "exit");

  // Entering nodes immediately obscure the clicked-on bar, so hide it.
  exit.selectAll("rect").filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Enter the new bars for the clicked-on data.
  // Per above, entering bars are immediately visible.
  var enter = bar(d)
      .attr("transform", stack(i))
      .style("opacity", 1);

  // Have the text fade-in, even though the bars are visible.
  // Color the bars as parents; they will fade to children if appropriate.
  enter.select("text").style("fill-opacity", 1e-6);
  enter.select("rect").style("fill", color(true));
 
  // Update the x-scale domain.
  x.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice();

  // Update the x-axis.
  svg.selectAll(".x.axis").transition()
      .duration(duration)
      .call(xAxis);

  // Transition entering bars to their new position.
  var enterTransition = enter.transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; });

  // Transition entering text.
  enterTransition.select("text")
      .style("fill-opacity", 1);

  // Transition entering rects to the new x-scale.
  enterTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .style("fill", function(d) { return color(!!d.children); });

  // Transition exiting bars to fade out.
  var exitTransition = exit.transition()
      .duration(duration)
      .style("opacity", 1e-6)
      .remove();

  // Transition exiting bars to the new x-scale.
  exitTransition.selectAll("rect")
      .attr("width", function(d) { return x(d.value); });

  // Rebind the current node to the background.
  svg.select(".background")
      .datum(d)
      .transition()
      .duration(end);
      
  //send where we are at back to server
  var level = d.name;
      Shiny.onInputChange("chartdata", level);
  
 /// svg.select(".background")
 //     .attr("height", function(d,i) { return i*50 };);

  d.index = i;
}

function up(d) {
  if (!d.parent || this.__transition__) return;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
      .attr("class", "exit");

  // Enter the new bars for the clicked-on data's parent.
  var enter = bar(d.parent)
      .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; })
      .style("opacity", 1e-6);

  // Color the bars as appropriate.
  // Exiting nodes will obscure the parent bar, so hide it.
  enter.select("rect")
      .style("fill", function(d) { return color(!!d.children); })
    .filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Update the x-scale domain.
  x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

  // Update the x-axis.
  svg.selectAll(".x.axis").transition()
      .duration(duration)
      .call(xAxis);

  // Transition entering bars to fade in over the full duration.
  var enterTransition = enter.transition()
      .duration(end)
      .style("opacity", 1);

  // Transition entering rects to the new x-scale.
  // When the entering parent rect is done, make it visible!
  enterTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

  // Transition exiting bars to the parent's position.
  var exitTransition = exit.selectAll("g").transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", stack(d.index));

  // Transition exiting text to fade out.
  exitTransition.select("text")
      .style("fill-opacity", 1e-6);

  // Transition exiting rects to the new scale and fade to parent color.
  exitTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .style("fill", color(true));

  // Remove exiting nodes when the last child has finished transitioning.
  exit.transition()
      .duration(end)
      .remove();

  // Rebind the current parent to the background.
  svg.select(".background")
      //.attr("height", 500)
      .datum(d.parent)
      .transition()
      .duration(end);
      
  //send where we are at back to server
  var level = d.name;
      Shiny.onInputChange("chartdata", level);
}



// Creates a set of bars for the given data node, at the specified index.
function bar(d) {
  var bar = svg.insert("g", ".y.axis")
      .attr("class", "enter")
      .attr("transform", "translate(0,5)")
    .selectAll("g")
      .data(d.children)
    .enter().append("g")
      .style("cursor", function(d) { return !d.children ? null : "pointer"; })
      .on("click", down)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);
      
      
  bar.append("text")
      .attr("x", -6)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.name; });

  bar.append("rect")
      .attr("width", function(d) { return x(d.value); })
      .attr("height", barHeight);
      
 // bar.append(".background")
  //     .attr("height", function(d,i) { return( i*50 ); });
      
      
      
  //svg.append("rect")
  //  .attr("class", "background")
  //  .attr("height", 500);
     
      
  return bar;
}

/*
function ChartHeight(){
  var height = d3.select("g.enter").attr("height")
  
  if (height==null){ return(250);}
  if (height<250){ return(250);}
  else{return(height);}
  
}*/

function tooltipwidth(str){
            if (str.length > 50) {
               return(125);
            } 
            else if (str.length>30){return(100);
            }
            else {return(75);
            }}

function senddata(d,i) {
      var level = d.name;
      Shiny.onInputChange("chartdata", level);
    }
    
function mouseover(d,i) {
     var str = (d.name + d.cost);
     var height = svg.selectAll(".background").attr("height");
            
            div.transition()        
                .duration(200)      
                .style("opacity", 1.0);      
            div .html("<strong>"+d.level + ": </strong>"  +d.name +"<br/>" + d.cost)
                .style("height", tooltipwidth(str) + "px") 
                .style("left", (d3.event.pageX +10) + "px")     
                .style("top", (d3.event.pageY - 10) + "px");    
            }
            
function mouseout(d) {       
            div.transition()        
              .duration(500)      
              .style("opacity", 0);   
        }
/*   
function mouseover(d) {
    d3.select(this).append("html")
        .attr("class", "hover")
        .attr('transform', function(d){ 
            return 'translate('+x(d.value)/2+',0)';
        })
        .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.name + "</span>";
  });
          
}


// Toggle children on click.
function mouseout(d) {
    d3.select(this).select("html.hover").remove();
}

*/

/*
var tip = d3.tip()
.attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.name + "</span>";
  });

svg.call(tip);

d3.selectAll('rect')
    .data(data)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
    

*/
// A stateful closure for stacking bars horizontally.
function stack(i) {
  var x0 = 0;
  return function(d) {
    var tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
    x0 += x(d.value);
    return tx;
  };
}