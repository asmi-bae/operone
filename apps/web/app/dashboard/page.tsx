import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2 } from "lucide-react"
import Image from "next/image"

export default async function DashboardPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    const user = session.user
    const userInitial = user?.name?.charAt(0) || "U"

    return (
        <div className="space-y-4 px-2 sm:px-0">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">Profile</h1>
                <p className="text-muted-foreground text-sm">Manage your profile information</p>
            </div>
            
            <Card className='border-none'>
                <CardContent className="w-full border-t border-b px-2 sm:px-0 py-6">
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        <div className="flex-1">
                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <Input
                                        type="text"
                                        defaultValue={user?.name || ""}
                                        className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your name may appear around GitHub where you contribute or are mentioned.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Public email</label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            type="email"
                                            defaultValue={user?.email || ""}
                                            className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                        />
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                            Remove
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        You can manage verified email addresses in your{" "}
                                        <a href="#" className="text-blue-500 hover:underline">
                                            email settings
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Bio</label>
                                    <textarea
                                        defaultValue="Whatever you like for yourself"
                                        className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        You can @mention other users and organizations to link to them.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Pronouns</label>
                                        <Select defaultValue="he/him">
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="he/him">he/him</SelectItem>
                                                <SelectItem value="she/her">she/her</SelectItem>
                                                <SelectItem value="they/them">they/them</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">URL</label>
                                        <Input
                                            type="url"
                                            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-3">Social accounts</label>
                                    <div className="space-y-2">
                                        <Input
                                            type="url"
                                            placeholder="https://www.facebook.com/the-shoaik2"
                                            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                        />
                                        <Input
                                            type="url"
                                            placeholder="https://www.instagram.com/the-shoaik2"
                                            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-80 xl:w-96">
                            <div className="flex flex-col items-center space-y-4">
                                {user?.image ? (
                                    <div className="relative">
                                        <Image
                                            src={user.image}
                                            alt={user.name || "Profile"}
                                            width={160}
                                            height={160}
                                            className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full border-2 shadow-md object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center shadow-md">
                                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                                            {userInitial}
                                        </span>
                                    </div>
                                )}
                                <Button variant="outline" size="sm" className="gap-2 bg-transparent w-full sm:w-auto">
                                    <Edit2 size={16} />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
