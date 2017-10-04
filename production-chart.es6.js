(function() {
  Polymer({

		is: 'production-chart', 
		
		listeners: {
			"legend-actual.tap": "_toggleActual",
			"legend-target.tap": "_toggleTarget"
		},

    properties: {
			width: {
				type: Number,
				value: 960
			},
			height: {
				type: Number,
				value: 300
			},
			actualDispVal: {
				type: Number
			},
			targetDispVal: {
				type: Number
			},
			designDispVal: {
				type: Number
			},
			unit: {
				type: String,
				value: "Metric Ton/day"
			},
			axisKeys: {
				type: Array,
				value() {
					return [
						"actual", "target", "design"
					]
				}
			},
			data: {
				type: Array,
				value() {
					return [];
				}
			}
		},

		ready() {
			this.scopeSubtree(this.$.chart, true);
		},

		attached() {
			this.draw();
		},
		
		draw() {
			let d3 = Px.d3;
			let me = this;
			let data = this.data;
			// set the dimensions and margins of the graph
			let margin = {top: 20, right: 20, bottom: 30, left: 50},
					width = this.width - margin.left - margin.right,
					height = this.height - margin.top - margin.bottom;
			
			// parse the date / time
			let parseTime = d3.timeParse("%d-%b-%y");

			let tooltipTimeFormat = d3.timeFormat("%A, %b %d");
			let tooltipTimeFormat2 = d3.timeFormat("%Y");
			
			// set the ranges
			let x = d3.scaleTime().range([0, width]);
			let y = d3.scaleLinear().range([height, 0]);
			
			let actualArea = d3.area()
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d[me.axisKeys[0]]); });

			let targetChart = d3.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[1]]); });

			let area = d3.area()
					.x(function(d) { return x(d.date); })
					.y1(function(d) { return y(d[me.axisKeys[2]]); });
			
			// append the svg obgect to the body of the page
			// appends a 'group' element to 'svg'
			// moves the 'group' element to the top left margin
			let svg = d3.select(this.$.chart).append("svg")
					// .attr("width", width + margin.left + margin.right)
					// .attr("height", height + margin.top + margin.bottom)
					.attr("viewBox", "0 0 "+this.width+" "+this.height)
					.attr("preserveAspectRatio", "xMidYMid meet")
				.append("g")
					.attr("transform",
								"translate(" + margin.left + "," + margin.top + ")");
			// Get the data
			data.forEach(function(d) {
				d.date = parseTime(d.date);
				me.axisKeys.forEach((key)=>{
					d[key] = +d[key];
				});
			});
		
			// Scale the range of the data
			x.domain(d3.extent(data, function(d) { return d.date; })).nice();
			y.domain([0, d3.max(data, function(d) {
				return Math.max(d.actual, d.target, d.design); })]).nice();
			
			actualArea.y1(y(0));
			area.y0(y(2));

			var toolTip = d3.tip(d3.select(this.$.chart))
				.attr("class", "d3-tip")
				.offset([-8, 0])
				.html(function(d) {
					return d.msg;
				});

    	svg.call(toolTip);
			
			svg.append("path")
					.datum(data)
					.attr("fill", "#eddd46")
					.attr("d", area);
		
			if(!this.hideActual) {
				svg.append("path")
					.datum(data)
					.attr("class", "actual-area")
					.style("fill", "#88bde6")
					.attr("d", actualArea);
				
				svg.selectAll(".dot")
					.data(data)
					.enter()
						.append("circle")
						.attr("r", 3)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.actual))
						.attr("fill", "#88bde6")
						.attr("class", "actual-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', 5);
							d.msg = tooltipTimeFormat(d.date) + "<br>" 
								+ "Actual of <b>" + d.actual + "</b><br>" + "produced in "
								+ tooltipTimeFormat2(d.date);
							toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', 3);
							toolTip.hide(d);
						});
			}
		
			if(!this.hideTarget) {
				svg.append("path")
						.data([data])
						.attr("class", "line")
						.style("stroke", "red")
						.attr("d", targetChart);

				svg.selectAll(".dot")
					.data(data)
					.enter()
						.append("circle")
						.attr("r", 3)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.target))
						.attr("fill", "red")
						.attr("class", "target-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', 5);
							d.msg = tooltipTimeFormat(d.date) + "<br>" 
								+ "Target of <b>" + d.target + "</b><br>" + "produced in "
								+ tooltipTimeFormat2(d.date);
							toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', 3);
							toolTip.hide(d);
						});	
			}
		
			// Add the X Axis
			svg.append("g")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.timeFormat('%b %d')));
		
			// Add the Y Axis
			svg.append("g")
					.call(d3.axisLeft(y).ticks(6));

			svg.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left)
				.attr("x",0 - (height / 2))
				.attr("dy", "1em")
				.attr("class", "yaxis-label")
				.text(this.unit); 
		},
		_toggleActual() {
			this.hideActual = !this.hideActual;
			if(this.hideActual) {
				this.querySelector(".actual-area").style.display = "none";
				this.querySelectorAll(".actual-circle").forEach((elt) => {
					elt.style.display = "none";
				});
			} else {
				this.querySelector(".actual-area").style.display = "block";
				this.querySelectorAll(".actual-circle").forEach((elt) => {
					elt.style.display = "block";
				});
			}
		},
		_toggleTarget() {
			this.hideTarget = !this.hideTarget;
			if(this.hideTarget) {
				this.querySelector(".line").style.display = "none";
				this.querySelectorAll(".target-circle").forEach((elt) => {
					elt.style.display = "none";
				});
			} else {
				this.querySelector(".line").style.display = "block";
				this.querySelectorAll(".target-circle").forEach((elt) => {
					elt.style.display = "block";
				});
			}
		}
  });
})();
