import { getClientHomeData } from "@/lib/home-data"
import ClientHome from "@/components/client-home"

export default async function Home() {
  const data = await getClientHomeData()

  return <ClientHome {...data} />
}
