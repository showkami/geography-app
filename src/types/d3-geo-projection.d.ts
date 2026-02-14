declare module "d3-geo-projection" {
  import { GeoProjection } from "d3-geo";

  export function geoRobinson(): GeoProjection;
  export function geoMollweide(): GeoProjection;
  export function geoSinusoidal(): GeoProjection;
  export function geoAitoff(): GeoProjection;
  export function geoWinkel3(): GeoProjection;
  export function geoMiller(): GeoProjection;
  export function geoNaturalEarth2(): GeoProjection;
  export function geoHammer(): GeoProjection;
  export function geoBromley(): GeoProjection;
  export function geoFahey(): GeoProjection;
  export function geoEckert4(): GeoProjection;
  export function geoCylindricalStereographic(): GeoProjection;
  export function geoAugust(): GeoProjection;
}
