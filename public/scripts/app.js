// Client facing scripts here




const initMap = function(lat, lng, mapId) {
  const zoom = 10;
  const lat_long_Ottawa = { lat: lat, lng: lng };
  // const lat_long_Toronto = { lat: 43.65107, lng: -79.347015 };
  // const lat_long_Casablanca = { lat: 33.589886, lng: -7.603869 };

  const coordsOttawa = {
    zoom: zoom,
    center: lat_long_Ottawa,
  };
  const map = new google.maps.Map(
    document.getElementById(mapId),
    coordsOttawa
  );

  // const coordsToronto = {
  //   zoom: zoom,
  //   center: lat_long_Toronto,
  // };
  // const map2 = new google.maps.Map(
  //   document.getElementById("map2"),
  //   coordsToronto
  // );

  // const coordsCasablanca = {
  //   zoom: zoom,
  //   center: lat_long_Casablanca,
  // };
  // const map3 = new google.maps.Map(
  //   document.getElementById("map3"),
  //   coordsCasablanca
  // );

  const addMarker = (coords, map) => {
    const marker = new google.maps.Marker({
      position: coords,
      map: map,
    });
  };

  addMarker(lat_long_Ottawa, map);
  // addMarker(lat_long_Toronto, map2);
  // addMarker(lat_long_Casablanca, map3);
};
