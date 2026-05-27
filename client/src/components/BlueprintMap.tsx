import { Map } from "lucide-react";

const locations = [
  { name: "Main Hall", className: "col-span-4 row-span-2" },
  { name: "Zone A", className: "col-span-2" },
  { name: "Zone B", className: "col-span-2" },
  { name: "AV Booth", className: "col-span-2" },
  { name: "Network Room", className: "col-span-2" },
  { name: "Electrical Room", className: "col-span-2" },
  { name: "Gate 1", className: "col-span-1" },
  { name: "Gate 2", className: "col-span-1" },
  { name: "Gate 3 Corridor", className: "col-span-2" },
  { name: "First Aid", className: "col-span-2" },
  { name: "Security Desk", className: "col-span-2" }
];

type BlueprintMapProps = {
  highlightedLocations: string[];
  safetyWarning?: string;
};

export function BlueprintMap({ highlightedLocations, safetyWarning }: BlueprintMapProps) {
  const warning = Boolean(safetyWarning);

  return (
    <section className="min-h-0 rounded-md border border-ops-line bg-ops-panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-ops-cyan" />
          <h2 className="text-base font-semibold text-white">Venue Blueprint Map</h2>
        </div>
        <span className="text-xs uppercase tracking-wide text-slate-400">Floor A</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {locations.map((location) => {
          const active = highlightedLocations.includes(location.name);
          const activeClass = warning
            ? "border-ops-red bg-ops-red/20 text-rose-100 shadow-[0_0_0_1px_rgba(251,113,133,.35)]"
            : "border-ops-cyan bg-ops-cyan/15 text-cyan-50 shadow-[0_0_0_1px_rgba(84,216,255,.25)]";
          return (
            <div
              key={location.name}
              className={`${location.className} flex min-h-20 items-center justify-center rounded-md border p-3 text-center text-sm font-medium transition ${
                active ? activeClass : "border-ops-line bg-ops-panel2 text-slate-300"
              }`}
            >
              {location.name}
            </div>
          );
        })}
      </div>
    </section>
  );
}
