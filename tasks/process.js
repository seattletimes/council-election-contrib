module.exports = function(grunt) {

  grunt.registerTask("process", function() {

    grunt.task.requires("state");
    grunt.task.requires("csv");
    grunt.task.requires("json");
   
    var candidates = {};
    var zips = require("../src/js/zipcodes");

    /*
    First we sort all the records into campaigns.
    */

    grunt.data.csv.contribs.forEach(function(row) {
      var campaign = row.strOrderName;
      if (!candidates[campaign]) {
        candidates[campaign] = [];
      }
      var dateParts = row.strTransactionDate.split("/");
      var date = dateParts.length == 3 ? new Date(dateParts[2], dateParts[0] - 1, dateParts[1]) : null;
      var data = {
        amount: row.moneyAmount,
        date: date,
        inSeattle: zips.indexOf(row.strZip * 1) > -1,
        name: row.strTransactorName,
        district: row.intCodedDistrict_SEEC > 9 ? "" : row.intCodedDistrict_SEEC
      }
      candidates[campaign].push(data);
    });

    /*
    Now let's create counts and totals for each candidate.
    This includes totals by date.
    The browser gets this by default.
    */

    var aggregated = {};
    for (var campaign in candidates) {
      var c = candidates[campaign];
      c.sort(function(a, b) { return a.date - b.date });
      var agg = {
        name: campaign,
        total: 0,
        count: c.length,
        byDistrict: {
          none: 0
        },
        seattle: 0,
        byDate: {}
      };
      for (var i = 1; i < 10; i++) agg.byDistrict[i] = 0;
      c.forEach(function(contrib) {
        //prevent FP errors
        var a = contrib.amount * 100;
        agg.total += a;
        if (contrib.date) {
          var date = [contrib.date.getMonth() + 1, contrib.date.getDate()].join("/");
          if (!agg.byDate[date]) agg.byDate[date] = 0;
          agg.byDate[date] += a;
        }
        agg.byDistrict[contrib.district || "none"] += a;
        if (contrib.inSeattle) agg.seattle += a;
      });
      //scale back down to cents
      agg.total /= 100;
      agg.seattle /= 100;
      for (var key in agg.byDate) agg.byDate[key] /= 100;
      for (var key in agg.byDistrict) agg.byDistrict[key] /= 100;
      aggregated[campaign] = agg;
    }

    grunt.file.write("./data/byCandidate.json", JSON.stringify(aggregated, null, 2));

    /*
    Finally, aggregate candidates by race for the page.
    */

    var races = {};
    for (var district in grunt.data.json.races) {
      var candidates = grunt.data.json.races[district];
      candidates = candidates.map(function(candidate) { return aggregated[candidate] });
      var race = {
        district: district,
        candidates: candidates,
        total: candidates.reduce(function(prev, d) { console.log(d.name); return prev + d.total }, 0),
        count: candidates.reduce(function(prev, d) { return prev + d.count }, 0),
        external: candidates.reduce(function(prev, d) { return prev + (d.total - d.byDistrict[district]) }, 0)
      };
      var byDate = {};
      candidates.forEach(function(c) {
        for (var d in c.byDate) {
          if (!byDate[d]) byDate[d] = 0;
          byDate[d] += c.byDate[d];
        }
      });
      race.byDate = byDate;
      races[district] = race;
    }

    grunt.file.write("./data/aggregated.json", JSON.stringify(races, null, 2));

  });

};