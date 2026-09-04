import ClientHome from '@/components/client-home'
import { getClientHomeData } from '@/lib/home-data'

export default async function ContentPage() {
  const data = await getClientHomeData()

  return (
    <ClientHome
      {...data}
      initialSection="content"
    />
  )
}

export function generateMetadata() {
  return {
    title: 'Content - Shayaan Azeem',
    description: 'Content and resources I find valuable.',
  }
}
