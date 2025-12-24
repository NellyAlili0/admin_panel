"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/SmartCardTable";
import { AddTagForm, EditTagForm, DeleteTagButton } from "./forms";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTags } from "./actions";
import { Badge } from "@/components/ui/badge";

export default function TagsClient() {
  const [activeTab, setActiveTab] = useState("dependant");
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    // Fetch tags via Server Action
    const data = await fetchTags(activeTab);
    setTags(data);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = ["name", "description", "actions"];

  const tableData = tags.map((tag) => ({
    ...tag,
    entity: <Badge variant="outline">{tag.entity || activeTab}</Badge>,
    actions: (
      <div className="flex items-center gap-1">
        <EditTagForm tag={tag} onSuccess={loadData} />
        <DeleteTagButton
          tagId={tag.id}
          tagName={tag.name}
          onDelete={loadData}
        />
      </div>
    ),
  }));

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-5">
      <div className="text-center mb-6">
        <Breadcrumbs items={[{ href: "/tags", label: "Tags Management" }]} />
      </div>

      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage categories for Students, Parents, and Zones.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <AddTagForm onTagAdded={loadData} defaultEntity={activeTab} />
          </div>
        </div>

        <Tabs
          defaultValue="dependant"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
            <TabsTrigger value="dependant">Students</TabsTrigger>
            <TabsTrigger value="account">Parents</TabsTrigger>
            <TabsTrigger value="zone">Zones</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {loading ? (
              <div className="w-full h-40 flex items-center justify-center border rounded-lg bg-gray-50">
                <p className="text-gray-500 animate-pulse">
                  Loading {activeTab} tags...
                </p>
              </div>
            ) : (
              <GenTable
                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tags`}
                cols={columns}
                data={tableData}
                baseLink=""
                uniqueKey="id"
              />
            )}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
