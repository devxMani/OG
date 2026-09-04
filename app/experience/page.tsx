import ClientHome from '@/components/client-home'
import { getClientHomeData } from '@/lib/home-data'

export default async function ExperiencePage() {
  const data = await getClientHomeData()

  return (
    <ClientHome
      {...data}
      initialSection="projects"
    />
  )
}

export function generateMetadata() {
  return {
    title: 'Experience - Shayaan Azeem',
    description: 'My work experience and professional background.',
  }
}
