export async function GET(request, { params }) {
  try {
    const { id } = await params

    const response = await fetch(`https://model-late-thunder-6593.fly.dev/predict/${id}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return Response.json(data)
  } catch (error) {
    console.error("Failed to fetch AI predictions:", error)
    return Response.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}
