import { types } from "mobx-state-tree";


const Club = types.model({
  id: types.number,
  resource_state: types.number,
  name: types.string,
  profile_medium: types.string,
  profile: types.string,
  cover_photo: types.maybe(types.string),
  cover_photo_small: types.maybe(types.string),
  sport_type: types.string,
  city: types.string,
  state: types.string,
  country: types.string,
  private: types.boolean,
  member_count: types.number,
  featured: types.boolean,
  verified: types.boolean,
  url: types.string
});
export default Club;