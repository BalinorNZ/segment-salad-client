import React from "react";
import Map from './Map';
import FilterMenu from './FilterMenu';


const MapContainer = () => {
    return(
        <div>
          <FilterMenu />
          <Map />
        </div>
    );
};

export default MapContainer;
