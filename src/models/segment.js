import { types } from "mobx-state-tree";


const Segment = types
  .model({
    id: types.string,
    name: types.string,
    climb_category: types.number,
    climb_category_desc: types.maybe(types.string),
    avg_grade: types.number,
    elev_difference: types.maybe(types.number),
    distance: types.maybe(types.number),
    points: types.string,
    start_latlng: types.model({ x: types.maybe(types.number), y: types.maybe(types.number) }),//types.reference(Latlng),
    end_latlng: types.model({ x: types.maybe(types.number), y: types.maybe(types.number) }),//types.reference(Latlng),// { x: -45.8948672376573, y: 170.536957550794 },
    entry_count: types.maybe(types.number),
    modified: types.maybe(types.string),
    created: types.maybe(types.string),
    athlete_id: types.maybe(types.string),
    effort_id: types.maybe(types.string),
    activity_id: types.maybe(types.string),
    athlete_name: types.maybe(types.string),
    athlete_gender: types.maybe(types.string),
    effort_distance: types.maybe(types.number),
    elapsed_time: types.maybe(types.number),
    moving_time: types.maybe(types.number),
    start_date: types.maybe(types.string),
    start_date_local: types.maybe(types.string),
    athlete_profile: types.maybe(types.string),
    effort_modified: types.maybe(types.string),
    effort_created: types.maybe(types.string),
  })
  .views(self => ({
      get segment_id() { return self.id },
      get speed() { return self.distance/self.elapsed_time },
      get pace() {
        const speed = self.distance/self.elapsed_time;
        if(!speed) return '0:00';
        const total_seconds = 1000 / speed;
        const pace_seconds =
          (total_seconds % 60).toFixed(1) < 9.5 ? '0'+(total_seconds % 60).toFixed(0) : (total_seconds % 60).toFixed(0);
        return `${Math.floor(total_seconds/60)}:${pace_seconds}`;
      },
      get difficulty() {
        const grade = self.avg_grade * 4;
        const speed = (self.effort_distance/self.elapsed_time) * 14;
        return `${grade.toFixed(0)}/${speed.toFixed(0)}`;
        //return ((grade + speed)/2).toFixed(0);
      },
      get effort_speed() { return self.effort_distance/self.elapsed_time },
    })
  );
export default Segment;