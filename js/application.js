/*jshint esversion: 6 */

let rigidityDistance = [];

d3.json("data/1KJ5.json", (data) => {
  data.mutations.forEach((d) => {
    rigidityDistance.push(d.mutants.map((m) => {
      if (m.mutantAcid === d.aminoAcidLetterCode) {
        return NaN;
      }
      return m.rigidityDistance;
    }));
  });

  console.log(rigidityDistance);
});
