'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarCircles } from '@/components/ui/avatar-circles'

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

