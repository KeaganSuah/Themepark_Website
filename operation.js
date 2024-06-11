function Operation() {
  // set the height of the operation table
  this.height = 200;
  //   set the coordinates of the operation table
  this.x = 70;
  this.y = 576;

  // Placement of label to boxs
  this.control_x_axis = this.x + 30;
  this.data_x_axis = this.x + 425;
  this.labelHeight = [this.y + 68, this.y + 113, this.y + 158];

  // Declare for private functions
  var self = this;

  //   To draw the operation table
  this.draw = function (labelArray, breakdown) {
    if (typeof labelArray !== "undefined") {
      self.controlPanel(labelArray);
    }
    self.displayData(breakdown);
  };

  //   Draw the control panel
  self.controlPanel = function (labelArray) {
    // Only draw is the label array exists
    fill(210);
    noStroke();
    rect(this.x, this.y, width / 2 - 120, this.height - 10, 10);

    fill(255);
    // Create boxes for the controls to be inside of
    for (var i = 0; i < labelArray.length; i++) {
      rect(this.x + 20, this.y + 50 + 45 * i, 140, 35);
      rect(this.x + 20 + 145, this.y + 50 + 45 * i, width / 2 - 300, 35);
    }

    self.displayTitle(
      "Control Panel",
      this.x + (width / 2 - 120) / 2,
      this.y + 30
    );
  };

  // To list out the label for all the controls
  self.listControlLabel = function (array) {
    self.controlPanel(array);
    // Draw operation label
    textAlign("left");
    textSize(16);
    fill(0);
    noStroke();
    for (var i = 0; i < array.length; i++) {
      text(array[i], operation.control_x_axis, operation.labelHeight[i]);
    }
  };

  //   Draw the data table
  self.displayData = function () {
    // Design of overall table
    fill(210);
    noStroke();
    rect(this.x + (width / 2 - 100), this.y, width / 2, this.height - 10, 10);

    // Display title on the top
    this.displayTitle(
      "Data Breakdown",
      this.x + (width / 2 - 100) + (width / 2 - 20) / 2,
      this.y + 30
    );
  };

  var nestArray = [["example", "example", "example"]];
  // To display and list out all the data in the data breakdown table
  self.listDisplayData = function (array) {
    var length = 495;
    var gridLayout = [0.4, 0.4, 0.2];
    self.displayData();

    // Display Industry and values
    textAlign("left");
    textSize(16);
    fill(0);
    noStroke();

    // Create boxes for the controls to be inside of
    for (var i = 0; i < 4; i++) {
      var previous = 0;
      for (var j = 0; j < gridLayout.length; j++) {
        if (i == 0) {
          fill(100, 100, 190);
        } else {
          fill(255);
        }
        rect(
          operation.data_x_axis + previous,
          this.y + 45 + 35 * i,
          length * gridLayout[j] - 5,
          30
        );
        previous += length * gridLayout[j];
      }
    }

    // Display text and data inside boxes
    for (var j = 0; j < nestArray.length; j++) {
      var previousText = 0;
      fill(0);
      for (var i = 0; i < nestArray[j].length; i++) {
        text(
          nestArray[j][i],
          operation.data_x_axis + previousText + 5,
          this.y + 60 + 35 * j
        );
        previousText += length * gridLayout[i];
      }
    }

    if (nestArray[nestArray.length - 1] != array) {
      nestArray.push(array);
    }
    stroke(1);
  };

  // Display title on the control panel and on data breakdown box
  self.displayTitle = function (title, x, y) {
    fill(0);
    noStroke();
    textSize(20);
    textAlign("center", "center");
    text(title, x, y);
  };
}
