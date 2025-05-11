export default async function Page({ params }: { params: any }) {
    const { ride_id } = await params;
    return (
        <main className="flex-1 p-6 md:p-8 pt-6">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                    Ride {ride_id}
                </h2>
            </div>
        </main>
    );
}