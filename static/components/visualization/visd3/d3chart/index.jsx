import React from 'react'

var vis_margin = {top: 70, right: 70, bottom:70, left: 70};

function get_key(array,desired_key) {
    var returned  = [];
    for (var i in array){
        returned.push(array[i][desired_key]);
    }
    return returned;
}

function get_index(array, threshold){
    for (var i=0; i<array.length; i++){
        if (array[i]<threshold){
            return i;
        }
    }
    return array.length-1;
}

export default class D3Chart extends React.Component{
    constructor(props){
        super(props);

        var x_scale = d3.scale.linear().clamp(true)
            .domain([0,100]);

        var y_scale = d3.scale.linear().clamp(true)
            .domain([0,100]);

        this.state = {  line_data:this.getLineData(),
                        x_start:0,
                        x_end:100,
                        y_start:0,
                        y_end:100,
                        x_domain: [0,100],
                        y_domain: [0,100],
                        x_scale: x_scale,
                        y_scale: y_scale};
    };

    _resize(){
        this.state.container.remove()
        this._draw()
    }

    _update_point(coordinates, clicked_line){
        var x_index = 0

        var x = coordinates[x_index];

        var array = get_key(this.state.line_data[clicked_line], x_index);
        var index = get_index(array, this.state.x_scale.invert(x));

        this.props.onIndexChange(index, clicked_line)
    }

    zoomed(zoom) {
        var reset = this._reset.bind(this)

        this.state.svg.select(".x.axis").call(this.state.x_axis);
        this.state.svg.select(".y.axis").call(this.state.y_axis);

        var rect = this.state.svg.select('#reset')

        if (rect.empty()){

            var dims = {height:50,width:100}

            var group = this.state.svg.append('g')
                .attr('id','reset')
                .on('click', function(){
                    d3.event.preventDefault()

                    d3.event.stopPropagation()
                    reset(zoom)
                });

            group.append('rect')
                .attr('x',4)
                .attr('y',4)
                .attr('height',dims.height)
                .attr('width',dims.width)

            group.append('text')
                .attr('class','text')
                .attr('y',4+dims.height/2)
                .attr('x',4+dims.width/2)
                .attr('text-anchor','middle')
                .attr('alignment-baseline',"middle")
                .text('Reset Zoom')
        }

        this.state.svg.selectAll('path.line').remove()
        this.state.svg.selectAll('circle').remove()

        this._draw_line(this.state.svg)
    }

    _reset(zoom){
        var x_scale = this.state.x_scale;
        var y_scale = this.state.y_scale;

        x_scale.domain(this.state.x_domain);

        y_scale.domain(this.state.y_domain);

        this.setState({x_scale:x_scale,y_scale:y_scale})

        zoom
            .x(x_scale)
            .y(y_scale)

        this.state.svg.select(".x.axis").call(this.state.x_axis);
        this.state.svg.select(".y.axis").call(this.state.y_axis);

        this.state.svg.selectAll('path.line').remove()
        this.state.svg.selectAll('circle').remove()
        this.state.svg.select('#reset').remove()

        this._draw_line(this.state.svg)
    }

    _draw(){
        var zoomed = this.zoomed.bind(this);

        var el = React.findDOMNode(this);
        var dimensions = el.getBoundingClientRect();


        var squared_dimension = Math.max(300,Math.min(dimensions.height,dimensions.width));

        var height = squared_dimension - vis_margin.left - vis_margin.right;
        var width = squared_dimension - vis_margin.top - vis_margin.bottom;


        var x_scale = this.state.x_scale;
        var y_scale = this.state.y_scale;

        x_scale.range([0, width])
            .domain(this.state.x_domain);

        y_scale.range([height, 0])
            .domain(this.state.y_domain);

        var zoom = d3.behavior.zoom()
            .x(x_scale)
            .y(y_scale)
            .on("zoom", function(e){
                zoomed(zoom)
            });


        var container = d3.select(el).append('svg')
            .attr('class', 'd3')
            .attr("width", width + vis_margin.left + vis_margin.right)
            .attr("height", height + vis_margin.top + vis_margin.bottom)
            .call(zoom);


        var svg = container.append('g')
            .attr("transform","translate(" + vis_margin.left + "," + vis_margin.top + ")")

        svg.append("text")
            .attr('class','chart_title')
            .attr("x", (width / 2))
            .attr("y", 0 - (vis_margin.top / 2))
            .text(this.props['title']);

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", height + 40)
            .text(this.props.label_x);

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", -40)
            .attr("x", -height/2)
            .attr("transform", "rotate(-90)")
            .text(this.props.label_y);

        var x_axis = d3.svg.axis().scale(x_scale)
            .orient("bottom").ticks(5)
           .tickSize(-height, 0)
           .outerTickSize(-height,0);

        svg.append('g')
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis);

        var y_axis = d3.svg.axis().scale(y_scale)
            .orient("left").ticks(5)
            .tickSize(-width,0)
            .outerTickSize(-width,0);

        svg.append("g")
            .attr("class", "y axis")
            .call(y_axis);

        this.setState({container:container,x_axis:x_axis,y_axis:y_axis})

        this._draw_line(svg)

        var resize = this._resize.bind(this)
        svg.on('resize',resize)
    }

    _draw_line(svg){
        var x_scale = this.state.x_scale;
        var y_scale = this.state.y_scale;
        var update_point = this._update_point.bind(this);
        // var drag_point = this._drag_point.bind(this);


        var valueline = d3.svg.line()
            .x(function(d) { return x_scale(d[0]); })
            .y(function(d) { return y_scale(d[1]); });

        var area = d3.svg.area()
            .x(function(d) { return x_scale(d[0]); })
            .y0(function(d) { return y_scale(d[1]); })
            .y1(function(d) { return y_scale(d[2]); })

        var points = []
        for (var line in this.props.indices){
            var line_data = this.state.line_data[line]

            if (this.props.draw_interval){
                svg.append("path")
                    .attr("class", "line interval line" + line)
                    .attr("d", area(this.props.data[line][this.props.interval_key]));
            }

            svg.append("path")
                .attr("class", "line main_line line" + line)
                .attr("d", valueline(line_data));

            svg.append("path")
                .attr("class", "line line_invisible")
                .attr("d", valueline(line_data))
                .on('click', function(){
                    // d3.event.stopPropagation();
                    var coordinates = d3.mouse(this);
                    update_point(coordinates, line);
                })

            var point = svg.append("circle")
                .attr('class', 'line' + line)
                .attr('r', 7)
                .attr('cx', x_scale(line_data[this.props.indices[line]][0]))
                .attr('cy', y_scale(line_data[this.props.indices[line]][1]))
                .call(d3.behavior.drag()
                    .on('dragstart', function(){
                        d3.event.sourceEvent.stopPropagation();
                    })
                    .on('drag', function(){
                        d3.event.sourceEvent.stopPropagation();

                        d3.event.sourceEvent.preventDefault();
                        var coordinates = d3.mouse(this);

                        update_point(coordinates, line);

                    })
                );;

            points.push(point)
        }

        this.setState({ svg:svg,
                        points:points,
                        x_scale:x_scale,
                        y_scale:y_scale });
    }

    _updatePoints(indices){
        var x_scale = this.state.x_scale;
        var y_scale = this.state.y_scale;
        for (var line in indices){
            var line_data = this.state.line_data[line]

            this.state.points[line]
                .attr('cx', x_scale(line_data[indices[line]][0]))
                .attr('cy', y_scale(line_data[indices[line]][1]))
        }
    }

    componentWillReceiveProps(nextProps) {
        this._updatePoints(nextProps.indices)
    };

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.draw_interval != this.props.draw_interval){
            return true
        }
        if (nextProps.resize != this.props.resize){
            return true
        }
        else{ return false }
    }

    componentDidUpdate(){
        this._resize();
    }

    componentDidMount() {
        this._draw()
    };

    getLineData(){
        var line_data_all = [];

        for (var line_number in this.props.data){
            line_data_all.push(this.props.data[line_number][this.props.data_key])
        }
        return line_data_all
    }

    render(){
        return(
            <div className='chart'>
                <a className='learn-more' target='_blank' href={this.props.learn_more}>Click to Learn More</a>
            </div>
        )
    }
}
