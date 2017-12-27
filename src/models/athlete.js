import { types } from "mobx-state-tree";


const Athlete = types.model({
  athlete_id: types.string,
  athlete_name: types.string,
  athlete_profile: types.string,
  effort_id: types.string
});
export default Athlete;