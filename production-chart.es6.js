(function() {
  Polymer({

		is: 'production-chart',

		listeners: {
			"legend-actual.tap": "_toggleActual",
			"legend-target.tap": "_toggleTarget",
			"legend-forecast.tap": "_toggleForecast"
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
			chartType: {
				type: String,
				value: "line"
			},
			axisConfig: {
				type: Object,
				value: () => {
					return {
						"x": {
							"tickFormat": "",
							"inputTimeFormat": "%Y-%m-%dT%H:%M:%S.%LZ",
							"tickTimeFormat": "%d %b %y",
						},
						"y": {
							"tickFormat": ".3s",
							"hideGrid": true,
							"dotRadius": 0,
							"start": 0
						}
					};
				}
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
			forecastDispVal: {
				type: Number
			},
			actualLegendLabel: {
				type: String
			},
			targetLegendLabel: {
				type: String
			},
			forecastLegendLabel: {
				type: String
			},
			designCapacityLegendLabel: {
				type: String
			},
			hideActualLegend: {
				type: Boolean,
        value: false
			},
			hideTargetLegend: {
				type: Boolean,
        value: false
			},
			hideForecastLegend: {
				type: Boolean,
        value: false
			},
			hideDesignCapacityLegend: {
				type: Boolean,
        value: false
			},
			legendLabels: {
				type: Array,
        value() {
					return [];
				},
				observer: '_setLegendLabels'
      },
			unit: {
				type: String,
				value: "Metric Ton/day"
			},
			axisKeys: {
				type: Array,
				value() {
					return [
						"actual", "target", "forecast", "design"
					]
				}
			},
			data: {
				type: Array,
				value() {
					return [];
				},
				observer: '_redraw'
			},
			dateRange: {
				type: Object,
				notify: true,
				value() {
					return {}
				}
			},
			datePicker: {
				type: String,
				value: ""
			}
		},

		ready() {
			this.scopeSubtree(this.$.chart, true);
		},

		isDatePickerBased(datePicker) {
			return datePicker ? true : false;
		},

		isDateRangeBased(datePicker) {
			return datePicker ? false : true;
		},

    attached() {
      console.log(this.axisConfig)
    },

		draw() {
			let d3 = Px.d3;
			let me = this;
			let data = this.data;
			// set the dimensions and margins of the graph
			let margin = {top: 20, right: 20, bottom: 30, left: 50},
					width = this.width - margin.left - margin.right,
					height = this.height - margin.top - margin.bottom;

			this.axisConfig = this.axisConfig ? this.axisConfig : {};
			this.axisConfig.x = this.axisConfig.x ? this.axisConfig.x : {};
			this.axisConfig.y = this.axisConfig.y ? this.axisConfig.y : {};
			this.chartType = this.chartType || "line";

			let defaultDotRadius = this.axisConfig.y.dotRadius;
			if(!defaultDotRadius) {
				if(defaultDotRadius != 0) {
					defaultDotRadius = 2;
				} else {
					defaultDotRadius = 0;
				}
			}
			defaultDotRadius = +defaultDotRadius

			// parse the date / time
			let inTimeFormat = this.axisConfig.x.inputTimeFormat ?
				this.axisConfig.x.inputTimeFormat : "%Y-%m-%dT%H:%M:%S.%LZ";
			let parseTime = d3.timeParse(inTimeFormat);

			let tooltipTimeFormat = d3.timeFormat("%A, %b %d");
			let tooltipTimeFormat2 = d3.timeFormat("%Y");

			// set the ranges
			let x = d3.scaleTime().range([0, width]);
			let y = d3.scaleLinear().range([height, 0]).clamp(true);

			let actualArea = d3.area()
    			.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[0]]); });

			let actualLine = d3.line()
    			.x(function(d) { return x(d.date); })
    			.y(function(d) { return y(d[me.axisKeys[0]]); });

			let targetChart = d3.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[1]]); });

			let forecastLine = d3.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[2]]); });

			let area = d3.area()
					.x(function(d) { return x(d.date); })
					.y1(function(d) { return y(d[me.axisKeys[3]]); });

			let designLine = d3.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[3]]); });

			let svg = d3.select(this.$.chart).append("svg")
					// .attr("width", width + margin.left + margin.right)
					// .attr("height", height + margin.top + margin.bottom)
					.attr("viewBox", "0 0 "+this.width+" "+this.height)
					.attr("preserveAspectRatio", "xMidYMid meet")
				.append("g")
					.attr("transform",
								"translate(" + margin.left + "," + margin.top + ")");

			data.forEach(function(d) {
				d.date = d.date.getTime ? d.date : parseTime(d.date);
				me.axisKeys.forEach((key)=>{
					d[key] = d[key] ? (+d[key]) : 0;
				});
			});

			let today;

			let yMax = d3.max(data, function(d) {
				return Math.max(d.actual, d.target, d.forecast, d.design); });
			let yMin = this.axisConfig.y.start;
			if(!yMin) {
				if(yMin != 0) {
					yMin = yMax/2;
				}
			}
			yMin = +yMin;

			x.domain(d3.extent(data, function(d) { return d.date; })).nice(d3.timeDay);
			y.domain([yMin, yMax]).nice(6);

			let yScaledMin = y(y.domain()[0]);

			actualArea.y1(yScaledMin);
			area.y0(yScaledMin);

			var toolTip = d3.tip(d3.select(this.$.chart))
				.attr("class", "d3-tip")
				.offset([-8, 0])
				.html(function(d) {
					return d.msg;
				});

    	svg.call(toolTip);

			let actualData = [], designData = [], forecastData = [], targetData = [];
			let todayActual = 0, todayTarget = 0, todayForecast = 0, todayDesign = 0;
      data.forEach((_data) => {
        if(_data.actual == _data.forecast) {
					today = _data.date;
					this.designDispVal = _data.design;
					this.actualDispVal = _data.actual;
					this.targetDispVal = _data.target;
					this.forecastDispVal = _data.forecast;
					todayActual = this.actualDispVal;
					todayTarget = this.targetDispVal;
					todayForecast = this.forecastDispVal;
					todayDesign = this.designDispVal;
        }
        if(_data.actual > 0) {actualData.push(_data)}
        if(_data.target > 0) {targetData.push(_data)}
        if(_data.forecast > 0) {forecastData.push(_data)}
        if(_data.design > 0) {designData.push(_data)}
      });

      if(!today) {
        today = new Date();
      }

      this.set("hideActualLegend", actualData.length === 0);
      this.set("hideTargetLegend", targetData.length === 0);
      this.set("hideForecastLegend", forecastData.length === 0);
			this.set("hideDesignCapacityLegend", designData.length === 0);

			let updateLegendVal = (d) => {
				this.actualDispVal = d.actual.toFixed(2);
				this.targetDispVal = d.target.toFixed(2);
				this.forecastDispVal = d.forecast.toFixed(2);
				this.designDispVal = d.design.toFixed(2);
			};

			let revertLegendValToToday = () => {
				this.actualDispVal = todayActual;
				this.targetDispVal = todayTarget;
				this.forecastDispVal = todayForecast;
				this.designDispVal = todayDesign;
			};

			if(designData.length) {
        if(this.chartType === "line") {
					svg.append("path")
						.data([designData])
						.attr("class", "design-line")
						.style("stroke", "#eddd46")
						.style("fill", "transparent")
						.attr("d", designLine)
						.style("pointer-events", "none");
				} else {
					svg.append("path")
						.datum(designData)
						.attr("fill", "#eddd46")
						.attr("d", area)
						.style("pointer-events", "none");
				}

				svg.selectAll(".dot")
						.data(designData)
						.enter()
							.append("circle")
							.attr("r", 0)
							.attr("cx", (d, i) => x(d.date))
							.attr("cy", (d) => y(d.design))
							.attr("fill", "transparent")
							.attr("class", "design-circle")
							.on('mouseover', function(d, i) {
								updateLegendVal(d);
							})
							.on('mouseout', function(d) {
								revertLegendValToToday();
							});
      }

			if(!this.hideActual && actualData.length) {
				if(this.chartType === "line") {
					svg.append("path")
						.data([actualData])
						.attr("class", "actual-area actual-line")
						.style("stroke", "#5fbcf8")
						.style("fill", "transparent")
						.attr("d", actualLine)
						.style("pointer-events", "none");
				} else {
					svg.append("path")
						.datum(actualData)
						.attr("class", "actual-area")
						.style("fill", "#5fbcf8")
						.attr("d", actualArea)
						.style("pointer-events", "none");
				}

				svg.selectAll(".dot")
					.data(actualData)
					.enter()
						.append("circle")
						.attr("r", defaultDotRadius)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.actual))
						.attr("fill", "#5fbcf8")
						.attr("class", "actual-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', defaultDotRadius + 3);
							d.msg = tooltipTimeFormat(d.date) + "<br>"
								+ "Actual of <b>" + d.actual + "</b><br>" + "produced in "
								+ tooltipTimeFormat2(d.date);
							updateLegendVal(d);
							toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', defaultDotRadius);
							revertLegendValToToday();
							toolTip.hide(d);
						});
			}

      if(!this.hideForecast && forecastData.length > 0) {
				if(this.chartType === "line") {

				} else {
					let areaAboveForecastLine = d3.area()
						.x(forecastLine.x())
						.y0(forecastLine.y())
						.y1(yScaledMin);
					let areaBelowForecastLine = d3.area()
						.x(forecastLine.x())
						.y0(forecastLine.y())
						.y1(actualArea.y());
					let areaAboveActual = d3.area()
						.x(actualArea.x())
						.y0(actualArea.y())
						.y1(yScaledMin);
					let areaBelowActual = d3.area()
						.x(actualArea.x())
						.y0(actualArea.y())
						.y1(forecastLine.y());
					let defs = svg.append('defs');

					defs.append('clipPath')
						.attr('id', 'clip-forecast')
						.append('path')
						.datum(forecastData)
						.attr("class", "forecast-area forecast-positive")
						.attr('d', areaAboveForecastLine)
						.style("pointer-events", "none");

					defs.append('clipPath')
						.attr('id', 'clip-actual')
						.append('path')
						.datum(forecastData)
						.attr("class", "forecast-area forecast-negative")
						.attr('d', areaAboveActual)
						.style("pointer-events", "none");

					svg.append('path')
						.datum(forecastData)
						.attr('d', areaBelowForecastLine)
						.attr("class", "forecast-area forecast-negative")
						.attr('clip-path', 'url(#clip-actual)')
						.style("pointer-events", "none");

					svg.append('path')
						.datum(forecastData)
						.attr('d', areaBelowActual)
						.attr("class", "forecast-area forecast-positive")
						.attr('clip-path', 'url(#clip-forecast)')
						.style("pointer-events", "none");
				}
      }

			if(!this.hideTarget && targetData.length) {
				svg.append("path")
						.data([targetData])
						.attr("class", "target-line")
						.style("stroke", "red")
						.attr("d", targetChart)
						.style("pointer-events", "none");

				svg.selectAll(".dot")
					.data(targetData)
					.enter()
						.append("circle")
						.attr("r", defaultDotRadius)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.target))
						.attr("fill", "red")
						.attr("class", "target-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', defaultDotRadius + 3);
							d.msg = tooltipTimeFormat(d.date) + "<br>"
								+ "Target of <b>" + d.target + "</b><br>" + "produced in "
								+ tooltipTimeFormat2(d.date);
							updateLegendVal(d);
							toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', defaultDotRadius);
							revertLegendValToToday();
							toolTip.hide(d);
						});
			}

      if(!this.hideForecast && forecastData.length) {
        svg.append("path")
					.datum(forecastData)
					.attr("class", "forecast-line")
					.attr("d", forecastLine);

        svg.selectAll(".dot")
					.data(forecastData)
					.enter()
						.append("circle")
						.attr("r", defaultDotRadius)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.forecast))
						.attr("fill", "rgba(164, 117, 237, 0.8)")
						.attr("class", "forecast-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', defaultDotRadius + 3);
							d.msg = tooltipTimeFormat(d.date) + "<br>"
								+ "Forecast of <b>" + d.forecast + "</b><br>" + "produced in "
								+ tooltipTimeFormat2(d.date);
							updateLegendVal(d);
							toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', defaultDotRadius);
							revertLegendValToToday();
							toolTip.hide(d);
						});
      }

			// Add the X Axis
			let _xAxis = d3.axisBottom(x);
			if(this.axisConfig.x.tickTimeFormat) {
				_xAxis.tickFormat(d3.timeFormat(
					this.axisConfig.x.tickTimeFormat || "%d %b %y"));
			}
			svg.append("g")
					.attr("transform", "translate(0," + height + ")")
					.attr("class", "x-axis")
					.call(_xAxis);

			if(!this.axisConfig.y.hideGrid) {
				svg.append("g")
					.attr("class", "y-grid")
					.call(d3.axisLeft(y)
							.ticks(5)
							.tickSize(-width)
							.tickFormat(""));
			}

			// Add the Y Axis
			let _yAxis = d3.axisLeft(y).ticks(6);
			if(this.axisConfig.y.tickFormat) {
				_yAxis.tickFormat(d3.format(this.axisConfig.y.tickFormat));
			}
			svg.append("g")
					.attr("class", "y-axis")
					.call(_yAxis);

      svg.append("svg:line")
        .attr("class", "today")
        .attr("x1", x(today))
        .attr("y1", height+18)
        .attr("x2", x(today))
        .attr("y2", -7);

      svg.append("text")
        .attr("class", "today-text")
        .attr("x", (x(x.domain()[0]) + x(today))/2)
        .attr("y", -9)
				.text("Historical");

			svg.append("text")
        .attr("class", "today-text")
        .attr("x", x(today)-10)
        .attr("y", -9)
				.text("Today");

			if(!this.hideForecast && forecastData.length > 0) {
				svg.append("text")
					.attr("class", "today-text")
					.attr("x", (x(x.domain()[1]) * 0.8))
					.attr("y", -9)
					.text("Forecast");
			}

			svg.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left)
				.attr("x",0 - (height / 2))
				.attr("dy", "1em")
				.attr("class", "yaxis-label")
				.text(this.unit);

      this.fire("chart-drawn", {});
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
				this.querySelector(".target-line").style.display = "none";
				this.querySelectorAll(".target-circle").forEach((elt) => {
					elt.style.display = "none";
				});
			} else {
				this.querySelector(".target-line").style.display = "block";
				this.querySelectorAll(".target-circle").forEach((elt) => {
					elt.style.display = "block";
				});
			}
		},
		_toggleForecast() {
			this.hideForecast = !this.hideForecast;
			if(this.hideForecast) {
				this.querySelector(".forecast-line").style.display = "none";
				this.querySelectorAll(".forecast-circle").forEach((elt) => {
					elt.style.display = "none";
				});
        this.querySelectorAll(".forecast-area").forEach((elt) => {
					elt.style.display = "none";
				});
			} else {
				this.querySelector(".forecast-line").style.display = "block";
				this.querySelectorAll(".forecast-circle").forEach((elt) => {
					elt.style.display = "block";
				});
				this.querySelectorAll(".forecast-area").forEach((elt) => {
					elt.style.display = "block";
				});
			}
		},

		_redraw(newData, oldData) {
			Polymer.dom(this.$.chart).node.innerHTML = "";
			this.draw();
		},
		_setLegendLabels(labels) {
			if(labels && labels.length) {
				this.set("actualLegendLabel", labels[0]);
				this.set("targetLegendLabel", labels[1]);
				this.set("forecastLegendLabel", labels[2]);
				this.set("designCapacityLegendLabel", labels[3]);
			}
		},
    _compute(prop) {
      return prop;
    }
  });
})();
