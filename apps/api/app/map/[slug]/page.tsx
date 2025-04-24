export default async function Page({ params }: { params: any }) {
    const { slug } = await params;
    const apiKey = process.env.GOOGLE_MAPS_KEY;
    const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${slug}`;
    return (
        <div className="min-h-screen min-w-screen">
            <iframe src={url} className="w-full h-screen" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
    );
}