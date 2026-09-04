import ClientHome from '@/components/client-home'
import { getClientHomeData } from '@/lib/home-data'

export default async function InspirationsPage() {
  const data = await getClientHomeData()

  return (
    <ClientHome
      {...data}
      initialSection="inspirations"
    />
  )
}

export function generateMetadata() {
  return {
    title: 'Inspirations - Shayaan Azeem',
    description: 'Things that inspire me and content worth consuming.',
  }
}
