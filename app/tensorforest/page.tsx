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

export const metadata = {
  title: 'TensorForest - Shayaan Azeem',
  description: 'TensorForest project by Shayaan Azeem',
}
