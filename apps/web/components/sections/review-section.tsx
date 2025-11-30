import { cn } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"

const reviews = [
  {
    name: "Alex Chen",
    username: "@alexchen",
    body: "Operone transformed our development workflow. The monorepo setup saved us weeks of configuration time.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexchen",
  },
  {
    name: "Sarah Williams",
    username: "@sarahw",
    body: "Best development platform I've used. The authentication system is rock-solid and the performance is incredible.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahwilliams",
  },
  {
    name: "Marcus Johnson",
    username: "@mjohnson",
    body: "The TypeScript integration is seamless. Finally, a platform that understands modern development needs.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcusjohnson",
  },
  {
    name: "Emily Rodriguez",
    username: "@emilyr",
    body: "Deploying with Operone is a breeze. Zero-downtime deployments and excellent monitoring tools.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=emilyrodriguez",
  },
  {
    name: "David Kim",
    username: "@davidkim",
    body: "The built-in CI/CD pipeline saved us thousands in DevOps costs. Highly recommend for any team.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=davidkim",
  },
  {
    name: "Lisa Thompson",
    username: "@lisat",
    body: "Outstanding developer experience. The hot reload and debugging tools are second to none.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisathompson",
  },
]

const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  )
}

export function ReviewSection() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
    </div>
  )
}
