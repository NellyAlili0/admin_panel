"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/SmartCardTable";
import { AddWhitelistForm, RemoveWhitelistButton } from "./forms";
import { fetchAllWhitelists } from "./actions";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw } from "lucide-react";

export default function WhitelistClient() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllWhitelists();
    setRules(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Define Columns
  const columns = ["zone_name", "tag_name", "entity", "actions"];

  // Map Data for Table
  const tableData = rules.map((rule) => ({
    ...rule,
    zone_name: (
      <span className="font-semibold text-gray-800">{rule.zone_name}</span>
    ),
    tag_name: rule.tag_name,
    entity: (
      <Badge variant={rule.entity === "dependant" ? "default" : "secondary"}>
        {rule.entity === "dependant" ? "Student" : "Parent"}
      </Badge>
    ),
    actions: (
      <div className="flex justify-center">
        <RemoveWhitelistButton
          zoneId={rule.zone_id}
          tagId={rule.tag_id}
          description={`${rule.tag_name} from ${rule.zone_name}`}
          onSuccess={loadData}
        />
      </div>
    ),
  }));

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-5">
      <div className="text-center mb-6">
        <Breadcrumbs
          items={[{ href: "/whitelist", label: "Access Control (Whitelist)" }]}
        />
      </div>

      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Whitelist Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Define which tags (Students/Parents) are allowed to check-in to
              specific Zones.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              title="Refresh Table"
            >
              <RefreshCcw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <AddWhitelistForm onSuccess={loadData} />
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="w-full h-40 flex flex-col items-center justify-center border rounded-lg bg-gray-50 gap-2">
              <RefreshCcw className="h-8 w-8 text-[#efb100] animate-spin" />
              <p className="text-gray-500">Loading access rules...</p>
            </div>
          ) : (
            <GenTable
              title="Active Access Rules"
              cols={columns}
              data={tableData}
              baseLink=""
              uniqueKey="id"
            />
          )}

          {!loading && rules.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed mt-4">
              <p className="text-gray-500">
                No access rules found. Click &quot;Add Access Rule&quot; to
                whitelist a tag.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
