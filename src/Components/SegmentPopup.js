import React from 'react';
import { Popup } from "react-mapbox-gl";


const SegmentPopup = ({coords, segment, currentAthleteEffort, updateSegmentLeaderboard}) => (
  <Popup coordinates={coords}
         anchor={'bottom'}
         offset={0}
         closeButton={true}
         closeOnClick={true}
  >
    <PopupContent segment={segment}
                  currentAthleteEffort={currentAthleteEffort}
                  updateSegmentLeaderboard={updateSegmentLeaderboard}
    />
  </Popup>
);

export default SegmentPopup;

// TODO: send current athlete effort data to popup for comparison with CR (generate percentile)
const PopupContent = ({segment, updateSegmentLeaderboard, currentAthleteEffort}) => (
  <div className="popup-content-wrapper">
    <div className="segment-info-popup segment-info-box">
      <div className="info-box-header">
        <h1>{segment.name}</h1>
        <h3>CR: <a href={`https://strava.com/athletes/${segment.athlete_id}`} target="_blank">{segment.athlete_name}</a></h3>
      </div>
      <div className="clear"></div>
      <div className="general-info">
        <div className="stat">
          <strong>{formatDistance(segment.distance)}</strong>
          <br />
          <span className="label">Distance</span>
        </div>
        <div className="stat">
          <strong>{segment.avg_grade}%</strong>
          <br />
          <span className="label">Grade</span>
        </div>
        <div className="stat">
          <strong>{segment.elev_difference} m</strong>
          <br />
          <span className="label">Elev Gain</span>
        </div>
        <div className="spacer stat">
          <strong>{convertSpeedToPace(segment.speed)}/km</strong>
          <br />
          <span className="label">Pace</span>
        </div>
        <div className="stat">
          {segment.entry_count}
          <br />
          <span className="label">Athletes</span>
        </div>
        <div className="clear"></div>
        <div className="records">
          <div className="avatar avatar-athlete avatar-md">
            <img src={segment.athlete_profile} />
          </div>
          <div className="record-stat">
            <strong>CR: </strong>
            <a href={`https://strava.com/segment_efforts/${segment.effort_id}`} target="_blank">
              {secondsToHms(segment.elapsed_time)}
            </a>
            <span> ({formatDistance(segment.effort_distance)} @ {convertSpeedToPace(segment.effort_speed)}/km)</span>
          </div>
          {currentAthleteEffort ?
            <div className="record-stat">
              <strong>PB: </strong>
              <a href={`https://strava.com/segment_efforts/${currentAthleteEffort.effort_id}`} target="_blank">
                <span className=""> {secondsToHms(currentAthleteEffort.elapsed_time)} </span>
              </a>
              <span className=".segment-PB-negative"> ({formatDistance(currentAthleteEffort.effort_distance)}
                {'\u00A0'}@ {convertSpeedToPace(currentAthleteEffort.effort_speed)}/km)</span>
            </div>
            : <div className="record-stat"><strong>PB: </strong>Segment not attempted yet.</div>}
        </div>
        <div className="clear"></div>
      </div>
      <div className="details-link explorer-performance-goals-beta">
        <a className="alt button create-goal"
           onClick={(e) => updateSegmentLeaderboard(e, segment.segment_id)}
        >
          Update
        </a>
        <a className="alt button" target="_blank" href={`https://strava.com/segments/${segment.segment_id}`}>
          View Segment
        </a>
        <div className="clear"></div>
      </div>
    </div>
  </div>
);

function formatDistance(d) {
  if(!d) return 0;
  return d < 1000 ? d.toFixed(1) + 'm' : (d/1000).toFixed(2) + 'km';
}
function secondsToHms(d) {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor(d % 3600 / 60);
  const s = Math.floor(d % 3600 % 60);
  return h > 0 ? ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2)
    : ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}
function convertSpeedToPace(speed) {
  if(!speed) return '0:00';
  const total_seconds = 1000 / speed;
  const pace_seconds =
    (total_seconds % 60).toFixed(1) < 9.5 ? '0'+(total_seconds % 60).toFixed(0) : (total_seconds % 60).toFixed(0);
  return `${Math.floor(total_seconds/60)}:${pace_seconds}`;
}