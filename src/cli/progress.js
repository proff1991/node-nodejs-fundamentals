const progress = () => {
  var args = process.argv;

  var duration = 5000;
  var interval = 100;
  var length = 30;
  var color = null;

  for (var i = 0; i < args.length; ++i) {
    if (args[i] === "--duration" && args[i + 1]) {
      duration = Number(args[i + 1]);
    }

    if (args[i] === "--interval" && args[i + 1]) {
      interval = Number(args[i + 1]);
    }

    if (args[i] === "--length" && args[i + 1]) {
      length = Number(args[i + 1]);
    }

    if (args[i] === "--color" && args[i + 1]) {
      color = args[i + 1];
    }
  }

  var colorCode = null;

  if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
    var r = parseInt(color.slice(1, 3), 16);
    var g = parseInt(color.slice(3, 5), 16);
    var b = parseInt(color.slice(5, 7), 16);

    colorCode = "\x1b[38;2;" + r + ";" + g + ";" + b + "m";
  }

  var start = Date.now();

  var timer = setInterval(function () {
    var elapsed = Date.now() - start;

    var percent = Math.min(elapsed / duration, 1);
    var filled = Math.round(length * percent);
    var empty = length - filled;

    var filledBar = "█".repeat(filled);
    var emptyBar = " ".repeat(empty);

    if (colorCode) {
      filledBar = colorCode + filledBar + "\x1b[0m";
    }

    var bar = "[" + filledBar + emptyBar + "] " + Math.round(percent * 100) + "%";

    process.stdout.write("\r" + bar);

    if (percent >= 1) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();