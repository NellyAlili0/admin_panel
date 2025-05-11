export default async function Page({params, searchParams}: {params: any, searchParams: any}) {
    // get trip id, kind and user email from searchParams
    const { id, kind, email } = await searchParams;
    if (!id || !kind || !email) {
        return (
            <div>
                <p>Invalid trip id, kind or email</p>
            </div>
        );
    }
    if (kind !== "Parent" && kind !== "Driver") {
        return (
            <div>
                <p>Invalid kind</p>
            </div>
        );
    }
    if (kind === "Parent") {
        // show route   
    }
    else if (kind === "Driver") {
        // show live location
        // show locations of other students on path not yet picked up
    }
    return (
        <div></div>
    );
}