import { useState } from "react";
import { motion } from "framer-motion";
import { DUMMY_STORES } from "../../data/dummyData";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function StoreLocatorTab({ category }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);

  const filteredStores = DUMMY_STORES.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mapCenter = [
    filteredStores.reduce((sum, s) => sum + s.lat, 0) / filteredStores.length || 23.1815,
    filteredStores.reduce((sum, s) => sum + s.lng, 0) / filteredStores.length || 72.6369,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <p className="font-display text-xl text-ink-900">🏪 Store Locator</p>
        <p className="text-sm text-ink-400 mt-1">Find nearby craft supply stores in Ahmedabad</p>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        <div className="relative flex items-center">
          <span className="absolute left-4 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search by store name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-clay-200 rounded-xl focus:outline-none focus:border-ochre-500 text-sm bg-white"
          />
        </div>
      </motion.div>

      {/* Map + List Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="rounded-xl overflow-hidden border-2 border-clay-200 shadow-xl h-96 bg-white">
            {filteredStores.length > 0 ? (
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                {/* CartoDB Positron (cleaner, darker tiles) */}
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  maxZoom={19}
                />
                
                {filteredStores.map((store, idx) => (
                  <Marker
                    key={idx}
                    position={[store.lat, store.lng]}
                    eventHandlers={{
                      click: () => setSelectedStore(idx),
                    }}
                  >
                    <Popup>
                      <div className="text-sm font-display">
                        <p className="font-bold text-ink-900">{store.name}</p>
                        <p className="text-xs text-ink-600 mt-1">{store.address}</p>
                        <p className="text-xs text-ochre-600 mt-2 font-semibold">📍 {store.distance}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-clay-50">
                <p className="text-ink-400">No stores found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Store List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3 max-h-96 overflow-y-auto pr-2"
        >
          {filteredStores.length > 0 ? (
            filteredStores.map((store, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedStore(idx)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all transform hover:scale-105 ${
                  selectedStore === idx
                    ? "border-ochre-500 bg-gradient-to-r from-ochre-50 to-amber-50 shadow-lg"
                    : "border-clay-200 bg-white hover:border-ochre-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-ochre-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-ink-900 text-sm">{store.name}</h4>
                    <p className="text-xs text-ink-600 mt-1 truncate">{store.address}</p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        {store.distance}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="text-ochre-600 hover:text-ochre-700 text-xl"
                      >
                        ☎️
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 rounded-xl border-2 border-dashed border-clay-300 bg-clay-50">
              <p className="text-ink-400 text-sm">❌ No stores found</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200"
      >
        <p className="text-sm font-semibold text-blue-900">
          ✨ Showing <span className="text-lg text-ochre-600">{filteredStores.length}</span> of <span className="text-lg text-ochre-600">{DUMMY_STORES.length}</span> stores
        </p>
      </motion.div>
    </motion.div>
  );
}