export const getAddressFromCoordinates = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    if (data.display_name) {
      return data.display_name;
    }
  } catch (error) {
    console.error("Error getting address:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};
