function drawBarDept(year) {
    var specifiedYear = year

    const bd_margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const bd_width = 900 - bd_margin.left - bd_margin.right;
    const bd_height = 600 - bd_margin.top - bd_margin.bottom;

    var svg = d3.select('#bar-dept').append('svg')
        .attr('width', bd_width + bd_margin.left + bd_margin.right)
        .attr('height', bd_height + bd_margin.top + bd_margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + bd_margin.left + ', ' + bd_margin.top + ')');

    d3.json('data/tourism/tourism_arr_dep.json').then(data => {
        data = data
                .filter(d => d.Year === specifiedYear)
                .sort((a, b) => b.Departures - a.Departures)
                .slice(0, 20)
                .map(d => ({
                    country: d.Country,
                    country_code: d.Country_code,
                    year: d.Year,
                    departure: d.Departures,
                    continent: d.Continent
                }))
        
        // console.log(data);
        all = data;

        //initialize data variabless
        africa = data.filter(d => d.continent === 'Africa')
        america = data.filter(d => d.continent === 'America')
        asia  = data.filter(d => d.continent === 'Asia')
        oceania = data.filter(d => d.continent === 'Oceania')
        europe = data.filter(d => d.continent === 'Europe')

        //set initial state
        bd_filter('#dep-all');
        bd_sort('#departure');

        bd_toggleFilter('#dep-all');
        bd_toggleSort('#departure');

        bd_draw();
    });

    ///////////////////////////////////////////////////////////////
    // Controls
    ///////////////////////////////////////////////////////////////

    var current, sortMode, filterMode;

    // Reset to default
    d3.select('#dep-reset')
        .on('click', () => {
        bd_filter('#dep-all');
        bd_sort('#departure');
        bd_transition();

        bd_toggleSort('#departure');
        bd_toggleFilter('#dep-all');

        bd_redraw();
        });

    //sort event handlers
    d3.select('#departure')
        .on('click', () => {
        bd_sort('#departure');
        bd_transition();
        bd_toggleSort('#departure');
        });

    d3.select('#dep-alphabet')
        .on('click', () => {
        bd_sort('#dep-alphabet');
        bd_transition();
        bd_toggleSort('#dep-alphabet');
        });

    //filter event handlers
    d3.select('#dep-all')
        .on('click', () => {
        bd_filter('#dep-all');
        bd_sort(sortMode);

        bd_toggleSort(sortMode);
        bd_toggleFilter('#dep-all');

        bd_redraw();
        });

    d3.select('#dep-africa')
        .on('click', () => {
        bd_filter('#dep-africa');
        bd_sort(sortMode);

        bd_toggleSort(sortMode);
        bd_toggleFilter('#dep-africa');

        bd_redraw();
        });

    d3.select('#dep-america')
        .on('click', () => {
        bd_filter('#dep-america');
        bd_sort(sortMode);

        bd_toggleSort(sortMode);
        bd_toggleFilter('#dep-america');

        bd_redraw();
        });

    d3.select('#dep-asia')
        .on('click', () => {
        bd_filter('#dep-asia');
        bd_sort(sortMode);

        bd_toggleSort(sortMode);
        bd_toggleFilter('#dep-asia');

        bd_redraw();
        });

    d3.select('#dep-oceania')
        .on('click', () => {
        bd_filter('#dep-oceania');
        bd_sort(sortMode);

        bd_toggleSort(sortMode);
        bd_toggleFilter('#dep-oceania');

        bd_redraw();
        });

    d3.select('#dep-europe')
        .on('click', () => {
        bd_filter('#dep-europe');
        bd_sort(sortMode);

        bd_toggleSort(sortMode);
        bd_toggleFilter('#dep-europe');

        bd_redraw();
        });
    
    function bd_updateButtonState(continent, enabled) {
        const button = d3.select('#' + continent);
        button.property('disabled', !enabled);
        button.style('pointer-events', enabled ? 'auto' : 'none');
    
        // Set the background color based on the button's state
        if (enabled) {
            button.style('background-color', '#eee'); // Reset to default background color
        } else {
            button.style('background-color', '#bbb'); // Change to a color indicating disabled state
        }
    }

    function bd_filter(mode) {
        if (mode === '#dep-all') {
        current = JSON.parse(JSON.stringify(all));
        } else if (mode === '#dep-africa') {
        current = JSON.parse(JSON.stringify(africa));
        } else if (mode === '#dep-america') {
        current = JSON.parse(JSON.stringify(america));
        } else if (mode === '#dep-asia') {
        current = JSON.parse(JSON.stringify(asia));
        } else if (mode === '#dep-oceania') {
        current = JSON.parse(JSON.stringify(oceania));
        } else if (mode === '#dep-europe') {
        current = JSON.parse(JSON.stringify(europe));
        }
        x.domain(current.map(d => d.country));
        filterMode = mode;
    }

    function bd_sort(mode) {
        if (mode === '#departure') {
        current.sort((a, b) => d3.descending(a.departure, b.departure));
        //update x axis label
        d3.select('#dep-x-axis-label').text('Sorted from Highest to Lowest Departures');
        } else if (mode === '#dep-alphabet') { 
        current.sort((a, b) => d3.ascending(a.country, b.country));
        // Update x axis label if needed
        d3.select('#dep-x-axis-label').text('Sorted Alphabetically by Country Names');
        }
        x.domain(current.map(d => d.country));
        sortMode = mode;
    }

    function bd_toggleSort(id) {
        d3.selectAll('.sort')
            .classed('active', false);
        d3.select(id)
            .classed('active', true);

        bd_updateButtonState(id.replace('#', ''), true);
    }

    function bd_toggleFilter(id) {
        d3.selectAll('.filter')
            .classed('active', false);
        d3.select(id)
            .classed('active', true);  
        
        bd_updateButtonState(id.replace('#', ''), true);
    }

    ///////////////////////////////////////////////////////////////
    // draw the chart
    ///////////////////////////////////////////////////////////////

    var x = d3.scaleBand();
    var y = d3.scaleLinear();

    var delay = function (d, i) {
        return i * 50;
    };

    var bp_tooltip = d3.select('#bar-arrv')
        .append('div')
        .attr('class', 'tooltip')
        .style("opacity", 0);

    function bd_redraw() {
        //update scale
        x.domain(current.map(d => d.country));

        ////////////////////////////////
        // DATA JOIN FOR BARS.
        var bars = svg.selectAll('.bar')
        .data(current, d => d.country);

        // UPDATE.
        bars.transition()
        .duration(750)
        .delay(delay)
        .attr('x', d => x(d.country))
        .attr('width', x.bandwidth());

        // ENTER.
        bars.enter()
        .append('rect')
        .attr('x', d => x(d.country))
        .attr('y', d => y(0))
        .attr('width', x.bandwidth())
        .on('mouseover', function (event, d) {
            bp_tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

                bp_tooltip.html(`${d.country}`)
                .style('left', (event.pageX - 225) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            bp_tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .transition()
        .duration(750)
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.departure))
        .attr('width', x.bandwidth())
        .attr('height', d => bd_height - y(d.departure));

        // EXIT.
        bars.exit()
        .transition()
        .duration(750)
        .style('opacity', 0)
        .remove();

        ////////////////////////////////
        // DATA JOIN FOR COUNTRIES.
        var name = svg.selectAll('.name')
        .data(current, d => d.country);

        // UPDATE.
        name.transition()
        .duration(750)
        .delay(delay)
        .attr('x', (d, i) => x(d.country) + x.bandwidth() / 2);

        // ENTER.
        name.enter()
        .append('text')
        .attr('x', d => x(d.country) + x.bandwidth() / 2)
        .attr('y', d => y(d.departure) + (bd_height - y(d.departure)) / 2)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .text(d => d.country_code)
        .attr('class', 'name')
        .attr('x', d => x(d.country) + x.bandwidth() / 2)
        .attr('y', d => y(d.departure) + (bd_height - y(d.departure)) / 2)
        .style('opacity', 1);

        // EXIT.
        name.exit()
        .transition()
        .duration(750)
        .style('opacity', 0)
        .remove();
    }

    function bd_transition() {
        var transition = svg.transition()
        .duration(750);

        transition.selectAll('.bar')
        .delay(delay)
        .attr('x', d => x(d.country));

        transition.selectAll('.name')
        .delay(delay)
        .attr('x', d => x(d.country) + x.bandwidth() / 2);
    }

    function bd_draw() {
        // Update button states based on data availability
        bd_updateButtonState('dep-africa', africa.length > 0);
        bd_updateButtonState('dep-america', america.length > 0);
        bd_updateButtonState('dep-asia', asia.length > 0);
        bd_updateButtonState('dep-oceania', oceania.length > 0);
        bd_updateButtonState('dep-europe', europe.length > 0);

        x.domain(current.map(d => d.country))
        .range([0, bd_width])
        .paddingInner(0.2);

        y.domain([0, d3.max(current, d => d.departure)])
        .range([bd_height, 0]);

        svg.selectAll('.bar')
        .data(current, d => d.country)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.departure))
        .attr('width', x.bandwidth())
        .attr('height', d => bd_height - y(d.departure))
        .on('mouseover', function (event, d) {
            bp_tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

                bp_tooltip.html(`<strong>${d.country}</strong>`)
                .style('left', (event.pageX - 225) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            bp_tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

        svg.selectAll('.name')
        .data(current, d => d.country)
        .enter()
        .append('text')
        .text(d => d.country_code)
        .attr('class', 'name')
        .attr('x', d => x(d.country) + x.bandwidth() / 2)
        .attr('y', d => y(d.departure) + (bd_height - y(d.departure)) / 2)
        .style('font-size', '8px');;

        var xAxis;
        xAxis = d3.axisBottom()
        .scale(x)
        .ticks(0)
        .tickSize(0)
        .tickFormat('');

        svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + bd_height + ')')
        .call(xAxis);

        svg.append('text')
        .attr('x', bd_width / 2)
        .attr('y', bd_height + 20)
        .attr('class', 'label')
        .style('font-size', '16px')
        .text('Sorted from Highest to Lowest Departures')
        .attr('id', 'dep-x-axis-label');

        var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(5)
        .tickFormat(d3.format('~s'));

        svg.append('g')
        .attr('class', 'axis')
        .call(yAxis);

        svg.append('text')
        .attr('x', - bd_height / 2)
        .attr('y', - bd_margin.left * 0.7)
        .attr('transform', 'rotate(-90)')
        .attr('class', 'label')
        .style('font-size', '16px')
        .append('tspan').text('Number of Departing Tourists');

        // Add plot title
        svg.append("text")
        .attr("x", bd_width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(`Top 20 Countries with Highest Number of Departing Tourists in Year ${specifiedYear}`);

        // Add captions
        svg.append("text")
        .attr("x", -10)
        .attr("y", bd_height + bd_margin.bottom / 2)
        .attr('text-anchor', 'start')
        .style('font-size', '14px')
        .text('Hover to see full country names.');
    }
}
