import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <div className="bg-card mb-8 rounded-lg p-6 shadow-xs">
                    <div className="mb-4 flex items-start justify-between">
                        <div className="w-full">
                            <Skeleton className="mb-2 h-8 w-64" />
                            <Skeleton className="mb-4 h-4 w-full max-w-lg" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-full">
                                <Skeleton className="aspect-4/3 w-full rounded-t-lg" />
                                <div className="space-y-3 p-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex gap-4">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
