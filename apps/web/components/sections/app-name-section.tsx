"use client"

import { VideoText } from "@/components/ui/video-text"

export default function AppNameSection() {
  return (
    <section className="w-full pt-12 sm:pt-16 md:pt-20 pb-0">
      <div className="w-full">
        <div className="relative h-[300px] max-h-[300px] w-full overflow-hidden">
          <VideoText
            src="/ocean-small.webm"
            className="w-full h-full"
            fontSize={20}
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            OPERONE
          </VideoText>
        </div>
      </div>
    </section>
  )
}
