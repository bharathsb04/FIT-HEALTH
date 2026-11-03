import React from 'react';
import { LiveStreetGymMap } from './LiveStreetGymMap';

/**
 * StaticGymMap is now backed by the full real-world Leaflet street map engine
 * with live GPS tracking, OSM/Carto/Esri tiles, and dynamic location markers.
 */
export const StaticGymMap = (props) => {
  return <LiveStreetGymMap {...props} />;
};

export default StaticGymMap;
