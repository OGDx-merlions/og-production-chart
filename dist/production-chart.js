"use strict";(function(){Polymer({is:"production-chart",listeners:{"legend-actual.tap":"_toggleActual","legend-target.tap":"_toggleTarget","legend-forecast.tap":"_toggleForecast"},properties:{width:{type:Number,value:960},height:{type:Number,value:300},chartType:{type:String,value:"line"},tooltipConfig:{type:Object,notify:true,value:function value(){return{"lineColor":"#95a5ae","dashArray":"0,0","opacity":0.5,"x":{"label":"Date","suffix":"","prefix":"","timeFormat":"%d %b %y"},"y":{"design":{"label":"Design","suffix":"","prefix":""},"actual":{"label":"Actual","suffix":"","prefix":""},"target":{"label":"Target","suffix":"","prefix":""},"forecast":{"label":"Forecast","suffix":"","prefix":""}}}}},axisConfig:{type:Object,notify:true,value:function value(){return{"x":{"tickFormat":"","inputTimeFormat":"%Y-%m-%dT%H:%M:%S.%LZ","tickTimeFormat":"%d %b %y","todayLabel":"Today","historicalLabel":"Historical","forecastLabel":"Forecast","gridColor":"steelblue"},"y":{"tickFormat":".3s","dotRadius":0,"start":0,"gridColor":"steelblue","series":{"design":{"color":"rgba(237, 221, 70, 0.7)","dashArray":"2,2"},"actual":{"color":"#5fbcf8","historicalHighlightColor":"gray"},"target":{"color":"#f05c56"},"forecast":{"color":"rgba(164, 117, 237, 0.8)"}}}}}},actualDispVal:{type:Number},targetDispVal:{type:Number},designDispVal:{type:Number},forecastDispVal:{type:Number},actualLegendLabel:{type:String},targetLegendLabel:{type:String},forecastLegendLabel:{type:String},designCapacityLegendLabel:{type:String},hideActualLegend:{type:Boolean,value:false},hideTargetLegend:{type:Boolean,value:false},hideForecastLegend:{type:Boolean,value:false},hideDesignCapacityLegend:{type:Boolean,value:false},legendLabels:{type:Array,value:function value(){return[]},observer:"_setLegendLabels"},unit:{type:String,value:"Metric Ton/day"},axisKeys:{type:Array,notify:true,value:function value(){return["actual","target","forecast","design"]}},data:{type:Array,value:function value(){return[]},observer:"_redraw"},dateRange:{type:Object,notify:true,value:function value(){return{}}},datePicker:{type:String,value:""},margin:{type:Object,notify:true,value:function value(){return{top:20,right:20,bottom:30,left:50}}}},ready:function ready(){this.scopeSubtree(this.$.chart,true);window.addEventListener("resize",this._resize.bind(this));this._setDefaults()},draw:function draw(){this._setDefaults();var data=this._massageData(this.data);this._segregateData(data);this._prepareChartingArea();this._prepareAxes(data);this._setLegendDefaults();this._highlightHistorical();this._drawDesign(data);this._drawActual(data);this._drawForecast(data);this._drawTarget(data);this._drawAxes(data);this._drawTimelineSeparators(data);this._drawGridLines(data);this._drawTooltip(data,this);this.fire("chart-drawn",{})},_toggleActual:function _toggleActual(){this.hideActual=!this.hideActual;if(this.hideActual){this.querySelector(".actual-area").style.display="none";this.querySelectorAll(".actual-circle").forEach(function(elt){elt.style.display="none"})}else{this.querySelector(".actual-area").style.display="block";this.querySelectorAll(".actual-circle").forEach(function(elt){elt.style.display="block"})}},_toggleTarget:function _toggleTarget(){this.hideTarget=!this.hideTarget;if(this.hideTarget){this.querySelector(".target-line").style.display="none";this.querySelectorAll(".target-circle").forEach(function(elt){elt.style.display="none"})}else{this.querySelector(".target-line").style.display="block";this.querySelectorAll(".target-circle").forEach(function(elt){elt.style.display="block"})}},_toggleForecast:function _toggleForecast(){this.hideForecast=!this.hideForecast;if(this.hideForecast){this.querySelector(".forecast-line").style.display="none";this.querySelectorAll(".forecast-circle").forEach(function(elt){elt.style.display="none"});this.querySelectorAll(".forecast-area").forEach(function(elt){elt.style.display="none"})}else{this.querySelector(".forecast-line").style.display="block";this.querySelectorAll(".forecast-circle").forEach(function(elt){elt.style.display="block"});this.querySelectorAll(".forecast-area").forEach(function(elt){elt.style.display="block"})}},_redraw:function _redraw(newData,oldData){Polymer.dom(this.$.chart).node.innerHTML="";this.draw();this._resize()},_setLegendLabels:function _setLegendLabels(labels){if(labels&&labels.length){this.set("actualLegendLabel",labels[0]);this.set("targetLegendLabel",labels[1]);this.set("forecastLegendLabel",labels[2]);this.set("designCapacityLegendLabel",labels[3])}},_compute:function _compute(prop){return prop},isDatePickerBased:function isDatePickerBased(datePicker){return datePicker?true:false},isDateRangeBased:function isDateRangeBased(datePicker){return datePicker?false:true},_resize:function _resize(){var size=this.desk?"2vw":"11px";Px.d3.selectAll("text").style("font-size",size);this.customStyle["--font-size"]=size;this.updateStyles()},_setDefaults:function _setDefaults(){// set the dimensions and margins of the graph
this.margin=this.margin||{top:20,right:20,bottom:30,left:50},this.adjustedWidth=this.width-this.margin.left-this.margin.right,this.adjustedHeight=this.height-this.margin.top-this.margin.bottom;this.axisConfig=this.axisConfig||{};this.axisConfig.x=this.axisConfig.x||{};this.axisConfig.y=this.axisConfig.y||{};this.axisConfig.x.axisColor=this.axisConfig.x.axisColor||"#95a5ae";this.axisConfig.y.axisColor=this.axisConfig.y.axisColor||"#95a5ae";this.axisConfig.y.series=this.axisConfig.y.series||{};this.axisConfig.y.series.design=this.axisConfig.y.series.design||{};this.axisConfig.y.series.design.color=this.axisConfig.y.series.design.color||"rgba(237, 221, 70, 0.7)";this.axisConfig.y.series.actual=this.axisConfig.y.series.actual||{};this.axisConfig.y.series.actual.color=this.axisConfig.y.series.actual.color||"#5fbcf8";this.axisConfig.y.series.target=this.axisConfig.y.series.target||{};this.axisConfig.y.series.target.color=this.axisConfig.y.series.target.color||"#f05c56";this.axisConfig.y.series.forecast=this.axisConfig.y.series.forecast||{};this.axisConfig.y.series.forecast.color=this.axisConfig.y.series.forecast.color||"rgba(164, 117, 237, 0.8)";this.actualCol=this.axisConfig.y.series.actual.color;this.targetCol=this.axisConfig.y.series.target.color;this.forecastCol=this.axisConfig.y.series.forecast.color;this.designCol=this.axisConfig.y.series.design.color;this.chartType=this.chartType||"line";if(!this.axisConfig.y.dotRadius){if(this.axisConfig.y.dotRadius!=0){this.axisConfig.y.dotRadius=2}else{this.axisConfig.y.dotRadius=0}}this.axisConfig.y.dotRadius=+this.axisConfig.y.dotRadius;// parse the date / time
this.axisConfig.x.inputTimeFormat=this.axisConfig.x.inputTimeFormat?this.axisConfig.x.inputTimeFormat:"%Y-%m-%dT%H:%M:%S.%LZ";var d3=Px.d3;this.parseTime=d3.timeParse(this.axisConfig.x.inputTimeFormat);this.tooltipConfig=this.tooltipConfig||{};this.tooltipConfig.lineColor=this.tooltipConfig.lineColor||"#95a5ae";this.tooltipConfig.dashArray=this.tooltipConfig.dashArray||"0,0";this.tooltipConfig.opacity=this.tooltipConfig.opacity||"3,3";this.tooltipConfig.dotRadius=this.tooltipConfig.dotRadius||4;this.tooltipConfig.x=this.tooltipConfig.x||{};this.tooltipConfig.y=this.tooltipConfig.y||{};this.tooltipConfig.design=this.tooltipConfig.design||{};this.tooltipConfig.actual=this.tooltipConfig.actual||{};this.tooltipConfig.target=this.tooltipConfig.target||{};this.tooltipConfig.forecast=this.tooltipConfig.forecast||{};this.customStyle["--x-grid-color"]=this.axisConfig.x.gridColor||this.axisConfig.x.axisColor;this.customStyle["--y-grid-color"]=this.axisConfig.y.gridColor||this.axisConfig.y.axisColor;this.customStyle["--font-size"]="11px";this.updateStyles();this.set("axisConfig",this.axisConfig);this.set("tooltipConfig",this.tooltipConfig)},_massageData:function _massageData(data){var _this=this;data.forEach(function(d){d.date=d.date.getTime?d.date:_this.parseTime(d.date);_this.axisKeys.forEach(function(key){d[key]=d[key]?+d[key]:0})});return data},_segregateData:function _segregateData(data){var _this2=this;this.actualData=[];this.designData=[];this.forecastData=[];this.targetData=[];data.forEach(function(_data){if(_data.actual==_data.forecast){_this2.today=_data.date;_this2.designDispVal=_data.design.toFixed(0);_this2.actualDispVal=_data.actual.toFixed(0);_this2.targetDispVal=_data.target.toFixed(0);_this2.forecastDispVal=_data.forecast.toFixed(0);_this2.todayActual=_this2.actualDispVal;_this2.todayTarget=_this2.targetDispVal;_this2.todayForecast=_this2.forecastDispVal;_this2.todayDesign=_this2.designDispVal}if(_data.actual>0){_this2.actualData.push(_data)}if(_data.target>0){_this2.targetData.push(_data)}if(_data.forecast>0){_this2.forecastData.push(_data)}if(_data.design>0){_this2.designData.push(_data)}});if(!this.todayActual&&!this.todayTarget&&!this.todayForecast&&!this.todayDesign){var lastObj=data[data.length-1];this.todayActual=lastObj.actualDispVal?lastObj.actualDispVal.toFixed(0):"";this.todayTarget=lastObj.targetDispVal?lastObj.targetDispVal.toFixed(0):"";this.todayForecast=lastObj.forecastDispVal?lastObj.targetDispVal.toFixed(0):"";this.todayDesign=lastObj.designDispVal?lastObj.targetDispVal.toFixed(0):""}if(!this.today){this.today=new Date}},_prepareChartingArea:function _prepareChartingArea(){var d3=Px.d3;this.svg=d3.select(this.$.chart).append("svg").attr("viewBox","0 0 "+this.width+" "+this.height).attr("width","100%").attr("height","100%").attr("preserveAspectRatio","xMidYMid meet").append("g").attr("transform","translate("+this.margin.left+","+this.margin.top+")")},_prepareAxes:function _prepareAxes(data){var d3=Px.d3;this.x=d3.scaleTime().range([0,this.adjustedWidth]);this.y=d3.scaleLinear().range([this.adjustedHeight,0]).clamp(true);var yMax=d3.max(data,function(d){return Math.max(d.actual,d.target,d.forecast,d.design)});var yMin=this.axisConfig.y.start;if(!yMin){if(yMin!=0){yMin=yMax/2}}yMin=+yMin;this.x.domain(d3.extent(data,function(d){return d.date})).nice(d3.timeDay);this.y.domain([yMin,yMax]).nice(6)},_setLegendDefaults:function _setLegendDefaults(){this.set("hideActualLegend",this.actualData.length===0);this.set("hideTargetLegend",this.targetData.length===0);this.set("hideForecastLegend",this.forecastData.length===0);this.set("hideDesignCapacityLegend",this.designData.length===0)},_highlightHistorical:function _highlightHistorical(data){var x=this.x,y=this.y,me=this,d3=Px.d3;this.svg.append("rect").attr("fill",this.axisConfig.y.series.actual.historicalHighlightColor||"rgba(226, 222, 222, 0.6)").attr("x1",0).attr("y1",0).attr("width",x(this.today)).attr("height",this.adjustedHeight).style("pointer-events","none")},_drawDesign:function _drawDesign(data){var x=this.x,y=this.y,me=this,d3=Px.d3;if(this.designData.length){var area=d3.area().x(function(d){return x(d.date)}).y1(function(d){return y(d[me.axisKeys[3]])});var designLine=d3.line().x(function(d){return x(d.date)}).y(function(d){return y(d[me.axisKeys[3]])});var yScaledMin=y(y.domain()[0]);area.y0(yScaledMin);if(this.chartType==="line"){this.svg.append("path").data([this.designData]).attr("class","design-line").style("stroke",this.axisConfig.y.series.design.color).style("stroke-dasharray",this.axisConfig.y.series.design.dashArray||"0,0").style("fill","transparent").attr("d",designLine).style("pointer-events","none")}else{this.svg.append("path").datum(this.designData).style("stroke",this.axisConfig.y.series.design.color).attr("fill",this.axisConfig.y.series.design.color).attr("d",area).style("pointer-events","none")}}},_drawTarget:function _drawTarget(data){var x=this.x,y=this.y,me=this,d3=Px.d3;var targetChart=d3.line().x(function(d){return x(d.date)}).y(function(d){return y(d[me.axisKeys[1]])});if(!this.hideTarget&&this.targetData.length){this.svg.append("path").data([this.targetData]).attr("class","target-line").style("stroke",this.axisConfig.y.series.target.color).style("stroke-dasharray",this.axisConfig.y.series.target.dashArray||"0,0").attr("d",targetChart).style("pointer-events","none")}},_drawActual:function _drawActual(data){var x=this.x,y=this.y,me=this,d3=Px.d3;this.actualArea=d3.area().x(function(d){return x(d.date)}).y(function(d){return y(d[me.axisKeys[0]])});if(!this.hideActual&&this.actualData.length){var yScaledMin=y(y.domain()[0]);var actualLine=d3.line().x(function(d){return x(d.date)}).y(function(d){return y(d[me.axisKeys[0]])});this.actualArea.y1(yScaledMin);if(this.chartType==="line"){this.svg.append("path").data([this.actualData]).attr("class","actual-area actual-line").style("stroke",this.axisConfig.y.series.actual.color).style("stroke-dasharray",this.axisConfig.y.series.actual.dashArray||"0,0").style("fill","transparent").attr("d",actualLine).style("pointer-events","none")}else{this.svg.append("path").datum(this.actualData).attr("class","actual-area").style("stroke",this.axisConfig.y.series.actual.color).style("fill",this.axisConfig.y.series.actual.color).attr("d",this.actualArea).style("pointer-events","none")}}},_drawForecast:function _drawForecast(data){var x=this.x,y=this.y,me=this,d3=Px.d3;var forecastLine=d3.line().x(function(d){return x(d.date)}).y(function(d){return y(d[me.axisKeys[2]])});if(!this.hideForecast&&this.forecastData.length>0){var yScaledMin=y(y.domain()[0]);if(this.chartType!=="line"){var areaAboveForecastLine=d3.area().x(forecastLine.x()).y0(forecastLine.y()).y1(yScaledMin);var areaBelowForecastLine=d3.area().x(forecastLine.x()).y0(forecastLine.y()).y1(this.actualArea.y());var areaAboveActual=d3.area().x(this.actualArea.x()).y0(this.actualArea.y()).y1(yScaledMin);var areaBelowActual=d3.area().x(this.actualArea.x()).y0(this.actualArea.y()).y1(forecastLine.y());var defs=this.svg.append("defs");defs.append("clipPath").attr("id","clip-forecast").append("path").datum(this.forecastData).attr("class","forecast-area forecast-positive").attr("d",areaAboveForecastLine).style("pointer-events","none");defs.append("clipPath").attr("id","clip-actual").append("path").datum(this.forecastData).attr("class","forecast-area forecast-negative").attr("d",areaAboveActual).style("pointer-events","none");this.svg.append("path").datum(this.forecastData).attr("d",areaBelowForecastLine).attr("class","forecast-area forecast-negative").attr("clip-path","url(#clip-actual)").style("pointer-events","none");this.svg.append("path").datum(this.forecastData).attr("d",areaBelowActual).attr("class","forecast-area forecast-positive").attr("clip-path","url(#clip-forecast)").style("pointer-events","none")}else{this.svg.append("path").datum(this.forecastData).attr("class","forecast-line").style("stroke-dasharray",this.axisConfig.y.series.forecast.dashArray||"0,0").attr("d",forecastLine)}}},_drawAxes:function _drawAxes(data){var x=this.x,y=this.y,me=this,d3=Px.d3;// Add the X Axis
var _xAxis=d3.axisBottom(x);if(this.axisConfig.x.tickTimeFormat){if(typeof this.axisConfig.x.tickTimeFormat==="function"){_xAxis.tickFormat(this.axisConfig.x.tickTimeFormat)}else{_xAxis.tickFormat(d3.timeFormat(this.axisConfig.x.tickTimeFormat))}}this.svg.append("g").attr("transform","translate(0,"+this.adjustedHeight+")").attr("class","x-axis").call(_xAxis);// Add the Y Axis
var _yAxis=d3.axisLeft(y).ticks(6);if(this.axisConfig.y.tickFormat){_yAxis.tickFormat(d3.format(this.axisConfig.y.tickFormat))}this.svg.append("g").attr("class","y-axis").call(_yAxis);this.svg.append("text").attr("transform","rotate(-90)").attr("y",0-this.margin.left).attr("x",0-this.adjustedHeight/2).attr("dy","1em").attr("class","yaxis-label").text(this.unit)},_drawTimelineSeparators:function _drawTimelineSeparators(data){var x=this.x,y=this.y,me=this,d3=Px.d3;this.svg.append("svg:line").attr("class","today").attr("x1",x(this.today)).attr("y1",this.adjustedHeight+18).attr("x2",x(this.today)).attr("y2",-7);this.svg.append("text").attr("class","today-text").attr("x",(x(x.domain()[0])+x(this.today))/2).attr("y",-9).text(this.axisConfig.x.historicalLabel||"Historical");this.svg.append("text").attr("class","today-text").attr("x",x(this.today)-10).attr("y",-9).text(this.axisConfig.x.todayLabel||"Today");if(!this.hideForecast&&this.forecastData.length>0){this.svg.append("text").attr("class","today-text").attr("x",x(x.domain()[1])*0.8).attr("y",-9).text(this.axisConfig.x.forecastLabel||"Forecast")}},_drawGridLines:function _drawGridLines(data){var x=this.x,y=this.y,me=this,d3=Px.d3;if(!this.axisConfig.x.hideGrid){this.svg.append("g").attr("class","grid x-grid").call(d3.axisBottom(x).ticks(this.axisConfig.x.totalGridLines||5).tickSize(this.adjustedHeight).tickFormat(""))}if(!this.axisConfig.y.hideGrid){this.svg.append("g").attr("class","grid y-grid").call(d3.axisLeft(y).ticks(this.axisConfig.y.totalGridLines||5).tickSize(-this.adjustedWidth).tickFormat(""))}},_drawTooltip:function _drawTooltip(data,scope){var _this3=this;var x=this.x,y=this.y,me=scope,d3=Px.d3;this.toolTip=d3.tip(d3.select(this.$.chart)).attr("class","d3-tip").html(function(d){return d});this.updateLegendVal=function(d){_this3.actualDispVal=d.actual.toFixed(0);_this3.targetDispVal=d.target.toFixed(0);_this3.forecastDispVal=d.forecast.toFixed(0);_this3.designDispVal=d.design.toFixed(0)};this.revertLegendValToToday=function(){_this3.actualDispVal=_this3.todayActual;_this3.targetDispVal=_this3.todayTarget;_this3.forecastDispVal=_this3.todayForecast;_this3.designDispVal=_this3.todayDesign};var focus=this.svg.append("g").style("display","none").style("pointer-events","none"),bisectDate=d3.bisector(function(d){return d.date}).left;var getMsg=function getMsg(d){var arr=[];var appendTextIfValid=function appendTextIfValid(cfg,val,arr){if(cfg&&cfg.label){arr.push(cfg.label+" : "+(cfg.prefix||"")+val+(cfg.suffix||""))}return arr};var fmt=d3.timeFormat(_this3.tooltipConfig.x.timeFormat||"%d %b %y");appendTextIfValid(_this3.tooltipConfig.x,fmt(d.date),arr);appendTextIfValid(_this3.tooltipConfig.y.actual,d.actual,arr);appendTextIfValid(_this3.tooltipConfig.y.target,d.target,arr);appendTextIfValid(_this3.tooltipConfig.y.forecast,d.forecast,arr);appendTextIfValid(_this3.tooltipConfig.y.design,d.design,arr);return arr.join("<br>")};focus.append("line").attr("id","focusLineX").attr("class","focusLine");focus.append("line").attr("id","focusLineY").attr("class","focusLine").call(this.toolTip);this.svg.append("rect").attr("class","overlay").attr("width",this.adjustedWidth).attr("height",this.adjustedHeight).on("mouseover",function(){focus.style("display",null)}).on("mouseout",function(){focus.style("display","none");_this3.svg.selectAll(".tooltip-circle").remove();_this3.toolTip.hide();_this3.revertLegendValToToday()}).on("mousemove",function(){var m=d3.select("rect.overlay").node().getScreenCTM();var mouse=d3.select("svg").node().createSVGPoint();mouse.x=d3.event.clientX;mouse.y=d3.event.clientY;mouse=mouse.matrixTransform(m.inverse());var _ref=[mouse.x,mouse.y],mouseX=_ref[0],mouseY=_ref[1];var mouseDate=x.invert(mouseX);var i=bisectDate(data,mouseDate);var d0=data[i-1]||data[0];var d1=data[i];var d=d0&&d1&&mouseDate-d0.date>d1.date-mouseDate?d1:d0;var xVal=x(d.date);var yVal=y(y.invert(mouseY));focus.select("#focusLineX").attr("x1",xVal).attr("y1",y(y.domain()[0])).attr("x2",xVal).attr("y2",y(y.domain()[1]));focus.select("#focusLineY").attr("x1",x(x.domain()[0])).attr("y1",yVal).attr("x2",x(x.domain()[1])).attr("y2",yVal);_this3.toolTip.offset([_this3.height+_this3.margin.bottom*3,xVal-_this3.adjustedWidth/2.2]);_this3._toggleDots(d,me);_this3.toolTip.show(getMsg(d));_this3.updateLegendVal(d)})},_toggleDots:function _toggleDots(data,scope){var x=this.x,y=this.y,me=scope,d3=Px.d3,radius=5;this.svg.selectAll(".tooltip-circle").remove();if(this.designData.length){this.svg.selectAll(".dot").data([data]).enter().append("circle").attr("r",data.design?radius:0).attr("cx",function(d,i){return x(d.date)}).attr("cy",function(d){return y(d.design)}).attr("fill",me.axisConfig.y.series.design.color).attr("class","tooltip-circle design-circle")}if(!this.hideTarget&&this.targetData.length){this.svg.selectAll(".dot").data([data]).enter().append("circle").attr("r",data.target?radius:0).attr("cx",function(d,i){return x(d.date)}).attr("cy",function(d){return y(d.target)}).attr("fill",me.axisConfig.y.series.target.color).attr("class","tooltip-circle target-circle")}if(!this.hideActual&&this.actualData.length){this.svg.selectAll(".dot").data([data]).enter().append("circle").attr("r",data.actual?radius:0).attr("cx",function(d,i){return x(d.date)}).attr("cy",function(d){return y(d.actual)}).attr("fill",me.axisConfig.y.series.actual.color).attr("class","tooltip-circle actual-circle")}if(!this.hideForecast&&this.forecastData.length>0){this.svg.selectAll(".dot").data([data]).enter().append("circle").attr("r",data.forecast?radius:0).attr("cx",function(d,i){return x(d.date)}).attr("cy",function(d){return y(d.forecast)}).attr("fill",me.axisConfig.y.series.forecast.color).attr("class","tooltip-circle forecast-circle")}}})})();
//# sourceMappingURL=production-chart.js.map
