console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
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

var path = d3.geo.path().projection(projection);

//TODO: create a color scale
var colorScale = d3.scale.linear().domain([0,150000]).range(['white','black']);


//TODO: create a d3.map() to store the value of median HH income per block group
var rateOfIncome = d3.map();



//TODO: import data, parse, and draw

queue()
    .defer(d3.json, "data/bos_census_blk_group.geojson")
    .defer(d3.json, "data/bos_neighborhoods.geojson")
    .defer(d3.csv, "data/acs2013_median_hh_income.csv", parseData)
    .await(function(err, blocks, neighborhoods){
        console.log(blocks);
        console.log(neighborhoods);


        draw(blocks, neighborhoods);
    })

function parseData(d){
    rateOfIncome.set(d.geoid, {
        neighborhoodName: d.name,
        income: +d.B19013001
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

function draw(blocks, neighborhoods){
    map.append('g')
        .attr('class','block-groups')
        .selectAll('.block-group')
        .data(blocks.features)
        .enter()
        .append('path')
        .attr('class','block-group')
        .attr('d',path)
        .style('fill', function(d){

            var income = rateOfIncome.get(d.properties.geoid).income;
            return colorScale(income);
        })

    map2 = map.append('g')
        .attr('class','neighborhoods')
        .selectAll('neighborhood')
        .data(neighborhoods.features)
        .enter()
        .append('path')
        .attr('class','neighborhood');

    map2.append('path')
        .attr('class','boundry')
        .attr('d', path)
        .style('stroke','white')
        .style('stroke-width','2px')
        .style('fill','none');








}
