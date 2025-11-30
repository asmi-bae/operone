'use client'

import { AvatarCircles } from '@/components/ui/avatar-circles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamMember {
    name: string
    role: string
    avatar: string
    initials: string
    profileUrl?: string
}

const teamMembers: TeamMember[] = [
    {
        name: 'MD Shoaib Khan',
        role: 'Team Lead, Backend Engineer, AI Engineer ,Full Stack Developer',
        avatar: 'https://avatars.githubusercontent.com/u/125272364?s=400&u=367cf7dc8cd214e7d00f5f24e120e2c9e6f1f133&v=4',
        initials: 'SH',
        profileUrl: 'https://github.com/the-shoaib2'
    },
    {
        name: 'Asmita Rahman',
        role: 'UI/UX Designer, Frontend Developer',
        avatar: 'https://avatars.githubusercontent.com/u/190092511?v=4',
        initials: 'AS',
        profileUrl: 'https://github.com/asmita-rahman'
    },
    {
        name: 'Emon Komar Sarker',
        role: 'Frontend Developer',
        avatar: 'https://avatars.githubusercontent.com/u/245721511?v=4',
        initials: 'TM',
        profileUrl: 'https://github.com/emon-sarker'
    }
]

// Individual component exports like shadcn UI
export { AvatarCircles, Card, CardContent, CardDescription, CardHeader, CardTitle }

interface TeamAvatarCirclesProps {
    className?: string
    title?: string
    description?: string
    showCard?: boolean
}

export function TeamAvatarCircles({ 
    className = '',
    title,
    description,
    showCard = true
}: TeamAvatarCirclesProps) {
    // Prepare avatar data for AvatarCircles component
    const avatarData = teamMembers.map(member => ({
        imageUrl: member.avatar,
        profileUrl: member.profileUrl || '#'
    }))

    const content = (
        <>
            {title && description && (
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-muted-foreground text-xs">{description}</p>
                </div>
            )}
            
            {/* Avatar Circles - Side by side team avatars */}
            <div className="flex justify-center mt-4">
                <AvatarCircles 
                    avatarUrls={avatarData}
                    numPeople={0}
                    className="hover:scale-105 transition-transform duration-200"
                />
            </div>
        </>
    )

    if (showCard) {
        return (
            <Card className={`w-full max-w-lg mx-auto ${className}`}>
                <CardContent className="p-4">
                    {content}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className={`w-full max-w-lg mx-auto ${className}`}>
            {content}
        </div>
    )
}

export default TeamAvatarCircles
