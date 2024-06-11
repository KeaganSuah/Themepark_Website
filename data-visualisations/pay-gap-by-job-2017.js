function PayGapByJob2017() {
  // Name for the visualisation to appear in the menu bar.
  this.name = "Pay gap by job: 2017";

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = "pay-gap-by-job-2017";

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Graph properties.
  this.pad = 20;
  this.dotSizeMin = 15;
  this.dotSizeMax = 40;

  // Title to display above the plot.
  this.title = "Pay Gap by job 2017 quadrant chart";

  // Load number of controls user has on the data
  this.labelArray = 0;

  // Has Data breakdown or not
  this.dataBreakdown = true;

  // Create a variable so that only one point can be hovered at a time
  this.details = ["Hover on Points to get Breakdown of data"];

  // Private Variables
  // for private function
  var self = this;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "./data/pay-gap/occupation-hourly-pay-by-gender-2017.csv",
      "csv",
      "header",
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {};

  this.destroy = function () {};

  this.draw = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    // Draw the title above the plot.
    this.drawTitle();

    // Draw the axes.
    this.addAxes();

    // Display points hovered
    operation.listDisplayData(this.details);

    // Get data from the table object.
    var jobs = this.data.getColumn("job_subtype");
    var propFemale = this.data.getColumn("proportion_female");
    var payGap = this.data.getColumn("pay_gap");
    var numJobs = this.data.getColumn("num_jobs");

    // Convert numerical data from strings to numbers.
    propFemale = stringsToNumbers(propFemale);
    payGap = stringsToNumbers(payGap);
    numJobs = stringsToNumbers(numJobs);

    // Set ranges for axes.
    //
    // Use full 100% for x-axis (proportion of women in roles).
    var propFemaleMin = 0;
    var propFemaleMax = 100;

    // For y-axis (pay gap) use a symmetrical axis equal to the
    // largest gap direction so that equal pay (0% pay gap) is in the
    // centre of the canvas. Above the line means men are paid
    // more. Below the line means women are paid more.
    var payGapMin = -20;
    var payGapMax = 20;

    // Find smallest and largest numbers of people across all
    // categories to scale the size of the dots.
    var numJobsMin = min(numJobs);
    var numJobsMax = max(numJobs);

    fill(255);
    stroke(0);
    strokeWeight(1);

    for (i = 0; i < this.data.getRowCount(); i++) {
      // Set the colour for each points for the intensity to see how far it is from the center
      self.colourIntensifier(
        payGap[i],
        propFemale[i],
        propFemaleMin,
        propFemaleMax,
        payGapMax
      );

      ellipse(
        map(
          propFemale[i],
          propFemaleMin,
          propFemaleMax,
          this.pad,
          width - this.pad
        ),
        map(
          payGap[i],
          payGapMin,
          payGapMax,
          height - operation.height - this.pad,
          this.pad
        ),
        map(
          numJobs[i],
          numJobsMin,
          numJobsMax,
          this.dotSizeMin,
          this.dotSizeMax
        )
      );

      // When points hovered, show breakdown details
      self.pointHover(
        propFemale[i],
        propFemaleMin,
        propFemaleMax,
        payGap[i],
        payGapMin,
        payGapMax,
        numJobs[i],
        numJobsMin,
        numJobsMax,
        jobs[i]
      );
    }
  };

  this.addAxes = function () {
    // Add Quadrant boxes to distinguish the quadrants
    noStroke();
    // Top-Left Quadrant
    fill(0, 0, 255, 50);
    rect(
      this.pad,
      this.pad,
      width / 2 - this.pad,
      (height - operation.height) / 2 - this.pad
    );
    // Top-Right Quadrant
    fill(128, 0, 128, 50);
    rect(
      width / 2,
      this.pad,
      width / 2 - this.pad,
      (height - operation.height) / 2 - this.pad
    );
    // Bottom-Left Quadrant
    fill(255, 165, 0, 50);
    rect(
      this.pad,
      (height - operation.height) / 2,
      width / 2 - this.pad,
      (height - operation.height) / 2 - this.pad - 20
    );
    // Bottom-Left Quadrant
    fill(255, 192, 203, 50);
    rect(
      width / 2,
      (height - operation.height) / 2,
      width / 2 - this.pad,
      (height - operation.height) / 2 - this.pad - 20
    );

    // Add Quadrant boxes label
    textSize(25);
    textAlign("center", "center");
    // Top-Left Quadrant
    fill(0, 0, 55);
    text(
      "Male-Dominated, Higher Male Pay",
      width / 4,
      (height - operation.height) / 4
    );
    // Top-Right Quadrant
    fill(0, 0, 55);
    text(
      "Female-Dominated, Higher Male Pay",
      3 * (width / 4),
      (height - operation.height) / 4
    );
    // Bottom-Left Quadrant
    fill(0, 0, 55);
    text(
      "Male-Dominated, Higher Female Pay",
      width / 4,
      3 * ((height - operation.height) / 4)
    );
    // Bottom-Left Quadrant
    fill(0, 0, 55);
    text(
      "Female-Dominated, Higher Female Pay",
      3 * (width / 4),
      3 * ((height - operation.height) / 4)
    );

    stroke(100);
    strokeWeight(2);

    // Add vertical line.
    line(
      width / 2,
      0 + this.pad,
      width / 2,
      height - operation.height - this.pad - 20
    );

    // Add horizontal line.
    line(
      0 + this.pad,
      (height - operation.height) / 2,
      width - this.pad,
      (height - operation.height) / 2
    );
  };

  this.drawTitle = function () {
    fill(0);
    noStroke();
    textAlign("center", "center");

    textSize(16);
    text(this.title, width / 2, 10);
  };

  // Private function, to set the intensity of points to see how far it is from center
  self.colourIntensifier = function (
    payGap,
    propFemale,
    propFemaleMin,
    propFemaleMax,
    payGapMax
  ) {
    // Check the distance between pay gap to the center
    var distanceAveragePay = abs(payGap);
    // Check the distance between percentage of female to the center
    var distanceAverageProp = abs(
      (propFemaleMin + propFemaleMax) / 2 - propFemale
    );
    // Change the pay gap colour intensity
    var colourIntensityPay = map(distanceAveragePay, 0, payGapMax, 0, 255 / 2);
    // Change the percentage of female colour intensity
    var colourIntensityProp = map(
      distanceAverageProp,
      0,
      propFemaleMax / 2,
      0,
      255 / 2
    );

    // For points further away from the center, the more intense the redness will be
    return fill(
      255,
      255 - (colourIntensityPay + colourIntensityProp),
      255 - (colourIntensityPay + colourIntensityProp)
    );
  };

  // Private function, when points is hovered, display the breakdown details of the points by showing the percentage of female, pay gap and industry of the point
  self.pointHover = function (
    propFemale,
    propFemaleMin,
    propFemaleMax,
    payGap,
    payGapMin,
    payGapMax,
    numJobs,
    numJobsMin,
    numJobsMax,
    jobs
  ) {
    // Get distance from mouse axis to the points axis
    distance = dist(
      mouseX,
      mouseY,
      map(propFemale, propFemaleMin, propFemaleMax, this.pad, width - this.pad),
      map(
        payGap,
        payGapMin,
        payGapMax,
        height - operation.height - this.pad,
        this.pad
      )
    );

    // when mouse is on the points, it passes the condition
    if (
      distance <
      map(numJobs, numJobsMin, numJobsMax, this.dotSizeMin, this.dotSizeMax) / 2
    ) {
      // Change mouse cursor type
      cursor(HAND);
      // Display Industry and values
      this.details = [
        `${propFemale.toFixed(2)}% females`,
        `${jobs}`,
        `Pay gap of ${payGap.toFixed(2)}`,
      ];
    }
  };
}
