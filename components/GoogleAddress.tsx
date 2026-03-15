import React, { useEffect, useState } from 'react';



interface FindGoogleProps {
  lat: number | string;
  long: number | string;
}

const FindGoogle: React.FC<FindGoogleProps> = ({ lat, long }) => {
  const [location, setLocation] = useState<string>('Loading location...');

  useEffect(() => {
    if (!lat || !long) return;

    const fetchLocationData = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY2;
    const cacheKey = `loc_${lat}_${long}`;
      
    //   // 1. Check Cache
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setLocation(cachedData);
        return;
      }

      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}&language=en&region=ph`;
        const geoRes = await fetch(url);
        const geoData = await geoRes.json();
        localStorage.clear();

      if (geoData.status === 'OK' && geoData.results?.length > 0) {
  const components = geoData.results[4].address_components;

  // Street Name
  const streetComponent = components.find((c: any) =>
    c.types.includes('route')
  );

  // Barangay
  const barangayComponent = components.find((c: any) =>
    c.types.includes('sublocality_level_1') ||
    c.types.includes('sublocality') ||
    c.types.includes('administrative_area_level_4') ||
    c.types.includes('administrative_area_level_5')
  );

  // Municipality
  const municipalityComponent = components.find((c: any) =>
    c.types.includes('locality') 
  );

  const street = streetComponent?.short_name?? 'not available';
  const barangay = barangayComponent?.short_name ?? 'not available';
  const municipality = municipalityComponent?.short_name ?? 'not available';

  console.log('Street:', street);
  console.log('Barangay:', barangay);
  console.log('Municipality:', municipality);

  const found = [street, barangay, municipality]
  .filter(val => val !== 'not available')
  .join(', ');

setLocation(found);
}
        else {
          setLocation('Location not found');
        }
      } catch (err) {
        console.error('Error fetching location:', err);
        setLocation('Error');
      }
    };

    fetchLocationData();
  }, [lat, long]);


//   localStorage.clear();

  return <span>{location}</span>;
};

export default FindGoogle;