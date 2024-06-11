function NutrientsTimeSeries() {
  // To initial private variables or functions
  var self = this;
  // Add global variables

  // Name for the visualisation to appear in the menu bar.
  this.name = "Nutrients: 1974-2016";

  // Each visualisation must have a unique ID with no special characters.
  this.id = "nutrients-timeseries";

  // Title to display above the plot.
  this.title = "Nutrients: 1974-2016.";

  //Names for each axis
  this.xAxisLabel = "year";
  this.yAxisLabel = "%";

  // Colour list of each nutrient line
  this.colors = [];

  // Create a variable so that only one point can be hovered at a time
  this.details = ["Nutrient", "year", "percentage"];

  // Private variables
  // to set the margin size for the plot
  var marginSize = 35;

  // Legend status if click or unclick
  var legendButton = false;

  // Load number of controls user has on the data
  this.labelArray = ["Select Nutrient", "Zoom into 2017", "Zoom into 1880"];

  // Has Data breakdown or not
  this.dataBreakdown = true;

  // Layout object to store all common plot layout parameters and methods.
  this.layout = {
    marginSize: marginSize,
    // Locations of margin positions. Left and bottom have double margin // size due to axis and tick labels.
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
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on // top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "./data/food/nutrients74-16.csv",
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
    // Set min and max years: assumes data is sorted by date.
    this.startYear = Number(this.data.columns[1]);
    this.endYear = Number(this.data.columns[this.data.columns.length - 1]);

    for (var i = 0; i < this.data.getRowCount(); i++) {
      this.colors.push(color(random(0, 200), random(0, 200), random(0, 200)));
    }

    // Set the min and max percentage,
    //do a dynamic find min and max in the data source
    this.minPercentage = 80;
    this.maxPercentage = 400;

    // Display filter selection button
    self.operationControl();

    // Display Legend button
    self.createLegendButton();
  };

  this.destroy = function () {
    this.filterNutrient.remove();
    this.button.remove();
    this.startSlider.remove();
    this.endSlider.remove();
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    // Prevent slider ranges overlapping.
    if (this.startSlider.value() >= this.endSlider.value() - 10) {
      this.startSlider.value(this.endSlider.value() - 11);
    }
    // Get the value from user to see what are the year range user want to see, similar to climate-change visualisation
    this.startYearValue = this.startSlider.value();
    this.endYearValue = this.endSlider.value();

    // Display points hovered
    operation.listDisplayData(
      this.details,
      typeof this.details !== "undefined"
    );

    // Draw the title above the plot.
    this.drawTitle();

    // Draw control labels
    operation.listControlLabel(this.labelArray, this.labelArray);

    // Draw all y-axis labels.
    drawYAxisTickLabels(
      this.minPercentage,
      this.maxPercentage,
      this.layout,
      this.mapNutrientsToHeight.bind(this),
      0
    );

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    // Plot all pay gaps between startYear and endYear using the width
    // of the canvas minus margins.
    var numYears = this.endYearValue - this.startYearValue;

    // Loop over all rows and draw a line from the previous value to // the current.
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var previous = null;
      var title = row.getString(0);

      for (var j = 1; j < numYears; j++) {
        // Create an object to store data for the current year.
        var current = {
          // Convert strings to numbers.
          year: this.startYearValue + j - 1,
          percentage: row.getNum(j + (this.startYearValue - this.startYear)),
        };

        if (previous != null) {
          if (
            this.filterNutrient.value() == title ||
            this.filterNutrient.value() == "All"
          ) {
            // Draw line segment connecting previous year to current
            // year pay gap.
            stroke(this.colors[i]);
            line(
              this.mapYearToWidth(previous.year),
              this.mapNutrientsToHeight(previous.percentage),
              this.mapYearToWidth(current.year),
              this.mapNutrientsToHeight(current.percentage)
            );

            // Points on line graph that can be hovered
            self.pointHover(current, title);
          }

          // The number of x-axis labels to skip so that only
          // numXTickLabels are drawn.
          var xLabelSkip = this.data.rows.length;

          // Draw the tick label marking the start of the previous year.
          if (i % xLabelSkip == 0) {
            // variable to determine if the variable has to be displayed or not
            var displayLabel = true;
            if (
              previous.year == this.endYearValue - 3 ||
              previous.year % 5 == 0
            ) {
              displayLabel = true;
            } else {
              displayLabel = false;
            }
            // Create vertical grid line, label at the bottom depends on the value of displayLabel variable
            drawXAxisTickLabel(
              previous.year,
              this.layout,
              this.mapYearToWidth.bind(this),
              displayLabel
            );
          }
        } else {
          if (
            this.filterNutrient.value() == title ||
            this.filterNutrient.value() == "All"
          ) {
            noStroke();
            // draw nutrients legend table
            this.makeLegendItem(title, i, this.colors[i], legendButton);

            //draw the nutrients label
            fill(this.colors[i]);
            text(
              title,
              width - 200,
              this.mapNutrientsToHeight(row.getNum(numYears - 3) + 15)
            );
          }
        }
        // Assign current year to previous year so that it is available // during the next iteration of this loop to give us the start // position of the next line segment.
        previous = current;
      }
    }
  };

  this.drawTitle = function () {
    fill(0);
    noStroke();
    textAlign("center", "center");
    textSize(16);
    text(
      this.title,
      this.layout.plotWidth() / 2 + this.layout.leftMargin,
      this.layout.topMargin - this.layout.marginSize / 2
    );
  };

  this.mapYearToWidth = function (value) {
    return map(
      value,
      this.startYearValue,
      this.endYearValue,
      this.layout.leftMargin,
      this.layout.rightMargin
    );
  };

  this.mapNutrientsToHeight = function (value) {
    return map(
      value,
      this.minPercentage,
      this.maxPercentage,
      this.layout.bottomMargin,
      this.layout.topMargin
    );
  };

  // Addition Extension of the nutrients graph, this functions are all private functions

  // function display the legend only when the variable legendButton is true
  self.makeLegendItem = function (label, i, colour, show) {
    textAlign("left", "center");
    if (show) {
      // Private variables for the legend, showing the axis and length
      var boxWidth = 50;
      var boxHeight = 15;
      var x = 700;
      var y = 50 + (boxHeight + 2) * i;

      fill(245);
      rect(x, y, 250, 20);

      // Draw the legend box with colours
      noStroke();
      fill(colour);
      rect(x, y, boxWidth, boxHeight);

      // Display the text beside the legend box
      fill(0);
      noStroke();
      textSize(14);
      text(label, x + boxWidth + 10, y + boxHeight / 2);
      // Reset back the font size
      textSize(16);
    }
  };

  // Function is to change the variable legendButton so that is alternate when it is called
  self.legendButtonClick = function () {
    if (legendButton) {
      legendButton = false;
    } else {
      legendButton = true;
    }
  };

  // Create the button that display the legend, allowing user to open and close
  self.createLegendButton = function () {
    this.button = createButton("Show Legend");
    this.button.position(width + 130, 12);

    // Call repaint() when the button is pressed.
    this.button.mousePressed(self.legendButtonClick);
  };

  // To create the filter option button to filter the nutrients, user can pick which nutrient they would like to see
  self.makeNutrientFilter = function (x, y) {
    // Create a select DOM element.
    this.filterNutrient = createSelect();
    this.filterNutrient.position(450 + x, y);

    // Fill the options with all company names.
    var nutrients = this.data.rows;

    // Fill all first
    this.filterNutrient.option("All");

    // First entry is empty.
    for (let i = 0; i < nutrients.length; i++) {
      var nutrient = nutrients[i].getString(0);
      this.filterNutrient.option(nutrient);
    }
  };

  // Create points on line graph that can be hovered to display breakdown of data in each point
  self.pointHover = function (current, title) {
    var pointSize =
      map(this.startSlider.value(), 1974, 2016, 12, 18) -
      map(this.endSlider.value(), 1974, 2016, 0, 6);
    // Create Points on Line graph to hover on
    ellipse(
      this.mapYearToWidth(current.year),
      this.mapNutrientsToHeight(current.percentage),
      pointSize,
      pointSize
    );
    var distancePoint = dist(
      mouseX,
      mouseY,
      this.mapYearToWidth(current.year),
      this.mapNutrientsToHeight(current.percentage)
    );
    if (distancePoint < pointSize / 2) {
      cursor(HAND);
      // Display Industry and values
      this.details = [
        `Nutrient is ${title}`,
        `Percentage of ${current.percentage}%`,
        `During ${current.year}`,
      ];
    }
  };

  // Control panel label and controls
  // Display the operation controls on the graph for users
  self.operationControl = function () {
    self.makeNutrientFilter(operation.control_x_axis, operation.labelHeight[0]);

    // Create sliders to control start and end years. Default to
    // To reduce the starting range of years.
    this.startSlider = createSlider(
      this.startYear,
      this.endYear - 11,
      this.startYear,
      1
    );
    this.startSlider.position(
      450 + operation.control_x_axis,
      operation.labelHeight[1]
    );

    // To reduce the ending range of years.
    this.endSlider = createSlider(
      this.startYear + 11,
      this.endYear,
      this.endYear,
      1
    );
    this.endSlider.position(
      450 + operation.control_x_axis,
      operation.labelHeight[2]
    );
  };
}
