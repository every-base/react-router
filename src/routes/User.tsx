import Router from "../Router"

export default function User() {
  const { userId } = Router.useParams()
  
  return <p>Hello user {userId}</p>
}