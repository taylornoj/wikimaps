// Client facing scripts here

$(document).ready(function () {
  const initMap = function (lat, lng, mapId) {
    const zoom = 12;
    const lat_long_Ottawa = { lat: lat, lng: lng };

    const coordsOttawa = {
      zoom: zoom,
      center: lat_long_Ottawa,
    };
    const map = new google.maps.Map(
      document.getElementById(mapId),
      coordsOttawa
    );

    const addMarker = (coords, map) => {
      const marker = new google.maps.Marker({
        position: coords,
        map: map,
      });
    };

    addMarker(lat_long_Ottawa, map);
  };

  const maps = $(".map-class");

  maps.each(function (index) {
    const mapId = $(this).attr("id");
    const mapLat = $(this).attr("data-lon");
    const mapLon = $(this).attr("data-lat");
    initMap(Number(mapLat), Number(mapLon), mapId);
  });


});




