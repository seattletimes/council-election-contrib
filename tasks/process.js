module.exports = function(grunt) {

  grunt.registerTask("process", function() {

    grunt.task.requires("state");
    grunt.task.requires("csv");
    grunt.task.requires("json");

    var moment = require("moment");
   
    var candidates = {};
    var zips = require("./lib/zipcodes");

    var dateCutoff = new Date(2015, 0, 1);

    var createDateHash = function() {
      var dates = {};
      var week = moment(dateCutoff).day(0);
      var now = new Date();
      while (week.isBefore(now)) {
        dates[week.valueOf()] = 0;
        week.add(7, "days");
      }
      return dates;
    };

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
        amount: row.moneyContributionsEffect_SEEC,
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
        external: 0,
        count: c.length,
        byDistrict: {
          none: 0
        },
        seattle: 0,
        byDate: createDateHash()
      };
      for (var i = 1; i < 10; i++) agg.byDistrict[i] = 0;
      c.forEach(function(contrib) {
        //prevent FP errors
        var a = contrib.amount * 100;
        agg.total += a;
        if (contrib.date && contrib.date > dateCutoff) {
          var date = moment(contrib.date);
          date.day(0);
          var timestamp = date.valueOf();
          agg.byDate[timestamp] += a;
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
      candidates = candidates.map(function(candidate) {
        var c = aggregated[candidate.short];
        if (!c) {
          return {
            name: candidate.short,
            fullName: candidate.long,
            byDistrict: {},
            byDate: createDateHash(),
            total: 0,
            seattle: 0
          }
        }
        c.fullName = candidate.long;
        return c;
      });
      var byDate = createDateHash();
      candidates.forEach(function(c) {
        for (var d in c.byDate) {
          byDate[d] += c.byDate[d];
        }
        //external is just for people outside the city
        if (false && district <= 7) {
          c.external = c.total - c.byDistrict[district] || 0;
        } else {
          c.external = c.total - c.seattle || 0;
        }
      });
      var race = {
        district: district,
        candidates: candidates,
        total: candidates.reduce(function(prev, c) { return prev + c.total }, 0),
        count: candidates.reduce(function(prev, c) { return prev + c.count }, 0),
        external: candidates.reduce(function(prev, c) { return prev + c.external }, 0),
        byDate: byDate
      };
      races[district] = race;
    }

    grunt.file.write("./data/aggregated.json", JSON.stringify(races, null, 2));

  });

};