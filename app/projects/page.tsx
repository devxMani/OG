import ClientHome from '@/components/client-home'
import { getClientHomeData } from '@/lib/home-data'

export default async function ProjectsPage() {
  const data = await getClientHomeData()

  return (
    <ClientHome
      {...data}
      initialSection="projects"
    />
  )
}

export const metadata = {
  title: 'Projects - Shayaan Azeem',
  description: 'Projects by Shayaan Azeem',
}
