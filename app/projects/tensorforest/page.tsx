import ClientHome from '@/components/client-home'
import { getClientHomeData } from '@/lib/home-data'

export default async function TensorForestPage() {
  const data = await getClientHomeData()

  return (
    <ClientHome
      {...data}
      initialSection="projects"
      initialProject="tensorforest"
    />
  )
}

export function generateMetadata() {
  return {
    title: 'TensorForest - Wildfire Prevention Drones',
    description: 'Autonomous drone system for wildfire prediction and prevention using AI, remote sensing, and machine learning.',
    keywords: ['AI', 'Drones', 'Environmental Tech', 'Machine Learning', 'Wildfire Prevention'],
  }
}
