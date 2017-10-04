(function() {
  Polymer({

    is: 'og-production-chart', 

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
      * The Actual value to be displayed in the legend
      *
      * @property actualDispVal
      */
			actualDispVal: {
				type: Number
			},
			/**
      * The Target value to be displayed in the legend
      *
      * @property targetDispVal
      */
			targetDispVal: {
				type: Number
			},
			/**
      * The Design value to be displayed in the legend
      *
      * @property designDispVal
      */
			designDispVal: {
				type: Number
			},
			/**
			* This property is an Array of tab data.
			Member of each tab data looks like this
			`{"date":"25-Apr-17","actual":"11960","target":"12950","design":"13960"}`
      *
      * @property counterValue
      */
			data: {
				type: Array,
				value() {
					return []
				}
			},
			selected: {
				type: Number,
				value: 0
			}
		}
  });
})();
