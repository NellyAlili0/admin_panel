import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const Breadcrumbs = ({
    items
}: {
    items: {
        href: string;
        label: string;
    }[];
}) => {
    // check if index is last and add BreadcrumbPage
    return (
        <Breadcrumb>
            <BreadcrumbList className="flex items-center gap-1">
                <BreadcrumbItem>
                    <BreadcrumbLink href="/overview" className="text-primary hover:text-primary">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {items.map((item, index) => (
                    <div key={index}>
                        {index < items.length - 1 ? (
                            <div className="flex items-center">
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={item.href} className="text-primary hover:text-primary">{item.label}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </div>
                        ) : (
                            <BreadcrumbPage key={index} className="text-gray-500">{item.label}</BreadcrumbPage>
                        )}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}