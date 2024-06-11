function ClimateChange() {
  // Name for the visualisation to appear in the menu bar.
  this.name = "Climate Change";

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = "climate-change";

  // Names for each axis.
  this.xAxisLabel = "year";
  this.yAxisLabel = "℃";

  // Title to display above the plot.
  this.title = "Climate Change Data, hover on the points for data";

  // Load number of controls user has on the data
  this.labelArray = ["Zoom into 2017", "Zoom into 1880"];

  // Has Data breakdown or not
  this.dataBreakdown = true;

  // Create a variable so that only one point can be hovered at a time
  this.details = ["Hover on Points to get Breakdown of data"];

  // Private variables
  // Create the margin gap for data visualisation
  var marginSize = 35;

  // declare private methods
  var self = this;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - operation.height - marginSize * 2,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: false,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 8,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "./data/surface-temperature/surface-temperature.csv",
      "csv",
      "header",
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    // Font defaults.
    textSize(16);
    textAlign("center", "center");

    // Set min and max years: assumes data is sorted by year.
    this.minYear = this.data.getNum(0, "year");
    this.maxYear = this.data.getNum(this.data.getRowCount() - 1, "year");

    // Find min and max temperature for mapping to canvas height.
    this.minTemperature = min(this.data.getColumn("temperature"));
    this.maxTemperature = max(this.data.getColumn("temperature"));

    // Find mean temperature to plot average marker.
    this.meanTemperature = mean(this.data.getColumn("temperature"));

    // Count the number of frames drawn since the visualisation
    // started so that we can animate the plot.
    this.frameCount = 0;

    self.operationControl(this.minYear, this.maxYear);
  };

  this.destroy = function () {
    this.startSlider.remove();
    this.endSlider.remove();
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    // Draw control labels
    operation.listControlLabel(this.labelArray);

    // Display points hovered
    operation.listDisplayData(this.details);
    // reset textsize
    textSize(16);

    // Prevent slider ranges overlapping.
    if (this.startSlider.value() >= this.endSlider.value()) {
      this.startSlider.value(this.endSlider.value() - 1);
    }
    this.startYear = this.startSlider.value();
    this.endYear = this.endSlider.value();

    // Draw all y-axis tick labels.
    drawYAxisTickLabels(
      this.minTemperature,
      this.maxTemperature,
      this.layout,
      this.mapTemperatureToHeight.bind(this),
      1
    );

    // Draw the title above the plot.
    this.drawTitle();

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    // Plot average line.
    stroke(200);
    strokeWeight(1);
    line(
      this.layout.leftMargin,
      this.mapTemperatureToHeight(this.meanTemperature),
      this.layout.rightMargin,
      this.mapTemperatureToHeight(this.meanTemperature)
    );

    // Plot all temperatures between startYear and endYear using the
    // width of the canvas minus margins.
    var previous;
    var numYears = this.endYear - this.startYear;
    var segmentWidth = this.layout.plotWidth() / numYears;

    // Count the number of years plotted each frame to create
    // animation effect.
    var yearCount = 0;

    // Loop over all rows but only plot those in range.
    for (var i = 0; i < this.data.getRowCount(); i++) {
      // Create an object to store data for the current year.
      var current = {
        // Convert strings to numbers.
        year: this.data.getNum(i, "year"),
        temperature: this.data.getNum(i, "temperature"),
      };

      if (
        previous != null &&
        current.year > this.startYear &&
        current.year <= this.endYear
      ) {
        // Draw background gradient to represent colour temperature of
        // the current year.
        noStroke();
        fill(this.mapTemperatureToColour(current.temperature));
        rect(
          this.mapYearToWidth(previous.year),
          this.layout.topMargin,
          segmentWidth,
          this.layout.plotHeight()
        );

        // Draw line segment connecting previous year to current
        // year temperature.
        stroke(0);
        line(
          this.mapYearToWidth(previous.year),
          this.mapTemperatureToHeight(previous.temperature),
          this.mapYearToWidth(current.year),
          this.mapTemperatureToHeight(current.temperature)
        );

        // my own extension
        self.temperaturePoints(previous, current);

        // The number of x-axis labels to skip so that only
        // numXTickLabels are drawn.
        var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        // Draw the tick label marking the start of the previous year.
        if (yearCount % xLabelSkip == 0) {
          drawXAxisTickLabel(
            previous.year,
            this.layout,
            this.mapYearToWidth.bind(this),
            true
          );
        }

        // When six or fewer years are displayed also draw the final
        // year x tick label.
        if (numYears <= 6 && yearCount == numYears - 1) {
          drawXAxisTickLabel(
            current.year,
            this.layout,
            this.mapYearToWidth.bind(this),
            true
          );
        }

        yearCount++;
      }

      // Stop drawing this frame when the number of years drawn is
      // equal to the frame count. This creates the animated effect
      // over successive frames.
      if (yearCount >= this.frameCount) {
        break;
      }

      // Assign current year to previous year so that it is available
      // during the next iteration of this loop to give us the start
      // position of the next line segment.
      previous = current;
    }

    // Count the number of frames since this visualisation
    // started. This is used in creating the animation effect and to
    // stop the main p5 draw loop when all years have been drawn.
    this.frameCount++;

    // Stop animation when all years have been drawn.
    if (this.frameCount >= numYears) {
      //noLoop();
    }
  };

  this.mapYearToWidth = function (value) {
    return map(
      value,
      this.startYear,
      this.endYear,
      this.layout.leftMargin, // Draw left-to-right from margin.
      this.layout.rightMargin
    );
  };

  this.mapTemperatureToHeight = function (value) {
    return map(
      value,
      this.minTemperature,
      this.maxTemperature,
      this.layout.bottomMargin, // Lower temperature at bottom.
      this.layout.topMargin
    ); // Higher temperature at top.
  };

  this.mapTemperatureToColour = function (value) {
    var red = map(value, this.minTemperature, this.maxTemperature, 0, 255);
    var blue = 255 - red;
    return color(red, 0, blue, 100);
  };

  this.drawTitle = function () {
    fill(0);
    noStroke();
    textAlign("center", "center");

    text(
      this.title,
      this.layout.plotWidth() / 2 + this.layout.leftMargin,
      this.layout.topMargin - 20
    );
  };

  // Private Method, design and display the points of the graph
  self.temperaturePoints = function (previous, current) {
    var pointSize =
      map(this.startSlider.value(), 1880, 2017, 14, 21) -
      map(this.endSlider.value(), 1880, 2017, 0, 7);

    // Draw the Points on the line
    fill(255);
    ellipse(
      this.mapYearToWidth(previous.year),
      this.mapTemperatureToHeight(previous.temperature),
      pointSize,
      pointSize
    );

    // Hovering conditons and design
    self.temperaturePointsHovered(pointSize, current, previous);
  };

  // Private Method, When the temperature points is hovered, display text on to the middle of the canvas
  self.temperaturePointsHovered = function (size, current, previous) {
    // Distance between the mouse coords and the point coords
    var distance = dist(
      mouseX,
      mouseY,
      this.mapYearToWidth(previous.year),
      this.mapTemperatureToHeight(previous.temperature)
    );

    // When conditions are met, draw the value on the canvas
    if (distance < size / 2) {
      // Change Cursor type of mouse
      cursor(HAND);
      // Display values on canvas
      this.details = [
        `${current.temperature} degree celsius`,
        `During ${current.year}`,
      ];
    }
  };

  // Control panel label and controls
  // Display the operation controls on the graph for users
  self.operationControl = function (min, max) {
    // Create sliders to control start and end years. Default to
    // visualise full range.
    this.startSlider = createSlider(min, max - 1, min, 1);
    this.startSlider.position(
      450 + operation.control_x_axis,
      operation.labelHeight[0]
    );

    this.endSlider = createSlider(min + 1, max, max, 1);
    this.endSlider.position(
      450 + operation.control_x_axis,
      operation.labelHeight[1]
    );
  };
}
