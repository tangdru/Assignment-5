console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var plot = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html

var projection = d3.geo.mercator()
    .translate([width/2,height/2])
    .center(bostonLngLat)
    .scale(150000);


var pathGenerator = d3.geo.path().projection(projection);

//TODO: create a color scale
var colorScale = d3.scale.linear().domain([0,150000]).range(['#1F1C2C','#928DAB']);


//TODO: create a d3.map() to store the value of median HH income per block group
var rateOfIncome = d3.map();



//TODO: import data, parse, and draw

queue()
    .defer(d3.json, "data/bos_census_blk_group.geojson")
    .defer(d3.json, "data/bos_neighborhoods.geojson")
    .defer(d3.csv, "data/acs2013_median_hh_income.csv", parseData)
    .await(function(err, blocks, neighborhoods){


        draw(blocks, neighborhoods);
    })

function parseData(d){
    rateOfIncome.set(d.geoid, {
        'name': d.name,
        'income': +d.B19013001
    });
    console.log(d);

}
/*<g class="block-groups">
    <path class="block-group" ...>
    </g>
    <g class="neighborhoods">
    <g class="neighborhood">
    <path class="boundary" ...>
    <text class="label" ...>
    </g>
    </g>*/

function draw(blocks, neighborhoods) {
    plot.selectAll('.block-groups')
        .data(blocks.features)
        .enter()
        .append('g')
        .append('path')
        .attr('class', 'block-group')
        .attr('d', pathGenerator)
        .style('fill', function (d) {

            var income = rateOfIncome.get(d.properties.geoid).income;
            return colorScale(income);
        })

        .call(attachTooltip)

    var plot2 = plot.append('g')
        .attr('class','hood')
        .selectAll('.label')
        .data(neighborhoods.features)
        .enter()
        .append('g')
        .attr('class','label')

    plot2.append('path')
        .attr('class','boundries')
        .attr('d',pathGenerator)
        .attr('fill','none')
        .style('stroke-width','.5px')
        .style('stroke','white')


    plot2.append('text')
        .text(function(d){
            var hoodName = (d.properties.Name);
            return hoodName
        })
        .attr('x', function(d){
            return pathGenerator.centroid(d)[0];
        })
        .attr('y', function(d){
            return pathGenerator.centroid(d)[1];
        })

}
function attachTooltip(selection){
    selection
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');

            tooltip
                .transition()
                .style('opacity',1);

            var income = rateOfIncome.get(d.properties.geoid).income;
            var name = rateOfIncome.get(d.properties.geoid).name;


            tooltip.select('#HHincome').html(income);
            tooltip.select('#Name').html(name);
        })

        .on('mousemove',function(){
            var xy = d3.mouse(canvas.node());

            var tooltip = d3.select('.custom-tooltip');

            tooltip
                .style('left',xy[0]+10+'px')
                .style('top',(xy[1]+10)+'px');
        })
        .on('mouseleave',function(){
            d3.select('.custom-tooltip')
                .transition()
                .style('opacity',0);
        })
}

