"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import {
  whitelistTag,
  removeWhitelistTag,
} from "@/app/(dashboard)/zones/actions";

interface Tag {
  id: string;
  name?: string;
  entity?: string;
}

interface Zone {
  id: string;
  name: string;
  type?: string;
  // API returns an array of Tag objects
  whitelist_tags?: Tag[];
  whitelisted_dependant_tags?: Tag[]; // Fallback
}

interface Props {
  zones: Zone[];
  studentTagId: string;
}

export default function StudentZoneManager({ zones, studentTagId }: Props) {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handleToggle = async (zone: Zone, isChecked: boolean) => {
    // Prevent locking School Zone if strictly required, though API doesn't forbid it implicitly.
    if (zone.type === "school") {
      toast.warning("School Zone cannot be locked.");
      return;
    }

    setLoadingMap((prev) => ({ ...prev, [zone.id]: true }));

    const formData = new FormData();
    formData.append("zone_id", zone.id);
    formData.append("entity", "dependant");
    formData.append("tag_uuid", studentTagId);

    try {
      if (isChecked) {
        // Unlock: Whitelist the tag
        const res = await whitelistTag(null, formData);
        if (res.success) toast.success(`Unlocked ${zone.name}`);
        else toast.error(res.message);
      } else {
        // Lock: Remove from whitelist
        const res = await removeWhitelistTag(null, formData);
        if (res.success) toast.success(`Locked ${zone.name}`);
        else toast.error(res.message);
      }
    } catch (e) {
      toast.error("Failed to update access");
      console.error(e);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [zone.id]: false }));
    }
  };

  return (
    <Card className="shadow-md rounded-2xl border border-gray-200 mt-6">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[#efb100]" />
          Zone Access Control
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            // Flatten the whitelist logic
            const tags =
              zone.whitelist_tags || zone.whitelisted_dependant_tags || [];
            // Check if student ID exists in the array of objects
            const isWhitelisted = tags.some((t) => t.id === studentTagId);
            const isSchoolZone = zone.type === "school";
            const isLoading = loadingMap[zone.id];

            return (
              <div
                key={zone.id}
                className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${isWhitelisted ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50"}`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                ) : (
                  <Checkbox
                    id={zone.id}
                    checked={isWhitelisted || isSchoolZone}
                    disabled={isSchoolZone}
                    onCheckedChange={(checked) =>
                      handleToggle(zone, checked as boolean)
                    }
                    className="data-[state=checked]:bg-[#efb100] data-[state=checked]:border-[#efb100]"
                  />
                )}
                <div
                  className="flex flex-col cursor-pointer flex-1"
                  onClick={() =>
                    !isLoading &&
                    !isSchoolZone &&
                    handleToggle(zone, !isWhitelisted)
                  }
                >
                  <label
                    htmlFor={zone.id}
                    className="text-sm font-bold text-gray-700 leading-none cursor-pointer"
                  >
                    {zone.name}
                  </label>
                  <span className="text-xs text-gray-500 mt-1">
                    {isSchoolZone
                      ? "Default (Always Open)"
                      : isWhitelisted
                        ? "Access Granted"
                        : "Access Denied"}
                  </span>
                </div>
                {isSchoolZone && (
                  <Lock className="h-4 w-4 text-gray-400 ml-auto" />
                )}
              </div>
            );
          })}
          {zones.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No zones found for this school.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
