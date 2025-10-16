type Props = { params: { no: string } }

export default function CheckCertificatePage({ params }: Props) {
  const { no } = params
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-12">
        <h1 className="text-2xl font-semibold mb-2">Certificate</h1>
        <p className="text-white/70">Number: {no}</p>
        <div className="mt-6 flex gap-3">
          <button className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm">Download PDF</button>
          <button className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">Send Email</button>
          <button className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">Copy Link</button>
        </div>
      </div>
    </div>
  )
}


