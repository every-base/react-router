import { useParams } from '../../lib/main'

export default function User() {
  const { userId } = useParams()
  
  return <p>Hello user {userId}</p>
}