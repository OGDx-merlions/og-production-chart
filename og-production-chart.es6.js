(function() {
  Polymer({

    is: 'og-production-chart',

    listeners: {

    },

    properties: {
      /**
      * This property is a list of tab labels
      *
      * @property labels
      */
      labels: {
        type: Array,
        value() {
					return [
						"All", "Train 1", "Train 2"
					]
				}
			},
			/**
      * Unit for Y-Axis values
      *
      * @property unit
      */
      unit: {
        type: String,
        value: "Metric ton/day"
			},
			/**
      * Chart Width
      *
      * @property width
      */
      width: {
        type: Number,
        value: 960
			},
			/**
      * Chart Height
      *
      * @property height
      */
      height: {
        type: Number,
        value: 300
			},
			/**
      * The Actual, Target and design values to be displayed in the legend
      *
      * @property legendLabels
      ["Actual", "Target", "Forecast", "Design Capacity"]
      */
			legendLabels: {
				type: Array,
        value() {
					return ["Actual", "Target", "Forecast", "Design Capacity"];
				}
      },
			/**
			* This property is an Array of tab data.
			Member of each tab data looks like this
			`{"date":"2017-05-01T16:00:00.000Z","actual":"11960","target":"12950","design":"13960"}`
      *
      * @property data
      */
			data: {
				type: Array,
				value() {
					return [];
				}
      },
      /**
			* The Date to show in Datepicker. If provided, dateRange will be ignored
			Eg: "2017-04-03T03:37:25.000Z"
      *
      * @property datePicker
      */
      datePicker: {
        type: String
      },
			/**
			* The Date range to filter the data. Format as specified in the px-rangepicker
			Eg:
			`{"from":"2017-04-03T03:37:25.000Z","to":"2017-10-26T03:37:25.000Z"}`
      *
      * @property dateRange
      */
      dateRange: {
        type: Object,
        value() {
          return {};
        }
      },
      /**
       * Array of chart Types.
       * Eg: ["line", "area", "line"]
       * @property chartTypes
       */
      chartTypes: {
				type: Array,
				value: () => {
          return [];
        }
      },
      /**
       * Array of Axis Configurations
       * Eg: [{
						"x": {
							"tickFormat": "",
							"inputTimeFormat": "%Y-%m-%dT%H:%M:%S.%LZ",
							"tickTimeFormat": "%d %b %y",
						},
						"y": {
							"tickFormat": ".3s",
							"hideGrid": true,
							"dotRadius": 0,
							"start": 600
						}
					}, null, null]
       * @property axisConfigs
       */
			axisConfigs: {
				type: Array,
				value: () => {
					return [];
				}
			},
      filteredData: {
        type: Array,
        computed: '_filterDates(data, dateRange)'
      },
			selected: {
				type: Number,
				value: 0
			}
		},

    attached() {
      this.rangeParse = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
      this._notifyAttached();
    },

    _notifyAttached() {
      /**
       * Event fired when the component is attached
       *
       * @event attached
       */
      this.fire('attached', {});
    },

    _isMultipleData(data) {
      return data.length > 1;
    },

    _isSingleData(data) {
      return data.length === 1;
    },
    _filterDates(data, dateRange) {
      if(!data || !data.length || !dateRange || this.datePicker) {
        return data;
      }
      const d3 = Px.d3;
      const from = this.rangeParse(dateRange.from);
      const to = this.rangeParse(dateRange.to);
      let filtered = [];
      this.chartTypes = this.chartTypes ? this.chartTypes : [];
      this.axisConfigs = this.axisConfigs ? this.axisConfigs : [];
      data.forEach((arr, idx)=> {
        let _tmp = arr.filter((_obj) => {
          if(!_obj.date) {
            return false;
          }
          const date = _obj.date.getTime ? _obj.date : this.rangeParse(_obj.date);
          return date.getTime() >= from.getTime() 
            && date.getTime() <= to.getTime();
        });
        _tmp.chartType = this.chartTypes.length > idx ? this.chartTypes[idx] : "";
        _tmp.chartType = _tmp.chartType ? _tmp.chartType : "";

        _tmp.axisConfigs = this.axisConfigs.length > idx ? this.axisConfigs[idx] : "";
        _tmp.axisConfigs = _tmp.axisConfigs ? _tmp.axisConfigs : "";
        filtered.push(_tmp);
      });
      return filtered;
    }
  });
})();
