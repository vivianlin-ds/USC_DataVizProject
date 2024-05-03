function drawBarArrv(year) {
    var specifiedYear = year

    const ba_margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const ba_width = 900 - ba_margin.left - ba_margin.right;
    const ba_height = 600 - ba_margin.top - ba_margin.bottom;

    var svg = d3.select('#bar-arrv').append('svg')
        .attr('width', ba_width + ba_margin.left + ba_margin.right)
        .attr('height', ba_height + ba_margin.top + ba_margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + ba_margin.left + ', ' + ba_margin.top + ')');

    d3.json('data/tourism/tourism_arr_dep.json').then(data => {
        arr_data = data
                .filter(d => d.Year === specifiedYear)
                .sort((a, b) => b.Arrivals - a.Arrivals)
                .slice(0, 20)
                .map(d => ({
                    country: d.Country,
                    country_code: d.Country_code,
                    year: d.Year,
                    arrival: d.Arrivals,
                    continent: d.Continent
                }))

        // console.log(arr_data);
        
        arr_all = arr_data;

        //initialize data variabless
        arr_africa = arr_data.filter(d => d.continent === 'Africa')
        arr_america = arr_data.filter(d => d.continent === 'America')
        arr_asia  = arr_data.filter(d => d.continent === 'Asia')
        arr_oceania = arr_data.filter(d => d.continent === 'Oceania')
        arr_europe = arr_data.filter(d => d.continent === 'Europe')

        //set initial state
        ba_filter('#arr-all');
        ba_sort('#arrival');

        ba_toggleFilter('#arr-all');
        ba_toggleSort('#arrival');

        ba_draw();
    });

    ///////////////////////////////////////////////////////////////
    // Controls
    ///////////////////////////////////////////////////////////////

    var current, sortMode, filterMode;

    // Reset to default
    d3.select('#arr-reset')
        .on('click', () => {
        ba_filter('#arr-all');
        ba_sort('#arrival');
        ba_transition();

        ba_toggleSort('#arrival');
        ba_toggleFilter('#arr-all');

        ba_redraw();
        });

    //sort event handlers
    d3.select('#arrival')
        .on('click', () => {
        ba_sort('#arrival');
        ba_transition();
        ba_toggleSort('#arrival');
        });

    d3.select('#arr-alphabet')
        .on('click', () => {
        ba_sort('#arr-alphabet');
        ba_transition();
        ba_toggleSort('#arr-alphabet');
        });

    //filter event handlers
    d3.select('#arr-all')
        .on('click', () => {
        ba_filter('#arr-all');
        ba_sort(sortMode);

        ba_toggleSort(sortMode);
        ba_toggleFilter('#arr-all');

        ba_redraw();
        });

    d3.select('#arr-africa')
        .on('click', () => {
        ba_filter('#arr-africa');
        ba_sort(sortMode);

        ba_toggleSort(sortMode);
        ba_toggleFilter('#arr-africa');

        ba_redraw();
        });

    d3.select('#arr-america')
        .on('click', () => {
        ba_filter('#arr-america');
        ba_sort(sortMode);

        ba_toggleSort(sortMode);
        ba_toggleFilter('#arr-america');

        ba_redraw();
        });

    d3.select('#arr-asia')
        .on('click', () => {
        ba_filter('#arr-asia');
        ba_sort(sortMode);

        ba_toggleSort(sortMode);
        ba_toggleFilter('#arr-asia');

        ba_redraw();
        });

    d3.select('#arr-oceania')
        .on('click', () => {
        ba_filter('#arr-oceania');
        ba_sort(sortMode);

        ba_toggleSort(sortMode);
        ba_toggleFilter('#arr-oceania');

        ba_redraw();
        });

    d3.select('#arr-europe')
        .on('click', () => {
        ba_filter('#arr-europe');
        ba_sort(sortMode);

        ba_toggleSort(sortMode);
        ba_toggleFilter('#arr-europe');

        ba_redraw();
        });
    
    function ba_updateButtonState(continent, enabled) {
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

    function ba_filter(mode) {
        if (mode === '#arr-all') {
        current = JSON.parse(JSON.stringify(arr_all));
        } else if (mode === '#arr-africa') {
        current = JSON.parse(JSON.stringify(arr_africa));
        } else if (mode === '#arr-america') {
        current = JSON.parse(JSON.stringify(arr_america));
        } else if (mode === '#arr-asia') {
        current = JSON.parse(JSON.stringify(arr_asia));
        } else if (mode === '#arr-oceania') {
        current = JSON.parse(JSON.stringify(arr_oceania));
        } else if (mode === '#arr-europe') {
        current = JSON.parse(JSON.stringify(arr_europe));
        }
        
        x.domain(current.map(d => d.country));
        filterMode = mode;
    }

    function ba_sort(mode) {
        if (mode === '#arrival') {
        current.sort((a, b) => d3.descending(a.arrival, b.arrival));
        //update x axis label
        d3.select('#arr-x-axis-label').text('Sorted from Highest to Lowest Arrivals');
        } else if (mode === '#arr-alphabet') { 
        current.sort((a, b) => d3.ascending(a.country, b.country));
        // Update x axis label if needed
        d3.select('#arr-x-axis-label').text('Sorted Alphabetically by Country Names');
        }
        x.domain(current.map(d => d.country));
        sortMode = mode;
    }

    function ba_toggleSort(id) {
        d3.selectAll('.sort')
            .classed('active', false);
        d3.select(id)
            .classed('active', true);

        ba_updateButtonState(id.replace('#', ''), true);
    }

    function ba_toggleFilter(id) {
        d3.selectAll('.filter')
            .classed('active', false);
        d3.select(id)
            .classed('active', true);  
        
        ba_updateButtonState(id.replace('#', ''), true);
    }

    ///////////////////////////////////////////////////////////////
    // draw the chart
    ///////////////////////////////////////////////////////////////

    var x = d3.scaleBand();
    var y = d3.scaleLinear();

    var delay = function (d, i) {
        return i * 50;
    };

    var ba_tooltip = d3.select('#bar-arrv')
        .append('div')
        .attr('class', 'tooltip')
        .style("opacity", 0);

    function ba_redraw() {
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
            ba_tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

            ba_tooltip.html(`${d.country}`)
                .style('left', (event.pageX - 225) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            ba_tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .transition()
        .duration(750)
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.arrival))
        .attr('width', x.bandwidth())
        .attr('height', d => ba_height - y(d.arrival));

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
        .attr('y', d => y(d.arrival) + (ba_height - y(d.arrival)) / 2)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .text(d => d.country_code)
        .attr('class', 'name')
        .attr('x', d => x(d.country) + x.bandwidth() / 2)
        .attr('y', d => y(d.arrival) + (ba_height - y(d.arrival)) / 2)
        .style('opacity', 1);

        // EXIT.
        name.exit()
        .transition()
        .duration(750)
        .style('opacity', 0)
        .remove();
    }

    function ba_transition() {
        var transition = svg.transition()
        .duration(750);

        transition.selectAll('.bar')
        .delay(delay)
        .attr('x', d => x(d.country));

        transition.selectAll('.name')
        .delay(delay)
        .attr('x', d => x(d.country) + x.bandwidth() / 2);
    }

    function ba_draw() {
        // Update button states based on data availability
        ba_updateButtonState('arr-africa', arr_africa.length > 0);
        ba_updateButtonState('arr-america', arr_america.length > 0);
        ba_updateButtonState('arr-asia', arr_asia.length > 0);
        ba_updateButtonState('arr-oceania', arr_oceania.length > 0);
        ba_updateButtonState('arr-europe', arr_europe.length > 0);

        x.domain(current.map(d => d.country))
        .range([0, ba_width])
        .paddingInner(0.2);

        y.domain([0, d3.max(current, d => d.arrival)])
        .range([ba_height, 0]);

        svg.selectAll('.bar')
        .data(current, d => d.country)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.arrival))
        .attr('width', x.bandwidth())
        .attr('height', d => ba_height - y(d.arrival))
        .on('mouseover', function (event, d) {
            ba_tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

            ba_tooltip.html(`<strong>${d.country}</strong>`)
                .style('left', (event.pageX - 225) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            ba_tooltip.transition()
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
        .attr('y', d => y(d.arrival) + (ba_height - y(d.arrival)) / 2)
        .style('font-size', '8px');

        var xAxis;
        xAxis = d3.axisBottom()
        .scale(x)
        .ticks(0)
        .tickSize(0)
        .tickFormat('');

        svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + ba_height + ')')
        .call(xAxis);

        svg.append('text')
        .attr('x', ba_width / 2)
        .attr('y', ba_height + 20)
        .attr('class', 'label')
        .style('font-size', '16px')
        .text('Sorted from Highest to Lowest Arrivals')
        .attr('id', 'arr-x-axis-label');

        var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(5)
        .tickFormat(d3.format('~s'));

        svg.append('g')
        .attr('class', 'axis')
        .call(yAxis);

        svg.append('text')
        .attr('x', - ba_height / 2)
        .attr('y', - ba_margin.left * 0.7)
        .attr('transform', 'rotate(-90)')
        .attr('class', 'label')
        .style('font-size', '16px')
        .append('tspan').text('Number of Arriving Tourists');

        // Add plot title
        svg.append("text")
        .attr("x", ba_width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(`Top 20 Countries with Highest Number of Arrivaling Tourists in Year ${specifiedYear}`);

        // Add captions
        svg.append("text")
        .attr("x", -10)
        .attr("y", ba_height + ba_margin.bottom / 2)
        .attr('text-anchor', 'start')
        .style('font-size', '14px')
        .text('Hover to see full country names.');
    }
}
