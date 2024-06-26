import Coord from "../vo/Coord";

export default class DistanceCalculator {

	private static PRICE_PER_KM = 2.1;

    static calculateDistance (from: Coord, to: Coord) {
		const earthRadius = 6371;
		const degreesToRadians = Math.PI / 180;
		const deltaLat = (to.getLat() - from.getLat()) * degreesToRadians;
		const deltaLon = (to.getLong() - from.getLong()) * degreesToRadians;
		const a =
			Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(from.getLat() * degreesToRadians) *
			Math.cos(to.getLat() * degreesToRadians) *
			Math.sin(deltaLon / 2) *
			Math.sin(deltaLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return Math.round(earthRadius * c);
	}

	static getPricePerKm() {
		return this.PRICE_PER_KM;
	}

}