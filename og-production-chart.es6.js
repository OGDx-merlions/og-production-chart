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
      * @property legendDispVal
      [{"actual": 1302, "target": 1212, "design": 1400}]
      */
			legendDispVal: {
				type: Array,
        value() {
					return [];
				}
			},
			/**
			* This property is an Array of tab data.
			Member of each tab data looks like this
			`{"date":"25-Apr-17","actual":"11960","target":"12950","design":"13960"}`
      *
      * @property data
      */
			data: {
				type: Array,
				value() {
					return [];
				},
        observer: "_setLegend"
			},
			selected: {
				type: Number,
				value: 0
			}
		},

    _setLegend(data) {
      let me = this;
      data.forEach((_item, idx) => {
        _item.legend = me.legendDispVal[idx];
      });
    },

    attached() {
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
    }
  });
})();
