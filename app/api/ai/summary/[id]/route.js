export async function GET(request, { params }) {
  try {
    const { id } = await params

    const response = await fetch(`https://model-late-thunder-6593.fly.dev/summary/${id}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.text()

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error("Failed to fetch AI summary:", error)
    return Response.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    )
  }
}
