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
              "todayLabel": "Today",
              "historicalLabel": "Historical",
              "forecastLabel": "Forecast"
						},
						"y": {
							"tickFormat": ".3s",
							"hideGrid": true,
							"dotRadius": 0,
							"start": 0,
							"series": {
								"design": {
									"color": "rgba(237, 221, 70, 0.7)",
                  "dashArray": "2,2"
								},
								"actual": {
									"color": "#5fbcf8"
								},
								"target": {
									"color": "#f05c56"
								},
								"forecast": {
									"color": "rgba(164, 117, 237, 0.8)"
								}
							}
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
			},
			margin: {
				type: Object,
				value() {
					return {top: 20, right: 20, bottom: 30, left: 50};
				}
			}
		},

		ready() {
			this.scopeSubtree(this.$.chart, true);
		},

		draw() {
			this._setDefaults();
			let data = this._massageData(this.data);
			this._segregateData(data);
			this._prepareChartingArea();
			this._prepareAxes(data);
			this._setLegendDefaults();
			this._drawDesign(data);
			this._drawActual(data);
			this._drawForecast(data);
			this._drawTarget(data);
			this._drawAxes(data);
			this._drawTimelineSeparators(data);
			this._drawGridLines(data);

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
		},
		
		isDatePickerBased(datePicker) {
			return datePicker ? true : false;
		},

		isDateRangeBased(datePicker) {
			return datePicker ? false : true;
		},

		_setDefaults() {
			// set the dimensions and margins of the graph
			this.margin = this.margin || {top: 20, right: 20, bottom: 30, left: 50},
			this.adjustedWidth = this.width - this.margin.left - this.margin.right,
			this.adjustedHeight = this.height - this.margin.top - this.margin.bottom;

			this.axisConfig = this.axisConfig || {};
			this.axisConfig.x = this.axisConfig.x || {};
			this.axisConfig.y = this.axisConfig.y || {};
			this.axisConfig.y.series = this.axisConfig.y.series || {};
			this.axisConfig.y.series.design = this.axisConfig.y.series.design || {};
			this.axisConfig.y.series.design.color = this.axisConfig.y.series.design.color || "rgba(237, 221, 70, 0.7)";
			this.axisConfig.y.series.actual = this.axisConfig.y.series.actual || {};
			this.axisConfig.y.series.actual.color = this.axisConfig.y.series.actual.color || "#5fbcf8";
			this.axisConfig.y.series.target = this.axisConfig.y.series.target || {};
			this.axisConfig.y.series.target.color = this.axisConfig.y.series.target.color || "#f05c56";
			this.axisConfig.y.series.forecast = this.axisConfig.y.series.forecast || {};
			this.axisConfig.y.series.forecast.color = this.axisConfig.y.series.forecast.color || "rgba(164, 117, 237, 0.8)";

			this.actualCol = this.axisConfig.y.series.actual.color;
			this.targetCol = this.axisConfig.y.series.target.color;
			this.forecastCol = this.axisConfig.y.series.forecast.color;
			this.designCol = this.axisConfig.y.series.design.color;

			this.chartType = this.chartType || "line";

			if(!this.axisConfig.y.dotRadius) {
				if(this.axisConfig.y.dotRadius != 0) {
					this.axisConfig.y.dotRadius = 2;
				} else {
					this.axisConfig.y.dotRadius = 0;
				}
			}
			this.axisConfig.y.dotRadius = +this.axisConfig.y.dotRadius;

			// parse the date / time
			this.axisConfig.x.inputTimeFormat = this.axisConfig.x.inputTimeFormat ?
				this.axisConfig.x.inputTimeFormat : "%Y-%m-%dT%H:%M:%S.%LZ";

			let d3 = Px.d3;
			this.parseTime = d3.timeParse(this.axisConfig.x.inputTimeFormat);
			this.tooltipTimeFormat = d3.timeFormat("%A, %b %d");
			this.tooltipTimeFormat2 = d3.timeFormat("%Y");
		},

		_massageData(data) {
			data.forEach((d) => {
				d.date = d.date.getTime ? d.date : this.parseTime(d.date);
				this.axisKeys.forEach((key)=>{
					d[key] = d[key] ? (+d[key]) : 0;
				});
			});
			return data;
		},

		_segregateData(data) {
			this.actualData = []; this.designData = []; this.forecastData = []; this.targetData = [];
			data.forEach((_data) => {
				if(_data.actual == _data.forecast) {
					this.today = _data.date;
					this.designDispVal = _data.design.toFixed(0);
					this.actualDispVal = _data.actual.toFixed(0);
					this.targetDispVal = _data.target.toFixed(0);
					this.forecastDispVal = _data.forecast.toFixed(0);
					this.todayActual = this.actualDispVal;
					this.todayTarget = this.targetDispVal;
					this.todayForecast = this.forecastDispVal;
					this.todayDesign = this.designDispVal;
				}
				if(_data.actual > 0) {this.actualData.push(_data)}
				if(_data.target > 0) {this.targetData.push(_data)}
				if(_data.forecast > 0) {this.forecastData.push(_data)}
				if(_data.design > 0) {this.designData.push(_data)}
			});
			if(!this.todayActual && !this.todayTarget && !this.todayForecast && !this.todayDesign) {
				let lastObj = data[data.length-1]
				this.todayActual = lastObj.actualDispVal ? lastObj.actualDispVal.toFixed(0) : "";
				this.todayTarget = lastObj.targetDispVal ? lastObj.targetDispVal.toFixed(0) : "";
				this.todayForecast = lastObj.forecastDispVal ? lastObj.targetDispVal.toFixed(0) : "";
				this.todayDesign = lastObj.designDispVal ? lastObj.targetDispVal.toFixed(0) : "";
			}

			if(!this.today) {
				this.today = new Date();
			}
		},

		_prepareChartingArea() {
			let d3 = Px.d3;
			this.svg = d3.select(this.$.chart).append("svg")
					.attr("viewBox", "0 0 "+this.width+" "+this.height)
					.attr("preserveAspectRatio", "xMidYMid meet")
				.append("g")
					.attr("transform",
								"translate(" + this.margin.left + "," + this.margin.top + ")");
			
			this.toolTip = d3.tip(d3.select(this.$.chart))
				.attr("class", "d3-tip")
				.offset([-8, 0])
				.html(function(d) {
					return d.msg;
				});

			this.svg.call(this.toolTip);
		},
		_prepareAxes(data) {
			let d3 = Px.d3;
			this.x = d3.scaleTime().range([0, this.adjustedWidth]);
			this.y = d3.scaleLinear().range([this.adjustedHeight, 0]).clamp(true);
			let yMax = d3.max(data, function(d) {
				return Math.max(d.actual, d.target, d.forecast, d.design); });
			let yMin = this.axisConfig.y.start;
			if(!yMin) {
				if(yMin != 0) {
					yMin = yMax/2;
				}
			}
			yMin = +yMin;

			this.x.domain(d3.extent(data, function(d) { return d.date; })).nice(d3.timeDay);
			this.y.domain([yMin, yMax]).nice(6);
		},
		_setLegendDefaults() {
			this.set("hideActualLegend", this.actualData.length === 0);
			this.set("hideTargetLegend", this.targetData.length === 0);
			this.set("hideForecastLegend", this.forecastData.length === 0);
			this.set("hideDesignCapacityLegend", this.designData.length === 0);

			this.updateLegendVal = (d) => {
				this.actualDispVal = d.actual.toFixed(0);
				this.targetDispVal = d.target.toFixed(0);
				this.forecastDispVal = d.forecast.toFixed(0);
				this.designDispVal = d.design.toFixed(0);
			};

			this.revertLegendValToToday = () => {
				this.actualDispVal = this.todayActual;
				this.targetDispVal = this.todayTarget;
				this.forecastDispVal = this.todayForecast;
				this.designDispVal = this.todayDesign;
			};
		},
		_drawDesign(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;

			if(this.designData.length) {
				let area = d3.area()
					.x(function(d) { return x(d.date); })
					.y1(function(d) { return y(d[me.axisKeys[3]]); });
	
				let designLine = d3.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[3]]); });
				
				let yScaledMin = y(y.domain()[0]);
				area.y0(yScaledMin);

				if(this.chartType === "line") {
					this.svg.append("path")
						.data([this.designData])
						.attr("class", "design-line")
						.style("stroke", this.axisConfig.y.series.design.color)
						.style("stroke-dasharray", this.axisConfig.y.series.design.dashArray || "0,0")
						.style("fill", "transparent")
						.attr("d", designLine)
						.style("pointer-events", "none");
				} else {
					this.svg.append("path")
						.datum(this.designData)
						.attr("fill", this.axisConfig.y.series.design.color)
						.attr("d", area)
						.style("pointer-events", "none");
				}

				this.svg.selectAll(".dot")
						.data(this.designData)
						.enter()
							.append("circle")
							.attr("r", 0)
							.attr("cx", (d, i) => x(d.date))
							.attr("cy", (d) => y(d.design))
							.attr("fill", "transparent")
							.attr("class", "design-circle")
							.on('mouseover', function(d, i) {
								this.updateLegendVal(d);
							})
							.on('mouseout', function(d) {
								this.revertLegendValToToday();
							});
			}
		},
		_drawTarget(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;
			let targetChart = d3.line()
				.x(function(d) { return x(d.date); })
				.y(function(d) { return y(d[me.axisKeys[1]]); });
			
			if(!this.hideTarget && this.targetData.length) {
				this.svg.append("path")
						.data([this.targetData])
						.attr("class", "target-line")
						.style("stroke", this.axisConfig.y.series.target.color)
						.style("stroke-dasharray", this.axisConfig.y.series.target.dashArray || "0,0")
						.attr("d", targetChart)
						.style("pointer-events", "none");

				this.svg.selectAll(".dot")
					.data(this.targetData)
					.enter()
						.append("circle")
						.attr("r", this.defaultDotRadius)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.target))
						.attr("fill", this.axisConfig.y.series.target.color)
						.attr("class", "target-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', this.defaultDotRadius + 3);
							d.msg = this.tooltipTimeFormat(d.date) + "<br>"
								+ "Target of <b>" + d.target + "</b><br>" + "produced in "
								+ this.tooltipTimeFormat2(d.date);
							this.updateLegendVal(d);
							this.toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', this.defaultDotRadius);
							this.revertLegendValToToday();
							this.toolTip.hide(d);
						});
			}
		},
		_drawActual(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;
			this.actualArea = d3.area()
				.x(function(d) { return x(d.date); })
				.y(function(d) { return y(d[me.axisKeys[0]]); });
			if(!this.hideActual && this.actualData.length) {
				let yScaledMin = y(y.domain()[0]);
				let actualLine = d3.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[0]]); });
	
				this.actualArea.y1(yScaledMin);
				if(this.chartType === "line") {
					this.svg.append("path")
						.data([this.actualData])
						.attr("class", "actual-area actual-line")
						.style("stroke", this.axisConfig.y.series.actual.color)
						.style("stroke-dasharray", this.axisConfig.y.series.actual.dashArray || "0,0")
						.style("fill", "transparent")
						.attr("d", actualLine)
						.style("pointer-events", "none");
				} else {
					this.svg.append("path")
						.datum(this.actualData)
						.attr("class", "actual-area")
						.style("fill", this.axisConfig.y.series.actual.color)
						.attr("d", this.actualArea)
						.style("pointer-events", "none");
				}

				this.svg.selectAll(".dot")
					.data(this.actualData)
					.enter()
						.append("circle")
						.attr("r", this.defaultDotRadius)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.actual))
						.attr("fill", this.axisConfig.y.series.actual.color)
						.attr("class", "actual-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', this.defaultDotRadius + 3);
							d.msg = this.tooltipTimeFormat(d.date) + "<br>"
								+ "Actual of <b>" + d.actual + "</b><br>" + "produced in "
								+ this.tooltipTimeFormat2(d.date);
							this.updateLegendVal(d);
							this.toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', this.defaultDotRadius);
							this.revertLegendValToToday();
							this.toolTip.hide(d);
						});
			}
		},
		_drawForecast(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;
			let forecastLine = d3.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d[me.axisKeys[2]]); });

			if(!this.hideForecast && this.forecastData.length > 0) {
				let yScaledMin = y(y.domain()[0]);
				if(this.chartType !== "line") {
					let areaAboveForecastLine = d3.area()
						.x(forecastLine.x())
						.y0(forecastLine.y())
						.y1(yScaledMin);
					let areaBelowForecastLine = d3.area()
						.x(forecastLine.x())
						.y0(forecastLine.y())
						.y1(this.actualArea.y());
					let areaAboveActual = d3.area()
						.x(this.actualArea.x())
						.y0(this.actualArea.y())
						.y1(yScaledMin);
					let areaBelowActual = d3.area()
						.x(this.actualArea.x())
						.y0(this.actualArea.y())
						.y1(forecastLine.y());
					let defs = this.svg.append('defs');

					defs.append('clipPath')
						.attr('id', 'clip-forecast')
						.append('path')
						.datum(this.forecastData)
						.attr("class", "forecast-area forecast-positive")
						.attr('d', areaAboveForecastLine)
						.style("pointer-events", "none");

					defs.append('clipPath')
						.attr('id', 'clip-actual')
						.append('path')
						.datum(this.forecastData)
						.attr("class", "forecast-area forecast-negative")
						.attr('d', areaAboveActual)
						.style("pointer-events", "none");

					this.svg.append('path')
						.datum(this.forecastData)
						.attr('d', areaBelowForecastLine)
						.attr("class", "forecast-area forecast-negative")
						.attr('clip-path', 'url(#clip-actual)')
						.style("pointer-events", "none");

					this.	svg.append('path')
						.datum(this.forecastData)
						.attr('d', areaBelowActual)
						.attr("class", "forecast-area forecast-positive")
						.attr('clip-path', 'url(#clip-forecast)')
						.style("pointer-events", "none");
				} else {
					this.svg.append("path")
						.datum(this.forecastData)
						.attr("class", "forecast-line")
						.style("stroke-dasharray", this.axisConfig.y.series.forecast.dashArray || "0,0")
						.attr("d", forecastLine);
				}
				
				this.svg.selectAll(".dot")
					.data(this.forecastData)
					.enter()
						.append("circle")
						.attr("r", this.defaultDotRadius)
						.attr("cx", (d, i) => x(d.date))
						.attr("cy", (d) => y(d.forecast))
						.attr("fill", this.axisConfig.y.series.forecast.color)
						.attr("class", "forecast-circle")
						.on('mouseover', function(d, i) {
							d3.select(this)
								.attr('r', this.defaultDotRadius + 3);
							d.msg = this.tooltipTimeFormat(d.date) + "<br>"
								+ "Forecast of <b>" + d.forecast + "</b><br>" + "produced in "
								+ this.tooltipTimeFormat2(d.date);
							this.updateLegendVal(d);
							this.toolTip.show(d);
						})
						.on('mouseout', function(d) {
							d3.select(this)
								.attr('r', this.defaultDotRadius);
							this.revertLegendValToToday();
							this.toolTip.hide(d);
						});
			}
		},
		_drawAxes(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;
			// Add the X Axis
			let _xAxis = d3.axisBottom(x);
			if(this.axisConfig.x.tickTimeFormat) {
				_xAxis.tickFormat(d3.timeFormat(
					this.axisConfig.x.tickTimeFormat || "%d %b %y"));
			}
			this.svg.append("g")
					.attr("transform", "translate(0," + this.adjustedHeight + ")")
					.attr("class", "x-axis")
					.call(_xAxis);

			if(!this.axisConfig.y.hideGrid) {
				this.svg.append("g")
					.attr("class", "y-grid")
					.call(d3.axisLeft(y)
							.ticks(5)
							.tickSize(-this.adjustedWidth)
							.tickFormat(""));
			}

			// Add the Y Axis
			let _yAxis = d3.axisLeft(y).ticks(6);
			if(this.axisConfig.y.tickFormat) {
				_yAxis.tickFormat(d3.format(this.axisConfig.y.tickFormat));
			}
			this.svg.append("g")
					.attr("class", "y-axis")
					.call(_yAxis);

			this.svg.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 0 - this.margin.left)
					.attr("x",0 - (this.adjustedHeight / 2))
					.attr("dy", "1em")
					.attr("class", "yaxis-label")
					.text(this.unit);
		},
		_drawTimelineSeparators(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;
			this.svg.append("svg:line")
				.attr("class", "today")
				.attr("x1", x(this.today))
				.attr("y1", this.adjustedHeight+18)
				.attr("x2", x(this.today))
				.attr("y2", -7);

			this.svg.append("text")
				.attr("class", "today-text")
				.attr("x", (x(x.domain()[0]) + x(this.today))/2)
				.attr("y", -9)
				.text(this.axisConfig.x.historicalLabel || "Historical");

			this.svg.append("text")
				.attr("class", "today-text")
				.attr("x", x(this.today)-10)
				.attr("y", -9)
				.text(this.axisConfig.x.todayLabel || "Today");

			if(!this.hideForecast && this.forecastData.length > 0) {
				this.svg.append("text")
					.attr("class", "today-text")
					.attr("x", (x(x.domain()[1]) * 0.8))
					.attr("y", -9)
					.text(this.axisConfig.x.forecastLabel || "Forecast");
			}

		},
		_drawGridLines(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;
		}
  });
})();
