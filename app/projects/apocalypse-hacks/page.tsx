import ClientHome from '@/components/client-home'
import { getClientHomeData } from '@/lib/home-data'

export default async function ApocalypseHacksPage() {
  const data = await getClientHomeData()

  return (
    <ClientHome
      {...data}
      initialSection="projects"
      initialProject="apocalypse-hacks"
    />
  )
}

export function generateMetadata() {
  return {
    title: 'Apocalypse Hacks - Canada\'s Largest High School Hackathon',
    description: 'A 36-hour hackathon bringing together 150+ high schoolers to build amazing projects in Toronto.',
    keywords: ['Hackathon', 'Community', 'High School', 'Toronto', 'Hack Club'],
  }
}
