import { Breadcrumbs } from "@/components/breadcrumbs";
import { db } from "@repo/database";

export default async function Page({ params }: { params: any }) {
    const { id } = await params;
    // get daily trip info
    // get general ride info
    // check if status is ongoing and show live map
    return (
        <div>
            <Breadcrumbs
                items={[
                    {
                        href: "/rides",
                        label: "Rides",
                    },
                    {
                        href: `/rides/trip/${id}`,
                        label: "Trip",
                    },
                ]}
            />
        </div>
    );
}
